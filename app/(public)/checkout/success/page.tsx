"use client"

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { createClient } from '@/lib/supabase/client';

type OrderData = {
  id: string;
  viva_order_code: string;
  total: number;
  customer_name: string;
  customer_email: string;
  status: string;
  payment_status: string;
  created_at: string;
  boxnow_tracking_code?: string;
};

export default function CheckoutSuccess() {
  const t = useTranslations('checkout');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchLatestOrder() {
      try {
        // Get all possible parameters from URL
        const s = searchParams.get('s');
        const t = searchParams.get('t');
        const orderRef = searchParams.get('orderCode') || searchParams.get('OrderCode');
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
        
        const supabase = createClient();
        
        // Try to find order by different methods
        let order = null;
        
        // Method 1: Try to find by Viva order code from URL
        if (orderRef) {
          console.log('🔍 Searching for order by orderCode:', orderRef);
          const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('viva_order_code', orderRef)
            .single();
          order = data;
        }
        
        // Method 2: Try to find by transaction ID
        if (!order && t) {
          console.log('🔍 Searching for order by transaction ID:', t);
          const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('viva_transaction_id', t)
            .single();
          order = data;
        }
        
        // Method 3: Get the latest paid order (fallback)
        if (!order) {
          console.log('🔍 Fetching latest paid order as fallback');
          const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('payment_status', 'paid')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          order = data;
        }
        
        if (order) {
          console.log('✅ Order found:', order.id);
          setOrderData(order);
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
              {locale === 'el' 
                ? `Ευχαριστούμε ${orderData.customer_name}!` 
                : `Thank you ${orderData.customer_name}!`}
            </p>
            <p className="text-gray-600">
              {locale === 'el' 
                ? `Ένα email επιβεβαίωσης έχει σταλεί στο ${orderData.customer_email}` 
                : `A confirmation email has been sent to ${orderData.customer_email}`}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <Package className="w-5 h-5 text-pink-500 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium block mb-1">
                  {locale === 'el' ? 'Κωδικός Παραγγελίας' : 'Order Code'}:
                </span>
                <p className="text-xs md:text-sm text-gray-600 font-mono break-all">
                  {orderData.viva_order_code}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {locale === 'el' ? 'Σύνολο' : 'Total'}:
                </span>
                <span className="font-semibold text-lg">
                  €{orderData.total.toFixed(2)}
                </span>
              </div>
            </div>
            
            {orderData.boxnow_tracking_code && (
              <div className="border-t pt-3">
                <div className="text-sm">
                  <span className="text-gray-600 block mb-1">
                    {locale === 'el' ? 'Κωδικός Παρακολούθησης BOXNOW' : 'BOXNOW Tracking Code'}:
                  </span>
                  <span className="font-mono text-xs text-gray-800">
                    {orderData.boxnow_tracking_code}
                  </span>
                </div>
              </div>
            )}
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

