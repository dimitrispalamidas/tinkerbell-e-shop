import { notFound } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import { ProductClient } from './product-client';
import { ProductGallery } from './product-gallery';
import type { Product } from '@/lib/types/database';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getLocale();
  const { id } = await params;
  const t = await getTranslations('product');
  const tCommon = await getTranslations('common');

  const supabase = await createClient();
  
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (!product) {
    notFound();
  }

  // Fetch product variants
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', id)
    .order('size')
    .order('color');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Product Images */}
        <ProductGallery
          images={product.images || []}
          productName={locale === 'el' ? product.name_el : product.name_en}
        />

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {locale === 'el' ? product.name_el : product.name_en}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('sku')}: {product.sku}
            </p>
          </div>

          <div>
            <p className="text-3xl font-bold text-primary">
              {formatPrice(product.price, locale)}
            </p>
          </div>

          {product.description_el && product.description_en && (
            <div>
              <h3 className="font-semibold mb-2">{t('description')}</h3>
              <p className="text-muted-foreground">
                {locale === 'el' ? product.description_el : product.description_en}
              </p>
            </div>
          )}

          <ProductClient
            product={product as Product}
            variants={variants || []}
            locale={locale}
            translations={{
              selectSize: t('select_size'),
              selectColor: t('select_color'),
              addToCart: tCommon('add_to_cart'),
              quantity: tCommon('quantity'),
              outOfStock: locale === 'el' ? 'Μη διαθέσιμο' : 'Out of stock',
              inStock: locale === 'el' ? 'Διαθέσιμο' : 'In stock',
            }}
          />
        </div>
      </div>
    </div>
  );
}

