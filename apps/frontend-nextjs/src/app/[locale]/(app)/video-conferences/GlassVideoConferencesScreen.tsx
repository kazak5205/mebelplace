'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';

interface VideoConference {
  id: string;
  title: string;
  description: string;
  host: {
    id: string;
    name: string;
    avatar?: string;
  };
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  maxParticipants: number;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'live' | 'ended';
  isPublic: boolean;
  category: string;
  recording: boolean;
}

export default function GlassVideoConferencesScreen() {
  const [conferences, setConferences] = useState<VideoConference[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'live' | 'ended'>('all');
  const [category, setCategory] = useState<string>('all');

  const categories = [
    'all',
    'Консультации',
    'Мастер-классы',
    'Совместная работа',
    'Презентации',
    'Обучение'
  ];

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchConferences = async () => {
      // Loading handled by API hooks
    };

    fetchConferences();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'glass-bg-accent-blue-500 text-white';
      case 'live': return 'glass-bg-danger text-white';
      case 'ended': return 'glass-bg-secondary text-white';
      default: return 'glass-bg-secondary text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Запланирована';
      case 'live': return 'В эфире';
      case 'ended': return 'Завершена';
      default: return status;
    }
  };

  const filteredConferences = conferences.filter(conference => {
    const matchesFilter = filter === 'all' || conference.status === filter;
    const matchesCategory = category === 'all' || conference.category === category;
    
    return matchesFilter && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <GlassCard key={i} variant="interactive" padding="lg" className="animate-pulse">
                <div className="h-4 glass-bg-secondary rounded mb-2" />
                <div className="h-3 glass-bg-secondary rounded w-2/3 mb-4" />
                <div className="h-20 glass-bg-secondary rounded" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Видеоконференции
              </GlassCardTitle>
              
              <div className="flex gap-3">
                <GlassButton variant="secondary" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  Мои конференции
                </GlassButton>
                <GlassButton variant="gradient" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Создать конференцию
                </GlassButton>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'scheduled', 'live', 'ended'] as const).map((filterType) => (
                  <GlassButton
                    key={filterType}
                    variant={filter === filterType ? 'gradient' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                  >
                    {filterType === 'all' && 'Все'}
                    {filterType === 'scheduled' && 'Запланированные'}
                    {filterType === 'live' && 'В эфире'}
                    {filterType === 'ended' && 'Завершенные'}
                  </GlassButton>
                ))}
              </div>

              {/* Categories */}
              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">Категория:</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="glass-bg-primary glass-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'Все категории' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Conferences Grid */}
        {filteredConferences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConferences.map((conference) => (
              <GlassCard key={conference.id} variant="interactive" padding="lg" className="hover:glass-shadow-lg transition-all">
                <GlassCardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold glass-text-primary mb-2 line-clamp-2">
                        {conference.title}
                      </h3>
                      <p className="text-sm glass-text-secondary line-clamp-2 mb-3">
                        {conference.description}
                      </p>
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conference.status)}`}>
                      {getStatusText(conference.status)}
                    </span>
                  </div>

                  {/* Host */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                      {conference.host.avatar ? (
                        <img 
                          src={conference.host.avatar} 
                          alt={conference.host.name}
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
                        Ведущий: {conference.host.name}
                      </div>
                      <div className="text-xs glass-text-muted">
                        {conference.category}
                      </div>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm glass-text-secondary mb-2">
                      <span>Участники</span>
                      <span>{conference.participants.length}/{conference.maxParticipants}</span>
                    </div>
                    <div className="flex -space-x-2">
                      {conference.participants.slice(0, 4).map((participant, index) => (
                        <div key={participant.id} className="w-8 h-8 glass-bg-secondary rounded-full border-2 border-white flex items-center justify-center overflow-hidden">
                          {participant.avatar ? (
                            <img 
                              src={participant.avatar} 
                              alt={participant.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg className="w-4 h-4 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>
                      ))}
                      {conference.participants.length > 4 && (
                        <div className="w-8 h-8 glass-bg-accent-blue-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white">
                          +{conference.participants.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm glass-text-secondary">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        {formatTime(conference.startTime)} - {formatTime(conference.endTime)}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex items-center gap-4 text-xs glass-text-muted mb-4">
                    {conference.recording && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Запись</span>
                      </div>
                    )}
                    {conference.isPublic ? (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Публичная</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Приватная</span>
                      </div>
                    )}
                  </div>
                </GlassCardHeader>
                
                <GlassCardContent>
                  <div className="flex gap-2">
                    {conference.status === 'scheduled' && (
                      <GlassButton variant="secondary" size="sm" className="flex-1">
                        Напомнить
                      </GlassButton>
                    )}
                    {conference.status === 'live' && (
                      <GlassButton variant="gradient" size="sm" className="flex-1">
                        Присоединиться
                      </GlassButton>
                    )}
                    {conference.status === 'ended' && (
                      <GlassButton variant="ghost" size="sm" className="flex-1">
                        Смотреть запись
                      </GlassButton>
                    )}
                    <GlassButton variant="ghost" size="sm">
                      ⋯
                    </GlassButton>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Конференции не найдены
              </h3>
              <p className="glass-text-secondary mb-4">
                {filter === 'all' 
                  ? 'У вас пока нет видеоконференций'
                  : `Нет конференций со статусом "${getStatusText(filter)}"`
                }
              </p>
              <GlassButton variant="gradient" size="lg">
                Создать первую конференцию
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
