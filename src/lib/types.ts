export interface CottageInfo {
  id: string;
  name: string;
  description: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  location: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  highlights: string[];
  image: string;
  url?: string;
}

export interface Reservation {
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

export interface Availability {
  date: string;
  available: boolean;
}
