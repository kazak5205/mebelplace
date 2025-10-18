'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton } from '@/components/ui/glass';

export default function GlassAwardsScreen() {
  const [activeTab, setActiveTab] = useState('achievements');

  const achievements = [
    {
      id: '1',
      title: 'Мастер года 2023',
      description: 'Лучший мастер по изготовлению мебели',
      recipient: 'Иван Петров',
      date: '2023-12-15',
      category: 'achievement',
      image: '/api/placeholder/200/200'
    },
    {
      id: '2',
      title: 'Лучший дизайн кухни',
      description: 'Победитель конкурса дизайна',
      recipient: 'Анна Смирнова',
      date: '2023-11-20',
      category: 'design',
      image: '/api/placeholder/200/200'
    },
    {
      id: '3',
      title: 'Инновационный проект',
      description: 'За внедрение новых технологий',
      recipient: 'Петр Козлов',
      date: '2023-10-10',
      category: 'innovation',
      image: '/api/placeholder/200/200'
    }
  ];

  const badges = [
    {id: '1', name: 'Первые 10 заказов', description: 'Выполнил первые 10 заказов', earned: true},
    {id: '2', name: 'Отличные отзывы', description: 'Получил 50+ положительных отзывов', earned: true},
    {id: '3', name: 'Эксперт качества', description: 'Все заказы выполнены на 5 звезд', earned: false},
    {id: '4', name: 'Быстрая работа', description: 'Выполняет заказы быстрее среднего', earned: true}
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto">
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <GlassCardTitle level={1} className="flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Награды и достижения
              </GlassCardTitle>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex gap-2">
              {[
                {id: 'achievements', label: 'Достижения', icon: '🏆'},
                {id: 'badges', label: 'Значки', icon: '🎖️'},
                {id: 'leaderboard', label: 'Рейтинг', icon: '📊'}
              ].map(tab => (
                <GlassButton
                  key={tab.id}
                  variant={activeTab === tab.id ? 'gradient' : 'ghost'}
                  size="md"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </GlassButton>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map(achievement => (
              <GlassCard key={achievement.id} variant="elevated" padding="lg">
                <GlassCardHeader>
                  <div className="text-center">
                    <div className="w-20 h-20 glass-bg-accent-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold glass-text-primary mb-2">
                      {achievement.title}
                    </h3>
                    <p className="glass-text-secondary text-sm mb-3">
                      {achievement.description}
                    </p>
                    <div className="text-sm glass-text-muted mb-3">
                      Получатель: {achievement.recipient}
                    </div>
                    <div className="text-xs glass-text-muted">
                      {formatDate(achievement.date)}
                    </div>
                  </div>
                </GlassCardHeader>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {badges.map(badge => (
              <GlassCard key={badge.id} variant={badge.earned ? "elevated" : "interactive"} padding="lg">
                <GlassCardHeader>
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${badge.earned ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold glass-text-primary mb-2 text-sm">
                      {badge.name}
                    </h3>
                    <p className="glass-text-secondary text-xs mb-3">
                      {badge.description}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs ${badge.earned ? 'glass-bg-success text-white' : 'glass-bg-secondary text-white'}`}>
                      {badge.earned ? 'Получен' : 'Не получен'}
                    </span>
                  </div>
                </GlassCardHeader>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <GlassCard variant="elevated" padding="lg">
            <GlassCardHeader>
              <GlassCardTitle level={2}>Рейтинг мастеров</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-4">
                {[
                  {rank: 1, name: 'Иван Петров', rating: 4.9, orders: 156},
                  {rank: 2, name: 'Анна Смирнова', rating: 4.8, orders: 142},
                  {rank: 3, name: 'Петр Козлов', rating: 4.8, orders: 128},
                  {rank: 4, name: 'Мария Иванова', rating: 4.7, orders: 115},
                  {rank: 5, name: 'Сергей Сидоров', rating: 4.7, orders: 103}
                ].map(master => (
                  <div key={master.rank} className="flex items-center justify-between glass-bg-secondary p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        master.rank === 1 ? 'glass-bg-accent-orange-500' :
                        master.rank === 2 ? 'glass-bg-accent-blue-500' :
                        master.rank === 3 ? 'glass-bg-success' :
                        'glass-bg-secondary'
                      }`}>
                        {master.rank}
                      </div>
                      <div>
                        <div className="font-semibold glass-text-primary">{master.name}</div>
                        <div className="text-sm glass-text-secondary">{master.orders} заказов</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span className="font-semibold glass-text-primary">{master.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
