const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/chalupa',
});

async function seedTrips() {
  const trips = [
    {
      name: 'Rozhledna Na Skále',
      description: 'Historická rozhledna s nádherným výhledem na okolní krajinu. Z vrcholu vidíte rybník Dožín, lesní krajinu Brd a okolní vesnice. Ideální pro fotografy a milovníky přírody.',
      location: 'Železný Újezd (3 km)',
      difficulty: 'easy',
      duration: '2 hodiny',
      highlights: ['Panoramatický výhled', 'Rybník Dožín', 'Historická stavba', 'Lesní stezky'],
      image: '/gallery/F5.jpg',
    },
    {
      name: 'Naučná stezka Železný Újezd',
      description: 'Vzdělávací procházka po cestě s informačními tabulemi o místní přírodě, historii a architektuře. Dozvíte se zajímavosti o lokalitě a seznámíte se s místní flórou a faunou.',
      location: 'Železný Újezd',
      difficulty: 'easy',
      duration: '1.5 hodin',
      highlights: ['Informační tabule', 'Přírodní zajímavosti', 'Místní historie', 'Architektura'],
      image: '/gallery/F3.jpg',
    },
    {
      name: 'Přírodní park Brdy',
      description: 'Poznávání jedinečné krajiny Švihovské vrchoviny (Brdy) - chráněný přírodní park s čistou přírodou, hlasitými ptáky a lesními cestami. Ideální pro přírodovědce a milovníky tiché přírody.',
      location: 'Okolí Železného Újezda (8 km)',
      difficulty: 'medium',
      duration: '4 hodiny',
      highlights: ['Chráněný přírodní park', 'Lesní ekosystém', 'Vzácné rostliny a zvířata', 'Údolí potoků'],
      image: '/gallery/F4.jpg',
    },
    {
      name: 'Okruh kolem rybníka Dožín',
      description: 'Relaxační kruh okolo rybníka s možností pozorování vodních ptáků. Ideální pro rodiny s dětmi a milovníky klidných procházek. Najdete zde pěkná pikniková místa.',
      location: 'Okolí Železného Újezda (2 km)',
      difficulty: 'easy',
      duration: '1.5 hodin',
      highlights: ['Vodní ptáci', 'Výhled na hladinu', 'Přírodní fotografie', 'Pikniková místa'],
      image: '/gallery/F6.jpg',
    },
    {
      name: 'Cyklovýlet na Čížkov',
      description: 'Příjemný cyklistický výlet do nedalekého Čížkova. Cesta vede po místních cyklostezkách, skrz pitoreskní krajinu. V Čížkově si můžete odpočinout a ochutnat místní speciality.',
      location: 'Čížkov (6 km)',
      difficulty: 'medium',
      duration: '2.5 hodin',
      highlights: ['Cyklostezky', 'Pitoreskní vesnice', 'Místní hospůdka', 'Pastorální krajina'],
      image: '/gallery/F2.jpg',
    },
    {
      name: 'Historická architektura Železného Újezda',
      description: 'Procházka zaměřená na tradičí českou architekturu a místní památky. Uvidíte krásné venkovské stavby, sochu svatého Floriana a seznámíte se s kulturním dědictvím regionu.',
      location: 'Železný Újezd',
      difficulty: 'easy',
      duration: '1.5 hodin',
      highlights: ['Tradiční česká stavby', 'Svatý Florián', 'Kulturní pamětihodnosti', 'Místní tradice'],
      image: '/gallery/F7.jpg',
    },
  ];

  const client = await pool.connect();
  try {
    for (const trip of trips) {
      const id = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await client.query(
        `INSERT INTO trips (id, name, description, location, difficulty, duration, highlights, image)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          id,
          trip.name,
          trip.description,
          trip.location,
          trip.difficulty,
          trip.duration,
          JSON.stringify(trip.highlights),
          trip.image,
        ]
      );
      console.log(`✓ Přidán výlet: ${trip.name}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

seedTrips().catch(console.error);
