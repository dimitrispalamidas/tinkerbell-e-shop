"use client"

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Bell, BellOff, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { saveAdminPlayerId } from '@/lib/actions/send-onesignal-notification'

declare global {
  interface Window {
    OneSignal?: any
  }
}

export function NotificationPermissionButton() {
  const locale = useLocale()
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    checkSubscriptionStatus()
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsSubscribed(false)
        setIsLoading(false)
        return
      }

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
          currentDeviceSubscribed = await subscription.optedIn
          
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
      if (!currentDeviceSubscribed && 'Notification' in window) {
        const permission = Notification.permission
        if (permission === 'granted') {
          // Browser permission granted but OneSignal not subscribed yet
          // This might happen on iOS or if OneSignal isn't ready
          currentDeviceSubscribed = false // Still show button to complete OneSignal setup
        }
      }

      setIsSubscribed(currentDeviceSubscribed)
    } catch (error) {
      console.error('Error checking subscription status:', error)
      setIsSubscribed(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestPermission = async () => {
    setIsRequesting(true)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error(locale === 'el' ? 'Πρέπει να είστε συνδεδεμένος' : 'You must be logged in')
        setIsRequesting(false)
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
        toast.error(locale === 'el' ? 'Το OneSignal δεν είναι διαθέσιμο' : 'OneSignal is not available')
        setIsRequesting(false)
        return
      }

      // Wait for OneSignal User object
      let readyRetries = 0
      while (!window.OneSignal?.User && readyRetries < 20) {
        await new Promise(resolve => setTimeout(resolve, 200))
        readyRetries++
      }

      // Request permission using OneSignal methods
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
        // Method 3: optIn
        else if (window.OneSignal?.User?.PushSubscription?.optIn) {
          await window.OneSignal.User.PushSubscription.optIn()
          permissionGranted = true
        }
        // Method 4: Native browser API (fallback)
        else if ('Notification' in window && Notification.permission === 'default') {
          const permission = await Notification.requestPermission()
          permissionGranted = permission === 'granted'
        }
      } catch (error: any) {
        console.error('Error requesting permission:', error)
        if (error?.message?.includes('permission') || error?.message?.includes('denied')) {
          toast.error(locale === 'el' ? 'Η άδεια ειδοποιήσεων απορρίφθηκε' : 'Notification permission denied')
        } else {
          toast.error(locale === 'el' ? 'Σφάλμα κατά την αίτηση άδειας' : 'Error requesting permission')
        }
        setIsRequesting(false)
        return
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
        setIsRequesting(false)
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
        
        // Re-check status to ensure everything is synced
        setTimeout(() => {
          checkSubscriptionStatus()
        }, 1000)
      } else {
        console.error('❌ [OneSignal] Failed to save player ID:', result.error)
        toast.error(locale === 'el' ? 'Σφάλμα κατά την αποθήκευση' : 'Error saving player ID')
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      toast.error(locale === 'el' ? 'Σφάλμα κατά την αίτηση άδειας' : 'Error requesting permission')
    } finally {
      setIsRequesting(false)
    }
  }

  if (isLoading) {
    return null // Don't show anything while loading
  }

  if (isSubscribed) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        <span>{locale === 'el' ? 'Οι ειδοποιήσεις είναι ενεργοποιημένες' : 'Notifications are enabled'}</span>
      </div>
    )
  }

  return (
    <Button
      onClick={handleRequestPermission}
      disabled={isRequesting}
      className="flex items-center gap-2"
      variant="default"
    >
      {isRequesting ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
          <span>{locale === 'el' ? 'Επεξεργασία...' : 'Processing...'}</span>
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          <span>{locale === 'el' ? 'Ενεργοποίηση Ειδοποιήσεων' : 'Enable Notifications'}</span>
        </>
      )}
    </Button>
  )
}

