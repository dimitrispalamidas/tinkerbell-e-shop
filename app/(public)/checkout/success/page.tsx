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
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
          <p className="text-gray-600">
            {locale === 'el' ? 'Φόρτωση πληροφοριών παραγγελίας...' : 'Loading order information...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                {locale === 'el' 
                  ? 'Δεν βρέθηκαν πληροφορίες παραγγελίας. Αν ολοκληρώσατε την πληρωμή, θα λάβετε email επιβεβαίωσης.' 
                  : 'Order information not found. If you completed the payment, you will receive a confirmation email.'}
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

      <div className="container max-w-3xl mx-auto px-4 py-4 md:py-16">
        {/* Success Header */}
      <div className="text-center mb-6 md:mb-8">
        <div className="mx-auto mb-4 w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-green-700 mb-2">
          {locale === 'el' ? 'Επιτυχής Παραγγελία!' : 'Order Successful!'}
        </h1>
        <p className="text-base md:text-lg text-gray-700">
          {locale === 'el' 
            ? <>Ευχαριστούμε <strong>{orderData.customer_name}</strong> για την παραγγελία σας!</>
            : <>Thank you <strong>{orderData.customer_name}</strong> for your order!</>}
        </p>
      </div>

      {/* Order Details Card */}
      <Card className="mb-4 md:mb-6">
        <CardContent className="p-4 md:p-6 space-y-4">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500 uppercase mb-1">
              {locale === 'el' ? 'Κωδικός Παραγγελίας' : 'Order Code'}
            </p>
            <p className="text-sm md:text-base font-mono text-gray-900 break-all">
              {orderData.viva_order_code}
            </p>
          </div>
          
          <div className="border-t pt-4">
            <p className="text-xs md:text-sm font-medium text-gray-500 uppercase mb-1">Email</p>
            <a href={`mailto:${orderData.customer_email}`} className="text-sm md:text-base text-blue-600 hover:underline break-all">
              {orderData.customer_email}
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      {orderData.items && orderData.items.length > 0 && (
        <Card className="mb-4 md:mb-6">
          <CardHeader className="p-4 md:p-6 pb-3">
            <CardTitle className="text-lg md:text-xl">
              {locale === 'el' ? 'Προϊόντα Παραγγελίας' : 'Order Products'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 space-y-3">
            {orderData.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-start gap-3 text-sm">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.product_name}</p>
                  {(item.size || item.color) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {item.size && `${locale === 'el' ? 'Μέγεθος' : 'Size'}: ${item.size}`}
                      {item.size && item.color && ' • '}
                      {item.color && `${locale === 'el' ? 'Χρώμα' : 'Color'}: ${item.color}`}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {locale === 'el' ? 'Ποσότητα' : 'Quantity'}: {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-gray-900 whitespace-nowrap">
                  {formatPrice(item.price * item.quantity, locale)}
                </p>
              </div>
            ))}
            
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-base md:text-lg text-gray-900">
                  {locale === 'el' ? 'Σύνολο' : 'Total'}
                </span>
                <span className="font-bold text-lg md:text-xl text-pink-600">
                  {formatPrice(orderData.total, locale)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="mb-4 md:mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4 md:p-6">
          <p className="text-sm md:text-base text-blue-900">
            <strong className="block mb-2">{locale === 'el' ? 'Τι ακολουθεί;' : 'What\'s next?'}</strong>
            {locale === 'el' 
              ? 'Επεξεργαζόμαστε την παραγγελία σας και θα σας στείλουμε ενημερώσεις μέσω email.' 
              : 'We\'re processing your order and will send you shipping updates via email.'}
          </p>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Button
        onClick={() => router.push('/shop')}
        size="lg"
        className="w-full mb-6 md:mb-8"
      >
        {locale === 'el' ? 'Συνέχεια Αγορών' : 'Continue Shopping'}
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>

      {/* Contact Information */}
      <div className="text-center space-y-2 text-sm text-gray-600 pb-4">
        <p className="font-medium text-gray-700">
          {locale === 'el' ? 'Χρειάζεστε βοήθεια;' : 'Need help?'}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <a href="mailto:tinkerbellkalamatas@gmail.com" className="text-pink-600 hover:text-pink-700 flex items-center gap-1">
            <Mail className="w-4 h-4" />
            tinkerbellkalamatas@gmail.com
          </a>
          <span className="hidden sm:inline text-gray-300">•</span>
          <a href="tel:+302721406303" className="text-pink-600 hover:text-pink-700 flex items-center gap-1">
            <Phone className="w-4 h-4" />
            {locale === 'el' ? 'Τηλέφωνο' : 'Phone'}: 2721 406303
          </a>
        </div>
        <p className="text-xs text-gray-500 pt-2">
          © 2025 Tinkerbell. {locale === 'el' ? 'Με επιφύλαξη παντός δικαιώματος.' : 'All rights reserved.'}
        </p>
      </div>
    </div>
    </>
  );
}

