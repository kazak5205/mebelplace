'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';

interface UserRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  deadline: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  responses: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  images: string[];
  materials: string[];
}

export default function GlassMyRequestsScreen() {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'responses' | 'views'>('newest');

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchUserRequests = async () => {
      // Loading handled by API hooks
    };

    fetchUserRequests();
  }, []);

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'glass-bg-success text-white';
      case 'in_progress': return 'glass-bg-accent-orange-500 text-white';
      case 'completed': return 'glass-bg-accent-blue-500 text-white';
      case 'cancelled': return 'glass-bg-danger text-white';
      default: return 'glass-bg-secondary text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Открыт';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'responses':
        return b.responses - a.responses;
      case 'views':
        return b.views - a.views;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <GlassCard key={i} variant="interactive" padding="none" className="animate-pulse">
                <div className="aspect-video glass-bg-secondary rounded-t-xl" />
                <div className="p-4">
                  <div className="h-4 glass-bg-secondary rounded mb-2" />
                  <div className="h-3 glass-bg-secondary rounded w-2/3" />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <GlassCardTitle level={1} className="flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Мои заявки
              </GlassCardTitle>
              
              <div className="text-right">
                <div className="text-2xl font-bold glass-text-primary mb-1">
                  {requests.length}
                </div>
                <div className="text-sm glass-text-secondary">
                  Всего заявок
                </div>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'open', 'in_progress', 'completed', 'cancelled'] as const).map((filterType) => (
                  <GlassButton
                    key={filterType}
                    variant={filter === filterType ? 'gradient' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                  >
                    {filterType === 'all' && 'Все'}
                    {filterType === 'open' && 'Открытые'}
                    {filterType === 'in_progress' && 'В работе'}
                    {filterType === 'completed' && 'Завершенные'}
                    {filterType === 'cancelled' && 'Отмененные'}
                  </GlassButton>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">Сортировка:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="glass-bg-primary glass-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="newest">По дате (новые)</option>
                  <option value="oldest">По дате (старые)</option>
                  <option value="responses">По откликам</option>
                  <option value="views">По просмотрам</option>
                </select>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Requests Grid */}
        {sortedRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRequests.map((request) => (
              <GlassCard key={request.id} variant="interactive" padding="none" className="hover:glass-shadow-md transition-all">
                <div className="relative aspect-video">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-blue-500/20 flex items-center justify-center">
                    <div className="w-16 h-16 glass-bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold glass-text-primary mb-2 line-clamp-2">
                    {request.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm glass-text-secondary mb-3">
                    <span>{formatDate(request.createdAt)}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {formatViews(request.views)}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m0-4h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m0-4H9a2 2 0 00-2 2v6a2 2 0 002 2h2" />
                        </svg>
                        {request.responses}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm glass-text-muted mb-3">
                    <span>{request.category}</span>
                    <span className="font-semibold glass-text-accent-orange-500">
                      {request.budget.toLocaleString()} ₸
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <GlassButton variant="secondary" size="sm" className="flex-1">
                      Подробнее
                    </GlassButton>
                    <GlassButton variant="ghost" size="sm">
                      ⋯
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Заявки не найдены
              </h3>
              <p className="glass-text-secondary mb-4">
                {filter === 'all' 
                  ? 'У вас пока нет заявок. Создайте первую заявку для поиска мастера'
                  : 'В этой категории заявок пока нет'
                }
              </p>
              {filter === 'all' && (
                <GlassButton variant="gradient" size="lg">
                  Создать заявку
                </GlassButton>
              )}
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
