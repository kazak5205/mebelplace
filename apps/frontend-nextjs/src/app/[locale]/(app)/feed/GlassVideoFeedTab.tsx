'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton } from '@/components/ui/glass';

export default function GlassVideoFeedTab() {
  const [activeTab, setActiveTab] = useState('trending');
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const videos = [
    {
      id: '1',
      title: 'Изготовление современной кухни из массива дуба',
      author: 'Михаил Козлов',
      views: '12.5K',
      likes: '1.2K',
      thumbnail: '/api/placeholder/400/600',
      duration: '15:42'
    },
    {
      id: '2', 
      title: 'Реставрация антикварного комода',
      author: 'Анна Смирнова',
      views: '8.7K',
      likes: '856',
      thumbnail: '/api/placeholder/400/600',
      duration: '22:15'
    },
    {
      id: '3',
      title: 'Создание детской комнаты в стиле лофт',
      author: 'Елена Петрова', 
      views: '15.3K',
      likes: '2.1K',
      thumbnail: '/api/placeholder/400/600',
      duration: '18:30'
    },
    {
      id: '4',
      title: 'Мастер-класс по работе с фрезером',
      author: 'Алексей Иванов',
      views: '9.8K', 
      likes: '743',
      thumbnail: '/api/placeholder/400/600',
      duration: '12:45'
    },
    {
      id: '5',
      title: 'Дизайн гостиной в скандинавском стиле',
      author: 'Мария Сидорова',
      views: '11.2K',
      likes: '1.5K', 
      thumbnail: '/api/placeholder/400/600',
      duration: '20:12'
    },
    {
      id: '6',
      title: 'Изготовление стеллажа из фанеры',
      author: 'Дмитрий Козлов',
      views: '6.9K',
      likes: '432',
      thumbnail: '/api/placeholder/400/600', 
      duration: '14:28'
    }
  ];

  const handleLike = (videoId: string) => {
    setLiked(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <GlassCardTitle level={1}>
                Лента видео
              </GlassCardTitle>
              
              <div className="flex gap-2">
                {['trending', 'newest', 'following'].map((tab) => (
                  <GlassButton
                    key={tab}
                    variant={activeTab === tab ? 'gradient' : 'secondary'}
                    size="sm"
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'trending' && 'В тренде'}
                    {tab === 'newest' && 'Новые'}
                    {tab === 'following' && 'Подписки'}
                  </GlassButton>
                ))}
              </div>
            </div>
          </GlassCardHeader>
        </GlassCard>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <GlassCard key={video.id} variant="interactive" padding="none" className="overflow-hidden">
              {/* Video Thumbnail */}
              <div className="relative aspect-[9/16] glass-bg-secondary">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 glass-bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 glass-text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <span className="glass-text-muted text-sm">Видео</span>
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 glass-bg-secondary glass-border rounded px-2 py-1">
                  <span className="glass-text-primary text-xs font-semibold">
                    {video.duration}
                  </span>
                </div>

                {/* Like Button */}
                <button
                  onClick={() => handleLike(video.id)}
                  className="absolute top-2 right-2 w-8 h-8 glass-bg-primary glass-border rounded-full flex items-center justify-center glass-interactive"
                >
                  <svg 
                    className={`w-4 h-4 ${liked.has(video.id) ? 'text-red-400 fill-current' : 'glass-text-muted'}`}
                    fill={liked.has(video.id) ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Video Info */}
              <GlassCardContent>
                <h3 className="glass-text-primary font-semibold text-sm mb-2 line-clamp-2">
                  {video.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 glass-bg-secondary rounded-full flex items-center justify-center">
                    <span className="glass-text-primary text-xs font-semibold">
                      {video.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span className="glass-text-secondary text-xs">
                    {video.author}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs glass-text-muted">
                  <span>👁️ {video.views}</span>
                  <span>❤️ {video.likes}</span>
                </div>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-8">
          <GlassButton variant="secondary" size="lg">
            Загрузить еще
          </GlassButton>
        </div>
      </div>
    </div>
  );
}