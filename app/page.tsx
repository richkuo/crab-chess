import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          🦀 Crab Chess 🦀
        </h1>
        <p className="text-xl text-blue-100 mb-8">
          Play real-time multiplayer chess with crab-themed pieces!
        </p>
        
        <div className="space-y-4">
          <Link
            href="/create"
            className="block w-full bg-crab-orange hover:bg-crab-red text-white font-bold py-4 px-6 rounded-lg transition-colors text-xl"
          >
            Create New Game
          </Link>
          
          <Link
            href="/leaderboard"
            className="block w-full bg-white hover:bg-gray-100 text-ocean-blue font-bold py-4 px-6 rounded-lg transition-colors text-xl"
          >
            View Leaderboard
          </Link>
        </div>

        <div className="mt-12 text-blue-200 text-sm">
          <p>Create a game to get a shareable link, or join via invite!</p>
        </div>
      </div>
    </main>
  );
}
