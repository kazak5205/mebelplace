'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton,
  GlassInput 
} from '@/components/ui/glass';

interface Review {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    isVerified: boolean;
  };
  target: {
    id: string;
    name: string;
    type: 'master' | 'product' | 'service';
    avatar?: string;
  };
  rating: number;
  title: string;
  content: string;
  images: string[];
  helpful: number;
  isHelpful: boolean;
  createdAt: string;
  updatedAt: string;
  response?: {
    content: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
    };
  };
}

export default function GlassReviewsScreen() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'masters' | 'products' | 'services'>('all');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful' | 'rating'>('newest');

  // Data is fetched via API hooks
  const loading = false; // Will be replaced with real API hook when ready

  useEffect(() => {
    // Data is fetched via API hooks
    const fetchReviews = async () => {
      // Loading handled by API hooks
    };

    fetchReviews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTargetTypeText = (type: string) => {
    switch (type) {
      case 'master': return 'Мастер';
      case 'product': return 'Товар';
      case 'service': return 'Услуга';
      default: return type;
    }
  };

  const handleHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? {
            ...review,
            isHelpful: !review.isHelpful,
            helpful: review.isHelpful ? review.helpful - 1 : review.helpful + 1
          }
        : review
    ));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ));
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.target.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'masters' && review.target.type === 'master') || (filter === 'products' && review.target.type === 'product') || (filter === 'services' && review.target.type === 'service');
    const matchesRating = ratingFilter === 0 || review.rating === ratingFilter;
    
    return matchesSearch && matchesFilter && matchesRating;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'helpful':
        return b.helpful - a.helpful;
      case 'rating':
        return b.rating - a.rating;
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Отзывы и рейтинги
              </GlassCardTitle>
              
              <div className="flex gap-3">
                <GlassButton variant="secondary" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Мои отзывы
                </GlassButton>
                <GlassButton variant="gradient" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Написать отзыв
                </GlassButton>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <GlassInput
                value={searchQuery}
                onValueChange={setSearchQuery}
                placeholder="Поиск отзывов..."
                className="flex-1 min-w-[300px]"
              />

              {/* Filters */}
              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">Тип:</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="glass-bg-primary glass-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">Все</option>
                  <option value="masters">Мастера</option>
                  <option value="products">Товары</option>
                  <option value="services">Услуги</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">Рейтинг:</span>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(Number(e.target.value))}
                  className="glass-bg-primary glass-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value={0}>Все</option>
                  <option value={5}>5 звезд</option>
                  <option value={4}>4 звезды</option>
                  <option value={3}>3 звезды</option>
                  <option value={2}>2 звезды</option>
                  <option value={1}>1 звезда</option>
                </select>
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
                  <option value="helpful">Полезные</option>
                  <option value="rating">По рейтингу</option>
                </select>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Reviews List */}
        <div className="space-y-6">
          {sortedReviews.map((review) => (
            <GlassCard key={review.id} variant="elevated" padding="lg">
              <GlassCardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {review.author.avatar ? (
                      <img 
                        src={review.author.avatar} 
                        alt={review.author.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-6 h-6 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold glass-text-primary">
                        {review.author.name}
                      </h3>
                      {review.author.isVerified && (
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      )}
                      <span className="text-sm glass-text-muted">
                        оставил(а) отзыв о
                      </span>
                      <span className="font-medium glass-text-primary">
                        {review.target.name}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        review.target.type === 'master' ? 'glass-bg-accent-orange-500 text-white' :
                        review.target.type === 'product' ? 'glass-bg-accent-blue-500 text-white' :
                        'glass-bg-accent-purple-500 text-white'
                      }`}>
                        {getTargetTypeText(review.target.type)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm glass-text-muted">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    
                    <h4 className="font-semibold glass-text-primary mb-2">
                      {review.title}
                    </h4>
                    
                    <p className="glass-text-secondary leading-relaxed mb-4">
                      {review.content}
                    </p>
                    
                    {/* Images */}
                    {review.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {review.images.map((image, index) => (
                          <div key={index} className="aspect-video glass-bg-secondary rounded-lg overflow-hidden">
                            <img 
                              src={image} 
                              alt={`Review image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Response */}
                    {review.response && (
                      <div className="glass-bg-secondary rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 glass-text-accent-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="font-medium glass-text-primary">
                            Ответ от {review.response.author.name}
                          </span>
                          <span className="text-sm glass-text-muted">
                            {formatDate(review.response.createdAt)}
                          </span>
                        </div>
                        <p className="glass-text-secondary">
                          {review.response.content}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleHelpful(review.id)}
                        className={`flex items-center gap-2 text-sm transition-colors ${
                          review.isHelpful ? 'glass-text-accent-orange-500' : 'glass-text-muted hover:glass-text-primary'
                        }`}
                      >
                        <svg className="w-4 h-4" fill={review.isHelpful ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V18m-7-8l2 2m0 0l2-2m-2 2V4" />
                        </svg>
                        Полезно ({review.helpful})
                      </button>
                      
                      <div className="flex gap-2">
                        <GlassButton variant="ghost" size="sm">
                          Поделиться
                        </GlassButton>
                        <GlassButton variant="ghost" size="sm">
                          Пожаловаться
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCardHeader>
            </GlassCard>
          ))}
        </div>

        {sortedReviews.length === 0 && (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Отзывы не найдены
              </h3>
              <p className="glass-text-secondary mb-4">
                Попробуйте изменить фильтры или поисковый запрос
              </p>
              <GlassButton variant="gradient" size="lg">
                Написать первый отзыв
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
