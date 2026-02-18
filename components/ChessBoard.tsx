'use client';

import { useState, useEffect } from 'react';
import { Square } from 'chess.js';

interface ChessBoardProps {
  fen: string;
  onMove: (from: Square, to: Square) => Promise<void>;
  playerColor: 'white' | 'black' | null;
  currentTurn: 'white' | 'black';
  isGameOver: boolean;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const PIECE_UNICODE: Record<string, string> = {
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
  P: '♙',
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
};

function parseFen(fen: string): Map<string, string> {
  const board = new Map<string, string>();
  const position = fen.split(' ')[0];
  const ranks = position.split('/');

  ranks.forEach((rank, rankIndex) => {
    let fileIndex = 0;
    for (const char of rank) {
      if (char >= '1' && char <= '8') {
        fileIndex += parseInt(char);
      } else {
        const square = `${FILES[fileIndex]}${RANKS[rankIndex]}` as Square;
        board.set(square, char);
        fileIndex++;
      }
    }
  });

  return board;
}

export default function ChessBoard({ fen, onMove, playerColor, currentTurn, isGameOver }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [board, setBoard] = useState<Map<string, string>>(new Map());
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    setBoard(parseFen(fen));
  }, [fen]);

  const handleSquareClick = async (square: Square) => {
    if (isGameOver || isMoving) return;
    
    // Check if it's player's turn
    if (!playerColor || currentTurn !== playerColor) {
      return;
    }

    if (!selectedSquare) {
      // First click - select piece
      const piece = board.get(square);
      if (piece) {
        const isWhitePiece = piece === piece.toUpperCase();
        const canSelect = (playerColor === 'white' && isWhitePiece) || (playerColor === 'black' && !isWhitePiece);
        if (canSelect) {
          setSelectedSquare(square);
        }
      }
    } else {
      // Second click - attempt move
      if (selectedSquare === square) {
        // Deselect
        setSelectedSquare(null);
      } else {
        // Try to move
        setIsMoving(true);
        try {
          await onMove(selectedSquare, square);
          setSelectedSquare(null);
        } catch (error) {
          console.error('Move failed:', error);
        } finally {
          setIsMoving(false);
        }
      }
    }
  };

  const renderSquare = (square: Square, piece: string | undefined, isDark: boolean) => {
    const isSelected = selectedSquare === square;
    const bgColor = isSelected
      ? 'bg-yellow-300'
      : isDark
      ? 'bg-blue-400'
      : 'bg-sand';

    return (
      <button
        key={square}
        onClick={() => handleSquareClick(square)}
        className={`
          aspect-square flex items-center justify-center text-4xl sm:text-5xl md:text-6xl
          ${bgColor} hover:opacity-80 transition-opacity
          ${!isGameOver && playerColor === currentTurn ? 'cursor-pointer' : 'cursor-not-allowed'}
          ${isSelected ? 'ring-4 ring-yellow-500' : ''}
        `}
        disabled={isGameOver || isMoving || !playerColor || currentTurn !== playerColor}
      >
        {piece && PIECE_UNICODE[piece]}
      </button>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-8 gap-0 border-4 border-ocean-blue rounded-lg overflow-hidden shadow-2xl">
        {RANKS.map((rank) =>
          FILES.map((file) => {
            const square = `${file}${rank}` as Square;
            const piece = board.get(square);
            const fileIndex = FILES.indexOf(file);
            const rankIndex = RANKS.indexOf(rank);
            const isDark = (fileIndex + rankIndex) % 2 === 1;
            return renderSquare(square, piece, isDark);
          })
        )}
      </div>
    </div>
  );
}
