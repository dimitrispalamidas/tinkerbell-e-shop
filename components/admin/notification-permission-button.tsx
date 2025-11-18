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
              
              // If player ID is different or not saved, update it
              if (!adminRecord?.onesignal_player_id || adminRecord.onesignal_player_id !== playerId) {
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

      // Wait a bit for the permission to be processed
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Get player ID after permission
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
        console.log('Player ID not available yet')
      }

      // Set external ID (OneSignal best practice)
      if (window.OneSignal?.login && playerId) {
        try {
          await window.OneSignal.login(user.id)
        } catch (loginError) {
          console.log('Could not set external ID')
        }
      }

      // Save player ID to database
      if (playerId) {
        const result = await saveAdminPlayerId(user.id, playerId)
        if (result.success) {
          setIsSubscribed(true)
          toast.success(locale === 'el' ? 'Οι ειδοποιήσεις ενεργοποιήθηκαν!' : 'Notifications enabled!')
        } else {
          toast.error(locale === 'el' ? 'Σφάλμα κατά την αποθήκευση' : 'Error saving player ID')
        }
      } else if (permissionGranted) {
        // Permission granted but player ID not available yet
        toast.success(locale === 'el' ? 'Η άδεια δόθηκε. Οι ειδοποιήσεις θα ενεργοποιηθούν σύντομα.' : 'Permission granted. Notifications will be enabled shortly.')
        // Re-check status after a delay
        setTimeout(() => {
          checkSubscriptionStatus()
        }, 3000)
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

