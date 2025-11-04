"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart';
import { toast } from 'sonner';
import type { Product, ProductVariant } from '@/lib/types/database';
import { formatPrice } from '@/lib/utils';
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

  // Update available stock when size/color changes
  useEffect(() => {
    if (selectedSize && selectedColor) {
      const variant = variants.find(v => v.size === selectedSize && v.color === selectedColor);
      setAvailableStock(variant?.stock || 0);
      setQuantity(1); // Reset quantity when variant changes
    } else {
      setAvailableStock(0);
    }
  }, [selectedSize, selectedColor, variants]);

  const getVariantStock = (size: string, color: string): number => {
    const variant = variants.find(v => v.size === size && v.color === color);
    return variant?.stock || 0;
  };

  const isVariantAvailable = (size?: string, color?: string): boolean => {
    if (!size && !color) return true;
    if (size && !selectedColor) {
      // Check if this size has any color with stock
      return variants.some(v => v.size === size && v.stock > 0);
    }
    if (color && !selectedSize) {
      // Check if this color has any size with stock
      return variants.some(v => v.color === color && v.stock > 0);
    }
    if (size && color) {
      return getVariantStock(size, color) > 0;
    }
    return false;
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
    });

    toast.success(locale === 'el' ? 'Προστέθηκε στο καλάθι!' : 'Added to cart!');
  };

  return (
    <div className="space-y-6">
      {/* Size Selection */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <label className="block font-semibold mb-2">{translations.selectSize}</label>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => {
              const available = isVariantAvailable(size, selectedColor || undefined);
              return (
                <button
                  key={size}
                  onClick={() => available && setSelectedSize(size)}
                  disabled={!available}
                  className={`px-4 py-2 rounded-md border transition-colors relative ${
                    selectedSize === size
                      ? 'bg-primary text-primary-foreground border-primary'
                      : available
                      ? 'bg-background hover:bg-accent border-border'
                      : 'bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-50'
                  }`}
                >
                  {size}
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

      {/* Color Selection */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <label className="block font-semibold mb-2">{translations.selectColor}</label>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => {
              const available = isVariantAvailable(selectedSize || undefined, color);
              return (
                <button
                  key={color}
                  onClick={() => available && setSelectedColor(color)}
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
            <span className={`text-sm font-medium ${availableStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {availableStock > 0
                ? `${availableStock} ${locale === 'el' ? 'διαθέσιμα' : 'in stock'}`
                : translations.outOfStock}
              {availableStock > 0 && availableStock <= 5 && (
                <span className="ml-2 text-orange-600">({locale === 'el' ? 'Τελευταία' : 'Last few'}!)</span>
              )}
            </span>
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

