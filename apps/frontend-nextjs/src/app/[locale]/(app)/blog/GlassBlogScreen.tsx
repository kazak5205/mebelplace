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

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    bio: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  readTime: number;
  views: number;
  likes: number;
  isLiked?: boolean;
  image: string;
  featured: boolean;
}

export default function GlassBlogScreen() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest');

  const categories = [
    'all',
    'Дизайн',
    'Мастерство',
    'Материалы',
    'Технологии',
    'Тренды',
    'История'
  ];

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchBlogPosts = async () => {
      // Loading handled by API hooks
    };

    fetchBlogPosts();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case 'popular':
        return b.views - a.views;
      case 'trending':
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  const featuredPosts = sortedPosts.filter(post => post.featured);
  const regularPosts = sortedPosts.filter(post => !post.featured);

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 glass-bg-secondary rounded" />
              ))}
            </div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Блог
              </GlassCardTitle>
              
              <div className="flex gap-3">
                <GlassButton variant="secondary" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Написать статью
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
                placeholder="Поиск статей..."
                className="flex-1 min-w-[300px]"
              />

              {/* Filters */}
              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">Категория:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="glass-bg-primary glass-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'Все категории' : category}
                    </option>
                  ))}
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
                  <option value="popular">Популярные</option>
                  <option value="trending">В тренде</option>
                </select>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold glass-text-primary mb-6">Рекомендуемые статьи</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <GlassCard key={post.id} variant="elevated" padding="none" className="overflow-hidden hover:glass-shadow-lg transition-all">
                  <div className="aspect-video glass-bg-secondary overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <GlassCardHeader>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 glass-bg-accent-orange-500 text-white rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                      <span className="px-2 py-1 glass-bg-success text-white rounded-full text-xs font-medium">
                        Рекомендуем
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold glass-text-primary mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="glass-text-secondary mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm glass-text-muted mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                          {post.author.avatar ? (
                            <img 
                              src={post.author.avatar} 
                              alt={post.author.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg className="w-3 h-3 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>
                        <span>{post.author.name}</span>
                      </div>
                      <span>•</span>
                      <span>{formatDate(post.publishedAt)}</span>
                      <span>•</span>
                      <span>{post.readTime} мин чтения</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm glass-text-muted">
                        <span>{post.views} просмотров</span>
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1 transition-colors ${
                            post.isLiked ? 'glass-text-accent-orange-500' : 'glass-text-muted hover:glass-text-primary'
                          }`}
                        >
                          <svg className="w-4 h-4" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {post.likes}
                        </button>
                      </div>
                      <GlassButton variant="gradient" size="sm">
                        Читать
                      </GlassButton>
                    </div>
                  </GlassCardHeader>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post) => (
            <GlassCard key={post.id} variant="interactive" padding="none" className="overflow-hidden hover:glass-shadow-md transition-all">
              <div className="aspect-video glass-bg-secondary overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <GlassCardHeader>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 glass-bg-accent-blue-500 text-white rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                </div>
                <h3 className="font-semibold glass-text-primary mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="glass-text-secondary text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center gap-3 text-xs glass-text-muted mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                      {post.author.avatar ? (
                        <img 
                          src={post.author.avatar} 
                          alt={post.author.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-3 h-3 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <span>{post.author.name}</span>
                  </div>
                  <span>•</span>
                  <span>{formatDate(post.publishedAt)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs glass-text-muted">
                    <span>{post.readTime} мин</span>
                    <span>•</span>
                    <span>{post.views} просмотров</span>
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        post.isLiked ? 'glass-text-accent-orange-500' : 'glass-text-muted hover:glass-text-primary'
                      }`}
                    >
                      <svg className="w-3 h-3" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {post.likes}
                    </button>
                  </div>
                  <GlassButton variant="ghost" size="sm">
                    Читать
                  </GlassButton>
                </div>
              </GlassCardHeader>
            </GlassCard>
          ))}
        </div>

        {sortedPosts.length === 0 && (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Статьи не найдены
              </h3>
              <p className="glass-text-secondary mb-4">
                Попробуйте изменить поисковый запрос или фильтры
              </p>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
