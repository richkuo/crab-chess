import { NextRequest, NextResponse } from 'next/server';
import { GameManager } from '@/lib/game-manager';
import { Square, PieceSymbol } from 'chess.js';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { playerId, from, to, promotion } = body;

    if (!playerId || !from || !to) {
      return NextResponse.json(
        { error: 'playerId, from, and to are required' },
        { status: 400 }
      );
    }

    const result = await GameManager.makeMove({
      gameId: id,
      playerId,
      from: from as Square,
      to: to as Square,
      promotion: promotion as PieceSymbol | undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Invalid move' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      move: result.move,
      game: result.game,
      status: result.status,
      isCheck: result.isCheck,
      isCheckmate: result.isCheckmate,
      isStalemate: result.isStalemate,
      isDraw: result.isDraw,
    });
  } catch (error) {
    console.error('Error making move:', error);
    return NextResponse.json(
      { error: 'Failed to make move' },
      { status: 500 }
    );
  }
}
