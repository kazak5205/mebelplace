'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';

interface CollaborationProject {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  participants: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  }[];
  progress: number;
  deadline: string;
  createdAt: string;
  lastActivity: string;
  files: {
    name: string;
    type: string;
    size: string;
    uploadedBy: string;
    uploadedAt: string;
  }[];
}

interface GlassCollaborationScreenProps {}

export default function GlassCollaborationScreen() {
  const [projects, setProjects] = useState<CollaborationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'pending'>('all');

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchProjects = async () => {
      // Loading handled by API hooks
    };

    fetchProjects();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'glass-bg-success text-white';
      case 'completed': return 'glass-bg-accent-blue-500 text-white';
      case 'pending': return 'glass-bg-accent-orange-500 text-white';
      default: return 'glass-bg-secondary text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'completed': return 'Завершен';
      case 'pending': return 'Ожидает';
      default: return status;
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 glass-bg-secondary rounded" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Совместная работа
              </GlassCardTitle>
              
              <div className="flex gap-3">
                <GlassButton variant="secondary" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Загрузить файл
                </GlassButton>
                <GlassButton variant="gradient" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Новый проект
                </GlassButton>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'active', 'completed', 'pending'] as const).map((filterType) => (
                  <GlassButton
                    key={filterType}
                    variant={filter === filterType ? 'gradient' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                  >
                    {filterType === 'all' && 'Все'}
                    {filterType === 'active' && 'Активные'}
                    {filterType === 'completed' && 'Завершенные'}
                    {filterType === 'pending' && 'Ожидающие'}
                  </GlassButton>
                ))}
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Projects List */}
        {filteredProjects.length > 0 ? (
          <div className="space-y-6">
            {filteredProjects.map((project) => (
              <GlassCard key={project.id} variant="elevated" padding="lg" className="hover:glass-shadow-md transition-all">
                <GlassCardHeader>
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Project Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold glass-text-primary mb-2">
                            {project.title}
                          </h3>
                          <p className="glass-text-secondary leading-relaxed mb-4">
                            {project.description}
                          </p>
                        </div>
                        
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm glass-text-secondary mb-2">
                          <span>Прогресс</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full glass-bg-secondary rounded-full h-2">
                          <div 
                            className="h-2 glass-bg-accent-orange-500 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Participants */}
                      <div className="mb-4">
                        <h4 className="font-semibold glass-text-primary mb-3">Участники:</h4>
                        <div className="flex flex-wrap gap-3">
                          {project.participants.map((participant) => (
                            <div key={participant.id} className="flex items-center gap-2 glass-bg-secondary px-3 py-2 rounded-lg">
                              <div className="w-8 h-8 glass-bg-primary rounded-full flex items-center justify-center overflow-hidden">
                                {participant.avatar ? (
                                  <img 
                                    src={participant.avatar} 
                                    alt={participant.name}
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
                                  {participant.name}
                                </div>
                                <div className="text-xs glass-text-muted">
                                  {participant.role}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Files */}
                      {project.files.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold glass-text-primary mb-3">Файлы:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {project.files.map((file, index) => (
                              <div key={index} className="flex items-center gap-3 glass-bg-secondary p-3 rounded-lg">
                                <div className="w-10 h-10 glass-bg-accent-blue-500 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium glass-text-primary">
                                    {file.name}
                                  </div>
                                  <div className="text-xs glass-text-muted">
                                    {file.type} • {file.size} • {file.uploadedBy}
                                  </div>
                                </div>
                                <GlassButton variant="ghost" size="sm">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </GlassButton>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                      <GlassButton variant="gradient" size="md">
                        Открыть проект
                      </GlassButton>
                      <GlassButton variant="secondary" size="md">
                        Чат
                      </GlassButton>
                      <GlassButton variant="ghost" size="md">
                        Настройки
                      </GlassButton>
                    </div>
                  </div>
                </GlassCardHeader>
                
                <GlassCardContent>
                  <div className="flex items-center justify-between text-sm glass-text-muted pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      <span>Создано: {formatDate(project.createdAt)}</span>
                      <span>•</span>
                      <span>Срок: {formatDate(project.deadline)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>Последняя активность: {formatDate(project.lastActivity)}</span>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Проекты не найдены
              </h3>
              <p className="glass-text-secondary mb-4">
                {filter === 'all' 
                  ? 'У вас пока нет совместных проектов'
                  : `Нет проектов со статусом "${getStatusText(filter)}"`
                }
              </p>
              <GlassButton variant="gradient" size="lg">
                Создать первый проект
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
