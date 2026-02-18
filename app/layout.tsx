import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Crab Chess - Multiplayer Chess with a Twist',
  description: 'Play real-time multiplayer chess with crab-themed pieces',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gradient-to-br from-ocean-blue to-blue-900">
        {children}
      </body>
    </html>
  );
}
