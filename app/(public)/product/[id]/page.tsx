import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import { ProductClient } from './product-client';
import { ProductGallery } from './product-gallery';
import type { Product } from '@/lib/types/database';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const locale = await getLocale();
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (!product) {
    return {
      title: 'Προϊόν δεν βρέθηκε',
    };
  }

  const productName = locale === 'el' ? product.name_el : product.name_en;
  const description = locale === 'el' ? product.description_el : product.description_en;
  const firstImage = product.images?.[0];
  const price = formatPrice(product.price, locale);

  return {
    title: productName,
    description: description || `${productName} - ${price}`,
    openGraph: {
      title: `${productName} | Τινκερμπελ`,
      description: description || `${productName} - ${price}`,
      images: firstImage ? [
        {
          url: firstImage,
          width: 1200,
          height: 630,
          alt: productName,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${productName} | Τινκερμπελ`,
      description: description || `${productName} - ${price}`,
      images: firstImage ? [firstImage] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getLocale();
  const { id } = await params;

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
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
        {/* Product Images */}
        <ProductGallery
          images={product.images || []}
          productName={locale === 'el' ? product.name_el : product.name_en}
        />

        {/* Product Details */}
        <div className="space-y-4 md:space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {locale === 'el' ? product.name_el : product.name_en}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {locale === 'el' ? 'Κωδικός' : 'SKU'}: {product.sku}
            </p>
          </div>

          <div>
            <p className="text-2xl md:text-3xl font-bold text-primary">
              {formatPrice(product.price, locale)}
            </p>
          </div>

          {product.description_el && product.description_en && (
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-2">
                {locale === 'el' ? 'Περιγραφή' : 'Description'}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                {locale === 'el' ? product.description_el : product.description_en}
              </p>
            </div>
          )}

          <ProductClient
            product={product as Product}
            variants={variants || []}
            locale={locale}
            translations={{
              selectSize: locale === 'el' ? 'Επιλέξτε Μέγεθος' : 'Select Size',
              selectColor: locale === 'el' ? 'Επιλέξτε Χρώμα' : 'Select Color',
              addToCart: locale === 'el' ? 'Προσθήκη στο Καλάθι' : 'Add to Cart',
              quantity: locale === 'el' ? 'Ποσότητα' : 'Quantity',
              outOfStock: locale === 'el' ? 'Μη Διαθέσιμο' : 'Out of Stock',
              inStock: locale === 'el' ? 'Διαθέσιμο' : 'In Stock',
            }}
          />
        </div>
      </div>
    </div>
  );
}

