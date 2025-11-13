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
    const consentCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${COOKIE_CONSENT_KEY}=`));

    if (!consentCookie) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    document.cookie = `${COOKIE_CONSENT_KEY}=accepted; path=/; max-age=31536000; SameSite=Lax`;
    setShowBanner(false);
  };

  const handleReject = () => {
    document.cookie = `${COOKIE_CONSENT_KEY}=rejected; path=/; max-age=31536000; SameSite=Lax`;
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
                ? 'Χρησιμοποιούμε μόνο τα απολύτως απαραίτητα cookies ώστε το κατάστημα να λειτουργεί ομαλά.'
                : 'We only use essential cookies so the shop works smoothly.'}
            </p>
            <p className="text-xs text-muted-foreground/80">
              {locale === 'el'
                ? 'Δεν τοποθετούμε cookies analytics, διαφήμισης ή άλλης παρακολούθησης.'
                : 'We do not set analytics, advertising, or tracking cookies.'}
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

