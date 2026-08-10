'use client';

import { useEffect, useState } from 'react';

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([]);
  const [current, setCurrent] = useState<number | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      setImages(data.files || []);
    };
    fetchImages();
  }, []);

  const open = (idx: number) => setCurrent(idx);
  const close = () => setCurrent(null);
  const next = () => {
    if (current !== null) setCurrent((current + 1) % images.length);
  };
  const prev = () => {
    if (current !== null) setCurrent((current - 1 + images.length) % images.length);
  };

  // keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (current === null) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, images.length]);

  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8 text-center">Fotogalerie</h1>
        {images.length === 0 ? (
          <p className="text-center text-gray-600">Žádné fotografie nejsou k dispozici.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`Galerie ${i + 1}`}
                className="w-full h-40 object-cover rounded-lg cursor-pointer shadow-md hover:opacity-90"
                onClick={() => open(i)}
              />
            ))}
          </div>
        )}
      </section>

      {/* lightbox */}
      {current !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={close}
          >
            &times;
          </button>
          <button
            className="absolute left-4 text-white text-3xl"
            onClick={prev}
          >
            &#8249;
          </button>
          <img
            src={images[current]}
            className="max-h-full max-w-full rounded-lg"
            alt="Velká fotografie"
          />
          <button
            className="absolute right-4 text-white text-3xl"
            onClick={next}
          >
            &#8250;
          </button>
        </div>
      )}
    </main>
  );
}