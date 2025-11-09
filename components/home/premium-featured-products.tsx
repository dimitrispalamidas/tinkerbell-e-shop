'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeaturedProductsCarousel } from '@/components/home/featured-products-carousel';

interface PremiumFeaturedProductsProps {
  locale: string;
  products: any[];
}

export function PremiumFeaturedProducts({ locale, products }: PremiumFeaturedProductsProps) {
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

    const element = document.getElementById('premium-featured');
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  if (!products || products.length === 0) return null;

  return (
    <section id="premium-featured" className="py-16 md:py-24 bg-gradient-to-b from-sage-50/20 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 md:mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div>
            <p className="text-sm md:text-base tracking-[0.3em] uppercase text-sage-600 mb-2 font-light">
              {locale === 'el' ? 'Επιλογή της Εβδομάδας' : 'This Week\'s Selection'}
            </p>
            <h2 className="text-3xl md:text-5xl font-light text-sage-900 tracking-tight">
              {locale === 'el' ? 'Προτεινόμενα' : 'Featured'}
            </h2>
          </div>
          
          <Link href="/shop">
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-sage-300 bg-transparent hover:bg-sage-50 text-sage-900 px-6 py-6 font-light tracking-wide transition-all duration-300 hover:border-sage-500 group"
            >
              {locale === 'el' ? 'Προβολή Όλων' : 'View All'}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>

        {/* Products Carousel */}
        <div className={`transition-all duration-1000 delay-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          <FeaturedProductsCarousel products={products} />
        </div>
      </div>
    </section>
  );
}

