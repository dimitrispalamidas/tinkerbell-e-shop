'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PremiumHeroProps {
  locale: string;
}

export function PremiumHero({ locale }: PremiumHeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`max-w-4xl mx-auto text-center transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Small eyebrow text */}
      <p className="text-sm md:text-base tracking-[0.3em] uppercase text-cream-200 mb-4 md:mb-6 font-light">
        {locale === 'el' ? 'Παιδικα Ρούχα • Βαπτιστικά • Στολισμοί' : 'Kids Clothing • Baptism • Unique Moments'}
      </p>

      {/* Main Title */}
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-light mb-6 md:mb-8 text-cream-50 tracking-tight leading-tight">
        {locale === 'el' ? 'Τινκερμπελ' : 'Tinkerbell'}
      </h1>

      {/* Description */}
      <p className="text-base md:text-lg text-cream-200/80 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed font-light px-4">
        {locale === 'el' 
          ? 'Επιλεγμένα παιδικά ρούχα και αξεσουάρ, ολοκληρωμένα βαπτιστικά πακέτα και μοναδικοί στολισμοί που μετατρέπουν κάθε στιγμή σε αξέχαστη εμπειρία.'
          : 'Curated kids clothing and accessories, complete baptism packages, and unique decorations that turn every moment into an unforgettable experience.'
        }
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link href="/shop">
          <Button 
            size="lg" 
            className="bg-cream-50 hover:bg-cream-100 text-sage-900 shadow-2xl px-8 py-6 text-base md:text-lg font-light tracking-wide transition-all duration-300 hover:scale-105"
          >
            {locale === 'el' ? 'Εξερευνήστε τη Συλλογή' : 'Explore Collection'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link href="/gallery/baptism">
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-cream-100/50 bg-transparent hover:bg-cream-50/10 text-cream-50 shadow-xl px-8 py-6 text-base md:text-lg font-light tracking-wide backdrop-blur-sm transition-all duration-300 hover:border-cream-50"
          >
            {locale === 'el' ? 'Βαπτιστικά & Στολισμοί' : 'Baptism & Decorations'}
          </Button>
        </Link>
      </div>
    </div>
  );
}

