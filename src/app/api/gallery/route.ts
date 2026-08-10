import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export function GET() {
  const galleryDir = path.join(process.cwd(), 'public', 'gallery');
  let files: string[] = [];
  try {
    files = fs.readdirSync(galleryDir)
      .filter((f) => {
        const lower = f.toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some((ext) => lower.endsWith(ext));
      })
      .map((f) => `/gallery/${f}`);
  } catch (e) {
    // directory might not exist or be empty
    files = [];
  }
  return NextResponse.json({ files });
}