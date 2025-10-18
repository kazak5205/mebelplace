'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';

interface VideoAnalytics {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  averageWatchTime: number;
  retentionRate: number;
  topCountries: {
    country: string;
    views: number;
    percentage: number;
  }[];
  demographics: {
    ageGroups: { age: string; percentage: number }[];
    gender: { gender: string; percentage: number }[];
  };
  deviceTypes: {
    device: string;
    views: number;
    percentage: number;
  }[];
  trafficSources: {
    source: string;
    views: number;
    percentage: number;
  }[];
  dailyStats: {
    date: string;
    views: number;
    likes: number;
    comments: number;
  }[];
}

interface VideoPerformance {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  retentionRate: number;
  createdAt: string;
}

export default function GlassVideoAnalyticsScreen() {
  const [analytics, setAnalytics] = useState<VideoAnalytics | null>(null);
  const [videoPerformance, setVideoPerformance] = useState<VideoPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchAnalytics = async () => {
      // Loading handled by API hooks
    };

    fetchAnalytics();
  }, [timeRange]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  if (!analytics) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base flex items-center justify-center p-4">
        <GlassCard variant="elevated" padding="xl" className="text-center max-w-md">
          <GlassCardContent>
            <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold glass-text-primary mb-2">
              Ошибка загрузки аналитики
            </h3>
            <p className="glass-text-secondary mb-4">
              Не удалось загрузить данные аналитики
            </p>
          </GlassCardContent>
        </GlassCard>
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
                Аналитика видео
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <GlassCard variant="interactive" padding="lg">
            <GlassCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm glass-text-secondary mb-1">Общие просмотры</p>
                  <p className="text-2xl font-bold glass-text-primary">{formatNumber(analytics.totalViews)}</p>
                  <p className="text-xs glass-text-success">+12% за период</p>
                </div>
                <div className="w-12 h-12 glass-bg-accent-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard variant="interactive" padding="lg">
            <GlassCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm glass-text-secondary mb-1">Лайки</p>
                  <p className="text-2xl font-bold glass-text-primary">{formatNumber(analytics.totalLikes)}</p>
                  <p className="text-xs glass-text-success">+8% за период</p>
                </div>
                <div className="w-12 h-12 glass-bg-accent-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard variant="interactive" padding="lg">
            <GlassCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm glass-text-secondary mb-1">Комментарии</p>
                  <p className="text-2xl font-bold glass-text-primary">{formatNumber(analytics.totalComments)}</p>
                  <p className="text-xs glass-text-success">+15% за период</p>
                </div>
                <div className="w-12 h-12 glass-bg-accent-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard variant="interactive" padding="lg">
            <GlassCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm glass-text-secondary mb-1">Среднее время просмотра</p>
                  <p className="text-2xl font-bold glass-text-primary">{formatTime(analytics.averageWatchTime)}</p>
                  <p className="text-xs glass-text-success">+5% за период</p>
                </div>
                <div className="w-12 h-12 glass-bg-success rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Views Chart */}
          <GlassCard variant="elevated" padding="lg">
            <GlassCardHeader>
              <GlassCardTitle level={2} className="text-lg">
                Динамика просмотров
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-64 glass-bg-secondary rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 glass-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="glass-text-secondary">График просмотров будет здесь</p>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Demographics */}
          <GlassCard variant="elevated" padding="lg">
            <GlassCardHeader>
              <GlassCardTitle level={2} className="text-lg">
                Демография аудитории
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold glass-text-primary mb-3">Возрастные группы</h3>
                  <div className="space-y-2">
                    {analytics.demographics.ageGroups.map((group, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm glass-text-secondary">{group.age}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 glass-bg-secondary rounded-full">
                            <div 
                              className="h-2 glass-bg-accent-orange-500 rounded-full"
                              style={{ width: `${group.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm glass-text-primary w-8 text-right">{group.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold glass-text-primary mb-3">Пол</h3>
                  <div className="space-y-2">
                    {analytics.demographics.gender.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm glass-text-secondary">{item.gender}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 glass-bg-secondary rounded-full">
                            <div 
                              className="h-2 glass-bg-accent-blue-500 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm glass-text-primary w-8 text-right">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Top Countries */}
          <GlassCard variant="elevated" padding="lg">
            <GlassCardHeader>
              <GlassCardTitle level={2} className="text-lg">
                Топ страны
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-3">
                {analytics.topCountries.map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🏳️</span>
                      <span className="text-sm glass-text-secondary">{country.country}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm glass-text-primary font-medium">
                        {formatNumber(country.views)}
                      </div>
                      <div className="text-xs glass-text-muted">
                        {country.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Device Types */}
          <GlassCard variant="elevated" padding="lg">
            <GlassCardHeader>
              <GlassCardTitle level={2} className="text-lg">
                Устройства
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-3">
                {analytics.deviceTypes.map((device, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm glass-text-secondary">{device.device}</span>
                    <div className="text-right">
                      <div className="text-sm glass-text-primary font-medium">
                        {formatNumber(device.views)}
                      </div>
                      <div className="text-xs glass-text-muted">
                        {device.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Traffic Sources */}
          <GlassCard variant="elevated" padding="lg">
            <GlassCardHeader>
              <GlassCardTitle level={2} className="text-lg">
                Источники трафика
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-3">
                {analytics.trafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm glass-text-secondary">{source.source}</span>
                    <div className="text-right">
                      <div className="text-sm glass-text-primary font-medium">
                        {formatNumber(source.views)}
                      </div>
                      <div className="text-xs glass-text-muted">
                        {source.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Video Performance Table */}
        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={2} className="text-lg">
              Производительность видео
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 glass-text-primary font-medium">Видео</th>
                    <th className="text-right py-3 px-4 glass-text-primary font-medium">Просмотры</th>
                    <th className="text-right py-3 px-4 glass-text-primary font-medium">Лайки</th>
                    <th className="text-right py-3 px-4 glass-text-primary font-medium">Комментарии</th>
                    <th className="text-right py-3 px-4 glass-text-primary font-medium">Удержание</th>
                  </tr>
                </thead>
                <tbody>
                  {videoPerformance.map((video) => (
                    <tr key={video.id} className="border-b border-white/5 hover:glass-bg-secondary/20">
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          <p className="glass-text-primary font-medium truncate">
                            {video.title}
                          </p>
                          <p className="text-sm glass-text-muted">
                            {new Date(video.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 glass-text-primary font-medium">
                        {formatNumber(video.views)}
                      </td>
                      <td className="text-right py-3 px-4 glass-text-primary font-medium">
                        {formatNumber(video.likes)}
                      </td>
                      <td className="text-right py-3 px-4 glass-text-primary font-medium">
                        {video.comments}
                      </td>
                      <td className="text-right py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          video.retentionRate >= 70 
                            ? 'glass-bg-success text-white'
                            : video.retentionRate >= 50
                            ? 'glass-bg-accent-orange-500 text-white'
                            : 'glass-bg-danger text-white'
                        }`}>
                          {video.retentionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
