import React from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass';

interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
}

interface DashboardStatsProps {
  stats?: StatCard[];
  loading?: boolean;
}

export function DashboardStats({ stats = [], loading = false }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} variant="elevated" padding="lg">
            <GlassCardContent>
              <div className="animate-pulse">
                <div className="h-4 glass-bg-secondary rounded mb-2" />
                <div className="h-8 glass-bg-secondary rounded mb-2" />
                <div className="h-3 glass-bg-secondary rounded w-1/2" />
              </div>
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <GlassCard key={index} variant="elevated" padding="lg">
          <GlassCardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="glass-text-secondary text-sm font-medium">{stat.title}</p>
                <p className="glass-text-primary text-2xl font-bold mt-1">{stat.value}</p>
                {stat.change && (
                  <p className={`text-sm mt-1 ${
                    stat.trend === 'up' ? 'glass-text-success' : 
                    stat.trend === 'down' ? 'glass-text-danger' : 
                    'glass-text-muted'
                  }`}>
                    {stat.change}
                  </p>
                )}
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </GlassCardContent>
        </GlassCard>
      ))}
    </div>
  );
}
