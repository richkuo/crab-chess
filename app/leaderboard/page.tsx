import Link from 'next/link';
import { db } from '@/lib/db';

export const revalidate = 0; // Disable caching for fresh leaderboard

async function getLeaderboard() {
  const leaderboard = await db.score.findMany({
    take: 50,
    orderBy: [
      { points: 'desc' },
      { wins: 'desc' },
    ],
    include: {
      player: true,
    },
  });

  return leaderboard.map((score, index) => ({
    rank: index + 1,
    playerId: score.player.id,
    playerName: score.player.displayName,
    wins: score.wins,
    losses: score.losses,
    draws: score.draws,
    points: score.points,
    gamesPlayed: score.wins + score.losses + score.draws,
  }));
}

export default async function Leaderboard() {
  const leaderboard = await getLeaderboard();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl">
            🦀
          </Link>
          <h1 className="mt-4 text-4xl font-bold text-white">Leaderboard</h1>
          <p className="mt-2 text-blue-200">Top players by points • Win=3 • Draw=1 • Loss=0</p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="bg-white/10 rounded-lg p-8 text-center">
            <p className="text-blue-200 text-lg">No games played yet!</p>
            <Link
              href="/create"
              className="inline-block mt-4 bg-crab-orange hover:bg-crab-red text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Be the First to Play
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ocean-blue text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Rank</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Player</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Games</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Wins</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Draws</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Losses</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.playerId}
                      className={entry.rank <= 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {entry.rank === 1 && <span className="text-2xl mr-2">🥇</span>}
                          {entry.rank === 2 && <span className="text-2xl mr-2">🥈</span>}
                          {entry.rank === 3 && <span className="text-2xl mr-2">🥉</span>}
                          <span className="font-medium text-gray-900">#{entry.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{entry.playerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        {entry.gamesPlayed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-green-600">
                        {entry.wins}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                        {entry.draws}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-red-600">
                        {entry.losses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-bold text-ocean-blue">{entry.points}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 text-center space-y-4">
          <Link
            href="/create"
            className="inline-block bg-crab-orange hover:bg-crab-red text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Create New Game
          </Link>
          <div>
            <Link href="/" className="text-blue-200 hover:text-white transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
