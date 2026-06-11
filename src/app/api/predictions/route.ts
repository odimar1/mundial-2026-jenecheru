import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// GET all predictions (optionally filtered by userId or matchId)
export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const matchId = searchParams.get('matchId');

    const where: Record<string, string> = {};
    if (userId) where.userId = userId;
    if (matchId) where.matchId = matchId;

    const predictions = await db.prediction.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, isConfirmed: true },
        },
        match: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error('Get predictions error:', error);
    return NextResponse.json(
      { error: 'Error al obtener predicciones' },
      { status: 500 }
    );
  }
}

// POST save or update a prediction
export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!user.isConfirmed) {
      return NextResponse.json(
        { error: 'Tu cuenta aún no ha sido confirmada por el administrador' },
        { status: 403 }
      );
    }

    // Check if predictions are locked
    const setting = await db.appSetting.findUnique({
      where: { key: 'predictionsLocked' },
    });
    if (setting?.value === 'true') {
      return NextResponse.json(
        { error: 'Las predicciones están bloqueadas por el administrador' },
        { status: 403 }
      );
    }

    const { matchId, homeScore, awayScore } = await request.json();

    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Check if match is already completed
    const match = await db.match.findUnique({ where: { id: matchId } });
    if (match?.isCompleted) {
      return NextResponse.json(
        { error: 'No puedes predecir un partido que ya tiene resultado oficial' },
        { status: 400 }
      );
    }

    // Upsert prediction
    const prediction = await db.prediction.upsert({
      where: {
        userId_matchId: {
          userId: user.id,
          matchId,
        },
      },
      update: {
        homeScore: parseInt(String(homeScore)),
        awayScore: parseInt(String(awayScore)),
      },
      create: {
        userId: user.id,
        matchId,
        homeScore: parseInt(String(homeScore)),
        awayScore: parseInt(String(awayScore)),
      },
    });

    return NextResponse.json({ prediction });
  } catch (error) {
    console.error('Save prediction error:', error);
    return NextResponse.json(
      { error: 'Error al guardar predicción' },
      { status: 500 }
    );
  }
}

// PUT save multiple predictions at once
export async function PUT(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!user.isConfirmed) {
      return NextResponse.json(
        { error: 'Tu cuenta aún no ha sido confirmada por el administrador' },
        { status: 403 }
      );
    }

    // Check if predictions are locked
    const setting = await db.appSetting.findUnique({
      where: { key: 'predictionsLocked' },
    });
    if (setting?.value === 'true') {
      return NextResponse.json(
        { error: 'Las predicciones están bloqueadas por el administrador' },
        { status: 403 }
      );
    }

    const { predictions } = await request.json() as {
      predictions: Array<{ matchId: string; homeScore: number; awayScore: number }>;
    };

    if (!predictions || !Array.isArray(predictions)) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    const results = [];

    for (const pred of predictions) {
      // Check if match is already completed
      const match = await db.match.findUnique({ where: { id: pred.matchId } });
      if (match?.isCompleted) continue;

      const prediction = await db.prediction.upsert({
        where: {
          userId_matchId: {
            userId: user.id,
            matchId: pred.matchId,
          },
        },
        update: {
          homeScore: parseInt(String(pred.homeScore)),
          awayScore: parseInt(String(pred.awayScore)),
        },
        create: {
          userId: user.id,
          matchId: pred.matchId,
          homeScore: parseInt(String(pred.homeScore)),
          awayScore: parseInt(String(pred.awayScore)),
        },
      });

      results.push(prediction);
    }

    return NextResponse.json({ predictions: results });
  } catch (error) {
    console.error('Save predictions error:', error);
    return NextResponse.json(
      { error: 'Error al guardar predicciones' },
      { status: 500 }
    );
  }
}
