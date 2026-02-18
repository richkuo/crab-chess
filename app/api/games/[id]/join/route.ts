import { NextRequest, NextResponse } from 'next/server';
import { GameManager } from '@/lib/game-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { playerName } = body;

    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    const result = await GameManager.joinGame({
      gameId: id,
      blackPlayerName: playerName.trim(),
    });

    return NextResponse.json({
      gameId: result.game.id,
      playerId: result.blackPlayer.id,
      game: result.game,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to join game';
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
