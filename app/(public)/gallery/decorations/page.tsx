import { getTranslations, getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone } from 'lucide-react';

export default async function DecorationsGalleryPage() {
  const locale = await getLocale();
  const t = await getTranslations('gallery');

  const supabase = await createClient();
  
  const { data: items } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('category', 'decoration')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">{t('decorations')}</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            {t('custom_order')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" asChild>
              <a href="mailto:tinkerbellkalamatas@gmail.com">
                <Mail className="h-5 w-5" />
                tinkerbellkalamatas@gmail.com
              </a>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <a href="tel:+302721406303">
                <Phone className="h-5 w-5" />
                2721 406303
              </a>
            </Button>
          </div>
        </div>

        {items && items.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-sunny/20 to-coral/20">
                    {item.images && item.images[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={locale === 'el' ? item.title_el : item.title_en}
                        width={400}
                        height={400}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-semibold text-base md:text-lg mb-2">
                      {locale === 'el' ? item.title_el : item.title_en}
                    </h3>
                    {item.description_el && item.description_en && (
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {locale === 'el' ? item.description_el : item.description_en}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">
              {locale === 'el' ? 'Σύντομα νέα έργα!' : 'New works coming soon!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

