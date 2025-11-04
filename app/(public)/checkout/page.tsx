"use client"

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { BoxnowLockerList } from '@/components/checkout/boxnow-locker-list';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  
  const { items, getTotal, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  
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
      setStep(3);
    }
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Import the Viva Wallet actions dynamically
      const { createVivaPaymentOrder, createOrder } = await import('@/lib/actions/viva-wallet');

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

      // Create Viva payment order
      const { orderCode, checkoutUrl } = await createVivaPaymentOrder({
        amount: getTotal(),
        orderId: `TMP-${Date.now()}`, // Temporary ID
        customerEmail: formData.email,
        customerName: formData.name,
        customerPhone: formData.phone,
      });

      // Create order in database
      const order = await createOrder({
        ...orderData,
        viva_order_code: orderCode,
      });

      console.log('Order created:', order.id);
      console.log('Viva Order Code:', orderCode);

      // Redirect to Viva checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(locale === 'el' ? 'Σφάλμα κατά τη δημιουργία πληρωμής' : 'Error creating payment');
      setIsProcessing(false);
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);

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

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('payment')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">
                      {locale === 'el' ? 'Ασφαλής Πληρωμή με Viva Wallet' : 'Secure Payment with Viva Wallet'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {locale === 'el' 
                        ? 'Θα ανακατευθυνθείτε στη σελίδα πληρωμής της Viva Wallet για να ολοκληρώσετε την παραγγελία σας με ασφάλεια.' 
                        : 'You will be redirected to Viva Wallet secure payment page to complete your order.'}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{locale === 'el' ? 'Ασφαλής κρυπτογράφηση' : 'Secure encryption'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{locale === 'el' ? 'Υποστήριξη όλων των καρτών' : 'All cards supported'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{locale === 'el' ? 'Δόσεις διαθέσιμες' : 'Installments available'}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    size="lg"
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing 
                      ? (locale === 'el' ? 'Επεξεργασία...' : 'Processing...') 
                      : (locale === 'el' ? 'Συνέχεια στην Πληρωμή' : 'Continue to Payment')}
                  </Button>
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

