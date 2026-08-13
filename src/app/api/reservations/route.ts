import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import {
  addReservation,
  getReservations,
  getAvailability,
} from '@/lib/db';
import { calculateReservationPrice } from '@/lib/pricing';

// Vytvoření emailového transportu
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// E-mail funkce
async function sendReservationConfirmation(guestName: string, guestEmail: string, checkInDate: string, checkOutDate: string, numberOfGuests: number, totalPrice: number, reservationId: string, notes?: string, hasPet?: boolean, petBreed?: string) {
  try {
    const checkInFormatted = new Date(checkInDate).toLocaleDateString('cs-CZ');
    const checkOutFormatted = new Date(checkOutDate).toLocaleDateString('cs-CZ');
    const nights = Math.ceil(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const notesSection = notes ? `<p><strong>Vaše poznámka:</strong><br/>${notes}</p>` : '';
    const petSection = hasPet ? `<p><strong>Domácí zvíře:</strong> ${petBreed || 'Ano'} (poplatek 550 Kč)</p>` : '';

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h2>Potvrzení rezervace - Chalupa Brdy</h2>
          <p>Dobrý den ${guestName},</p>
          <p>Děkujeme za vaši rezervaci! Zde jsou detaily vaší rezervace:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Číslo rezervace:</strong> ${reservationId}</p>
            <p><strong>Příjezd:</strong> ${checkInFormatted}</p>
            <p><strong>Odjezd:</strong> ${checkOutFormatted}</p>
            <p><strong>Počet nocí:</strong> ${nights}</p>
            <p><strong>Počet hostů:</strong> ${numberOfGuests}</p>
            <p><strong>Celková cena:</strong> ${totalPrice.toLocaleString('cs-CZ')} Kč</p>
            ${petSection}
            ${notesSection}
          </div>
          <p>Těšíme se na vaši návštěvu!</p>
          <p>S pozdravem,<br/>Chalupa Brdy</p>
        </body>
      </html>
    `;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'info@chalupa.cz',
        to: guestEmail,
        subject: `Potvrzení rezervace - Chalupa Brdy (${reservationId})`,
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

async function sendAdminNotification(guestName: string, guestEmail: string, guestPhone: string, checkInDate: string, checkOutDate: string, numberOfGuests: number, totalPrice: number, reservationId: string, notes?: string, hasPet?: boolean, petBreed?: string) {
  try {
    const checkInFormatted = new Date(checkInDate).toLocaleDateString('cs-CZ');
    const checkOutFormatted = new Date(checkOutDate).toLocaleDateString('cs-CZ');

    const notesSection = notes ? `<p><strong>Poznámka od hosta:</strong><br/>${notes}</p>` : '';
    const petSection = hasPet ? `<p><strong>Domácí zvíře:</strong> ${petBreed || 'Ano'} (poplatek 550 Kč)</p>` : '';

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h2>Nová rezervace - Chalupa Brdy</h2>
          <p>Byla vytvořena nová rezervace:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Číslo rezervace:</strong> ${reservationId}</p>
            <p><strong>Jméno hosta:</strong> ${guestName}</p>
            <p><strong>Email hosta:</strong> ${guestEmail}</p>
            <p><strong>Telefon hosta:</strong> ${guestPhone}</p>
            <p><strong>Příjezd:</strong> ${checkInFormatted}</p>
            <p><strong>Odjezd:</strong> ${checkOutFormatted}</p>
            <p><strong>Počet hostů:</strong> ${numberOfGuests}</p>
            <p><strong>Cena:</strong> ${totalPrice.toLocaleString('cs-CZ')} Kč</p>
            ${petSection}
            ${notesSection}
          </div>
          <p><a href="https://yoursite.com/admin">Jít do administrace</a></p>
        </body>
      </html>
    `;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'info@chalupa.cz',
        to: process.env.EMAIL_USER,
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
    const { guestName, guestEmail, guestPhone, checkInDate, checkOutDate, numberOfGuests, notes, hasPet, petBreed } = body;

    if (!guestName || !guestEmail || !checkInDate || !checkOutDate || !numberOfGuests) {
      return NextResponse.json(
        { error: 'Chybí povinná pole' },
        { status: 400 }
      );
    }

    // Validace emailu
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      return NextResponse.json(
        { error: 'Neplatný email' },
        { status: 400 }
      );
    }

    // Validace telefonu (české číslo +420 nebo bez předvolby)
    const cleanedPhone = guestPhone.replace(/\s/g, '');
    if (!/^(\+420)?[0-9]{9,10}$/.test(cleanedPhone)) {
      return NextResponse.json(
        { error: 'Neplatné telefonní číslo. Vyžaduje se české číslo (9-10 číslic)' },
        { status: 400 }
      );
    }

    // Ověření dostupnosti
    try {
      const isAvailable = await getAvailability(checkInDate, checkOutDate);
      if (!isAvailable) {
        return NextResponse.json(
          { error: 'Vybrané období není dostupné' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error('Chyba databáze při ověření dostupnosti:', dbError);
      return NextResponse.json(
        { error: 'Chyba databáze - zkontroluj server logs' },
        { status: 500 }
      );
    }

    // Výpočet ceny
    const pricing = calculateReservationPrice(checkInDate, checkOutDate);
    if (pricing.error) {
      return NextResponse.json(
        { error: pricing.error },
        { status: 400 }
      );
    }

    let totalPrice = pricing.totalPrice;
    if (hasPet) {
      totalPrice += 550;
    }

    // Vytvoření rezervace
    let reservation;
    try {
      reservation = await addReservation({
        guestName,
        guestEmail,
        guestPhone,
        checkInDate,
        checkOutDate,
        numberOfGuests: parseInt(numberOfGuests, 10),
        totalPrice,
        status: 'pending',
        notes: notes || undefined,
        hasPet: hasPet || false,
        petBreed: petBreed || undefined,
      });
    } catch (dbError) {
      console.error('Chyba databáze při vytváření rezervace:', dbError);
      return NextResponse.json(
        { error: 'Chyba databáze - zkontroluj server logs' },
        { status: 500 }
      );
    }

    // Odeslání potvrzovacího emailu
    try {
      await sendReservationConfirmation(
        guestName,
        guestEmail,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        totalPrice,
        reservation.id,
        notes,
        hasPet,
        petBreed
      );
    } catch (error) {
      console.error('Chyba při odesílání potvrzovacího emailu:', error);
    }

    // Odeslání notifikace administrátorovi
    try {
      await sendAdminNotification(
        guestName,
        guestEmail,
        guestPhone,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        totalPrice,
        reservation.id,
        notes,
        hasPet,
        petBreed
      );
    } catch (error) {
      console.error('Chyba při odesílání notifikace administrátorovi:', error);
    }

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
