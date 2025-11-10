'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, Sparkles, ArrowUpDown } from 'lucide-react';
import { ProductFilters } from '@/components/shop/product-filters';
import { MobileFilterDrawer } from '@/components/shop/mobile-filter-drawer';

interface ShopClientProps {
  locale: string;
  products: any[];
  allCategories: any[];
  type?: string;
  category?: string;
}

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export function ShopClient({ locale, products, allCategories, type, category }: ShopClientProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Static price range
  const minPrice = 0;
  const maxPrice = 100;

  // Initialize price range on mount
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, []);

  // Get all available sizes from products
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    products?.forEach(product => {
      product.sizes?.forEach((size: string) => sizes.add(size));
    });
    return Array.from(sizes).sort((a, b) => {
      // Custom sort for sizes
      const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      const aIndex = order.indexOf(a);
      const bIndex = order.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      // For numeric sizes
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return a.localeCompare(b);
    });
  }, [products]);

  // Get all available colors from products
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    products?.forEach(product => {
      product.colors?.forEach((color: string) => colors.add(color));
    });
    return Array.from(colors).sort();
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    // Apply filters
    let filtered = products.filter(product => {
      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      // Size filter
      if (selectedSizes.length > 0) {
        const hasMatchingSize = product.sizes?.some((size: string) => 
          selectedSizes.includes(size)
        );
        if (!hasMatchingSize) return false;
      }

      // Color filter
      if (selectedColors.length > 0) {
        const hasMatchingColor = product.colors?.some((color: string) => 
          selectedColors.includes(color)
        );
        if (!hasMatchingColor) return false;
      }

      return true;
    });

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return (locale === 'el' ? a.name_el : a.name_en).localeCompare(
            locale === 'el' ? b.name_el : b.name_en
          );
        case 'name-desc':
          return (locale === 'el' ? b.name_el : b.name_en).localeCompare(
            locale === 'el' ? a.name_el : a.name_en
          );
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return sorted;
  }, [products, priceRange, selectedSizes, selectedColors, sortBy, locale]);

  const handleClearAllFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  const getSortLabel = (option: SortOption) => {
    const labels: Record<SortOption, { el: string; en: string }> = {
      newest: { el: 'Νεότερα Πρώτα', en: 'Newest First' },
      'price-asc': { el: 'Τιμή: Χαμηλή σε Υψηλή', en: 'Price: Low to High' },
      'price-desc': { el: 'Τιμή: Υψηλή σε Χαμηλή', en: 'Price: High to Low' },
      'name-asc': { el: 'Όνομα: Α-Ω', en: 'Name: A-Z' },
      'name-desc': { el: 'Όνομα: Ω-Α', en: 'Name: Z-A' },
    };
    return locale === 'el' ? labels[option].el : labels[option].en;
  };

  // Get active filter title
  const getActiveFilterTitle = () => {
    if (type === 'clothing') return locale === 'el' ? 'Ρούχα' : 'Clothing';
    if (type === 'shoes') return locale === 'el' ? 'Παπούτσια' : 'Shoes';
    if (category) {
      const cat = allCategories.find(c => c.id === category);
      return locale === 'el' ? cat?.name_el : cat?.name_en;
    }
    return locale === 'el' ? 'Όλα τα Προϊόντα' : 'All Products';
  };

  return (
    <div className="min-h-screen">
      {/* Premium Hero Section */}
      <section className="relative bg-gradient-to-br from-sage-50 via-cream-50/30 to-mint-50/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {/* Eyebrow Text */}
            <p className="text-sm md:text-base tracking-[0.3em] uppercase text-sage-600 mb-3 md:mb-4 font-light flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              {locale === 'el' ? 'Η Συλλογή μας' : 'Our Collection'}
            </p>
            
            {/* Main Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-sage-900 tracking-tight mb-4 md:mb-6">
              {getActiveFilterTitle()}
            </h1>
            
            {/* Product Count */}
            {filteredAndSortedProducts && (
              <p className="text-sm md:text-base text-sage-700/80 font-light">
                {locale === 'el' 
                  ? `${filteredAndSortedProducts.length} ${filteredAndSortedProducts.length === 1 ? 'προϊόν' : 'προϊόντα'} ${products.length !== filteredAndSortedProducts.length ? `από ${products.length}` : 'διαθέσιμα'}` 
                  : `${filteredAndSortedProducts.length} ${filteredAndSortedProducts.length === 1 ? 'product' : 'products'} ${products.length !== filteredAndSortedProducts.length ? `of ${products.length}` : 'available'}`
                }
              </p>
            )}
          </div>
        </div>

        {/* Decorative Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Premium Category Filters */}
      {allCategories && allCategories.length > 0 && (
        <section className="border-b sticky top-16 bg-background/95 backdrop-blur-md z-10 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide py-4">
              <Link
                href="/shop"
                className={`px-4 md:px-6 py-2.5 md:py-3 rounded-full font-light transition-all duration-300 text-sm md:text-base whitespace-nowrap border ${
                  !type && !category
                    ? 'bg-magenta-600 text-white shadow-md scale-105 border-magenta-600'
                    : 'bg-sage-50 text-sage-800 hover:bg-sage-100 hover:shadow-sm border-sage-200 hover:border-sage-300'
                }`}
              >
                {locale === 'el' ? 'Όλα' : 'All'}
              </Link>
              <Link
                href="/shop?type=clothing"
                className={`px-4 md:px-6 py-2.5 md:py-3 rounded-full font-light transition-all duration-300 text-sm md:text-base whitespace-nowrap border ${
                  type === 'clothing' && !category
                    ? 'bg-magenta-600 text-white shadow-md scale-105 border-magenta-600'
                    : 'bg-sage-50 text-sage-800 hover:bg-sage-100 hover:shadow-sm border-sage-200 hover:border-sage-300'
                }`}
              >
                {locale === 'el' ? 'Ρούχα' : 'Clothing'}
              </Link>
              <Link
                href="/shop?type=shoes"
                className={`px-4 md:px-6 py-2.5 md:py-3 rounded-full font-light transition-all duration-300 text-sm md:text-base whitespace-nowrap border ${
                  type === 'shoes' && !category
                    ? 'bg-magenta-600 text-white shadow-md scale-105 border-magenta-600'
                    : 'bg-sage-50 text-sage-800 hover:bg-sage-100 hover:shadow-sm border-sage-200 hover:border-sage-300'
                }`}
              >
                {locale === 'el' ? 'Παπούτσια' : 'Shoes'}
              </Link>
              {allCategories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.id}`}
                  className={`px-4 md:px-6 py-2.5 md:py-3 rounded-full font-light transition-all duration-300 text-sm md:text-base whitespace-nowrap border ${
                    category === cat.id
                      ? 'bg-magenta-600 text-white shadow-md scale-105 border-magenta-600'
                      : 'bg-sage-50 text-sage-800 hover:bg-sage-100 hover:shadow-sm border-sage-200 hover:border-sage-300'
                  }`}
                >
                  {locale === 'el' ? cat.name_el : cat.name_en}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Section with Filters */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-background to-sage-50/10">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-32 bg-white rounded-2xl shadow-lg p-6 border border-sage-100">
                <ProductFilters
                  locale={locale}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  availableSizes={availableSizes}
                  availableColors={availableColors}
                  selectedPriceRange={priceRange}
                  selectedSizes={selectedSizes}
                  selectedColors={selectedColors}
                  onPriceChange={setPriceRange}
                  onSizeChange={setSelectedSizes}
                  onColorChange={setSelectedColors}
                  onClearAll={handleClearAllFilters}
                />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Sorting Bar */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-sage-200">
                <p className="text-sm text-sage-600 font-light">
                  {locale === 'el' 
                    ? `${filteredAndSortedProducts.length} προϊόντα` 
                    : `${filteredAndSortedProducts.length} products`
                  }
                </p>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-sage-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-sm border border-sage-200 rounded-lg px-3 py-2 bg-white text-sage-700 focus:outline-none focus:ring-2 focus:ring-magenta-500 focus:border-transparent font-light"
                  >
                    <option value="newest">{getSortLabel('newest')}</option>
                    <option value="price-asc">{getSortLabel('price-asc')}</option>
                    <option value="price-desc">{getSortLabel('price-desc')}</option>
                    <option value="name-asc">{getSortLabel('name-asc')}</option>
                    <option value="name-desc">{getSortLabel('name-desc')}</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {filteredAndSortedProducts && filteredAndSortedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredAndSortedProducts.map((product, index) => (
                <Link 
                  key={product.id} 
                  href={`/product/${product.id}`}
                  className={`transition-all duration-700 delay-${Math.min(index * 50, 500)} ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 h-full group border-sage-100/50 hover:-translate-y-2">
                    <CardContent className="p-0">
                      {/* Product Image */}
                      <div className="aspect-square bg-gradient-to-br from-sage-50/30 to-mint-50/20 flex items-center justify-center overflow-hidden relative">
                        {product.images && product.images[0] ? (
                          <>
                            <Image
                              src={product.images[0]}
                              alt={locale === 'el' ? product.name_el : product.name_en}
                              width={400}
                              height={400}
                              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                            />
                            {/* Gradient Overlay on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-sage-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </>
                        ) : (
                          <ShoppingBag className="h-12 w-12 md:h-20 md:w-20 text-sage-300" />
                        )}
                        
                        {/* Floating Badge */}
                        <div className="absolute top-3 right-3 bg-cream-50/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          <span className="text-xs font-light text-sage-900">
                            {locale === 'el' ? 'Δείτε' : 'View'}
                          </span>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="p-3 md:p-4 bg-white">
                        <h3 className="text-sm md:text-base font-light text-sage-900 mb-1 md:mb-2 line-clamp-2 leading-snug">
                          {locale === 'el' ? product.name_el : product.name_en}
                        </h3>
                        <p className="text-xs md:text-sm text-sage-600/70 mb-2 line-clamp-1 md:line-clamp-2 font-light">
                          {locale === 'el' ? product.description_el : product.description_en}
                        </p>
                        <p className="text-base md:text-lg font-light text-sage-800 tracking-wide">
                          {formatPrice(product.price, locale)}
                        </p>
                      </div>

                      {/* Bottom Accent */}
                      <div className="h-1 bg-gradient-to-r from-sage-400 to-mint-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-sage-50 mb-6">
                <ShoppingBag className="h-12 w-12 text-sage-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-light text-sage-900 mb-3">
                {locale === 'el' ? 'Δεν βρέθηκαν προϊόντα' : 'No products found'}
              </h3>
              <p className="text-sage-600/80 font-light mb-8">
                {locale === 'el' 
                  ? 'Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης' 
                  : 'Try changing your search filters'}
              </p>
              <Button
                onClick={handleClearAllFilters}
                className="bg-magenta-600 hover:bg-magenta-700 text-white"
              >
                {locale === 'el' ? 'Καθαρισμός Φίλτρων' : 'Clear Filters'}
              </Button>
            </div>
          )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        locale={locale}
        minPrice={minPrice}
        maxPrice={maxPrice}
        availableSizes={availableSizes}
        availableColors={availableColors}
        selectedPriceRange={priceRange}
        selectedSizes={selectedSizes}
        selectedColors={selectedColors}
        onPriceChange={setPriceRange}
        onSizeChange={setSelectedSizes}
        onColorChange={setSelectedColors}
        onClearAll={handleClearAllFilters}
      />
    </div>
  );
}

