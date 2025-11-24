"use server"

import { Resend } from 'resend';
import { render } from '@react-email/render';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import OrderConfirmationEmail from '@/emails/order-confirmation';
import AdminOrderNotificationEmail from '@/emails/admin-order-notification';

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
    // Fetch order with items and discounts from database
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
        ),
        order_discounts (
          id,
          discount_code_id,
          product_discount_id,
          discount_amount,
          discount_codes (
            code,
            discount_type,
            discount_value
          ),
          product_discounts (
            discount_type,
            discount_value
          )
        )
      `)
      .eq('viva_order_code', vivaOrderCode)
      .single();

    if (orderError || !order) {
      console.error('❌ [Email] Order not found:', orderError);
      throw new Error('Order not found');
    }

    // Calculate subtotal without discounts (original prices)
    const subtotalWithoutDiscounts = order.order_items?.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    ) || 0;

    // Calculate total discount amounts
    const orderDiscounts = order.order_discounts || [];
    console.log(`📊 [Email] Order ${vivaOrderCode} - Found ${orderDiscounts.length} discount(s)`);
    
    const productDiscountAmount = orderDiscounts
      .filter((od: any) => od.product_discount_id)
      .reduce((sum: number, od: any) => sum + (od.discount_amount || 0), 0);
    
    const codeDiscountAmount = orderDiscounts
      .filter((od: any) => od.discount_code_id)
      .reduce((sum: number, od: any) => sum + (od.discount_amount || 0), 0);

    console.log(`💰 [Email] Discounts - Product: €${productDiscountAmount.toFixed(2)}, Code: €${codeDiscountAmount.toFixed(2)}`);

    const totalDiscountAmount = productDiscountAmount + codeDiscountAmount;
    const subtotalWithDiscounts = subtotalWithoutDiscounts - totalDiscountAmount;
    
    // Determine delivery method
    const deliveryMethod = order.shipping_address?.delivery_method || 
      (order.boxnow_locker_id ? 'boxnow' : 'home');
    
    // Calculate shipping cost based on delivery method
    const HOME_DELIVERY_COST = 3.50;
    const shippingCost = deliveryMethod === 'home' ? HOME_DELIVERY_COST : 0;

    // Get correct locker address for BOXNOW
    let boxnowLockerAddress = undefined;
    if (deliveryMethod === 'boxnow') {
      // Get from shipping_address.boxnow_locker_address
      boxnowLockerAddress = order.shipping_address?.boxnow_locker_address || order.boxnow_locker_id;
    }

    // Get all discount codes info
    const discountCodesInfo = orderDiscounts
      .filter((od: any) => od.discount_code_id && od.discount_codes)
      .map((od: any) => od.discount_codes);

    // Prepare email data
    const emailData = {
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone || order.shipping_address?.phone || '',
      orderCode: order.viva_order_code,
      total: order.total,
      subtotalWithoutDiscounts: subtotalWithoutDiscounts,
      subtotalWithDiscounts: subtotalWithDiscounts,
      productDiscountAmount: productDiscountAmount,
      codeDiscountAmount: codeDiscountAmount,
      discountCodes: discountCodesInfo.length > 0 ? discountCodesInfo.map((dc: any) => ({
        code: dc.code,
        type: dc.discount_type,
        value: dc.discount_value,
      })) : undefined,
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

    console.log(`📧 [Email] Email data prepared:`, {
      hasDiscounts: productDiscountAmount > 0 || codeDiscountAmount > 0,
      productDiscountAmount,
      codeDiscountAmount,
      discountCodesCount: discountCodesInfo.length,
      discountCodes: discountCodesInfo.map((dc: any) => dc.code),
    });

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

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('❌ [Email] Error:', error);
    return { success: false, error: String(error) };
  }
}

export async function sendAdminOrderNotificationEmail(vivaOrderCode: string) {
  try {
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
        ),
        order_discounts (
          id,
          discount_code_id,
          product_discount_id,
          discount_amount,
          discount_codes (
            code,
            discount_type,
            discount_value
          ),
          product_discounts (
            discount_type,
            discount_value
          )
        )
      `)
      .eq('viva_order_code', vivaOrderCode)
      .single();

    if (orderError || !order) {
      console.error('❌ [Admin Email] Order not found:', orderError);
      throw new Error('Order not found');
    }

    // Only send notification for paid orders
    console.log(`🔍 [Admin Email] Order ${vivaOrderCode} payment_status: ${order.payment_status}`);
    if (order.payment_status !== 'paid') {
      console.log('⏭️ [Admin Email] Skipping notification - order not paid yet');
      return { success: true, skipped: true };
    }

    // Get all admin user IDs
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id');

    if (adminError) {
      console.error('❌ [Admin Email] Error fetching admin users:', adminError);
      return { success: false, error: `Failed to fetch admin users: ${adminError.message}` };
    }

    if (!adminUsers || adminUsers.length === 0) {
      console.warn('⚠️ [Admin Email] No admin users found in admin_users table');
      return { success: false, error: 'No admin users found' };
    }

    console.log(`👥 [Admin Email] Found ${adminUsers.length} admin user(s)`);
    const adminUserIds = adminUsers.map(au => au.user_id);

    // Get all admin emails in one call using listUsers
    // This is more efficient than calling getUserById for each admin
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ [Admin Email] Failed to list users:', listError);
      return { success: false, error: 'Failed to fetch admin emails' };
    }

    // Filter to only admin users and extract emails
    const adminEmails = users
      .filter(user => adminUserIds.includes(user.id))
      .map(user => user.email)
      .filter((email): email is string => !!email);

    console.log(`📧 [Admin Email] Sending to ${adminEmails.length} admin email(s): ${adminEmails.join(', ')}`);

    if (adminEmails.length === 0) {
      console.warn('⚠️ [Admin Email] No admin emails found - admin users exist but no emails found');
      console.warn(`⚠️ [Admin Email] Admin user IDs: ${adminUserIds.join(', ')}`);
      console.warn(`⚠️ [Admin Email] Total users in auth: ${users.length}`);
      console.warn(`⚠️ [Admin Email] Available user IDs: ${users.map(u => u.id).join(', ')}`);
      console.warn(`⚠️ [Admin Email] Admin users with emails:`, users
        .filter(user => adminUserIds.includes(user.id))
        .map(u => ({ id: u.id, email: u.email })));
      return { success: false, error: 'No admin emails found' };
    }

    // Calculate subtotal without discounts (original prices)
    const subtotalWithoutDiscounts = order.order_items?.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    ) || 0;

    // Calculate total discount amounts
    const orderDiscounts = order.order_discounts || [];
    console.log(`📊 [Admin Email] Order ${vivaOrderCode} - Found ${orderDiscounts.length} discount(s)`);
    
    const productDiscountAmount = orderDiscounts
      .filter((od: any) => od.product_discount_id)
      .reduce((sum: number, od: any) => sum + (od.discount_amount || 0), 0);
    
    const codeDiscountAmount = orderDiscounts
      .filter((od: any) => od.discount_code_id)
      .reduce((sum: number, od: any) => sum + (od.discount_amount || 0), 0);

    console.log(`💰 [Admin Email] Discounts - Product: €${productDiscountAmount.toFixed(2)}, Code: €${codeDiscountAmount.toFixed(2)}`);

    const totalDiscountAmount = productDiscountAmount + codeDiscountAmount;
    const subtotalWithDiscounts = subtotalWithoutDiscounts - totalDiscountAmount;
    
    // Determine delivery method
    const deliveryMethod = order.shipping_address?.delivery_method || 
      (order.boxnow_locker_id ? 'boxnow' : 'home');
    
    // Calculate shipping cost based on delivery method
    const HOME_DELIVERY_COST = 3.50;
    const shippingCost = deliveryMethod === 'home' ? HOME_DELIVERY_COST : 0;

    // Get correct locker address for BOXNOW
    let boxnowLockerAddress = undefined;
    if (deliveryMethod === 'boxnow') {
      boxnowLockerAddress = order.shipping_address?.boxnow_locker_address || order.boxnow_locker_id;
    }

    // Get all discount codes info
    const discountCodesInfo = orderDiscounts
      .filter((od: any) => od.discount_code_id && od.discount_codes)
      .map((od: any) => od.discount_codes);

    // Prepare email data
    const emailData = {
      orderCode: order.viva_order_code,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone || order.shipping_address?.phone || '',
      total: order.total,
      subtotalWithoutDiscounts: subtotalWithoutDiscounts,
      subtotalWithDiscounts: subtotalWithDiscounts,
      productDiscountAmount: productDiscountAmount,
      codeDiscountAmount: codeDiscountAmount,
      discountCodes: discountCodesInfo.length > 0 ? discountCodesInfo.map((dc: any) => ({
        code: dc.code,
        type: dc.discount_type,
        value: dc.discount_value,
      })) : undefined,
      shippingCost: shippingCost,
      items: order.order_items || [],
      deliveryMethod: deliveryMethod as 'boxnow' | 'home',
      shippingAddress: deliveryMethod === 'home' ? {
        address: order.shipping_address?.address,
        city: order.shipping_address?.city,
        region: order.shipping_address?.region,
        postal_code: order.shipping_address?.postal_code,
      } : undefined,
      boxnowLockerAddress: boxnowLockerAddress,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://tinkerbell-e-shop.vercel.app',
    };

    console.log(`📧 [Admin Email] Email data prepared:`, {
      hasDiscounts: productDiscountAmount > 0 || codeDiscountAmount > 0,
      productDiscountAmount,
      codeDiscountAmount,
      discountCodesCount: discountCodesInfo.length,
      discountCodes: discountCodesInfo.map((dc: any) => dc.code),
    });

    // Render email HTML
    const emailHtml = await render(AdminOrderNotificationEmail(emailData));

    // Send email to all admins
    const { data, error } = await resend.emails.send({
      from: 'Tinkerbell Admin <onboarding@resend.dev>',
      to: adminEmails,
      subject: `🔔 Νέα Παραγγελία #${order.viva_order_code} - €${order.total.toFixed(2)}`,
      html: emailHtml,
    });

    if (error) {
      console.error('❌ [Admin Email] Failed to send:', error);
      throw new Error(`Failed to send admin email: ${error.message}`);
    }

    console.log(`✅ [Admin Email] Notification sent to ${adminEmails.length} admin(s)`);
    return { success: true, messageId: data?.id, recipients: adminEmails.length };
  } catch (error) {
    console.error('❌ [Admin Email] Error:', error);
    return { success: false, error: String(error) };
  }
}

