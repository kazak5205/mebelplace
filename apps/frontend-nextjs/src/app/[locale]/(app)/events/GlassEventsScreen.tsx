'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton, GlassInput } from '@/components/ui/glass';

export default function GlassEventsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const events = [
    {
      id: '1',
      title: 'Выставка мебели "Дом и сад"',
      date: '2024-02-15T10:00:00Z',
      location: 'Алматы, выставочный центр "Атакент"',
      type: 'exhibition',
      price: 0,
      description: 'Крупнейшая выставка мебели и интерьера в Казахстане',
      attendees: 250,
      image: '/api/placeholder/400/200'
    },
    {
      id: '2',
      title: 'Мастер-класс по реставрации мебели',
      date: '2024-02-20T14:00:00Z',
      location: 'Алматы, мастерская "Старина"',
      type: 'workshop',
      price: 15000,
      description: 'Обучение техникам реставрации антикварной мебели',
      attendees: 15,
      image: '/api/placeholder/400/200'
    },
    {
      id: '3',
      title: 'Конференция "Будущее мебельной индустрии"',
      date: '2024-03-01T09:00:00Z',
      location: 'Алматы, отель "Ритц-Карлтон"',
      type: 'conference',
      price: 25000,
      description: 'Обсуждение трендов и инноваций в мебельной отрасли',
      attendees: 120,
      image: '/api/placeholder/400/200'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'exhibition': return 'Выставка';
      case 'workshop': return 'Мастер-класс';
      case 'conference': return 'Конференция';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exhibition': return 'glass-bg-accent-blue-500';
      case 'workshop': return 'glass-bg-accent-orange-500';
      case 'conference': return 'glass-bg-accent-purple-500';
      default: return 'glass-bg-secondary';
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || event.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto">
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <GlassCardTitle level={1} className="flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                События
              </GlassCardTitle>
              
              <div className="flex gap-3">
                <GlassButton variant="secondary" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Создать событие
                </GlassButton>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-4">
              <GlassInput
                value={searchQuery}
                 onValueChange={setSearchQuery}
                placeholder="Поиск событий..."
                className="flex-1 min-w-[300px]"
              />

              <div className="flex flex-wrap gap-2">
                {[
                  {id: 'all', label: 'Все'},
                  {id: 'exhibition', label: 'Выставки'},
                  {id: 'workshop', label: 'Мастер-классы'},
                  {id: 'conference', label: 'Конференции'}
                ].map((filterType) => (
                  <GlassButton
                    key={filterType.id}
                    variant={filter === filterType.id ? 'gradient' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(filterType.id)}
                  >
                    {filterType.label}
                  </GlassButton>
                ))}
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <GlassCard key={event.id} variant="interactive" padding="none" className="overflow-hidden hover:glass-shadow-lg transition-all">
              <div className="aspect-video glass-bg-secondary overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <GlassCardHeader>
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getTypeColor(event.type)}`}>
                    {getTypeText(event.type)}
                  </span>
                  <span className="text-sm glass-text-muted">
                    {event.attendees} участников
                  </span>
                </div>
                
                <h3 className="font-semibold glass-text-primary mb-2 line-clamp-2">
                  {event.title}
                </h3>
                
                <p className="glass-text-secondary text-sm mb-3 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm glass-text-muted mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                </div>
              </GlassCardHeader>
              
              <GlassCardContent>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold glass-text-accent-orange-500">
                    {event.price === 0 ? 'Бесплатно' : `${event.price.toLocaleString()} ₸`}
                  </div>
                  <GlassButton variant="gradient" size="sm">
                    Участвовать
                  </GlassButton>
                </div>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                События не найдены
              </h3>
              <p className="glass-text-secondary mb-4">
                Попробуйте изменить фильтры или поисковый запрос
              </p>
              <GlassButton variant="gradient" size="lg">
                Создать первое событие
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
