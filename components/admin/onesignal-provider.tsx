"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { saveAdminPlayerId } from '@/lib/actions/send-onesignal-notification';

declare global {
  interface Window {
    OneSignal?: any;
  }
}

export function OneSignalProvider() {
  const router = useRouter();

  useEffect(() => {
    // Only initialize OneSignal if we have the app ID
    // Use different App ID for dev vs production if configured
    const appId = process.env.NODE_ENV === 'development' 
      ? (process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID_DEV || process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID)
      : (process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID_PROD || process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID);
    
    if (!appId) {
      console.log('OneSignal not configured - skipping initialization');
      return;
    }

    // Initialize OneSignal
    // Note: OneSignal SDK is already loaded in admin/layout.tsx <head>
    // We just need to wait for it to be ready and register the player
    const initOneSignal = async () => {
      try {
        // Wait for OneSignal to be loaded (from admin layout)
        let retries = 0;
        const maxRetries = 10;
        
        while (!window.OneSignal && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500));
          retries++;
        }

        if (!window.OneSignal) {
          console.warn('⚠️ OneSignal SDK not loaded. Make sure OneSignal App ID is configured.');
          return;
        }

        // Wait for OneSignal to be fully initialized
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Register player
        await registerPlayer();
      } catch (error: any) {
        // Handle domain restriction error gracefully
        if (error?.message?.includes('Can only be used on')) {
          console.warn('⚠️ OneSignal: Localhost not configured in Allowed Domains');
          console.warn('   Add http://localhost:3000 to OneSignal dashboard → Settings → Platforms → Web Push → Allowed Domains');
          console.warn('   Or test only on production: https://tinkerbell-e-shop.vercel.app');
          return;
        }
        console.error('Failed to initialize OneSignal:', error);
      }
    };

    const registerPlayer = async () => {
      try {
        if (!window.OneSignal) {
          console.error('OneSignal not available');
          return;
        }

        // Get current user
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // Not logged in, skip registration
          return;
        }

        // Check if user is admin and if they already have OneSignal ID
        const { data: adminRecord } = await supabase
          .from('admin_users')
          .select('id, onesignal_player_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!adminRecord) {
          // Not an admin, skip registration
          return;
        }

        // If admin already has OneSignal ID, skip registration
        if (adminRecord.onesignal_player_id) {
          console.log('✅ Admin already has OneSignal player ID');
          return;
        }

        // Get OneSignal user ID (player ID)
        // Try different methods depending on OneSignal SDK version
        let userId: string | null = null;
        
        try {
          // Method 1: OneSignal SDK v16+
          if (window.OneSignal?.User?.PushSubscription?.id) {
            userId = await window.OneSignal.User.PushSubscription.id;
          }
          // Method 2: Alternative API
          else if (window.OneSignal?.getUserId) {
            userId = await window.OneSignal.getUserId();
          }
          // Method 3: Direct access
          else if (window.OneSignal?.userId) {
            userId = window.OneSignal.userId;
          }
        } catch (error) {
          console.error('Error getting OneSignal user ID:', error);
        }
        
        if (!userId) {
          console.log('OneSignal user ID not available yet - user may need to allow notifications');
          return;
        }

        // Save player ID to database (only if it doesn't exist)
        const result = await saveAdminPlayerId(user.id, userId);
        
        if (result.success) {
          console.log('✅ OneSignal player ID registered');
        } else {
          console.error('Failed to register OneSignal player ID:', result.error);
        }
      } catch (error) {
        console.error('Error registering OneSignal player:', error);
      }
    };

    initOneSignal();
  }, [router]);

  return null; // This component doesn't render anything
}

