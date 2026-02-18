# 🦀 Crab Chess

A production-ready real-time multiplayer chess game with crab-themed pieces, persistent player records, and a competitive leaderboard.

## Features

- **Real-time Multiplayer**: Play chess with anyone via shareable invite links
- **Crab-Themed Pieces**: Unique crab-inspired chess pieces
- **Persistent Data**: All games, moves, and player stats saved permanently
- **Competitive Leaderboard**: Track wins, losses, and draws with point-based ranking
- **Full Chess Rules**: Complete implementation including check, checkmate, stalemate, castling, en passant, and promotion
- **Mobile & Desktop**: Responsive design works on all devices
- **Server-side Validation**: All moves validated server-side to prevent cheating

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes, Socket.io
- **Database**: Prisma + SQLite (production-ready for Postgres/PlanetScale)
- **Chess Engine**: chess.js
- **Real-time**: Socket.io
- **Runtime**: Bun

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) installed

### Installation

```bash
# Clone the repository
git clone https://github.com/richkuo/crab-chess.git
cd crab-chess

# Install dependencies
bun install

# Set up database
bun run db:push

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

The app uses Prisma with SQLite by default for easy local development.

```bash
# Push schema to database
bun run db:push

# Open Prisma Studio to view data
bun run db:studio

# Create migrations (optional)
bun run db:migrate
```

### Production Database

For production, update `prisma/schema.prisma` datasource to PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## How to Play

1. **Create a Game**: Click "Create New Game" and enter your display name
2. **Share the Link**: Copy the generated game URL and send it to your opponent
3. **Join & Play**: Opponent clicks the link, enters their name, and the game begins
4. **Real-time Moves**: Both players see moves instantly
5. **Track Stats**: All games are recorded and contribute to the leaderboard

## Scoring System

- **Win**: 3 points
- **Draw**: 1 point
- **Loss**: 0 points

## Architecture

```
crab-chess/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Utilities and game logic
├── prisma/           # Database schema and migrations
├── public/           # Static assets (crab piece images)
└── server/           # Socket.io server logic
```

## Development

```bash
# Run dev server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Lint code
bun run lint
```

## Testing

Run the test suite:

```bash
bun test
```

### Manual Testing Checklist

- [ ] Create game flow
- [ ] Join game via link
- [ ] Real-time move sync (2 browsers)
- [ ] Move validation (illegal moves rejected)
- [ ] Check/checkmate detection
- [ ] Castling, en passant, promotion
- [ ] Disconnect/reconnect handling
- [ ] Game result persistence
- [ ] Leaderboard updates
- [ ] Mobile responsiveness

## Deployment

Deploy to Vercel:

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel
```

Or use the Vercel dashboard to deploy directly from GitHub.

## License

MIT

## Credits

Built with ❤️ and 🦀 by [Rich Kuo](https://github.com/richkuo)
