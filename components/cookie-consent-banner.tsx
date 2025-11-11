"use client"

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Cookie } from 'lucide-react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'tinkerbell_cookie_consent';

export function CookieConsentBanner() {
  const locale = useLocale();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a small delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <Card className="mx-auto max-w-lg rounded-xl border border-border/60 bg-background/95 shadow-xl shadow-black/10 backdrop-blur-md">
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/15">
              <Cookie className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold sm:text-lg">
              {locale === 'el' ? '🍪 Χρήση Cookies' : '🍪 Cookie Usage'}
            </h3>
            <button
              onClick={handleDismiss}
              className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
              type="button"
              aria-label={locale === 'el' ? 'Κλείσιμο banner cookies' : 'Close cookie banner'}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              {locale === 'el'
                ? 'Χρησιμοποιούμε απαραίτητα cookies και τοπική αποθήκευση (localStorage) μόνο για τη βασική λειτουργία της ιστοσελίδας: καλάθι αγορών, γλώσσα, διατήρηση φόρμας checkout. ΔΕΝ χρησιμοποιούμε cookies παρακολούθησης, analytics ή διαφήμισης.'
                : 'We use essential cookies and local storage (localStorage) solely for basic website functionality: shopping cart, language, checkout form persistence. We do NOT use tracking, analytics, or advertising cookies.'}
            </p>
            <p className="text-xs text-muted-foreground/80">
              {locale === 'el'
                ? 'Χωρίς αυτά, το καλάθι και άλλες βασικές λειτουργίες δεν θα λειτουργούν όπως πρέπει.'
                : 'Without them, the cart and other core features will not work as expected.'}
            </p>
            <Link
              href="/privacy-policy"
              className="inline-flex text-xs font-medium text-primary underline-offset-4 transition hover:underline"
            >
              {locale === 'el' ? 'Διαβάστε την Πολιτική Απορρήτου' : 'Read the Privacy Policy'}
            </Link>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              onClick={handleAccept}
              size="sm"
              className="w-full sm:w-auto"
              type="button"
              aria-label={locale === 'el' ? 'Αποδοχή cookies' : 'Accept cookies'}
            >
              {locale === 'el' ? 'Αποδοχή' : 'Accept'}
            </Button>
            <Button
              onClick={handleReject}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              type="button"
              aria-label={locale === 'el' ? 'Απόρριψη cookies' : 'Reject cookies'}
            >
              {locale === 'el' ? 'Απόρριψη' : 'Reject'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

