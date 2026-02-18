import { Chess, Square, Move, PieceSymbol } from 'chess.js';

export type GameStatus = 'waiting' | 'active' | 'checkmate' | 'stalemate' | 'draw';
export type GameResult = 'white' | 'black' | 'draw' | null;

export interface MoveResult {
  success: boolean;
  move?: Move;
  fen?: string;
  pgn?: string;
  status?: GameStatus;
  result?: GameResult;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isStalemate?: boolean;
  isDraw?: boolean;
  error?: string;
}

export class ChessEngine {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  /**
   * Make a move on the board
   */
  makeMove(from: Square, to: Square, promotion?: PieceSymbol): MoveResult {
    try {
      const move = this.chess.move({
        from,
        to,
        promotion: promotion || 'q', // Default to queen promotion
      });

      if (!move) {
        return {
          success: false,
          error: 'Invalid move',
        };
      }

      return {
        success: true,
        move,
        fen: this.chess.fen(),
        pgn: this.chess.pgn(),
        status: this.getGameStatus(),
        result: this.getGameResult(),
        isCheck: this.chess.isCheck(),
        isCheckmate: this.chess.isCheckmate(),
        isStalemate: this.chess.isStalemate(),
        isDraw: this.chess.isDraw(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid move',
      };
    }
  }

  /**
   * Get current game status
   */
  getGameStatus(): GameStatus {
    if (this.chess.isCheckmate()) return 'checkmate';
    if (this.chess.isStalemate()) return 'stalemate';
    if (this.chess.isDraw()) return 'draw';
    if (this.chess.turn() === 'w' && this.chess.history().length === 0) return 'waiting';
    return 'active';
  }

  /**
   * Get game result
   */
  getGameResult(): GameResult {
    if (this.chess.isCheckmate()) {
      return this.chess.turn() === 'w' ? 'black' : 'white';
    }
    if (this.chess.isStalemate() || this.chess.isDraw()) {
      return 'draw';
    }
    return null;
  }

  /**
   * Get current FEN
   */
  getFen(): string {
    return this.chess.fen();
  }

  /**
   * Get PGN
   */
  getPgn(): string {
    return this.chess.pgn();
  }

  /**
   * Get valid moves for a square
   */
  getValidMoves(square: Square): Square[] {
    const moves = this.chess.moves({ square, verbose: true });
    return moves.map((move) => move.to as Square);
  }

  /**
   * Check if it's a specific player's turn
   */
  isPlayerTurn(color: 'white' | 'black'): boolean {
    return this.chess.turn() === (color === 'white' ? 'w' : 'b');
  }

  /**
   * Get current turn
   */
  getTurn(): 'white' | 'black' {
    return this.chess.turn() === 'w' ? 'white' : 'black';
  }

  /**
   * Get board state as ASCII (for debugging)
   */
  getAscii(): string {
    return this.chess.ascii();
  }

  /**
   * Check if game is over
   */
  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  /**
   * Get move history
   */
  getHistory(): Move[] {
    return this.chess.history({ verbose: true });
  }
}
