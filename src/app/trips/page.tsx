import { getTrips } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function TripsPage() {
  const trips = await getTrips();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Lehká';
      case 'medium':
        return 'Střední';
      case 'hard':
        return 'Těžká';
      default:
        return difficulty;
    }
  };

  return (
    <main className="min-h-screen bg-white">


      {/* Header */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-500 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Výlety v okolí</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Objevte krásy přírody s našimi nanabízenými výlety v oblasti Železného Újezda a okolních Brd.
          </p>
        </div>
      </section>

      {/* Trips Grid */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-40 flex items-center justify-center text-white text-4xl overflow-hidden">
                  <img 
                    src={trip.image} 
                    alt={trip.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{trip.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(trip.difficulty)}`}>
                      {getDifficultyLabel(trip.difficulty)}
                    </span>
                  </div>
                  {trip.url && (
                    <a
                      href={trip.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm mb-3 inline-block"
                    >
                      → Více informací
                    </a>
                  )}
                  
                  <p className="text-gray-600 mb-4">{trip.description}</p>
                  
                  <div className="space-y-2 mb-4 text-sm text-gray-700">
                    <div>
                      <span className="font-semibold">Lokalita:</span> {trip.location}
                    </div>
                    <div>
                      <span className="font-semibold">Trvání:</span> {trip.duration}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="font-semibold text-sm mb-2">Hlavní atrakcje:</p>
                    <ul className="space-y-1">
                      {trip.highlights.map((highlight, i) => (
                        <li key={i} className="text-sm text-gray-600">
                          • {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
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
