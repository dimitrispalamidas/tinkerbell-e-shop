"use server"

import { createClient as createServiceClient } from '@supabase/supabase-js';
import { boxnowService } from '@/lib/services/boxnow';

// Viva Wallet API Configuration
const VIVA_API_URL = process.env.VIVA_API_URL || 'https://demo-api.vivapayments.com';
const VIVA_CLIENT_ID = process.env.VIVA_CLIENT_ID!;
const VIVA_CLIENT_SECRET = process.env.VIVA_CLIENT_SECRET!;
const VIVA_SOURCE_CODE = process.env.VIVA_SOURCE_CODE!;

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

// Get OAuth Access Token
async function getAccessToken() {
  const auth = Buffer.from(`${VIVA_CLIENT_ID}:${VIVA_CLIENT_SECRET}`).toString('base64');
  
  // OAuth endpoint is different from API endpoint!
  // Demo: demo-accounts.vivapayments.com
  // Live: accounts.vivapayments.com
  const oauthUrl = VIVA_API_URL.includes('demo')
    ? 'https://demo-accounts.vivapayments.com/connect/token'
    : 'https://accounts.vivapayments.com/connect/token';
  
  const response = await fetch(oauthUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Viva OAuth Error - Status:', response.status);
    console.error('❌ Viva OAuth Error - Response:', errorText);
    console.error('❌ VIVA_CLIENT_ID:', VIVA_CLIENT_ID);
    console.error('❌ VIVA_CLIENT_SECRET:', VIVA_CLIENT_SECRET ? 'SET (hidden)' : 'MISSING');
    console.error('❌ VIVA_API_URL:', VIVA_API_URL);
    throw new Error(`Failed to authenticate with Viva Wallet: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Create Payment Order
export async function createVivaPaymentOrder(orderData: {
  amount: number;
  orderId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
}) {
  try {
    const accessToken = await getAccessToken();

    const paymentOrderData = {
      amount: Math.round(orderData.amount * 100), // Convert to cents
      customerTrns: `Παραγγελία Tinkerbell #${orderData.orderId}`,
      customer: {
        email: orderData.customerEmail,
        fullName: orderData.customerName,
        phone: orderData.customerPhone || '',
        countryCode: 'GR',
        requestLang: 'el-GR'
      },
      paymentTimeout: 1800, // 30 minutes for testing
      preauth: false,
      allowRecurring: false,
      maxInstallments: 0,
      paymentNotification: true,
      tipAmount: 0,
      disableExactAmount: false,
      disableCash: true,
      disableWallet: false,
      sourceCode: VIVA_SOURCE_CODE,
      merchantTrns: `Tinkerbell Kids Store - Order ${orderData.orderId}`,
      tags: [
        'tinkerbell-eshop',
        'kids-clothing',
        `order-${orderData.orderId}`
      ]
    };

    const response = await fetch(`${VIVA_API_URL}/checkout/v2/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentOrderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Viva API error:', errorText);
      throw new Error('Failed to create payment order');
    }

    const data = await response.json();

    // Determine checkout URL based on environment
    const checkoutBaseUrl = VIVA_API_URL.includes('demo') 
      ? 'https://demo.vivapayments.com' 
      : 'https://www.vivapayments.com';
    
    // Customize checkout with brand colors
    // Remove # from color for URL parameter
    const brandColor = 'ffb3d9'; // Tinkerbell pink
    
    return {
      orderCode: data.orderCode,
      checkoutUrl: `${checkoutBaseUrl}/web/checkout?ref=${data.orderCode}&color=${brandColor}`
    };
  } catch (error) {
    console.error('❌ Error creating Viva payment order:', error);
    throw new Error('Failed to create payment order');
  }
}

// Create Order in Database
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
  viva_order_code: string;
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
      viva_order_code: orderData.viva_order_code,
      status: 'pending',
      payment_status: 'pending',
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error('Failed to create order:', orderError);
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
    console.error('Failed to create order items:', itemsError);
    throw new Error('Failed to create order items');
  }

  return order;
}

// Update Order Payment Status (called from webhook)
export async function updateOrderPaymentStatus(
  vivaOrderCode: string,
  transactionId: string,
  status: 'paid' | 'failed' | 'refunded'
) {
  const supabase = getSupabaseAdmin();

  // Get the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('viva_order_code', vivaOrderCode)
    .single();

  if (orderError) {
    console.error('❌ Error fetching order:', orderError);
    throw new Error('Order not found');
  }

  if (!order) {
    console.error('❌ Order not found for Viva order code:', vivaOrderCode);
    throw new Error('Order not found');
  }

  // Determine order status based on payment status
  let orderStatus: string;
  if (status === 'paid') {
    orderStatus = 'paid';
  } else if (status === 'failed') {
    orderStatus = 'cancelled';
  } else if (status === 'refunded') {
    orderStatus = 'refunded';
  } else {
    orderStatus = order.status; // Keep existing status
  }

  // Update order status
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: status,
      status: orderStatus,
      viva_transaction_id: transactionId,
    })
    .eq('viva_order_code', vivaOrderCode);

  if (error) {
    console.error('❌ Error updating order status:', error);
    throw new Error('Failed to update order payment status');
  }

  // If payment succeeded, create BOXNOW delivery request if applicable
  if (status === 'paid' && order.boxnow_locker_id) {
    try {
      const shipmentResult = await boxnowService.createDeliveryRequest({
        lockerId: order.boxnow_locker_id,
        orderId: order.id,
        customerName: order.customer_name,
        customerPhone: order.customer_phone || '',
        customerEmail: order.customer_email,
        compartmentSize: 2, // 1=small, 2=medium, 3=large
      });

      if (shipmentResult.success && (shipmentResult.trackingNumber || shipmentResult.parcelId)) {
        await supabase
          .from('orders')
          .update({
            boxnow_tracking_code: shipmentResult.trackingNumber || shipmentResult.parcelId,
            status: 'processing',
          })
          .eq('id', order.id);
      } else if (!shipmentResult.success && shipmentResult.error) {
        console.error('❌ Failed to create BOXNOW delivery request:', shipmentResult.error);
      }
    } catch (shipmentError) {
      console.error('❌ Error creating BOXNOW delivery request:', shipmentError);
      // Don't throw - we don't want to fail the order if shipment creation fails
    }
  }

  // If payment succeeded, decrease variant stock
  if (status === 'paid' && order.order_items) {
    for (const item of order.order_items) {
      if (!item.size || !item.color) {
        continue;
      }

      const { error: rpcError } = await supabase.rpc('decrease_variant_stock', {
        p_product_id: item.product_id,
        p_size: item.size,
        p_color: item.color,
        p_quantity: item.quantity,
      });

      if (rpcError) {
        console.error('❌ Error decreasing stock:', rpcError);
        console.error('❌ RPC Error details:', JSON.stringify(rpcError, null, 2));
      }
    }
  } 
  // If payment was refunded, restore variant stock
  else if (status === 'refunded' && order.order_items) {
    for (const item of order.order_items) {
      if (!item.size || !item.color) {
        continue;
      }

      const { data: variant, error: variantError } = await supabase
        .from('product_variants')
        .select('stock')
        .eq('product_id', item.product_id)
        .eq('size', item.size)
        .eq('color', item.color)
        .single();

      if (!variantError && variant) {
        const { error: updateError } = await supabase
          .from('product_variants')
          .update({ stock: variant.stock + item.quantity })
          .eq('product_id', item.product_id)
          .eq('size', item.size)
          .eq('color', item.color);

        if (updateError) {
          console.error('❌ Error restoring stock:', updateError);
        }
      } else {
        console.error('❌ Could not find variant to restore stock:', variantError);
      }
    }
  }
}

