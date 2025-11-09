"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart';
import { toast } from 'sonner';
import type { Product, ProductVariant } from '@/lib/types/database';
import { ShoppingCart, Minus, Plus } from 'lucide-react';

interface ProductClientProps {
  product: Product;
  variants: ProductVariant[];
  locale: string;
  translations: {
    selectSize: string;
    selectColor: string;
    addToCart: string;
    quantity: string;
    outOfStock: string;
    inStock: string;
  };
}

export function ProductClient({ product, variants, locale, translations }: ProductClientProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [availableStock, setAvailableStock] = useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  // Get quantity already in cart for specific variant
  const getCartQuantity = (size: string, color: string): number => {
    const cartItem = cartItems.find(
      item => item.id === product.id && item.size === size && item.color === color
    );
    return cartItem?.quantity || 0;
  };

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
  }, [selectedSize, selectedColor, variants, cartItems, getCartQuantity]);

  const getVariantStock = (size: string, color: string): number => {
    const variant = variants.find(v => v.size === size && v.color === color);
    return variant?.stock || 0;
  };


  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error(translations.selectSize);
      return;
    }
    if (product.colors.length > 0 && !selectedColor) {
      toast.error(translations.selectColor);
      return;
    }

    // Check variant stock
    if (variants.length > 0) {
      if (availableStock === 0) {
        toast.error(translations.outOfStock);
        return;
      }
      if (quantity > availableStock) {
        toast.error(`${locale === 'el' ? 'Μόνο' : 'Only'} ${availableStock} ${locale === 'el' ? 'διαθέσιμα' : 'available'}`);
        return;
      }
    }

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

    toast.success(locale === 'el' ? 'Προστέθηκε στο καλάθι!' : 'Added to cart!');
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
    <div className="space-y-6">
      {/* Color Selection - Show First */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <label className="block font-semibold mb-2">{translations.selectColor}</label>
          <div className="flex flex-wrap gap-2">
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
                  className={`px-4 py-2 rounded-md border transition-colors relative ${
                    selectedColor === color
                      ? 'bg-primary text-primary-foreground border-primary'
                      : available
                      ? 'bg-background hover:bg-accent border-border'
                      : 'bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-50'
                  }`}
                >
                  {color}
                  {!available && (
                    <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white px-1 rounded">
                      X
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
        <div>
          <label className="block font-semibold mb-2">{translations.selectSize}</label>
          {!selectedColor && product.colors.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {locale === 'el' ? 'Επίλεξε πρώτα χρώμα' : 'Select a color first'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {getAvailableSizes().map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                  className={`px-4 py-2 rounded-md border transition-colors ${
                    selectedSize === size
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-accent border-border'
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
      <div>
        <label className="block font-semibold mb-2">{translations.quantity}</label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (variants.length > 0 && availableStock > 0) {
                  setQuantity(Math.min(availableStock, quantity + 1));
                }
              }}
              disabled={variants.length > 0 && quantity >= availableStock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {selectedSize && selectedColor && variants.length > 0 ? (
            <div className="flex flex-col gap-1">
              <span className={`text-sm font-medium ${availableStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {availableStock > 0
                  ? `${availableStock} ${locale === 'el' ? (availableStock === 1 ? 'διαθέσιμο' : 'διαθέσιμα') : 'in stock'}`
                  : translations.outOfStock}
                {availableStock === 1 && (
                  <span className="ml-2 text-orange-600">({locale === 'el' ? 'Τελευταίο' : 'Last one'}!)</span>
                )}
                {availableStock === 2 && (
                  <span className="ml-2 text-orange-600">({locale === 'el' ? 'Τελευταία' : 'Last few'}!)</span>
                )}
              </span>
              {(() => {
                const cartQty = getCartQuantity(selectedSize, selectedColor);
                if (cartQty > 0) {
                  return (
                    <span className="text-xs text-blue-600">
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
            <span className="text-sm text-muted-foreground">
              {locale === 'el' ? 'Επίλεξε μέγεθος & χρώμα' : 'Select size & color'}
            </span>
          )}
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        size="lg"
        className="w-full"
        onClick={handleAddToCart}
        disabled={variants.length > 0 && availableStock === 0}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {translations.addToCart}
      </Button>
    </div>
  );
}

