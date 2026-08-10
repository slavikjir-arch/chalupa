import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">


      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          Malebná chalupa v Železném Újezdě
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Pronájmeme si krásnou chalupu v klidné vesnici Železný Újezd s výhledem na přírodní park Brdy. 
          Ideální pro rodinné dovolené, skupinové pobyty i klidný relax v přírodě.
        </p>
        <Link
          href="/reservations"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Zarezervujte si pobyt
        </Link>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Proč si vybrat naši chalupu?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🏠</div>
              <h4 className="text-xl font-semibold mb-2">Prostorný prostor</h4>
              <p className="text-gray-600">Kapacita až 8 osob, dokonalý prostor pro skupiny a rodiny.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🏞️</div>
              <h4 className="text-xl font-semibold mb-2">Přírodní lokalita</h4>
              <p className="text-gray-600">Nádherný výhled na hory a blízkost přírodních atraktů.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">✨</div>
              <h4 className="text-xl font-semibold mb-2">Plná výbava</h4>
              <p className="text-gray-600">WiFi, topení, kuchyň, zahrada - všechno co potřebujete.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Připraveni na dovolenou?</h3>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Podívejte se na naši nabídku výletů v okolí nebo si vyberte termín a zarezervujte si pobyt.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/trips"
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Explore Trips
            </Link>
            <Link
              href="/reservations"
              className="border-2 border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Zarezervovat
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h5 className="font-bold mb-4">Kontakt</h5>
            <p>Email: info@chalupa.cz</p>
            <p>Telefon: +420 123 456 789</p>
            <p className="mt-2 text-sm">Železný Újezd, Plzeň-jih</p>
          </div>
            <div>
              <h5 className="font-bold mb-4">Odkazy</h5>
              <ul>
                <li><Link href="/about" className="hover:text-blue-400">O chalupě</Link></li>
                <li><Link href="/trips" className="hover:text-blue-400">Výlety</Link></li>
                <li><Link href="/reservations" className="hover:text-blue-400">Rezervace</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Sociální sítě</h5>
              <p>Facebook | Instagram | Twitter</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Chalupa na pronájem. Všechna práva vyhrazena.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
