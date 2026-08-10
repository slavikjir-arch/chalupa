import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

// Bcrypt hash of 'n7ndmySHOJ4ej9f7'
// Generated with: bcrypt.hashSync('n7ndmySHOJ4ej9f7', 10)
const ADMIN_PASSWORD_HASH =
  '$2b$10$j7jNs8rY7r96tU/TUskQwuRFBi8qhMXXg9tQ.tRghEQtLLd2pB4D6';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Heslo je povinné' },
        { status: 400 }
      );
    }

    const storedHash = ADMIN_PASSWORD_HASH;

    if (!storedHash) {
      return NextResponse.json(
        { error: 'Interní chyba serveru' },
        { status: 500 }
      );
    }

    console.log('DEBUG: Received password length:', password.length);
    console.log('DEBUG: Hash length:', storedHash.length);
    console.log('DEBUG: Starting bcrypt.compare...');
    const isValid = await bcrypt.compare(password, storedHash);
    console.log('DEBUG: bcrypt.compare completed, result:', isValid);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Nesprávné heslo' },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { success: true, message: 'Přihlášení úspěšné' },
      { status: 200 }
    );

    response.cookies.set('admin-authenticated', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', (error as Error).message);
    return NextResponse.json(
      { error: 'Chyba při přihlášení' },
      { status: 500 }
    );
  }
}
