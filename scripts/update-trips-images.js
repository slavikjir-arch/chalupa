const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/chalupa',
});

async function updateTripsImages() {
  const imageUpdates = [
    {
      name: 'Rozhledna Na Skále',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    },
    {
      name: 'Naučná stezka Železný Újezd',
      image: 'https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?w=600&h=400&fit=crop',
    },
    {
      name: 'Přírodní park Brdy',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
    },
    {
      name: 'Okruh kolem rybníka Dožín',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    },
    {
      name: 'Cyklovýlet na Čížkov',
      image: 'https://images.unsplash.com/photo-1533174072545-7a0b3d37dc5d?w=600&h=400&fit=crop',
    },
    {
      name: 'Historická architektura Železného Újezda',
      image: 'https://images.unsplash.com/photo-1523217311519-4a8ec36f7ee9?w=600&h=400&fit=crop',
    },
  ];

  const client = await pool.connect();
  try {
    for (const update of imageUpdates) {
      await client.query(
        'UPDATE trips SET image = $1 WHERE name = $2',
        [update.image, update.name]
      );
      console.log(`✓ Aktualizován obrázek: ${update.name}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

updateTripsImages().catch(console.error);
