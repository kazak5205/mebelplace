import React from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass';

interface LeaderboardEntry {
  id: number;
  username: string;
  avatar?: string;
  score: number;
  position: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  entries?: LeaderboardEntry[];
  loading?: boolean;
}

export function Leaderboard({ entries = [], loading = false }: LeaderboardProps) {
  if (loading) {
    return (
      <GlassCard variant="elevated" padding="lg">
        <GlassCardHeader>
          <GlassCardTitle level={2}>Таблица лидеров</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-12 glass-bg-secondary rounded-lg" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="elevated" padding="lg">
      <GlassCardHeader>
        <GlassCardTitle level={2}>Таблица лидеров</GlassCardTitle>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.isCurrentUser
                  ? 'glass-bg-accent-orange-500/20 glass-border-accent-orange-500'
                  : 'glass-bg-secondary'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  entry.position <= 3 ? 'glass-bg-accent-orange-500' : 'glass-bg-primary'
                }`}>
                  {entry.position <= 3 ? '🏆' : entry.position}
                </div>
                {entry.avatar ? (
                  <img src={entry.avatar} alt={entry.username} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 glass-bg-primary rounded-full flex items-center justify-center text-sm font-semibold">
                    {entry.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="glass-text-primary font-medium">
                  {entry.username}
                </span>
              </div>
              <div className="text-right">
                <div className="glass-text-secondary text-sm">
                  {entry.score.toLocaleString()} очков
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
