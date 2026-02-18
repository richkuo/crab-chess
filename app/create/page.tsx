'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateGame() {
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create game');
      }

      // Store player ID in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`player_${data.gameId}`, data.playerId);
      }

      // Redirect to game page
      router.push(`/game/${data.gameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
      setIsCreating(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="text-4xl">
            🦀
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-white">Create New Game</h1>
          <p className="mt-2 text-blue-200">
            Enter your name to create a game and get a shareable link
          </p>
        </div>

        <form onSubmit={handleCreate} className="mt-8 space-y-6">
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
              disabled={isCreating}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-crab-orange hover:bg-crab-red text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating Game...' : 'Create Game'}
          </button>

          <Link
            href="/"
            className="block text-center text-blue-200 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </form>
      </div>
    </main>
  );
}
