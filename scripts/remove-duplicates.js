const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/chalupa',
});

async function removeDuplicates() {
  const client = await pool.connect();
  try {
    // Smazání všech trips a nová vložení
    await client.query('DELETE FROM trips');

    const trips = [
      {
        name: 'Rozhledna Na Skále',
        description: 'Historická rozhledna s nádherným výhledem na okolní krajinu. Z vrcholu vidíte rybník Dožín, lesní krajinu Brd a okolní vesnice. Ideální pro fotografy a milovníky přírody.',
        location: 'Železný Újezd (3 km)',
        difficulty: 'easy',
        duration: '2 hodiny',
        highlights: ['Panoramatický výhled', 'Rybník Dožín', 'Historická stavba', 'Lesní stezky'],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
        url: 'https://www.rozhledny.cz/rozhledna-na-skale-zelenohorska-posta/',
      },
      {
        name: 'Naučná stezka Železný Újezd',
        description: 'Vzdělávací procházka po cestě s informačními tabulemi o místní přírodě, historii a architektuře. Dozvíte se zajímavosti o lokalitě a seznámíte se s místní flórou a faunou.',
        location: 'Železný Újezd',
        difficulty: 'easy',
        duration: '1.5 hodin',
        highlights: ['Informační tabule', 'Přírodní zajímavosti', 'Místní historie', 'Architektura'],
        image: 'https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?w=600&h=400&fit=crop',
        url: 'https://www.truestories.cz/cs/mista/naucna-stezka-zelenohorske-poste',
      },
      {
        name: 'Přírodní park Brdy',
        description: 'Poznávání jedinečné krajiny Švihovské vrchoviny (Brdy) - chráněný přírodní park s čistou přírodou, hlasitými ptáky a lesními cestami. Ideální pro přírodovědce a milovníky tiché přírody.',
        location: 'Okolí Železného Újezda (8 km)',
        difficulty: 'medium',
        duration: '4 hodiny',
        highlights: ['Chráněný přírodní park', 'Lesní ekosystém', 'Vzácné rostliny a zvířata', 'Údolí potoků'],
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
        url: 'https://cs.wikipedia.org/wiki/%C5%A0vihovsk%C3%A1_vrchovina',
      },
      {
        name: 'Okruh kolem rybníka Dožín',
        description: 'Relaxační kruh okolo rybníka s možností pozorování vodních ptáků. Ideální pro rodiny s dětmi a milovníky klidných procházek. Najdete zde pěkná pikniková místa.',
        location: 'Okolí Železného Újezda (2 km)',
        difficulty: 'easy',
        duration: '1.5 hodin',
        highlights: ['Vodní ptáci', 'Výhled na hladinu', 'Přírodní fotografie', 'Pikniková místa'],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
        url: 'https://www.mapy.cz/zakladni?x=13.8&y=49.5&z=12&q=Rybnik%20Dozin',
      },
      {
        name: 'Cyklovýlet na Čížkov',
        description: 'Příjemný cyklistický výlet do nedalekého Čížkova. Cesta vede po místních cyklostezkách, skrz pitoreskní krajinu. V Čížkově si můžete odpočinout a ochutnat místní speciality.',
        location: 'Čížkov (6 km)',
        difficulty: 'medium',
        duration: '2.5 hodin',
        highlights: ['Cyklostezky', 'Pitoreskní vesnice', 'Místní hospůdka', 'Pastorální krajina'],
        image: 'https://images.unsplash.com/photo-1533174072545-7a0b3d37dc5d?w=600&h=400&fit=crop',
        url: 'https://www.cyklotrasy.cz/ceska-ciklotrasa',
      },
      {
        name: 'Historická architektura Železného Újezda',
        description: 'Procházka zaměřená na tradičí českou architekturu a místní památky. Uvidíte krásné venkovské stavby, sochu svatého Floriana a seznámíte se s kulturním dědictvím regionu.',
        location: 'Železný Újezd',
        difficulty: 'easy',
        duration: '1.5 hodin',
        highlights: ['Tradiční česká stavby', 'Svatý Florián', 'Kulturní pamětihodnosti', 'Místní tradice'],
        image: 'https://images.unsplash.com/photo-1523217311519-4a8ec36f7ee9?w=600&h=400&fit=crop',
        url: 'https://www.zelenohorska-posta.cz/',
      },
      {
        name: 'Zřícenina hradu Třemšín',
        description: 'Návštěva středověkého hradu se zajímavou historií. Ruiny hradního komplexu nabízí nádherný výhled na okolí a jsou oblíbeným cílem milovníků historie a architektur. Ideální pro fotografy a historiky.',
        location: 'Třemšín (15 km)',
        difficulty: 'medium',
        duration: '3 hodiny',
        highlights: ['Středověké ruiny', 'Historická architektura', 'Panoramatický výhled', 'Fotografické Body'],
        image: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=600&h=400&fit=crop',
        url: 'https://cs.wikipedia.org/wiki/Hrad_T%C5%99em%C5%A1%C3%ADn',
      },
      {
        name: 'Přírodní rezervace Fajmanovy skály',
        description: 'Chráněné skální útvary s jedinečnou přírodou. Rezervace je domovem vzácných rostlin a živočichů. Procházka přináší seznámení s geologií a přírodou českého vnitrozemí.',
        location: 'Fajmanovy skály (18 km)',
        difficulty: 'medium',
        duration: '2.5 hodin',
        highlights: ['Skální útvary', 'Chráněné druhy', 'Geologické zajímavosti', 'Přírodní krása'],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
        url: 'https://cs.wikipedia.org/wiki/Fajmanovy_skal%C3%A9',
      },
      {
        name: 'Farma Zlatá kráva',
        description: 'Agroturistická farma s možností poznávání zemědělství a chovů. Ideální pro rodiny s dětmi - mohou se seznámit s chovem zvířat a naučit se o místním zemědělství. Prodej domácích produktů.',
        location: 'Blízkost Železného Újezda (8 km)',
        difficulty: 'easy',
        duration: '2 hodiny',
        highlights: ['Zvířata', 'Zemědělství', 'Edukace pro děti', 'Farmářské produkty'],
        image: 'https://images.unsplash.com/photo-1500595046891-b56beb253d9d?w=600&h=400&fit=crop',
        url: 'https://www.farmazlatakrava.cz/',
      },
      {
        name: 'Padrťské rybníky',
        description: 'Systém tří rybníků v krásné přírodě. Ideální pro milovníky rybaření, fotografy fauny a ty, kteří hledají klid v přírodě. Rybníky jsou součástí chráněné krajinné oblasti.',
        location: 'Padrť (12 km)',
        difficulty: 'easy',
        duration: '2 hodiny',
        highlights: ['Rybníky', 'Rybaření', 'Pozorování ptáků', 'Přírodní krajina'],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
        url: 'https://www.mapy.cz/zakladni?x=13.7&y=49.4&z=12&q=Padr%C5%A5sk%C3%A9%20rybn%C3%ADky',
      },
      {
        name: 'Rozhledna Šťastná věž',
        description: 'Nádherná rozhledna se panoramatickým výhledem na celou krajinu. Věž nabízí jeden z nejlepších výhledů v regionu s možností vidět na desítky kilometrů daleko.',
        location: 'Šťastná (10 km)',
        difficulty: 'medium',
        duration: '2 hodiny',
        highlights: ['Panoramatický výhled', 'Fotografie krajiny', 'Historická stavba', 'Vzdálené pohledy'],
        image: 'https://images.unsplash.com/photo-1489900135156-2954e7128bae?w=600&h=400&fit=crop',
        url: 'https://www.rozhledny.cz/rozhledna-stastna-vez/',
      },
      {
        name: 'Tenisový kurt - Spálené Poříčí',
        description: 'Dobře udržované tenisové kurty s možností pronájmu. Ideální pro aktivní dovolenou a sportovní vyžití. V okolí je možné se občerstvit v místní hospůdce.',
        location: 'Spálené Poříčí (7 km)',
        difficulty: 'easy',
        duration: '1.5 hodin',
        highlights: ['Tenis', 'Sport', 'Rekreace', 'Sociální aktivita'],
        image: 'https://images.unsplash.com/photo-1554224311-beee415c15c?w=600&h=400&fit=crop',
        url: 'https://www.mapy.cz/zakladni?x=13.9&y=49.6&z=13&q=Spalene%20Poricí%20tenis',
      },
      {
        name: 'Zámeček Zelenohorská pošta + Nepomuk',
        description: 'Historický zámek s postupně se rozvíjejícím areálem. Návštěva zahrnuje prohlídku stavby, seznámení s historií regionu a nádhernou přírodou okolí. V blízkosti leží město Nepomuk.',
        location: 'Zelenohorská Pošta (20 km)',
        difficulty: 'medium',
        duration: '4 hodiny',
        highlights: ['Historická stavba', 'Architektura', 'Městská setkání', 'Kulturní dědictví'],
        image: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=600&h=400&fit=crop',
        url: 'https://www.nepomuk.cz/',
      },
      {
        name: 'Přírodní koupací biotop Blovice',
        description: 'Ekologický koupací prostor v přírodě bez chemických látek. Ideální pro letní chvíle v čisté vodě obklopené přírodou. Koupání bez hluku a sucha moderního bazénu.',
        location: 'Blovice (14 km)',
        difficulty: 'easy',
        duration: '3 hodiny',
        highlights: ['Koupání v přírodě', 'Čistá voda', 'Ekologický přístup', 'Sluneční pláž'],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
        url: 'https://www.blovice.cz/',
      },
      {
        name: 'Rybník Drahota - možnost koupání',
        description: 'Krásný rybník s přírodní pláží a čistou vodou. Součást chráněné krajiny s bohatou přírodou. Ideální pro rodiny - mělčina pro děti, hluboké části pro plavce.',
        location: 'Drahota (6 km)',
        difficulty: 'easy',
        duration: '3 hodiny',
        highlights: ['Koupání', 'Přírodní pláž', 'Bezpečnost pro děti', 'Rybaření'],
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
        url: 'https://www.mapy.cz/zakladni?x=13.8&y=49.5&z=13&q=Rybnik%20Drahota',
      },
    ];

    for (const trip of trips) {
      const id = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await client.query(
        `INSERT INTO trips (id, name, description, location, difficulty, duration, highlights, image, url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          id,
          trip.name,
          trip.description,
          trip.location,
          trip.difficulty,
          trip.duration,
          JSON.stringify(trip.highlights),
          trip.image,
          trip.url,
        ]
      );
      console.log(`✓ ${trip.name}`);
    }

    console.log(`\n✓ Všechny ${trips.length} výlety byly přidány!`);
  } finally {
    client.release();
    await pool.end();
  }
}

removeDuplicates().catch(console.error);
