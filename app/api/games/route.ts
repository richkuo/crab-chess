import { NextRequest, NextResponse } from 'next/server';
import { GameManager } from '@/lib/game-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerName } = body;

    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    const result = await GameManager.createGame({
      whitePlayerName: playerName.trim(),
    });

    return NextResponse.json({
      gameId: result.game.id,
      playerId: result.whitePlayer.id,
      game: result.game,
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}
