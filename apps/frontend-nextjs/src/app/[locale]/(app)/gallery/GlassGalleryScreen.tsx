'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton } from '@/components/ui/glass';

export default function GlassGalleryScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    {id: 'all', name: 'Все работы'},
    {id: 'kitchen', name: 'Кухни'},
    {id: 'bedroom', name: 'Спальни'},
    {id: 'living', name: 'Гостиные'},
    {id: 'office', name: 'Офисная мебель'},
    {id: 'custom', name: 'Индивидуальные проекты'}
  ];

  const galleryItems = [
    {id: '1', category: 'kitchen', title: 'Современная кухня из массива дуба', author: 'Мастер Иван', image: '/api/placeholder/400/300', likes: 45},
    {id: '2', category: 'bedroom', title: 'Кровать с изголовьем в стиле лофт', author: 'Анна Дизайнер', image: '/api/placeholder/400/300', likes: 32},
    {id: '3', category: 'living', title: 'Гостиная с встроенными шкафами', author: 'Петр Столяр', image: '/api/placeholder/400/300', likes: 67},
    {id: '4', category: 'office', title: 'Рабочий стол из ореха', author: 'Мастер Сергей', image: '/api/placeholder/400/300', likes: 28},
    {id: '5', category: 'custom', title: 'Уникальная библиотека', author: 'Ольга Мебельщик', image: '/api/placeholder/400/300', likes: 89},
    {id: '6', category: 'kitchen', title: 'Кухня в скандинавском стиле', author: 'Игорь Мастер', image: '/api/placeholder/400/300', likes: 54}
  ];

  const filteredItems = galleryItems.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto">
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <GlassCardTitle level={1} className="flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Галерея работ
              </GlassCardTitle>
              
              <div className="flex gap-3">
                <GlassButton variant="secondary" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Добавить работу
                </GlassButton>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <GlassButton
                  key={category.id}
                  variant={selectedCategory === category.id ? 'gradient' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </GlassButton>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <GlassCard key={item.id} variant="interactive" padding="none" className="overflow-hidden hover:glass-shadow-lg transition-all">
              <div className="aspect-[4/3] glass-bg-secondary overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <GlassCardHeader>
                <h3 className="font-semibold glass-text-primary mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm glass-text-secondary mb-3">
                  Автор: {item.author}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm glass-text-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{item.likes}</span>
                  </div>
                  <GlassButton variant="ghost" size="sm">
                    Подробнее
                  </GlassButton>
                </div>
              </GlassCardHeader>
            </GlassCard>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Работы не найдены
              </h3>
              <p className="glass-text-secondary mb-4">
                Попробуйте выбрать другую категорию
              </p>
              <GlassButton variant="gradient" size="lg">
                Добавить первую работу
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
