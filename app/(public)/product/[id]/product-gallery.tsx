"use client"

import { useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gradient-to-br from-sage-50/30 to-mint-50/20 rounded-2xl overflow-hidden shadow-lg border border-sage-100">
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <Package className="h-20 w-20 text-sage-300" />
          <span className="text-sage-500 font-light">No image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-gradient-to-br from-sage-50/30 to-mint-50/20 rounded-2xl overflow-hidden shadow-xl border border-sage-100 group">
        <Image
          src={images[selectedImage]}
          alt={`${productName} - ${selectedImage + 1}`}
          width={800}
          height={800}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          priority={selectedImage === 0}
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-sage-900/5 to-transparent pointer-events-none" />
        
        {/* Image Counter Badge */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <span className="text-sm font-light text-sage-900">
              {selectedImage + 1} / {images.length}
            </span>
          </div>
        )}
      </div>
      
      {/* Thumbnail gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`aspect-square bg-gradient-to-br from-sage-50/30 to-mint-50/20 rounded-xl overflow-hidden transition-all duration-300 ${
                selectedImage === idx 
                  ? 'ring-2 ring-magenta-600 ring-offset-2 shadow-lg scale-105' 
                  : 'hover:shadow-md hover:scale-105 opacity-70 hover:opacity-100'
              }`}
              aria-label={`View image ${idx + 1} of ${images.length}`}
              aria-pressed={selectedImage === idx}
              type="button"
            >
              <Image
                src={image}
                alt={`${productName} - View ${idx + 1}`}
                width={200}
                height={200}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

