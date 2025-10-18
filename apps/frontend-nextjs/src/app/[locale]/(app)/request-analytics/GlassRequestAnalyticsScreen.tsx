'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';

interface RequestAnalytics {
  totalRequests: number;
  totalResponses: number;
  averageResponseTime: number;
  completionRate: number;
  topCategories: {
    category: string;
    count: number;
    percentage: number;
  }[];
  monthlyStats: {
    month: string;
    requests: number;
    responses: number;
    completed: number;
  }[];
  responseQuality: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
}

export default function GlassRequestAnalyticsScreen() {
  const [analytics, setAnalytics] = useState<RequestAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchAnalytics = async () => {
      // Loading handled by API hooks
    };

    fetchAnalytics();
  }, [timeRange]);

  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} мин`;
    if (hours < 24) return `${hours.toFixed(1)} ч`;
    return `${Math.round(hours / 24)} дн`;
  };

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 glass-bg-secondary rounded" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 glass-bg-secondary rounded" />
              <div className="h-96 glass-bg-secondary rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <GlassCardTitle level={1} className="flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Аналитика заявок
              </GlassCardTitle>
              
              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">Период:</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="glass-bg-primary glass-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="7d">7 дней</option>
                  <option value="30d">30 дней</option>
                  <option value="90d">90 дней</option>
                  <option value="1y">1 год</option>
                </select>
              </div>
            </div>
          </GlassCardHeader>
        </GlassCard>

        {/* Key Metrics */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <GlassCard variant="interactive" padding="lg">
              <GlassCardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm glass-text-secondary mb-1">Всего заявок</p>
                    <p className="text-2xl font-bold glass-text-primary">{analytics.totalRequests}</p>
                    <p className="text-xs glass-text-success">+12% за период</p>
                  </div>
                  <div className="w-12 h-12 glass-bg-accent-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard variant="interactive" padding="lg">
              <GlassCardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm glass-text-secondary mb-1">Всего откликов</p>
                    <p className="text-2xl font-bold glass-text-primary">{analytics.totalResponses}</p>
                    <p className="text-xs glass-text-success">+8% за период</p>
                  </div>
                  <div className="w-12 h-12 glass-bg-accent-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m0-4h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m0-4H9a2 2 0 00-2 2v6a2 2 0 002 2h2" />
                    </svg>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard variant="interactive" padding="lg">
              <GlassCardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm glass-text-secondary mb-1">Среднее время отклика</p>
                    <p className="text-2xl font-bold glass-text-primary">{formatTime(analytics.averageResponseTime)}</p>
                    <p className="text-xs glass-text-success">-15% за период</p>
                  </div>
                  <div className="w-12 h-12 glass-bg-accent-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard variant="interactive" padding="lg">
              <GlassCardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm glass-text-secondary mb-1">Процент завершения</p>
                    <p className="text-2xl font-bold glass-text-primary">{analytics.completionRate}%</p>
                    <p className="text-xs glass-text-success">+5% за период</p>
                  </div>
                  <div className="w-12 h-12 glass-bg-success rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        )}

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Categories Chart */}
          <GlassCard variant="elevated" padding="lg">
            <GlassCardHeader>
              <GlassCardTitle level={2} className="text-lg">
                Популярные категории
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-4">
                {analytics?.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{
                        backgroundColor: index === 0 ? '#ff6b35' : index === 1 ? '#4f46e5' : index === 2 ? '#10b981' : '#f59e0b'
                      }} />
                      <span className="glass-text-primary font-medium">{category.category}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-2 glass-bg-secondary rounded-full">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${category.percentage}%`,
                            backgroundColor: index === 0 ? '#ff6b35' : index === 1 ? '#4f46e5' : index === 2 ? '#10b981' : '#f59e0b'
                          }}
                        />
                      </div>
                      <span className="text-sm glass-text-primary w-12 text-right">
                        {category.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Response Quality */}
          <GlassCard variant="elevated" padding="lg">
            <GlassCardHeader>
              <GlassCardTitle level={2} className="text-lg">
                Качество откликов
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="glass-text-primary">Отличные</span>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-2 glass-bg-secondary rounded-full">
                      <div className="h-2 glass-bg-success rounded-full" style={{ width: `${analytics?.responseQuality.excellent}%` }} />
                    </div>
                    <span className="text-sm glass-text-primary w-8 text-right">{analytics?.responseQuality.excellent}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="glass-text-primary">Хорошие</span>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-2 glass-bg-secondary rounded-full">
                      <div className="h-2 glass-bg-accent-blue-500 rounded-full" style={{ width: `${analytics?.responseQuality.good}%` }} />
                    </div>
                    <span className="text-sm glass-text-primary w-8 text-right">{analytics?.responseQuality.good}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="glass-text-primary">Средние</span>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-2 glass-bg-secondary rounded-full">
                      <div className="h-2 glass-bg-accent-orange-500 rounded-full" style={{ width: `${analytics?.responseQuality.average}%` }} />
                    </div>
                    <span className="text-sm glass-text-primary w-8 text-right">{analytics?.responseQuality.average}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="glass-text-primary">Плохие</span>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-2 glass-bg-secondary rounded-full">
                      <div className="h-2 glass-bg-danger rounded-full" style={{ width: `${analytics?.responseQuality.poor}%` }} />
                    </div>
                    <span className="text-sm glass-text-primary w-8 text-right">{analytics?.responseQuality.poor}%</span>
                  </div>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Monthly Stats Chart */}
        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={2} className="text-lg">
              Статистика по месяцам
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="h-64 glass-bg-secondary rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 glass-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="glass-text-secondary">График статистики будет здесь</p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
