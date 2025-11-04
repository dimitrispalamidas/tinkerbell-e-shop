import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { VideoBackground } from '@/components/layout/video-background';

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getTranslations('home');
  const tNav = await getTranslations('nav');
  const tCommon = await getTranslations('common');

  const supabase = await createClient();
  
  // Fetch featured products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .limit(6);

  return (
    <div className="flex flex-col">
      {/* Hero Section με Video Background */}
      <section className="relative py-20 md:py-32 min-h-[600px] flex items-center">
        {/* Video Background */}
        <VideoBackground />
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-2xl">
              {t('hero_title')}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-4 drop-shadow-lg">
              {t('hero_subtitle')}
            </p>
            <p className="text-lg text-white/80 mb-8 drop-shadow-lg">
              {t('hero_description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop">
                <Button size="lg" className="w-full sm:w-auto shadow-xl">
                  {t('shop_now')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/gallery/baptism">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/90 hover:bg-white shadow-xl">
                  {tNav('baptism')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('categories')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/shop?type=clothing">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-2 border-pink/30 hover:border-pink">
                <CardContent className="p-0">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src="/ρουχα.png"
                      alt={tNav('clothing')}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{tNav('clothing')}</h3>
                    <p className="text-muted-foreground">
                      {locale === 'el' ? 'Ανακαλύψτε τη συλλογή μας' : 'Discover our collection'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/shop?type=shoes">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-2 border-baby-blue/30 hover:border-baby-blue">
                <CardContent className="p-0">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src="/παππουτσια.png"
                      alt={tNav('shoes')}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{tNav('shoes')}</h3>
                    <p className="text-muted-foreground">
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
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold">{t('featured_products')}</h2>
              <Link href="/shop">
                <Button variant="outline">
                  {t('view_all')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        {product.images && product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={locale === 'el' ? product.name_el : product.name_en}
                            width={300}
                            height={300}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <ShoppingBag className="h-20 w-20 text-muted-foreground" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {locale === 'el' ? product.name_el : product.name_en}
                        </h3>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(product.price, locale)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Baptism & Decorations CTA */}
      <section className="py-16 bg-gradient-to-br from-lavender/20 to-sunny/20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">
            {locale === 'el' ? 'Βαπτιστικά & Στολισμοί' : 'Baptism & Decorations'}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {locale === 'el' 
              ? 'Δημιουργούμε μοναδικά βαπτιστικά πακέτα και στολισμούς για κάθε περίσταση'
              : 'We create unique baptism packages and decorations for every occasion'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/gallery/baptism">
              <Button size="lg" variant="secondary">
                {tNav('baptism')}
              </Button>
            </Link>
            <Link href="/gallery/decorations">
              <Button size="lg" variant="secondary">
                {tNav('decorations')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

