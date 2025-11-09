'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Baby, Sparkles } from 'lucide-react';
import { BsBalloonHeart } from 'react-icons/bs';
import { VideoBackground } from '@/components/layout/video-background';

interface PremiumBaptismCtaProps {
  locale: string;
}

export function PremiumBaptismCta({ locale }: PremiumBaptismCtaProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('premium-baptism-cta');
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  return (
    <section 
      id="premium-baptism-cta"
      className="relative py-20 md:py-32 overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center"
    >
      {/* Video Background */}
      <VideoBackground />

      {/* Content */}
      <div className={`container mx-auto px-4 text-center max-w-4xl relative z-10 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}>
        {/* Decorative Element */}
        <div className="flex justify-center mb-6">
          <div className="bg-cream-50/20 backdrop-blur-md rounded-full p-4 shadow-2xl">
            <Sparkles className="h-8 w-8 text-cream-50" />
          </div>
        </div>

        {/* Eyebrow */}
        <p className="text-sm md:text-base tracking-[0.3em] uppercase text-cream-200 mb-4 font-light">
          {locale === 'el' ? 'Ξεχωριστές Στιγμές' : 'Special Moments'}
        </p>

        {/* Title */}
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-light mb-6 text-cream-50 tracking-tight leading-tight">
          {locale === 'el' ? 'Βαπτιστικά & Στολισμοί' : 'Baptism & Decorations'}
        </h2>

        {/* Description */}
        <p className="text-base md:text-lg text-cream-50 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed font-light px-4 drop-shadow-lg">
          {locale === 'el'
            ? 'Δημιουργούμε μοναδικά βαπτιστικά πακέτα και στολισμούς που μετατρέπουν κάθε γιορτή σε αξέχαστη εμπειρία γεμάτη συγκίνηση και ομορφιά'
            : 'We create unique baptism packages and decorations that transform every celebration into an unforgettable experience filled with emotion and beauty'
          }
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/gallery/baptism">
            <Button
              size="lg"
              className="bg-cream-50 hover:bg-cream-100 text-sage-900 shadow-2xl px-8 py-6 text-base md:text-lg font-light tracking-wide transition-all duration-300 hover:scale-105 group"
            >
              <Baby className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              {locale === 'el' ? 'Βάπτιση' : 'Baptism'}
            </Button>
          </Link>
          <Link href="/gallery/decorations">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-cream-100/50 bg-transparent hover:bg-cream-50/10 text-cream-50 shadow-xl px-8 py-6 text-base md:text-lg font-light tracking-wide backdrop-blur-sm transition-all duration-300 hover:border-cream-50 group"
            >
              <BsBalloonHeart className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              {locale === 'el' ? 'Διακόσμηση' : 'Decorations'}
            </Button>
          </Link>
        </div>

        {/* Bottom decorative line */}
        <div className="mt-12 flex justify-center">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-cream-200/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}

