'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton } from '@/components/ui/glass';

export default function GlassAdminAnalyticsScreen() {
  const [timeRange, setTimeRange] = useState('7d');
  
  const stats = [
    {label: 'Всего пользователей', value: '12,547', change: '+12%'},
    {label: 'Активные заказы', value: '3,421', change: '+8%'},
    {label: 'Выручка', value: '₸45.2M', change: '+15%'},
    {label: 'Конверсия', value: '3.2%', change: '+2%'}
  ];

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto">
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <GlassCardTitle level={1}>Аналитика</GlassCardTitle>
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="glass-bg-primary glass-border rounded-lg px-3 py-2 text-white">
                <option value="7d">7 дней</option>
                <option value="30d">30 дней</option>
                <option value="90d">90 дней</option>
              </select>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold glass-text-accent-orange-500 mb-2">{stat.value}</div>
                  <div className="glass-text-primary font-medium mb-1">{stat.label}</div>
                  <div className="text-sm glass-text-success">{stat.change}</div>
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard variant="elevated" padding="lg">
            <GlassCardHeader>
              <GlassCardTitle level={2}>График пользователей</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-64 glass-bg-secondary rounded-lg flex items-center justify-center">
                <span className="glass-text-muted">График будет здесь</span>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard variant="elevated" padding="lg">
            <GlassCardHeader>
              <GlassCardTitle level={2}>Топ категории</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-3">
                {['Мебель для кухни', 'Спальня', 'Гостиная', 'Офисная мебель'].map((cat, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="glass-text-primary">{cat}</span>
                    <span className="glass-text-secondary">{85-i*15}%</span>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}