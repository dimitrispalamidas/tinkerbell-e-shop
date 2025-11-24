'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { getProductDiscountInfo } from '@/lib/utils/discounts';
import { ShoppingBag } from 'lucide-react';
import type { CatalogProduct } from '@/lib/types/catalog';

interface ProductCardProps {
  product: CatalogProduct;
  locale: string;
  index: number;
  isVisible: boolean;
}

export const ProductCard = memo(function ProductCard({ product, locale, index, isVisible }: ProductCardProps) {
  const discountInfo = getProductDiscountInfo(
    product.price,
    (product as any).product_discounts
  );

  return (
    <Link 
      href={`/product/${product.id}`}
      className={`transition-all duration-700 delay-${Math.min(index * 50, 500)} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 h-full group border-sage-100/50 hover:-translate-y-2">
        <CardContent className="p-0">
          {/* Product Image */}
          <div className="aspect-square bg-gradient-to-br from-sage-50/30 to-mint-50/20 flex items-center justify-center overflow-hidden relative">
            {product.images && product.images[0] ? (
              <>
                <Image
                  src={product.images[0]}
                  alt={locale === 'el' ? product.name_el : product.name_en}
                  width={400}
                  height={400}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 400px, (max-width: 1024px) 400px, 400px"
                  loading={index < 8 ? 'eager' : 'lazy'}
                  quality={75}
                />
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-sage-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </>
            ) : (
              <ShoppingBag className="h-12 w-12 md:h-20 md:w-20 text-sage-300" />
            )}
            
            {/* Floating Badge */}
            <div className="absolute top-3 right-3 bg-cream-50/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <span className="text-xs font-light text-sage-900">
                {locale === 'el' ? 'Δείτε' : 'View'}
              </span>
            </div>
          </div>

          {/* Product Details */}
          <div className="p-3 md:p-4 bg-white">
            <h3 className="text-sm md:text-base font-light text-sage-900 mb-1 md:mb-2 line-clamp-2 leading-snug">
              {locale === 'el' ? product.name_el : product.name_en}
            </h3>
            <p className="text-xs md:text-sm text-sage-600/70 mb-2 line-clamp-1 md:line-clamp-2 font-light">
              {locale === 'el' ? product.description_el : product.description_en}
            </p>
            <div className="space-y-1">
              {discountInfo.activeDiscount ? (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base md:text-lg font-light text-sage-800 tracking-wide line-through text-sage-500">
                      {formatPrice(product.price, locale)}
                    </p>
                    <span className="px-2 py-0.5 rounded text-xs font-light bg-magenta-100 text-magenta-700">
                      {discountInfo.activeDiscount.discount_type === 'percentage'
                        ? `-${discountInfo.activeDiscount.discount_value}%`
                        : `-${formatPrice(discountInfo.activeDiscount.discount_value, locale)}`}
                    </span>
                  </div>
                  <p className="text-lg md:text-xl font-light text-magenta-600 tracking-wide">
                    {formatPrice(discountInfo.finalPrice, locale)}
                  </p>
                </>
              ) : (
                <p className="text-base md:text-lg font-light text-sage-800 tracking-wide">
                  {formatPrice(product.price, locale)}
                </p>
              )}
            </div>
          </div>

          {/* Bottom Accent */}
          <div className="h-1 bg-gradient-to-r from-sage-400 to-mint-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </CardContent>
      </Card>
    </Link>
  );
});

