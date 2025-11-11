'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Baby, Sparkles } from 'lucide-react';
import { PhotoLightbox } from '@/components/gallery/photo-lightbox';

interface BaptismGalleryClientProps {
  locale: string;
  photos: string[];
}

export function BaptismGalleryClient({ locale, photos }: BaptismGalleryClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 via-white to-cream-50/30">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Compact Premium Header */}
          <div className={`text-center mb-8 md:mb-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {/* Eyebrow with Icon */}
            <p className="text-sm md:text-base tracking-[0.3em] uppercase text-sage-600 mb-3 md:mb-4 font-light flex items-center justify-center gap-2">
              <Baby className="h-4 w-4" />
              {locale === 'el' ? 'Βαπτιστικά' : 'Baptisms'}
            </p>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-sage-900 tracking-tight mb-4 md:mb-6">
              {locale === 'el' ? 'Ξεχωριστές Στιγμές' : 'Special Moments'}
            </h1>

            {/* Description */}
            <p className="text-sm md:text-base text-sage-700/80 max-w-2xl mx-auto font-light mb-6">
              {locale === 'el' 
                ? 'Ολοκληρωμένα βαπτιστικά πακέτα με αγάπη και φροντίδα για τη μοναδική μέρα του μικρού σας αγγέλου.' 
                : 'Complete baptism packages with love and care for your little angel\'s unique day.'
              }
            </p>

            {/* Compact CTA Buttons */}
            <div className="flex flex-wrap gap-3 justify-center text-sm">
              <Button 
                size="sm" 
                className="gap-2 bg-sage-600 hover:bg-sage-700 text-cream-50 font-light tracking-wide transition-all duration-300 hover:scale-105"
                asChild
              >
                <a href="mailto:tinkerbellkalamatas@gmail.com">
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2 border-2 border-sage-300 bg-transparent hover:bg-sage-50 text-sage-900 font-light tracking-wide transition-all duration-300 hover:border-sage-500"
                asChild
              >
                <a href="tel:+302721406303">
                  <Phone className="h-4 w-4" />
                  2721 406303
                </a>
              </Button>
            </div>
          </div>

          {/* Photo Grid */}
          {photos.length > 0 ? (
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}>
              {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index)}
                className="relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-sage-100/30 to-cream-100/50 hover:scale-[1.02] hover:shadow-2xl transition-all duration-500 group cursor-pointer"
                type="button"
                aria-label={`${locale === 'el' ? 'Δείτε φωτογραφία βαπτιστικών' : 'View baptism photo'} ${index + 1}`}
              >
                  <Image
                    src={photo}
                    alt={`${locale === 'el' ? 'Βαπτιστικό πακέτο' : 'Baptism package'} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sage-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Hover overlay with icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-cream-50/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                      <Sparkles className="h-6 w-6 text-sage-700" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 md:py-32">
              <div className="bg-sage-100/50 backdrop-blur-md rounded-full p-6 mx-auto w-fit mb-6">
                <Baby className="h-12 w-12 text-sage-600" />
              </div>
              <p className="text-xl md:text-2xl text-sage-700 font-light">
                {locale === 'el' ? 'Σύντομα νέα έργα!' : 'New works coming soon!'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <PhotoLightbox
          images={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

