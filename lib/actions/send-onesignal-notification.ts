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
  // Use production credentials for both dev and prod
  const appId = process.env.ONESIGNAL_APP_ID_PROD || process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY_PROD || process.env.ONESIGNAL_REST_API_KEY;

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
    // onesignal_player_id is now a JSONB array containing all device Player IDs
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id, onesignal_player_id')
      .not('onesignal_player_id', 'is', null);

    if (adminError || !adminUsers || adminUsers.length === 0) {
      console.warn('⚠️ [OneSignal] No admin users with player IDs found');
      return { success: false, error: 'No admin users with player IDs found' };
    }

    // Extract all player IDs from JSONB arrays
    // Each admin can have multiple devices (desktop, iOS, etc.)
    const playerIds: string[] = [];
    adminUsers.forEach(au => {
      if (au.onesignal_player_id) {
        // Handle both array format (new) and single string (legacy)
        if (Array.isArray(au.onesignal_player_id)) {
          playerIds.push(...au.onesignal_player_id.filter((id): id is string => typeof id === 'string' && !!id));
        } else if (typeof au.onesignal_player_id === 'string') {
          // Legacy format - single string
          playerIds.push(au.onesignal_player_id);
        }
      }
    });

    if (playerIds.length === 0) {
      console.warn('⚠️ [OneSignal] No valid player IDs found');
      return { success: false, error: 'No valid player IDs found' };
    }

    // Get admin user IDs for external_user_ids
    // This is the KEY: We use login() to set External User ID = user.id
    // All devices with the same External User ID will receive notifications
    const adminUserIds = adminUsers.map(au => au.user_id);

    console.log(`📤 [OneSignal] Sending notification to ${adminUserIds.length} admin user(s)`);
    console.log(`   External User IDs: ${adminUserIds.join(', ')}`);
    console.log(`   Player IDs (backup): ${playerIds.length} device(s)`);

    // Initialize OneSignal client
    const client = getOneSignalClient();

    // Calculate total items count
    const itemsCount = order.order_items?.reduce((sum: number, item: any) => 
      sum + item.quantity, 0
    ) || 0;

    // Prepare notification
    // PRIMARY METHOD: Use include_external_user_ids (sends to ALL devices with same External User ID)
    // FALLBACK: Also include player_ids for devices that might not have External User ID set
    const notification: any = {
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
      // PRIMARY: Use external user IDs - sends to ALL devices (desktop, iOS, etc.)
      // This works because we call login(user.id) which sets External User ID = user.id
      include_external_user_ids: adminUserIds,
      // FALLBACK: Also include player IDs for devices without External User ID
      include_player_ids: playerIds.length > 0 ? playerIds : undefined,
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
      // iOS-specific: ensure notification is delivered even when app is in background
      ios_badgeType: 'Increase',
      ios_badgeCount: 1,
    };

    // Send notification
    console.log('📨 [OneSignal] Sending notification via OneSignal API...');
    const response = await client.createNotification(notification);

    if (response.body?.errors && response.body.errors.length > 0) {
      console.error('❌ [OneSignal] Errors:', response.body.errors);
      return { success: false, error: response.body.errors.join(', ') };
    }

    console.log(`✅ [OneSignal] Notification sent successfully`);
    console.log(`   Notification ID: ${response.body?.id}`);
    console.log(`   Recipients: ${playerIds.length} admin(s)`);
    console.log(`   Response:`, JSON.stringify(response.body, null, 2));
    
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
    console.log(`💾 [OneSignal] Attempting to save player ID for user: ${userId}, player ID: ${playerId}`);
    const supabase = getSupabaseAdmin();
    
    // Verify user is admin and get current player IDs
    const { data: adminUser, error: checkError } = await supabase
      .from('admin_users')
      .select('id, onesignal_player_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('❌ [OneSignal] Error checking admin user:', checkError);
      return { success: false, error: `Database error: ${checkError.message}` };
    }

    if (!adminUser) {
      console.error('❌ [OneSignal] User is not an admin:', userId);
      return { success: false, error: 'User is not an admin' };
    }

    // Get current player IDs array (or create new array)
    let currentPlayerIds: string[] = [];
    
    if (adminUser.onesignal_player_id) {
      // Handle both array format (new) and single string (legacy)
      if (Array.isArray(adminUser.onesignal_player_id)) {
        currentPlayerIds = adminUser.onesignal_player_id.filter((id): id is string => typeof id === 'string' && !!id);
      } else if (typeof adminUser.onesignal_player_id === 'string') {
        // Legacy format - convert to array
        currentPlayerIds = [adminUser.onesignal_player_id];
      }
    }

    // Check if player ID already exists
    if (currentPlayerIds.includes(playerId)) {
      console.log(`✅ [OneSignal] Player ID already exists for admin: ${userId}`);
      return { success: true, alreadyExists: true };
    }

    // Add new player ID to array (each device has its own Player ID)
    const updatedPlayerIds = [...currentPlayerIds, playerId];
    
    console.log(`📱 [OneSignal] Adding player ID to device list for admin ${userId}:`);
    console.log(`   Existing devices: ${currentPlayerIds.length}`);
    console.log(`   New device Player ID: ${playerId}`);
    console.log(`   Total devices: ${updatedPlayerIds.length}`);

    // Update admin user with new player IDs array
    const { data: updatedData, error: updateError } = await supabase
      .from('admin_users')
      .update({ onesignal_player_id: updatedPlayerIds })
      .eq('user_id', userId)
      .select('onesignal_player_id');

    if (updateError) {
      console.error('❌ [OneSignal] Failed to save player ID:', updateError);
      return { success: false, error: updateError.message };
    }

    // Verify the update was successful
    if (updatedData && updatedData[0]?.onesignal_player_id) {
      const savedIds = Array.isArray(updatedData[0].onesignal_player_id) 
        ? updatedData[0].onesignal_player_id 
        : [updatedData[0].onesignal_player_id];
      
      if (savedIds.includes(playerId)) {
        console.log(`✅ [OneSignal] Player ID saved successfully for admin: ${userId}`);
        console.log(`   Total devices registered: ${savedIds.length}`);
        return { success: true };
      }
    }
    
    console.error('❌ [OneSignal] Player ID update verification failed');
    return { success: false, error: 'Update verification failed' };
  } catch (error) {
    console.error('❌ [OneSignal] Error saving player ID:', error);
    return { success: false, error: String(error) };
  }
}

export async function removeAdminPlayerId(userId: string, playerId: string | 'all') {
  try {
    console.log(`🗑️ [OneSignal] Attempting to remove player ID for user: ${userId}, player ID: ${playerId}`);
    const supabase = getSupabaseAdmin();
    
    // Verify user is admin and get current player IDs
    const { data: adminUser, error: checkError } = await supabase
      .from('admin_users')
      .select('id, onesignal_player_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('❌ [OneSignal] Error checking admin user:', checkError);
      return { success: false, error: `Database error: ${checkError.message}` };
    }

    if (!adminUser) {
      console.error('❌ [OneSignal] User is not an admin:', userId);
      return { success: false, error: 'User is not an admin' };
    }

    // Get current player IDs array (or create new array)
    let currentPlayerIds: string[] = [];
    
    if (adminUser.onesignal_player_id) {
      // Handle both array format (new) and single string (legacy)
      if (Array.isArray(adminUser.onesignal_player_id)) {
        currentPlayerIds = adminUser.onesignal_player_id.filter((id): id is string => typeof id === 'string' && !!id);
      } else if (typeof adminUser.onesignal_player_id === 'string') {
        // Legacy format - convert to array
        currentPlayerIds = [adminUser.onesignal_player_id];
      }
    }

    // If playerId is 'all', remove all player IDs
    if (playerId === 'all') {
      if (currentPlayerIds.length === 0) {
        console.log(`ℹ️ [OneSignal] No player IDs to remove for admin: ${userId}`);
        return { success: true, alreadyRemoved: true };
      }
      
      console.log(`📱 [OneSignal] Removing all player IDs for admin ${userId}:`);
      console.log(`   Existing devices: ${currentPlayerIds.length}`);
      console.log(`   All player IDs will be removed`);
      
      // Set to null to remove all
      const { data: updatedData, error: updateError } = await supabase
        .from('admin_users')
        .update({ onesignal_player_id: null })
        .eq('user_id', userId)
        .select('onesignal_player_id');

      if (updateError) {
        console.error('❌ [OneSignal] Failed to remove all player IDs:', updateError);
        return { success: false, error: updateError.message };
      }

      console.log(`✅ [OneSignal] All player IDs removed successfully for admin: ${userId}`);
      return { success: true, allDevicesRemoved: true };
    }

    // Check if player ID exists
    if (!currentPlayerIds.includes(playerId)) {
      console.log(`ℹ️ [OneSignal] Player ID not found for admin: ${userId}`);
      // Still return success - maybe it was already removed
      return { success: true, alreadyRemoved: true };
    }

    // Remove player ID from array
    const updatedPlayerIds = currentPlayerIds.filter(id => id !== playerId);
    
    console.log(`📱 [OneSignal] Removing player ID from device list for admin ${userId}:`);
    console.log(`   Existing devices: ${currentPlayerIds.length}`);
    console.log(`   Removed device Player ID: ${playerId}`);
    console.log(`   Remaining devices: ${updatedPlayerIds.length}`);

    // Update admin user with updated player IDs array
    // If no devices remain, set to null
    const updateValue = updatedPlayerIds.length > 0 ? updatedPlayerIds : null;
    
    const { data: updatedData, error: updateError } = await supabase
      .from('admin_users')
      .update({ onesignal_player_id: updateValue })
      .eq('user_id', userId)
      .select('onesignal_player_id');

    if (updateError) {
      console.error('❌ [OneSignal] Failed to remove player ID:', updateError);
      return { success: false, error: updateError.message };
    }

    // Verify the update was successful
    if (updateValue === null) {
      // All devices removed
      if (!updatedData || !updatedData[0]?.onesignal_player_id) {
        console.log(`✅ [OneSignal] All player IDs removed successfully for admin: ${userId}`);
        return { success: true, allDevicesRemoved: true };
      }
    } else {
      // Some devices remain
      const savedIds = Array.isArray(updatedData[0]?.onesignal_player_id) 
        ? updatedData[0].onesignal_player_id 
        : [updatedData[0]?.onesignal_player_id];
      
      if (!savedIds.includes(playerId)) {
        console.log(`✅ [OneSignal] Player ID removed successfully for admin: ${userId}`);
        console.log(`   Remaining devices: ${savedIds.length}`);
        return { success: true };
      }
    }
    
    console.error('❌ [OneSignal] Player ID removal verification failed');
    return { success: false, error: 'Removal verification failed' };
  } catch (error) {
    console.error('❌ [OneSignal] Error removing player ID:', error);
    return { success: false, error: String(error) };
  }
}

