'use client';

import Link from 'next/link';
import { FormEvent, useState, useEffect } from 'react';
import { Reservation } from '@/lib/types';
import Calendar from '@/components/Calendar';

interface FormData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: string;
}

export default function ReservationsPage() {
  const [formData, setFormData] = useState<FormData>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: '1',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [pricePerNight, setPricePerNight] = useState<number>(0);

  // Načtení rezervací a ceny při mountu
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('/api/reservations');
        const data = await response.json();
        setReservations(data);
        
        // Vytvoření sady obsazených dat
        const booked = new Set<string>();
        data.forEach((res: Reservation) => {
          if (res.status !== 'cancelled') {
            const start = new Date(res.checkInDate);
            const end = new Date(res.checkOutDate);
            for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
              booked.add(d.toISOString().split('T')[0]);
            }
          }
        });
        setBookedDates(booked);
      } catch (error) {
        console.error('Chyba při načítání rezervací:', error);
      }
    };

    const fetchPrice = async () => {
      try {
        const res = await fetch('/api/cottage');
        const data = await res.json();
        setPricePerNight(data.pricePerNight || 0);
      } catch (e) {
        console.error('Chyba při načítání ceny:', e);
      }
    };

    fetchReservations();
    fetchPrice();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Chyba při vytváření rezervace' });
      } else {
        setMessage({
          type: 'success',
          text: `Rezervace byla úspěšně vytvořena! ID: ${data.reservationId}`,
        });
        setFormData({
          guestName: '',
          guestEmail: '',
          guestPhone: '',
          checkInDate: '',
          checkOutDate: '',
          numberOfGuests: '1',
        });
        // Obnova rezervací
        const resResponse = await fetch('/api/reservations');
        const resData = await resResponse.json();
        setReservations(resData);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Chyba při odeslání formuláře' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getMinCheckOutDate = () => {
    if (!formData.checkInDate) return '';
    const date = new Date(formData.checkInDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const computeNights = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    const start = new Date(formData.checkInDate);
    const end = new Date(formData.checkOutDate);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  };

  const computeTotal = () => {
    return computeNights() * pricePerNight;
  };

  const formatPrice = (num: number) => {
    return num.toLocaleString('cs-CZ', { maximumFractionDigits: 0 });
  };
  const isDateBooked = (dateString: string): boolean => {
    return bookedDates.has(dateString);
  };

  const checkDateRangeConflict = (): boolean => {
    if (!formData.checkInDate || !formData.checkOutDate) return false;
    const start = new Date(formData.checkInDate);
    const end = new Date(formData.checkOutDate);
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      if (bookedDates.has(d.toISOString().split('T')[0])) {
        return true;
      }
    }
    return false;
  };

  return (
    <main className="min-h-screen bg-white">


      {/* Header */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Zarezervovat pobyt</h1>
          <p className="text-xl">Vyplňte formulář a zarezervujte si své datum</p>
        </div>
      </section>

      {/* Reservation Form */}
      <section className="max-w-2xl mx-auto px-4 py-20">
        {/* Calendar */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">📅 Vyberte datum pobytu</h3>
          <Calendar
            bookedDates={bookedDates}
            onCheckInChange={(date) => setFormData({ ...formData, checkInDate: date })}
            onCheckOutChange={(date) => setFormData({ ...formData, checkOutDate: date })}
            checkInDate={formData.checkInDate}
            checkOutDate={formData.checkOutDate}
          />
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-50 p-8 rounded-lg shadow-md">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            {/* Guest Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Vaše údaje</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jméno *
                </label>
                <input
                  type="text"
                  name="guestName"
                  value={formData.guestName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Vaše jméno a příjmení"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="guestEmail"
                  value={formData.guestEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="vase.email@priklad.cz"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  name="guestPhone"
                  value={formData.guestPhone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+420 123 456 789"
                />
              </div>
            </div>

            {/* Reservation Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Detaily rezervace</h3>

              {/* Selected Dates Display */}
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Příjezd:</p>
                    <p className="font-semibold text-gray-900">
                      {formData.checkInDate
                        ? new Date(formData.checkInDate).toLocaleDateString('cs-CZ')
                        : '—'}
                    </p>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div>
                    <p className="text-sm text-gray-600">Odjezd:</p>
                    <p className="font-semibold text-gray-900">
                      {formData.checkOutDate
                        ? new Date(formData.checkOutDate).toLocaleDateString('cs-CZ')
                        : '—'}
                    </p>
                  </div>
                </div>
                {formData.checkInDate && formData.checkOutDate && (
                  <div className="mt-2 text-right">
                    <p className="text-sm text-gray-600">
                      Počet nocí: {computeNights()}
                    </p>
                    <p className="font-semibold text-gray-900">
                      Cena celkem: {formatPrice(computeTotal())} Kč
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Počet hostů *
                </label>
                <select
                  name="numberOfGuests"
                  value={formData.numberOfGuests}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'host' : 'hostů'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.checkInDate || !formData.checkOutDate}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Odesílání...' : !formData.checkInDate || !formData.checkOutDate ? 'Vyberte datum v kalendáři' : 'Zarezervovat'}
            </button>

            <p className="text-sm text-gray-600 text-center">
              * Povinná pole
            </p>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Co se stane po odeslání?</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Dostanete potvrzovací email s detaily vaší rezervace</li>
            <li>✓ Administrátor si prověří dostupnost a kontaktuje vás</li>
            <li>✓ Obdržíte instrukce pro check-in a instrukce pro vstup</li>
            <li>✓ Budete moct zrušit nebo změnit rezervaci do 7 dnů před příjezdem</li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2026 Chalupa na pronájem. Všechna práva vyhrazena.</p>
        </div>
      </footer>
    </main>
  );
}
