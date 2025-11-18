"use server"

import { Client } from 'onesignal-node';
import { createClient as createServiceClient } from '@supabase/supabase-js';

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

// Initialize OneSignal client
const getOneSignalClient = () => {
  // Use different credentials for dev vs production if configured
  const appId = process.env.NODE_ENV === 'development'
    ? (process.env.ONESIGNAL_APP_ID_DEV || process.env.ONESIGNAL_APP_ID)
    : (process.env.ONESIGNAL_APP_ID_PROD || process.env.ONESIGNAL_APP_ID);
  
  const apiKey = process.env.NODE_ENV === 'development'
    ? (process.env.ONESIGNAL_REST_API_KEY_DEV || process.env.ONESIGNAL_REST_API_KEY)
    : (process.env.ONESIGNAL_REST_API_KEY_PROD || process.env.ONESIGNAL_REST_API_KEY);

  if (!appId || !apiKey) {
    throw new Error('OneSignal credentials not configured');
  }

  return new Client(appId, apiKey);
};

export async function sendAdminOrderNotificationPush(vivaOrderCode: string) {
  try {
    // Fetch order from database
    const supabase = getSupabaseAdmin();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('viva_order_code', vivaOrderCode)
      .single();

    if (orderError || !order) {
      console.error('❌ [OneSignal] Order not found:', orderError);
      return { success: false, error: 'Order not found' };
    }

    // Only send notification for paid orders
    if (order.payment_status !== 'paid') {
      console.log('⏭️ [OneSignal] Skipping notification - order not paid yet');
      return { success: true, skipped: true };
    }

    // Get all admin users with OneSignal player IDs
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id, onesignal_player_id')
      .not('onesignal_player_id', 'is', null);

    if (adminError || !adminUsers || adminUsers.length === 0) {
      console.warn('⚠️ [OneSignal] No admin users with player IDs found');
      return { success: false, error: 'No admin users with player IDs found' };
    }

    const playerIds = adminUsers
      .map(au => au.onesignal_player_id)
      .filter((id): id is string => !!id);

    if (playerIds.length === 0) {
      console.warn('⚠️ [OneSignal] No valid player IDs found');
      return { success: false, error: 'No valid player IDs found' };
    }

    // Initialize OneSignal client
    const client = getOneSignalClient();

    // Calculate total items count
    const itemsCount = order.order_items?.reduce((sum: number, item: any) => 
      sum + item.quantity, 0
    ) || 0;

    // Prepare notification
    const notification = {
      contents: {
        en: `New order #${order.viva_order_code} - €${order.total.toFixed(2)}`,
        el: `Νέα παραγγελία #${order.viva_order_code} - €${order.total.toFixed(2)}`,
      },
      headings: {
        en: '🔔 New Order Received',
        el: '🔔 Νέα Παραγγελία',
      },
      subtitle: {
        en: `${itemsCount} item${itemsCount !== 1 ? 's' : ''} from ${order.customer_name}`,
        el: `${itemsCount} προϊόν${itemsCount !== 1 ? 'τα' : ''} από ${order.customer_name}`,
      },
      include_player_ids: playerIds,
      data: {
        type: 'new_order',
        orderCode: order.viva_order_code,
        orderId: order.id,
        total: order.total,
        customerName: order.customer_name,
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tinkerbell-e-shop.vercel.app'}/admin/orders/${order.id}`,
      },
      // Deep link to order page
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tinkerbell-e-shop.vercel.app'}/admin/orders/${order.id}`,
      // Sound and priority
      sound: 'default',
      priority: 10,
      // Badge count (optional - can be used to show unread orders)
      // badge: { type: 'Increase', value: 1 },
    };

    // Send notification
    const response = await client.createNotification(notification);

    if (response.body?.errors && response.body.errors.length > 0) {
      console.error('❌ [OneSignal] Errors:', response.body.errors);
      return { success: false, error: response.body.errors.join(', ') };
    }

    console.log(`✅ [OneSignal] Notification sent to ${playerIds.length} admin(s)`);
    return { 
      success: true, 
      recipients: playerIds.length,
      notificationId: response.body?.id 
    };
  } catch (error) {
    console.error('❌ [OneSignal] Error:', error);
    return { success: false, error: String(error) };
  }
}

export async function saveAdminPlayerId(userId: string, playerId: string) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify user is admin and check if they already have a player ID
    const { data: adminUser, error: checkError } = await supabase
      .from('admin_users')
      .select('id, onesignal_player_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError || !adminUser) {
      return { success: false, error: 'User is not an admin' };
    }

    // If player ID already exists and matches, no need to update
    if (adminUser.onesignal_player_id === playerId) {
      console.log(`✅ [OneSignal] Player ID already exists for admin: ${userId}`);
      return { success: true, alreadyExists: true };
    }

    // Update admin user with player ID (upsert - update if exists, create if not)
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ onesignal_player_id: playerId })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ [OneSignal] Failed to save player ID:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log(`✅ [OneSignal] Player ID saved for admin: ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ [OneSignal] Error saving player ID:', error);
    return { success: false, error: String(error) };
  }
}

