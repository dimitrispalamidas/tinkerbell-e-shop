"use client"

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { getProductDiscountInfo, validateDiscountCode as validateDiscountCodeUtil } from '@/lib/utils/discounts';
import type { DiscountCode } from '@/lib/types/database';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, CheckCircle, ShoppingBag, Package, Home, ChevronDown, ChevronUp, Lock, Shield, X } from 'lucide-react';
import { BoxnowLockerList } from '@/components/checkout/boxnow-locker-list';
import Image from 'next/image';
import { z } from 'zod';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

const CHECKOUT_STORAGE_KEY = 'tinkerbell_checkout_data';
const HOME_DELIVERY_COST = 3.50; // €3.50 for home delivery

type CheckoutFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  deliveryMethod: 'boxnow' | 'home';
  address: string;
  city: string;
  region: string;
  postalCode: string;
  boxnowLockerId: string;
  boxnowLockerAddress: string;
  boxnowLockerPostalCode: string;
};

const defaultFormData: CheckoutFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  deliveryMethod: 'boxnow',
  address: '',
  city: '',
  region: '',
  postalCode: '',
  boxnowLockerId: '',
  boxnowLockerAddress: '',
  boxnowLockerPostalCode: '',
};

const getInitialFormData = (): CheckoutFormData => {
  if (typeof window === 'undefined') {
    return defaultFormData;
  }

  try {
    const saved = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);

    if (!saved) {
      return defaultFormData;
    }

    const parsed = JSON.parse(saved) as Partial<CheckoutFormData>;

    return { ...defaultFormData, ...parsed };
  } catch (error) {
    console.error('Failed to parse checkout data:', error);
    return defaultFormData;
  }
};

const getInitialStep = (): number => {
  if (typeof window === 'undefined') {
    return 1;
  }

  const urlParams = new URLSearchParams(window.location.search);

  return urlParams.get('cancel') === 'true' ? 3 : 1;
};

export default function CheckoutPage() {
  const router = useRouter();
  const locale = useLocale();
  
  const { items, getTotal, getSubtotal } = useCartStore();
  const [step, setStep] = useState<number>(() => getInitialStep());
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<CheckoutFormData>(() => getInitialFormData());
  const [discountCodeInput, setDiscountCodeInput] = useState<string>('');
  const [discountCodes, setDiscountCodes] = useState<Array<{ id: string; code: string; discount_type: 'percentage' | 'fixed'; discount_value: number; can_combine_with_productdiscount?: boolean; starts_at?: string | null; expires_at?: string | null; is_active?: boolean }>>([]);
  const [discountInfo, setDiscountInfo] = useState<{ valid: boolean; discount?: any; error?: string } | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(true);

  // Save to sessionStorage whenever formData changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(formData));
    } catch (error) {
      console.error('Failed to persist checkout data:', error);
    }
  }, [formData]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/shop');
    }
  }, [items, router]);

  // Handle cancel from Viva Wallet
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('cancel') === 'true') {
      toast.info(locale === 'el'
        ? 'Η πληρωμή ακυρώθηκε. Μπορείτε να δοκιμάσετε ξανά.'
        : 'Payment was cancelled. You can try again.');

      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [locale]);

  const validateEmail = (email: string): boolean => {
    // Using Zod for more robust email validation
    return z.email().safeParse(email).success;
  };

  const validatePhone = (phone: string): boolean => {
    try {
      // Clean the phone number
      const cleanPhone = phone.replace(/\s/g, '');
      
      // Check if it's a valid Greek phone number
      return isValidPhoneNumber(cleanPhone, 'GR');
    } catch (error) {
      return false;
    }
  };

  // Helper function to translate error messages
  const translateError = (error: string): string => {
    if (locale !== 'el') return error;
    
    const errorMap: Record<string, string> = {
      // Code combination errors
      'Cannot combine with existing discount codes': 'Δεν μπορεί να συνδυαστεί με υπάρχοντες εκπτωτικούς κωδικούς',
      'This discount code cannot be combined with other discount codes': 'Αυτός ο εκπτωτικός κωδικός δεν μπορεί να συνδυαστεί με άλλους εκπτωτικούς κωδικούς',
      
      // Product discount combination errors - detailed messages
      'discount_code_cannot_combine_with_products': 'Αυτός ο εκπτωτικός κωδικός δεν μπορεί να συνδυαστεί με εκπτώσεις προϊόντων',
      'product_discount_cannot_combine_with_codes': 'Τα προϊόντα στο καλάθι έχουν εκπτώσεις που δεν μπορούν να συνδυαστούν με κωδικούς',
      'discount_code_and_product_cannot_combine': 'Ούτε ο κωδικός ούτε οι εκπτώσεις προϊόντων μπορούν να συνδυαστούν μεταξύ τους',
      
      // Legacy error (fallback)
      'This discount code cannot be combined with product discounts': 'Αυτός ο εκπτωτικός κωδικός δεν μπορεί να συνδυαστεί με εκπτώσεις προϊόντων',
      
      // Discount code status errors
      'Discount code already applied': 'Ο εκπτωτικός κωδικός έχει ήδη εφαρμοστεί',
      'Discount code not found': 'Ο εκπτωτικός κωδικός δεν βρέθηκε',
      'Discount code is not active': 'Ο εκπτωτικός κωδικός δεν είναι ενεργός',
      'Discount code has not started yet': 'Ο εκπτωτικός κωδικός δεν έχει ξεκινήσει ακόμα',
      'Discount code has expired': 'Ο εκπτωτικός κωδικός έχει λήξει',
      'Discount code has reached maximum uses': 'Ο εκπτωτικός κωδικός έχει φτάσει το μέγιστο όριο χρήσεων',
      
      // Format and system errors
      'Invalid discount code format': 'Μη έγκυρη μορφή εκπτωτικού κωδικού',
      'Too many requests. Please try again later.': 'Πολλά αιτήματα. Παρακαλώ δοκιμάστε ξανά αργότερα.',
      'Invalid request': 'Μη έγκυρο αίτημα',
      'Validation failed': 'Η επικύρωση απέτυχε',
    };
    
    return errorMap[error] || error;
  };

  const validateDiscountCode = async (code: string) => {
    if (!code.trim()) {
      setDiscountInfo(null);
      return;
    }

    setIsValidatingDiscount(true);
    try {
      const existingCodeIds = discountCodes.map(dc => dc.id);
      const productIds = items.map(item => item.id);
      const response = await fetch('/api/discount-codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: code.trim().toUpperCase(),
          existingCodeIds,
          productIds,
        }),
      });

      const data = await response.json();
      // Translate error message if present
      if (data.error) {
        data.error = translateError(data.error);
      }
      setDiscountInfo(data);

      if (data.valid && data.discount) {
        // Add to discount codes array with dates for validation
        setDiscountCodes(prev => [...prev, {
          id: data.discount.id,
          code: data.discount.code,
          discount_type: data.discount.discount_type,
          discount_value: data.discount.discount_value,
          can_combine_with_productdiscount: data.discount.can_combine_with_productdiscount,
          starts_at: data.discount.starts_at,
          expires_at: data.discount.expires_at,
          is_active: true, // API already validated it's active
        }]);
        setDiscountCodeInput('');
        toast.success(
          locale === 'el' 
            ? `Εκπτωτικός κωδικός εφαρμόστηκε! ${data.discount.discount_type === 'percentage' ? `${data.discount.discount_value}%` : `${data.discount.discount_value}€`}`
            : `Discount code applied! ${data.discount.discount_type === 'percentage' ? `${data.discount.discount_value}%` : `€${data.discount.discount_value}`}`
        );
      } else {
        toast.error(data.error || (locale === 'el' ? 'Μη έγκυρος εκπτωτικός κωδικός' : 'Invalid discount code'));
      }
    } catch (error) {
      console.error('Failed to validate discount code:', error);
      setDiscountInfo({ valid: false, error: locale === 'el' ? 'Σφάλμα επικύρωσης κωδικού' : 'Validation error' });
      toast.error(locale === 'el' ? 'Σφάλμα επικύρωσης κωδικού' : 'Failed to validate discount code');
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const removeDiscountCode = (id: string) => {
    setDiscountCodes(prev => prev.filter(dc => dc.id !== id));
    toast.success(locale === 'el' ? 'Εκπτωτικός κωδικός αφαιρέθηκε' : 'Discount code removed');
  };

  const formatPhoneNumber = (phone: string): string => {
    try {
      const cleanPhone = phone.replace(/\s/g, '');
      if (cleanPhone.length === 0) return '';
      
      // Try to parse as Greek number
      const phoneNumber = parsePhoneNumber(cleanPhone, 'GR');
      if (phoneNumber) {
        return phoneNumber.formatNational(); // Format as national (e.g., "69 1234 5678")
      }
      return cleanPhone;
    } catch (error) {
      return phone;
    }
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

      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
          body: JSON.stringify({
          locale,
          cartItems: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
          discountCodes: discountCodes.map(dc => dc.code),
          formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        if (data?.validationErrors) {
          data.validationErrors.forEach((err: any) => {
            const itemInfo = err.productName
              ? `${err.productName}${err.size ? ` (${err.size}${err.color ? `, ${err.color}` : ''})` : ''}`
              : '';

            const message = (() => {
              switch (err.issue) {
                case 'product_not_found':
                  return locale === 'el'
                    ? `❌ ${itemInfo}: Το προϊόν δεν υπάρχει πλέον`
                    : `❌ ${itemInfo}: Product no longer exists`;
                case 'variant_not_found':
                  return locale === 'el'
                    ? `❌ ${itemInfo}: Αυτή η παραλλαγή δεν είναι διαθέσιμη`
                    : `❌ ${itemInfo}: This variant is not available`;
                case 'no_stock':
                  return locale === 'el'
                    ? `❌ ${itemInfo}: Εξαντλήθηκε`
                    : `❌ ${itemInfo}: Out of stock`;
                case 'insufficient_stock':
                  return locale === 'el'
                    ? `⚠️ ${itemInfo}: Ζητήθηκαν ${err.requestedQuantity}, διαθέσιμα ${err.availableStock}`
                    : `⚠️ ${itemInfo}: Requested ${err.requestedQuantity}, available ${err.availableStock}`;
                default:
                  return null;
              }
            })();

            if (message) {
              toast.error(message, { duration: 6000 });
            }
          });
        }

        if (data?.message) {
          toast.error(data.message, { duration: 6000 });
        } else {
          toast.error(
            locale === 'el'
              ? 'Η παραγγελία δεν ολοκληρώθηκε. Δοκιμάστε ξανά.'
              : 'Order could not be completed. Please try again.'
          );
        }

        setIsProcessing(false);
        return;
      }

      const data = await response.json();

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      }
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error('❌ Payment error:', error);
      toast.error(locale === 'el' ? 'Σφάλμα κατά τη δημιουργία πληρωμής' : 'Error creating payment');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  const subtotalWithoutDiscounts = getSubtotal(); // Subtotal without product discounts
  const subtotalWithProductDiscounts = getTotal(); // Subtotal with product discounts
  const shippingCost = formData.deliveryMethod === 'home' ? HOME_DELIVERY_COST : 0;
  const productDiscountAmount = subtotalWithoutDiscounts - subtotalWithProductDiscounts;
  
  // Count products with discounts
  const productsWithDiscounts = items.filter(item => {
    if (!item.product_discounts || item.product_discounts.length === 0) return false;
    const now = new Date();
    return item.product_discounts.some((discount: any) => {
      if (!discount.is_active) return false;
      if (discount.starts_at && new Date(discount.starts_at) > now) return false;
      if (discount.ends_at && new Date(discount.ends_at) < now) return false;
      return true;
    });
  }).length;
  
  // Check if discount codes can combine with product discounts
  const hasProductDiscounts = productDiscountAmount > 0;
  
  // Filter valid discount codes first (check dates and active status)
  const validDiscountCodes = discountCodes.filter(code => {
    const discountCodeForValidation: DiscountCode = {
      id: code.id,
      code: code.code,
      discount_type: code.discount_type,
      discount_value: code.discount_value,
      starts_at: code.starts_at ?? null,
      expires_at: code.expires_at ?? null,
      is_active: code.is_active ?? true,
      can_combine_with_productdiscount: code.can_combine_with_productdiscount ?? false,
      can_combine_with_codediscount: false,
      usage_count: 0,
      max_uses: null,
      created_at: '',
      updated_at: '',
    };
    const validation = validateDiscountCodeUtil(discountCodeForValidation);
    return validation.valid;
  });
  
  const canCombineWithProductDiscounts = hasProductDiscounts 
    ? validDiscountCodes.every(code => code.can_combine_with_productdiscount === true) &&
      items.every(item => {
        if (!item.product_discounts || item.product_discounts.length === 0) return true;
        const now = new Date();
        // Get all active product discounts for this item
        const activeDiscounts = item.product_discounts.filter((discount: any) => {
          if (!discount.is_active) return false;
          if (discount.starts_at && new Date(discount.starts_at) > now) return false;
          if (discount.ends_at && new Date(discount.ends_at) < now) return false;
          return true;
        });
        // If no active discounts, can combine
        if (activeDiscounts.length === 0) return true;
        // ALL active product discounts must be able to combine with discount codes
        return activeDiscounts.every((discount: any) => discount.can_combine_with_codediscount === true);
      })
    : true; // No product discounts, so can combine

  // Remove expired/invalid discount codes from state
  useEffect(() => {
    if (validDiscountCodes.length !== discountCodes.length) {
      const invalidCodes = discountCodes.filter(code => {
        const discountCodeForValidation: DiscountCode = {
          id: code.id,
          code: code.code,
          discount_type: code.discount_type,
          discount_value: code.discount_value,
          starts_at: code.starts_at ?? null,
          expires_at: code.expires_at ?? null,
          is_active: code.is_active ?? true,
          can_combine_with_productdiscount: code.can_combine_with_productdiscount ?? false,
          can_combine_with_codediscount: false,
          usage_count: 0,
          max_uses: null,
          created_at: '',
          updated_at: '',
        };
        const validation = validateDiscountCodeUtil(discountCodeForValidation);
        return !validation.valid;
      });
      
      if (invalidCodes.length > 0) {
        setDiscountCodes(prev => prev.filter(dc => 
          !invalidCodes.some(invalid => invalid.id === dc.id)
        ));
        invalidCodes.forEach(code => {
          toast.error(
            locale === 'el' 
              ? `Ο εκπτωτικός κωδικός ${code.code} δεν είναι πλέον έγκυρος`
              : `Discount code ${code.code} is no longer valid`
          );
        });
      }
    }
  }, [discountCodes, locale]);

  // Calculate discount code discount with breakdown per code
  let discountCodeAmount = 0;
  const discountCodeBreakdown: Array<{ code: string; amount: number }> = [];
  
  if (canCombineWithProductDiscounts && validDiscountCodes.length > 0) {
    // Can combine: apply discount codes sequentially on subtotal with product discounts
    let currentAmount = subtotalWithProductDiscounts;
    for (const discountCode of validDiscountCodes) {
      const discount = discountCode.discount_type === 'percentage'
        ? (currentAmount * discountCode.discount_value) / 100
        : discountCode.discount_value;
      const codeDiscount = Math.min(discount, currentAmount);
      discountCodeAmount += codeDiscount;
      discountCodeBreakdown.push({ code: discountCode.code, amount: codeDiscount });
      currentAmount -= codeDiscount;
      currentAmount = Math.max(0, currentAmount);
    }
  } else if (validDiscountCodes.length > 0 && hasProductDiscounts) {
    // Cannot combine: use only the best discount (product discounts vs discount codes)
    // Calculate best discount code amount
    let bestCodeDiscount = 0;
    let bestCode: { code: string; amount: number } | null = null;
    for (const discountCode of validDiscountCodes) {
      const discount = discountCode.discount_type === 'percentage'
        ? (subtotalWithoutDiscounts * discountCode.discount_value) / 100
        : discountCode.discount_value;
      const codeDiscount = Math.min(discount, subtotalWithoutDiscounts);
      if (codeDiscount > bestCodeDiscount) {
        bestCodeDiscount = codeDiscount;
        bestCode = { code: discountCode.code, amount: codeDiscount };
      }
    }
    
    // Use the better discount
    if (bestCodeDiscount > productDiscountAmount) {
      discountCodeAmount = bestCodeDiscount;
      if (bestCode) {
        discountCodeBreakdown.push(bestCode);
      }
      // Note: productDiscountAmount will be set to 0 in display logic
    } else {
      discountCodeAmount = 0;
    }
  } else if (validDiscountCodes.length > 0) {
    // No product discounts, just apply discount codes
    let currentAmount = subtotalWithoutDiscounts;
    for (const discountCode of validDiscountCodes) {
      const discount = discountCode.discount_type === 'percentage'
        ? (currentAmount * discountCode.discount_value) / 100
        : discountCode.discount_value;
      const codeDiscount = Math.min(discount, currentAmount);
      discountCodeAmount += codeDiscount;
      discountCodeBreakdown.push({ code: discountCode.code, amount: codeDiscount });
      currentAmount -= codeDiscount;
      currentAmount = Math.max(0, currentAmount);
    }
  }
  
  // Show shipping in total only from step 2 onwards (when delivery method is selected)
  const displayShippingCost = step >= 2 ? shippingCost : 0;
  
  // Calculate final amounts based on combination rules
  const displayProductDiscountAmount = canCombineWithProductDiscounts || !hasProductDiscounts 
    ? productDiscountAmount 
    : (discountCodeAmount > productDiscountAmount ? 0 : productDiscountAmount);
  const displayCodeDiscountAmount = canCombineWithProductDiscounts || !hasProductDiscounts
    ? discountCodeAmount
    : (discountCodeAmount > productDiscountAmount ? discountCodeAmount : 0);
  
  // Filter discount code breakdown based on display logic
  const displayDiscountCodeBreakdown = canCombineWithProductDiscounts || !hasProductDiscounts
    ? discountCodeBreakdown
    : (discountCodeAmount > productDiscountAmount ? discountCodeBreakdown : []);
  
  const finalSubtotal = subtotalWithoutDiscounts - displayProductDiscountAmount - displayCodeDiscountAmount;
  const total = Math.max(0, finalSubtotal + displayShippingCost);
  const hasAnyDiscount = displayProductDiscountAmount > 0 || displayCodeDiscountAmount > 0;
  
  // Labels for discounts
  const productDiscountLabel = locale === 'el' 
    ? (productsWithDiscounts === 1 ? 'Έκπτωση Προϊόντος' : 'Έκπτωση Προϊόντων')
    : (productsWithDiscounts === 1 ? 'Product Discount' : 'Product Discounts');
  const codeDiscountLabel = locale === 'el' ? 'Έκπτωση Κωδικού' : 'Discount Code';

  // Helper function to render Order Summary (compact version for sidebar, mobile version)
  const renderOrderSummary = (compact: boolean = false, mobile: boolean = false) => {
    // Mobile compact version (collapsed by default, shows only total)
    if (mobile) {
      return (
        <Card className="border-2 shadow-sm">
          <CardHeader 
            className="p-4 bg-muted/30 border-b cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)}
          >
            <CardTitle className="text-base flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                <span>{locale === 'el' ? 'Σύνοψη' : 'Summary'}</span>
                <span className="text-xs text-muted-foreground">
                  ({items.length} {locale === 'el' ? (items.length === 1 ? 'προϊόν' : 'προϊόντα') : (items.length === 1 ? 'item' : 'items')})
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOrderSummaryExpanded(!isOrderSummaryExpanded);
                }}
                className="p-1 hover:bg-background rounded transition-colors"
              >
                {isOrderSummaryExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </CardTitle>
          </CardHeader>
          {isOrderSummaryExpanded && (
            <CardContent className="p-4 space-y-3">
              {/* Items list - Compact */}
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {items.slice(0, 3).map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-2 items-center text-sm">
                    <div className="w-10 h-10 bg-background rounded overflow-hidden flex-shrink-0 border border-border">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity} × {formatPrice(item.price, locale)}</p>
                    </div>
                    <div className="text-xs font-semibold">
                      {formatPrice(item.price * item.quantity, locale)}
                    </div>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{items.length - 3} {locale === 'el' ? 'περισσότερα' : 'more'}
                  </p>
                )}
              </div>

              {/* Discount Code - Mobile */}
              {step === 3 && (
                <div className="border-t pt-3">
                  <label className="block text-xs font-semibold mb-1.5">
                    {locale === 'el' ? 'Εκπτωτικός Κωδικός' : 'Discount Code'}
                  </label>
                  <div className="flex gap-1.5">
                    <Input
                      value={discountCodeInput}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase().trim();
                        setDiscountCodeInput(value);
                        if (value && discountInfo) {
                          setDiscountInfo(null);
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          validateDiscountCode(e.target.value);
                        }
                      }}
                      placeholder={locale === 'el' ? 'Κωδικός' : 'Code'}
                      className="flex-1 h-8 text-xs border-2"
                      disabled={isValidatingDiscount}
                    />
                    <Button
                      type="button"
                      onClick={() => validateDiscountCode(discountCodeInput)}
                      disabled={!discountCodeInput.trim() || isValidatingDiscount}
                      variant="outline"
                      size="sm"
                      className="border-2 h-8 px-3"
                    >
                      {isValidatingDiscount ? '...' : (locale === 'el' ? 'OK' : 'OK')}
                    </Button>
                  </div>
                  {discountInfo?.error && (
                    <p className="text-xs text-red-500 mt-1">{discountInfo.error}</p>
                  )}
                  {discountCodes.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {discountCodes.map((dc) => (
                        <div key={dc.id} className="flex items-center justify-between text-xs bg-green-50 border border-green-200 rounded px-2 py-1">
                          <span className="text-green-700 font-medium">
                            {dc.code} - {dc.discount_type === 'percentage' ? `${dc.discount_value}%` : `${dc.discount_value}€`}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeDiscountCode(dc.id)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Totals */}
              <div className="border-t pt-3 space-y-1.5 text-xs">
                {hasAnyDiscount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{locale === 'el' ? 'Υποσύνολο' : 'Subtotal'}</span>
                    <span className="line-through text-muted-foreground">{formatPrice(subtotalWithoutDiscounts, locale)}</span>
                  </div>
                )}
                {displayProductDiscountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{productDiscountLabel}</span>
                    <span className="text-green-600">-{formatPrice(displayProductDiscountAmount, locale)}</span>
                  </div>
                )}
                {displayDiscountCodeBreakdown.map((codeDiscount, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {locale === 'el' ? `Έκπτωση Κωδικού ${codeDiscount.code}` : `Discount Code ${codeDiscount.code}`}
                    </span>
                    <span className="text-green-600">-{formatPrice(codeDiscount.amount, locale)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{locale === 'el' ? 'Υποσύνολο' : 'Subtotal'}</span>
                  <span className="font-semibold">{formatPrice(finalSubtotal, locale)}</span>
                </div>
                {step >= 2 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{locale === 'el' ? 'Μεταφορικά' : 'Shipping'}</span>
                    <span className="font-semibold">
                      {shippingCost === 0 ? (
                        <span className="text-xs text-green-600">{locale === 'el' ? 'Δωρεάν' : 'Free'}</span>
                      ) : (
                        `+${formatPrice(shippingCost, locale)}`
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t font-bold text-base">
                  <span>{locale === 'el' ? 'Σύνολο' : 'Total'}</span>
                  <span className={`text-lg ${hasAnyDiscount ? 'text-magenta-600' : 'text-primary'}`}>
                    {formatPrice(total, locale)}
                  </span>
                </div>
              </div>
            </CardContent>
          )}
          {!isOrderSummaryExpanded && (
            <CardContent className="p-4">
              <div className="flex justify-between items-center font-bold">
                <span className="text-sm">{locale === 'el' ? 'Σύνολο' : 'Total'}</span>
                <span className={`text-lg ${hasAnyDiscount ? 'text-magenta-600' : 'text-primary'}`}>
                  {formatPrice(total, locale)}
                </span>
              </div>
            </CardContent>
          )}
        </Card>
      );
    }
    
    if (compact) {
      return (
        <Card className="border-2 shadow-sm sticky top-6">
          <CardHeader className="p-4 bg-muted/30 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              {locale === 'el' ? 'Σύνοψη Παραγγελίας' : 'Order Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Items count */}
            <div className="text-sm text-muted-foreground">
              {items.length} {locale === 'el' ? (items.length === 1 ? 'προϊόν' : 'προϊόντα') : (items.length === 1 ? 'item' : 'items')}
            </div>
            
            {/* Discount Code - Compact */}
            {step === 3 && (
              <div className="border-t pt-3">
                <label className="block text-xs font-semibold mb-1.5">
                  {locale === 'el' ? 'Εκπτωτικός Κωδικός' : 'Discount Code'}
                </label>
                <div className="flex gap-1.5">
                  <Input
                    value={discountCodeInput}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().trim();
                      setDiscountCodeInput(value);
                      if (value && discountInfo) {
                        setDiscountInfo(null);
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value.trim()) {
                        validateDiscountCode(e.target.value);
                      }
                    }}
                    placeholder={locale === 'el' ? 'Κωδικός' : 'Code'}
                    className="flex-1 h-9 text-sm border-2"
                    disabled={isValidatingDiscount}
                  />
                  <Button
                    type="button"
                    onClick={() => validateDiscountCode(discountCodeInput)}
                    disabled={!discountCodeInput.trim() || isValidatingDiscount}
                    variant="outline"
                    size="sm"
                    className="border-2 h-9"
                  >
                    {isValidatingDiscount ? '...' : (locale === 'el' ? 'OK' : 'OK')}
                  </Button>
                </div>
                {discountInfo?.error && (
                  <p className="text-xs text-red-500 mt-1">{discountInfo.error}</p>
                )}
                {discountCodes.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {discountCodes.map((dc) => (
                      <div key={dc.id} className="flex items-center justify-between text-xs bg-green-50 border border-green-200 rounded px-2 py-1">
                        <span className="text-green-700 font-medium">
                          {dc.code} - {dc.discount_type === 'percentage' ? `${dc.discount_value}%` : `${dc.discount_value}€`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDiscountCode(dc.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Totals - Compact */}
            <div className="border-t pt-3 space-y-2 text-sm">
              {hasAnyDiscount && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{locale === 'el' ? 'Υποσύνολο' : 'Subtotal'}</span>
                  <span className="line-through text-muted-foreground">{formatPrice(subtotalWithoutDiscounts, locale)}</span>
                </div>
              )}
              {displayProductDiscountAmount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{productDiscountLabel}</span>
                  <span className="text-green-600">-{formatPrice(displayProductDiscountAmount, locale)}</span>
                </div>
              )}
              {displayDiscountCodeBreakdown.map((codeDiscount, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {locale === 'el' ? `Έκπτωση Κωδικού ${codeDiscount.code}` : `Discount Code ${codeDiscount.code}`}
                  </span>
                  <span className="text-green-600">-{formatPrice(codeDiscount.amount, locale)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{locale === 'el' ? 'Υποσύνολο' : 'Subtotal'}</span>
                <span className="font-semibold">{formatPrice(finalSubtotal, locale)}</span>
              </div>
              {step >= 2 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{locale === 'el' ? 'Μεταφορικά' : 'Shipping'}</span>
                  <span className="font-semibold">
                    {shippingCost === 0 ? (
                      <span className="text-xs text-green-600">{locale === 'el' ? 'Δωρεάν' : 'Free'}</span>
                    ) : (
                      `+${formatPrice(shippingCost, locale)}`
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t font-bold text-base">
                <span>{locale === 'el' ? 'Σύνολο' : 'Total'}</span>
                <span className={`text-lg ${hasAnyDiscount ? 'text-magenta-600' : 'text-primary'}`}>
                  {formatPrice(total, locale)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Full version (for mobile or when expanded)
    return (
      <Card className="border-2 shadow-sm">
        <CardHeader 
          className="p-5 md:p-7 bg-muted/30 border-b cursor-pointer hover:bg-muted/40 transition-colors"
          onClick={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)}
        >
          <CardTitle className="text-xl md:text-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-primary" />
              {locale === 'el' ? 'Σύνοψη Παραγγελίας' : 'Order Summary'}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOrderSummaryExpanded(!isOrderSummaryExpanded);
              }}
              className="p-1 hover:bg-background rounded transition-colors"
              aria-label={locale === 'el' ? 'Επέκταση/Σύμπτυξη' : 'Expand/Collapse'}
            >
              {isOrderSummaryExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </CardTitle>
        </CardHeader>
        {isOrderSummaryExpanded && (
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
                {(() => {
                  const itemTotal = item.price * item.quantity;
                  const discountInfo = getProductDiscountInfo(
                    itemTotal,
                    item.product_discounts,
                    item.quantity
                  );
                  return (
                    <div className="flex flex-col items-end gap-0.5 whitespace-nowrap">
                      {discountInfo.activeDiscount ? (
                        <>
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(itemTotal, locale)}
                          </p>
                          <p className="text-sm font-bold text-magenta-600">
                            {formatPrice(discountInfo.finalPrice, locale)}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-bold">
                          {formatPrice(itemTotal, locale)}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>

          {/* Discount Code Input */}
          {step === 3 && (
          <div className="border-t-2 pt-4">
            <label className="block text-sm font-semibold mb-2">
              {locale === 'el' ? 'Εκπτωτικός Κωδικός' : 'Discount Code'}
            </label>
            <div className="flex gap-2">
              <Input
                value={discountCodeInput}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().trim();
                  setDiscountCodeInput(value);
                  if (value && discountInfo) {
                    setDiscountInfo(null);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    validateDiscountCode(e.target.value);
                  }
                }}
                placeholder={locale === 'el' ? 'Εισάγετε κωδικό' : 'Enter code'}
                className="flex-1 border-2"
                disabled={isValidatingDiscount}
              />
              <Button
                type="button"
                onClick={() => validateDiscountCode(discountCodeInput)}
                disabled={!discountCodeInput.trim() || isValidatingDiscount}
                variant="outline"
                className="border-2"
              >
                {isValidatingDiscount 
                  ? (locale === 'el' ? 'Ελέγχος...' : 'Checking...')
                  : (locale === 'el' ? 'Εφαρμογή' : 'Apply')
                }
              </Button>
            </div>
            {discountInfo?.error && (
              <p className="text-xs text-red-500 mt-2">{discountInfo.error}</p>
            )}
            {discountCodes.length > 0 && (
              <div className="mt-2 space-y-1">
                {discountCodes.map((dc) => (
                  <div key={dc.id} className="flex items-center justify-between text-sm bg-green-50 border border-green-200 rounded px-3 py-2">
                    <span className="text-green-700 font-medium">
                      {dc.code} - {dc.discount_type === 'percentage' ? `${dc.discount_value}%` : `${dc.discount_value}€`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDiscountCode(dc.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          <div className="border-t-2 pt-4 space-y-3">
            {hasAnyDiscount && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{locale === 'el' ? 'Υποσύνολο' : 'Subtotal'}</span>
                <span className="font-semibold line-through text-muted-foreground">{formatPrice(subtotalWithoutDiscounts, locale)}</span>
              </div>
            )}
            {displayProductDiscountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{productDiscountLabel}</span>
                <span className="font-semibold text-green-600">-{formatPrice(displayProductDiscountAmount, locale)}</span>
              </div>
            )}
            {displayDiscountCodeBreakdown.map((codeDiscount, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {locale === 'el' ? `Έκπτωση Κωδικού ${codeDiscount.code}` : `Discount Code ${codeDiscount.code}`}
                </span>
                <span className="font-semibold text-green-600">-{formatPrice(codeDiscount.amount, locale)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{locale === 'el' ? 'Υποσύνολο' : 'Subtotal'}</span>
              <span className="font-semibold">{formatPrice(finalSubtotal, locale)}</span>
            </div>
            {step >= 2 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{locale === 'el' ? 'Μεταφορικά' : 'Shipping'}</span>
                <span className="font-semibold">
                  {shippingCost === 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">{locale === 'el' ? 'Δωρεάν' : 'Free'}</span>
                  ) : (
                    `+${formatPrice(shippingCost, locale)}`
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg md:text-xl font-bold pt-3 border-t-2">
              <span>{locale === 'el' ? 'Σύνολο' : 'Total'}</span>
              <span className={`text-2xl ${hasAnyDiscount ? 'text-magenta-600' : 'text-primary'}`}>
                {formatPrice(total, locale)}
              </span>
            </div>
          </div>
        </CardContent>
        )}
        {!isOrderSummaryExpanded && (
          <CardContent className="p-5 md:p-7">
            <div className="flex justify-between items-center text-lg md:text-xl font-bold">
              <span>{locale === 'el' ? 'Σύνολο' : 'Total'}</span>
              <span className={`text-2xl ${hasAnyDiscount ? 'text-magenta-600' : 'text-primary'}`}>
                {formatPrice(total, locale)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {locale === 'el' 
                ? `${items.length} ${items.length === 1 ? 'προϊόν' : 'προϊόντα'}` 
                : `${items.length} ${items.length === 1 ? 'item' : 'items'}`}
            </p>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 lg:py-10">
      <div className="max-w-7xl mx-auto">
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

        {/* Main Content - Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Column - Forms (2/3 on desktop) */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
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
                      // Allow only digits and spaces
                      const value = e.target.value.replace(/[^\d\s]/g, '');
                      setFormData({ ...formData, phone: value });
                      if (errors.phone) setErrors({ ...errors, phone: false });
                    }}
                    onBlur={(e) => {
                      const cleanPhone = e.target.value.replace(/\s/g, '');
                      if (cleanPhone) {
                        if (!validatePhone(cleanPhone)) {
                          setErrors({ ...errors, phone: true });
                        } else {
                          // Auto-format the phone number on blur if valid
                          const formatted = formatPhoneNumber(cleanPhone);
                          setFormData({ ...formData, phone: formatted });
                        }
                      }
                    }}
                    required
                    className={`text-base h-11 ${errors.phone ? 'border-red-500 border-2 focus-visible:ring-red-500' : 'border-2'}`}
                    placeholder={locale === 'el' ? 'π.χ. 6912345678 ή 2101234567' : 'e.g. 6912345678 or 2101234567'}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-2 flex items-start gap-1">
                      <span className="font-medium">⚠</span>
                      <span>{locale === 'el' ? 'Παρακαλώ εισάγετε έγκυρο ελληνικό τηλέφωνο (10 ψηφία, 69ΧΧΧΧΧΧΧΧ ή 2ΧΧΧΧΧΧΧΧΧ)' : 'Please enter a valid Greek phone number (10 digits, 69XXXXXXXX or 2XXXXXXXXX)'}</span>
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
                      type="button"
                      role="radio"
                      aria-checked={formData.deliveryMethod === 'boxnow'}
                      aria-label={locale === 'el' ? 'Επιλογή παράδοσης σε BOXNOW Locker - Δωρεάν' : 'Select BOXNOW Locker delivery - Free'}
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
                      type="button"
                      role="radio"
                      aria-checked={formData.deliveryMethod === 'home'}
                      aria-label={locale === 'el' ? 'Επιλογή παράδοσης στο σπίτι - €3.50' : 'Select home delivery - €3.50'}
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
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 md:p-5 rounded-xl border border-primary/20">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-base mb-2">
                          {locale === 'el' ? 'Ολοκλήρωση Παραγγελίας' : 'Complete Your Order'}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          {locale === 'el' 
                            ? 'Πατήστε το κουμπί "Συνέχεια στην Πληρωμή" για να ολοκληρώσετε την παραγγελία σας με ασφάλεια.' 
                            : 'Click "Continue to Payment" to securely complete your order.'}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Shield className="h-3.5 w-3.5 text-primary" />
                            <span className="font-medium">{locale === 'el' ? 'Ασφαλής πληρωμή' : 'Secure payment'}</span>
                          </div>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5 text-primary" />
                            <span>{locale === 'el' ? 'Δεν αποθηκεύουμε στοιχεία κάρτας' : 'We don\'t store card details'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-primary/10 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                      <a 
                        href={locale === 'el' ? '/el/privacy-policy' : '/en/privacy-policy'} 
                        className="text-primary hover:underline inline-flex items-center gap-1"
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {locale === 'el' ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
                      </a>
                      <span className="text-muted-foreground hidden sm:inline">•</span>
                      <a 
                        href={locale === 'el' ? '/el/return-policy' : '/en/return-policy'} 
                        className="text-primary hover:underline inline-flex items-center gap-1"
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {locale === 'el' ? 'Πολιτική Επιστροφών' : 'Return Policy'}
                      </a>
                      <span className="text-muted-foreground hidden sm:inline">•</span>
                      <a 
                        href={locale === 'el' ? '/el/terms-and-conditions' : '/en/terms-and-conditions'} 
                        className="text-primary hover:underline inline-flex items-center gap-1"
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {locale === 'el' ? 'Όροι και Προϋποθέσεις' : 'Terms and Conditions'}
                      </a>
                    </div>
                  </div>

                  {/* Desktop buttons - hidden on mobile (shown in sticky bar) */}
                  <div className="hidden lg:flex flex-col sm:flex-row gap-3 md:gap-4 mt-6">
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
          )}

          {/* Desktop buttons - hidden on mobile (shown in sticky bar) */}
          {step < 3 && (
            <div className="hidden lg:flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
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

          {/* Right Column - Order Summary Sidebar (1/3 on desktop, full width on mobile) */}
          <div className="lg:col-span-1">
            {/* Mobile: Show compact Order Summary above forms */}
            <div className="lg:hidden mb-4">
              {renderOrderSummary(false, true)}
            </div>
            
            {/* Desktop: Show compact sticky sidebar */}
            <div className="hidden lg:block">
              {renderOrderSummary(true)}
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t-2 shadow-lg z-50 p-4 safe-area-inset-bottom">
          <div className="container mx-auto">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <p className="text-xs text-muted-foreground">{locale === 'el' ? 'Σύνολο' : 'Total'}</p>
                <p className={`text-xl font-bold ${hasAnyDiscount ? 'text-magenta-600' : 'text-primary'}`}>
                  {formatPrice(total, locale)}
                </p>
              </div>
              {step < 3 ? (
                <Button 
                  onClick={handleContinue} 
                  size="lg" 
                  className="flex-1 text-base shadow-sm hover:shadow-md transition-all"
                >
                  {locale === 'el' ? 'Συνέχεια' : 'Continue'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button
                  onClick={handlePayment}
                  size="lg"
                  className="flex-1 text-base shadow-sm hover:shadow-md transition-all"
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
                        {locale === 'el' ? 'Πληρωμή' : 'Pay'}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                </Button>
              )}
            </div>
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => {
                  setStep(step - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                size="sm"
                className="w-full border-2 text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {locale === 'el' ? 'Πίσω' : 'Back'}
              </Button>
            )}
          </div>
        </div>

        {/* Spacer for mobile sticky bar */}
        <div className="lg:hidden h-32" />
      </div>
    </div>
  );
}
