'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';

interface ChannelStats {
  totalViews: number;
  totalSubscribers: number;
  totalVideos: number;
  totalLikes: number;
  viewsThisMonth: number;
  subscribersThisMonth: number;
  averageWatchTime: number;
  topVideo: {
    id: string;
    title: string;
    views: number;
  };
}

interface ChannelVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  comments: number;
  status: 'published' | 'draft' | 'processing';
  visibility: 'public' | 'private' | 'unlisted';
  createdAt: string;
  performance: {
    retentionRate: number;
    clickThroughRate: number;
    engagement: number;
  };
}

interface GlassMyChannelScreenProps {}

export default function GlassMyChannelScreen() {
  const [channelStats, setChannelStats] = useState<ChannelStats | null>(null);
  const [recentVideos, setRecentVideos] = useState<ChannelVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'analytics' | 'customization'>('overview');

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchChannelData = async () => {
      // Loading handled by API hooks
    };

    fetchChannelData();
  }, []);

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'glass-bg-success text-white';
      case 'draft': return 'glass-bg-accent-orange-500 text-white';
      case 'processing': return 'glass-bg-accent-blue-500 text-white';
      default: return 'glass-bg-secondary text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Опубликовано';
      case 'draft': return 'Черновик';
      case 'processing': return 'Обрабатывается';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 glass-bg-secondary rounded" />
              ))}
            </div>
            <div className="h-64 glass-bg-secondary rounded" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Мой канал
              </GlassCardTitle>
              
              <div className="flex gap-3">
                <GlassButton variant="secondary" size="md">
                  Настройки канала
                </GlassButton>
                <GlassButton variant="gradient" size="md">
                  Загрузить видео
                </GlassButton>
              </div>
            </div>
          </GlassCardHeader>
        </GlassCard>

        {/* Navigation Tabs */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'overview', label: 'Обзор', icon: '📊' },
                { id: 'videos', label: 'Видео', icon: '🎥' },
                { id: 'analytics', label: 'Аналитика', icon: '📈' },
                { id: 'customization', label: 'Оформление', icon: '🎨' }
              ].map((tab) => (
                <GlassButton
                  key={tab.id}
                  variant={activeTab === tab.id ? 'gradient' : 'ghost'}
                  size="md"
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </GlassButton>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Overview Tab */}
        {activeTab === 'overview' && channelStats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <GlassCard variant="interactive" padding="lg">
                <GlassCardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm glass-text-secondary mb-1">Всего просмотров</p>
                      <p className="text-2xl font-bold glass-text-primary">{formatViews(channelStats.totalViews)}</p>
                      <p className="text-xs glass-text-success">+{formatViews(channelStats.viewsThisMonth)} за месяц</p>
                    </div>
                    <div className="w-12 h-12 glass-bg-accent-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>

              <GlassCard variant="interactive" padding="lg">
                <GlassCardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm glass-text-secondary mb-1">Подписчики</p>
                      <p className="text-2xl font-bold glass-text-primary">{formatViews(channelStats.totalSubscribers)}</p>
                      <p className="text-xs glass-text-success">+{channelStats.subscribersThisMonth} за месяц</p>
                    </div>
                    <div className="w-12 h-12 glass-bg-accent-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>

              <GlassCard variant="interactive" padding="lg">
                <GlassCardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm glass-text-secondary mb-1">Видео</p>
                      <p className="text-2xl font-bold glass-text-primary">{channelStats.totalVideos}</p>
                      <p className="text-xs glass-text-secondary">Опубликовано</p>
                    </div>
                    <div className="w-12 h-12 glass-bg-accent-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>

              <GlassCard variant="interactive" padding="lg">
                <GlassCardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm glass-text-secondary mb-1">Среднее время просмотра</p>
                      <p className="text-2xl font-bold glass-text-primary">{formatTime(channelStats.averageWatchTime)}</p>
                      <p className="text-xs glass-text-success">+5% за месяц</p>
                    </div>
                    <div className="w-12 h-12 glass-bg-success rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>

            {/* Recent Videos */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={2} className="text-lg">
                  Последние видео
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recentVideos.slice(0, 4).map((video) => (
                    <div key={video.id} className="flex gap-4">
                      <div className="w-32 h-20 glass-bg-secondary rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 glass-bg-primary glass-border rounded px-1 py-0.5">
                          <span className="text-xs font-medium text-white">{video.duration}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold glass-text-primary mb-2 line-clamp-2">
                          {video.title}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm glass-text-secondary mb-2">
                          <span>{formatViews(video.views)} просмотров</span>
                          <span>•</span>
                          <span>{formatViews(video.likes)} лайков</span>
                          <span>•</span>
                          <span>{video.comments} комментариев</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(video.status)}`}>
                            {getStatusText(video.status)}
                          </span>
                          <span className="text-xs glass-text-muted">
                            {new Date(video.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Top Video */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={2} className="text-lg">
                  Самое популярное видео
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="flex items-center gap-6">
                  <div className="w-48 h-32 glass-bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src="/api/placeholder/400/225" 
                      alt="Top video"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold glass-text-primary mb-2">
                      {channelStats.topVideo.title}
                    </h3>
                    <div className="text-2xl font-bold glass-text-accent-orange-500 mb-2">
                      {formatViews(channelStats.topVideo.views)} просмотров
                    </div>
                    <p className="glass-text-secondary">
                      Это видео принесло наибольшее количество просмотров на вашем канале.
                    </p>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <GlassCard variant="elevated" padding="lg">
            <GlassCardHeader>
              <GlassCardTitle level={2} className="text-lg">
                Все видео
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentVideos.map((video) => (
                  <div key={video.id} className="glass-bg-secondary rounded-lg overflow-hidden hover:glass-shadow-md transition-all">
                    <div className="aspect-video glass-bg-secondary relative">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 glass-bg-primary glass-border rounded px-2 py-1">
                        <span className="text-xs font-medium text-white">{video.duration}</span>
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(video.status)}`}>
                          {getStatusText(video.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold glass-text-primary mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      
                      <div className="flex items-center justify-between text-sm glass-text-secondary mb-3">
                        <span>{formatViews(video.views)} просмотров</span>
                        <span>{new Date(video.createdAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm glass-text-muted">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {formatViews(video.likes)}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {video.comments}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <GlassButton variant="ghost" size="sm">✏️</GlassButton>
                          <GlassButton variant="ghost" size="sm">⋯</GlassButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Other Tabs Placeholders */}
        {activeTab !== 'overview' && activeTab !== 'videos' && (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                {activeTab === 'analytics' && 'Аналитика канала'}
                {activeTab === 'customization' && 'Оформление канала'}
              </h3>
              <p className="glass-text-secondary mb-4">
                Раздел в разработке. Функциональность будет добавлена после интеграции с API.
              </p>
              <GlassButton variant="gradient">
                Настроить
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
