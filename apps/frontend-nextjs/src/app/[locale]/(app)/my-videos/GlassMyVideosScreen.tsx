'use client';

import React, { useState } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';
import { useUserVideos } from '@/lib/api/hooks';

interface UserVideo {
  id: number;
  title: string;
  description: string;
  thumbnail_path: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  status: 'published' | 'draft' | 'processing';
  visibility: 'public' | 'private' | 'unlisted';
  created_at: string;
  updated_at: string;
}

export default function GlassMyVideosScreen() {
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'processing'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'likes'>('newest');
  
  // API hooks
  const { data: videos, loading, error, refresh } = useUserVideos();

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'glass-bg-success';
      case 'draft': return 'glass-bg-warning';
      case 'processing': return 'glass-bg-info';
      default: return 'glass-bg-secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Опубликовано';
      case 'draft': return 'Черновик';
      case 'processing': return 'Обработка';
      default: return 'Неизвестно';
    }
  };

  const filteredVideos = (videos || []).filter((video: any) => {
    if (filter === 'all') return true;
    return video.status === filter;
  });

  const sortedVideos = filteredVideos.sort((a: any, b: any) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'views':
        return b.views_count - a.views_count;
      case 'likes':
        return b.likes_count - a.likes_count;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 glass-bg-secondary rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <GlassCard variant="elevated" padding="lg">
            <GlassCardContent>
              <div className="text-center">
                <h2 className="text-xl font-semibold glass-text-primary mb-4">
                  Ошибка загрузки видео
                </h2>
                <p className="glass-text-secondary mb-6">
                  {error}
                </p>
                <GlassButton variant="gradient" onClick={refresh}>
                  Попробовать снова
                </GlassButton>
              </div>
            </GlassCardContent>
          </GlassCard>
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
            <GlassCardTitle level={1} className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Мои видео
            </GlassCardTitle>
          </GlassCardHeader>
          
          <GlassCardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {(['all', 'published', 'draft', 'processing'] as const).map((filterType) => (
                  <GlassButton
                    key={filterType}
                    variant={filter === filterType ? 'gradient' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                  >
                    {filterType === 'all' && 'Все'}
                    {filterType === 'published' && 'Опубликованные'}
                    {filterType === 'draft' && 'Черновики'}
                    {filterType === 'processing' && 'Обработка'}
                  </GlassButton>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">Сортировка:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="glass-bg-primary glass-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="newest">Новые</option>
                  <option value="oldest">Старые</option>
                  <option value="views">Просмотры</option>
                  <option value="likes">Лайки</option>
                </select>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Upload Button */}
        <div className="mb-6">
          <GlassButton variant="gradient" size="lg" onClick={() => window.location.href = '/upload'}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Загрузить видео
          </GlassButton>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedVideos.map((video: any) => (
            <GlassCard key={video.id} variant="elevated" padding="lg" className="hover:glass-shadow-md transition-all">
              <GlassCardHeader>
                <div className="relative">
                  <img
                    src={video.thumbnail_path || '/api/placeholder/400/225'}
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(video.status)}`}>
                    {getStatusText(video.status)}
                  </div>
                </div>
              </GlassCardHeader>
              
              <GlassCardContent>
                <h3 className="font-semibold glass-text-primary mb-2 line-clamp-2">
                  {video.title}
                </h3>
                
                <p className="text-sm glass-text-secondary mb-4 line-clamp-2">
                  {video.description}
                </p>
                
                <div className="flex items-center justify-between text-sm glass-text-muted mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {formatViews(video.views_count)}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {video.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {video.comments_count}
                    </span>
                  </div>
                  <span>{formatDate(video.created_at)}</span>
                </div>
                
                <div className="flex gap-2">
                  <GlassButton variant="secondary" size="sm" className="flex-1">
                    Редактировать
                  </GlassButton>
                  <GlassButton variant="ghost" size="sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </GlassButton>
                </div>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>

        {/* Empty State */}
        {sortedVideos.length === 0 && (
          <GlassCard variant="elevated" padding="xl">
            <GlassCardContent>
              <div className="text-center">
                <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold glass-text-primary mb-2">
                  У вас пока нет видео
                </h3>
                <p className="glass-text-secondary mb-4">
                  Загрузите свое первое видео и поделитесь мастерством с другими
                </p>
                <GlassButton variant="gradient" size="lg" onClick={() => window.location.href = '/upload'}>
                  Загрузить видео
                </GlassButton>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}