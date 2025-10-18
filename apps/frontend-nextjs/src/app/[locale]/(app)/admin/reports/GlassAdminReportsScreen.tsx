'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton } from '@/components/ui/glass';

export default function GlassAdminReportsScreen() {
  const [reportType, setReportType] = useState('orders');
  const [dateRange, setDateRange] = useState('30d');

  const reportTypes = [
    {id: 'orders', name: 'Заказы', icon: '📦'},
    {id: 'users', name: 'Пользователи', icon: '👥'},
    {id: 'payments', name: 'Платежи', icon: '💳'},
    {id: 'revenue', name: 'Доходы', icon: '💰'},
    {id: 'performance', name: 'Производительность', icon: '📊'}
  ];

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto">
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <GlassCardTitle level={1}>Отчеты</GlassCardTitle>
              <div className="flex gap-3">
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="glass-bg-primary glass-border rounded-lg px-3 py-2 text-white">
                  <option value="7d">7 дней</option>
                  <option value="30d">30 дней</option>
                  <option value="90d">90 дней</option>
                  <option value="1y">1 год</option>
                </select>
                <GlassButton variant="gradient">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Экспорт
                </GlassButton>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-2">
              {reportTypes.map(type => (
                <GlassButton
                  key={type.id}
                  variant={reportType === type.id ? 'gradient' : 'ghost'}
                  size="md"
                  onClick={() => setReportType(type.id)}
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.name}
                </GlassButton>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard variant="elevated" padding="lg">
            <GlassCardHeader>
              <GlassCardTitle level={2}>Статистика {reportTypes.find(t => t.id === reportType)?.name.toLowerCase()}</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-4">
                {reportType === 'orders' && (
                  <>
                    <div className="flex justify-between">
                      <span className="glass-text-secondary">Всего заказов:</span>
                      <span className="font-semibold glass-text-primary">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="glass-text-secondary">Выполнено:</span>
                      <span className="font-semibold glass-text-success">1,156 (92.7%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="glass-text-secondary">Отменено:</span>
                      <span className="font-semibold glass-text-danger">91 (7.3%)</span>
                    </div>
                  </>
                )}
                {reportType === 'users' && (
                  <>
                    <div className="flex justify-between">
                      <span className="glass-text-secondary">Новые пользователи:</span>
                      <span className="font-semibold glass-text-primary">234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="glass-text-secondary">Активные:</span>
                      <span className="font-semibold glass-text-success">1,456</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="glass-text-secondary">Мастера:</span>
                      <span className="font-semibold glass-text-accent-orange-500">89</span>
                    </div>
                  </>
                )}
                {reportType === 'payments' && (
                  <>
                    <div className="flex justify-between">
                      <span className="glass-text-secondary">Общий объем:</span>
                      <span className="font-semibold glass-text-primary">₸45.2M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="glass-text-secondary">Комиссия:</span>
                      <span className="font-semibold glass-text-accent-orange-500">₸2.26M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="glass-text-secondary">Средний чек:</span>
                      <span className="font-semibold glass-text-success">₸36,250</span>
                    </div>
                  </>
                )}
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard variant="elevated" padding="lg">
            <GlassCardHeader>
              <GlassCardTitle level={2}>График</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-64 glass-bg-secondary rounded-lg flex items-center justify-center">
                <span className="glass-text-muted">График будет здесь</span>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        <GlassCard variant="elevated" padding="lg" className="mt-6">
          <GlassCardHeader>
            <GlassCardTitle level={2}>Детальный отчет</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 glass-text-primary">Дата</th>
                    <th className="text-left py-3 glass-text-primary">Показатель</th>
                    <th className="text-left py-3 glass-text-primary">Значение</th>
                    <th className="text-left py-3 glass-text-primary">Изменение</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({length: 10}).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3 glass-text-secondary">2024-01-{15-i}</td>
                      <td className="py-3 glass-text-secondary">
                        {reportType === 'orders' ? 'Заказы' : 
                         reportType === 'users' ? 'Пользователи' : 
                         reportType === 'payments' ? 'Платежи' : 'Показатель'}
                      </td>
                      <td className="py-3 glass-text-primary font-medium">
                        {reportType === 'orders' ? (120 + i * 5) :
                         reportType === 'users' ? (50 + i * 3) :
                         reportType === 'payments' ? `₸${(2.5 + i * 0.2).toFixed(1)}M` : '100'}
                      </td>
                      <td className={`py-3 ${i % 3 === 0 ? 'glass-text-success' : 'glass-text-danger'}`}>
                        {i % 3 === 0 ? `+${5 + i}%` : `-${2 + i}%`}
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
