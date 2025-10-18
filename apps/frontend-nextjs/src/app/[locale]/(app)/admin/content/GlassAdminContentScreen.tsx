'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton } from '@/components/ui/glass';

export default function GlassAdminContentScreen() {
  const [activeTab, setActiveTab] = useState('pages');
  
  const contentTypes = [
    {id: 'pages', name: 'Страницы', count: 15},
    {id: 'posts', name: 'Посты', count: 234},
    {id: 'categories', name: 'Категории', count: 12},
    {id: 'media', name: 'Медиа', count: 1567}
  ];

  const pages = [
    {id: '1', title: 'Главная страница', status: 'published', lastModified: '2024-01-15', author: 'Админ'},
    {id: '2', title: 'О нас', status: 'published', lastModified: '2024-01-14', author: 'Админ'},
    {id: '3', title: 'Контакты', status: 'draft', lastModified: '2024-01-13', author: 'Модератор'},
    {id: '4', title: 'Условия использования', status: 'published', lastModified: '2024-01-12', author: 'Админ'}
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'glass-bg-success text-white';
      case 'draft': return 'glass-bg-secondary text-white';
      case 'archived': return 'glass-bg-muted text-white';
      default: return 'glass-bg-secondary text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Опубликовано';
      case 'draft': return 'Черновик';
      case 'archived': return 'Архив';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto">
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <GlassCardTitle level={1}>Управление контентом</GlassCardTitle>
              <div className="flex gap-3">
                <GlassButton variant="secondary" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Создать
                </GlassButton>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex gap-2">
              {contentTypes.map(type => (
                <GlassButton
                  key={type.id}
                  variant={activeTab === type.id ? 'gradient' : 'ghost'}
                  size="md"
                  onClick={() => setActiveTab(type.id)}
                >
                  {type.name} ({type.count})
                </GlassButton>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={2}>
              {contentTypes.find(t => t.id === activeTab)?.name}
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            {activeTab === 'pages' && (
              <div className="space-y-4">
                {pages.map(page => (
                  <div key={page.id} className="flex items-center justify-between glass-bg-secondary p-4 rounded-lg">
                    <div>
                      <h3 className="font-semibold glass-text-primary mb-1">{page.title}</h3>
                      <div className="flex items-center gap-4 text-sm glass-text-muted">
                        <span>Автор: {page.author}</span>
                        <span>Изменено: {new Date(page.lastModified).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(page.status)}`}>
                        {getStatusText(page.status)}
                      </span>
                      <GlassButton variant="secondary" size="sm">Редактировать</GlassButton>
                      <GlassButton variant="ghost" size="sm">Просмотр</GlassButton>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold glass-text-primary mb-2">
                  Управление постами
                </h3>
                <p className="glass-text-secondary mb-4">
                  Создавайте и редактируйте посты блога
                </p>
                <GlassButton variant="gradient" size="lg">
                  Создать первый пост
                </GlassButton>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold glass-text-primary mb-2">
                  Управление категориями
                </h3>
                <p className="glass-text-secondary mb-4">
                  Организуйте контент по категориям
                </p>
                <GlassButton variant="gradient" size="lg">
                  Создать категорию
                </GlassButton>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold glass-text-primary mb-2">
                  Медиа библиотека
                </h3>
                <p className="glass-text-secondary mb-4">
                  Управляйте изображениями и файлами
                </p>
                <GlassButton variant="gradient" size="lg">
                  Загрузить файлы
                </GlassButton>
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
