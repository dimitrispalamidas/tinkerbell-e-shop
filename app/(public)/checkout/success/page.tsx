"use client"

import { useEffect, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Mail } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

export default function CheckoutSuccess() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  const { width, height } = useWindowSize();

  const orderCode = useMemo(() => {
    return (
      searchParams.get('orderCode') ||
      searchParams.get('OrderCode') ||
      searchParams.get('s') ||
      searchParams.get('S')
    );
  }, [searchParams]);

  const showConfetti = useMemo(() => Boolean(orderCode), [orderCode]);

  useEffect(() => {
    // Always clear cart when user reaches success page
    clearCart();

  }, [clearCart]);

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
          colors={['#ffb3d9', '#FFC700', '#FF6EC7', '#bb0000', '#00bb00', '#ffffff']}
        />
      )}

      <div className="container max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Success Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="mx-auto mb-6 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center shadow-lg relative">
            <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping" />
            <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-600 relative z-10" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            {locale === 'el' ? 'Η παραγγελία σας ολοκληρώθηκε!' : 'Order Completed!'}
          </h1>
          {orderCode && (
            <div className="mt-4 mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {locale === 'el' ? 'Αριθμός Παραγγελίας' : 'Order Number'}
              </p>
              <p className="text-lg md:text-xl font-mono font-semibold text-foreground">
                {orderCode}
              </p>
            </div>
          )}
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto mt-4">
            {locale === 'el'
              ? 'Θα λάβετε email επιβεβαίωσης με όλες τις λεπτομέρειες.'
              : 'You\'ll receive a confirmation email with all the details.'}
          </p>
        </div>

      {/* Next Steps - Simplified */}
      <div className="mb-8 p-4 md:p-6 bg-muted/30 rounded-lg border">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm md:text-base text-foreground">
              {locale === 'el' 
                ? 'Θα σας ενημερώσουμε μέσω email για την κατάσταση της αποστολής σας.' 
                : 'We\'ll email you with shipping updates.'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={() => router.push('/shop')}
        size="lg"
        className="w-full mb-6 shadow-sm hover:shadow-md transition-all group"
      >
        {locale === 'el' ? 'Συνέχεια Αγορών' : 'Continue Shopping'}
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Button>

      {/* Thank You Message */}
      <div className="text-center mb-6">
        <p className="text-base md:text-lg text-foreground font-medium">
          {locale === 'el' ? 'Ευχαριστούμε για την προτίμηση σας!' : 'Thank you for choosing us!'}
        </p>
      </div>

      {/* Contact Information - Simplified */}
      <div className="text-center space-y-3 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          {locale === 'el' ? 'Ερωτήσεις;' : 'Questions?'} {' '}
          <a 
            href="mailto:tinkerbellkalamatas@gmail.com" 
            className="text-primary hover:underline font-medium"
          >
            tinkerbellkalamatas@gmail.com
          </a>
          {' '}
          {locale === 'el' ? 'ή' : 'or'}{' '}
          <a 
            href="tel:+302721406303" 
            className="text-primary hover:underline font-medium"
          >
            2721 406303
          </a>
        </p>
      </div>
    </div>
    </>
  );
}

