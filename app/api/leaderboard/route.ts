import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const leaderboard = await db.score.findMany({
      take: Math.min(limit, 100), // Cap at 100
      orderBy: [
        { points: 'desc' },
        { wins: 'desc' },
      ],
      include: {
        player: true,
      },
    });

    return NextResponse.json({
      leaderboard: leaderboard.map((score, index) => ({
        rank: index + 1,
        playerId: score.player.id,
        playerName: score.player.displayName,
        wins: score.wins,
        losses: score.losses,
        draws: score.draws,
        points: score.points,
        gamesPlayed: score.wins + score.losses + score.draws,
      })),
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
