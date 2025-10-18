'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton, GlassInput } from '@/components/ui/glass';

export default function GlassAdminLogsScreen() {
  const [logLevel, setLogLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const logLevels = [
    {id: 'all', name: 'Все', color: 'glass-text-primary'},
    {id: 'error', name: 'Ошибки', color: 'glass-text-danger'},
    {id: 'warning', name: 'Предупреждения', color: 'glass-text-accent-orange-500'},
    {id: 'info', name: 'Информация', color: 'glass-text-accent-blue-500'},
    {id: 'debug', name: 'Отладка', color: 'glass-text-muted'}
  ];

  const logs = [
    {id: '1', level: 'error', message: 'Failed to process payment', timestamp: '2024-01-15 14:30:25', source: 'payment-service', userId: 'user123'},
    {id: '2', level: 'warning', message: 'High memory usage detected', timestamp: '2024-01-15 14:25:10', source: 'monitoring', userId: null},
    {id: '3', level: 'info', message: 'User logged in successfully', timestamp: '2024-01-15 14:20:05', source: 'auth-service', userId: 'user456'},
    {id: '4', level: 'error', message: 'Database connection timeout', timestamp: '2024-01-15 14:15:30', source: 'database', userId: null},
    {id: '5', level: 'info', message: 'Order created successfully', timestamp: '2024-01-15 14:10:15', source: 'order-service', userId: 'user789'}
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'glass-text-danger';
      case 'warning': return 'glass-text-accent-orange-500';
      case 'info': return 'glass-text-accent-blue-500';
      case 'debug': return 'glass-text-muted';
      default: return 'glass-text-primary';
    }
  };

  const getLevelBgColor = (level: string) => {
    switch (level) {
      case 'error': return 'glass-bg-danger';
      case 'warning': return 'glass-bg-accent-orange-500';
      case 'info': return 'glass-bg-accent-blue-500';
      case 'debug': return 'glass-bg-muted';
      default: return 'glass-bg-secondary';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesLevel = logLevel === 'all' || log.level === logLevel;
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto">
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <GlassCardTitle level={1}>Системные логи</GlassCardTitle>
              <div className="flex gap-3">
                <GlassInput
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  placeholder="Поиск по логам..."
                  className="min-w-[300px]"
                />
                <GlassButton variant="gradient">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Обновить
                </GlassButton>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-2">
              {logLevels.map(level => (
                <GlassButton
                  key={level.id}
                  variant={logLevel === level.id ? 'gradient' : 'ghost'}
                  size="sm"
                  onClick={() => setLogLevel(level.id)}
                >
                  {level.name}
                </GlassButton>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard variant="elevated" padding="none" className="overflow-hidden">
          <GlassCardHeader className="border-b border-white/10">
            <GlassCardTitle level={2}>Логи системы</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="max-h-96 overflow-y-auto">
              {filteredLogs.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {filteredLogs.map(log => (
                    <div key={log.id} className="p-4 hover:glass-bg-secondary/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getLevelBgColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm glass-text-muted font-mono">
                              {log.timestamp}
                            </span>
                            <span className="text-sm glass-text-secondary">
                              {log.source}
                            </span>
                            {log.userId && (
                              <span className="text-sm glass-text-accent-blue-500">
                                User: {log.userId}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${getLevelColor(log.level)} font-mono`}>
                            {log.message}
                          </p>
                        </div>
                        <GlassButton variant="ghost" size="sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </GlassButton>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold glass-text-primary mb-2">
                    Логи не найдены
                  </h3>
                  <p className="glass-text-secondary">
                    Попробуйте изменить фильтры или поисковый запрос
                  </p>
                </div>
              )}
            </div>
          </GlassCardContent>
        </GlassCard>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm glass-text-muted">
            Показано {filteredLogs.length} из {logs.length} записей
          </div>
          <div className="flex gap-2">
            <GlassButton variant="secondary" size="sm">
              Экспорт логов
            </GlassButton>
            <GlassButton variant="ghost" size="sm">
              Очистить старые логи
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
}
