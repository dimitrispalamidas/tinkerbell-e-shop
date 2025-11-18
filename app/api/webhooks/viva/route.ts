import { NextResponse } from 'next/server';
import { updateOrderPaymentStatus, validateVivaTransactionAgainstOrder } from '@/lib/actions/viva-wallet';
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } from '@/lib/actions/send-order-email';

// Viva Wallet Webhook Verification Key
const VIVA_WEBHOOK_KEY = process.env.VIVA_WEBHOOK_KEY!;
const VIVA_WEBHOOK_VERIFY_SECRET = process.env.VIVA_WEBHOOK_VERIFY_SECRET;

if (!VIVA_WEBHOOK_KEY) {
  throw new Error('VIVA_WEBHOOK_KEY is not defined');
}

// Rate limiting for webhook endpoint
declare global {
  var __WEBHOOK_RATE_LIMIT: Map<string, { count: number; expiresAt: number }> | undefined;
}

const WEBHOOK_RATE_LIMIT_MAP =
  globalThis.__WEBHOOK_RATE_LIMIT ?? new Map<string, { count: number; expiresAt: number }>();
globalThis.__WEBHOOK_RATE_LIMIT = WEBHOOK_RATE_LIMIT_MAP;

const MAX_WEBHOOK_REQUESTS = 100; // Allow more for webhooks (legitimate traffic)
const WEBHOOK_WINDOW_MS = 60_000; // 1 minute

function resolveProvidedValue(req: Request) {
  const url = new URL(req.url);
  const authorizationHeader = req.headers.get('authorization');
  const verificationHeader = req.headers.get('x-viva-webhook-verification');
  const urlToken = url.searchParams.get('token');
  const urlKey = url.searchParams.get('key');

  let provided: string | null =
    verificationHeader ?? urlToken ?? urlKey ?? null;

  if (!provided && authorizationHeader) {
    const [scheme, credential] = authorizationHeader.trim().split(/\s+/, 2);

    if (credential && /^bearer$/i.test(scheme)) {
      provided = credential;
    } else if (!credential) {
      provided = scheme;
    }
  }

  return provided;
}

function verifyRequest(req: Request) {
  const providedValue = resolveProvidedValue(req);

  if (VIVA_WEBHOOK_VERIFY_SECRET) {
    return providedValue === VIVA_WEBHOOK_VERIFY_SECRET;
  }

  return providedValue === VIVA_WEBHOOK_KEY;
}

// GET handler for webhook verification
export async function GET(req: Request) {
  if (!verifyRequest(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Viva sends a GET request to verify the endpoint
  // We need to return the verification key in JSON format
  return NextResponse.json(
    {
      Key: VIVA_WEBHOOK_KEY,
    },
    {
      status: 200,
    }
  );
}

// POST handler for actual webhook events
export async function POST(req: Request) {
  try {
    // Rate limiting
    const clientIp =
      req.headers.get('cf-connecting-ip') ??
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown';

    const now = Date.now();
    const rateLimitKey = `webhook:${clientIp}`;
    const entry = WEBHOOK_RATE_LIMIT_MAP.get(rateLimitKey);

    if (!entry || now > entry.expiresAt) {
      WEBHOOK_RATE_LIMIT_MAP.set(rateLimitKey, { count: 1, expiresAt: now + WEBHOOK_WINDOW_MS });
    } else if (entry.count >= MAX_WEBHOOK_REQUESTS) {
      const retryAfter = Math.max(1, Math.ceil((entry.expiresAt - now) / 1000));
      console.warn(`⚠️ Webhook rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: { 'Retry-After': retryAfter.toString() },
        }
      );
    } else {
      entry.count += 1;
      WEBHOOK_RATE_LIMIT_MAP.set(rateLimitKey, entry);
    }

    // Verify webhook request
    if (!verifyRequest(req)) {
      console.warn('⚠️ Viva webhook verification failed', { ip: clientIp });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    // Viva Wallet sends different event types
    // EventTypeId: 1796 = Transaction Payment Created (successful payment)
    // EventTypeId: 1797 = Transaction Reversal Created (refund)
    // EventTypeId: 1798 = Transaction Failed (failed payment)
    const eventTypeId = body.EventTypeId;

    if (eventTypeId === 1796) {
      // Successful payment
      const eventData = body.EventData;
      const transactionId = eventData?.TransactionId;
      const orderCode = eventData?.OrderCode;
      const statusId = eventData?.StatusId;

      if (!orderCode || !transactionId) {
        console.error('❌ Missing orderCode or transactionId');
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // StatusId: 'F' = Success/Completed
      if (statusId === 'F') {
        try {
          await validateVivaTransactionAgainstOrder(orderCode, transactionId);
        } catch (validationError) {
          console.error('❌ Viva transaction validation failed:', validationError);
          return NextResponse.json({ error: 'Transaction validation failed' }, { status: 400 });
        }

        await updateOrderPaymentStatus(orderCode, transactionId, 'paid');

        // Send order confirmation email to customer
        try {
          const emailResult = await sendOrderConfirmationEmail(orderCode);

          if (!emailResult.success) {
            console.error(
              '⚠️ Failed to send order confirmation email:',
              emailResult.error
            );
          }
        } catch (emailError) {
          // Don't fail the webhook if email sending fails
          console.error('⚠️ Error sending order confirmation email:', emailError);
          console.error('⚠️ Webhook continues despite email error');
        }

        // Send admin notification email
        try {
          const adminEmailResult = await sendAdminOrderNotificationEmail(orderCode);

          if (!adminEmailResult.success) {
            console.error(
              '⚠️ Failed to send admin notification email:',
              adminEmailResult.error
            );
          } else {
            console.log('✅ Admin notification sent successfully');
          }
        } catch (adminEmailError) {
          // Don't fail the webhook if admin email sending fails
          console.error('⚠️ Error sending admin notification email:', adminEmailError);
          console.error('⚠️ Webhook continues despite admin email error');
        }
      }
    } else if (eventTypeId === 1797) {
      // Refund/Reversal
      const eventData = body.EventData;
      const transactionId = eventData?.TransactionId;
      const orderCode = eventData?.OrderCode;

      if (orderCode && transactionId) {
        await updateOrderPaymentStatus(orderCode, transactionId, 'refunded');
      }
    } else if (eventTypeId === 1798) {
      // Failed payment
      const eventData = body.EventData;
      const transactionId = eventData?.TransactionId;
      const orderCode = eventData?.OrderCode;

      if (orderCode && transactionId) {
        await updateOrderPaymentStatus(orderCode, transactionId, 'failed');
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

