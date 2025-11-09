"use client"

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';
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
  
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
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
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-background shadow-xl z-[70] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">
                {locale === 'el' ? 'Το Καλάθι σας' : 'Your Cart'}
              </h2>
              <span className="text-sm text-muted-foreground">({items.length})</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {locale === 'el' ? 'Το καλάθι σας είναι άδειο' : 'Your cart is empty'}
                </p>
                <Button onClick={onClose} variant="outline">
                  {locale === 'el' ? 'Συνεχίστε τις Αγορές' : 'Continue Shopping'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.size}-${item.color}`}
                    className="flex gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-background rounded-md overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="font-medium text-sm truncate">{item.name}</h3>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {item.size && (
                          <p>{locale === 'el' ? 'Μέγεθος' : 'Size'}: {item.size}</p>
                        )}
                        {item.color && (
                          <p>{locale === 'el' ? 'Χρώμα' : 'Color'}: {item.color}</p>
                        )}
                      </div>
                      
                      {/* Quantity Controls & Price */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 border rounded">
                          <button
                            onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1), item.size, item.color)}
                            className="p-1 hover:bg-accent transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-medium min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.size, item.color)}
                            className="p-1 hover:bg-accent transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <p className="text-xs font-semibold">
                          {formatPrice(item.price * item.quantity, locale)}
                        </p>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id, item.size, item.color)}
                      className="flex-shrink-0 p-2 hover:bg-background rounded-md transition-colors text-destructive self-start"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Total & Actions */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>{locale === 'el' ? 'Σύνολο' : 'Total'}</span>
                <span className="text-primary">{formatPrice(getTotal(), locale)}</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Link href="/checkout" onClick={onClose} className="block">
                  <Button size="lg" className="w-full">
                    {locale === 'el' ? 'Ολοκλήρωση Παραγγελίας' : 'Proceed to Checkout'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/shop" onClick={onClose} className="block">
                  <Button variant="outline" className="w-full">
                    {locale === 'el' ? 'Συνεχίστε τις Αγορές' : 'Continue Shopping'}
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

