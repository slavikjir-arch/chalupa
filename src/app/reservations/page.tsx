'use client';

import { useState, useEffect } from 'react';
import { Reservation } from '@/lib/types';
import { calculateReservationPrice } from '@/lib/pricing';
import Calendar from '@/components/Calendar';

interface FormData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: string;
  notes: string;
  hasPet: boolean;
  petBreed: string;
}

export default function ReservationsPage() {
  const [formData, setFormData] = useState<FormData>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: '1',
    notes: '',
    hasPet: false,
    petBreed: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());

  // Načtení rezervací při mountu
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('/api/reservations');
        const data = await response.json();

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

    fetchReservations();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const pricing = calculateReservationPrice(formData.checkInDate, formData.checkOutDate);

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalPrice: pricing.totalPrice,
        }),
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
          notes: '',
          hasPet: false,
          petBreed: '',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Chyba při odeslání formuláře' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const { name } = target;
    let value: string | boolean;

    if ('checked' in target) {
      value = target.checked;
    } else {
      value = target.value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const getPricing = () => {
    if (!formData.checkInDate || !formData.checkOutDate) {
      return null;
    }
    return calculateReservationPrice(formData.checkInDate, formData.checkOutDate);
  };

  const computeNights = () => {
    const pricing = getPricing();
    return pricing?.nights || 0;
  };

  const computeTotal = () => {
    const pricing = getPricing();
    return pricing?.totalPrice || 0;
  };

  const formatPrice = (num: number) => {
    return num.toLocaleString('cs-CZ', { maximumFractionDigits: 0 });
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
            onCheckInChange={(date) => setFormData(prev => ({ ...prev, checkInDate: date }))}
            onCheckOutChange={(date) => setFormData(prev => ({ ...prev, checkOutDate: date }))}
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
                {formData.checkInDate && formData.checkOutDate && getPricing() && (
                  <div className="mt-4 space-y-2 border-t border-blue-200 pt-2">
                    {getPricing()?.error ? (
                      <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm">
                        ⚠️ {getPricing()?.error}
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">
                          Počet nocí: <span className="font-semibold text-gray-900">{computeNights()}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Sezóna: <span className="font-semibold text-gray-900">{getPricing()?.season}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          {getPricing()?.breakdown}
                        </p>
                        <p className="text-lg font-bold text-blue-600 mt-2">
                          Cena celkem: {formatPrice(computeTotal())} Kč
                        </p>
                        <p className="text-xs text-gray-500 italic">
                          *K ceně se přičítá cena za spotřebované energie
                        </p>
                      </>
                    )}
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

            {/* Pet */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Domácí zvíře</h3>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasPet"
                    checked={formData.hasPet}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Přivezu si domácí zvíře (poplatek 550 Kč)
                  </span>
                </label>
              </div>

              {formData.hasPet && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rasa zvířete
                  </label>
                  <input
                    type="text"
                    name="petBreed"
                    value={formData.petBreed}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Např. Německý ovčák"
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Poznámka</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poznámka k rezervaci
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Vaše poznámka (volitelné)"
                  rows={4}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.checkInDate || !formData.checkOutDate || !!getPricing()?.error}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Odesílání...'
                : !formData.checkInDate || !formData.checkOutDate
                  ? 'Vyberte datum v kalendáři'
                  : getPricing()?.error
                    ? 'Opravte chybu výběru data'
                    : 'Zarezervovat'}
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
