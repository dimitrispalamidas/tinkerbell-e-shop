"use client"

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, CheckCircle, ShoppingBag, Package, Home } from 'lucide-react';
import { BoxnowLockerList } from '@/components/checkout/boxnow-locker-list';
import Image from 'next/image';
import { z } from 'zod';

const CHECKOUT_STORAGE_KEY = 'tinkerbell_checkout_data';
const HOME_DELIVERY_COST = 3.50; // €3.50 for home delivery

export default function CheckoutPage() {
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
        toast.error(locale === 'el' ? 'Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία' : 'Please fill in all required fields');
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
        toast.error(locale === 'el' ? 'Παρακαλώ επιλέξτε τρόπο παράδοσης' : 'Please select a delivery method');
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
          toast.error(locale === 'el' ? 'Παρακαλώ συμπληρώστε όλα τα πεδία διεύθυνσης' : 'Please fill in all address fields');
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
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {locale === 'el' ? 'Ολοκλήρωση Παραγγελίας' : 'Checkout'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'el' ? 'Μερικά ακόμα βήματα για να ολοκληρώσετε την παραγγελία σας' : 'Just a few more steps to complete your order'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 md:mb-12 max-w-md mx-auto">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300 ${
                    step >= s 
                      ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s}
                </div>
                <span className={`text-xs mt-2 font-medium transition-colors ${
                  step >= s ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {s === 1 ? (locale === 'el' ? 'Στοιχεία' : 'Details') : 
                   s === 2 ? (locale === 'el' ? 'Παράδοση' : 'Delivery') : 
                   (locale === 'el' ? 'Πληρωμή' : 'Payment')}
                </span>
              </div>
              {s < 3 && (
                <div className={`h-0.5 flex-1 mx-2 transition-colors duration-300 ${
                  step > s ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="space-y-4 md:space-y-6">
          {/* STEP 1: Customer Information */}
          {step === 1 && (
            <Card className="border-2 shadow-sm">
              <CardHeader className="p-5 md:p-7 bg-muted/30 border-b">
                <CardTitle className="text-xl md:text-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  {locale === 'el' ? 'Στοιχεία Πελάτη' : 'Customer Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-5 md:p-7">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2.5">
                      {locale === 'el' ? 'Όνομα' : 'First Name'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => {
                        setFormData({ ...formData, firstName: e.target.value });
                        if (errors.firstName) setErrors({ ...errors, firstName: false });
                      }}
                      required
                      className={`text-base h-11 ${errors.firstName ? 'border-red-500 border-2' : 'border-2'}`}
                      placeholder={locale === 'el' ? 'π.χ. Γιάννης' : 'e.g. John'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2.5">
                      {locale === 'el' ? 'Επώνυμο' : 'Last Name'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => {
                        setFormData({ ...formData, lastName: e.target.value });
                        if (errors.lastName) setErrors({ ...errors, lastName: false });
                      }}
                      required
                      className={`text-base h-11 ${errors.lastName ? 'border-red-500 border-2' : 'border-2'}`}
                      placeholder={locale === 'el' ? 'π.χ. Παπαδόπουλος' : 'e.g. Smith'}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2.5">
                    {locale === 'el' ? 'Email' : 'Email'}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
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
                    className={`text-base h-11 ${errors.email ? 'border-red-500 border-2 focus-visible:ring-red-500' : 'border-2'}`}
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-2 flex items-start gap-1">
                      <span className="font-medium">⚠</span>
                      <span>{locale === 'el' ? 'Μη έγκυρη διεύθυνση email (π.χ. name@example.com)' : 'Invalid email address (e.g. name@example.com)'}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2.5">
                    {locale === 'el' ? 'Τηλέφωνο' : 'Phone'}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-2.5">
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
                    className={`text-base h-11 ${errors.phone ? 'border-red-500 border-2 focus-visible:ring-red-500' : 'border-2'}`}
                    placeholder={locale === 'el' ? 'π.χ. 6912345678' : 'e.g. 6912345678'}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-2 flex items-start gap-1">
                      <span className="font-medium">⚠</span>
                      <span>{locale === 'el' ? 'Μόνο 10 ψηφία, π.χ. 6912345678 ή 2101234567' : 'Only 10 digits, e.g. 6912345678 or 2101234567'}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 2: Delivery Method */}
          {step === 2 && (
            <>
              <Card className="border-2 shadow-sm">
                <CardHeader className="p-5 md:p-7 bg-muted/30 border-b">
                  <CardTitle className="text-xl md:text-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    {locale === 'el' ? 'Επιλέξτε Τρόπο Παράδοσης' : 'Choose Delivery Method'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 md:p-7 space-y-6">
                  {/* Delivery Method Selection */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* BOXNOW Option */}
                    <button
                      onClick={() => setFormData({ ...formData, deliveryMethod: 'boxnow' })}
                      className={`group p-5 border-2 rounded-xl text-left transition-all duration-200 ${
                        formData.deliveryMethod === 'boxnow'
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border hover:border-primary/50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                          formData.deliveryMethod === 'boxnow' ? 'bg-primary/20' : 'bg-muted'
                        }`}>
                          <Package className={`h-6 w-6 ${formData.deliveryMethod === 'boxnow' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold mb-2 text-base">{locale === 'el' ? 'BOXNOW Locker' : 'BOXNOW Locker'}</h3>
                          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{locale === 'el' ? 'Παραλάβετε από locker στο σημείο της επιλογής σας' : 'Pick up from locker at your preferred location'}</p>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              {locale === 'el' ? 'Δωρεάν' : 'Free'}
                            </span>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          formData.deliveryMethod === 'boxnow' ? 'border-primary scale-110' : 'border-muted'
                        }`}>
                          {formData.deliveryMethod === 'boxnow' && (
                            <div className="w-3.5 h-3.5 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Home Delivery Option */}
                    <button
                      onClick={() => setFormData({ ...formData, deliveryMethod: 'home' })}
                      className={`group p-5 border-2 rounded-xl text-left transition-all duration-200 ${
                        formData.deliveryMethod === 'home'
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border hover:border-primary/50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                          formData.deliveryMethod === 'home' ? 'bg-primary/20' : 'bg-muted'
                        }`}>
                          <Home className={`h-6 w-6 ${formData.deliveryMethod === 'home' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold mb-2 text-base">{locale === 'el' ? 'Παράδοση στο Σπίτι' : 'Home Delivery'}</h3>
                          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{locale === 'el' ? 'Παραλάβετε στην πόρτα σας' : 'Delivered to your doorstep'}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">+{formatPrice(HOME_DELIVERY_COST, locale)}</span>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          formData.deliveryMethod === 'home' ? 'border-primary scale-110' : 'border-muted'
                        }`}>
                          {formData.deliveryMethod === 'home' && (
                            <div className="w-3.5 h-3.5 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* BOXNOW Locker Selection */}
                  {formData.deliveryMethod === 'boxnow' && (
                    <div className="pt-2 border-t">
                      <h3 className="font-semibold mb-4 text-base">{locale === 'el' ? 'Επιλέξτε Locker' : 'Select Locker'}</h3>
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
                    <div className="pt-2 border-t space-y-5">
                      <h3 className="font-semibold mb-1 text-base">{locale === 'el' ? 'Στοιχεία Αποστολής' : 'Shipping Information'}</h3>
                      <div>
                        <label className="block text-sm font-semibold mb-2.5">
                          {locale === 'el' ? 'Διεύθυνση' : 'Address'}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
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
                          className={`text-base h-11 ${errors.address ? 'border-red-500 border-2 focus-visible:ring-red-500' : 'border-2'}`}
                          placeholder={locale === 'el' ? 'π.χ. Αθηνών 15' : 'e.g. Athinas 15'}
                        />
                        {errors.address && (
                          <p className="text-xs text-red-500 mt-2 flex items-start gap-1">
                            <span className="font-medium">⚠</span>
                            <span>{locale === 'el' ? 'Η διεύθυνση πρέπει να περιλαμβάνει αριθμό' : 'Address must include a street number'}</span>
                          </p>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold mb-2.5">
                            {locale === 'el' ? 'Πόλη' : 'City'}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
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
                            className={`text-base h-11 ${errors.city ? 'border-red-500 border-2 focus-visible:ring-red-500' : 'border-2'}`}
                            placeholder={locale === 'el' ? 'π.χ. Αθήνα' : 'e.g. Athens'}
                          />
                          {errors.city && (
                            <p className="text-xs text-red-500 mt-2 flex items-start gap-1">
                              <span className="font-medium">⚠</span>
                              <span>{locale === 'el' ? 'Η πόλη πρέπει να περιέχει τουλάχιστον 2 γράμματα' : 'City must contain at least 2 letters'}</span>
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2.5">
                            {locale === 'el' ? 'Τ.Κ.' : 'Postal Code'}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
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
                            className={`text-base h-11 ${errors.postalCode ? 'border-red-500 border-2 focus-visible:ring-red-500' : 'border-2'}`}
                            placeholder="12345"
                          />
                          {errors.postalCode && (
                            <p className="text-xs text-red-500 mt-2 flex items-start gap-1">
                              <span className="font-medium">⚠</span>
                              <span>{locale === 'el' ? 'Μόνο 5 ψηφία, π.χ. 12345' : 'Only 5 digits, e.g. 12345'}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2.5">
                          {locale === 'el' ? 'Περιοχή / Νομός' : 'Region / State'}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
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
                          className={`text-base h-11 ${errors.region ? 'border-red-500 border-2 focus-visible:ring-red-500' : 'border-2'}`}
                          placeholder={locale === 'el' ? 'π.χ. Αττική' : 'e.g. Attica'}
                        />
                        {errors.region && (
                          <p className="text-xs text-red-500 mt-2 flex items-start gap-1">
                            <span className="font-medium">⚠</span>
                            <span>{locale === 'el' ? 'Η περιοχή πρέπει να περιέχει τουλάχιστον 2 γράμματα' : 'Region must contain at least 2 letters'}</span>
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
              <Card className="border-2 shadow-sm">
                <CardHeader className="p-5 md:p-7 bg-muted/30 border-b">
                  <CardTitle className="text-xl md:text-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    {locale === 'el' ? 'Πληρωμή' : 'Payment'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-5 md:p-7">
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-5 rounded-xl border border-primary/20">
                    <h3 className="font-bold mb-2.5 text-base flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      {locale === 'el' ? 'Ασφαλής Πληρωμή με Viva Wallet' : 'Secure Payment with Viva Wallet'}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed ml-10">
                      {locale === 'el' 
                        ? 'Θα ανακατευθυνθείτε στη σελίδα πληρωμής της Viva Wallet για να ολοκληρώσετε την παραγγελία σας με ασφάλεια.' 
                        : 'You will be redirected to Viva Wallet secure payment page to complete your order.'}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{locale === 'el' ? 'Ασφαλής κρυπτογράφηση' : 'Secure encryption'}</p>
                        <p className="text-xs text-muted-foreground">{locale === 'el' ? 'SSL 256-bit' : 'SSL 256-bit'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{locale === 'el' ? 'Υποστήριξη όλων των καρτών' : 'All cards supported'}</p>
                        <p className="text-xs text-muted-foreground">Visa, Mastercard, etc.</p>
                      </div>
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
                      className="w-full border-2 group"
                      disabled={isProcessing}
                    >
                      <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                      {locale === 'el' ? 'Πίσω' : 'Back'}
                    </Button>
                    <Button
                      onClick={handlePayment}
                      size="lg"
                      className="w-full text-base shadow-sm hover:shadow-md transition-all group"
                      disabled={isProcessing}
                    >
                      {isProcessing 
                        ? (
                          <>
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            {locale === 'el' ? 'Επεξεργασία...' : 'Processing...'}
                          </>
                        )
                        : (
                          <>
                            {locale === 'el' ? 'Συνέχεια στην Πληρωμή' : 'Continue to Payment'}
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary - Only shown in step 3 */}
              <Card className="border-2 shadow-sm">
                <CardHeader className="p-5 md:p-7 bg-muted/30 border-b">
                  <CardTitle className="text-xl md:text-2xl flex items-center gap-3">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                    {locale === 'el' ? 'Σύνοψη Παραγγελίας' : 'Order Summary'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-5 md:p-7">
                  <div className="space-y-3 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 items-start p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-background rounded-lg overflow-hidden flex-shrink-0 border border-border">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold line-clamp-2 mb-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground mb-1">
                            {item.quantity} × {formatPrice(item.price, locale)}
                          </p>
                          {(item.size || item.color) && (
                            <p className="text-xs text-muted-foreground flex flex-wrap gap-1">
                              {item.size && <span className="px-2 py-0.5 bg-background rounded">{item.size}</span>}
                              {item.color && <span className="px-2 py-0.5 bg-background rounded">{item.color}</span>}
                            </p>
                          )}
                        </div>
                        
                        {/* Price */}
                        <div className="font-bold whitespace-nowrap text-sm">
                          {formatPrice(item.price * item.quantity, locale)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t-2 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{locale === 'el' ? 'Υποσύνολο' : 'Subtotal'}</span>
                      <span className="font-semibold">{formatPrice(subtotal, locale)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{locale === 'el' ? 'Μεταφορικά' : 'Shipping'}</span>
                      <span className="font-semibold">
                        {shippingCost === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">{locale === 'el' ? 'Δωρεάν' : 'Free'}</span>
                        ) : (
                          formatPrice(shippingCost, locale)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg md:text-xl font-bold pt-3 border-t-2">
                      <span>{locale === 'el' ? 'Σύνολο' : 'Total'}</span>
                      <span className="text-2xl text-primary">{formatPrice(total, locale)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {step < 3 && (
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
              {step > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStep(step - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  size="lg" 
                  className="w-full border-2 group"
                >
                  <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  {locale === 'el' ? 'Πίσω' : 'Back'}
                </Button>
              )}
              <Button 
                onClick={handleContinue} 
                size="lg" 
                className="w-full text-base shadow-sm hover:shadow-md transition-all group"
              >
                {locale === 'el' ? 'Συνέχεια' : 'Continue'}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
