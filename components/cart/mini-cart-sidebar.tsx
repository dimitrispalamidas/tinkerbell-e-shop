"use client"

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';
import { getProductDiscountInfo } from '@/lib/utils/discounts';
import { validateStock } from '@/lib/utils/stock';
import { X, ShoppingBag, Trash2, ArrowRight, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MiniCartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MiniCartSidebar({ isOpen, onClose }: MiniCartSidebarProps) {
  const locale = useLocale();
  
  const { items, removeItem, updateQuantity, getTotal, getSubtotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  const handleQuantityChange = async (
    itemId: string,
    newQuantity: number,
    size?: string,
    color?: string
  ) => {
    // Validate stock before updating
    const validation = await validateStock(itemId, newQuantity, size, color);
    
    if (!validation.valid) {
      const message = validation.availableStock === 0
        ? (locale === 'el' ? 'Το προϊόν δεν είναι διαθέσιμο' : 'Product out of stock')
        : (locale === 'el' 
            ? `Μόνο ${validation.availableStock} διαθέσιμα` 
            : `Only ${validation.availableStock} available`);
      
      toast.error(message);
      return;
    }

    // Update quantity if validation passed
    updateQuantity(itemId, newQuantity, size, color);
  };

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-background shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-lg font-bold">
                  {locale === 'el' ? 'Το Καλάθι σας' : 'Your Cart'}
                </h2>
                <span className="text-sm font-bold text-primary">
                  ({items.length})
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-all duration-200 hover:rotate-90"
              aria-label={locale === 'el' ? 'Κλείσιμο καλαθιού' : 'Close cart'}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ShoppingBag className="h-10 w-10 text-primary" />
                </div>
                <p className="text-foreground font-medium mb-2">
                  {locale === 'el' ? 'Το καλάθι σας είναι άδειο' : 'Your cart is empty'}
                </p>
                <p className="text-muted-foreground text-sm mb-6">
                  {locale === 'el' ? 'Προσθέστε προϊόντα για να συνεχίσετε' : 'Add products to continue'}
                </p>
                <Button 
                  onClick={onClose} 
                  variant="outline"
                  size="lg"
                  className="border-2"
                >
                  {locale === 'el' ? 'Συνεχίστε τις Αγορές' : 'Continue Shopping'}
                  <ShoppingBag className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.size}-${item.color}`}
                    className="group relative flex gap-3 p-4 bg-background border border-border rounded-xl hover:shadow-md transition-all duration-200"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-border">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="pr-6">
                        <div className="flex items-start gap-2">
                          <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">{item.name}</h3>
                          {(() => {
                            const itemTotal = item.price * item.quantity;
                            const discountInfo = getProductDiscountInfo(
                              itemTotal,
                              item.product_discounts
                            );
                            if (discountInfo.activeDiscount) {
                              return (
                                <span className="px-2 py-0.5 rounded text-xs font-light bg-magenta-100 text-magenta-700 whitespace-nowrap flex-shrink-0">
                                  {discountInfo.activeDiscount.discount_type === 'percentage'
                                    ? `-${discountInfo.activeDiscount.discount_value}%`
                                    : `-${formatPrice(discountInfo.activeDiscount.discount_value, locale)}`}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {item.size && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">{locale === 'el' ? 'Μέγεθος' : 'Size'}:</span>
                            <span>{item.size}</span>
                          </span>
                        )}
                        {item.color && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">{locale === 'el' ? 'Χρώμα' : 'Color'}:</span>
                            <span>{item.color}</span>
                          </span>
                        )}
                      </div>
                      
                      {/* Quantity Controls & Price */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-0.5 border-2 border-border rounded-lg overflow-hidden bg-background">
                          <button
                            onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1), item.size, item.color)}
                            className="p-2 hover:bg-primary/10 active:bg-primary/20 transition-colors"
                            aria-label={locale === 'el' ? 'Μείωση ποσότητας' : 'Decrease quantity'}
                            type="button"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <span className="px-3 text-sm font-semibold min-w-[32px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.size, item.color)}
                            className="p-2 hover:bg-primary/10 active:bg-primary/20 transition-colors"
                            aria-label={locale === 'el' ? 'Αύξηση ποσότητας' : 'Increase quantity'}
                            type="button"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                        
                        {(() => {
                          const itemTotal = item.price * item.quantity;
                          const discountInfo = getProductDiscountInfo(
                            itemTotal,
                            item.product_discounts,
                            item.quantity
                          );
                          return (
                            <div className="flex flex-col items-end gap-0.5">
                              {discountInfo.activeDiscount ? (
                                <>
                                  <p className="text-xs text-muted-foreground line-through">
                                    {formatPrice(itemTotal, locale)}
                                  </p>
                                  <p className="text-sm font-extrabold text-magenta-600">
                                    {formatPrice(discountInfo.finalPrice, locale)}
                                  </p>
                                </>
                              ) : (
                                <p className="text-sm font-extrabold text-primary">
                                  {formatPrice(itemTotal, locale)}
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id, item.size, item.color)}
                      className="absolute top-3 right-3 p-1.5 hover:bg-destructive/10 rounded-md transition-colors text-muted-foreground hover:text-destructive group/remove"
                      aria-label={locale === 'el' ? 'Αφαίρεση προϊόντος από το καλάθι' : 'Remove item from cart'}
                      type="button"
                      title={locale === 'el' ? 'Αφαίρεση' : 'Remove'}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Total & Actions */}
          {items.length > 0 && (
            <div className="border-t bg-muted/50 p-4 space-y-4">
              {/* Total */}
              {(() => {
                const subtotal = getSubtotal();
                const total = getTotal();
                const hasDiscount = subtotal > total;
                
                return (
                  <div className="flex justify-between items-center px-1">
                    <span className="text-base font-bold text-foreground">
                      {locale === 'el' ? 'Σύνολο' : 'Total'}
                    </span>
                    <div className="flex flex-col items-end gap-0.5">
                      {hasDiscount ? (
                        <>
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(subtotal, locale)}
                          </span>
                          <span className="text-xl font-bold text-magenta-600">
                            {formatPrice(total, locale)}
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(total, locale)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <Link href="/checkout" onClick={onClose} className="block">
                  <Button 
                    size="lg" 
                    className="w-full group shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <span className="flex-1 text-center">
                      {locale === 'el' ? 'Ολοκλήρωση Παραγγελίας' : 'Proceed to Checkout'}
                    </span>
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/shop" onClick={onClose} className="block">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full border-2 group"
                  >
                    <span className="flex-1 text-center">
                      {locale === 'el' ? 'Συνεχίστε τις Αγορές' : 'Continue Shopping'}
                    </span>
                    <ShoppingBag className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}

