import Link from 'next/link';
import Image from 'next/image';
import { getCottageInfo } from '@/lib/db';
import Map from '@/components/Map';

export default async function AboutPage() {
  const cottage = await getCottageInfo();

  return (
    <main className="min-h-screen bg-white">


      {/* Hero Section */}
      <section className="relative h-40 w-full bg-blue-600 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            {cottage.name}
          </h1>
          <p className="mt-2 text-sm md:text-lg text-white">
            Pohodlná chalupa v klidné vesnici Železný Újezd v srdci Plzeňského kraje
          </p>
        </div>
      </section>

      {/* Photo */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-xl">
          <Image
            src={cottage.images[0]}
            alt={cottage.name}
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-6">O našem objektu</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Naše krásná chalupa se nachází v malebné vesnici Železný Újezd v okresu Plzeň-jih,
                obklopená přírodou Švihovské vrchoviny (Brdy). Ideální destinace pro ty, kteří hledají útěk
                z hluku a spěchu městského života a chtějí se ponořit do krásy neporušené přírody.
              </p>
              <p>
                Chalupa nabízí dokonalý základ pro objevování místních atrakcí jako jsou rozhledna Na Skále,
                naučná stezka, rybník Dožín a okolní lesní stezky. Prostory jsou vybaveny veškerým nezbytným
                komfortem pro příjemný pobyt moderní doby, aniž byste museli vzdát se ničeho důležitého.
              </p>
              <p>
                Ať už se jedná o rodinnou dovolenou, skupinový výlet s přáteli nebo tiché posezení v přírodě,
                naše chalupa v Železném Újezdě je ideální volbou. Blízkost k Brdám a mnohem užšímu kontaktu
                s přírodou vás bezpochyby příjemně překvapí.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Parametry objektu</h2>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-semibold">Kapacita:</span>
                <span className="text-lg">{cottage.capacity} osob</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-semibold">Týden So - So:</span>
                <span className="text-lg">12 000 Kč</span>
              </div>
              <div className="border-b pb-3">
                <span className="font-semibold">Vybavení:</span>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {cottage.amenities.map((amenity, i) => (
                    <li key={i} className="text-gray-700">
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Dostupné vybavení</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cottage.amenities.map((amenity, i) => (
              <div key={i} className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-3xl mb-2">✓</div>
                <p className="font-semibold text-gray-800">{amenity}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Poloha chalupy</h2>
          <p className="text-center text-gray-600 mb-6 max-w-2xl mx-auto">
            Chalupa Brdy se nachází v malebné vesnici Železný Újezd v kraji Plzeň-jih, 
            ideálně umístěná pro turistiku a poznávání přírodních atraktivit Brd.
          </p>
          <Map />
        </div>

        {/* Booking CTA */}
        <div className="bg-blue-50 p-12 rounded-lg text-center">
          <h3 className="text-2xl font-bold mb-4">Připraveni si zarezervovat pobyt?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Vyberte si požadovaný termín a počet hostů a zarezervujte si svůj pobyt v naší krásné chalupě.
          </p>
          <Link
            href="/reservations"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Zarezervovat nyní
          </Link>
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
