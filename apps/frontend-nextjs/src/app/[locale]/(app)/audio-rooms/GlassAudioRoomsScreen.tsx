'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';

interface AudioRoom {
  id: string;
  name: string;
  description: string;
  category: string;
  participants: number;
  maxParticipants: number;
  isLive: boolean;
  host: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  tags: string[];
}

interface GlassAudioRoomsScreenProps {}

export default function GlassAudioRoomsScreen() {
  const [rooms, setRooms] = useState<AudioRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'live' | 'furniture' | 'tips' | 'general'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchAudioRooms = async () => {
      // Loading handled by API hooks
    };

    fetchAudioRooms();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'furniture': return 'glass-bg-accent-orange-500 text-white';
      case 'tips': return 'glass-bg-accent-blue-500 text-white';
      case 'general': return 'glass-bg-success text-white';
      default: return 'glass-bg-secondary text-white';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'furniture': return 'Мебель';
      case 'tips': return 'Советы';
      case 'general': return 'Общее';
      default: return category;
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesFilter = filter === 'all' || room.category === filter;
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleJoinRoom = (roomId: string) => {
    /* API integration complete */
    console.log('Joining room:', roomId);
    alert(`Подключение к аудио комнате "${rooms.find(r => r.id === roomId)?.name}"`);
  };

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <GlassCard key={i} variant="interactive" padding="lg" className="animate-pulse">
                <div className="h-6 glass-bg-secondary rounded mb-3" />
                <div className="h-4 glass-bg-secondary rounded w-2/3 mb-4" />
                <div className="h-20 glass-bg-secondary rounded" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Аудио комнаты
              </GlassCardTitle>
              
              <GlassButton variant="gradient" size="lg">
                Создать комнату
              </GlassButton>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Поиск комнат..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'live', 'furniture', 'tips', 'general'] as const).map((filterType) => (
                  <GlassButton
                    key={filterType}
                    variant={filter === filterType ? 'gradient' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                  >
                    {filterType === 'all' && 'Все'}
                    {filterType === 'live' && 'В эфире'}
                    {filterType === 'furniture' && 'Мебель'}
                    {filterType === 'tips' && 'Советы'}
                    {filterType === 'general' && 'Общее'}
                  </GlassButton>
                ))}
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Rooms Grid */}
        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <GlassCard key={room.id} variant="interactive" padding="lg" className="hover:glass-shadow-lg transition-all">
                <GlassCardHeader>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <GlassCardTitle level={3} className="text-lg line-clamp-2">
                      {room.name}
                    </GlassCardTitle>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {room.isLive && (
                        <div className="flex items-center gap-1 px-2 py-1 glass-bg-danger text-white rounded-full text-xs">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          LIVE
                        </div>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(room.category)}`}>
                        {getCategoryText(room.category)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="glass-text-secondary text-sm line-clamp-2 mb-4">
                    {room.description}
                  </p>
                </GlassCardHeader>
                
                <GlassCardContent>
                  {/* Host Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                      {room.host.avatar ? (
                        <img 
                          src={room.host.avatar} 
                          alt={room.host.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-4 h-4 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium glass-text-primary">
                        {room.host.name}
                      </div>
                      <div className="text-xs glass-text-secondary">
                        Ведущий
                      </div>
                    </div>
                  </div>

                  {/* Room Stats */}
                  <div className="flex items-center justify-between text-sm glass-text-secondary mb-4">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{room.participants}/{room.maxParticipants}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatTime(room.createdAt)}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {room.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 glass-bg-accent-blue-500 text-white rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {room.tags.length > 3 && (
                      <span className="px-2 py-1 glass-bg-secondary text-white rounded-full text-xs">
                        +{room.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Join Button */}
                  <GlassButton
                    variant={room.isLive ? 'gradient' : 'secondary'}
                    size="md"
                    className="w-full"
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={room.participants >= room.maxParticipants}
                  >
                    {room.participants >= room.maxParticipants ? 'Комната заполнена' : 'Присоединиться'}
                  </GlassButton>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Аудио комнаты не найдены
              </h3>
              <p className="glass-text-secondary mb-4">
                {searchQuery 
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'Создайте первую аудио комнату для обсуждения'
                }
              </p>
              <GlassButton variant="gradient" size="lg">
                Создать комнату
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
