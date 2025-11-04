"use client"

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, createOrder } from '@/lib/actions/stripe';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { BoxnowLockerList } from '@/components/checkout/boxnow-locker-list';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const t = useTranslations('checkout');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (err) {
      toast.error(locale === 'el' ? 'Σφάλμα πληρωμής' : 'Payment error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="text-center py-16">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('order_complete')}</h2>
        <p className="text-muted-foreground mb-4">{t('thank_you')}</p>
        <p className="text-sm text-muted-foreground mb-8">
          {t('order_number')}: {orderId}
        </p>
        <Button onClick={() => router.push('/')}>
          {locale === 'el' ? 'Επιστροφή στην Αρχική' : 'Back to Home'}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || isProcessing}
      >
        {isProcessing 
          ? (locale === 'el' ? 'Επεξεργασία...' : 'Processing...') 
          : t('place_order')}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  
  const { items, getTotal, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [clientSecret, setClientSecret] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    boxnowLockerId: '',
    boxnowLockerAddress: '',
    boxnowLockerPostalCode: '',
  });

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const handleContinue = async () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error(locale === 'el' ? 'Συμπληρώστε όλα τα πεδία' : 'Fill all fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.boxnowLockerId) {
        toast.error(locale === 'el' ? 'Επιλέξτε locker' : 'Select a locker');
        return;
      }
      
      // Create payment intent and order
      try {
        const orderData = {
          items: items.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color,
            product_name: item.name,
          })),
          total: getTotal(),
          customer_email: formData.email,
          customer_name: formData.name,
          customer_phone: formData.phone,
          shipping_address: {
            name: formData.name,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            country: 'GR',
            phone: formData.phone,
          },
          boxnow_locker_id: formData.boxnowLockerId,
        };

        // Create payment intent first
        const { clientSecret } = await createPaymentIntent(getTotal(), orderData);
        
        if (!clientSecret) {
          throw new Error('Failed to create payment intent');
        }
        
        // Extract payment intent ID from client secret
        const paymentIntentId = clientSecret.split('_secret_')[0];
        
        // Create order in database
        await createOrder({
          ...orderData,
          stripe_payment_intent_id: paymentIntentId,
        });

        setClientSecret(clientSecret);
        setStep(3);
      } catch (error) {
        console.error('Checkout error:', error);
        toast.error(locale === 'el' ? 'Σφάλμα' : 'Error');
      }
    }
  };

  if (items.length === 0) {
    return null;
  }

  const total = getTotal();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('checkout')}</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('shipping_info')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{tCommon('name')}</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{tCommon('email')}</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{tCommon('phone')}</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('delivery_method')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Custom Locker List using Stage API */}
                  <BoxnowLockerList
                    selectedLockerId={formData.boxnowLockerId}
                    onSelectLocker={(locker) => {
                      setFormData(prev => ({
                        ...prev,
                        boxnowLockerId: locker.id,
                        boxnowLockerAddress: locker.addressLine1,
                        boxnowLockerPostalCode: locker.postalCode,
                      }));
                      
                      toast.success(
                        locale === 'el' 
                          ? `Επιλέξατε: ${locker.title || locker.name}` 
                          : `Selected: ${locker.title || locker.name}`
                      );
                    }}
                    locale={locale}
                  />
                </CardContent>
              </Card>
            )}

            {step === 3 && clientSecret && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('payment')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm />
                  </Elements>
                </CardContent>
              </Card>
            )}

            {step < 3 && (
              <div className="flex gap-4">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {tCommon('back')}
                  </Button>
                )}
                <Button onClick={handleContinue} className="flex-1">
                  {tCommon('continue')}
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>{t('order_summary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {item.quantity} × {item.name}
                      </span>
                      <span>{formatPrice(item.price * item.quantity, locale)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{tCommon('total')}</span>
                    <span className="text-primary">{formatPrice(total, locale)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

