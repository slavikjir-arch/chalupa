import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import {
  addReservation,
  getReservations,
  getReservation,
  updateReservation,
  getAvailability,
  getCottageInfo,
} from '@/lib/db';
import { Reservation } from '@/lib/types';

// Vytvoření emailového transportu
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// E-mail funkce
async function sendReservationConfirmation(guestName: string, guestEmail: string, checkInDate: string, checkOutDate: string, numberOfGuests: number, totalPrice: number, reservationId: string) {
  try {
    const checkInFormatted = new Date(checkInDate).toLocaleDateString('cs-CZ');
    const checkOutFormatted = new Date(checkOutDate).toLocaleDateString('cs-CZ');
    const nights = Math.ceil(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h2>Potvrzení rezervace - Chalupa Jasmína</h2>
          <p>Dobrý den ${guestName},</p>
          <p>Děkujeme za vaši rezervaci! Zde jsou detaily vaší rezervace:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Číslo rezervace:</strong> ${reservationId}</p>
            <p><strong>Příjezd:</strong> ${checkInFormatted}</p>
            <p><strong>Odjezd:</strong> ${checkOutFormatted}</p>
            <p><strong>Počet nocí:</strong> ${nights}</p>
            <p><strong>Počet hostů:</strong> ${numberOfGuests}</p>
            <p><strong>Celková cena:</strong> ${totalPrice.toLocaleString('cs-CZ')} Kč</p>
          </div>
          <p>Těšíme se na vaši návštěvu!</p>
          <p>S pozdravem,<br/>Chalupa Jasmína</p>
        </body>
      </html>
    `;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'info@chalupa.cz',
        to: guestEmail,
        subject: `Potvrzení rezervace - Chalupa Jasmína (${reservationId})`,
        html: htmlContent,
      });
      console.log(`Potvrzovací email poslán na ${guestEmail}`);
    } else {
      console.log(`[SIMULACE] Potvrzovací email by byl poslán na ${guestEmail}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Chyba při odesílání emailu:', error);
    return { success: false };
  }
}

async function sendAdminNotification(guestName: string, guestEmail: string, checkInDate: string, checkOutDate: string, numberOfGuests: number, totalPrice: number, reservationId: string) {
  try {
    const checkInFormatted = new Date(checkInDate).toLocaleDateString('cs-CZ');
    const checkOutFormatted = new Date(checkOutDate).toLocaleDateString('cs-CZ');

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h2>Nová rezervace - Chalupa Jasmína</h2>
          <p>Byla vytvořena nová rezervace:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Číslo rezervace:</strong> ${reservationId}</p>
            <p><strong>Jméno hosta:</strong> ${guestName}</p>
            <p><strong>Email hosta:</strong> ${guestEmail}</p>
            <p><strong>Příjezd:</strong> ${checkInFormatted}</p>
            <p><strong>Odjezd:</strong> ${checkOutFormatted}</p>
            <p><strong>Počet hostů:</strong> ${numberOfGuests}</p>
            <p><strong>Cena:</strong> ${totalPrice.toLocaleString('cs-CZ')} Kč</p>
          </div>
          <p><a href="https://yoursite.com/admin">Jít do administrace</a></p>
        </body>
      </html>
    `;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.ADMIN_EMAIL) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'info@chalupa.cz',
        to: process.env.ADMIN_EMAIL,
        subject: `Nová rezervace - ${guestName}`,
        html: htmlContent,
      });
      console.log(`Notifikace administrátorovi poslána`);
    } else {
      console.log(`[SIMULACE] Notifikace administrátorovi by byla poslána`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Chyba při odesílání emailu:', error);
    return { success: false };
  }
}

export async function GET(request: NextRequest) {
  try {
    const reservations = await getReservations();
    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Chyba při načítání rezervací:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání rezervací' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validace vstupních dat
    const { guestName, guestEmail, guestPhone, checkInDate, checkOutDate, numberOfGuests } = body;

    if (!guestName || !guestEmail || !checkInDate || !checkOutDate || !numberOfGuests) {
      return NextResponse.json(
        { error: 'Chybí povinná pole' },
        { status: 400 }
      );
    }

    // Ověření dostupnosti
    const isAvailable = await getAvailability(checkInDate, checkOutDate);
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Vybrané období není dostupné' },
        { status: 400 }
      );
    }

    // Výpočet ceny
    const cottage = await getCottageInfo();
    const nights = Math.ceil(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const totalPrice = cottage.pricePerNight * nights;

    // Vytvoření rezervace
    const reservation = await addReservation({
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      numberOfGuests: parseInt(numberOfGuests, 10),
      totalPrice,
      status: 'pending',
    });

    // Odeslání potvrzovacího emailu
    await sendReservationConfirmation(
      guestName,
      guestEmail,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalPrice,
      reservation.id
    );

    // Odeslání notifikace administrátorovi
    await sendAdminNotification(
      guestName,
      guestEmail,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalPrice,
      reservation.id
    );

    return NextResponse.json(
      { success: true, reservationId: reservation.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Chyba při vytváření rezervace:', error);
    return NextResponse.json(
      { error: 'Chyba při vytváření rezervace' },
      { status: 500 }
    );
  }
}
