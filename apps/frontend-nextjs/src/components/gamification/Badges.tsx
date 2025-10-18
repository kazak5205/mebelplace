import React from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earned_at?: string;
}

interface BadgesProps {
  badges?: Badge[];
  loading?: boolean;
}

export function Badges({ badges = [], loading = false }: BadgesProps) {
  if (loading) {
    return (
      <GlassCard variant="elevated" padding="lg">
        <GlassCardHeader>
          <GlassCardTitle level={2}>Достижения</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 glass-bg-secondary rounded-lg" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="elevated" padding="lg">
      <GlassCardHeader>
        <GlassCardTitle level={2}>Достижения</GlassCardTitle>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                badge.earned
                  ? 'glass-bg-success glass-border-success'
                  : 'glass-bg-secondary glass-border opacity-50'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{badge.icon}</div>
                <h3 className="font-semibold glass-text-primary mb-1">{badge.name}</h3>
                <p className="text-sm glass-text-secondary">{badge.description}</p>
                {badge.earned_at && (
                  <p className="text-xs glass-text-muted mt-2">
                    Получено: {new Date(badge.earned_at).toLocaleDateString('ru-RU')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
