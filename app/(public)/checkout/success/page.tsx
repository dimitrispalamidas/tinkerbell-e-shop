"use client"

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Mail, Phone } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

export default function CheckoutSuccess() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const { width, height } = useWindowSize();

  useEffect(() => {
    // Always clear cart when user reaches success page
    clearCart();

    const tParam = searchParams.get('t');
    const orderRef = searchParams.get('orderCode') || searchParams.get('OrderCode');
    setTransactionId(tParam);
    setOrderCode(orderRef);

    const timer = setTimeout(() => setShowConfetti(true), 300);
    return () => clearTimeout(timer);
  }, [searchParams, clearCart]);

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

      <div className="container max-w-4xl mx-auto px-4 py-6 md:py-16">
        {/* Success Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="mx-auto mb-6 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center shadow-lg relative">
            <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping" />
            <CheckCircle className="w-12 h-12 md:w-14 md:h-14 text-green-600 relative z-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-green-700 mb-3">
            {locale === 'el' ? 'Επιτυχής Παραγγελία!' : 'Order Successful!'}
          </h1>
          <p className="text-lg md:text-xl text-foreground mb-2">
            {locale === 'el'
              ? 'Ευχαριστούμε για την παραγγελία σας!'
              : 'Thank you for your order!'}
          </p>
          <p className="text-sm text-muted-foreground">
            {locale === 'el' 
              ? 'Η παραγγελία σας καταχωρήθηκε και θα λάβετε email επιβεβαίωσης σύντομα.' 
              : 'Your order has been placed and you will receive a confirmation email shortly.'}
          </p>
        </div>

      {/* Order Details Card */}
      <Card className="mb-6 border-2 shadow-sm">
        <CardHeader className="p-5 md:p-7 bg-muted/30 border-b">
          <CardTitle className="text-xl md:text-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            {locale === 'el' ? 'Στοιχεία Παραγγελίας' : 'Order Details'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 md:p-7 space-y-5">
          {orderCode ? (
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-primary">#</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                  {locale === 'el' ? 'Κωδικός Παραγγελίας' : 'Order Code'}
                </p>
                <p className="text-base md:text-lg font-mono font-semibold text-foreground break-all">
                  {orderCode}
                </p>
              </div>
            </div>
          ) : null}

          {transactionId ? (
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                  {locale === 'el' ? 'Κωδικός Συναλλαγής' : 'Transaction ID'}
                </p>
                <p className="text-base md:text-lg font-mono font-semibold text-foreground break-all">
                  {transactionId}
                </p>
              </div>
            </div>
          ) : null}

          <p className="text-sm text-muted-foreground leading-relaxed">
            {locale === 'el'
              ? 'Ένα email επιβεβαίωσης με τα στοιχεία της παραγγελίας στάλθηκε στο inbox σας. Κρατήστε τον κωδικό παραγγελίας για το ιστορικό σας.'
              : 'A confirmation email with your order details has been sent to your inbox. Keep the order code for your records.'}
          </p>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="mb-6 border-2 shadow-sm bg-gradient-to-r from-blue-50 to-blue-50/50">
        <CardContent className="p-5 md:p-7">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-blue-900 mb-2">
                {locale === 'el' ? 'Τι ακολουθεί;' : 'What\'s next?'}
              </h3>
              <p className="text-sm md:text-base text-blue-800 leading-relaxed">
                {locale === 'el' 
                  ? 'Επεξεργαζόμαστε την παραγγελία σας και θα σας στείλουμε ενημερώσεις μέσω email. Θα ειδοποιηθείτε όταν η παραγγελία σας αποσταλεί.' 
                  : 'We\'re processing your order and will send you shipping updates via email. You\'ll be notified when your order ships.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Button
        onClick={() => router.push('/shop')}
        size="lg"
        className="w-full mb-8 md:mb-10 shadow-sm hover:shadow-md transition-all group"
      >
        {locale === 'el' ? 'Συνέχεια Αγορών' : 'Continue Shopping'}
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Button>

      {/* Contact Information */}
      <Card className="border-2 shadow-sm mb-6">
        <CardContent className="p-5 md:p-7">
          <div className="text-center space-y-4">
            <h3 className="font-bold text-lg text-foreground">
              {locale === 'el' ? 'Χρειάζεστε βοήθεια;' : 'Need help?'}
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a 
                href="mailto:tinkerbellkalamatas@gmail.com" 
                className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors font-medium"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">tinkerbellkalamatas@gmail.com</span>
              </a>
              <a 
                href="tel:+302721406303" 
                className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors font-medium"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">2721 406303</span>
              </a>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              © 2025 Tinkerbell. {locale === 'el' ? 'Με επιφύλαξη παντός δικαιώματος.' : 'All rights reserved.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}

