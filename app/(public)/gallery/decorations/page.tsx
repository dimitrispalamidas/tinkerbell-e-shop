"use client"

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Mail, Phone } from 'lucide-react';
import { PhotoLightbox } from '@/components/gallery/photo-lightbox';

export default function DecorationsGalleryPage() {
  const t = useTranslations('gallery');
  const locale = useLocale();
  
  const [items, setItems] = useState<any[]>([]);
  const [allPhotos, setAllPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('category', 'decoration')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (data) {
        setItems(data);
        // Extract image from each item
        const photos = data.map((item) => item.image).filter(Boolean);
        setAllPhotos(photos);
      }
    } catch (error) {
      console.error('Failed to fetch gallery items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
            {t('decorations_title')}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-5xl mx-auto mb-6 leading-relaxed">
            {t('decorations_subtitle')}
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

        {/* Photo Grid */}
        {allPhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {allPhotos.map((photo, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index)}
                className="relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-sunny/20 to-coral/20 hover:scale-105 transition-transform duration-300 group"
              >
                <Image
                  src={photo}
                  alt={`${t('decorations_title')} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">
              {t('coming_soon')}
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <PhotoLightbox
          images={allPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
