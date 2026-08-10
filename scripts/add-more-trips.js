const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/chalupa',
});

async function addMoreTrips() {
  const trips = [
    {
      name: 'Zřícenina hradu Třemšín',
      description: 'Návštěva středověkého hradu se zajímavou historií. Ruiny hradního komplexu nabízí nádherný výhled na okolí a jsou oblíbeným cílem milovníků historie a architektur. Ideální pro fotografy a historiky.',
      location: 'Třemšín (15 km)',
      difficulty: 'medium',
      duration: '3 hodiny',
      highlights: ['Středověké ruiny', 'Historická architektura', 'Panoramatický výhled', 'Fotografické Body'],
      image: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=600&h=400&fit=crop',
    },
    {
      name: 'Přírodní rezervace Fajmanovy skály',
      description: 'Chráněné skální útvary s jedinečnou přírodou. Rezervace je domovem vzácných rostlin a živočichů. Procházka přináší seznámení s geologií a přírodou českého vnitrozemí.',
      location: 'Fajmanovy skály (18 km)',
      difficulty: 'medium',
      duration: '2.5 hodin',
      highlights: ['Skální útvary', 'Chráněné druhy', 'Geologické zajímavosti', 'Přírodní krása'],
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    },
    {
      name: 'Farma Zlatá kráva',
      description: 'Agroturistická farma s možností poznávání zemědělství a chovů. Ideální pro rodiny s dětmi - mohou se seznámit s chovem zvířat a naučit se o místním zemědělství. Prodej domácích produktů.',
      location: 'Blízkost Železného Újezda (8 km)',
      difficulty: 'easy',
      duration: '2 hodiny',
      highlights: ['Zvířata', 'Zemědělství', 'Edukace pro děti', 'Farmářské produkty'],
      image: 'https://images.unsplash.com/photo-1500595046891-b56beb253d9d?w=600&h=400&fit=crop',
    },
    {
      name: 'Padrťské rybníky',
      description: 'Systém tří rybníků v krásné přírodě. Ideální pro milovníky rybaření, fotografy fauny a ty, kteří hledají klid v přírodě. Rybníky jsou součástí chráněné krajinné oblasti.',
      location: 'Padrť (12 km)',
      difficulty: 'easy',
      duration: '2 hodiny',
      highlights: ['Rybníky', 'Rybaření', 'Pozorování ptáků', 'Přírodní krajina'],
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    },
    {
      name: 'Rozhledna Šťastná věž',
      description: 'Nádherná rozhledna se panoramatickým výhledem na celou krajinu. Věž nabízí jeden z nejlepších výhledů v regionu s možností vidět na desítky kilometrů daleko.',
      location: 'Šťastná (10 km)',
      difficulty: 'medium',
      duration: '2 hodiny',
      highlights: ['Panoramatický výhled', 'Fotografie krajiny', 'Historická stavba', 'Vzdálené pohledy'],
      image: 'https://images.unsplash.com/photo-1489900135156-2954e7128bae?w=600&h=400&fit=crop',
    },
    {
      name: 'Tenisový kurt - Spálené Poříčí',
      description: 'Dobře udržované tenisové kurty s možností pronájmu. Ideální pro aktivní dovolenou a sportovní vyžití. V okolí je možné se občerstvit v místní hospůdce.',
      location: 'Spálené Poříčí (7 km)',
      difficulty: 'easy',
      duration: '1.5 hodin',
      highlights: ['Tenis', 'Sport', 'Rekreace', 'Sociální aktivita'],
      image: 'https://images.unsplash.com/photo-1554224311-beee415c15c?w=600&h=400&fit=crop',
    },
    {
      name: 'Zámeček Zelenohorská pošta + Nepomuk',
      description: 'Historický zámek s postupně se rozvíjejícím areálem. Návštěva zahrnuje prohlídku stavby, seznámení s historií regionu a nádhernou přírodou okolí. V blízkosti leží město Nepomuk.',
      location: 'Zelenohorská Pošta (20 km)',
      difficulty: 'medium',
      duration: '4 hodiny',
      highlights: ['Historická stavba', 'Architektura', 'Městská setkání', 'Kulturní dědictví'],
      image: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=600&h=400&fit=crop',
    },
    {
      name: 'Přírodní koupací biotop Blovice',
      description: 'Ekologický koupací prostor v přírodě bez chemických látek. Ideální pro letní chvíle v čisté vodě obklopené přírodou. Koupání bez hluku a sucha moderního bazénu.',
      location: 'Blovice (14 km)',
      difficulty: 'easy',
      duration: '3 hodiny',
      highlights: ['Koupání v přírodě', 'Čistá voda', 'Ekologický přístup', 'Sluneční pláž'],
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    },
    {
      name: 'Rybník Drahota - možnost koupání',
      description: 'Krásný rybník s přírodní pláží a čistou vodou. Součást chráněné krajiny s bohatou přírodou. Ideální pro rodiny - mělčina pro děti, hluboké části pro plavce.',
      location: 'Drahota (6 km)',
      difficulty: 'easy',
      duration: '3 hodiny',
      highlights: ['Koupání', 'Přírodní pláž', 'Bezpečnost pro děti', 'Rybaření'],
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
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
      console.log(`✓ Přidáno: ${trip.name}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

addMoreTrips().catch(console.error);
