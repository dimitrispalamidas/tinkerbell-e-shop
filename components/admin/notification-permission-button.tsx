"use client"

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { saveAdminPlayerId, removeAdminPlayerId } from '@/lib/actions/send-onesignal-notification'

declare global {
  interface Window {
    OneSignal?: any
  }
}

export function NotificationPermissionButton() {
  const locale = useLocale()
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isOneSignalConfigured, setIsOneSignalConfigured] = useState(false)

  useEffect(() => {
    // Check if OneSignal is configured - use production app ID for both dev and prod
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID_PROD || process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
    
    if (!appId) {
      setIsOneSignalConfigured(false)
      setIsLoading(false)
      return
    }
    
    setIsOneSignalConfigured(true)
    checkSubscriptionStatus()
  }, [])

  const checkSubscriptionStatus = async (preserveCurrentState = false) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsSubscribed(false)
        setIsLoading(false)
        return
      }
      
      // Store current state to preserve it if needed
      const previousSubscribedState = isSubscribed

      // Wait for OneSignal to be ready
      let retries = 0
      const maxRetries = 20
      while (!window.OneSignal && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 200))
        retries++
      }

      // Check if THIS DEVICE has granted permission and is subscribed
      // Each device has its own player ID, so we check the current device's status
      let currentDeviceSubscribed = false
      
      if (window.OneSignal?.User?.PushSubscription) {
        try {
          const subscription = window.OneSignal.User.PushSubscription
          // Wait a bit for subscription to be ready (especially on iOS)
          let subscriptionRetries = 0
          while (subscriptionRetries < 5) {
            try {
              currentDeviceSubscribed = await subscription.optedIn
              if (currentDeviceSubscribed !== undefined) {
                break
              }
            } catch (error) {
              // Subscription might not be ready yet, retry
              if (subscriptionRetries < 4) {
                await new Promise(resolve => setTimeout(resolve, 500))
              }
            }
            subscriptionRetries++
          }
          
          if (currentDeviceSubscribed) {
            // This device is subscribed, check if we have a player ID
            let playerId: string | null = null
            try {
              playerId = await subscription.id
            } catch (error) {
              // Try alternative methods to get player ID
              if (window.OneSignal?.getUserId) {
                playerId = await window.OneSignal.getUserId()
              } else if (window.OneSignal?.userId) {
                playerId = window.OneSignal.userId
              }
            }
            
            // If we have a player ID, make sure it's saved to database
            if (playerId) {
              const { data: adminRecord } = await supabase
                .from('admin_users')
                .select('onesignal_player_id')
                .eq('user_id', user.id)
                .maybeSingle()
              
              // Check if this player ID exists in the array
              let playerIdExists = false
              if (adminRecord?.onesignal_player_id) {
                if (Array.isArray(adminRecord.onesignal_player_id)) {
                  playerIdExists = adminRecord.onesignal_player_id.includes(playerId)
                } else if (typeof adminRecord.onesignal_player_id === 'string') {
                  playerIdExists = adminRecord.onesignal_player_id === playerId
                }
              }
              
              // If player ID is not saved, add it to the array
              if (!playerIdExists) {
                await saveAdminPlayerId(user.id, playerId)
              }
            }
          }
        } catch (error) {
          console.log('Error checking OneSignal subscription:', error)
        }
      }

      // Also check browser permission as fallback
      // If browser permission is granted but OneSignal subscription is not ready yet,
      // don't set to false - might be a timing issue (especially on iOS)
      if (!currentDeviceSubscribed && 'Notification' in window) {
        const permission = Notification.permission
        if (permission === 'granted') {
          // Browser permission granted but OneSignal subscription might not be ready yet
          // This is common on iOS - don't set to false immediately
          // The subscription might become available shortly
          console.log('ℹ️ [OneSignal] Browser permission granted but subscription status pending')
          // Keep current state if preserveCurrentState is true and we were subscribed
          // This prevents auto-toggle-off when subscription is still initializing
          if (preserveCurrentState && previousSubscribedState === true) {
            // If we were already subscribed, keep it as true (might be timing issue)
            currentDeviceSubscribed = true
            console.log('✅ [OneSignal] Preserving subscription state (timing issue)')
          } else {
            currentDeviceSubscribed = false
          }
        }
      }

      // IMPORTANT: If preserveCurrentState is true and we were subscribed,
      // but OneSignal subscription check failed, keep it as true
      // This prevents auto-toggle-off when subscription is still initializing
      if (preserveCurrentState && previousSubscribedState === true && !currentDeviceSubscribed) {
        // OneSignal might not be ready yet, but we just enabled it
        // Keep it as true to prevent auto-toggle-off
        console.log('✅ [OneSignal] Preserving ON state - subscription might still be initializing')
        currentDeviceSubscribed = true
      }

      setIsSubscribed(currentDeviceSubscribed)
    } catch (error) {
      console.error('Error checking subscription status:', error)
      setIsSubscribed(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async (checked: boolean) => {
    // Optimistically update UI for better UX on mobile
    const previousState = isSubscribed
    setIsSubscribed(checked)
    setIsProcessing(true)
    
    try {
      if (checked) {
        await handleEnableNotifications()
        // After enabling, keep the state as true
        // Don't let checkSubscriptionStatus override it immediately
        setIsSubscribed(true)
      } else {
        await handleDisableNotifications()
      }
    } catch (error) {
      // Revert on error
      setIsSubscribed(previousState)
      setIsProcessing(false)
      throw error
    }
  }

  const handleEnableNotifications = async () => {
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error(locale === 'el' ? 'Πρέπει να είστε συνδεδεμένος' : 'You must be logged in')
        setIsProcessing(false)
        return
      }

      // Wait for OneSignal to be ready
      let retries = 0
      const maxRetries = 20
      while (!window.OneSignal && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 200))
        retries++
      }

      if (!window.OneSignal) {
        // OneSignal not loaded - might not be configured or still loading
        // Don't show error if it's just not configured (normal in dev)
        console.warn('⚠️ OneSignal SDK not loaded')
        setIsProcessing(false)
        setIsSubscribed(false)
        return
      }

      // Wait for OneSignal User object
      let readyRetries = 0
      while (!window.OneSignal?.User && readyRetries < 20) {
        await new Promise(resolve => setTimeout(resolve, 200))
        readyRetries++
      }

      // Check if already subscribed - if yes, just ensure External User ID is set
      let alreadySubscribed = false
      try {
        if (window.OneSignal?.User?.PushSubscription) {
          alreadySubscribed = await window.OneSignal.User.PushSubscription.optedIn
        }
      } catch (error) {
        console.log('Checking subscription status...', error)
      }

      // If not subscribed, request permission or opt-in
      if (!alreadySubscribed) {
        // First check if we have browser permission but OneSignal is opted out
        if ('Notification' in window && Notification.permission === 'granted') {
          // Browser permission exists but OneSignal is opted out - try to opt-in
          if (window.OneSignal?.User?.PushSubscription?.optIn) {
            try {
              await window.OneSignal.User.PushSubscription.optIn()
              console.log('✅ [OneSignal] Opted in (was previously opted out)')
              // Wait a bit for opt-in to process
              await new Promise(resolve => setTimeout(resolve, 1000))
              // Re-check subscription status
              alreadySubscribed = await window.OneSignal.User.PushSubscription.optedIn
              if (alreadySubscribed) {
                console.log('✅ [OneSignal] Successfully re-subscribed')
              }
            } catch (optInError) {
              console.log('⚠️ [OneSignal] Could not opt-in, will request permission:', optInError)
            }
          }
        }
        let permissionGranted = false
        
        try {
          // Method 1: showSlidedownPrompt (recommended for iOS)
          if (window.OneSignal?.showSlidedownPrompt) {
            await window.OneSignal.showSlidedownPrompt()
            permissionGranted = true
          }
          // Method 2: Slidedown.promptPush
          else if (window.OneSignal?.Slidedown?.promptPush) {
            await window.OneSignal.Slidedown.promptPush()
            permissionGranted = true
          }
          // Method 3: optIn (if already has permission)
          else if (window.OneSignal?.User?.PushSubscription?.optIn) {
            // Check if we have permission first
            if ('Notification' in window && Notification.permission === 'granted') {
              await window.OneSignal.User.PushSubscription.optIn()
              permissionGranted = true
            } else if (Notification.permission === 'default') {
              // Request permission first
              const permission = await Notification.requestPermission()
              if (permission === 'granted') {
                await window.OneSignal.User.PushSubscription.optIn()
                permissionGranted = true
              }
            }
          }
          // Method 4: Native browser API (fallback)
          else if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission()
            permissionGranted = permission === 'granted'
            // After getting permission, try to opt in
            if (permissionGranted && window.OneSignal?.User?.PushSubscription?.optIn) {
              await window.OneSignal.User.PushSubscription.optIn()
            }
          }
        } catch (error: any) {
          console.error('Error requesting permission:', error)
          if (error?.message?.includes('permission') || error?.message?.includes('denied')) {
            toast.error(locale === 'el' ? 'Η άδεια ειδοποιήσεων απορρίφθηκε' : 'Notification permission denied')
          } else {
            toast.error(locale === 'el' ? 'Σφάλμα κατά την αίτηση άδειας' : 'Error requesting permission')
          }
          setIsProcessing(false)
          return
        }
      } else {
        console.log('✅ [OneSignal] Already subscribed - ensuring External User ID is set')
      }

      // IMPORTANT: Set external ID FIRST (even before getting Player ID)
      // This is CRITICAL for iOS - links the device to the user immediately
      // All devices with the same External User ID will receive notifications via include_external_user_ids
      if (window.OneSignal?.login) {
        try {
          await window.OneSignal.login(user.id)
          console.log('✅ [OneSignal] External User ID set:', user.id)
          console.log('   This links all devices to the same user')
          console.log('   Notifications will work via include_external_user_ids even if Player ID is not saved')
        } catch (loginError) {
          console.warn('⚠️ [OneSignal] Could not set external ID:', loginError)
        }
      } else {
        console.warn('⚠️ [OneSignal] login() method not available')
      }

      // Wait a bit for the permission to be processed
      // iOS may need more time to process the permission
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Get player ID after permission - try multiple times for iOS
      let playerId: string | null = null
      let attempts = 0
      const maxAttempts = 10  // Increased attempts for iOS
      
      while (!playerId && attempts < maxAttempts) {
        try {
          if (window.OneSignal?.User?.PushSubscription?.id) {
            playerId = await window.OneSignal.User.PushSubscription.id
          } else if (window.OneSignal?.getUserId) {
            playerId = await window.OneSignal.getUserId()
          } else if (window.OneSignal?.userId) {
            playerId = window.OneSignal.userId
          }
          
          if (playerId) {
            console.log('✅ [OneSignal] Player ID obtained:', playerId)
            break
          }
        } catch (error) {
          console.log(`⚠️ [OneSignal] Attempt ${attempts + 1} to get player ID failed:`, error)
        }
        
        if (!playerId && attempts < maxAttempts - 1) {
          // Wait before retrying (longer wait for iOS)
          await new Promise(resolve => setTimeout(resolve, 1500))
        }
        attempts++
      }

      // Even if Player ID is not available, notifications should work via External User ID
      if (!playerId) {
        console.warn('⚠️ [OneSignal] Could not get Player ID, but External User ID is set')
        console.warn('   Notifications should still work via include_external_user_ids')
        toast.success(locale === 'el' ? 'Οι ειδοποιήσεις ενεργοποιήθηκαν! (Player ID pending)' : 'Notifications enabled! (Player ID pending)')
        setIsSubscribed(true)
        setIsProcessing(false)
        
        // Re-check status after delay to see if Player ID becomes available
        // Pass preserveCurrentState=true to prevent auto-toggle-off if subscription is still initializing
        setTimeout(() => {
          checkSubscriptionStatus(true)
        }, 5000) // Longer delay for iOS when Player ID is not available yet
        return
      }

      // Save player ID to database (for backup/fallback)
      // But notifications should work via include_external_user_ids
      console.log('💾 [OneSignal] Saving player ID to database (backup)...')
      const result = await saveAdminPlayerId(user.id, playerId)
      
      if (result.success) {
        console.log('✅ [OneSignal] Player ID saved successfully')
        setIsSubscribed(true)
        toast.success(locale === 'el' ? 'Οι ειδοποιήσεις ενεργοποιήθηκαν!' : 'Notifications enabled!')
        
        // Re-check status after longer delay to ensure OneSignal is fully synced
        // iOS may need more time to update the subscription status
        // Pass preserveCurrentState=true to prevent auto-toggle-off if subscription is still initializing
        setTimeout(() => {
          checkSubscriptionStatus(true)
        }, 3000) // Increased from 1000ms to 3000ms for iOS
      } else {
        console.error('❌ [OneSignal] Failed to save player ID:', result.error)
        toast.error(locale === 'el' ? 'Σφάλμα κατά την αποθήκευση' : 'Error saving player ID')
        // Don't revert toggle on save error - subscription might still work via External User ID
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      toast.error(locale === 'el' ? 'Σφάλμα κατά την αίτηση άδειας' : 'Error requesting permission')
      setIsSubscribed(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDisableNotifications = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error(locale === 'el' ? 'Πρέπει να είστε συνδεδεμένος' : 'You must be logged in')
        setIsProcessing(false)
        return
      }

      // Wait for OneSignal to be ready
      let retries = 0
      const maxRetries = 20
      while (!window.OneSignal && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 200))
        retries++
      }

      if (!window.OneSignal) {
        // OneSignal not loaded - might not be configured or still loading
        // Don't show error if it's just not configured (normal in dev)
        console.warn('⚠️ OneSignal SDK not loaded')
        setIsProcessing(false)
        setIsSubscribed(false)
        return
      }

      // Wait for OneSignal User object
      let readyRetries = 0
      while (!window.OneSignal?.User && readyRetries < 20) {
        await new Promise(resolve => setTimeout(resolve, 200))
        readyRetries++
      }

      // Get current player ID before opting out
      let playerId: string | null = null
      try {
        if (window.OneSignal?.User?.PushSubscription?.id) {
          playerId = await window.OneSignal.User.PushSubscription.id
        } else if (window.OneSignal?.getUserId) {
          playerId = await window.OneSignal.getUserId()
        } else if (window.OneSignal?.userId) {
          playerId = window.OneSignal.userId
        }
      } catch (error) {
        console.log('Could not get player ID:', error)
      }

      // Opt out from OneSignal - IMPORTANT: This stops receiving notifications
      try {
        // Method 1: optOut (OneSignal SDK v16) - PRIMARY METHOD
        if (window.OneSignal?.User?.PushSubscription?.optOut) {
          await window.OneSignal.User.PushSubscription.optOut()
          console.log('✅ [OneSignal] Opted out via optOut() - notifications will stop')
          
          // Verify opt-out was successful
          await new Promise(resolve => setTimeout(resolve, 500))
          const isStillSubscribed = await window.OneSignal.User.PushSubscription.optedIn
          if (isStillSubscribed) {
            console.warn('⚠️ [OneSignal] optOut() did not work, trying alternative methods')
            // Try alternative if optOut didn't work
            if (window.OneSignal?.logout) {
              await window.OneSignal.logout()
              console.log('✅ [OneSignal] Logged out as fallback')
            }
          }
        }
        // Method 2: logout (removes external user ID) - also stops notifications
        else if (window.OneSignal?.logout) {
          await window.OneSignal.logout()
          console.log('✅ [OneSignal] Logged out (removed external user ID) - notifications will stop')
        }
        // Method 3: setSubscription (legacy)
        else if (window.OneSignal?.setSubscription) {
          await window.OneSignal.setSubscription(false)
          console.log('✅ [OneSignal] Subscription disabled via setSubscription()')
        }
      } catch (error: any) {
        console.error('Error opting out from OneSignal:', error)
        // Continue anyway - we'll still remove from database
      }
      
      // Also remove External User ID by logging out (ensures no notifications via external_user_ids)
      try {
        if (window.OneSignal?.logout) {
          await window.OneSignal.logout()
          console.log('✅ [OneSignal] External User ID removed (logged out) - ensures no notifications')
        }
      } catch (error) {
        console.log('Could not logout from OneSignal:', error)
      }

      // Remove player ID from database (if we have it)
      // This ensures the server won't try to send notifications to this device
      if (playerId) {
        console.log('💾 [OneSignal] Removing player ID from database...')
        const result = await removeAdminPlayerId(user.id, playerId)
        
        if (result.success) {
          console.log('✅ [OneSignal] Player ID removed from database - server won\'t send notifications')
        } else {
          console.warn('⚠️ [OneSignal] Failed to remove player ID from database:', result.error)
        }
      } else {
        // Even without player ID, try to remove any existing player IDs from database
        // This handles the case where we don't have the current player ID but want to opt out
        console.log('💾 [OneSignal] Attempting to remove all player IDs for this user...')
        const result = await removeAdminPlayerId(user.id, 'all')
        if (result.success) {
          console.log('✅ [OneSignal] All player IDs removed from database')
        }
      }

      setIsSubscribed(false)
      toast.success(locale === 'el' ? 'Οι ειδοποιήσεις απενεργοποιήθηκαν' : 'Notifications disabled')
      
      // Re-check status to ensure everything is synced
      setTimeout(() => {
        checkSubscriptionStatus()
      }, 2000)
    } catch (error) {
      console.error('Error disabling notifications:', error)
      toast.error(locale === 'el' ? 'Σφάλμα κατά την απενεργοποίηση' : 'Error disabling notifications')
      setIsSubscribed(true) // Revert toggle on error
    } finally {
      setIsProcessing(false)
    }
  }

  // Don't show anything if OneSignal is not configured
  if (!isOneSignalConfigured) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-7 w-12 rounded-full bg-sage-200 animate-pulse" />
        <Label className="text-sm text-muted-foreground">
          {locale === 'el' ? 'Φόρτωση...' : 'Loading...'}
        </Label>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Switch
        id="notification-toggle"
        checked={isSubscribed === true}
        onCheckedChange={handleToggle}
        disabled={isProcessing || isSubscribed === null}
        aria-label={locale === 'el' ? 'Ειδοποιήσεις' : 'Notifications'}
      />
      <Label
        htmlFor="notification-toggle"
        className="text-sm font-medium cursor-pointer select-none"
      >
        {isSubscribed
          ? (locale === 'el' ? 'Οι ειδοποιήσεις είναι ενεργοποιημένες' : 'Notifications are enabled')
          : (locale === 'el' ? 'Ενεργοποίηση ειδοποιήσεων' : 'Enable notifications')}
      </Label>
      {isProcessing && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ml-2" />
      )}
    </div>
  )
}

