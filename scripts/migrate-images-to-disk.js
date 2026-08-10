const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const https = require('https');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/chalupa',
});

// Mapování výletů na nové názvy fotek
const tripImages = {
  'Rozhledna Na Skále': '/trips/rozhledna-na-skale.jpg',
  'Naučná stezka Železný Újezd': '/trips/naucna-stezka.jpg',
  'Přírodní park Brdy': '/trips/prirodni-park-brdy.jpg',
  'Okruh kolem rybníka Dožín': '/trips/rybnik-dozin.jpg',
  'Cyklovýlet na Čížkov': '/trips/cyklovylet-cizkov.jpg',
  'Historická architektura Železného Újezda': '/trips/architektura.jpg',
  'Zřícenina hradu Třemšín': '/trips/hrad-tremstin.jpg',
  'Přírodní rezervace Fajmanovy skály': '/trips/fajmanovy-skaly.jpg',
  'Farma Zlatá kráva': '/trips/farma.jpg',
  'Padrťské rybníky': '/trips/padrske-rybniky.jpg',
  'Rozhledna Šťastná věž': '/trips/rozhledna-stastna.jpg',
  'Tenisový kurt - Spálené Poříčí': '/trips/tenis.jpg',
  'Zámeček Zelenohorská pošta + Nepomuk': '/trips/zamecek.jpg',
  'Přírodní koupací biotop Blovice': '/trips/blovice.jpg',
  'Rybník Drahota - možnost koupání': '/trips/rybnik-drahota.jpg',
};

async function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function migrateTripsImages() {
  const client = await pool.connect();
  try {
    // Hledej všechny výlety
    const result = await client.query('SELECT id, name, image FROM trips');

    for (const trip of result.rows) {
      const localPath = tripImages[trip.name];

      if (localPath) {
        // Aktualizuj databázi s lokální cestou
        await client.query(
          'UPDATE trips SET image = $1 WHERE id = $2',
          [localPath, trip.id]
        );
        console.log(`✓ ${trip.name} → ${localPath}`);
      } else {
        console.log(`⚠ ${trip.name} - není mapování`);
      }
    }

    console.log('\n✓ Databáze byla aktualizována s lokálními cestami!');
    console.log('\nPozn: Fotky musíš ručně umístit do /public/trips/');
    console.log('Nebo je mohu stáhnout z internetu - řekni slovo!');
  } finally {
    client.release();
    await pool.end();
  }
}

migrateTripsImages().catch(console.error);
