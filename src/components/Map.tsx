'use client';

import { useEffect, useState } from 'react';

export default function Map() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg bg-gray-200" />;
  }

  return (
    <iframe
      width="100%"
      height="400"
      style={{ border: 0, borderRadius: '0.5rem' }}
      src="https://www.openstreetmap.org/export/embed.html?bbox=13.6642253,49.5523578,13.6842253,49.5723578&layer=mapnik&marker=49.5623578,13.6742253"
      allowFullScreen={true}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
