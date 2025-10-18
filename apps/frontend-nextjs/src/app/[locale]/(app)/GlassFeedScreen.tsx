'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';
import { useVideoFeed } from '@/lib/api/hooks';
import { useVideoActions } from '@/lib/api/hooks';

interface FeaturedVideo {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  isFeatured: boolean;
}

interface Stats {
  totalVideos: number;
  totalMasters: number;
  totalRequests: number;
  totalUsers: number;
}

export default function GlassFeedScreen() {
  const [featuredVideos, setFeaturedVideos] = useState<FeaturedVideo[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // API hooks
  const { data: videos, loading: videosLoading, error: videosError, hasMore, loadMore, refresh } = useVideoFeed();
  const { likeVideo, unlikeVideo, addComment, loading: actionsLoading } = useVideoActions();

  useEffect(() => {
    // Transform API videos to featured videos format
    if (videos && videos.length > 0) {
      const transformedVideos: FeaturedVideo[] = videos.slice(0, 3).map((video: any) => ({
        id: video.id.toString(),
        title: video.title,
        author: video.author?.username || 'Аноним',
        thumbnail: video.thumbnail_path || '/api/placeholder/600/400',
        duration: '0:00', // Duration not in API response
        views: video.views_count || 0,
        likes: video.likes_count || 0,
        isFeatured: true
      }));
      setFeaturedVideos(transformedVideos);
    }

    // Stats calculated from API data
    const mockStats: Stats = {
      totalVideos: videos?.length || 0,
      totalMasters: 89,
      totalRequests: 156,
      totalUsers: 2340
    };
    setStats(mockStats);
    setLoading(false);
  }, [videos]);

  const handleLike = async (videoId: string, isLiked: boolean) => {
    if (isLiked) {
      await unlikeVideo(videoId);
    } else {
      await likeVideo(videoId);
    }
    refresh();
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <GlassCard key={i} variant="interactive" padding="none" className="aspect-video animate-pulse">
                <div className="w-full h-full glass-bg-secondary rounded-xl" />
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
        {/* Hero Section */}
        <GlassCard variant="elevated" padding="xl" className="mb-8 text-center">
          <GlassCardHeader>
            <GlassCardTitle level={1} className="text-4xl md:text-5xl mb-4">
              Добро пожаловать в MebelPlace
            </GlassCardTitle>
            <p className="text-xl glass-text-secondary mb-6">
              Платформа для мастеров мебели, дизайнеров и клиентов
            </p>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassButton variant="gradient" size="lg">
                Найти мастера
              </GlassButton>
              <GlassButton variant="secondary" size="lg">
                Разместить заказ
              </GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <GlassCard variant="basic" padding="lg" className="text-center">
              <GlassCardContent>
                <div className="text-2xl font-bold glass-text-primary mb-1">
                  {stats.totalVideos.toLocaleString()}
                </div>
                <div className="text-sm glass-text-secondary">Видео</div>
              </GlassCardContent>
            </GlassCard>
            
            <GlassCard variant="basic" padding="lg" className="text-center">
              <GlassCardContent>
                <div className="text-2xl font-bold glass-text-primary mb-1">
                  {stats.totalMasters}
                </div>
                <div className="text-sm glass-text-secondary">Мастеров</div>
              </GlassCardContent>
            </GlassCard>
            
            <GlassCard variant="basic" padding="lg" className="text-center">
              <GlassCardContent>
                <div className="text-2xl font-bold glass-text-primary mb-1">
                  {stats.totalRequests}
                </div>
                <div className="text-sm glass-text-secondary">Заявок</div>
              </GlassCardContent>
            </GlassCard>
            
            <GlassCard variant="basic" padding="lg" className="text-center">
              <GlassCardContent>
                <div className="text-2xl font-bold glass-text-primary mb-1">
                  {stats.totalUsers.toLocaleString()}
                </div>
                <div className="text-sm glass-text-secondary">Пользователей</div>
              </GlassCardContent>
            </GlassCard>
          </div>
        )}

        {/* Featured Videos */}
        <GlassCard variant="elevated" padding="lg" className="mb-8">
          <GlassCardHeader>
            <GlassCardTitle level={2} className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Рекомендуемые видео
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-6">
              {featuredVideos.map((video) => (
                <GlassCard key={video.id} variant="interactive" padding="lg" className="hover:glass-shadow-md transition-all">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Video Thumbnail */}
                    <div className="lg:w-80 flex-shrink-0">
                      <div className="relative aspect-video glass-bg-secondary rounded-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-blue-500/20 flex items-center justify-center">
                          <div className="w-16 h-16 glass-bg-primary rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                        
                        {/* Duration */}
                        <div className="absolute bottom-2 right-2 glass-bg-primary glass-border rounded px-2 py-1">
                          <span className="text-xs font-medium text-white">{video.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Video Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold glass-text-primary mb-3 line-clamp-2">
                        {video.title}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm glass-text-secondary mb-4">
                        <span>{video.author}</span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {formatViews(video.views)}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {formatViews(video.likes)}
                          </div>
                        </div>
                      </div>
                      
                      <p className="glass-text-secondary mb-4 line-clamp-3">
                        Подробный мастер-класс по изготовлению мебели с использованием современных технологий и традиционных методов обработки дерева.
                      </p>
                      
                      <div className="flex gap-3">
                        <GlassButton 
                          variant="gradient" 
                          size="md"
                          onClick={() => window.location.href = `/video/${video.id}`}
                        >
                          Смотреть видео
                        </GlassButton>
                        <GlassButton 
                          variant="secondary" 
                          size="md"
                          onClick={() => handleLike(video.id, false)}
                          disabled={actionsLoading}
                        >
                          Лайк
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={2}>
              Быстрые действия
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassButton 
                variant="secondary" 
                size="lg" 
                className="h-20 flex-col gap-2"
                onClick={() => window.location.href = '/requests/create'}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Создать заявку
              </GlassButton>
              
              <GlassButton 
                variant="secondary" 
                size="lg" 
                className="h-20 flex-col gap-2"
                onClick={() => window.location.href = '/upload'}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Загрузить видео
              </GlassButton>
              
              <GlassButton 
                variant="secondary" 
                size="lg" 
                className="h-20 flex-col gap-2"
                onClick={() => window.location.href = '/search'}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Найти мастера
              </GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
