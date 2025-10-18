/**
 * Achievements Page - User achievements and progress
 */

'use client';

import { Badges } from '@/components/gamification/Badges';

export default function AchievementsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
      <Badges />
    </div>
  );
}
