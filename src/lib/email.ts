'use server';

let transporter: any = null;

function getTransporter() {
  if (!transporter) {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password',
      },
    });
  }
  return transporter;
}

export interface ReservationEmailData {
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  reservationId: string;
}

export async function sendReservationConfirmation(
  data: ReservationEmailData
) {
  const { guestName, guestEmail, checkInDate, checkOutDate, numberOfGuests, totalPrice, reservationId } = data;

  const checkInFormatted = new Date(checkInDate).toLocaleDateString('cs-CZ');
  const checkOutFormatted = new Date(checkOutDate).toLocaleDateString('cs-CZ');
  const nights = Math.ceil(
    (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const htmlContent = `
    <h2>Potvrzení rezervace chalupy</h2>
    <p>Vážený ${guestName},</p>
    <p>Děkujeme za vaši rezervaci! Zde jsou detaily vaší rezervace:</p>
    
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
      <p><strong>ID rezervace:</strong> ${reservationId}</p>
      <p><strong>Příjezd:</strong> ${checkInFormatted}</p>
      <p><strong>Odjezd:</strong> ${checkOutFormatted}</p>
      <p><strong>Počet nocí:</strong> ${nights}</p>
      <p><strong>Počet hostů:</strong> ${numberOfGuests}</p>
      <p><strong>Celková cena:</strong> ${totalPrice} Kč</p>
    </div>

    <p>Na vaší e-mailovou adresu vám pošleme další instrukce ohledně přístupu a check-inu do 24 hodin.</p>
    
    <p>Pokud máte nějaké otázky, kontaktujte nás na info@chalupa.cz</p>
    
    <p>Těšíme se na vaši návštěvu!</p>
    <p><strong>Tým chalupy</strong></p>
  `;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'info@chalupa.cz',
      to: guestEmail,
      subject: `Potvrzení rezervace - ${guestName}`,
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error('Chyba při odesílání emailu:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendAdminNotification(
  data: ReservationEmailData
) {
  const { guestName, guestEmail, checkInDate, checkOutDate, numberOfGuests, totalPrice, reservationId } = data;

  const checkInFormatted = new Date(checkInDate).toLocaleDateString('cs-CZ');
  const checkOutFormatted = new Date(checkOutDate).toLocaleDateString('cs-CZ');

  const htmlContent = `
    <h2>Nová rezervace</h2>
    <p><strong>Jméno hosta:</strong> ${guestName}</p>
    <p><strong>Email:</strong> ${guestEmail}</p>
    <p><strong>ID rezervace:</strong> ${reservationId}</p>
    <p><strong>Příjezd:</strong> ${checkInFormatted}</p>
    <p><strong>Odjezd:</strong> ${checkOutFormatted}</p>
    <p><strong>Počet hostů:</strong> ${numberOfGuests}</p>
    <p><strong>Celková cena:</strong> ${totalPrice} Kč</p>
  `;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'info@chalupa.cz',
      to: process.env.ADMIN_EMAIL || 'admin@chalupa.cz',
      subject: `Nová rezervace od ${guestName}`,
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error('Chyba při odesílání emailu:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
