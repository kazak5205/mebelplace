import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

interface AnalyticsData {
  period: string;
  event_type: string;
  count: number;
  avg_duration: number;
  avg_completion: number;
}

interface AnalyticsDashboardProps {}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedGroupBy, setSelectedGroupBy] = useState('day');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod, selectedGroupBy]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<any>('/admin/analytics/videos', {
        period: selectedPeriod,
        groupBy: selectedGroupBy
      });
      // Parse strings to numbers from PostgreSQL
      const parsedData = (response || []).map((item: any) => ({
        ...item,
        count: Number(item.count) || 0,
        avg_duration: Number(item.avg_duration) || 0,
        avg_completion: Number(item.avg_completion) || 0
      }));
      setAnalytics(parsedData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    switch (selectedGroupBy) {
      case 'hour':
        return date.toLocaleString('ru-RU', { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit' 
        });
      case 'day':
        return date.toLocaleDateString('ru-RU', { 
          month: 'short', 
          day: 'numeric' 
        });
      case 'week':
        return `Неделя ${Math.ceil(date.getDate() / 7)}`;
      default:
        return date.toLocaleDateString('ru-RU');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getEventTypeLabel = (eventType: string) => {
    const labels: { [key: string]: string } = {
      'view': 'Просмотры',
      'like': 'Лайки',
      'share': 'Поделились',
      'comment': 'Комментарии',
      'complete': 'Досмотрели',
      'skip': 'Пропустили'
    };
    return labels[eventType] || eventType;
  };

  const getEventTypeColor = (eventType: string) => {
    const colors: { [key: string]: string } = {
      'view': 'bg-blue-500',
      'like': 'bg-red-500',
      'share': 'bg-green-500',
      'comment': 'bg-yellow-500',
      'complete': 'bg-orange-500',
      'skip': 'bg-gray-7000'
    };
    return colors[eventType] || 'bg-gray-7000';
  };

  // Group data by period for chart display
  const groupedData = analytics.reduce((acc, item) => {
    if (!acc[item.period]) {
      acc[item.period] = {};
    }
    acc[item.period][item.event_type] = item;
    return acc;
  }, {} as { [key: string]: { [key: string]: AnalyticsData } });

  const periods = Object.keys(groupedData).sort();

  // Calculate totals
  const totals = analytics.reduce((acc, item) => {
    if (!acc[item.event_type]) {
      acc[item.event_type] = {
        count: 0,
        avg_duration: 0,
        avg_completion: 0
      };
    }
    acc[item.event_type].count += item.count;
    acc[item.event_type].avg_duration += item.avg_duration;
    acc[item.event_type].avg_completion += item.avg_completion;
    return acc;
  }, {} as { [key: string]: { count: number; avg_duration: number; avg_completion: number } });

  // Calculate averages
  Object.keys(totals).forEach(eventType => {
    const eventData = analytics.filter(item => item.event_type === eventType);
    if (eventData.length > 0) {
      totals[eventType].avg_duration = totals[eventType].avg_duration / eventData.length;
      totals[eventType].avg_completion = totals[eventType].avg_completion / eventData.length;
    }
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-600 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-600 h-24 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Аналитика видео</h2>
        <div className="flex space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="1d">Последние 24 часа</option>
            <option value="7d">Последние 7 дней</option>
            <option value="30d">Последние 30 дней</option>
            <option value="90d">Последние 90 дней</option>
          </select>
          <select
            value={selectedGroupBy}
            onChange={(e) => setSelectedGroupBy(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="hour">По часам</option>
            <option value="day">По дням</option>
            <option value="week">По неделям</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Object.entries(totals).map(([eventType, data]) => (
          <div key={eventType} className="bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full ${getEventTypeColor(eventType)} mr-3`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-300">{getEventTypeLabel(eventType)}</p>
                <p className="text-2xl font-bold text-white">{data.count.toLocaleString()}</p>
              </div>
            </div>
            {eventType === 'view' && (
              <div className="mt-4 text-sm text-gray-400">
                <p>Ср. время просмотра: {formatDuration(Number(data.avg_duration) || 0)}</p>
                <p>Ср. завершение: {Number(data.avg_completion || 0).toFixed(1)}%</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-gray-800 rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Динамика событий</h3>
        </div>
        <div className="p-6">
          {periods.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Нет данных за выбранный период
            </div>
          ) : (
            <div className="space-y-4">
              {periods.map((period) => (
                <div key={period} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{formatDate(period)}</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(groupedData[period]).map(([eventType, data]) => (
                      <div key={eventType} className="text-center">
                        <div className={`w-3 h-3 rounded-full ${getEventTypeColor(eventType)} mx-auto mb-1`}></div>
                        <p className="text-xs text-gray-300">{getEventTypeLabel(eventType)}</p>
                        <p className="text-sm font-semibold text-white">{data.count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Детальная статистика</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Период
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Событие
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Количество
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Среднее время
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Среднее завершение
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {analytics.map((item, index) => (
                <tr key={index} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {formatDate(item.period)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getEventTypeColor(item.event_type)} mr-2`}></div>
                      <span className="text-sm text-white">{getEventTypeLabel(item.event_type)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {item.count.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {formatDuration(Number(item.avg_duration) || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {Number(item.avg_completion || 0).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
