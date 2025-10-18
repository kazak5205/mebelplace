'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';

interface Request {
  id: string;
  title: string;
  description: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    completedProjects: number;
  };
  category: string;
  budget: number;
  location: string;
  deadline: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  responses: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  materials: string[];
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  requirements: string;
  images: string[];
}

interface GlassRequestDetailsScreenProps {
  requestId: string;
}

export default function GlassRequestDetailsScreen({ requestId }: GlassRequestDetailsScreenProps) {
  const [request, setRequest] = useState<Request | null>(null);

  // Data is fetched via API hooks
  const loading = false; // Will be replaced with real API hook when ready

  useEffect(() => {
    // Data is fetched via API hooks
    const fetchRequestDetails = async () => {
      // Loading handled by API hooks
    };

    fetchRequestDetails();
  }, [requestId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'glass-bg-success text-white';
      case 'in_progress': return 'glass-bg-accent-orange-500 text-white';
      case 'completed': return 'glass-bg-accent-blue-500 text-white';
      case 'cancelled': return 'glass-bg-danger text-white';
      default: return 'glass-bg-secondary text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Открыт';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 glass-bg-secondary rounded mb-4" />
            <div className="h-4 glass-bg-secondary rounded w-2/3 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-40 glass-bg-secondary rounded" />
                <div className="h-32 glass-bg-secondary rounded" />
              </div>
              <div className="h-64 glass-bg-secondary rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base flex items-center justify-center p-4">
        <GlassCard variant="elevated" padding="xl" className="text-center max-w-md">
          <GlassCardContent>
            <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold glass-text-primary mb-2">
              Заявка не найдена
            </h3>
            <p className="glass-text-secondary mb-4">
              Возможно, заявка была удалена или ссылка неверна
            </p>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <GlassCardTitle level={1} className="text-2xl">
                    {request.title}
                  </GlassCardTitle>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm glass-text-secondary mb-4">
                  <span>{request.author.name}</span>
                  <span>•</span>
                  <span>{request.location}</span>
                  <span>•</span>
                  <span>{formatDate(request.createdAt)}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm glass-text-muted">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {request.responses} откликов
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {request.views} просмотров
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold glass-text-accent-orange-500 mb-1">
                  {request.budget.toLocaleString()} ₸
                </div>
                <div className="text-sm glass-text-secondary">
                  До {formatDate(request.deadline)}
                </div>
              </div>
            </div>
          </GlassCardHeader>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={2} className="text-lg">
                  Описание проекта
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <p className="glass-text-secondary leading-relaxed">
                  {request.description}
                </p>
              </GlassCardContent>
            </GlassCard>

            {/* Images */}
            {request.images.length > 0 && (
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader>
                  <GlassCardTitle level={2} className="text-lg">
                    Фотографии
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {request.images.map((image, index) => (
                      <div key={index} className="aspect-video glass-bg-secondary rounded-lg overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Project image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </GlassCardContent>
              </GlassCard>
            )}

            {/* Specifications */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={2} className="text-lg">
                  Технические характеристики
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium glass-text-primary mb-3">Размеры</h4>
                    <div className="space-y-2 text-sm glass-text-secondary">
                      <div className="flex justify-between">
                        <span>Длина:</span>
                        <span>{request.dimensions.length} см</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ширина:</span>
                        <span>{request.dimensions.width} см</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Высота:</span>
                        <span>{request.dimensions.height} см</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium glass-text-primary mb-3">Материалы</h4>
                    <div className="flex flex-wrap gap-2">
                      {request.materials.map((material, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 glass-bg-accent-blue-500 text-white rounded-full text-sm"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Requirements */}
            {request.requirements && (
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader>
                  <GlassCardTitle level={2} className="text-lg">
                    Дополнительные требования
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <p className="glass-text-secondary leading-relaxed">
                    {request.requirements}
                  </p>
                </GlassCardContent>
              </GlassCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={3}>
                  Автор заявки
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                    {request.author.avatar ? (
                      <img 
                        src={request.author.avatar} 
                        alt={request.author.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold glass-text-primary">
                      {request.author.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm glass-text-secondary">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span>{request.author.rating}</span>
                      </div>
                      <span>•</span>
                      <span>{request.author.completedProjects} проектов</span>
                    </div>
                  </div>
                </div>
                
                <GlassButton variant="secondary" size="md" className="w-full">
                  Написать сообщение
                </GlassButton>
              </GlassCardContent>
            </GlassCard>

            {/* Actions */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={3}>
                  Действия
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-3">
                  <GlassButton variant="gradient" size="md" className="w-full">
                    Откликнуться на заявку
                  </GlassButton>
                  
                  <GlassButton variant="secondary" size="md" className="w-full">
                    Сохранить заявку
                  </GlassButton>
                  
                  <GlassButton variant="ghost" size="md" className="w-full">
                    Поделиться
                  </GlassButton>
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Project Info */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={3}>
                  Информация о проекте
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="glass-text-secondary">Категория:</span>
                    <span className="glass-text-primary">{request.category}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="glass-text-secondary">Бюджет:</span>
                    <span className="glass-text-accent-orange-500 font-semibold">
                      {request.budget.toLocaleString()} ₸
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="glass-text-secondary">Срок:</span>
                    <span className="glass-text-primary">
                      {formatDate(request.deadline)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="glass-text-secondary">Создана:</span>
                    <span className="glass-text-primary">
                      {formatDate(request.createdAt)}
                    </span>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
