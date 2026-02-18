import { db } from './db';
import { ChessEngine, MoveResult } from './chess-engine';
import { Square, PieceSymbol } from 'chess.js';
import { nanoid } from 'nanoid';

export interface CreateGameParams {
  whitePlayerName: string;
}

export interface JoinGameParams {
  gameId: string;
  blackPlayerName: string;
}

export interface MakeMoveParams {
  gameId: string;
  playerId: string;
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
}

export class GameManager {
  /**
   * Create a new game
   */
  static async createGame(params: CreateGameParams) {
    // Create white player
    const whitePlayer = await db.player.create({
      data: {
        displayName: params.whitePlayerName,
      },
    });

    // Initialize their score
    await db.score.create({
      data: {
        playerId: whitePlayer.id,
      },
    });

    // Create game
    const game = await db.game.create({
      data: {
        whitePlayerId: whitePlayer.id,
        status: 'waiting',
      },
      include: {
        whitePlayer: true,
        blackPlayer: true,
      },
    });

    return {
      game,
      whitePlayer,
    };
  }

  /**
   * Join an existing game
   */
  static async joinGame(params: JoinGameParams) {
    const game = await db.game.findUnique({
      where: { id: params.gameId },
      include: {
        whitePlayer: true,
        blackPlayer: true,
      },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'waiting') {
      throw new Error('Game already started or finished');
    }

    if (game.blackPlayerId) {
      throw new Error('Game already has two players');
    }

    // Create black player
    const blackPlayer = await db.player.create({
      data: {
        displayName: params.blackPlayerName,
      },
    });

    // Initialize their score
    await db.score.create({
      data: {
        playerId: blackPlayer.id,
      },
    });

    // Update game
    const updatedGame = await db.game.update({
      where: { id: params.gameId },
      data: {
        blackPlayerId: blackPlayer.id,
        status: 'active',
      },
      include: {
        whitePlayer: true,
        blackPlayer: true,
      },
    });

    return {
      game: updatedGame,
      blackPlayer,
    };
  }

  /**
   * Make a move
   */
  static async makeMove(params: MakeMoveParams): Promise<MoveResult & { game: any }> {
    const game = await db.game.findUnique({
      where: { id: params.gameId },
      include: {
        whitePlayer: true,
        blackPlayer: true,
        moves: true,
      },
    });

    if (!game) {
      return {
        success: false,
        error: 'Game not found',
        game: null,
      };
    }

    if (game.status !== 'active') {
      return {
        success: false,
        error: 'Game is not active',
        game,
      };
    }

    // Create chess engine from current FEN
    const engine = new ChessEngine(game.fen);

    // Verify it's the player's turn
    const playerColor = game.whitePlayerId === params.playerId ? 'white' : 'black';
    if (!engine.isPlayerTurn(playerColor)) {
      return {
        success: false,
        error: 'Not your turn',
        game,
      };
    }

    // Make the move
    const moveResult = engine.makeMove(params.from, params.to, params.promotion);

    if (!moveResult.success) {
      return {
        ...moveResult,
        game,
      };
    }

    // Save move to database
    await db.move.create({
      data: {
        gameId: game.id,
        moveNum: game.moves.length + 1,
        from: params.from,
        to: params.to,
        piece: moveResult.move!.piece,
        notation: moveResult.move!.san,
        fen: moveResult.fen!,
      },
    });

    // Update game state
    const updatedGame = await db.game.update({
      where: { id: params.gameId },
      data: {
        fen: moveResult.fen,
        pgn: moveResult.pgn,
        status: moveResult.status,
        result: moveResult.result,
        endedAt: moveResult.status !== 'active' ? new Date() : null,
      },
      include: {
        whitePlayer: true,
        blackPlayer: true,
        moves: true,
      },
    });

    // If game ended, update scores
    if (moveResult.status !== 'active' && moveResult.result) {
      await this.updateScores(updatedGame);
    }

    return {
      ...moveResult,
      game: updatedGame,
    };
  }

  /**
   * Update player scores after game ends
   */
  private static async updateScores(game: any) {
    if (!game.whitePlayerId || !game.blackPlayerId || !game.result) {
      return;
    }

    const winPoints = 3;
    const drawPoints = 1;
    const lossPoints = 0;

    let whitePoints = 0;
    let blackPoints = 0;
    let whiteWins = 0;
    let blackWins = 0;
    let whiteLosses = 0;
    let blackLosses = 0;
    let whiteDraws = 0;
    let blackDraws = 0;

    if (game.result === 'white') {
      whitePoints = winPoints;
      blackPoints = lossPoints;
      whiteWins = 1;
      blackLosses = 1;
    } else if (game.result === 'black') {
      whitePoints = lossPoints;
      blackPoints = winPoints;
      whiteLosses = 1;
      blackWins = 1;
    } else if (game.result === 'draw') {
      whitePoints = drawPoints;
      blackPoints = drawPoints;
      whiteDraws = 1;
      blackDraws = 1;
    }

    // Update white player score
    await db.score.update({
      where: { playerId: game.whitePlayerId },
      data: {
        wins: { increment: whiteWins },
        losses: { increment: whiteLosses },
        draws: { increment: whiteDraws },
        points: { increment: whitePoints },
      },
    });

    // Update black player score
    await db.score.update({
      where: { playerId: game.blackPlayerId },
      data: {
        wins: { increment: blackWins },
        losses: { increment: blackLosses },
        draws: { increment: blackDraws },
        points: { increment: blackPoints },
      },
    });
  }

  /**
   * Get game by ID
   */
  static async getGame(gameId: string) {
    return db.game.findUnique({
      where: { id: gameId },
      include: {
        whitePlayer: true,
        blackPlayer: true,
        moves: {
          orderBy: {
            moveNum: 'asc',
          },
        },
      },
    });
  }

  /**
   * Get player by ID
   */
  static async getPlayer(playerId: string) {
    return db.player.findUnique({
      where: { id: playerId },
      include: {
        scores: true,
      },
    });
  }
}
