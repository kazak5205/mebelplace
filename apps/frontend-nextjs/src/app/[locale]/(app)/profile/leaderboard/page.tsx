/**
 * Leaderboard Page - Top users by points
 */

'use client';

import { Leaderboard } from '@/components/gamification/Leaderboard';

export default function LeaderboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
      <Leaderboard />
    </div>
  );
}
