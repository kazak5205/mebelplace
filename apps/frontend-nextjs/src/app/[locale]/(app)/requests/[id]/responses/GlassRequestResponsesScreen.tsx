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
  master: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    completedProjects: number;
    location: string;
  };
  price: number;
  timeline: string;
  description: string;
  materials: string[];
  portfolio: string[];
  createdAt: string;
  isSelected: boolean;
  message: string;
}

interface GlassRequestResponsesScreenProps {
  requestId: string;
}

export default function GlassRequestResponsesScreen({ requestId }: GlassRequestResponsesScreenProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_low' | 'price_high' | 'rating'>('newest');

  // Data is fetched via API hooks
  const loading = false; // Will be replaced with real API hook when ready

  useEffect(() => {
    // Data is fetched via API hooks
    const fetchProposals = async () => {
      // Loading handled by API hooks
    };

    fetchProposals();
  }, [requestId]);

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
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSelectProposal = (proposalId: string) => {
    setProposals(prev => prev.map(proposal => ({
      ...proposal,
      isSelected: proposal.id === proposalId
    })));
  };

  const sortedProposals = [...proposals].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'rating':
        return b.master.rating - a.master.rating;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 glass-bg-secondary rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <GlassCardTitle level={1} className="flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m0-4h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m0-4H9a2 2 0 00-2 2v6a2 2 0 002 2h2" />
                </svg>
                Отклики на заявку
              </GlassCardTitle>
              
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
                  <option value="rating">Рейтинг</option>
                </select>
              </div>
            </div>
          </GlassCardHeader>
        </GlassCard>

        {/* Proposals List */}
        <div className="space-y-6">
          {sortedProposals.map((proposal) => (
            <GlassCard 
              key={proposal.id} 
              variant={proposal.isSelected ? "elevated" : "interactive"} 
              padding="lg" 
              className={`hover:glass-shadow-lg transition-all ${
                proposal.isSelected ? 'ring-2 ring-orange-400' : ''
              }`}
            >
              <GlassCardHeader>
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Master Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                      {proposal.master.avatar ? (
                        <img 
                          src={proposal.master.avatar} 
                          alt={proposal.master.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold glass-text-primary mb-1">
                        {proposal.master.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm glass-text-secondary mb-2">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span>{proposal.master.rating}</span>
                        </div>
                        <span>•</span>
                        <span>{proposal.master.completedProjects} проектов</span>
                        <span>•</span>
                        <span>{proposal.master.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex flex-col lg:items-end gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold glass-text-accent-orange-500 mb-1">
                        {formatCurrency(proposal.price)}
                      </div>
                      <div className="text-sm glass-text-secondary">
                        Срок: {proposal.timeline}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <GlassButton
                        variant={proposal.isSelected ? 'gradient' : 'secondary'}
                        size="md"
                        onClick={() => handleSelectProposal(proposal.id)}
                      >
                        {proposal.isSelected ? 'Выбран' : 'Выбрать'}
                      </GlassButton>
                      <GlassButton variant="ghost" size="md">
                        Написать
                      </GlassButton>
                    </div>
                  </div>
                </div>
              </GlassCardHeader>
              
              <GlassCardContent>
                {/* Message */}
                <div className="mb-6">
                  <h4 className="font-semibold glass-text-primary mb-2">Сообщение мастера:</h4>
                  <p className="glass-text-secondary leading-relaxed">
                    {proposal.message}
                  </p>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h4 className="font-semibold glass-text-primary mb-2">Описание работ:</h4>
                  <p className="glass-text-secondary leading-relaxed">
                    {proposal.description}
                  </p>
                </div>

                {/* Materials */}
                <div className="mb-6">
                  <h4 className="font-semibold glass-text-primary mb-3">Материалы:</h4>
                  <div className="flex flex-wrap gap-2">
                    {proposal.materials.map((material, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 glass-bg-accent-blue-500 text-white rounded-full text-sm"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Portfolio */}
                <div className="mb-4">
                  <h4 className="font-semibold glass-text-primary mb-3">Портфолио:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {proposal.portfolio.map((image, index) => (
                      <div key={index} className="aspect-video glass-bg-secondary rounded-lg overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm glass-text-muted pt-4 border-t border-white/10">
                  <span>Отправлено {formatDate(proposal.createdAt)}</span>
                  <div className="flex items-center gap-4">
                    <button className="hover:glass-text-primary transition-colors">
                      Сохранить
                    </button>
                    <button className="hover:glass-text-primary transition-colors">
                      Поделиться
                    </button>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>

        {proposals.length === 0 && (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m0-4h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m0-4H9a2 2 0 00-2 2v6a2 2 0 002 2h2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Пока нет откликов
              </h3>
              <p className="glass-text-secondary mb-4">
                Мастера еще не откликнулись на вашу заявку. Попробуйте подождать или изменить условия.
              </p>
              <GlassButton variant="gradient">
                Редактировать заявку
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
