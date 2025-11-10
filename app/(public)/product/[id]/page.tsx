import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import { ProductClient } from './product-client';
import { ProductGallery } from './product-gallery';
import type { Product } from '@/lib/types/database';
import type { Metadata } from 'next';
import Link from 'next/link';

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

  // Prepare structured data for SEO
  const productName = locale === 'el' ? product.name_el : product.name_en;
  const description = locale === 'el' ? product.description_el : product.description_en;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tinkerbell.gr';
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productName,
    "description": description || productName,
    "image": product.images || [],
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": "Τινκερμπελ"
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/product/${id}`,
      "priceCurrency": "EUR",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Τινκερμπελ"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-sage-50/10 to-cream-50/20">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Premium Breadcrumb/Back Navigation */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-16 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/shop"
            className="inline-flex items-center text-sm text-sage-600 hover:text-magenta-600 transition-colors font-light"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {locale === 'el' ? 'Πίσω στα Προϊόντα' : 'Back to Products'}
          </Link>
        </div>
      </div>

      {/* Premium Product Section */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 max-w-7xl mx-auto">
          {/* Product Images */}
          <div className="relative">
            <ProductGallery
              images={product.images || []}
              productName={locale === 'el' ? product.name_el : product.name_en}
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6 md:space-y-8">
            {/* Title Section */}
            <div className="border-b border-sage-100 pb-6">
              <p className="text-xs md:text-sm tracking-[0.2em] uppercase text-sage-600 mb-3 font-light">
                {locale === 'el' ? 'Κωδικός' : 'SKU'}: {product.sku}
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-sage-900 tracking-tight mb-4">
                {locale === 'el' ? product.name_el : product.name_en}
              </h1>
              <p className="text-3xl md:text-4xl font-light text-sage-800 tracking-wide">
                {formatPrice(product.price, locale)}
              </p>
            </div>

            {/* Description */}
            {product.description_el && product.description_en && (
              <div className="space-y-3">
                <h3 className="text-sm tracking-[0.2em] uppercase text-sage-600 font-light">
                  {locale === 'el' ? 'Περιγραφή' : 'Description'}
                </h3>
                <p className="text-base md:text-lg text-sage-700 leading-relaxed font-light">
                  {locale === 'el' ? product.description_el : product.description_en}
                </p>
              </div>
            )}

            {/* Product Selection */}
            <ProductClient
              product={product as Product}
              variants={variants || []}
              locale={locale}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

