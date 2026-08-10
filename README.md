# Chalupa na pronájem - webová aplikace

> **Repository:** buď vytvoř nový repozitář na GitHubu (např. `chalupa`) a poté přidej vzdálený origin:
> 
> ```bash
> git remote add origin https://github.com/TVE_UZIVATELSKE_JMENO/chalupa.git
> git branch -M main
> git push -u origin main
> ```
> 
> Po nahrání repo můžeš použít Vercel (nebo jinou platformu) pro automatický deploy.


## Popis projektu

Moderní webová aplikace pro pronájem chalupy v Krkonoších s následujícími funkcemi:

- **Domovská stránka** - úvodní stránka s informacemi o chalupě
- **O chalupě** - detailní informace o objektu, kapacita, vybavení a ceny
- **Výlety** - seznam nanabízených výletů v okolí
- **Rezervační systém** - online formulář pro rezervaci pobytu
- **Administrační panel** - správa rezervací a jejich statusu

## Technologický stack

- **Frontend**: [Next.js 16](https://nextjs.org/) s [React 19](https://react.dev/) a [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: Next.js API Routes
- **Databáze**: SQLite s [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **E-mail**: [Nodemailer](https://nodemailer.com/) pro odesílání potvrzovacích zpráv

## Instalace a spuštění

### Předpoklady

- Node.js 20.10+
- npm či yarn

### Instalace

```bash
# Instalace závislostí
npm install

# Spuštění vývojového serveru
npm run dev
```

Server bude dostupný na [http://localhost:3000](http://localhost:3000)

## Struktura projektu

```
src/
├── app/
│   ├── page.tsx              # Domovská stránka
│   ├── about/                # Informace o chalupě
│   ├── trips/                # Informace o výletech
│   ├── reservations/         # Rezervační formulář
│   ├── admin/                # Administrační panel
│   ├── api/
│   │   └── reservations/     # API endpoints pro rezervace
│   ├── layout.tsx            # Hlavní layout
│   └── globals.css           # Globální styly
├── lib/
│   ├── db.ts                 # Databázové funkce
│   ├── types.ts              # TypeScript typy
│   └── email.ts              # E-mailové šablony
├── components/               # React komponenty
└── public/                   # Statické soubory
```

## Konfigurace

### E-mail nastavení

Pro odesílání potvrzovacích emailů je potřeba nastavit proměnné prostředí:

```bash
# .env.local
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=info@chalupa.cz
ADMIN_EMAIL=admin@chalupa.cz
```

> **Poznámka**: Použijte [Google App Password](https://support.google.com/accounts/answer/185833) místo běžného hesla.

### Admin heslo

Nezapomeňte změnit výchozí admin heslo v [src/app/admin/page.tsx](src/app/admin/page.tsx):
- **Výchozí heslo**: `admin123`
- **Změňte**: `if (password === 'admin123')`

## API Endpoints

### Rezervace

**GET** `/api/reservations`
- Získá seznam všech rezervací

**POST** `/api/reservations`
- Vytvoří novou rezervaci
- Tělo požadavku:
```json
{
  "guestName": "Jméno",
  "guestEmail": "email@example.com",
  "guestPhone": "+420 123 456 789",
  "checkInDate": "2026-04-01",
  "checkOutDate": "2026-04-07",
  "numberOfGuests": 4
}
```

**GET** `/api/reservations/[id]`
- Získá detaily konkrétní rezervace

**PATCH** `/api/reservations/[id]`
- Aktualizuje rezervaci (status, informace o hostovi)

## Funkcionalita

### Rezervační systém
- ✅ Výběr data příjezdu a odjezdu
- ✅ Ověření dostupnosti
- ✅ Výpočet ceny na základě počtu nocí
- ✅ Odesílání potvrzovacího emailu
- ✅ Notifikace administrátorovi

### Administrační panel
- ✅ Přihlášení s heslem (výchozí: `admin123`)
- ✅ Přehled všech rezervací
- ✅ Statistiky (celkem, potvrzeno, čekající)
- ✅ Detail rezervace
- ✅ Změna statusu (potvrzeno, čekající, zrušeno)

## Bezpečnost

> ⚠️ **Upozornění**: Toto je vývojová aplikace. Pro produkci je potřeba:
> - Schránit admin přístup (OAuth, sesční tokeny)
> - Zašifrovat hesla
> - Přidat validaci a rate limiting
> - Implementovat HTTPS
> - Použít environment variables pro citlivé údaje

## Budoucí rozšíření

- [ ] Fotografie chalupy (galerie)
- [ ] Kalkulátor ceny v reálném čase
- [ ] Integraci s prostředky platby (Stripe, PayPal)
- [ ] Potvrzování emailem
- [ ] Upozornění o zrušení/změně
- [ ] Recenze a hodnocení
- [ ] Integraci s Google Calendar
- [ ] Mobilní aplikace

## Řešení problémů

### Databáze se nenačítá
- Ujistěte se, že máte přístup k vytváření souborů v adresáři `data/`
- Smažte soubor `data/chalupa.db` a server ho znovu vytvoří

### Emaily se neposílají
- Ověřte nastavení `EMAIL_USER` a `EMAIL_PASSWORD`
- Zkontrolujte, že jste povolili méně bezpečné aplikace v Google účtu
- Zkontrolujte log chyb v konzoli serveru

## Licence

MIT

## Kontakt

info@chalupa.cz
