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

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  seller: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    location: string;
  };
  images: string[];
  condition: 'new' | 'used' | 'refurbished';
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  createdAt: string;
  views: number;
  likes: number;
}

export default function GlassMarketplaceScreen() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_low' | 'price_high' | 'popular'>('newest');

  // Data is fetched via API hooks
  const loading = false; // Will be replaced with real API hook when ready

  const categories = [
    'all',
    'Готовые изделия',
    'Материалы',
    'Инструменты',
    'Фурнитура',
    'Аксессуары',
    'Антиквариат'
  ];

  useEffect(() => {
    // Data is fetched via API hooks
    const fetchItems = async () => {
      // Loading handled by API hooks
    };

    fetchItems();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'glass-bg-success text-white';
      case 'used': return 'glass-bg-accent-orange-500 text-white';
      case 'refurbished': return 'glass-bg-accent-blue-500 text-white';
      default: return 'glass-bg-secondary text-white';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'new': return 'Новое';
      case 'used': return 'Б/У';
      case 'refurbished': return 'Восстановлено';
      default: return condition;
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock': return 'glass-bg-success text-white';
      case 'limited': return 'glass-bg-accent-orange-500 text-white';
      case 'out_of_stock': return 'glass-bg-danger text-white';
      default: return 'glass-bg-secondary text-white';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'in_stock': return 'В наличии';
      case 'limited': return 'Ограничено';
      case 'out_of_stock': return 'Нет в наличии';
      default: return availability;
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || item.category === category;
    
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'popular':
        return b.views - a.views;
      default:
        return 0;
    }
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Маркетплейс
              </GlassCardTitle>
              
              <div className="flex gap-3">
                <GlassButton variant="secondary" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Мои объявления
                </GlassButton>
                <GlassButton variant="gradient" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Разместить объявление
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
                placeholder="Поиск товаров..."
                className="flex-1 min-w-[300px]"
              />

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

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">Сортировка:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="glass-bg-primary glass-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="newest">Новые</option>
                  <option value="oldest">Старые</option>
                  <option value="price_low">Цена: по возрастанию</option>
                  <option value="price_high">Цена: по убыванию</option>
                  <option value="popular">Популярные</option>
                </select>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Items Grid */}
        {sortedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedItems.map((item) => (
              <GlassCard key={item.id} variant="interactive" padding="none" className="hover:glass-shadow-lg transition-all">
                <div className="relative aspect-video">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-blue-500/20 flex items-center justify-center">
                    <div className="w-16 h-16 glass-bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                      {getConditionText(item.condition)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(item.availability)}`}>
                      {getAvailabilityText(item.availability)}
                    </span>
                  </div>
                  
                  {/* Views */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 glass-bg-primary text-white rounded-full text-xs font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {formatViews(item.views)}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold glass-text-primary mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm glass-text-secondary mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                      {item.seller.avatar ? (
                        <img 
                          src={item.seller.avatar} 
                          alt={item.seller.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-4 h-4 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm glass-text-primary font-medium">
                        {item.seller.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs glass-text-muted">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span>{item.seller.rating}</span>
                        </div>
                        <span>•</span>
                        <span>{item.seller.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs glass-text-muted">{item.category}</span>
                    <div className="flex items-center gap-1 text-sm glass-text-muted">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {item.likes}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold glass-text-accent-orange-500">
                      {formatCurrency(item.price)}
                    </div>
                    <div className="flex gap-2">
                      <GlassButton variant="gradient" size="sm">
                        Купить
                      </GlassButton>
                      <GlassButton variant="ghost" size="sm">
                        ⋯
                      </GlassButton>
                    </div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Товары не найдены
              </h3>
              <p className="glass-text-secondary mb-4">
                Попробуйте изменить поисковый запрос или категорию
              </p>
              <GlassButton variant="gradient" size="lg">
                Разместить первое объявление
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
