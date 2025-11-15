import { getLocale } from 'next-intl/server';
import { getRequestBaseUrl } from '@/lib/utils/base-url';
import type { CatalogProduct } from '@/lib/types/catalog';
import { HeroVideoBackground } from '@/components/layout/hero-video-background';
import { PremiumHero } from '@/components/home/premium-hero';
import { PremiumCategories } from '@/components/home/premium-categories';
import { PremiumFeaturedProducts } from '@/components/home/premium-featured-products';
import { PremiumBaptismCta } from '@/components/home/premium-baptism-cta';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  
  return {
    title: locale === 'el' 
      ? 'Τινκερμπελ - Παιδικά & Εφηβικά Ρούχα και Παπούτσια | Καλαμάτα' 
      : 'Tinkerbell - Kids & Teen Clothing and Shoes | Kalamata',
    description: locale === 'el' 
      ? 'Ανακαλύψτε τη μοναδική μας συλλογή από παιδικά ρούχα, παπούτσια, και βαπτιστικά πακέτα στην Καλαμάτα. Βαπτιστικά, στολισμοί εκδηλώσεων και παιδικά είδη με αγάπη και φροντίδα.'
      : 'Discover our unique collection of kids clothing, shoes, and baptism packages in Kalamata. Baptisms, event decorations and children\'s items with love and care.',
    openGraph: {
      title: locale === 'el' 
        ? 'Τινκερμπελ - Παιδικά & Εφηβικά Ρούχα και Παπούτσια' 
        : 'Tinkerbell - Kids & Teen Clothing and Shoes',
      description: locale === 'el' 
        ? 'Ανακαλύψτε τη μοναδική μας συλλογή από παιδικά ρούχα, παπούτσια, και βαπτιστικά πακέτα.'
        : 'Discover our unique collection of kids clothing, shoes, and baptism packages.',
    },
  };
}

async function fetchFeaturedProducts(): Promise<CatalogProduct[]> {
  try {
    const baseUrl = getRequestBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/catalog/products?limit=15`,
      {
        next: { revalidate: 120 },
      }
    );

    if (!response.ok) {
      console.error('Failed to load featured products', await response.text());
      return [];
    }

    const payload = (await response.json()) as { products?: CatalogProduct[] };
    return payload.products ?? [];
  } catch (error) {
    console.error('Featured products fetch error', error);
    return [];
  }
}

export default async function HomePage() {
  const locale = await getLocale();
  const products = await fetchFeaturedProducts();

  return (
    <div className="flex flex-col">
      {/* Hero Section με Video Background */}
      <section className="relative flex items-center min-h-[calc(100vh-4rem)]">
        {/* Video Background - NO PLAY BUTTON */}
        <HeroVideoBackground />
        
        {/* Premium Hero Content */}
        <div className="container mx-auto px-4 relative z-10">
          <PremiumHero locale={locale} />
        </div>
      </section>

      {/* Premium Categories Section */}
      <PremiumCategories locale={locale} />

      {/* Premium Featured Products Section */}
      <PremiumFeaturedProducts locale={locale} products={products || []} />

      {/* Premium Baptism & Decorations CTA */}
      <PremiumBaptismCta locale={locale} />
    </div>
  );
}

