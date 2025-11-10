'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Mail, Phone } from 'lucide-react';
import { PhotoLightbox } from '@/components/gallery/photo-lightbox';

interface BaptismGalleryClientProps {
  locale: string;
  photos: string[];
}

export function BaptismGalleryClient({ locale, photos }: BaptismGalleryClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
            {locale === 'el' ? 'Βαπτιστικά' : 'Baptisms'}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-5xl mx-auto mb-6 leading-relaxed">
            {locale === 'el' ? 'Δημιουργούμε ολοκληρωμένα βαπτιστικά πακέτα με αγάπη και φροντίδα για τη μοναδική μέρα του μικρού σας αγγέλου. Από λαμπάδες και λαδόπανα μέχρι ρούχα και μπομπονιέρες - όλα σχεδιασμένα ειδικά για εσάς!' : 'We create complete baptism packages with love and care for your little angel\'s unique day. From candles and oil sets to clothes and favors - everything designed especially for you!'}
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
        {photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index)}
                className="relative aspect-square overflow-hidden rounded bg-gradient-to-br from-lavender/20 to-pink/20 hover:scale-105 transition-transform duration-300 group"
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
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
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

