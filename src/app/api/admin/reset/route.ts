import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { type } = await request.json();

    switch (type) {
      case 'predictions': {
        await db.prediction.deleteMany();
        // Also reset match scores
        await db.match.updateMany({
          data: { homeScore: null, awayScore: null, isCompleted: false },
        });
        break;
      }
      case 'matches': {
        await db.prediction.deleteMany();
        await db.match.updateMany({
          data: { homeScore: null, awayScore: null, isCompleted: false },
        });
        break;
      }
      case 'users': {
        // Delete all non-admin users and their data
        await db.prediction.deleteMany();
        await db.session.deleteMany({
          where: { user: { isAdmin: false } },
        });
        await db.user.deleteMany({
          where: { isAdmin: false },
        });
        await db.match.updateMany({
          data: { homeScore: null, awayScore: null, isCompleted: false },
        });
        break;
      }
      case 'all': {
        await db.prediction.deleteMany();
        await db.session.deleteMany();
        await db.user.deleteMany({
          where: { isAdmin: false },
        });
        await db.match.updateMany({
          data: { homeScore: null, awayScore: null, isCompleted: false },
        });
        // Reset settings
        await db.appSetting.upsert({
          where: { key: 'predictionsLocked' },
          update: { value: 'false' },
          create: { key: 'predictionsLocked', value: 'false' },
        });
        break;
      }
      default:
        return NextResponse.json(
          { error: 'Tipo de reset inválido' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { error: 'Error al resetear datos' },
      { status: 500 }
    );
  }
}
