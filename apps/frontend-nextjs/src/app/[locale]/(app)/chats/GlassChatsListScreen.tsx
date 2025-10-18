'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton, 
  GlassInput 
} from '@/components/ui/glass';
import { useChats } from '@/lib/api/hooks';
import { Chat } from '@/lib/api/types';

export default function GlassChatsListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'pinned'>('all');
  
  // API hooks
  const { data: chats, loading, error, refresh } = useChats();

  // Data is fetched via API hooks

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Только что';
    if (diffInHours < 24) return `${diffInHours}ч назад`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}д назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const filteredChats = chats.filter((chat: any) => {
    const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'unread') return matchesSearch && chat.unreadCount > 0;
    if (filter === 'pinned') return matchesSearch && chat.isPinned;
    return matchesSearch;
  });

  const sortedChats = filteredChats.sort((a: any, b: any) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
  });

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <GlassCard key={i} variant="interactive" padding="lg" className="animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 glass-bg-secondary rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 glass-bg-secondary rounded mb-2" />
                    <div className="h-3 glass-bg-secondary rounded w-2/3" />
                  </div>
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <GlassCardTitle level={1} className="flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Чаты
              </GlassCardTitle>
              
              <GlassButton variant="gradient" size="lg">
                Новый чат
              </GlassButton>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              {/* Search */}
              <GlassInput
                name="search"
                type="text"
                placeholder="Поиск чатов..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'unread', 'pinned'] as const).map((filterType) => (
                  <GlassButton
                    key={filterType}
                    variant={filter === filterType ? 'gradient' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                  >
                    {filterType === 'all' && 'Все чаты'}
                    {filterType === 'unread' && 'Непрочитанные'}
                    {filterType === 'pinned' && 'Закрепленные'}
                  </GlassButton>
                ))}
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Chats List */}
        <div className="space-y-2">
          {sortedChats.map((chat: any) => (
            <GlassCard 
              key={chat.id} 
              variant="interactive" 
              padding="lg" 
              className="hover:glass-shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  {chat.type === 'direct' ? (
                    <div className="w-12 h-12 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                      {chat.participants[0]?.avatar ? (
                        <img 
                          src={chat.participants[0].avatar} 
                          alt={chat.participants[0].name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-6 h-6 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                  ) : (
                    <div className="w-12 h-12 glass-bg-accent-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Online indicator */}
                  {chat.type === 'direct' && chat.participants[0]?.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 glass-bg-success rounded-full border-2 border-white" />
                  )}
                  
                  {/* Unread badge */}
                  {chat.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 glass-bg-accent-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold glass-text-primary truncate">
                      {chat.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {chat.isPinned && (
                        <svg className="w-4 h-4 glass-text-accent-orange-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      )}
                      <span className="text-xs glass-text-muted">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                  </div>
                  
                  <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'glass-text-primary font-medium' : 'glass-text-secondary'}`}>
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Empty State */}
        {sortedChats.length === 0 && (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Чаты не найдены
              </h3>
              <p className="glass-text-secondary mb-4">
                {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Начните новый разговор'}
              </p>
              <GlassButton variant="gradient" size="lg">
                Новый чат
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
