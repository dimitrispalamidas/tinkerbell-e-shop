import { getLocale } from 'next-intl/server';
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

  const supabase = await createClient();
  
  // Fetch all categories for filters
  const { data: allCategories } = await supabase
    .from('categories')
    .select('*')
    .order('type', { ascending: true })
    .order('name_el', { ascending: true });
  
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
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
          {locale === 'el' ? 'Όλα τα Προϊόντα' : 'All Products'}
        </h1>
        {products && (
          <p className="text-sm md:text-base text-muted-foreground">
            {locale === 'el' ? `Εμφάνιση ${products.length} αποτελεσμάτων` : `Showing ${products.length} results`}
          </p>
        )}
      </div>

      {/* Category Filters */}
      {allCategories && allCategories.length > 0 && (
        <div className="mb-6 border-b overflow-x-auto">
          <div className="flex gap-2 md:gap-4 min-w-max pb-2">
            <Link
              href="/shop"
              className={`px-3 md:px-4 py-2 md:py-3 border-b-2 font-medium transition-colors text-sm md:text-base whitespace-nowrap ${
                !type && !category
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {locale === 'el' ? 'Όλα' : 'All'}
            </Link>
            <Link
              href="/shop?type=clothing"
              className={`px-3 md:px-4 py-2 md:py-3 border-b-2 font-medium transition-colors text-sm md:text-base whitespace-nowrap ${
                type === 'clothing' && !category
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {locale === 'el' ? 'Ρούχα' : 'Clothing'}
            </Link>
            <Link
              href="/shop?type=shoes"
              className={`px-3 md:px-4 py-2 md:py-3 border-b-2 font-medium transition-colors text-sm md:text-base whitespace-nowrap ${
                type === 'shoes' && !category
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {locale === 'el' ? 'Παπούτσια' : 'Shoes'}
            </Link>
            {allCategories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className={`px-3 md:px-4 py-2 md:py-3 border-b-2 font-medium transition-colors text-sm md:text-base whitespace-nowrap ${
                  category === cat.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {locale === 'el' ? cat.name_el : cat.name_en}
              </Link>
            ))}
          </div>
        </div>
      )}

      {products && products.length > 0 ? (
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-1 md:gap-2">
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
                      <ShoppingBag className="h-12 w-12 md:h-20 md:w-20 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-2 md:p-3">
                    <h3 className="text-sm md:text-base font-semibold mb-1 line-clamp-2">
                      {locale === 'el' ? product.name_el : product.name_en}
                    </h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2 line-clamp-1 md:line-clamp-2">
                      {locale === 'el' ? product.description_el : product.description_en}
                    </p>
                    <p className="text-sm md:text-base font-bold text-primary">
                      {formatPrice(product.price, locale)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">
            {locale === 'el' ? 'Δεν βρέθηκαν προϊόντα' : 'No products found'}
          </p>
        </div>
      )}
    </div>
  );
}

