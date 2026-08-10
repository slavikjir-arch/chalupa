# Chatbot Instructions - Chalupa Rental Web Application

Tento projekt je moderní Next.js webová aplikace pro pronájem chalupy s kompletním rezervačním systémem.

## Architektura projektu

### Frontend
- **Framework**: Next.js 16 s App Router
- **Styling**: Tailwind CSS
- **Typování**: TypeScript
- **Komponenty**: React komponenty s server-side funkcionalitou

### Backend
- **API**: Next.js API Routes
- **Databáze**: SQLite (better-sqlite3)
- **E-mail**: Nodemailer

## Struktura adresářů

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Domovská stránka
│   ├── about/               # Info o chalupě
│   ├── trips/               # Výlety
│   ├── reservations/        # Rezervační formulář
│   ├── admin/               # Admin panel
│   ├── api/reservations/    # API endpoints
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── db.ts               # SQLite databáze
│   ├── types.ts            # Datové typy
│   └── email.ts            # Email konfigurace
├── components/             # React komponenty
└── public/                 # Statické soubory
```

## Key Funkcionalita

### 1. Rezervační systém
- POST `/api/reservations` - vytvoření nové rezervace
- GET `/api/reservations` - seznam všech rezervací
- PATCH `/api/reservations/[id]` - update rezervace
- Automatické ověřování dostupnosti
- E-mail notifikace

### 2. Administrační panel
- Přihlášení (heslo: `admin123`)
- Přehled všech rezervací
- Změna statusu (pending/confirmed/cancelled)
- Statistiky

### 3. Veřejné stránky
- Domovská stránka s CTA
- Info o chalupě a vybavení
- Nabídka výletů
- Rezervační formulář

## Datové modely

### Reservation
```typescript
{
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}
```

### CottageInfo
```typescript
{
  id: string;
  name: string;
  description: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
}
```

## Databázová schéma

### Tabulky
- `cottage_info` - informace o chalupě
- `reservations` - rezervace
- `trips` - dostupné výlety
- `availability` - dostupnost dat
- `admin_users` - administrátoři

## Odporučené úpravy

Pro produkční nasazení:
1. Změňte admin heslo v `src/app/admin/page.tsx`
2. Nastavte EMAIL_* proměnné v `.env.local`
3. Implementujte autentifikaci (OAuth, JWT)
4. Přidejte validaci formulářů
5. Implementujte platební gateway

## Běžné úkoly

### Přidání nového výletu
- Upravit data v `src/app/trips/page.tsx` (defaultTrips)
- Nebo přidať API endpoint pro správu výletů

### Změna ceny chalupy
- Admin panel > edit cottage info
- Nebo přímá úprava databáze v `src/lib/db.ts`

### Přidání nového obsahu
- Vytvořit nový adresář v `src/app/`
- Přidat `page.tsx` s React komponentou
- Next.js automaticky vytvoří routu

## Prostředí

### .env.local
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=info@chalupa.cz
ADMIN_EMAIL=admin@chalupa.cz
```

## Spuštění

```bash
npm install
npm run dev
# http://localhost:3000
```

## Poznámky pro přispěvatele

- Všechny komponenty používají TypeScript
- Tailwind CSS pro styling (bez custom CSS)
- Databázové operace v `src/lib/db.ts`
- API v Next.js Route Handlers
