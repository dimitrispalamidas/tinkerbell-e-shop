"use client"

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function CartPage() {
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">{t('empty_cart')}</h1>
          <Link href="/shop">
            <Button size="lg">
              {t('continue_shopping')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">{t('your_cart')}</h1>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {items.map((item) => (
            <Card key={`${item.id}-${item.size}-${item.color}`}>
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-md overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Product Details & Actions */}
                  <div className="flex-1 flex flex-col gap-3">
                    {/* Product Info */}
                    <div className="text-center sm:text-left">
                      <h3 className="font-semibold mb-1 text-sm md:text-base">{item.name}</h3>
                      <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                        {item.size && (
                          <p>{tCommon('size')}: {item.size}</p>
                        )}
                        {item.color && (
                          <p>{tCommon('color')}: {item.color}</p>
                        )}
                        <p className="font-semibold text-foreground text-base md:text-lg">
                          {formatPrice(item.price, locale)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex items-center justify-between gap-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 border rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.size, item.color)}
                          className="px-3 py-2 hover:bg-accent text-lg font-semibold"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 min-w-[40px] text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                          className="px-3 py-2 hover:bg-accent text-lg font-semibold"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id, item.size, item.color)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">{t('remove')}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 order-last lg:order-none">
          <Card className="lg:sticky lg:top-20">
            <CardContent className="p-4 md:p-6 space-y-4">
              <h2 className="text-lg md:text-xl font-bold">{tCommon('subtotal')}</h2>
              
              <div className="space-y-2 text-xs md:text-sm max-h-[200px] overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between gap-2">
                    <span className="text-muted-foreground truncate">
                      {item.quantity} × {item.name}
                    </span>
                    <span className="font-medium whitespace-nowrap">{formatPrice(item.price * item.quantity, locale)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-base md:text-lg font-bold">
                  <span>{tCommon('total')}</span>
                  <span className="text-primary">{formatPrice(getTotal(), locale)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button size="lg" className="w-full text-base">
                  {t('proceed_to_checkout')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/shop">
                <Button variant="outline" className="w-full">
                  {t('continue_shopping')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

