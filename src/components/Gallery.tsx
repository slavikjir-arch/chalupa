'use client';

import React from 'react';

interface GalleryProps {
  images: string[];
}

export default function Gallery({ images }: GalleryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Fotka chalupy ${i + 1}`}
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.style.display = 'none';
            const parent = img.parentElement;
            if (parent) {
              const error = document.createElement('div');
              error.style.cssText = 'width:100%;aspect-ratio:4/3;background:#e0e0e0;display:flex;align-items:center;justify-content:center;color:#666;border-radius:8px';
              error.textContent = 'Fotka nenalezena: ' + src;
              parent.appendChild(error);
            }
          }}
          className="w-full h-auto rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer"
          style={{ display: 'block' }}
        />
      ))}
    </div>
  );
}
