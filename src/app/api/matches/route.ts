import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const matches = await db.match.findMany({
      orderBy: { matchNumber: 'asc' },
    });

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Get matches error:', error);
    return NextResponse.json(
      { error: 'Error al obtener partidos' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { matchId, homeScore, awayScore } = await request.json();

    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    const match = await db.match.update({
      where: { id: matchId },
      data: {
        homeScore: parseInt(String(homeScore)),
        awayScore: parseInt(String(awayScore)),
        isCompleted: true,
      },
    });

    // Recalculate points for all predictions of this match
    const predictions = await db.prediction.findMany({
      where: { matchId },
    });

    for (const pred of predictions) {
      let points = 0;
      if (pred.homeScore === match.homeScore && pred.awayScore === match.awayScore) {
        points = 3; // Exact match
      } else if (pred.homeScore === match.homeScore || pred.awayScore === match.awayScore) {
        points = 1; // Partial match
      }

      await db.prediction.update({
        where: { id: pred.id },
        data: { points },
      });
    }

    return NextResponse.json({ match });
  } catch (error) {
    console.error('Update match error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar partido' },
      { status: 500 }
    );
  }
}
