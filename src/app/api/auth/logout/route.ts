import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUser, deleteSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Try to get token from Authorization header or cookie
    const user = await getSessionUser(request);
    let token: string | undefined;

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get('session_token')?.value;
    }

    if (token) {
      await deleteSession(token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
