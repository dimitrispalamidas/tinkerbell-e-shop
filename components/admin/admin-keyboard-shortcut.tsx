"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Keyboard shortcut component for admin login
 * Press Ctrl+Shift+A (or Cmd+Shift+A on Mac) to navigate to admin login
 */
export function AdminKeyboardShortcut() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+A (Windows/Linux) or Cmd+Shift+A (Mac)
      const isModifierPressed = event.ctrlKey || event.metaKey
      const isShiftPressed = event.shiftKey
      const isAKey = event.key === 'a' || event.key === 'A'

      if (isModifierPressed && isShiftPressed && isAKey) {
        // Prevent default browser behavior
        event.preventDefault()
        
        // Navigate to admin login
        router.push('/admin-login')
      }
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [router])

  // This component doesn't render anything
  return null
}

