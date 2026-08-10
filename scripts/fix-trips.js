const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/chalupa',
});

async function fixTrips() {
  const client = await pool.connect();
  try {
    // Přidání URL všem výletům včetně těch starých
    const updates = [
      ['Rozhledna Na Skále', 'https://www.rozhledny.cz/rozhledna-na-skale-zelenohorska-posta/'],
      ['Naučná stezka Železný Újezd', 'https://www.truestories.cz/cs/mista/naucna-stezka-zelenohorske-poste'],
      ['Výlet do Brdy', 'https://cs.wikipedia.org/wiki/%C5%A0vihovsk%C3%A1_vrchovina'],
      ['Procházka kolem rybníka Dožín', 'https://www.mapy.cz/zakladni?x=13.8&y=49.5&z=12&q=Rybnik%20Dozin'],
      ['Cyklovýlet na Čížkov', 'https://www.cyklotrasy.cz/ceska-ciklotrasa'],
      ['Historická architektura Železného Újezda', 'https://www.zelenohorska-posta.cz/'],
      ['Přírodní park Brdy', 'https://cs.wikipedia.org/wiki/%C5%A0vihovsk%C3%A1_vrchovina'],
      ['Okruh kolem rybníka Dožín', 'https://www.mapy.cz/zakladni?x=13.8&y=49.5&z=12&q=Rybnik%20Dozin'],
    ];

    for (const [name, url] of updates) {
      await client.query(
        'UPDATE trips SET url = $1 WHERE name = $2',
        [url, name]
      );
      console.log(`✓ Aktualizováno: ${name}`);
    }

    // Zobrazení všech výletů s URL
    console.log('\n=== Výlety s URL ===');
    const result = await client.query('SELECT name, url FROM trips ORDER BY name');
    result.rows.forEach(row => {
      console.log(`${row.name}: ${row.url || '(bez URL)'}`);
    });
  } finally {
    client.release();
    await pool.end();
  }
}

fixTrips().catch(console.error);
