import React from 'react';

interface AnalyticsChartProps {
  data?: any[];
  loading?: boolean;
  type?: 'line' | 'bar' | 'pie' | 'users' | 'videos' | 'revenue';
  period?: 'day' | 'week' | 'month' | 'year';
}

export function AnalyticsChart({ data = [], loading = false, type = 'line' }: AnalyticsChartProps) {
  if (loading) {
    return (
      <div className="w-full h-64 glass-bg-secondary rounded-lg animate-pulse flex items-center justify-center">
        <span className="glass-text-muted">Загрузка графика...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-64 glass-bg-secondary rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-2">📊</div>
        <p className="glass-text-muted">График аналитики</p>
        <p className="glass-text-secondary text-sm mt-1">
          Данные: {data.length} записей
        </p>
      </div>
    </div>
  );
}
