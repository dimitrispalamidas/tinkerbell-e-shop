"use client"

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-muted-foreground">No image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
        <Image
          src={images[selectedImage]}
          alt={`${productName} - ${selectedImage + 1}`}
          width={600}
          height={600}
          className="object-cover w-full h-full"
          priority={selectedImage === 0}
        />
      </div>
      
      {/* Thumbnail gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`aspect-square bg-muted rounded-lg overflow-hidden transition-all ${
                selectedImage === idx 
                  ? 'ring-2 ring-primary ring-offset-2' 
                  : 'hover:opacity-75'
              }`}
            >
              <Image
                src={image}
                alt={`${productName} - ${idx + 1}`}
                width={150}
                height={150}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

