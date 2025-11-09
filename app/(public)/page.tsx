import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Baby } from 'lucide-react';
import { BsBalloonHeart } from 'react-icons/bs';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { VideoBackground } from '@/components/layout/video-background';
import { FeaturedProductsCarousel } from '@/components/home/featured-products-carousel';

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
      {/* Hero Section με Static Background */}
      <section className="relative flex items-center min-h-[calc(100vh-4rem)]">
        {/* Static Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-children2.jpg"
            alt="Τινκερμπελ - Παιδικά Ρούχα, Βαπτιστικά, Στολισμοί"
            fill
            className="object-cover object-center"
            style={{ objectPosition: 'center 40%' }}
            priority
            quality={90}
          />
          {/* Overlay για καλύτερη αναγνωσιμότητα */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white drop-shadow-2xl">
              {locale === 'el' ? 'Καλώς ήρθατε στο Tinkerbell' : 'Welcome to Tinkerbell'}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-3 md:mb-4 drop-shadow-lg">
              {locale === 'el' ? 'Δημιουργούμε μοναδικές στιγμές για τα παιδιά σας' : 'Creating unique moments for your children'}
            </p>
            <p className="text-base md:text-lg text-white/80 drop-shadow-lg">
              {locale === 'el' ? 'Ρούχα, παπούτσια και αξεσουάρ για κάθε ιδιαίτερη περίσταση' : 'Clothing, shoes and accessories for every special occasion'}
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            {locale === 'el' ? 'Κατηγορίες' : 'Categories'}
          </h2>
          <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
            <Link href="/shop?type=clothing" className="h-full">
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-2 border-pink/30 hover:border-pink">
                <CardContent className="p-0 h-full flex flex-col">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src="/clothes.jpg"
                      alt={locale === 'el' ? 'Ρούχα' : 'Clothing'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3 md:p-6">
                    <h3 className="text-base md:text-2xl font-bold mb-1 md:mb-2">
                      {locale === 'el' ? 'Ρούχα' : 'Clothing'}
                    </h3>
                    <p className="text-xs md:text-base text-muted-foreground line-clamp-2">
                      {locale === 'el' ? 'Ανακαλύψτε τη συλλογή μας' : 'Discover our collection'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/shop?type=shoes" className="h-full">
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-2 border-baby-blue/30 hover:border-baby-blue">
                <CardContent className="p-0 h-full flex flex-col">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src="/shoes.jpg"
                      alt={locale === 'el' ? 'Παπούτσια' : 'Shoes'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3 md:p-6">
                    <h3 className="text-base md:text-2xl font-bold mb-1 md:mb-2">
                      {locale === 'el' ? 'Παπούτσια' : 'Shoes'}
                    </h3>
                    <p className="text-xs md:text-base text-muted-foreground line-clamp-2">
                      {locale === 'el' ? 'Δείτε τα παπούτσια μας' : 'Browse our shoes'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products && products.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold">
                {locale === 'el' ? 'Προτεινόμενα Προϊόντα' : 'Featured Products'}
              </h2>
              <Link href="/shop">
                <Button variant="outline">
                  {locale === 'el' ? 'Προβολή όλων' : 'View All'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <FeaturedProductsCarousel products={products} />
          </div>
        </section>
      )}

      {/* Baptism & Decorations CTA με Video Background */}
      <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden min-h-[400px] md:min-h-[500px] flex items-center">
        {/* Video Background */}
        <VideoBackground />

        <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-white drop-shadow-2xl">
            {locale === 'el' ? 'Βαπτιστικά & Στολισμοί' : 'Baptism & Decorations'}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/90 mb-6 md:mb-8 drop-shadow-lg">
            {locale === 'el' 
              ? 'Δημιουργούμε μοναδικά βαπτιστικά πακέτα και στολισμούς για κάθε περίσταση'
              : 'We create unique baptism packages and decorations for every occasion'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/gallery/baptism">
              <Button size="lg" className="shadow-xl w-full sm:w-auto">
                <Baby className="mr-2 h-5 w-5" />
                {locale === 'el' ? 'Βάπτιση' : 'Baptism'}
              </Button>
            </Link>
            <Link href="/gallery/decorations">
              <Button size="lg" variant="outline" className="bg-white/90 hover:bg-white shadow-xl w-full sm:w-auto">
                <BsBalloonHeart className="mr-2 h-5 w-5" />
                {locale === 'el' ? 'Διακόσμηση' : 'Decorations'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

