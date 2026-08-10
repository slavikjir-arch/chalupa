const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/chalupa',
});

async function updateDrahota() {
  const client = await pool.connect();
  try {
    const imageUrl = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&h=400&fit=crop';

    await client.query(
      'UPDATE trips SET image = $1 WHERE name = $2',
      [imageUrl, 'Rybník Drahota - možnost koupání']
    );

    const result = await client.query(
      'SELECT name, image FROM trips WHERE name = $1',
      ['Rybník Drahota - možnost koupání']
    );

    if (result.rows.length > 0) {
      console.log('✓ Obrázek Drahoty aktualizován');
      console.log(`  Nová URL: ${result.rows[0].image}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

updateDrahota().catch(console.error);
