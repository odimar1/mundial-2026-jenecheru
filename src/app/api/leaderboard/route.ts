import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get all confirmed users with their predictions
    const users = await db.user.findMany({
      where: {
        isAdmin: false,
        isConfirmed: true,
      },
      include: {
        predictions: true,
      },
    });

    const leaderboard = users.map((u) => {
      const exactPredictions = u.predictions.filter((p) => p.points === 3).length;
      const partialPredictions = u.predictions.filter((p) => p.points === 1).length;
      const totalPoints = u.predictions.reduce((sum, p) => sum + (p.points || 0), 0);

      return {
        id: u.id,
        name: u.name,
        exactPredictions,
        partialPredictions,
        totalPoints,
        totalPredictions: u.predictions.length,
      };
    });

    // Sort by total points (descending), then by exact predictions
    leaderboard.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return b.exactPredictions - a.exactPredictions;
    });

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Error al obtener tabla de posiciones' },
      { status: 500 }
    );
  }
}
