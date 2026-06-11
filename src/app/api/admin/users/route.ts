import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// GET all users (admin only)
export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const users = await db.user.findMany({
      where: { isAdmin: false },
      select: {
        id: true,
        name: true,
        email: true,
        isConfirmed: true,
        createdAt: true,
        _count: {
          select: { predictions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

// PUT confirm/unconfirm a user (admin only)
export async function PUT(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { userId, isConfirmed } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { isConfirmed },
      select: {
        id: true,
        name: true,
        email: true,
        isConfirmed: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Confirm user error:', error);
    return NextResponse.json(
      { error: 'Error al confirmar usuario' },
      { status: 500 }
    );
  }
}
