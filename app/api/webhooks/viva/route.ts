import { NextResponse } from 'next/server';
import { updateOrderPaymentStatus } from '@/lib/actions/viva-wallet';
import { sendOrderConfirmationEmail } from '@/lib/actions/send-order-email';

// Viva Wallet Webhook Verification Key
const VIVA_WEBHOOK_KEY = process.env.VIVA_WEBHOOK_KEY!;
const VIVA_WEBHOOK_VERIFY_SECRET = process.env.VIVA_WEBHOOK_VERIFY_SECRET;

if (!VIVA_WEBHOOK_KEY) {
  throw new Error('VIVA_WEBHOOK_KEY is not defined');
}

// GET handler for webhook verification
export async function GET(req: Request) {
  if (!VIVA_WEBHOOK_VERIFY_SECRET) {
    return NextResponse.json(
      { error: 'Webhook verification secret not configured' },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const token =
    req.headers.get('x-viva-webhook-verification') ??
    url.searchParams.get('token');

  if (token !== VIVA_WEBHOOK_VERIFY_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Viva sends a GET request to verify the endpoint
  // We need to return the verification key in JSON format
  return NextResponse.json({ 
    Key: VIVA_WEBHOOK_KEY 
  }, { 
    status: 200 
  });
}

// POST handler for actual webhook events
export async function POST(req: Request) {
  try {
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
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // StatusId: 'F' = Success/Completed
      if (statusId === 'F') {
        await updateOrderPaymentStatus(orderCode, transactionId, 'paid');
        
        // Send order confirmation email
        try {
          const emailResult = await sendOrderConfirmationEmail(orderCode);
          
          if (emailResult.success) {
          } else {
            console.error('⚠️ Failed to send order confirmation email:', emailResult.error);
          }
        } catch (emailError) {
          // Don't fail the webhook if email sending fails
          console.error('⚠️ Error sending order confirmation email:', emailError);
          console.error('⚠️ Webhook continues despite email error');
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

