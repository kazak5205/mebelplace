'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';

interface Story {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  thumbnail: string;
  title: string;
  duration: number;
  views: number;
  isViewed: boolean;
  createdAt: string;
}

export default function GlassStoriesScreen() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchStories = async () => {
      // Loading handled by API hooks
    };

    fetchStories();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}ч назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
    // TODO: Open story viewer modal
    console.log('Open story:', story.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <GlassCard key={i} variant="interactive" padding="none" className="w-32 h-48 flex-shrink-0 animate-pulse">
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
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle level={1} className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Истории
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="glass-text-secondary">
              Смотрите истории мастеров и их работы в реальном времени
            </p>
          </GlassCardContent>
        </GlassCard>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stories.map((story) => (
            <GlassCard 
              key={story.id} 
              variant="interactive" 
              padding="none" 
              className="aspect-[3/4] cursor-pointer hover:glass-shadow-lg transition-all group"
              onClick={() => handleStoryClick(story)}
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                {/* Story Image */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-blue-500/30 flex items-center justify-center">
                  <div className="w-16 h-16 glass-bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Author Avatar */}
                <div className="absolute top-4 left-4">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full border-2 ${
                      story.isViewed ? 'border-white/50' : 'border-orange-400'
                    } p-0.5`}>
                      <div className="w-full h-full glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                        {story.author.avatar ? (
                          <img 
                            src={story.author.avatar} 
                            alt={story.author.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-6 h-6 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    {/* New Story Indicator */}
                    {!story.isViewed && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 glass-bg-accent-orange-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                </div>

                {/* Duration */}
                <div className="absolute top-4 right-4">
                  <div className="glass-bg-primary glass-border rounded-full px-2 py-1">
                    <span className="text-xs font-medium text-white">
                      {story.duration}с
                    </span>
                  </div>
                </div>

                {/* Story Info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-semibold text-white mb-1 line-clamp-2">
                    {story.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-white/80">
                    <span>{story.author.name}</span>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {story.views}
                    </div>
                  </div>
                  
                  <div className="text-xs text-white/60 mt-1">
                    {formatTime(story.createdAt)}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Empty State */}
        {stories.length === 0 && (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Историй пока нет
              </h3>
              <p className="glass-text-secondary mb-4">
                Подписывайтесь на мастеров, чтобы видеть их истории
              </p>
              <GlassButton variant="gradient" size="lg">
                Найти мастеров
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Load More */}
        {stories.length > 0 && (
          <div className="text-center mt-8">
            <GlassButton
              variant="gradient"
              size="lg"
              onClick={() => {
                // TODO: Load more stories
                console.log('Load more stories');
              }}
            >
              Загрузить еще
            </GlassButton>
          </div>
        )}
      </div>
    </div>
  );
}
