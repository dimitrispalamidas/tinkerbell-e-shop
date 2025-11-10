'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';
import { ProductFilters } from './product-filters';

interface MobileFilterDrawerProps {
  locale: string;
  minPrice: number;
  maxPrice: number;
  availableSizes: string[];
  availableColors: string[];
  selectedPriceRange: [number, number];
  selectedSizes: string[];
  selectedColors: string[];
  onPriceChange: (range: [number, number]) => void;
  onSizeChange: (sizes: string[]) => void;
  onColorChange: (colors: string[]) => void;
  onClearAll: () => void;
}

export function MobileFilterDrawer({
  locale,
  minPrice,
  maxPrice,
  availableSizes,
  availableColors,
  selectedPriceRange,
  selectedSizes,
  selectedColors,
  onPriceChange,
  onSizeChange,
  onColorChange,
  onClearAll,
}: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = 
    selectedSizes.length > 0 || 
    selectedColors.length > 0 || 
    selectedPriceRange[0] !== minPrice || 
    selectedPriceRange[1] !== maxPrice;

  // Check if there are any available filters
  // If no sizes, colors, it means no products exist
  const hasAvailableFilters = 
    availableSizes.length > 0 || 
    availableColors.length > 0;

  // Don't show mobile filter button if there are no available filters
  if (!hasAvailableFilters) {
    return null;
  }

  return (
    <>
      {/* Mobile Filter Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-magenta-600 hover:bg-magenta-700 z-40 flex items-center justify-center"
      >
        <SlidersHorizontal className="h-6 w-6 text-white" />
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-amber-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
            {selectedSizes.length + selectedColors.length + (selectedPriceRange[0] !== minPrice || selectedPriceRange[1] !== maxPrice ? 1 : 0)}
          </span>
        )}
      </Button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-6 border-b border-sage-200">
            <h2 className="text-xl font-light text-sage-900 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-sage-700" />
              {locale === 'el' ? 'Φίλτρα' : 'Filters'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 rounded-full hover:bg-sage-100"
            >
              <X className="h-5 w-5 text-sage-600" />
            </Button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <ProductFilters
              locale={locale}
              minPrice={minPrice}
              maxPrice={maxPrice}
              availableSizes={availableSizes}
              availableColors={availableColors}
              selectedPriceRange={selectedPriceRange}
              selectedSizes={selectedSizes}
              selectedColors={selectedColors}
              onPriceChange={onPriceChange}
              onSizeChange={onSizeChange}
              onColorChange={onColorChange}
              onClearAll={onClearAll}
            />
          </div>

          {/* Drawer Footer */}
          <div className="p-6 border-t border-sage-200 bg-sage-50/30">
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full bg-magenta-600 hover:bg-magenta-700 text-white"
            >
              {locale === 'el' ? 'Εφαρμογή Φίλτρων' : 'Apply Filters'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

