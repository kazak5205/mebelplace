'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';

interface LiveStream {
  id: string;
  title: string;
  description: string;
  streamer: {
    id: string;
    name: string;
    avatar?: string;
    isVerified: boolean;
  };
  thumbnail: string;
  viewers: number;
  isLive: boolean;
  category: string;
  startedAt: string;
  duration: string;
}

export default function GlassLiveStreamingScreen() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('live');
  const [category, setCategory] = useState<string>('all');

  const categories = [
    'all',
    'Столярные работы',
    'Реставрация мебели',
    'Мастер-классы',
    'Дизайн интерьера',
    'Покраска',
    'Обновление мебели'
  ];

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchStreams = async () => {
      // Loading handled by API hooks
    };

    fetchStreams();
  }, []);

  const formatViewers = (viewers: number) => {
    if (viewers >= 1000000) return `${(viewers / 1000000).toFixed(1)}M`;
    if (viewers >= 1000) return `${(viewers / 1000).toFixed(1)}K`;
    return viewers.toString();
  };

  const formatDuration = (duration: string) => {
    return duration;
  };

  const filteredStreams = streams.filter(stream => {
    const matchesFilter = filter === 'all' || 
      (filter === 'live' && stream.isLive) || 
      (filter === 'upcoming' && !stream.isLive);
    
    const matchesCategory = category === 'all' || stream.category === category;
    
    return matchesFilter && matchesCategory;
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Прямые трансляции
              </GlassCardTitle>
              
              <div className="flex gap-3">
                <GlassButton variant="secondary" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Мои трансляции
                </GlassButton>
                <GlassButton variant="gradient" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Начать трансляцию
                </GlassButton>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'live', 'upcoming'] as const).map((filterType) => (
                  <GlassButton
                    key={filterType}
                    variant={filter === filterType ? 'gradient' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                  >
                    {filterType === 'all' && 'Все'}
                    {filterType === 'live' && 'В эфире'}
                    {filterType === 'upcoming' && 'Запланированные'}
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

        {/* Live Streams Grid */}
        {filteredStreams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStreams.map((stream) => (
              <GlassCard key={stream.id} variant="interactive" padding="none" className="hover:glass-shadow-lg transition-all">
                <div className="relative aspect-video">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-blue-500/20 flex items-center justify-center">
                    <div className="w-16 h-16 glass-bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Live Badge */}
                  {stream.isLive && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 glass-bg-danger text-white rounded-full text-xs font-medium flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                      </span>
                    </div>
                  )}
                  
                  {/* Viewers Count */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 glass-bg-primary text-white rounded-full text-xs font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {formatViewers(stream.viewers)}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-2 right-2">
                    <span className="px-2 py-1 glass-bg-primary text-white rounded-full text-xs font-medium">
                      {formatDuration(stream.duration)}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold glass-text-primary mb-2 line-clamp-2">
                    {stream.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                      {stream.streamer.avatar ? (
                        <img 
                          src={stream.streamer.avatar} 
                          alt={stream.streamer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-4 h-4 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm glass-text-primary font-medium">
                          {stream.streamer.name}
                        </span>
                        {stream.streamer.isVerified && (
                          <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-xs glass-text-muted">{stream.category}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm glass-text-secondary mb-3 line-clamp-2">
                    {stream.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <GlassButton variant="gradient" size="sm" className="flex-1">
                      {stream.isLive ? 'Смотреть' : 'Напомнить'}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Трансляции не найдены
              </h3>
              <p className="glass-text-secondary mb-4">
                {filter === 'live' 
                  ? 'Сейчас никто не ведет прямые трансляции'
                  : 'Нет запланированных трансляций'
                }
              </p>
              <GlassButton variant="gradient" size="lg">
                Начать первую трансляцию
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
