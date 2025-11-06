"use server"

import { Resend } from 'resend';
import { render } from '@react-email/render';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import OrderConfirmationEmail from '@/emails/order-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

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

export async function sendOrderConfirmationEmail(vivaOrderCode: string) {
  try {
    console.log('📧 [Email] Sending order confirmation for:', vivaOrderCode);

    // Fetch order with items from database
    const supabase = getSupabaseAdmin();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          product_name,
          quantity,
          price,
          size,
          color
        )
      `)
      .eq('viva_order_code', vivaOrderCode)
      .single();

    if (orderError || !order) {
      console.error('❌ [Email] Order not found:', orderError);
      throw new Error('Order not found');
    }

    console.log('✅ [Email] Order found:', order.id);
    console.log('📦 [Email] Order items:', order.order_items?.length || 0);

    // Calculate subtotal and shipping cost
    const subtotal = order.order_items?.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    ) || 0;
    const shippingCost = order.total - subtotal;
    
    // Determine delivery method
    const deliveryMethod = order.shipping_address?.delivery_method || 
      (order.boxnow_locker_id ? 'boxnow' : 'home');

    // Get correct locker address for BOXNOW
    let boxnowLockerAddress = undefined;
    if (deliveryMethod === 'boxnow') {
      // Get from shipping_address.boxnow_locker_address
      boxnowLockerAddress = order.shipping_address?.boxnow_locker_address || order.boxnow_locker_id;
    }

    // Prepare email data
    const emailData = {
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone || order.shipping_address?.phone || '',
      orderCode: order.viva_order_code,
      total: order.total,
      subtotal: subtotal,
      shippingCost: shippingCost,
      items: order.order_items || [],
      deliveryMethod: deliveryMethod as 'boxnow' | 'home',
      shippingAddress: deliveryMethod === 'home' ? {
        address: order.shipping_address?.address,
        city: order.shipping_address?.city,
        region: order.shipping_address?.region,
        postal_code: order.shipping_address?.postal_code,
      } : undefined,
      boxnowTrackingCode: order.boxnow_tracking_code,
      boxnowLockerAddress: boxnowLockerAddress,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://tinkerbell-e-shop.vercel.app',
    };

    // Render email HTML
    const emailHtml = await render(OrderConfirmationEmail(emailData));

    // Send email via Resend
    // Using onboarding@resend.dev because we don't have a verified domain yet
    // When you verify your domain, change this to: 'Tinkerbell <orders@yourdomain.com>'
    const { data, error } = await resend.emails.send({
      from: 'Tinkerbell <onboarding@resend.dev>',
      to: [order.customer_email],
      subject: `Επιβεβαίωση Παραγγελίας #${order.viva_order_code} - Tinkerbell`,
      html: emailHtml,
    });

    if (error) {
      console.error('❌ [Email] Failed to send:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('✅ [Email] Successfully sent to:', order.customer_email);
    console.log('📧 [Email] Message ID:', data?.id);

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('❌ [Email] Error:', error);
    return { success: false, error: String(error) };
  }
}

