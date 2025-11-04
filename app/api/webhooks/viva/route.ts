import { NextResponse } from 'next/server';
import { updateOrderPaymentStatus } from '@/lib/actions/viva-wallet';
import { sendOrderConfirmationEmail } from '@/lib/actions/send-order-email';

// Viva Wallet Webhook Verification Key
const VIVA_WEBHOOK_KEY = process.env.VIVA_WEBHOOK_KEY!;

// GET handler for webhook verification
export async function GET(req: Request) {
  console.log('🔐 ===== VIVA WEBHOOK VERIFICATION =====');
  
  // Viva sends a GET request to verify the endpoint
  // We need to return the verification key in JSON format
  console.log('📋 Returning verification key in JSON format');
  
  return NextResponse.json({ 
    Key: VIVA_WEBHOOK_KEY 
  }, { 
    status: 200 
  });
}

// POST handler for actual webhook events
export async function POST(req: Request) {
  console.log('🔔 ===== VIVA WEBHOOK RECEIVED =====');
  
  try {
    const body = await req.json();
    console.log('📦 Webhook payload:', JSON.stringify(body, null, 2));

    // Viva Wallet sends different event types
    // EventTypeId: 1796 = Transaction Payment Created (successful payment)
    // EventTypeId: 1797 = Transaction Reversal Created (refund)
    // EventTypeId: 1798 = Transaction Failed (failed payment)
    const eventTypeId = body.EventTypeId;
    console.log('📋 Event Type ID:', eventTypeId);

    if (eventTypeId === 1796) {
      // Successful payment
      const eventData = body.EventData;
      const transactionId = eventData?.TransactionId;
      const orderCode = eventData?.OrderCode;
      const amount = eventData?.Amount;
      const statusId = eventData?.StatusId;

      console.log('💳 Payment succeeded:');
      console.log('  - Transaction ID:', transactionId);
      console.log('  - Order Code:', orderCode);
      console.log('  - Amount:', amount);
      console.log('  - Status ID:', statusId);

      if (!orderCode || !transactionId) {
        console.error('❌ Missing orderCode or transactionId');
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // StatusId: 'F' = Success/Completed
      if (statusId === 'F') {
        console.log('🔄 Updating order payment status to paid...');
        await updateOrderPaymentStatus(orderCode, transactionId, 'paid');
        console.log('✅ Order payment status updated successfully!');
        
        // Send order confirmation email
        try {
          console.log('📧 Sending order confirmation email...');
          const emailResult = await sendOrderConfirmationEmail(orderCode);
          
          if (emailResult.success) {
            console.log('✅ Order confirmation email sent successfully!');
          } else {
            console.error('⚠️ Failed to send order confirmation email:', emailResult.error);
          }
        } catch (emailError) {
          // Don't fail the webhook if email sending fails
          console.error('⚠️ Error sending order confirmation email:', emailError);
          console.error('⚠️ Webhook continues despite email error');
        }
      } else {
        console.log('⚠️ Payment status not completed, StatusId:', statusId);
      }
    } else if (eventTypeId === 1797) {
      // Refund/Reversal
      const eventData = body.EventData;
      const transactionId = eventData?.TransactionId;
      const orderCode = eventData?.OrderCode;
      const amount = eventData?.Amount;

      console.log('💰 Refund/Reversal processed:');
      console.log('  - Transaction ID:', transactionId);
      console.log('  - Order Code:', orderCode);
      console.log('  - Amount:', amount);

      if (orderCode && transactionId) {
        console.log('🔄 Updating order payment status to refunded...');
        await updateOrderPaymentStatus(orderCode, transactionId, 'refunded');
        console.log('✅ Order marked as refunded!');
      }
    } else if (eventTypeId === 1798) {
      // Failed payment
      const eventData = body.EventData;
      const transactionId = eventData?.TransactionId;
      const orderCode = eventData?.OrderCode;

      console.log('❌ Payment failed:');
      console.log('  - Transaction ID:', transactionId);
      console.log('  - Order Code:', orderCode);

      if (orderCode && transactionId) {
        console.log('🔄 Updating order payment status to failed...');
        await updateOrderPaymentStatus(orderCode, transactionId, 'failed');
        console.log('✅ Order marked as failed!');
      }
    } else {
      console.log(`⚠️ Unhandled event type ${eventTypeId}`);
    }

    console.log('🔔 ===== WEBHOOK COMPLETED =====');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

