'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { Reservation } from '@/lib/types';

export default function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setAuthenticated(true);
        setPassword('');
        loadReservations();
      } else {
        const data = await response.json();
        setLoginError(data.error || 'Přihlášení selhalo');
      }
    } catch (error) {
      setLoginError('Chyba při přihlášení');
      console.error('Login error:', error);
    }
  };

  const loadReservations = async () => {
    try {
      const response = await fetch('/api/reservations');
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error('Chyba při načítání rezervací:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    reservation: Reservation,
    newStatus: 'pending' | 'confirmed' | 'cancelled'
  ) => {
    try {
      const response = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reservation, status: newStatus }),
      });

      if (response.ok) {
        loadReservations();
        setSelectedReservation(null);
        setShowModal(false);
      }
    } catch (error) {
      console.error('Chyba při aktualizaci rezervace:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Potvrzeno';
      case 'pending':
        return 'Čekající';
      case 'cancelled':
        return 'Zrušeno';
      default:
        return status;
    }
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Admin přístup</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-red-100 text-red-800 p-3 rounded-lg">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heslo
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Zadejte heslo"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Přihlásit se
            </button>
          </form>

          <Link href="/" className="block text-center mt-4 text-blue-600 hover:text-blue-700">
            Zpět na domovskou stránku
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">


      {/* Header */}
      <section className="bg-blue-600 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold">Administrační panel</h1>
          <p className="text-blue-100">Správa rezervací chalupy</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center">
            <p>Načítání dat...</p>
          </div>
        ) : (
          <div>
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Celkem rezervací</p>
                <p className="text-3xl font-bold text-blue-600">{reservations.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Potvrzeno</p>
                <p className="text-3xl font-bold text-green-600">
                  {reservations.filter((r) => r.status === 'confirmed').length}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Čekající</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {reservations.filter((r) => r.status === 'pending').length}
                </p>
              </div>
            </div>

            {/* Reservations Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Jméno
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Termín
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Počet hostů
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Cena
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Stav
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Akce
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Žádné rezervace k dispozici
                      </td>
                    </tr>
                  ) : (
                    reservations.map((reservation) => (
                      <tr key={reservation.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {reservation.guestName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {reservation.guestEmail}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(reservation.checkInDate).toLocaleDateString('cs-CZ')} -
                          {new Date(reservation.checkOutDate).toLocaleDateString('cs-CZ')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {reservation.numberOfGuests}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                          {reservation.totalPrice} Kč
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                              reservation.status
                            )}`}
                          >
                            {getStatusLabel(reservation.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Modal */}
      {showModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Podrobnosti rezervace</h2>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-600">Jméno:</p>
                <p className="font-semibold">{selectedReservation.guestName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email:</p>
                <p className="font-semibold">{selectedReservation.guestEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefon:</p>
                <p className="font-semibold">{selectedReservation.guestPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Příjezd - Odjezd:</p>
                <p className="font-semibold">
                  {new Date(selectedReservation.checkInDate).toLocaleDateString('cs-CZ')} -
                  {new Date(selectedReservation.checkOutDate).toLocaleDateString('cs-CZ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Počet hostů:</p>
                <p className="font-semibold">{selectedReservation.numberOfGuests}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cena:</p>
                <p className="font-semibold text-lg text-blue-600">{selectedReservation.totalPrice} Kč</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <label className="block text-sm font-semibold text-gray-900">Změnit stav:</label>
              <div className="space-y-2">
                <button
                  onClick={() =>
                    handleStatusChange(selectedReservation, 'confirmed')
                  }
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                >
                  Potvrdit
                </button>
                <button
                  onClick={() => handleStatusChange(selectedReservation, 'pending')}
                  className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition text-sm font-semibold"
                >
                  Vrátit na čekající
                </button>
                <button
                  onClick={() =>
                    handleStatusChange(selectedReservation, 'cancelled')
                  }
                  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                >
                  Zrušit
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Zavřít
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
