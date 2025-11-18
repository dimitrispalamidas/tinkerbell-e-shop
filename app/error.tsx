'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error)
    }
    // In production, you could send to error tracking service
    // Example: Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-sage-50/10 to-cream-50/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-2 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Κάτι πήγε στραβά</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Προέκυψε ένα σφάλμα. Παρακαλώ δοκιμάστε ξανά.
          </p>
          
          {error.digest && (
            <div className="text-xs text-muted-foreground text-center font-mono bg-muted p-2 rounded">
              Error ID: {error.digest}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={reset}
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Δοκίμασε ξανά
            </Button>
            <Button
              asChild
              className="flex-1"
              variant="outline"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Αρχική Σελίδα
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

