'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';

interface Request {
  id: string;
  title: string;
  description: string;
  author: string;
  budget: number;
  location: string;
  category: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  responses: number;
  views: number;
  createdAt: string;
  deadline?: string;
  images?: string[];
}

export default function GlassRequestScreen() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'my_requests'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'budget' | 'responses'>('newest');

  // Data is fetched via API hooks
  const loading = false; // Will be replaced with real API hook when ready

  useEffect(() => {
    // Data is fetched via API hooks
    const fetchRequests = async () => {
      // Loading handled by API hooks
    };

    fetchRequests();
  }, [filter, sortBy]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}ч назад`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}д назад`;
    return date.toLocaleDateString('ru-RU');
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

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <GlassCard key={i} variant="interactive" padding="lg" className="animate-pulse">
                <div className="h-6 glass-bg-secondary rounded mb-2" />
                <div className="h-4 glass-bg-secondary rounded w-2/3 mb-4" />
                <div className="h-4 glass-bg-secondary rounded w-1/2" />
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
                Заявки
              </GlassCardTitle>
              
              <GlassButton variant="gradient" size="lg">
                Создать заявку
              </GlassButton>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'open', 'my_requests'] as const).map((filterType) => (
                  <GlassButton
                    key={filterType}
                    variant={filter === filterType ? 'gradient' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                  >
                    {filterType === 'all' && 'Все заявки'}
                    {filterType === 'open' && 'Открытые'}
                    {filterType === 'my_requests' && 'Мои заявки'}
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
                  <option value="newest">По дате</option>
                  <option value="budget">По бюджету</option>
                  <option value="responses">По откликам</option>
                </select>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Requests List */}
        <div className="space-y-6">
          {requests.map((request) => (
            <GlassCard key={request.id} variant="interactive" padding="lg" className="hover:glass-shadow-md transition-all">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Content */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-semibold glass-text-primary mb-2">
                        {request.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm glass-text-secondary mb-2">
                        <span>{request.author}</span>
                        <span>•</span>
                        <span>{request.location}</span>
                        <span>•</span>
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                  </div>

                  <p className="glass-text-secondary mb-4 line-clamp-3">
                    {request.description}
                  </p>

                  {/* Tags and Stats */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 glass-bg-accent-blue-500 text-white rounded-full text-xs font-medium">
                        {request.category}
                      </span>
                      
                      <div className="flex items-center gap-4 text-sm glass-text-muted">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {request.responses} откликов
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {request.views} просмотров
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold glass-text-accent-orange-500 mb-1">
                        {request.budget.toLocaleString()} ₸
                      </div>
                      {request.deadline && (
                        <div className="text-xs glass-text-muted">
                          До {new Date(request.deadline).toLocaleDateString('ru-RU')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:w-48">
                  <GlassButton variant="gradient" size="md" className="w-full">
                    Откликнуться
                  </GlassButton>
                  <GlassButton variant="secondary" size="md" className="w-full">
                    Подробнее
                  </GlassButton>
                  <GlassButton variant="ghost" size="sm" className="w-full">
                    Сохранить
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Empty State */}
        {requests.length === 0 && (
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
                Попробуйте изменить фильтры или создайте новую заявку
              </p>
              <GlassButton variant="gradient" size="lg">
                Создать заявку
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
