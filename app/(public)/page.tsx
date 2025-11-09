import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { HeroVideoBackground } from '@/components/layout/hero-video-background';
import { PremiumHero } from '@/components/home/premium-hero';
import { PremiumCategories } from '@/components/home/premium-categories';
import { PremiumFeaturedProducts } from '@/components/home/premium-featured-products';
import { PremiumBaptismCta } from '@/components/home/premium-baptism-cta';

export default async function HomePage() {
  const locale = await getLocale();

  const supabase = await createClient();
  
  // Fetch featured products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .limit(15);

  return (
    <div className="flex flex-col">
      {/* Hero Section με Video Background */}
      <section className="relative flex items-center min-h-[calc(100vh-4rem)]">
        {/* Video Background */}
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

