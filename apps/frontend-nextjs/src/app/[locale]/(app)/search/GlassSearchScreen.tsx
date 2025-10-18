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
import { useSearch } from '@/lib/api/hooks';

interface SearchResult {
  id: string;
  type: 'video' | 'user' | 'request';
  title: string;
  description: string;
  author?: string;
  thumbnail?: string;
  rating?: number;
  price?: number;
  location?: string;
  tags: string[];
}

export default function GlassSearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'video' | 'user' | 'request' | 'master',
    location: '',
    minPrice: '',
    maxPrice: '',
    rating: 0
  });

  // API hooks
  const { search, searchUsers, searchMasters, results: apiResults, loading, error } = useSearch();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    try {
      let searchType: 'all' | 'users' | 'masters' | 'requests' = 'all';
      
      if (filters.type === 'user') searchType = 'users';
      else if (filters.type === 'master') searchType = 'masters';
      else if (filters.type === 'request') searchType = 'requests';
      
      if (searchType === 'users') {
        await searchUsers(query);
      } else if (searchType === 'masters') {
        await searchMasters(query, filters.location);
      } else {
        await search(query, searchType);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Transform API results to SearchResult format
  useEffect(() => {
    if (apiResults && apiResults.length > 0) {
      const transformedResults: SearchResult[] = apiResults.map((result: any) => ({
        id: result.id,
        type: result.type || 'video',
        title: result.title || result.name || result.description,
        description: result.description || result.bio || '',
        author: result.author?.name || result.name,
        thumbnail: result.thumbnail || result.avatar,
        rating: result.rating,
        price: result.price || result.budget,
        location: result.location,
        tags: result.tags || result.categories || []
      }));
      setResults(transformedResults);
    }
  }, [apiResults]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      location: '',
      minPrice: '',
      maxPrice: '',
      rating: 0
    });
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto">
        {/* Search Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle level={1} className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Поиск
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex gap-4">
              <GlassInput
                name="search"
                type="text"
                placeholder="Поиск видео, мастеров, заказов..."
                value={query}
                onValueChange={setQuery}
                className="flex-1"
              />
              <GlassButton
                variant="gradient"
                size="lg"
                onClick={handleSearch}
                loading={loading}
              >
                Найти
              </GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Filters */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle level={2} className="text-lg">
              Фильтры
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium glass-text-primary mb-2">
                  Тип
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">Все</option>
                  <option value="video">Видео</option>
                  <option value="user">Мастера</option>
                  <option value="request">Заказы</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium glass-text-primary mb-2">
                  Город
                </label>
                <GlassInput
                  name="location"
                  type="text"
                  placeholder="Алматы"
                  value={filters.location}
                  onValueChange={(value) => handleFilterChange('location', value)}
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium glass-text-primary mb-2">
                  Цена от
                </label>
                <GlassInput
                  name="minPrice"
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onValueChange={(value) => handleFilterChange('minPrice', value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium glass-text-primary mb-2">
                  Цена до
                </label>
                <GlassInput
                  name="maxPrice"
                  type="number"
                  placeholder="1000000"
                  value={filters.maxPrice}
                  onValueChange={(value) => handleFilterChange('maxPrice', value)}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={clearFilters}
              >
                Очистить фильтры
              </GlassButton>
              <GlassButton
                variant="gradient"
                size="sm"
                onClick={handleSearch}
                loading={loading}
              >
                Применить
              </GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Error State */}
        {error && (
          <GlassCard variant="elevated" padding="lg" className="mb-6">
            <div className="text-center">
              <div className="glass-text-danger mb-4">{error}</div>
              <GlassButton variant="gradient" onClick={handleSearch}>Попробовать снова</GlassButton>
            </div>
          </GlassCard>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <GlassCard variant="elevated" padding="lg">
            <GlassCardHeader>
              <GlassCardTitle level={2} className="text-lg">
                Результаты поиска ({results.length})
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-4">
                {results.map((result) => (
                  <GlassCard key={result.id} variant="interactive" padding="lg" className="hover:glass-shadow-md transition-all">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      {result.thumbnail && (
                        <div className="w-24 h-24 glass-bg-secondary rounded-lg flex-shrink-0 overflow-hidden">
                          <img 
                            src={result.thumbnail} 
                            alt={result.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold glass-text-primary mb-1">
                              {result.title}
                            </h3>
                            <p className="glass-text-secondary text-sm mb-2">
                              {result.description}
                            </p>
                            {result.author && (
                              <p className="glass-text-muted text-xs mb-2">
                                Автор: {result.author}
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right">
                            {result.rating && (
                              <div className="flex items-center gap-1 mb-1">
                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                                <span className="text-sm font-medium glass-text-primary">
                                  {result.rating}
                                </span>
                              </div>
                            )}
                            {result.price && (
                              <p className="text-sm font-semibold glass-text-accent-orange-500">
                                {result.price.toLocaleString()} ₸
                              </p>
                            )}
                            {result.location && (
                              <p className="text-xs glass-text-muted">
                                {result.location}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {result.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 glass-bg-secondary glass-border rounded-full text-xs glass-text-secondary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Action Button */}
                        <div className="mt-3">
                          <GlassButton 
                            variant="gradient" 
                            size="sm"
                            onClick={() => {
                              if (result.type === 'video') {
                                window.location.href = `/video/${result.id}`;
                              } else if (result.type === 'user') {
                                window.location.href = `/profile/${result.id}`;
                              } else if (result.type === 'request') {
                                window.location.href = `/requests/${result.id}`;
                              }
                            }}
                          >
                            {result.type === 'video' ? 'Смотреть' : 
                             result.type === 'user' ? 'Профиль' : 
                             'Подробнее'}
                          </GlassButton>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && query && (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Ничего не найдено
              </h3>
              <p className="glass-text-secondary">
                Попробуйте изменить поисковый запрос или фильтры
              </p>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
