"use client"

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader2, Mail, Phone } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { getOrderByVivaCode, getOrderByTransactionId, getLatestPaidOrder, type OrderData } from '@/lib/actions/get-order';
import { formatPrice } from '@/lib/utils';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

export default function CheckoutSuccess() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    async function fetchLatestOrder() {
      try {
        // Get all possible parameters from URL
        const s = searchParams.get('s'); // Status
        const t = searchParams.get('t'); // Transaction ID
        const orderRef = searchParams.get('orderCode') || searchParams.get('OrderCode'); // Order Code
        const eventId = searchParams.get('eventId');
        
        console.log('🔍 Success page URL parameters:', {
          s,
          t,
          orderRef,
          eventId,
          allParams: Object.fromEntries(searchParams.entries())
        });
        
        // Always clear cart when user reaches success page
        clearCart();
        
        // Try to find order by different methods using server actions
        let order: OrderData | null = null;
        
        // Method 1: Try to find by Viva order code from URL
        if (orderRef) {
          console.log('🔍 Searching for order by orderCode:', orderRef);
          order = await getOrderByVivaCode(orderRef);
        }
        
        // Method 2: Try to find by transaction ID
        if (!order && t) {
          console.log('🔍 Searching for order by transaction ID:', t);
          order = await getOrderByTransactionId(t);
        }
        
        // Method 3: Get the latest paid order (fallback)
        if (!order) {
          console.log('🔍 Fetching latest paid order as fallback');
          order = await getLatestPaidOrder();
        }
        
        if (order) {
          console.log('✅ Order found:', order.id);
          setOrderData(order);
          // Trigger confetti after a short delay
          setTimeout(() => setShowConfetti(true), 300);
        } else {
          console.log('❌ No order found');
          setError(true);
        }
      } catch (err) {
        console.error('❌ Error fetching order:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLatestOrder();
  }, [searchParams, clearCart]);

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-foreground">
              {locale === 'el' ? 'Φόρτωση πληροφοριών παραγγελίας...' : 'Loading order information...'}
            </p>
            <p className="text-sm text-muted-foreground">
              {locale === 'el' ? 'Παρακαλώ περιμένετε' : 'Please wait'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <Card className="border-2 shadow-lg">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Mail className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-bold">{locale === 'el' ? 'Παραγγελία Καταχωρημένη' : 'Order Recorded'}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {locale === 'el' 
                    ? 'Δεν βρέθηκαν πληροφορίες παραγγελίας. Αν ολοκληρώσατε την πληρωμή, θα λάβετε email επιβεβαίωσης.' 
                    : 'Order information not found. If you completed the payment, you will receive a confirmation email.'}
                </p>
              </div>
              <Button 
                onClick={() => router.push('/shop')} 
                size="lg"
                className="shadow-sm hover:shadow-md transition-all group"
              >
                {locale === 'el' ? 'Επιστροφή στο Κατάστημα' : 'Back to Shop'}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              ? <>Ευχαριστούμε <span className="font-bold text-primary">{orderData.customer_name}</span> για την παραγγελία σας!</>
              : <>Thank you <span className="font-bold text-primary">{orderData.customer_name}</span> for your order!</>}
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
          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-primary">#</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                {locale === 'el' ? 'Κωδικός Παραγγελίας' : 'Order Code'}
              </p>
              <p className="text-base md:text-lg font-mono font-semibold text-foreground break-all">
                {orderData.viva_order_code}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Email</p>
              <a 
                href={`mailto:${orderData.customer_email}`} 
                className="text-base md:text-lg font-semibold text-primary hover:text-primary/80 break-all transition-colors"
              >
                {orderData.customer_email}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      {orderData.items && orderData.items.length > 0 && (
        <Card className="mb-6 border-2 shadow-sm">
          <CardHeader className="p-5 md:p-7 bg-muted/30 border-b">
            <CardTitle className="text-xl md:text-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              {locale === 'el' ? 'Προϊόντα Παραγγελίας' : 'Order Products'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 md:p-7 space-y-4">
            <div className="space-y-3">
              {orderData.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-start gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm md:text-base text-foreground mb-2">{item.product_name}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {item.size && (
                        <span className="px-2 py-0.5 bg-background rounded font-medium">
                          {locale === 'el' ? 'Μέγεθος' : 'Size'}: {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="px-2 py-0.5 bg-background rounded font-medium">
                          {locale === 'el' ? 'Χρώμα' : 'Color'}: {item.color}
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-background rounded font-medium">
                        {locale === 'el' ? 'Ποσότητα' : 'Qty'}: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <p className="font-bold text-sm md:text-base text-foreground whitespace-nowrap">
                    {formatPrice(item.price * item.quantity, locale)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="border-t-2 pt-4 mt-2">
              <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                <span className="font-bold text-lg md:text-xl text-foreground">
                  {locale === 'el' ? 'Σύνολο' : 'Total'}
                </span>
                <span className="font-bold text-xl md:text-2xl text-primary">
                  {formatPrice(orderData.total, locale)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

