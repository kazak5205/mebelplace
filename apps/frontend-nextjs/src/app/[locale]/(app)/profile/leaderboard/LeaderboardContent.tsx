'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api/client';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

interface LeaderboardUser {
  id: number;
  username: string;
  avatar?: string;
  points: number;
  level: number;
  rank: number;
  region: string;
}

export default function LeaderboardContent() {
  const t = useTranslations('gamification');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [filter, setFilter] = useState<'all' | 'region'>('all');

  // Data is fetched via API hooks
  const loading = false; // Will be replaced with real API hook when ready

  const fetchLeaderboard = async () => {
    try {
      // Loading handled by API hooks
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">
        🏆 {t('leaderboard')}
      </h1>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[var(--color-accent)] text-white'
              : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]'
          }`}
        >
          {t('allUsers')}
        </button>
        <button
          onClick={() => setFilter('region')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'region'
              ? 'bg-[var(--color-accent)] text-white'
              : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]'
          }`}
        >
          {t('myRegion')}
        </button>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {users.map((user, index) => (
          <div
            key={user.id}
            className={`bg-[var(--color-surface)] rounded-lg p-4 flex items-center gap-4 
              ${index < 3 ? 'border-2 border-[var(--color-accent)]' : 'border border-[var(--color-border)]'}`}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
              {index === 0 && <span className="text-4xl">🥇</span>}
              {index === 1 && <span className="text-4xl">🥈</span>}
              {index === 2 && <span className="text-4xl">🥉</span>}
              {index > 2 && (
                <span className="text-2xl font-bold text-[var(--color-text-secondary)]">
                  #{user.rank}
                </span>
              )}
            </div>

            {/* User Info */}
            <Avatar
              src={user.avatar}
              name={user.username}
              size="lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--color-text-primary)]">
                {user.username}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                📍 {user.region}
              </p>
            </div>

            {/* Stats */}
            <div className="text-right">
              <Badge variant="success">
                Level {user.level}
              </Badge>
              <p className="text-lg font-bold text-[var(--color-accent)] mt-1">
                {user.points.toLocaleString()} {t('points')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 bg-[var(--color-surface)] rounded-lg">
          <p className="text-[var(--color-text-secondary)]">
            {t('noLeaderboardData')}
          </p>
        </div>
      )}
    </div>
  );
}

