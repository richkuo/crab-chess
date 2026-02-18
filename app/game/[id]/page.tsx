'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ChessBoard from '@/components/ChessBoard';
import { Square } from 'chess.js';

interface Game {
  id: string;
  whitePlayerId: string | null;
  blackPlayerId: string | null;
  whitePlayer: { id: string; displayName: string } | null;
  blackPlayer: { id: string; displayName: string } | null;
  status: string;
  result: string | null;
  fen: string;
  moves: any[];
}

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: gameId } = use(params);
  const router = useRouter();
  
  const [game, setGame] = useState<Game | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/game/${gameId}`);
      const storedPlayerId = localStorage.getItem(`player_${gameId}`);
      if (storedPlayerId) {
        setPlayerId(storedPlayerId);
      }
    }
  }, [gameId]);

  useEffect(() => {
    fetchGame();
    const interval = setInterval(fetchGame, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [gameId]);

  useEffect(() => {
    if (game && playerId) {
      if (game.whitePlayerId === playerId) {
        setPlayerColor('white');
      } else if (game.blackPlayerId === playerId) {
        setPlayerColor('black');
      }
    }
  }, [game, playerId]);

  const fetchGame = async () => {
    try {
      const response = await fetch(`/api/games/${gameId}`);
      const data = await response.json();
      if (response.ok) {
        setGame(data.game);
      }
    } catch (err) {
      console.error('Failed to fetch game:', err);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsJoining(true);

    try {
      const response = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join game');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(`player_${gameId}`, data.playerId);
      }
      setPlayerId(data.playerId);
      fetchGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
    } finally {
      setIsJoining(false);
    }
  };

  const handleMove = async (from: Square, to: Square) => {
    if (!playerId) return;

    try {
      const response = await fetch(`/api/games/${gameId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, from, to }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid move');
      }

      fetchGame();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Invalid move');
      throw err;
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!game) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="text-white text-xl">Loading game...</div>
      </main>
    );
  }

  const currentTurn = game.fen.split(' ')[1] === 'w' ? 'white' : 'black';
  const isGameOver = game.status !== 'active' && game.status !== 'waiting';

  // Show join form if game is waiting and player hasn't joined
  if (game.status === 'waiting' && !playerId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Join Game</h1>
            <p className="mt-2 text-blue-200">
              {game.whitePlayer?.displayName} is waiting for an opponent!
            </p>
          </div>

          <form onSubmit={handleJoinGame} className="mt-8 space-y-6">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-blue-100 mb-2">
                Your Name
              </label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-crab-orange"
                placeholder="Enter your display name"
                maxLength={50}
                disabled={isJoining}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isJoining}
              className="w-full bg-crab-orange hover:bg-crab-red text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {isJoining ? 'Joining...' : 'Join as Black'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Show waiting screen if player created game but opponent hasn't joined
  if (game.status === 'waiting' && playerId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-8 text-center">
          <h1 className="text-3xl font-bold text-white">Waiting for Opponent</h1>
          <p className="text-blue-200 text-lg">Share this link with your opponent:</p>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-900"
            />
            <button
              onClick={copyShareLink}
              className="bg-crab-orange hover:bg-crab-red text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          <div className="text-blue-200">
            <p>or scan this QR code (coming soon)</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl">
            🦀
          </Link>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-white">Crab Chess</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <ChessBoard
              fen={game.fen}
              onMove={handleMove}
              playerColor={playerColor}
              currentTurn={currentTurn}
              isGameOver={isGameOver}
            />
          </div>

          {/* Game Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-ocean-blue mb-4">Game Info</h2>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">White</div>
                  <div className="font-semibold text-gray-900">
                    {game.whitePlayer?.displayName || 'Waiting...'}
                    {playerColor === 'white' && ' (You)'}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Black</div>
                  <div className="font-semibold text-gray-900">
                    {game.blackPlayer?.displayName || 'Waiting...'}
                    {playerColor === 'black' && ' (You)'}
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-sm text-gray-600">Current Turn</div>
                  <div className="font-semibold text-ocean-blue capitalize">
                    {isGameOver ? 'Game Over' : currentTurn}
                    {!isGameOver && playerColor === currentTurn && ' - Your Turn!'}
                  </div>
                </div>

                {isGameOver && game.result && (
                  <div className="pt-3 border-t">
                    <div className="text-sm text-gray-600">Result</div>
                    <div className="font-bold text-lg capitalize">
                      {game.result === 'draw' ? 'Draw!' : `${game.result} Wins!`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-bold text-ocean-blue mb-3">Moves</h3>
              <div className="max-h-64 overflow-y-auto space-y-1 text-sm">
                {game.moves.length === 0 ? (
                  <p className="text-gray-500">No moves yet</p>
                ) : (
                  game.moves.map((move, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-gray-600 w-8">{Math.floor(i / 2) + 1}.</span>
                      <span className="font-mono">{move.notation}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href="/leaderboard"
                className="block w-full bg-white hover:bg-gray-100 text-ocean-blue font-bold py-3 px-6 rounded-lg transition-colors text-center"
              >
                View Leaderboard
              </Link>
              <Link
                href="/"
                className="block text-center text-blue-200 hover:text-white transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
