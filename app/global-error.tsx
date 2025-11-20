'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log critical error
    console.error('Global application error:', error)
    // Capture error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="el">
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full text-center space-y-4">
            <h1 className="text-2xl font-bold">Σφάλμα Εφαρμογής</h1>
            <p className="text-muted-foreground">
              Προέκυψε ένα κρίσιμο σφάλμα. Παρακαλώ ανανεώστε τη σελίδα.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Ανανέωση Σελίδας
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

