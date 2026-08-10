import { NextResponse } from 'next/server';
import { getCottageInfo } from '@/lib/db';

export async function GET() {
  const cottage = await getCottageInfo();
  return NextResponse.json(cottage);
}
