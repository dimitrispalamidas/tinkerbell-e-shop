'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface PremiumCategoriesProps {
  locale: string;
}

export function PremiumCategories({ locale }: PremiumCategoriesProps) {
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

    const element = document.getElementById('premium-categories');
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const categories = [
    {
      href: '/shop?type=clothing',
      image: '/clothes.jpg',
      titleEl: 'Ρούχα',
      titleEn: 'Clothing',
      descriptionEl: 'Επιλεγμένα παιδικά ρούχα για κάθε περίσταση',
      descriptionEn: 'Curated kids clothing for every occasion',
      color: 'sage',
    },
    {
      href: '/shop?type=shoes',
      image: '/shoes.jpg',
      titleEl: 'Παπούτσια',
      titleEn: 'Shoes',
      descriptionEl: 'Κομψότητα και άνεση σε κάθε βήμα',
      descriptionEn: 'Elegance and comfort in every step',
      color: 'mint',
    },
  ];

  return (
    <section id="premium-categories" className="py-16 md:py-24 bg-gradient-to-b from-background to-sage-50/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-12 md:mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <p className="text-sm md:text-base tracking-[0.3em] uppercase text-sage-600 mb-3 font-light">
            {locale === 'el' ? 'Ανακαλύψτε' : 'Discover'}
          </p>
          <h2 className="text-3xl md:text-5xl font-light text-sage-900 tracking-tight">
            {locale === 'el' ? 'Κατηγορίες' : 'Categories'}
          </h2>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-5xl mx-auto">
          {categories.map((category, index) => (
            <Link
              key={category.href}
              href={category.href}
              className={`group transition-all duration-700 delay-${index * 100} ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
                {/* Image */}
                <div className="aspect-[4/3] relative overflow-hidden">
                  <Image
                    src={category.image}
                    alt={locale === 'el' ? category.titleEl : category.titleEn}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-sage-900/60 via-sage-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  
                  {/* Floating Badge */}
                  <div className="absolute top-4 right-4 bg-cream-50/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <ArrowRight className="h-4 w-4 text-sage-900 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl md:text-3xl font-light text-sage-900 mb-2 tracking-tight">
                    {locale === 'el' ? category.titleEl : category.titleEn}
                  </h3>
                  <p className="text-sm md:text-base text-sage-700/80 font-light leading-relaxed">
                    {locale === 'el' ? category.descriptionEl : category.descriptionEn}
                  </p>
                </div>

                {/* Bottom Accent */}
                <div className={`h-1 bg-gradient-to-r from-sage-400 to-mint-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

