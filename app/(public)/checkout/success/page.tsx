"use client"

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';

export default function CheckoutSuccess() {
  const t = useTranslations('checkout');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get Viva order parameters from URL
    const s = searchParams.get('s'); // Status: 1 = success, 0 = failed
    const t = searchParams.get('t'); // Transaction ID
    const orderRef = searchParams.get('orderCode'); // Order Code
    
    if (s === '1' && orderRef) {
      setOrderCode(orderRef);
      // Clear the cart after successful payment
      clearCart();
    }
    
    setIsLoading(false);
  }, [searchParams, clearCart]);

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  if (!orderCode) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {locale === 'el' ? 'Δεν βρέθηκαν πληροφορίες πληρωμής.' : 'No payment information found.'}
              </p>
              <Button onClick={() => router.push('/shop')}>
                {locale === 'el' ? 'Επιστροφή στο Κατάστημα' : 'Back to Shop'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 md:py-16">
      <Card className="border-green-200 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl md:text-3xl text-green-700">
            {locale === 'el' ? 'Επιτυχής Παραγγελία!' : 'Order Successful!'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg text-gray-700">
              {locale === 'el' ? 'Σας ευχαριστούμε για την παραγγελία σας!' : 'Thank you for your order!'}
            </p>
            <p className="text-gray-600">
              {locale === 'el' 
                ? 'Ένα email επιβεβαίωσης έχει σταλεί στη διεύθυνση email σας.' 
                : 'A confirmation email has been sent to your email address.'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-5 h-5 text-pink-500" />
              <span className="font-medium">
                {locale === 'el' ? 'Κωδικός Παραγγελίας' : 'Order Code'}:
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 font-mono break-all pl-7">
              {orderCode}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>{locale === 'el' ? 'Τι ακολουθεί;' : 'What\'s next?'}</strong>
              <br />
              {locale === 'el' 
                ? 'Επεξεργαζόμαστε την παραγγελία σας και θα σας στείλουμε ενημερώσεις μέσω email.' 
                : 'We\'re processing your order and will send you shipping updates via email.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => router.push('/shop')}
              className="flex-1 bg-pink-500 hover:bg-pink-600"
            >
              {locale === 'el' ? 'Συνέχεια Αγορών' : 'Continue Shopping'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          {locale === 'el' ? 'Χρειάζεστε βοήθεια;' : 'Need help?'}{' '}
          <a href="/contact" className="text-pink-500 hover:underline">
            {locale === 'el' ? 'Επικοινωνήστε μαζί μας' : 'Contact us'}
          </a>
        </p>
      </div>
    </div>
  );
}

