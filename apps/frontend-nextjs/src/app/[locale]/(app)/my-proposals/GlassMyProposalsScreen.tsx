'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';

interface Proposal {
  id: string;
  request: {
    id: string;
    title: string;
    description: string;
    budget: number;
    client: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
  price: number;
  timeline: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
  clientResponse?: {
    message: string;
    createdAt: string;
  };
}

export default function GlassMyProposalsScreen() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'withdrawn'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_low' | 'price_high'>('newest');

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchProposals = async () => {
      // Loading handled by API hooks
    };

    fetchProposals();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0
    }).format(amount);
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
      case 'pending': return 'glass-bg-accent-orange-500 text-white';
      case 'accepted': return 'glass-bg-success text-white';
      case 'rejected': return 'glass-bg-danger text-white';
      case 'withdrawn': return 'glass-bg-secondary text-white';
      default: return 'glass-bg-secondary text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'accepted': return 'Принято';
      case 'rejected': return 'Отклонено';
      case 'withdrawn': return 'Отозвано';
      default: return status;
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    if (filter === 'all') return true;
    return proposal.status === filter;
  });

  const sortedProposals = [...filteredProposals].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 glass-bg-secondary rounded" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Мои предложения
              </GlassCardTitle>
              
              <div className="text-right">
                <div className="text-2xl font-bold glass-text-primary mb-1">
                  {proposals.length}
                </div>
                <div className="text-sm glass-text-secondary">
                  Всего предложений
                </div>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'accepted', 'rejected', 'withdrawn'] as const).map((filterType) => (
                  <GlassButton
                    key={filterType}
                    variant={filter === filterType ? 'gradient' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                  >
                    {filterType === 'all' && 'Все'}
                    {filterType === 'pending' && 'Ожидают'}
                    {filterType === 'accepted' && 'Принятые'}
                    {filterType === 'rejected' && 'Отклоненные'}
                    {filterType === 'withdrawn' && 'Отозванные'}
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
                  <option value="newest">Новые</option>
                  <option value="oldest">Старые</option>
                  <option value="price_low">Цена: по возрастанию</option>
                  <option value="price_high">Цена: по убыванию</option>
                </select>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Proposals List */}
        {sortedProposals.length > 0 ? (
          <div className="space-y-6">
            {sortedProposals.map((proposal) => (
              <GlassCard key={proposal.id} variant="elevated" padding="lg">
                <GlassCardHeader>
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Request Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold glass-text-primary mb-2">
                            {proposal.request.title}
                          </h3>
                          <p className="glass-text-secondary leading-relaxed mb-4">
                            {proposal.request.description}
                          </p>
                        </div>
                        
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proposal.status)}`}>
                          {getStatusText(proposal.status)}
                        </span>
                      </div>

                      {/* Client Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                          {proposal.request.client.avatar ? (
                            <img 
                              src={proposal.request.client.avatar} 
                              alt={proposal.request.client.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg className="w-5 h-5 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium glass-text-primary">
                            Заказчик: {proposal.request.client.name}
                          </div>
                          <div className="text-xs glass-text-muted">
                            Бюджет: {formatCurrency(proposal.request.budget)}
                          </div>
                        </div>
                      </div>

                      {/* Proposal Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-sm glass-text-secondary">Ваша цена:</span>
                          <p className="font-semibold glass-text-accent-orange-500 text-lg">
                            {formatCurrency(proposal.price)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm glass-text-secondary">Срок выполнения:</span>
                          <p className="font-semibold glass-text-primary">
                            {proposal.timeline}
                          </p>
                        </div>
                      </div>

                      {/* Client Response */}
                      {proposal.clientResponse && (
                        <div className="glass-bg-secondary rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 glass-text-accent-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="font-medium glass-text-primary">
                              Ответ заказчика
                            </span>
                            <span className="text-sm glass-text-muted">
                              {formatDate(proposal.clientResponse.createdAt)}
                            </span>
                          </div>
                          <p className="glass-text-secondary">
                            {proposal.clientResponse.message}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                      <GlassButton variant="gradient" size="md">
                        Подробнее
                      </GlassButton>
                      {proposal.status === 'pending' && (
                        <GlassButton variant="secondary" size="md">
                          Отозвать
                        </GlassButton>
                      )}
                      {proposal.status === 'accepted' && (
                        <GlassButton variant="gradient" size="md">
                          Начать работу
                        </GlassButton>
                      )}
                      <GlassButton variant="ghost" size="md">
                        Написать
                      </GlassButton>
                    </div>
                  </div>
                </GlassCardHeader>
                
                <GlassCardContent>
                  <div className="flex items-center justify-between text-sm glass-text-muted pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      <span>Создано: {formatDate(proposal.createdAt)}</span>
                      <span>•</span>
                      <span>Обновлено: {formatDate(proposal.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>ID: {proposal.id}</span>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Предложения не найдены
              </h3>
              <p className="glass-text-secondary mb-4">
                {filter === 'all' 
                  ? 'У вас пока нет предложений. Найдите заявки и отправьте свои предложения'
                  : `Нет предложений со статусом "${getStatusText(filter)}"`
                }
              </p>
              <GlassButton variant="gradient" size="lg">
                Найти заявки
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
