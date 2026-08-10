const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/chalupa',
});

async function updateImages() {
  const images = [
    '/images/chalupa1.jpg',
    '/images/chalupa2.jpg',
  ];

  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE cottage_info SET images = $1 WHERE id = $2',
      [JSON.stringify(images), 'default']
    );
    console.log('✓ Obrázky aktualizovány v databázi');
  } finally {
    client.release();
    await pool.end();
  }
}

updateImages().catch(console.error);
