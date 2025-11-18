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
        // Check if OneSignal is ready by waiting for the User object
        let readyRetries = 0;
        const maxReadyRetries = 20;
        while (readyRetries < maxReadyRetries) {
          if (window.OneSignal?.User) {
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 200));
          readyRetries++;
        }
        
        if (!window.OneSignal?.User) {
          console.warn('⚠️ OneSignal User object not available yet');
        }
        
        // Additional wait to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
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

        // Check if user has already subscribed to push notifications
        let isSubscribed = false;
        let userId: string | null = null;

        try {
          // Check subscription status (OneSignal SDK v16+)
          if (window.OneSignal?.User?.PushSubscription) {
            const subscription = window.OneSignal.User.PushSubscription;
            isSubscribed = await subscription.optedIn;
            if (isSubscribed) {
              userId = await subscription.id;
            }
          }
        } catch (error) {
          console.log('Checking subscription status...', error);
        }

        // If not subscribed, try to prompt for permission (works on desktop)
        // NOTE: On iOS, this won't work due to user interaction requirement,
        // but the NotificationPermissionButton component handles iOS via explicit button click
        if (!isSubscribed || !userId) {
          console.log('🔔 Requesting push notification permission...');
          
          try {
            // Method 1: Use showSlidedownPrompt (OneSignal SDK v16 recommended method)
            if (window.OneSignal?.showSlidedownPrompt) {
              await window.OneSignal.showSlidedownPrompt();
              console.log('✅ Permission prompt shown via showSlidedownPrompt');
            }
            // Method 2: Use Slidedown.promptPush (alternative API)
            else if (window.OneSignal?.Slidedown?.promptPush) {
              await window.OneSignal.Slidedown.promptPush();
              console.log('✅ Permission prompt shown via Slidedown.promptPush');
            }
            // Method 3: Use optIn (alternative)
            else if (window.OneSignal?.User?.PushSubscription?.optIn) {
              await window.OneSignal.User.PushSubscription.optIn();
              console.log('✅ Permission requested via optIn');
            }
            // Method 4: Fallback - try to get permission via native browser API
            else if ('Notification' in window && Notification.permission === 'default') {
              await Notification.requestPermission();
              console.log('✅ Permission requested via native API');
            }

            // Wait a bit for user to respond to prompt
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Try to get the player ID after permission request
            try {
              if (window.OneSignal?.User?.PushSubscription?.id) {
                userId = await window.OneSignal.User.PushSubscription.id;
              } else if (window.OneSignal?.getUserId) {
                userId = await window.OneSignal.getUserId();
              } else if (window.OneSignal?.userId) {
                userId = window.OneSignal.userId;
              }
            } catch (error) {
              console.log('Player ID not available yet, user may need to allow notifications');
            }
          } catch (error: any) {
            // Handle permission errors gracefully
            // On iOS, this will fail silently (expected behavior)
            if (error?.message?.includes('permission') || error?.message?.includes('denied')) {
              console.log('⚠️ User denied notification permission or permission already handled');
            } else {
              console.log('⚠️ Automatic prompt may not work on iOS - use the button instead');
            }
          }
        }

        // If we have a player ID, save it to database and set external ID
        if (userId) {
          // Set external ID to link admin user with OneSignal player (OneSignal best practice)
          try {
            if (window.OneSignal?.login) {
              await window.OneSignal.login(user.id);
              console.log('✅ OneSignal external ID set for admin user');
            }
          } catch (loginError) {
            console.log('Note: Could not set OneSignal external ID (may not be available in this SDK version)');
          }

          // Save player ID to database
          const result = await saveAdminPlayerId(user.id, userId);
          
          if (result.success) {
            console.log('✅ OneSignal player ID registered:', userId);
          } else {
            console.error('Failed to register OneSignal player ID:', result.error);
          }
        } else {
          console.log('ℹ️ OneSignal player ID not available - user may need to allow notifications in browser settings');
        }
      } catch (error) {
        console.error('Error registering OneSignal player:', error);
      }
    };

    initOneSignal();
  }, [router]);

  return null; // This component doesn't render anything
}

