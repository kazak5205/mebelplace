'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton,
  GlassInput 
} from '@/components/ui/glass';

interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  level: 'junior' | 'middle' | 'senior' | 'lead';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  benefits: string[];
  postedAt: string;
  deadline?: string;
  remote: boolean;
  urgent: boolean;
}

export default function GlassCareersScreen() {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const departments = [
    'all',
    'Разработка',
    'Дизайн',
    'Маркетинг',
    'Продажи',
    'Поддержка',
    'Менеджмент'
  ];

  const types = [
    'all',
    'full-time',
    'part-time',
    'contract',
    'internship'
  ];

  const levels = [
    'all',
    'junior',
    'middle',
    'senior',
    'lead'
  ];

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchJobPositions = async () => {
      // Loading handled by API hooks
    };

    fetchJobPositions();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'full-time': return 'Полная занятость';
      case 'part-time': return 'Частичная занятость';
      case 'contract': return 'Контракт';
      case 'internship': return 'Стажировка';
      default: return type;
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'junior': return 'Junior';
      case 'middle': return 'Middle';
      case 'senior': return 'Senior';
      case 'lead': return 'Lead';
      default: return level;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'junior': return 'glass-bg-success text-white';
      case 'middle': return 'glass-bg-accent-blue-500 text-white';
      case 'senior': return 'glass-bg-accent-orange-500 text-white';
      case 'lead': return 'glass-bg-accent-purple-500 text-white';
      default: return 'glass-bg-secondary text-white';
    }
  };

  const filteredPositions = positions.filter(position => {
    const matchesSearch = position.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         position.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || position.department === selectedDepartment;
    const matchesType = selectedType === 'all' || position.type === selectedType;
    const matchesLevel = selectedLevel === 'all' || position.level === selectedLevel;
    
    return matchesSearch && matchesDepartment && matchesType && matchesLevel;
  });

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            {Array.from({ length: 5 }).map((_, i) => (
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
        <GlassCard variant="elevated" padding="xl" className="mb-8 text-center">
          <GlassCardContent>
            <h1 className="text-4xl md:text-6xl font-bold glass-text-primary mb-6">
              Присоединяйтесь к <span className="glass-text-accent-orange-500">команде</span>
            </h1>
            <p className="text-xl glass-text-secondary leading-relaxed max-w-3xl mx-auto mb-8">
              Мы строим будущее мебельной индустрии. Станьте частью команды, которая меняет то, 
              как люди создают и покупают мебель.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassButton variant="gradient" size="xl">
                Посмотреть вакансии
              </GlassButton>
              <GlassButton variant="secondary" size="xl">
                Отправить резюме
              </GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Filters */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardContent>
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <GlassInput
                value={searchQuery}
                onValueChange={setSearchQuery}
                placeholder="Поиск вакансий..."
                className="flex-1 min-w-[300px]"
              />

              {/* Department Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">Отдел:</span>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="glass-bg-primary glass-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'Все отделы' : dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">Тип:</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="glass-bg-primary glass-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'Все типы' : getTypeText(type)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">Уровень:</span>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="glass-bg-primary glass-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level === 'all' ? 'Все уровни' : getLevelText(level)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Job Positions */}
        <div className="space-y-6">
          {filteredPositions.map((position) => (
            <GlassCard key={position.id} variant="elevated" padding="lg">
              <GlassCardHeader>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-semibold glass-text-primary mb-2">
                          {position.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm glass-text-secondary mb-3">
                          <span>{position.department}</span>
                          <span>•</span>
                          <span>{position.location}</span>
                          {position.remote && (
                            <>
                              <span>•</span>
                              <span className="glass-text-accent-blue-500">Удаленно</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {position.urgent && (
                          <span className="px-3 py-1 glass-bg-danger text-white rounded-full text-sm font-medium">
                            Срочно
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(position.level)}`}>
                          {getLevelText(position.level)}
                        </span>
                        <span className="px-3 py-1 glass-bg-secondary text-white rounded-full text-sm font-medium">
                          {getTypeText(position.type)}
                        </span>
                      </div>
                    </div>

                    <p className="glass-text-secondary leading-relaxed mb-6">
                      {position.description}
                    </p>

                    {/* Salary */}
                    {position.salary && (
                      <div className="glass-bg-accent-orange-500/20 rounded-lg p-4 mb-6">
                        <div className="text-lg font-semibold glass-text-accent-orange-500">
                          {formatCurrency(position.salary.min)} - {formatCurrency(position.salary.max)}
                        </div>
                        <div className="text-sm glass-text-secondary">
                          Зарплата в месяц
                        </div>
                      </div>
                    )}

                    {/* Requirements */}
                    <div className="mb-6">
                      <h4 className="font-semibold glass-text-primary mb-3">Требования:</h4>
                      <ul className="space-y-2">
                        {position.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm glass-text-secondary">
                            <svg className="w-4 h-4 glass-text-accent-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Benefits */}
                    <div className="mb-6">
                      <h4 className="font-semibold glass-text-primary mb-3">Мы предлагаем:</h4>
                      <ul className="space-y-2">
                        {position.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm glass-text-secondary">
                            <svg className="w-4 h-4 glass-text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <GlassButton variant="gradient" size="lg">
                      Откликнуться
                    </GlassButton>
                    <GlassButton variant="secondary" size="lg">
                      Поделиться
                    </GlassButton>
                    <GlassButton variant="ghost" size="lg">
                      Сохранить
                    </GlassButton>
                  </div>
                </div>
              </GlassCardHeader>
              
              <GlassCardContent>
                <div className="flex items-center justify-between text-sm glass-text-muted pt-4 border-t border-white/10">
                  <div className="flex items-center gap-4">
                    <span>Опубликовано: {formatDate(position.postedAt)}</span>
                    {position.deadline && (
                      <>
                        <span>•</span>
                        <span>До: {formatDate(position.deadline)}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span>ID: {position.id}</span>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>

        {filteredPositions.length === 0 && (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Вакансии не найдены
              </h3>
              <p className="glass-text-secondary mb-4">
                Попробуйте изменить фильтры или поисковый запрос
              </p>
              <GlassButton variant="gradient" size="lg">
                Отправить резюме
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
