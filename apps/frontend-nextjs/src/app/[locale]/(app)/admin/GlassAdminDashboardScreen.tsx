'use client';

import React, { useState } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';
import { usePlatformAnalytics } from '@/lib/api/hooks';

interface GlassAdminDashboardScreenProps {}

export default function GlassAdminDashboardScreen() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orders' | 'requests' | 'analytics' | 'settings'>('overview');
  
  // API hooks
  const { data: platformStats, loading: platformLoading, error: platformError } = usePlatformAnalytics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  if (platformLoading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 glass-bg-secondary rounded" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 glass-bg-secondary rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (platformError) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-6">
        <div className="max-w-7xl mx-auto">
          <GlassCard variant="elevated" padding="lg">
            <GlassCardContent>
              <div className="text-center">
                <h2 className="text-xl font-semibold glass-text-primary mb-4">
                  Ошибка загрузки данных
                </h2>
                <p className="glass-text-secondary mb-6">
                  Не удалось загрузить данные админ панели
                </p>
                <GlassButton variant="gradient" onClick={() => window.location.reload()}>
                  Перезагрузить
                </GlassButton>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle level={1} className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Админ панель
            </GlassCardTitle>
          </GlassCardHeader>
        </GlassCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <GlassCard variant="elevated" padding="lg">
            <GlassCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-secondary text-sm">Всего пользователей</p>
                  <p className="text-2xl font-bold glass-text-primary">
                     {formatNumber((platformStats as any)?.total_users || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 glass-bg-info rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard variant="elevated" padding="lg">
            <GlassCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-secondary text-sm">Всего заказов</p>
                  <p className="text-2xl font-bold glass-text-primary">
                     {formatNumber((platformStats as any)?.total_orders || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 glass-bg-success rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard variant="elevated" padding="lg">
            <GlassCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-secondary text-sm">Общая выручка</p>
                  <p className="text-2xl font-bold glass-text-primary">
                     {formatCurrency(0)}
                  </p>
                </div>
                <div className="w-12 h-12 glass-bg-warning rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard variant="elevated" padding="lg">
            <GlassCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-secondary text-sm">Активные заявки</p>
                  <p className="text-2xl font-bold glass-text-primary">
                    {formatNumber((platformStats as any)?.active_requests || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 glass-bg-danger rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Content based on active tab */}
        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <div className="flex flex-wrap gap-2">
              {(['overview', 'users', 'orders', 'requests', 'analytics', 'settings'] as const).map((tab) => (
                <GlassButton
                  key={tab}
                  variant={activeTab === tab ? 'gradient' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'overview' && 'Обзор'}
                  {tab === 'users' && 'Пользователи'}
                  {tab === 'orders' && 'Заказы'}
                  {tab === 'requests' && 'Заявки'}
                  {tab === 'analytics' && 'Аналитика'}
                  {tab === 'settings' && 'Настройки'}
                </GlassButton>
              ))}
            </div>
          </GlassCardHeader>
          
          <GlassCardContent>
            {activeTab === 'overview' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold glass-text-primary mb-2">
                  Добро пожаловать в админ панель
                </h3>
                <p className="glass-text-secondary">
                  Здесь вы можете управлять платформой MebelPlace
                </p>
              </div>
            )}
            
            {activeTab !== 'overview' && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold glass-text-primary mb-2">
                  Раздел в разработке
                </h3>
                <p className="glass-text-secondary">
                  Функционал {activeTab} будет добавлен в следующих обновлениях
                </p>
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}