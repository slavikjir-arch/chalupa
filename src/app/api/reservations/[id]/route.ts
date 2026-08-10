import { NextRequest, NextResponse } from 'next/server';
import { getReservation, updateReservation } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const reservation = await getReservation(id);
    if (!reservation) {
      return NextResponse.json(
        { error: 'Rezervace nenalezena' },
        { status: 404 }
      );
    }
    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Chyba při načítání rezervace:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání rezervace' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = await updateReservation(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Rezervace nenalezena' },
        { status: 404 }
      );
    }
    console.error('Chyba při aktualizaci rezervace:', error);
    return NextResponse.json(
      { error: 'Chyba při aktualizaci rezervace' },
      { status: 500 }
    );
  }
}
