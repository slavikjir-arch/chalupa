import { Pool } from 'pg';
import { Reservation, CottageInfo, Trip } from './types';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let initialized = false;

async function initializeDatabase() {
  if (initialized) return;

  const client = await pool.connect();
  try {
    // Vytvoření tabulek
    await client.query(`
      CREATE TABLE IF NOT EXISTS cottage_info (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        "pricePerNight" NUMERIC NOT NULL,
        amenities JSONB NOT NULL,
        images JSONB NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reservations (
        id TEXT PRIMARY KEY,
        "guestName" TEXT NOT NULL,
        "guestEmail" TEXT NOT NULL,
        "guestPhone" TEXT NOT NULL,
        "checkInDate" TEXT NOT NULL,
        "checkOutDate" TEXT NOT NULL,
        "numberOfGuests" INTEGER NOT NULL,
        "totalPrice" NUMERIC NOT NULL,
        status TEXT DEFAULT 'pending',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        duration TEXT NOT NULL,
        highlights JSONB NOT NULL,
        image TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS availability (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL UNIQUE,
        available INTEGER DEFAULT 1,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Vložení výchozí informace o chalupě
    const result = await client.query(
      'SELECT name FROM cottage_info WHERE id = $1 LIMIT 1',
      ['default']
    );

    if (result.rows.length === 0) {
      await client.query(`
        INSERT INTO cottage_info (
          id, name, description, capacity, "pricePerNight", amenities, images
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        'default',
        'Chalupa Brdy',
        'Krásná venkovská chalupa v Železném Újezdě obklopená květinami a zelení. Ideální pro rodiny a skupiny přátel. Chalupa nabízí 8 míst na spaní (3x dvoulůžko, 1x jednolůžko, 1x rozkládací gauč). Vytápění je zajištěno plynovým kotlem a radiátory. Kuchyň je vybavena sporákem, troubou, mikrovlnkou a lednicí. V chalupě jsou 2 ložnice, kuchyň a prostorný obývák spojený s jídelnou. Vedle chalupy je příjemná hospůdka, kde vaří.',
        8,
        2500,
        JSON.stringify([
          'Vytápění (plynový kotel a radiátory)',
          'Kuchyň (sporák, trouba, mikrovlnka, lednice)',
          '2 ložnice',
          'Prostorny obývák spojený s jídelnou',
          '8 míst na spaní (3x dvoulůžko, 1x jednolůžko, 1x rozkládací gauč)',
          'Zahrada',
          'Gril',
          'Příjemná hospůdka vedle chalupy',
        ]),
        JSON.stringify([
          '/gallery/ch1.jpg',
          '/gallery/F2.jpg',
          '/gallery/F3.jpg',
          '/gallery/F4.jpg',
          '/gallery/F5.jpg',
          '/gallery/F6.jpg',
          '/gallery/F7.jpg',
          '/gallery/F8.jpg',
          '/gallery/F9.jpg',
          '/gallery/F10.jpg',
        ])
      ]);
    } else {
      // Vždy aktualizujeme data na správné hodnoty
      await client.query(`
        UPDATE cottage_info
        SET name = $1, images = $2
        WHERE id = 'default'
      `, [
        'Chalupa Brdy',
        JSON.stringify([
          '/gallery/ch1.jpg',
          '/gallery/F2.jpg',
          '/gallery/F3.jpg',
          '/gallery/F4.jpg',
          '/gallery/F5.jpg',
          '/gallery/F6.jpg',
          '/gallery/F7.jpg',
          '/gallery/F8.jpg',
          '/gallery/F9.jpg',
          '/gallery/F10.jpg',
        ])
      ]);
    }

    // Inicializace výletů
    const tripsResult = await client.query('SELECT COUNT(*) as count FROM trips');
    const tripsCount = parseInt(tripsResult.rows[0].count, 10);

    if (tripsCount === 0) {
      const trips = [
        {
          name: 'Rybník Drahota - možnost koupání',
          description: 'Krásný rybník s přírodní pláží a čistou vodou. Součást chráněné krajiny s bohatou přírodou. Ideální pro rodiny - mělčina pro děti, hluboké části pro plavce.',
          location: 'Drahota (6 km)',
          difficulty: 'easy',
          duration: '3 hodiny',
          highlights: ['Koupání', 'Přírodní pláž', 'Bezpečnost pro děti', 'Rybaření'],
          image: '/trips/rybnik-drahota.jpg',
        },
        {
          name: 'Přírodní koupací biotop Blovice',
          description: 'Ekologický koupací prostor v přírodě bez chemických látek. Ideální pro letní chvíle v čisté vodě obklopené přírodou. Koupání bez hluku a sucha moderního bazénu.',
          location: 'Blovice (14 km)',
          difficulty: 'easy',
          duration: '3 hodiny',
          highlights: ['Koupání v přírodě', 'Čistá voda', 'Ekologický přístup', 'Sluneční pláž'],
          image: '/trips/blovice.jpg',
        },
        {
          name: 'Zámeček Zelenohorská pošta + Nepomuk',
          description: 'Historický zámek s postupně se rozvíjejícím areálem. Návštěva zahrnuje prohlídku stavby, seznámení s historií regionu a nádhernou přírodou okolí. V blízkosti leží město Nepomuk.',
          location: 'Zelenohorská Pošta (20 km)',
          difficulty: 'medium',
          duration: '4 hodiny',
          highlights: ['Historická stavba', 'Architektura', 'Městská setkání', 'Kulturní dědictví'],
          image: '/trips/zamecek.jpg',
        },
        {
          name: 'Tenisový kurt - Spálené Poříčí',
          description: 'Dobře udržované tenisové kurty s možností pronájmu. Ideální pro aktivní dovolenou a sportovní vyžití. V okolí je možné se občerstvit v místní hospůdce.',
          location: 'Spálené Poříčí (7 km)',
          difficulty: 'easy',
          duration: '1.5 hodin',
          highlights: ['Tenis', 'Sport', 'Rekreace', 'Sociální aktivita'],
          image: '/trips/tenis.jpg',
        },
        {
          name: 'Rozhledna Šťastná věž',
          description: 'Nádherná rozhledna se panoramatickým výhledem na celou krajinu. Věž nabízí jeden z nejlepších výhledů v regionu s možností vidět na desítky kilometrů daleko.',
          location: 'Šťastná (10 km)',
          difficulty: 'medium',
          duration: '2 hodiny',
          highlights: ['Panoramatický výhled', 'Fotografie krajiny', 'Historická stavba', 'Vzdálené pohledy'],
          image: '/trips/rozhledna-stastna.jpg',
        },
        {
          name: 'Padrťské rybníky',
          description: 'Systém tří rybníků v krásné přírodě. Ideální pro milovníky rybaření, fotografy fauny a ty, kteří hledají klid v přírodě. Rybníky jsou součástí chráněné krajinné oblasti.',
          location: 'Padrť (12 km)',
          difficulty: 'easy',
          duration: '2 hodiny',
          highlights: ['Rybníky', 'Rybaření', 'Pozorování ptáků', 'Přírodní krajina'],
          image: '/trips/padrske-rybniky.jpg',
        },
        {
          name: 'Farma Zlatá kráva',
          description: 'Agroturistická farma s možností poznávání zemědělství a chovů. Ideální pro rodiny s dětmi - mohou se seznámit s chovem zvířat a naučit se o místním zemědělství. Prodej domácích produktů.',
          location: 'Blízkost Železného Újezda (8 km)',
          difficulty: 'easy',
          duration: '2 hodiny',
          highlights: ['Zvířata', 'Zemědělství', 'Edukace pro děti', 'Farmářské produkty'],
          image: '/trips/farma.jpg',
        },
        {
          name: 'Přírodní rezervace Fajmanovy skály',
          description: 'Chráněné skální útvary s jedinečnou přírodou. Rezervace je domovem vzácných rostlin a živočichů. Procházka přináší seznámení s geologií a přírodou českého vnitrozemí.',
          location: 'Fajmanovy skály (18 km)',
          difficulty: 'medium',
          duration: '2.5 hodin',
          highlights: ['Skální útvary', 'Chráněné druhy', 'Geologické zajímavosti', 'Přírodní krása'],
          image: '/trips/fajmanovy-skaly.jpg',
        },
        {
          name: 'Zřícenina hradu Třemšín',
          description: 'Návštěva středověkého hradu se zajímavou historií. Ruiny hradního komplexu nabízí nádherný výhled na okolí a jsou oblíbeným cílem milovníků historie a architektur. Ideální pro fotografy a historiky.',
          location: 'Třemšín (15 km)',
          difficulty: 'medium',
          duration: '3 hodiny',
          highlights: ['Středověké ruiny', 'Historická architektura', 'Panoramatický výhled', 'Fotografické Body'],
          image: '/trips/hrad-tremstin.jpg',
        },
        {
          name: 'Historická architektura Železného Újezda',
          description: 'Procházka zaměřená na tradičí českou architekturu a místní památky. Uvidíte krásné venkovské stavby, sochu svatého Floriana a seznámíte se s kulturním dědictvím regionu.',
          location: 'Železný Újezd',
          difficulty: 'easy',
          duration: '1.5 hodin',
          highlights: ['Tradiční česká stavby', 'Svatý Florián', 'Kulturní pamětihodnosti', 'Místní tradice'],
          image: '/trips/architektura.jpg',
        },
        {
          name: 'Cyklovýlet na Čížkov',
          description: 'Příjemný cyklistický výlet do nedalekého Čížkova. Cesta vede po místních cyklostezkách, skrz pitoreskní krajinu. V Čížkově si můžete odpočinout a ochutnat místní speciality.',
          location: 'Čížkov (6 km)',
          difficulty: 'medium',
          duration: '2.5 hodin',
          highlights: ['Cyklostezky', 'Pitoreskní vesnice', 'Místní hospůdka', 'Pastorální krajina'],
          image: '/trips/cyklovylet-cizkov.jpg',
        },
        {
          name: 'Okruh kolem rybníka Dožín',
          description: 'Relaxační kruh okolo rybníka s možností pozorování vodních ptáků. Ideální pro rodiny s dětmi a milovníky klidných procházek. Najdete zde pěkná pikniková místa.',
          location: 'Okolí Železného Újezda (2 km)',
          difficulty: 'easy',
          duration: '1.5 hodin',
          highlights: ['Vodní ptáci', 'Výhled na hladinu', 'Přírodní fotografie', 'Pikniková místa'],
          image: '/trips/rybnik-dozin.jpg',
        },
        {
          name: 'Přírodní park Brdy',
          description: 'Poznávání jedinečné krajiny Švihovské vrchoviny (Brdy) - chráněný přírodní park s čistou přírodou, hlasitými ptáky a lesními cestami. Ideální pro přírodovědce a milovníky tiché přírody.',
          location: 'Okolí Železného Újezda (8 km)',
          difficulty: 'medium',
          duration: '4 hodiny',
          highlights: ['Chráněný přírodní park', 'Lesní ekosystém', 'Vzácné rostliny a zvířata', 'Údolí potoků'],
          image: '/trips/prirodni-park-brdy.jpg',
        },
        {
          name: 'Naučná stezka Železný Újezd',
          description: 'Vzdělávací procházka po cestě s informačními tabulemi o místní přírodě, historii a architektuře. Dozvíte se zajímavosti o lokalitě a seznámíte se s místní flórou a faunou.',
          location: 'Železný Újezd',
          difficulty: 'easy',
          duration: '1.5 hodin',
          highlights: ['Informační tabule', 'Přírodní zajímavosti', 'Místní historie', 'Architektura'],
          image: '/trips/naucna-stezka.jpg',
        },
        {
          name: 'Rozhledna Na Skále',
          description: 'Historická rozhledna s nádherným výhledem na okolní krajinu. Z vrcholu vidíte rybník Dožín, lesní krajinu Brd a okolní vesnice. Ideální pro fotografy a milovníky přírody.',
          location: 'Železný Újezd (3 km)',
          difficulty: 'easy',
          duration: '2 hodiny',
          highlights: ['Panoramatický výhled', 'Rybník Dožín', 'Historická stavba', 'Lesní stezky'],
          image: '/trips/rozhledna-na-skale.jpg',
        },
      ];

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
      }
    }

    initialized = true;
  } finally {
    client.release();
  }
}

export async function addReservation(
  reservation: Omit<Reservation, 'id' | 'createdAt'>
): Promise<Reservation> {
  await initializeDatabase();
  const id = `res_${Date.now()}`;
  const createdAt = new Date().toISOString();

  await pool.query(`
    INSERT INTO reservations (
      id, "guestName", "guestEmail", "guestPhone", "checkInDate", "checkOutDate",
      "numberOfGuests", "totalPrice", status, "createdAt"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `, [
    id,
    reservation.guestName,
    reservation.guestEmail,
    reservation.guestPhone,
    reservation.checkInDate,
    reservation.checkOutDate,
    reservation.numberOfGuests,
    reservation.totalPrice,
    reservation.status || 'pending',
    createdAt,
  ]);

  return {
    ...reservation,
    id,
    createdAt,
  } as Reservation;
}

export async function getReservations(): Promise<Reservation[]> {
  await initializeDatabase();
  const result = await pool.query(
    'SELECT * FROM reservations ORDER BY "createdAt" DESC'
  );

  return result.rows.map((row) => ({
    ...row,
    createdAt: row.createdAt,
  }));
}

export async function getReservation(id: string): Promise<Reservation | null> {
  await initializeDatabase();
  const result = await pool.query(
    'SELECT * FROM reservations WHERE id = $1',
    [id]
  );

  return result.rows[0] || null;
}

export async function updateReservation(
  id: string,
  updates: Partial<Reservation>
): Promise<Reservation> {
  await initializeDatabase();
  const current = await getReservation(id);

  if (!current) {
    throw new Error('Reservation not found');
  }

  const updated = { ...current, ...updates };

  await pool.query(`
    UPDATE reservations SET
      "guestName" = $1,
      "guestEmail" = $2,
      "guestPhone" = $3,
      "checkInDate" = $4,
      "checkOutDate" = $5,
      "numberOfGuests" = $6,
      "totalPrice" = $7,
      status = $8
    WHERE id = $9
  `, [
    updated.guestName,
    updated.guestEmail,
    updated.guestPhone,
    updated.checkInDate,
    updated.checkOutDate,
    updated.numberOfGuests,
    updated.totalPrice,
    updated.status,
    id,
  ]);

  return updated;
}

export async function getCottageInfo(): Promise<CottageInfo> {
  await initializeDatabase();
  const result = await pool.query(
    'SELECT * FROM cottage_info WHERE id = $1 LIMIT 1',
    ['default']
  );

  if (result.rows.length === 0) {
    throw new Error('Cottage info not found');
  }

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    capacity: row.capacity,
    pricePerNight: Number(row.pricePerNight),
    amenities: row.amenities,
    images: row.images,
  };
}

export async function updateCottageInfo(
  updates: Partial<CottageInfo>
): Promise<CottageInfo> {
  await initializeDatabase();
  const current = await getCottageInfo();
  const updated = { ...current, ...updates };

  await pool.query(`
    UPDATE cottage_info SET
      name = $1,
      description = $2,
      capacity = $3,
      "pricePerNight" = $4,
      amenities = $5,
      images = $6
    WHERE id = $7
  `, [
    updated.name,
    updated.description,
    updated.capacity,
    updated.pricePerNight,
    JSON.stringify(updated.amenities),
    JSON.stringify(updated.images),
    'default',
  ]);

  return updated;
}

export async function getTrips(): Promise<Trip[]> {
  await initializeDatabase();
  const result = await pool.query(
    'SELECT * FROM trips ORDER BY "createdAt" DESC'
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    location: row.location,
    difficulty: row.difficulty,
    duration: row.duration,
    highlights: row.highlights,
    image: row.image,
    url: row.url,
  }));
}

export async function addTrip(
  trip: Omit<Trip, 'id'>
): Promise<Trip> {
  await initializeDatabase();
  const id = `trip_${Date.now()}`;

  await pool.query(`
    INSERT INTO trips (id, name, description, location, difficulty, duration, highlights, image)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [
    id,
    trip.name,
    trip.description,
    trip.location,
    trip.difficulty,
    trip.duration,
    JSON.stringify(trip.highlights),
    trip.image,
  ]);

  return { ...trip, id };
}

export async function getAvailability(
  startDate: string,
  endDate: string
): Promise<boolean> {
  await initializeDatabase();
  const result = await pool.query(`
    SELECT COUNT(*) as count FROM reservations
    WHERE status != 'cancelled'
    AND "checkInDate" < $1
    AND "checkOutDate" > $2
  `, [endDate, startDate]);

  return parseInt(result.rows[0].count, 10) === 0;
}

export async function closeDatabase() {
  await pool.end();
}
