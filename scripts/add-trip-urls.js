const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/chalupa',
});

async function addTripUrls() {
  const tripUrls = [
    {
      name: 'Rozhledna Na Skále',
      url: 'https://www.rozhledny.cz/rozhledna-na-skale-zelenohorska-posta/',
    },
    {
      name: 'Naučná stezka Železný Újezd',
      url: 'https://www.truestories.cz/cs/mista/naucna-stezka-zelenohorske-poste',
    },
    {
      name: 'Výlet do Brdy',
      url: 'https://cs.wikipedia.org/wiki/%C5%A0vihovsk%C3%A1_vrchovina',
    },
    {
      name: 'Procházka kolem rybníka Dožín',
      url: 'https://www.mapy.cz/zakladni?x=13.8&y=49.5&z=12&q=Rybnik%20Dozin',
    },
    {
      name: 'Cyklovýlet na Čížkov',
      url: 'https://www.cyklotrasy.cz/ceska-ciklotrasa',
    },
    {
      name: 'Historická architektura Železného Újezda',
      url: 'https://www.zelenohorska-posta.cz/',
    },
    {
      name: 'Zřícenina hradu Třemšín',
      url: 'https://cs.wikipedia.org/wiki/Hrad_T%C5%99em%C5%A1%C3%ADn',
    },
    {
      name: 'Přírodní rezervace Fajmanovy skály',
      url: 'https://cs.wikipedia.org/wiki/Fajmanovy_skal%C3%A9',
    },
    {
      name: 'Farma Zlatá kráva',
      url: 'https://www.farmazlatakrava.cz/',
    },
    {
      name: 'Padrťské rybníky',
      url: 'https://www.mapy.cz/zakladni?x=13.7&y=49.4&z=12&q=Padr%C5%A5sk%C3%A9%20rybn%C3%ADky',
    },
    {
      name: 'Rozhledna Šťastná věž',
      url: 'https://www.rozhledny.cz/rozhledna-stastna-vez/',
    },
    {
      name: 'Tenisový kurt - Spálené Poříčí',
      url: 'https://www.mapy.cz/zakladni?x=13.9&y=49.6&z=13&q=Spalene%20Poricí%20tenis',
    },
    {
      name: 'Zámeček Zelenohorská pošta + Nepomuk',
      url: 'https://www.nepomuk.cz/',
    },
    {
      name: 'Přírodní koupací biotop Blovice',
      url: 'https://www.blovice.cz/',
    },
    {
      name: 'Rybník Drahota - možnost koupání',
      url: 'https://www.mapy.cz/zakladni?x=13.8&y=49.5&z=13&q=Rybnik%20Drahota',
    },
  ];

  const client = await pool.connect();
  try {
    for (const trip of tripUrls) {
      await client.query(
        'UPDATE trips SET url = $1 WHERE name = $2',
        [trip.url, trip.name]
      );
      console.log(`✓ Aktualizován URL: ${trip.name}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

addTripUrls().catch(console.error);
