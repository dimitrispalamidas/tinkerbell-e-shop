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

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
      <Card className="max-w-4xl mx-auto shadow-2xl border-2">
        <div className="p-5 md:p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Cookie className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">
                  {locale === 'el' ? '🍪 Χρήση Cookies' : '🍪 Cookie Usage'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {locale === 'el' 
                    ? 'Χρησιμοποιούμε απαραίτητα cookies και τοπική αποθήκευση (localStorage) για τη βασική λειτουργία της ιστοσελίδας: καλάθι αγορών, γλώσσα, διατήρηση φόρμας checkout. ΔΕΝ χρησιμοποιούμε cookies παρακολούθησης, analytics ή διαφήμισης. Χωρίς αυτά, το καλάθι και άλλες λειτουργίες δεν θα δουλεύουν.'
                    : 'We use essential cookies and local storage (localStorage) for basic website functionality: shopping cart, language, checkout form persistence. We do NOT use tracking, analytics or advertising cookies. Without these, the cart and other features will not work.'}
                </p>
                <Link 
                  href={locale === 'el' ? '/el/privacy-policy' : '/en/privacy-policy'}
                  className="text-xs text-primary hover:underline inline-block mt-2"
                >
                  {locale === 'el' ? 'Διαβάστε την Πολιτική Απορρήτου →' : 'Read Privacy Policy →'}
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleAccept}
                  size="sm"
                  className="flex-1 sm:flex-initial"
                >
                  {locale === 'el' ? 'Αποδοχή' : 'Accept'}
                </Button>
                <Button 
                  onClick={handleReject}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-initial"
                >
                  {locale === 'el' ? 'Απόρριψη' : 'Reject'}
                </Button>
              </div>
            </div>

            <button
              onClick={handleReject}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

