import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderPaymentStatus } from '@/lib/actions/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  console.log('🔔 ===== WEBHOOK RECEIVED =====');
  
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  console.log('📝 Signature present:', !!signature);
  console.log('📝 Webhook secret configured:', !!webhookSecret);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('✅ Event verified successfully!');
    console.log('📦 Event type:', event.type);
    console.log('📦 Event ID:', event.id);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('💳 Payment succeeded:', paymentIntent.id);
      console.log('💰 Amount:', paymentIntent.amount / 100);
      
      try {
        console.log('🔄 Calling updateOrderPaymentStatus...');
        await updateOrderPaymentStatus(paymentIntent.id, 'paid');
        console.log('✅ Order payment status updated successfully!');
      } catch (error) {
        console.error('❌ Error updating order:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log('❌ Payment failed:', failedPayment.id);
      
      try {
        console.log('🔄 Calling updateOrderPaymentStatus with failed status...');
        await updateOrderPaymentStatus(failedPayment.id, 'failed');
        console.log('✅ Order marked as failed!');
      } catch (error) {
        console.error('❌ Error updating order:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
      }
      break;

    default:
      console.log(`⚠️ Unhandled event type ${event.type}`);
  }

  console.log('🔔 ===== WEBHOOK COMPLETED =====');
  return NextResponse.json({ received: true });
}

