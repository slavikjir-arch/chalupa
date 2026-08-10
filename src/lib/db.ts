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
        'Chalupa Jasmína',
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
      // Oprava starých názvů fotek pokud existují
      await client.query(`
        UPDATE cottage_info
        SET images = $1
        WHERE id = 'default'
          AND images::text LIKE '%20160821%'
      `, [
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
