"use client"

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, ShoppingBag, Package, Home } from 'lucide-react';
import { BoxnowLockerList } from '@/components/checkout/boxnow-locker-list';
import Image from 'next/image';
import { z } from 'zod';

const CHECKOUT_STORAGE_KEY = 'tinkerbell_checkout_data';
const HOME_DELIVERY_COST = 3.50; // €3.50 for home delivery

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const locale = useLocale();
  
  const { items, getTotal } = useCartStore();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    deliveryMethod: 'boxnow' as 'boxnow' | 'home',
    address: '',
    city: '',
    region: '',
    postalCode: '',
    boxnowLockerId: '',
    boxnowLockerAddress: '',
    boxnowLockerPostalCode: '',
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse checkout data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/shop');
    }
  }, [items, router]);

  // Handle cancel from Viva Wallet
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('cancel') === 'true') {
      toast.info(
        locale === 'el' 
          ? 'Η πληρωμή ακυρώθηκε. Μπορείτε να δοκιμάσετε ξανά.' 
          : 'Payment was cancelled. You can try again.'
      );
      // Remove cancel parameter from URL
      window.history.replaceState({}, '', window.location.pathname);
      // Stay on step 3 so user can try payment again
      setStep(3);
    }
  }, [locale]);

  const validateEmail = (email: string): boolean => {
    // Using Zod for more robust email validation
    return z.email().safeParse(email).success;
  };

  const validatePhone = (phone: string): boolean => {
    // Greek phone: 10 digits starting with 2 or 6
    const phoneRegex = /^[26]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validatePostalCode = (postalCode: string): boolean => {
    // Greek postal code: 5 digits
    const postalRegex = /^\d{5}$/;
    return postalRegex.test(postalCode.replace(/\s/g, ''));
  };

  const validateAddress = (address: string): boolean => {
    // Address must contain at least one number (street number)
    const hasNumber = /\d/.test(address);
    return hasNumber && address.trim().length > 0;
  };

  const validateCity = (city: string): boolean => {
    // City must be at least 2 characters and contain letters (not just numbers/symbols)
    const trimmed = city.trim();
    const hasLetters = /[a-zA-Zα-ωΑ-Ωά-ώΆ-Ώ]/.test(trimmed);
    return trimmed.length >= 2 && hasLetters;
  };

  const validateRegion = (region: string): boolean => {
    // Region must be at least 2 characters and contain letters (not just numbers/symbols)
    const trimmed = region.trim();
    const hasLetters = /[a-zA-Zα-ωΑ-Ωά-ώΆ-Ώ]/.test(trimmed);
    return trimmed.length >= 2 && hasLetters;
  };

  const handleContinue = async () => {
    if (step === 1) {
      // Validate customer info - check required fields
      const newErrors: Record<string, boolean> = {};
      
      if (!formData.firstName) newErrors.firstName = true;
      if (!formData.lastName) newErrors.lastName = true;
      if (!formData.email) newErrors.email = true;
      if (!formData.phone) newErrors.phone = true;

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error(t('fill_all_fields'));
        return;
      }

      // Validate email and phone formats
      const formatErrors: Record<string, boolean> = {};
      
      if (!validateEmail(formData.email)) {
        formatErrors.email = true;
      }

      const cleanPhone = formData.phone.replace(/\s/g, '');
      if (!validatePhone(cleanPhone)) {
        formatErrors.phone = true;
      }
      
      if (Object.keys(formatErrors).length > 0) {
        setErrors({ ...errors, ...formatErrors });
        toast.error(locale === 'el' ? 'Παρακαλώ διορθώστε τα σφάλματα στη φόρμα' : 'Please correct the errors in the form');
        return;
      }

      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2) {
      // Validate delivery method
      if (!formData.deliveryMethod) {
        toast.error(t('select_delivery_method'));
        return;
      }

      // Validate based on delivery method
      if (formData.deliveryMethod === 'boxnow') {
        if (!formData.boxnowLockerId) {
          toast.error(locale === 'el' ? 'Επιλέξτε locker' : 'Select a locker');
          return;
        }
      } else if (formData.deliveryMethod === 'home') {
        const addressErrors: Record<string, boolean> = {};
        
        if (!formData.address) addressErrors.address = true;
        if (!formData.city) addressErrors.city = true;
        if (!formData.region) addressErrors.region = true;
        if (!formData.postalCode) addressErrors.postalCode = true;

        if (Object.keys(addressErrors).length > 0) {
          setErrors({ ...errors, ...addressErrors });
          toast.error(t('fill_address_fields'));
          return;
        }
        
        // Validate all fields
        const fieldErrors: Record<string, boolean> = {};
        
        if (!validateAddress(formData.address)) {
          fieldErrors.address = true;
        }
        
        if (!validateCity(formData.city)) {
          fieldErrors.city = true;
        }
        
        if (!validateRegion(formData.region)) {
          fieldErrors.region = true;
        }
        
        if (!validatePostalCode(formData.postalCode)) {
          fieldErrors.postalCode = true;
        }
        
        if (Object.keys(fieldErrors).length > 0) {
          setErrors({ ...errors, ...fieldErrors });
          toast.error(locale === 'el' ? 'Παρακαλώ διορθώστε τα σφάλματα στη φόρμα' : 'Please correct the errors in the form');
          return;
        }
      }

      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // STEP 1: Validate cart stock before payment
      console.log('🔐 [Security] Validating cart stock...');
      const { validateCartStock } = await import('@/lib/actions/validate-cart');
      
      const validation = await validateCartStock(items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
      })));

      if (!validation.valid) {
        console.error('❌ [Security] Cart validation failed:', validation.errors);
        
        // Show detailed error messages to user
        const errorMessages = validation.errors.map(err => {
          const itemInfo = `${err.productName}${err.size ? ` (${err.size}${err.color ? `, ${err.color}` : ''})` : ''}`;
          
          if (err.issue === 'product_not_found') {
            return locale === 'el' 
              ? `❌ ${itemInfo}: Το προϊόν δεν υπάρχει πλέον`
              : `❌ ${itemInfo}: Product no longer exists`;
          } else if (err.issue === 'variant_not_found') {
            return locale === 'el'
              ? `❌ ${itemInfo}: Αυτή η παραλλαγή δεν είναι διαθέσιμη`
              : `❌ ${itemInfo}: This variant is not available`;
          } else if (err.issue === 'no_stock') {
            return locale === 'el'
              ? `❌ ${itemInfo}: Εξαντλήθηκε`
              : `❌ ${itemInfo}: Out of stock`;
          } else if (err.issue === 'insufficient_stock') {
            return locale === 'el'
              ? `⚠️ ${itemInfo}: Ζητήθηκαν ${err.requestedQuantity}, διαθέσιμα ${err.availableStock}`
              : `⚠️ ${itemInfo}: Requested ${err.requestedQuantity}, available ${err.availableStock}`;
          }
          return '';
        }).filter(Boolean);

        // Show all errors
        errorMessages.forEach(msg => toast.error(msg, { duration: 6000 }));
        
        // Main error message
        toast.error(
          locale === 'el'
            ? 'Παρακαλώ ενημερώστε το καλάθι σας και δοκιμάστε ξανά'
            : 'Please update your cart and try again',
          { duration: 8000 }
        );
        
        setIsProcessing(false);
        return;
      }

      console.log('✅ [Security] Cart validation passed');

      // STEP 2: Continue with payment if validation passed
      // Import the Viva Wallet actions dynamically
      const { createVivaPaymentOrder, createOrder } = await import('@/lib/actions/viva-wallet');

      const subtotal = getTotal();
      const shippingCost = formData.deliveryMethod === 'home' ? HOME_DELIVERY_COST : 0;
      const total = subtotal + shippingCost;

      const customerName = `${formData.firstName} ${formData.lastName}`;

      const orderData = {
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
          product_name: item.name,
        })),
        total: total,
        customer_email: formData.email,
        customer_name: customerName,
        customer_phone: formData.phone,
        shipping_address: {
          name: customerName,
          address: formData.deliveryMethod === 'home' ? formData.address : '',
          city: formData.deliveryMethod === 'home' ? formData.city : '',
          postal_code: formData.deliveryMethod === 'home' ? formData.postalCode : formData.boxnowLockerPostalCode,
          region: formData.deliveryMethod === 'home' ? formData.region : '',
          country: 'GR',
          phone: formData.phone,
          delivery_method: formData.deliveryMethod,
          boxnow_locker_address: formData.deliveryMethod === 'boxnow' ? formData.boxnowLockerAddress : undefined,
        },
        boxnow_locker_id: formData.deliveryMethod === 'boxnow' ? formData.boxnowLockerId : undefined,
      };

      // Create Viva payment order
      const { orderCode, checkoutUrl } = await createVivaPaymentOrder({
        amount: total,
        orderId: `TMP-${Date.now()}`,
        customerEmail: formData.email,
        customerName: customerName,
        customerPhone: formData.phone,
      });

      // Create order in database
      const order = await createOrder({
        ...orderData,
        viva_order_code: orderCode,
      });

      console.log('✅ Order created:', order.id);
      console.log('💳 Viva Order Code:', orderCode);

      // Clear localStorage after successful order creation
      localStorage.removeItem(CHECKOUT_STORAGE_KEY);

      // Redirect to Viva checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('❌ Payment error:', error);
      toast.error(locale === 'el' ? 'Σφάλμα κατά τη δημιουργία πληρωμής' : 'Error creating payment');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  const subtotal = getTotal();
  const shippingCost = formData.deliveryMethod === 'home' ? HOME_DELIVERY_COST : 0;
  const total = subtotal + shippingCost;

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">{t('checkout')}</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6 md:mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${
                  step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`w-8 md:w-16 h-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="space-y-4 md:space-y-6">
          {/* STEP 1: Customer Information */}
          {step === 1 && (
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">{t('customer_info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{tCommon('first_name')}</label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => {
                        setFormData({ ...formData, firstName: e.target.value });
                        if (errors.firstName) setErrors({ ...errors, firstName: false });
                      }}
                      required
                      className={`text-base ${errors.firstName ? 'border-red-500' : ''}`}
                      placeholder={locale === 'el' ? 'π.χ. Γιάννης' : 'e.g. John'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{tCommon('last_name')}</label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => {
                        setFormData({ ...formData, lastName: e.target.value });
                        if (errors.lastName) setErrors({ ...errors, lastName: false });
                      }}
                      required
                      className={`text-base ${errors.lastName ? 'border-red-500' : ''}`}
                      placeholder={locale === 'el' ? 'π.χ. Παπαδόπουλος' : 'e.g. Smith'}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{tCommon('email')}</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value.toLowerCase().trim() });
                      if (errors.email) setErrors({ ...errors, email: false });
                    }}
                    onBlur={(e) => {
                      if (e.target.value && !validateEmail(e.target.value)) {
                        setErrors({ ...errors, email: true });
                      }
                    }}
                    required
                    className={`text-base ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {locale === 'el' ? 'Μη έγκυρη διεύθυνση email (π.χ. name@example.com)' : 'Invalid email address (e.g. name@example.com)'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{tCommon('phone')}</label>
                  <p className="text-xs text-muted-foreground mb-2">
                    {locale === 'el' ? 'Κινητό (69...) ή σταθερό (2...)' : 'Mobile (69...) or landline (2...)'}
                  </p>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      // Allow only digits
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phone: value });
                      if (errors.phone) setErrors({ ...errors, phone: false });
                    }}
                    onBlur={(e) => {
                      const cleanPhone = e.target.value.replace(/\s/g, '');
                      if (cleanPhone && !validatePhone(cleanPhone)) {
                        setErrors({ ...errors, phone: true });
                      }
                    }}
                    required
                    maxLength={10}
                    className={`text-base ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    placeholder={locale === 'el' ? 'π.χ. 6912345678' : 'e.g. 6912345678'}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">
                      {locale === 'el' ? 'Μόνο 10 ψηφία, π.χ. 6912345678 ή 2101234567' : 'Only 10 digits, e.g. 6912345678 or 2101234567'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 2: Delivery Method */}
          {step === 2 && (
            <>
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl">{t('choose_delivery')}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-4">
                  {/* Delivery Method Selection */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* BOXNOW Option */}
                    <button
                      onClick={() => setFormData({ ...formData, deliveryMethod: 'boxnow' })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.deliveryMethod === 'boxnow'
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Package className={`h-6 w-6 mt-1 ${formData.deliveryMethod === 'boxnow' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{t('boxnow_locker')}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{t('boxnow_locker_desc')}</p>
                          <span className="text-sm font-medium text-green-600">{t('shipping_cost_free')}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.deliveryMethod === 'boxnow' ? 'border-primary' : 'border-muted'
                        }`}>
                          {formData.deliveryMethod === 'boxnow' && (
                            <div className="w-3 h-3 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Home Delivery Option */}
                    <button
                      onClick={() => setFormData({ ...formData, deliveryMethod: 'home' })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.deliveryMethod === 'home'
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Home className={`h-6 w-6 mt-1 ${formData.deliveryMethod === 'home' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{t('home_delivery')}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{t('home_delivery_desc')}</p>
                          <span className="text-sm font-medium">+{formatPrice(HOME_DELIVERY_COST, locale)}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.deliveryMethod === 'home' ? 'border-primary' : 'border-muted'
                        }`}>
                          {formData.deliveryMethod === 'home' && (
                            <div className="w-3 h-3 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* BOXNOW Locker Selection */}
                  {formData.deliveryMethod === 'boxnow' && (
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-4">{t('select_locker')}</h3>
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
                    </div>
                  )}

                  {/* Home Delivery Address Fields */}
                  {formData.deliveryMethod === 'home' && (
                    <div className="pt-4 border-t space-y-4">
                      <h3 className="font-medium mb-4">{t('shipping_info')}</h3>
                      <div>
                        <label className="block text-sm font-medium mb-2">{tCommon('address')}</label>
                        <Input
                          value={formData.address}
                          onChange={(e) => {
                            setFormData({ ...formData, address: e.target.value });
                            if (errors.address) setErrors({ ...errors, address: false });
                          }}
                          onBlur={(e) => {
                            if (e.target.value && !validateAddress(e.target.value)) {
                              setErrors({ ...errors, address: true });
                            }
                          }}
                          required
                          className={`text-base ${errors.address ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          placeholder={locale === 'el' ? 'π.χ. Αθηνών 15' : 'e.g. Athinas 15'}
                        />
                        {errors.address && (
                          <p className="text-xs text-red-500 mt-1">
                            {locale === 'el' ? 'Η διεύθυνση πρέπει να περιλαμβάνει αριθμό' : 'Address must include a street number'}
                          </p>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">{tCommon('city')}</label>
                          <Input
                            value={formData.city}
                            onChange={(e) => {
                              setFormData({ ...formData, city: e.target.value });
                              if (errors.city) setErrors({ ...errors, city: false });
                            }}
                            onBlur={(e) => {
                              if (e.target.value && !validateCity(e.target.value)) {
                                setErrors({ ...errors, city: true });
                              }
                            }}
                            required
                            className={`text-base ${errors.city ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            placeholder={locale === 'el' ? 'π.χ. Αθήνα' : 'e.g. Athens'}
                          />
                          {errors.city && (
                            <p className="text-xs text-red-500 mt-1">
                              {locale === 'el' ? 'Η πόλη πρέπει να περιέχει τουλάχιστον 2 γράμματα' : 'City must contain at least 2 letters'}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">{tCommon('postal_code')}</label>
                          <Input
                            type="text"
                            value={formData.postalCode}
                            onChange={(e) => {
                              // Allow only digits, max 5
                              const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                              setFormData({ ...formData, postalCode: value });
                              if (errors.postalCode) setErrors({ ...errors, postalCode: false });
                            }}
                            onBlur={(e) => {
                              if (e.target.value && !validatePostalCode(e.target.value)) {
                                setErrors({ ...errors, postalCode: true });
                              }
                            }}
                            required
                            maxLength={5}
                            className={`text-base ${errors.postalCode ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            placeholder="12345"
                          />
                          {errors.postalCode && (
                            <p className="text-xs text-red-500 mt-1">
                              {locale === 'el' ? 'Μόνο 5 ψηφία, π.χ. 12345' : 'Only 5 digits, e.g. 12345'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{tCommon('region')}</label>
                        <Input
                          value={formData.region}
                          onChange={(e) => {
                            setFormData({ ...formData, region: e.target.value });
                            if (errors.region) setErrors({ ...errors, region: false });
                          }}
                          onBlur={(e) => {
                            if (e.target.value && !validateRegion(e.target.value)) {
                              setErrors({ ...errors, region: true });
                            }
                          }}
                          required
                          className={`text-base ${errors.region ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          placeholder={locale === 'el' ? 'π.χ. Αττική' : 'e.g. Attica'}
                        />
                        {errors.region && (
                          <p className="text-xs text-red-500 mt-1">
                            {locale === 'el' ? 'Η περιοχή πρέπει να περιέχει τουλάχιστον 2 γράμματα' : 'Region must contain at least 2 letters'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* STEP 3: Payment */}
          {step === 3 && (
            <>
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl">{t('payment')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
                  <div className="bg-muted p-3 md:p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-sm md:text-base">
                      {locale === 'el' ? 'Ασφαλής Πληρωμή με Viva Wallet' : 'Secure Payment with Viva Wallet'}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {locale === 'el' 
                        ? 'Θα ανακατευθυνθείτε στη σελίδα πληρωμής της Viva Wallet για να ολοκληρώσετε την παραγγελία σας με ασφάλεια.' 
                        : 'You will be redirected to Viva Wallet secure payment page to complete your order.'}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>{locale === 'el' ? 'Ασφαλής κρυπτογράφηση' : 'Secure encryption'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>{locale === 'el' ? 'Υποστήριξη όλων των καρτών' : 'All cards supported'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep(2);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      size="lg"
                      className="w-full"
                      disabled={isProcessing}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {tCommon('back')}
                    </Button>
                    <Button
                      onClick={handlePayment}
                      size="lg"
                      className="w-full text-base"
                      disabled={isProcessing}
                    >
                      {isProcessing 
                        ? (locale === 'el' ? 'Επεξεργασία...' : 'Processing...') 
                        : (locale === 'el' ? 'Συνέχεια στην Πληρωμή' : 'Continue to Payment')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary - Only shown in step 3 */}
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl">{t('order_summary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 md:p-6">
                  <div className="space-y-3 text-xs md:text-sm max-h-[300px] md:max-h-[400px] overflow-y-auto">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-2 items-start">
                        {/* Product Image */}
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-muted rounded-md overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={56}
                              height={56}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-medium truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × {formatPrice(item.price, locale)}
                          </p>
                          {(item.size || item.color) && (
                            <p className="text-xs text-muted-foreground">
                              {item.size && item.size}
                              {item.size && item.color && ' • '}
                              {item.color && item.color}
                            </p>
                          )}
                        </div>
                        
                        {/* Price */}
                        <div className="font-medium whitespace-nowrap text-xs md:text-sm">
                          {formatPrice(item.price * item.quantity, locale)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{tCommon('subtotal')}</span>
                      <span>{formatPrice(subtotal, locale)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{tCommon('shipping')}</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600 font-medium">{t('shipping_cost_free')}</span>
                        ) : (
                          formatPrice(shippingCost, locale)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-base md:text-lg font-bold pt-2 border-t">
                      <span>{tCommon('total')}</span>
                      <span className="text-primary">{formatPrice(total, locale)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {step < 3 && (
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              {step > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStep(step - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  size="lg" 
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {tCommon('back')}
                </Button>
              )}
              <Button onClick={handleContinue} size="lg" className="w-full text-base">
                {tCommon('continue')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
