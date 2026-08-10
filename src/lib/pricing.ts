// Pricing logic for cottage reservations
// Seasons:
// - Summer (1.7 - 31.8): 13,500 CZK per week (SATURDAY to SATURDAY ONLY)
// - Off-season (1.9 - 30.6): 11,500 CZK per week / 7,500 CZK minimum (weekend)
// - New Year's Eve (31.12 - 1.1): 18,000 CZK
// - Easter: 15,000 CZK per 4 nights

export interface PricingResult {
  pricePerNight: number;
  totalPrice: number;
  nights: number;
  season: string;
  breakdown: string;
  error?: string;
}

function isInSummer(date: Date): boolean {
  const month = date.getMonth() + 1;
  return month === 7 || month === 8;
}

function isSaturday(date: Date): boolean {
  return date.getDay() === 6;
}

function isNewYearsEve(checkIn: Date, checkOut: Date): boolean {
  const checkInMonth = checkIn.getMonth() + 1;
  const checkInDay = checkIn.getDate();
  const checkOutMonth = checkOut.getMonth() + 1;
  const checkOutDay = checkOut.getDate();

  if ((checkInMonth === 12 && checkInDay >= 28) ||
      (checkOutMonth === 1 && checkOutDay <= 3)) {
    return true;
  }
  return false;
}

function isEaster(checkIn: Date, checkOut: Date): boolean {
  const year = checkIn.getFullYear();

  const easterDates: { [key: number]: { month: number; day: number } } = {
    2025: { month: 4, day: 20 },
    2026: { month: 4, day: 5 },
    2027: { month: 3, day: 28 },
    2028: { month: 4, day: 9 },
  };

  const easter = easterDates[year];
  if (!easter) return false;

  const easterDate = new Date(year, easter.month - 1, easter.day);
  const easterStart = new Date(easterDate);
  easterStart.setDate(easterStart.getDate() - 1);
  const easterEnd = new Date(easterDate);
  easterEnd.setDate(easterEnd.getDate() + 2);

  return checkIn <= easterEnd && checkOut >= easterStart;
}

export function calculateReservationPrice(checkInStr: string, checkOutStr: string): PricingResult {
  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);

  // Validation: checkout must be after check-in
  if (checkOut <= checkIn) {
    return {
      pricePerNight: 0,
      totalPrice: 0,
      nights: 0,
      season: 'Chyba',
      breakdown: '',
      error: 'Datum odjezdu musí být po datu příjezdu',
    };
  }

  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  // Check for special periods first
  if (isNewYearsEve(checkIn, checkOut)) {
    return {
      pricePerNight: 18000 / nights,
      totalPrice: 18000,
      nights,
      season: 'Silvestr',
      breakdown: '18 000 Kč (Silvestr)',
    };
  }

  if (isEaster(checkIn, checkOut)) {
    const totalPrice = Math.round((nights / 4) * 15000);
    return {
      pricePerNight: totalPrice / nights,
      totalPrice,
      nights,
      season: 'Velikonoce',
      breakdown: `15 000 Kč za 4 noci (${nights} nocí)`,
    };
  }

  // Regular season pricing
  if (isInSummer(checkIn)) {
    // Summer: ONLY Saturday to Saturday (7-day weeks)
    if (!isSaturday(checkIn)) {
      return {
        pricePerNight: 0,
        totalPrice: 0,
        nights,
        season: 'Letní sezóna',
        breakdown: '',
        error: 'V letní sezóně je vyžadován pobyt od soboty do soboty',
      };
    }

    if (nights % 7 !== 0) {
      return {
        pricePerNight: 0,
        totalPrice: 0,
        nights,
        season: 'Letní sezóna',
        breakdown: '',
        error: 'V letní sezóně je vyžadován pobyt v celých týdnech (7, 14, 21 nocí)',
      };
    }

    const weeks = nights / 7;
    const totalPrice = Math.round(weeks * 13500);
    return {
      pricePerNight: totalPrice / nights,
      totalPrice,
      nights,
      season: 'Letní sezóna',
      breakdown: `13 500 Kč za týden (${weeks.toFixed(1)} týdne)`,
    };
  }

  // Off-season: flexible days with minimum 7,500 CZK for any night
  if (nights >= 7) {
    const weeks = nights / 7;
    const totalPrice = Math.round(weeks * 11500);
    return {
      pricePerNight: totalPrice / nights,
      totalPrice,
      nights,
      season: 'Mimo sezónu (týden)',
      breakdown: `11 500 Kč za týden (${weeks.toFixed(1)} týdne)`,
    };
  }

  // Off-season: less than 7 nights = minimum weekend price
  return {
    pricePerNight: 7500 / nights,
    totalPrice: 7500,
    nights,
    season: 'Mimo sezónu (víkend)',
    breakdown: '7 500 Kč za víkend (minimální cena)',
  };
}
