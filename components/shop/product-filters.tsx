'use client';

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ProductFiltersProps {
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

export function ProductFilters({
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
}: ProductFiltersProps) {
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isSizeOpen, setIsSizeOpen] = useState(true);
  const [isColorOpen, setIsColorOpen] = useState(true);
  const [localPriceRange, setLocalPriceRange] = useState(selectedPriceRange);
  const [minInputValue, setMinInputValue] = useState(selectedPriceRange[0].toString());
  const [maxInputValue, setMaxInputValue] = useState(selectedPriceRange[1].toString());

  useEffect(() => {
    setLocalPriceRange(selectedPriceRange);
    setMinInputValue(selectedPriceRange[0].toString());
    setMaxInputValue(selectedPriceRange[1].toString());
  }, [selectedPriceRange]);

  const handleSizeToggle = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];
    onSizeChange(newSizes);
  };

  const handleColorToggle = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    onColorChange(newColors);
  };

  const handlePriceSliderChange = (value: number[]) => {
    setLocalPriceRange([value[0], value[1]]);
    setMinInputValue(value[0].toString());
    setMaxInputValue(value[1].toString());
  };

  const handlePriceSliderCommit = () => {
    onPriceChange(localPriceRange);
  };

  const hasActiveFilters = 
    selectedSizes.length > 0 || 
    selectedColors.length > 0 || 
    selectedPriceRange[0] !== minPrice || 
    selectedPriceRange[1] !== maxPrice;

  // Translate size labels
  const getSizeLabel = (size: string) => {
    const sizeMap: Record<string, { el: string; en: string }> = {
      'XS': { el: 'XS', en: 'XS' },
      'S': { el: 'S', en: 'S' },
      'M': { el: 'M', en: 'M' },
      'L': { el: 'L', en: 'L' },
      'XL': { el: 'XL', en: 'XL' },
      'XXL': { el: 'XXL', en: 'XXL' },
      'Νεογέννητο': { el: 'Νεογέννητο', en: 'Newborn' },
      '0-3': { el: '0-3 μηνών', en: '0-3 months' },
      '3-6': { el: '3-6 μηνών', en: '3-6 months' },
      '6-12': { el: '6-12 μηνών', en: '6-12 months' },
      '12-18': { el: '12-18 μηνών', en: '12-18 months' },
      '18-24': { el: '18-24 μηνών', en: '18-24 months' },
      '2-3': { el: '2-3 ετών', en: '2-3 years' },
      '3-4': { el: '3-4 ετών', en: '3-4 years' },
      '4-5': { el: '4-5 ετών', en: '4-5 years' },
      '5-6': { el: '5-6 ετών', en: '5-6 years' },
      '6-7': { el: '6-7 ετών', en: '6-7 years' },
      '7-8': { el: '7-8 ετών', en: '7-8 years' },
      '8-9': { el: '8-9 ετών', en: '8-9 years' },
      '9-10': { el: '9-10 ετών', en: '9-10 years' },
      '10-11': { el: '10-11 ετών', en: '10-11 years' },
      '11-12': { el: '11-12 ετών', en: '11-12 years' },
      '12-13': { el: '12-13 ετών', en: '12-13 years' },
      '13-14': { el: '13-14 ετών', en: '13-14 years' },
    };

    // For shoe sizes (numbers)
    if (!isNaN(Number(size))) {
      return size;
    }

    return locale === 'el' 
      ? (sizeMap[size]?.el || size)
      : (sizeMap[size]?.en || size);
  };

  // Translate color labels
  const getColorLabel = (color: string) => {
    const colorMap: Record<string, { el: string; en: string }> = {
      'white': { el: 'Λευκό', en: 'White' },
      'black': { el: 'Μαύρο', en: 'Black' },
      'red': { el: 'Κόκκινο', en: 'Red' },
      'blue': { el: 'Μπλε', en: 'Blue' },
      'green': { el: 'Πράσινο', en: 'Green' },
      'yellow': { el: 'Κίτρινο', en: 'Yellow' },
      'pink': { el: 'Ροζ', en: 'Pink' },
      'purple': { el: 'Μωβ', en: 'Purple' },
      'orange': { el: 'Πορτοκαλί', en: 'Orange' },
      'brown': { el: 'Καφέ', en: 'Brown' },
      'gray': { el: 'Γκρι', en: 'Gray' },
      'beige': { el: 'Μπεζ', en: 'Beige' },
      'navy': { el: 'Μπλε Σκούρο', en: 'Navy' },
      'cream': { el: 'Κρεμ', en: 'Cream' },
      'gold': { el: 'Χρυσό', en: 'Gold' },
      'silver': { el: 'Ασημί', en: 'Silver' },
    };

    return locale === 'el' 
      ? (colorMap[color.toLowerCase()]?.el || color)
      : (colorMap[color.toLowerCase()]?.en || color);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-sage-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-sage-700" />
          <h2 className="text-lg font-light text-sage-900">
            {locale === 'el' ? 'Φίλτρα' : 'Filters'}
          </h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-magenta-600 hover:text-magenta-700 hover:bg-magenta-50"
          >
            <X className="h-4 w-4 mr-1" />
            {locale === 'el' ? 'Καθαρισμός' : 'Clear All'}
          </Button>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="space-y-4">
        <button
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-base font-light text-sage-800">
            {locale === 'el' ? 'Τιμή' : 'Price'}
          </h3>
          {isPriceOpen ? (
            <ChevronUp className="h-4 w-4 text-sage-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-sage-500" />
          )}
        </button>

        {isPriceOpen && (
          <div className="space-y-4 pt-2">
            <div className="px-2">
              <Slider
                min={minPrice}
                max={maxPrice}
                step={1}
                value={localPriceRange}
                onValueChange={handlePriceSliderChange}
                onValueCommit={handlePriceSliderCommit}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label htmlFor="min-price" className="text-xs text-sage-600 mb-1 block">
                  {locale === 'el' ? 'Από' : 'From'}
                </Label>
                <div className="relative">
                  <input
                    id="min-price"
                    type="text"
                    inputMode="numeric"
                    value={minInputValue}
                    onChange={(e) => {
                      const inputValue = e.target.value.replace(/[^0-9]/g, '');
                      setMinInputValue(inputValue);
                      
                      if (inputValue === '') {
                        setLocalPriceRange([minPrice, localPriceRange[1]]);
                        return;
                      }
                      const value = Math.min(Number(inputValue), maxPrice);
                      setLocalPriceRange([value, localPriceRange[1]]);
                    }}
                    onBlur={() => {
                      const value = minInputValue === '' ? minPrice : Math.max(minPrice, Math.min(Number(minInputValue), maxPrice));
                      const validMin = Math.min(value, localPriceRange[1]);
                      const validMax = Math.max(validMin, localPriceRange[1]);
                      setLocalPriceRange([validMin, validMax]);
                      setMinInputValue(validMin.toString());
                      handlePriceSliderCommit();
                    }}
                    className="w-full px-3 py-2 pr-8 text-sm border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-magenta-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sage-400">€</span>
                </div>
              </div>
              <span className="text-sage-400 pt-5">—</span>
              <div className="flex-1">
                <Label htmlFor="max-price" className="text-xs text-sage-600 mb-1 block">
                  {locale === 'el' ? 'Έως' : 'To'}
                </Label>
                <div className="relative">
                  <input
                    id="max-price"
                    type="text"
                    inputMode="numeric"
                    value={maxInputValue}
                    onChange={(e) => {
                      const inputValue = e.target.value.replace(/[^0-9]/g, '');
                      setMaxInputValue(inputValue);
                      
                      if (inputValue === '') {
                        setLocalPriceRange([localPriceRange[0], maxPrice]);
                        return;
                      }
                      const value = Math.min(Number(inputValue), maxPrice);
                      setLocalPriceRange([localPriceRange[0], value]);
                    }}
                    onBlur={() => {
                      const value = maxInputValue === '' ? maxPrice : Math.max(minPrice, Math.min(Number(maxInputValue), maxPrice));
                      const validMax = Math.max(value, localPriceRange[0]);
                      const validMin = Math.min(validMax, localPriceRange[0]);
                      setLocalPriceRange([validMin, validMax]);
                      setMaxInputValue(validMax.toString());
                      handlePriceSliderCommit();
                    }}
                    className="w-full px-3 py-2 pr-8 text-sm border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-magenta-500 focus:border-transparent"
                    placeholder="100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sage-400">€</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Size Filter */}
      {availableSizes.length > 0 && (
        <div className="space-y-4 border-t border-sage-100 pt-6">
          <button
            onClick={() => setIsSizeOpen(!isSizeOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-base font-light text-sage-800">
              {locale === 'el' ? 'Μέγεθος' : 'Size'}
              {selectedSizes.length > 0 && (
                <span className="ml-2 text-xs text-magenta-600">
                  ({selectedSizes.length})
                </span>
              )}
            </h3>
            {isSizeOpen ? (
              <ChevronUp className="h-4 w-4 text-sage-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-sage-500" />
            )}
          </button>

          {isSizeOpen && (
            <div className="space-y-3">
              {availableSizes.map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size}`}
                    checked={selectedSizes.includes(size)}
                    onCheckedChange={() => handleSizeToggle(size)}
                    className="border-sage-300 data-[state=checked]:bg-magenta-600 data-[state=checked]:border-magenta-600"
                  />
                  <Label
                    htmlFor={`size-${size}`}
                    className="text-sm font-light text-sage-700 cursor-pointer flex-1"
                  >
                    {getSizeLabel(size)}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Color Filter */}
      {availableColors.length > 0 && (
        <div className="space-y-4 border-t border-sage-100 pt-6">
          <button
            onClick={() => setIsColorOpen(!isColorOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-base font-light text-sage-800">
              {locale === 'el' ? 'Χρώμα' : 'Color'}
              {selectedColors.length > 0 && (
                <span className="ml-2 text-xs text-magenta-600">
                  ({selectedColors.length})
                </span>
              )}
            </h3>
            {isColorOpen ? (
              <ChevronUp className="h-4 w-4 text-sage-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-sage-500" />
            )}
          </button>

          {isColorOpen && (
            <div className="space-y-3">
              {availableColors.map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color}`}
                    checked={selectedColors.includes(color)}
                    onCheckedChange={() => handleColorToggle(color)}
                    className="border-sage-300 data-[state=checked]:bg-magenta-600 data-[state=checked]:border-magenta-600"
                  />
                  <Label
                    htmlFor={`color-${color}`}
                    className="text-sm font-light text-sage-700 cursor-pointer flex-1"
                  >
                    {getColorLabel(color)}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

