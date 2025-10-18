'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';

interface Channel {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  banner?: string;
  subscribers: number;
  isSubscribed: boolean;
  videosCount: number;
  totalViews: number;
  joinDate: string;
  isVerified: boolean;
  location?: string;
  website?: string;
  socialLinks: {
    youtube?: string;
    instagram?: string;
    facebook?: string;
  };
}

interface ChannelVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  createdAt: string;
}

interface GlassChannelPageProps {
  channelId: string;
}

export default function GlassChannelPage({ channelId }: GlassChannelPageProps) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<ChannelVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'videos' | 'about' | 'playlists'>('videos');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchChannelData = async () => {
      // Loading handled by API hooks
    };

    fetchChannelData();
  }, [channelId, sortBy]);

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubscribe = () => {
    if (!channel) return;
    setChannel(prev => prev ? {
      ...prev,
      isSubscribed: !prev.isSubscribed,
      subscribers: prev.isSubscribed 
        ? prev.subscribers - 1 
        : prev.subscribers + 1
    } : null);
  };

  const sortedVideos = [...videos].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'popular':
        return b.views - a.views;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base">
        <div className="h-64 glass-bg-secondary animate-pulse" />
        <div className="max-w-6xl mx-auto p-4 -mt-16 relative">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-32 h-32 glass-bg-secondary rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-8 glass-bg-secondary rounded mb-4 animate-pulse" />
              <div className="h-4 glass-bg-secondary rounded w-2/3 mb-4 animate-pulse" />
              <div className="h-10 glass-bg-secondary rounded w-32 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base flex items-center justify-center p-4">
        <GlassCard variant="elevated" padding="xl" className="text-center max-w-md">
          <GlassCardContent>
            <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold glass-text-primary mb-2">
              Канал не найден
            </h3>
            <p className="glass-text-secondary mb-4">
              Возможно, канал был удален или ссылка неверна
            </p>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base">
      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-r from-orange-500/20 to-blue-500/20">
        {channel.banner && (
          <img 
            src={channel.banner} 
            alt={`${channel.name} banner`}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="max-w-6xl mx-auto p-4 -mt-16 relative">
        {/* Channel Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden border-4 border-white">
                {channel.avatar ? (
                  <img 
                    src={channel.avatar} 
                    alt={channel.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-16 h-16 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              {channel.isVerified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 glass-bg-accent-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Channel Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold glass-text-primary mb-2">
                    {channel.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm glass-text-secondary mb-4">
                    <span>{formatViews(channel.subscribers)} подписчиков</span>
                    <span>•</span>
                    <span>{channel.videosCount} видео</span>
                    <span>•</span>
                    <span>{formatViews(channel.totalViews)} просмотров</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <GlassButton
                    variant={channel.isSubscribed ? 'secondary' : 'gradient'}
                    size="lg"
                    onClick={handleSubscribe}
                  >
                    {channel.isSubscribed ? 'Подписка оформлена' : 'Подписаться'}
                  </GlassButton>
                  <GlassButton variant="secondary" size="lg">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Поделиться
                  </GlassButton>
                </div>
              </div>

              {/* Social Links */}
              {Object.keys(channel.socialLinks).length > 0 && (
                <div className="flex gap-3 mb-4">
                  {channel.socialLinks.youtube && (
                    <GlassButton variant="ghost" size="sm">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </GlassButton>
                  )}
                  {channel.socialLinks.instagram && (
                    <GlassButton variant="ghost" size="sm">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.98-.49-.98-.98s.49-.98.98-.98.98.49.98.98-.49.98-.98.98z"/>
                      </svg>
                    </GlassButton>
                  )}
                  {channel.socialLinks.facebook && (
                    <GlassButton variant="ghost" size="sm">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </GlassButton>
                  )}
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Tabs */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex gap-2">
              {(['videos', 'about', 'playlists'] as const).map((tab) => (
                <GlassButton
                  key={tab}
                  variant={activeTab === tab ? 'gradient' : 'ghost'}
                  size="md"
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'videos' && 'Видео'}
                  {tab === 'about' && 'О канале'}
                  {tab === 'playlists' && 'Плейлисты'}
                </GlassButton>
              ))}
            </div>

            {activeTab === 'videos' && (
              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">Сортировка:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="glass-bg-primary glass-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="newest">Новые</option>
                  <option value="oldest">Старые</option>
                  <option value="popular">Популярные</option>
                </select>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Tab Content */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVideos.map((video) => (
              <GlassCard key={video.id} variant="interactive" padding="none" className="hover:glass-shadow-md transition-all">
                <div className="relative aspect-video">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-blue-500/20 flex items-center justify-center">
                    <div className="w-16 h-16 glass-bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-2 right-2 glass-bg-primary glass-border rounded px-2 py-1">
                    <span className="text-xs font-medium text-white">{video.duration}</span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold glass-text-primary mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm glass-text-secondary">
                    <span>{formatViews(video.views)} просмотров</span>
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'about' && (
          <GlassCard variant="elevated" padding="lg">
            <GlassCardContent>
              <div className="prose prose-invert max-w-none">
                <p className="glass-text-secondary leading-relaxed mb-6">
                  {channel.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold glass-text-primary mb-3">Информация о канале</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="glass-text-secondary">Дата создания:</span>
                        <span className="glass-text-primary">{formatDate(channel.joinDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="glass-text-secondary">Всего видео:</span>
                        <span className="glass-text-primary">{channel.videosCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="glass-text-secondary">Подписчики:</span>
                        <span className="glass-text-primary">{formatViews(channel.subscribers)}</span>
                      </div>
                      {channel.location && (
                        <div className="flex justify-between">
                          <span className="glass-text-secondary">Местоположение:</span>
                          <span className="glass-text-primary">{channel.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {channel.website && (
                    <div>
                      <h3 className="font-semibold glass-text-primary mb-3">Ссылки</h3>
                      <div className="space-y-2">
                        <a 
                          href={channel.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm glass-text-accent-orange-500 hover:underline"
                        >
                          🌐 {channel.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        {activeTab === 'playlists' && (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Плейлисты пока не созданы
              </h3>
              <p className="glass-text-secondary">
                {channel.name} еще не создал плейлисты для своих видео
              </p>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
