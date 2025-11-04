"use server"

import Stripe from 'stripe';
import { createClient as createServiceClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

// Create Supabase admin client for server-side operations
const getSupabaseAdmin = () => {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

export async function createPaymentIntent(amount: number, orderData: any) {
  try {
    console.log('🔑 Creating payment intent with amount:', amount);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customer_email: orderData.customer_email,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone || '',
        boxnow_locker_id: orderData.boxnow_locker_id || '',
        items_count: orderData.items.length.toString(),
      },
    });

    console.log('✅ Payment intent created:', paymentIntent.id);
    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
}

export async function createOrder(orderData: {
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
    product_name: string;
  }>;
  total: number;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  shipping_address: any;
  boxnow_locker_id?: string;
  stripe_payment_intent_id: string;
}) {
  const supabase = getSupabaseAdmin();

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      total: orderData.total,
      customer_email: orderData.customer_email,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      shipping_address: orderData.shipping_address,
      boxnow_locker_id: orderData.boxnow_locker_id,
      stripe_payment_intent_id: orderData.stripe_payment_intent_id,
      status: 'pending',
      payment_status: 'pending',
    })
    .select()
    .single();

  if (orderError || !order) {
    throw new Error('Failed to create order');
  }

  // Create order items
  const orderItems = orderData.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
    size: item.size,
    color: item.color,
    product_name: item.product_name,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    throw new Error('Failed to create order items');
  }

  return order;
}

export async function updateOrderPaymentStatus(
  paymentIntentId: string,
  status: 'paid' | 'failed'
) {
  console.log('📋 updateOrderPaymentStatus called');
  console.log('📋 Payment Intent ID:', paymentIntentId);
  console.log('📋 Status:', status);

  const supabase = getSupabaseAdmin();

  // Get the order
  console.log('🔍 Fetching order from database...');
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (orderError) {
    console.error('❌ Error fetching order:', orderError);
    throw new Error('Order not found');
  }

  if (!order) {
    console.error('❌ Order not found for payment intent:', paymentIntentId);
    throw new Error('Order not found');
  }

  console.log('✅ Order found:', order.id);
  console.log('📦 Order items count:', order.order_items?.length || 0);

  // Update order status
  console.log('🔄 Updating order status to:', status);
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: status,
      status: status === 'paid' ? 'paid' : 'cancelled',
    })
    .eq('stripe_payment_intent_id', paymentIntentId);

  if (error) {
    console.error('❌ Error updating order status:', error);
    throw new Error('Failed to update order payment status');
  }

  console.log('✅ Order status updated successfully!');

  // If payment succeeded, create BOXNOW delivery request if applicable
  if (status === 'paid' && order.boxnow_locker_id) {
    console.log('📦 Creating BOXNOW delivery request for locker:', order.boxnow_locker_id);
    
    try {
      const shipmentResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/boxnow/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lockerId: order.boxnow_locker_id,
          orderId: order.id,
          customerName: order.customer_name,
          customerPhone: order.customer_phone || '',
          customerEmail: order.customer_email,
          compartmentSize: 2, // 1=small, 2=medium, 3=large
        }),
      });

      if (shipmentResponse.ok) {
        const shipmentData = await shipmentResponse.json();
        console.log('✅ BOXNOW delivery request created');
        console.log('📦 Parcel ID:', shipmentData.parcelId);
        console.log('🔢 Tracking Number:', shipmentData.trackingNumber);
        
        // Update order with tracking information
        if (shipmentData.trackingNumber || shipmentData.parcelId) {
          await supabase
            .from('orders')
            .update({
              boxnow_tracking_code: shipmentData.trackingNumber || shipmentData.parcelId,
              status: 'processing',
            })
            .eq('id', order.id);
          
          console.log('✅ Order updated with tracking number');
        }
      } else {
        const errorData = await shipmentResponse.json();
        console.error('❌ Failed to create BOXNOW delivery request:', errorData);
      }
    } catch (shipmentError) {
      console.error('❌ Error creating BOXNOW delivery request:', shipmentError);
      // Don't throw - we don't want to fail the order if shipment creation fails
    }
  }

  // If payment succeeded, decrease variant stock
  if (status === 'paid' && order.order_items) {
    console.log('📉 Starting stock decrease for', order.order_items.length, 'items');
    
    for (const item of order.order_items) {
      console.log('📦 Processing item:', {
        product_id: item.product_id,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      });

      if (item.size && item.color) {
        console.log('🔄 Calling decrease_variant_stock RPC...');
        
        const { data, error: rpcError } = await supabase.rpc('decrease_variant_stock', {
          p_product_id: item.product_id,
          p_size: item.size,
          p_color: item.color,
          p_quantity: item.quantity,
        });

        if (rpcError) {
          console.error('❌ Error decreasing stock:', rpcError);
          console.error('❌ RPC Error details:', JSON.stringify(rpcError, null, 2));
        } else {
          console.log('✅ Stock decreased successfully for:', item.size, item.color);
          console.log('📊 RPC result:', data);
        }
      } else {
        console.log('⚠️ Item missing size or color, skipping stock decrease');
      }
    }
    
    console.log('✅ All stock updates completed!');
  } else {
    console.log('ℹ️ Not updating stock (status is not paid or no items)');
  }

  console.log('📋 updateOrderPaymentStatus completed');
}

