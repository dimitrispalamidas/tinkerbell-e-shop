"use client"

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart';
import { toast } from 'sonner';
import type { Product, ProductVariant } from '@/lib/types/database';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { useFlyToCart } from '@/lib/hooks/use-fly-to-cart';

interface ProductClientProps {
  product: Product;
  variants: ProductVariant[];
  locale: string;
}

export function ProductClient({ product, variants, locale }: ProductClientProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [availableStock, setAvailableStock] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);
  const { flyToCart } = useFlyToCart();

  // Get quantity already in cart for specific variant
  const getCartQuantity = (size: string, color: string): number => {
    const cartItem = cartItems.find(
      item => item.id === product.id && item.size === size && item.color === color
    );
    return cartItem?.quantity || 0;
  };

  // Auto-select first available color on mount
  useEffect(() => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      // Find the first color that has available stock
      const firstAvailableColor = product.colors.find(color => {
        return variants.some(v => {
          if (v.color !== color) return false;
          const cartQty = getCartQuantity(v.size, v.color);
          return v.stock > cartQty;
        });
      });
      
      if (firstAvailableColor) {
        setSelectedColor(firstAvailableColor);
      }
    }
  }, [product.colors, variants]);

  // Update available stock when size/color changes
  useEffect(() => {
    if (selectedSize && selectedColor) {
      const variant = variants.find(v => v.size === selectedSize && v.color === selectedColor);
      const dbStock = variant?.stock || 0;
      const cartQty = getCartQuantity(selectedSize, selectedColor);
      // Available stock = database stock - what's already in cart
      setAvailableStock(Math.max(0, dbStock - cartQty));
      setQuantity(1); // Reset quantity when variant changes
    } else {
      setAvailableStock(0);
    }
  }, [selectedSize, selectedColor, variants, cartItems]);

  const getVariantStock = (size: string, color: string): number => {
    const variant = variants.find(v => v.size === size && v.color === color);
    return variant?.stock || 0;
  };


  const handleAddToCart = () => {
    // Prevent multiple clicks while adding to cart
    if (isAddingToCart) {
      return;
    }

    if (product.sizes.length > 0 && !selectedSize) {
      toast.error(locale === 'el' ? 'Επιλέξτε μέγεθος' : 'Select size');
      return;
    }
    if (product.colors.length > 0 && !selectedColor) {
      toast.error(locale === 'el' ? 'Επιλέξτε χρώμα' : 'Select color');
      return;
    }

    // Check variant stock
    if (variants.length > 0) {
      if (availableStock === 0) {
        toast.error(locale === 'el' ? 'Εξαντλημένο' : 'Out of stock');
        return;
      }
      if (quantity > availableStock) {
        toast.error(`${locale === 'el' ? 'Μόνο' : 'Only'} ${availableStock} ${locale === 'el' ? 'διαθέσιμα' : 'available'}`);
        return;
      }
    }

    // Set loading state to prevent multiple additions
    setIsAddingToCart(true);

    try {
      addItem({
        id: product.id,
        name: locale === 'el' ? product.name_el : product.name_en,
        price: product.price,
        quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        image: product.images[0] || undefined,
        stock: availableStock, // Pass current stock for validation
      });

      // Trigger flying animation
      if (addToCartButtonRef.current && product.images[0]) {
        flyToCart({
          imageUrl: product.images[0],
          sourceElement: addToCartButtonRef.current,
        });
      }
    } finally {
      // Reset loading state after a short delay to prevent rapid clicking
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 500);
    }
  };

  // Get available sizes based on selected color
  const getAvailableSizes = (): string[] => {
    if (!selectedColor || product.sizes.length === 0) {
      return product.sizes;
    }
    // Return only sizes that have stock for the selected color (accounting for cart)
    return product.sizes.filter(size => {
      const variant = variants.find(v => v.size === size && v.color === selectedColor);
      if (!variant) return false;
      const dbStock = variant.stock;
      const cartQty = getCartQuantity(size, selectedColor);
      return dbStock > cartQty; // Available if DB stock is more than what's in cart
    });
  };

  return (
    <div className="space-y-8 bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-sage-100">
      {/* Color Selection - Show First */}
      {product.colors && product.colors.length > 0 && (
        <div className="space-y-4">
          <label className="block text-sm tracking-[0.2em] uppercase text-sage-600 font-light">
            {locale === 'el' ? 'Επιλέξτε Χρώμα' : 'Select Color'}
          </label>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => {
              // Check if this color has any size with available stock (not in cart)
              const available = variants.some(v => {
                if (v.color !== color) return false;
                const cartQty = getCartQuantity(v.size, v.color);
                return v.stock > cartQty;
              });
              return (
                <button
                  key={color}
                  onClick={() => {
                    if (available) {
                      setSelectedColor(selectedColor === color ? '' : color);
                      // Reset size when color changes or is deselected
                      if (selectedColor !== color) {
                        setSelectedSize('');
                      }
                    }
                  }}
                  disabled={!available}
                  className={`px-6 py-3 rounded-full border-2 transition-all duration-300 font-light relative ${
                    selectedColor === color
                      ? 'bg-magenta-600 text-white border-magenta-600 shadow-md scale-105'
                      : available
                      ? 'bg-sage-50 hover:bg-sage-100 border-sage-300 hover:border-sage-500 text-sage-900 shadow-sm'
                      : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed opacity-50'
                  }`}
                >
                  {color}
                  {!available && (
                    <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                      ✕
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection - Show Only Available Sizes */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="space-y-4">
          <label className="block text-sm tracking-[0.2em] uppercase text-sage-600 font-light">
            {locale === 'el' ? 'Επιλέξτε Μέγεθος' : 'Select Size'}
          </label>
          {!selectedColor && product.colors.length > 0 ? (
            <p className="text-sm text-sage-500 font-light italic bg-sage-50/50 px-4 py-3 rounded-lg">
              {locale === 'el' ? 'Επίλεξε πρώτα χρώμα' : 'Select a color first'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {getAvailableSizes().map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                  className={`px-6 py-3 rounded-full border-2 transition-all duration-300 font-light min-w-[3.5rem] ${
                    selectedSize === size
                      ? 'bg-magenta-600 text-white border-magenta-600 shadow-md scale-105'
                      : 'bg-sage-50 hover:bg-sage-100 border-sage-300 hover:border-sage-500 text-sage-900 shadow-sm'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quantity */}
      <div className="space-y-4">
        <label className="block text-sm tracking-[0.2em] uppercase text-sage-600 font-light">
          {locale === 'el' ? 'Ποσότητα' : 'Quantity'}
        </label>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center border-2 border-sage-200 rounded-full overflow-hidden bg-white">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="rounded-none h-12 w-12 hover:bg-sage-50"
            >
              <Minus className="h-4 w-4 text-sage-700" />
            </Button>
            <span className="px-6 py-2 min-w-[4rem] text-center font-light text-sage-900">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // Only increase if we have stock available
                if (variants.length > 0) {
                  // Product with variants - check everything
                  if (selectedSize && selectedColor && availableStock > 0 && quantity < availableStock) {
                    setQuantity(prev => prev + 1);
                  }
                } else {
                  // Simple product without variants
                  setQuantity(prev => prev + 1);
                }
              }}
              disabled={
                variants.length > 0
                  ? !selectedSize || !selectedColor || availableStock === 0 || quantity >= availableStock
                  : false
              }
              className="rounded-none h-12 w-12 hover:bg-sage-50"
            >
              <Plus className="h-4 w-4 text-sage-700" />
            </Button>
          </div>
          {selectedSize && selectedColor && variants.length > 0 ? (
            <div className="flex flex-col gap-1.5 bg-sage-50/50 px-4 py-2 rounded-lg">
              <span className={`text-sm font-light ${availableStock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {availableStock > 0
                  ? `${availableStock} ${locale === 'el' ? (availableStock === 1 ? 'διαθέσιμο' : 'διαθέσιμα') : 'in stock'}`
                  : (locale === 'el' ? 'Εξαντλημένο' : 'Out of stock')}
                {availableStock === 1 && (
                  <span className="ml-2 text-orange-700 font-medium">({locale === 'el' ? 'Τελευταίο' : 'Last one'}!)</span>
                )}
                {availableStock === 2 && (
                  <span className="ml-2 text-orange-700 font-medium">({locale === 'el' ? 'Τελευταία' : 'Last few'}!)</span>
                )}
              </span>
              {(() => {
                const cartQty = getCartQuantity(selectedSize, selectedColor);
                if (cartQty > 0) {
                  return (
                    <span className="text-xs text-blue-700 font-light">
                      {locale === 'el' 
                        ? `${cartQty} ήδη στο καλάθι` 
                        : `${cartQty} already in cart`}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          ) : (
            <span className="text-sm text-sage-500 font-light italic">
              {locale === 'el' ? 'Επίλεξε μέγεθος & χρώμα' : 'Select size & color'}
            </span>
          )}
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        ref={addToCartButtonRef}
        size="lg"
        className="w-full bg-magenta-600 hover:bg-magenta-700 text-white py-6 rounded-full text-base md:text-lg font-light tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        onClick={handleAddToCart}
        disabled={isAddingToCart || (variants.length > 0 && availableStock === 0)}
      >
        <ShoppingCart className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
        {isAddingToCart 
          ? (locale === 'el' ? 'Προσθήκη...' : 'Adding...')
          : (locale === 'el' ? 'Προσθήκη στο Καλάθι' : 'Add to Cart')
        }
      </Button>
    </div>
  );
}

