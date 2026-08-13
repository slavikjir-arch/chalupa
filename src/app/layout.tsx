import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chalupa Brdy - pronájem chalupy",
  description: "Pronájem malebné chalupy Brdy v Železném Újezdě s rezervačním systémem a informacemi o výletech",
  verification: {
    google: "9XjHKlqxnsloWykI2napQTn3_rtJh6bmnqr7OV3VM34",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* navigation moved to layout so all pages share it */}
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <a href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
              Chalupa Brdy
            </a>
            <div className="flex gap-8">
              <a href="/about" className="text-gray-700 hover:text-blue-600 relative group nav-link">
                O chalupě
              </a>
              <a href="/trips" className="text-gray-700 hover:text-blue-600 relative group nav-link">
                Výlety
              </a>
              <a href="/gallery" className="text-gray-700 hover:text-blue-600 relative group nav-link">
                Fotogalerie
              </a>
              <a href="/reservations" className="text-gray-700 hover:text-blue-600 relative group nav-link">
                Rezervace
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
