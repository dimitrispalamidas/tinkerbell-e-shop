"use client"

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Product = {
  id: string;
  name_el: string;
  name_en: string;
  price: number;
  images: string[];
};

type Props = {
  products: Product[];
};

export function FeaturedProductsCarousel({ products }: Props) {
  const locale = useLocale();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const autoRotateInterval = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    startAutoRotate();
    return () => stopAutoRotate();
  }, [currentIndex, products.length]);

  const startAutoRotate = () => {
    stopAutoRotate();
    autoRotateInterval.current = setInterval(() => {
      if (!isDragging) {
        scrollToNext();
      }
    }, 5000);
  };

  const stopAutoRotate = () => {
    if (autoRotateInterval.current) {
      clearInterval(autoRotateInterval.current);
    }
  };

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const itemWidth = container.scrollWidth / products.length;
    container.scrollTo({
      left: itemWidth * index,
      behavior: 'smooth'
    });
    setCurrentIndex(index);
  };

  const scrollToNext = () => {
    const nextIndex = (currentIndex + 1) % products.length;
    scrollToIndex(nextIndex);
  };

  const scrollToPrev = () => {
    const prevIndex = (currentIndex - 1 + products.length) % products.length;
    scrollToIndex(prevIndex);
  };

  // Handle scroll to update current index
  const handleScroll = () => {
    if (!scrollContainerRef.current || isDragging) return;
    
    const container = scrollContainerRef.current;
    const itemWidth = container.scrollWidth / products.length;
    const newIndex = Math.round(container.scrollLeft / itemWidth);
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  // Touch/Mouse drag handlers
  const handleDragStart = () => {
    setIsDragging(true);
    stopAutoRotate();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    handleScroll();
    startAutoRotate();
  };

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 md:gap-4 pb-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="flex-shrink-0 w-[calc(33.333%-8px)] lg:w-[calc(20%-10px)] snap-center"
            draggable={false}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  {product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={locale === 'el' ? product.name_el : product.name_en}
                      width={300}
                      height={300}
                      className="object-cover w-full h-full pointer-events-none"
                      draggable={false}
                    />
                  ) : (
                    <ShoppingBag className="h-12 w-12 md:h-20 md:w-20 text-muted-foreground" />
                  )}
                </div>
                <div className="p-1.5 md:p-4">
                  <h3 className="text-xs md:text-base font-semibold mb-0.5 md:mb-2 line-clamp-2 leading-tight">
                    {locale === 'el' ? product.name_el : product.name_en}
                  </h3>
                  <p className="text-[10px] md:text-sm font-bold text-primary">
                    {formatPrice(product.price, locale)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Navigation Arrows - Hidden on mobile */}
      <Button
        variant="outline"
        size="icon"
        onClick={scrollToPrev}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/90 hover:bg-white shadow-lg"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={scrollToNext}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/90 hover:bg-white shadow-lg"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'w-8 bg-primary' 
                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

