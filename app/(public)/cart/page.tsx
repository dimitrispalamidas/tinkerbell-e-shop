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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('your_cart')}</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={`${item.id}-${item.size}-${item.color}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
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

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 truncate">{item.name}</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {item.size && (
                        <p>{tCommon('size')}: {item.size}</p>
                      )}
                      {item.color && (
                        <p>{tCommon('color')}: {item.color}</p>
                      )}
                      <p className="font-semibold text-foreground">
                        {formatPrice(item.price, locale)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col items-end justify-between">
                    <div className="flex items-center gap-2 border rounded-md">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.size, item.color)}
                        className="px-2 py-1 hover:bg-accent"
                      >
                        −
                      </button>
                      <span className="px-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                        className="px-2 py-1 hover:bg-accent"
                      >
                        +
                      </button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id, item.size, item.color)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t('remove')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold">{tCommon('subtotal')}</h2>
              
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
                  <span className="text-primary">{formatPrice(getTotal(), locale)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button size="lg" className="w-full">
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

