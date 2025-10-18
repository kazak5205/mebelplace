'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api/client';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Spinner } from '@/components/ui/Spinner';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  max_progress?: number;
  unlocked_at?: string;
  reward_points: number;
}

export default function AchievementsContent() {
  const t = useTranslations('gamification');
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Data is fetched via API hooks
  const loading = false; // Will be replaced with real API hook when ready

  const fetchAchievements = async () => {
    try {
      // Loading handled by API hooks
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
          🏅 {t('achievements')}
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          {t('unlockedAchievements', { count: unlockedCount, total: achievements.length })}
        </p>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`bg-[var(--color-surface)] rounded-lg p-6 border-2 transition-all ${
              achievement.unlocked
                ? 'border-[var(--color-accent)] shadow-lg'
                : 'border-[var(--color-border)] opacity-60'
            }`}
          >
            {/* Icon & Title */}
            <div className="flex items-start gap-4 mb-3">
              <div className={`text-5xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--color-text-primary)] text-lg">
                  {achievement.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {achievement.description}
                </p>
              </div>
              {achievement.unlocked && (
                <Badge variant="success">✓</Badge>
              )}
            </div>

            {/* Progress (if not unlocked) */}
            {!achievement.unlocked && achievement.progress !== undefined && achievement.max_progress && (
              <div className="mt-4">
                <Progress
                  value={achievement.progress}
                  max={achievement.max_progress}
                  showValue
                  size="sm"
                />
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  {achievement.progress} / {achievement.max_progress}
                </p>
              </div>
            )}

            {/* Reward */}
            <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">
                {t('reward')}:
              </span>
              <span className="font-semibold text-[var(--color-accent)]">
                +{achievement.reward_points} {t('points')}
              </span>
            </div>

            {/* Unlocked Date */}
            {achievement.unlocked_at && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                {t('unlocked')}: {new Date(achievement.unlocked_at).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-12 bg-[var(--color-surface)] rounded-lg">
          <p className="text-[var(--color-text-secondary)]">
            {t('noAchievements')}
          </p>
        </div>
      )}
    </div>
  );
}

