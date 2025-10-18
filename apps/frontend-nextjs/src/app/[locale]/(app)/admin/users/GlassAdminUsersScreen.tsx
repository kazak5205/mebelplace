'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton, GlassInput } from '@/components/ui/glass';

export default function GlassAdminUsersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const users = [
    {id: '1', name: 'Иван Иванов', email: 'ivan@example.com', role: 'Мастер', status: 'active', joined: '2024-01-10'},
    {id: '2', name: 'Петр Петров', email: 'petr@example.com', role: 'Клиент', status: 'active', joined: '2024-01-12'},
    {id: '3', name: 'Анна Смирнова', email: 'anna@example.com', role: 'Мастер', status: 'suspended', joined: '2024-01-08'}
  ];

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto">
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <GlassCardTitle level={1}>Управление пользователями</GlassCardTitle>
              <GlassButton variant="gradient">Добавить пользователя</GlassButton>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <GlassInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Поиск пользователей..." />
          </GlassCardContent>
        </GlassCard>

        <div className="space-y-4">
          {users.map(user => (
            <GlassCard key={user.id} variant="interactive" padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold glass-text-primary">{user.name}</h3>
                  <p className="text-sm glass-text-secondary">{user.email} • {user.role}</p>
                  <p className="text-xs glass-text-muted">Зарегистрирован: {user.joined}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${user.status === 'active' ? 'glass-bg-success text-white' : 'glass-bg-danger text-white'}`}>
                    {user.status === 'active' ? 'Активен' : 'Заблокирован'}
                  </span>
                  <GlassButton variant="secondary" size="sm">Редактировать</GlassButton>
                  <GlassButton variant="ghost" size="sm">{user.status === 'active' ? 'Заблокировать' : 'Разблокировать'}</GlassButton>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
