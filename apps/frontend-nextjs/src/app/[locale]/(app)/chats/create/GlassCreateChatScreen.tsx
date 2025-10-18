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

interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  profession?: string;
}

interface GlassCreateChatScreenProps {}

export default function GlassCreateChatScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatName, setChatName] = useState('');
  const [chatType, setChatType] = useState<'direct' | 'group'>('direct');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchUsers = async () => {
      // Loading handled by API hooks
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.profession?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSelect = (user: User) => {
    if (chatType === 'direct') {
      setSelectedUsers([user]);
    } else {
      if (selectedUsers.find(u => u.id === user.id)) {
        setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    }
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;

    setCreating(true);
    try {
      // API integration - using mock data structure matching API types
      console.log('Creating chat:', {
        type: chatType,
        name: chatName,
        users: selectedUsers
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to the created chat
      const chatId = Date.now().toString(); // Mock chat ID
      router.push(`/chats/${chatId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setCreating(false);
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    return lastSeen;
  };

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            <div className="h-12 glass-bg-secondary rounded mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 glass-bg-secondary rounded" />
              ))}
            </div>
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
            <GlassCardTitle level={1} className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Создать чат
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="glass-text-secondary">
              Выберите собеседников для создания нового чата
            </p>
          </GlassCardContent>
        </GlassCard>

        {/* Chat Type Selection */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle level={2} className="text-lg">
              Тип чата
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex gap-4">
              <button
                onClick={() => setChatType('direct')}
                className={`flex-1 p-4 rounded-lg border transition-colors ${
                  chatType === 'direct'
                    ? 'glass-bg-accent-orange-500 text-white border-orange-400'
                    : 'glass-bg-secondary glass-text-primary glass-border hover:glass-bg-primary'
                }`}
              >
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="font-semibold">Личный чат</h3>
                  <p className="text-sm opacity-80">Разговор с одним человеком</p>
                </div>
              </button>
              
              <button
                onClick={() => setChatType('group')}
                className={`flex-1 p-4 rounded-lg border transition-colors ${
                  chatType === 'group'
                    ? 'glass-bg-accent-orange-500 text-white border-orange-400'
                    : 'glass-bg-secondary glass-text-primary glass-border hover:glass-bg-primary'
                }`}
              >
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="font-semibold">Групповой чат</h3>
                  <p className="text-sm opacity-80">Разговор с несколькими людьми</p>
                </div>
              </button>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Group Chat Name (if group selected) */}
        {chatType === 'group' && (
          <GlassCard variant="elevated" padding="lg" className="mb-6">
            <GlassCardHeader>
              <GlassCardTitle level={2} className="text-lg">
                Название группы
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <GlassInput
                value={chatName}
                 onValueChange={setChatName}
                placeholder="Введите название группы..."
                className="w-full"
              />
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Search */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle level={2} className="text-lg">
              Поиск пользователей
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <GlassInput
              value={searchQuery}
               onValueChange={setSearchQuery}
              placeholder="Поиск по имени или профессии..."
              className="w-full"
            />
          </GlassCardContent>
        </GlassCard>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <GlassCard variant="elevated" padding="lg" className="mb-6">
            <GlassCardHeader>
              <GlassCardTitle level={2} className="text-lg">
                Выбранные участники ({selectedUsers.length})
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="flex flex-wrap gap-3">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 glass-bg-accent-orange-500 text-white px-3 py-2 rounded-full">
                    <div className="w-6 h-6 glass-bg-primary rounded-full flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                    <button
                      onClick={() => handleUserSelect(user)}
                      className="ml-1 text-white hover:text-gray-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Users List */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle level={2} className="text-lg">
              Все пользователи
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.find(u => u.id === user.id)
                      ? 'glass-bg-accent-orange-500 text-white'
                      : 'glass-bg-secondary glass-text-primary hover:glass-bg-primary'
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 glass-bg-primary rounded-full flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-6 h-6 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    {user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 glass-bg-success rounded-full border-2 border-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {user.name}
                    </h3>
                    <p className="text-sm opacity-80">
                      {user.profession}
                    </p>
                    {!user.isOnline && user.lastSeen && (
                      <p className="text-xs opacity-60">
                        Был(а) в сети {formatLastSeen(user.lastSeen)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {selectedUsers.find(u => u.id === user.id) && (
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold glass-text-primary mb-2">
                  Пользователи не найдены
                </h3>
                <p className="glass-text-secondary">
                  Попробуйте изменить поисковый запрос
                </p>
              </div>
            )}
          </GlassCardContent>
        </GlassCard>

        {/* Create Button */}
        <div className="text-center">
          <GlassButton
            variant="gradient"
            size="xl"
            onClick={handleCreateChat}
            loading={creating}
            disabled={selectedUsers.length === 0 || (chatType === 'group' && !chatName.trim())}
            className="min-w-[200px]"
          >
            {creating ? 'Создание...' : 'Создать чат'}
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
