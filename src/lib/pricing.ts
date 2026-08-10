// Pricing logic for cottage reservations
// Seasons:
// - Summer (1.7 - 31.8): 13,500 CZK per week (SO-SO)
// - Off-season (1.9 - 30.6): 11,500 CZK per week / 7,500 CZK per weekend
// - New Year's Eve (31.12 - 1.1): 18,000 CZK
// - Easter: 15,000 CZK per 4 nights

export interface PricingResult {
  pricePerNight: number;
  totalPrice: number;
  nights: number;
  season: string;
  breakdown: string;
}

function isInSummer(date: Date): boolean {
  const month = date.getMonth() + 1; // 0-11 to 1-12
  const day = date.getDate();

  // July 1 - August 31
  if ((month === 7) || (month === 8)) return true;
  return false;
}

function isNewYearsEve(checkIn: Date, checkOut: Date): boolean {
  // Check if the period includes Dec 31 or Jan 1
  const checkInMonth = checkIn.getMonth() + 1;
  const checkInDay = checkIn.getDate();
  const checkOutMonth = checkOut.getMonth() + 1;
  const checkOutDay = checkOut.getDate();

  // If check-in is in December after 28th or check-out is in January before 3rd
  if ((checkInMonth === 12 && checkInDay >= 28) ||
      (checkOutMonth === 1 && checkOutDay <= 3)) {
    return true;
  }
  return false;
}

function isEaster(checkIn: Date, checkOut: Date): boolean {
  // Easter dates (approximate for common years)
  // This is simplified - in production you'd calculate Easter dynamically
  const year = checkIn.getFullYear();

  // Easter 2025: April 20
  // Easter 2026: April 5
  // Easter 2027: March 28
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
  easterStart.setDate(easterStart.getDate() - 1); // Sunday before
  const easterEnd = new Date(easterDate);
  easterEnd.setDate(easterEnd.getDate() + 2); // Tuesday after

  // Check if reservation overlaps with Easter period
  return checkIn <= easterEnd && checkOut >= easterStart;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday or Saturday
}

function countWeekendDays(checkIn: Date, checkOut: Date): number {
  let weekendDays = 0;
  let current = new Date(checkIn);

  while (current < checkOut) {
    if (isWeekend(current)) {
      weekendDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return weekendDays;
}

function countWeekdays(checkIn: Date, checkOut: Date): number {
  const totalDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const weekendDays = countWeekendDays(checkIn, checkOut);
  return totalDays - weekendDays;
}

export function calculateReservationPrice(checkInStr: string, checkOutStr: string): PricingResult {
  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);

  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  // Check for special periods first
  if (isNewYearsEve(checkIn, checkOut)) {
    return {
      pricePerNight: 18000 / nights, // 18,000 CZK for the period
      totalPrice: 18000,
      nights,
      season: 'Silvestr',
      breakdown: '18 000 Kč (Silvestr)',
    };
  }

  if (isEaster(checkIn, checkOut)) {
    // Easter pricing: 15,000 for 4 nights
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
    // Summer: 13,500 CZK per week (SO-SO)
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

  // Off-season
  if (nights >= 7) {
    // Off-season weekly: 11,500 CZK per week
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

  // Off-season weekend (Fri-Sun, typically 2-3 nights)
  if (nights <= 3 && checkIn.getDay() === 4) { // Friday
    return {
      pricePerNight: 7500 / nights,
      totalPrice: 7500,
      nights,
      season: 'Mimo sezónu (víkend)',
      breakdown: '7 500 Kč za víkend',
    };
  }

  // Default: off-season weekly rate
  const weeks = nights / 7;
  const totalPrice = Math.round(weeks * 11500);
  return {
    pricePerNight: totalPrice / nights,
    totalPrice,
    nights,
    season: 'Mimo sezónu',
    breakdown: `11 500 Kč za týden (${weeks.toFixed(1)} týdne)`,
  };
}
