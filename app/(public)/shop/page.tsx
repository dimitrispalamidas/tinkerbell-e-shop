import { getTranslations, getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; category?: string }>;
}) {
  const locale = await getLocale();
  const { type, category } = await searchParams;
  const t = await getTranslations('shop');
  const tCommon = await getTranslations('common');

  const supabase = await createClient();
  
  let query = supabase
    .from('products')
    .select('*, categories(*), product_variants(*)')
    .eq('status', 'active');

  if (type) {
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('type', type);
    
    if (categories && categories.length > 0) {
      const categoryIds = categories.map(c => c.id);
      query = query.in('category_id', categoryIds);
    }
  }

  if (category) {
    query = query.eq('category_id', category);
  }

  const { data: products } = await query.order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{t('all_products')}</h1>
        {products && (
          <p className="text-muted-foreground">
            {t('showing_results', { count: products.length })}
          </p>
        )}
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full group">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={locale === 'el' ? product.name_el : product.name_en}
                        width={400}
                        height={400}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <ShoppingBag className="h-20 w-20 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">
                      {locale === 'el' ? product.name_el : product.name_en}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {locale === 'el' ? product.description_el : product.description_en}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(product.price, locale)}
                      </p>
                      {(() => {
                        // Check if product has stock in any variant
                        const hasStock = product.product_variants && 
                          product.product_variants.some((v: any) => v.stock > 0);
                        
                        return hasStock ? (
                          <span className="text-xs bg-mint/30 text-green-700 px-2 py-1 rounded">
                            {t('in_stock')}
                          </span>
                        ) : (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                            {t('out_of_stock')}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">{t('no_products')}</p>
        </div>
      )}
    </div>
  );
}

