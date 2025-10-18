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

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
  thumbnail: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  rating: number;
  studentsCount: number;
  lessonsCount: number;
  category: string;
  isCompleted: boolean;
  progress: number;
  createdAt: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  isCompleted: boolean;
  isLocked: boolean;
}

export default function GlassLearningScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [level, setLevel] = useState<string>('all');

  // Data is fetched via API hooks
  const loading = false; // Will be replaced with real API hook when ready
  const [activeTab, setActiveTab] = useState<'courses' | 'my-courses' | 'lessons'>('courses');

  const categories = [
    'all',
    'Столярные работы',
    'Реставрация мебели',
    'Дизайн интерьера',
    'Покраска и отделка',
    'Инструменты',
    'Материаловедение'
  ];

  const levels = [
    'all',
    'Начинающий',
    'Средний',
    'Продвинутый'
  ];

  useEffect(() => {
    // Data is fetched via API hooks
    const fetchData = async () => {
      // Loading handled by API hooks
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount === 0) return 'Бесплатно';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatStudents = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'glass-bg-success text-white';
      case 'intermediate': return 'glass-bg-accent-orange-500 text-white';
      case 'advanced': return 'glass-bg-danger text-white';
      default: return 'glass-bg-secondary text-white';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Начинающий';
      case 'intermediate': return 'Средний';
      case 'advanced': return 'Продвинутый';
      default: return level;
    }
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'text': return '📄';
      case 'quiz': return '❓';
      case 'assignment': return '📝';
      default: return '📚';
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || course.category === category;
    const matchesLevel = level === 'all' || course.level === level;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const myCourses = courses.filter(course => course.progress > 0);

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <GlassCard key={i} variant="interactive" padding="none" className="animate-pulse">
                <div className="aspect-video glass-bg-secondary rounded-t-xl" />
                <div className="p-4">
                  <div className="h-4 glass-bg-secondary rounded mb-2" />
                  <div className="h-3 glass-bg-secondary rounded w-2/3" />
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <GlassCardTitle level={1} className="flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Обучение
              </GlassCardTitle>
              
              <div className="flex gap-3">
                <GlassButton variant="secondary" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Мои курсы
                </GlassButton>
                <GlassButton variant="gradient" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Создать курс
                </GlassButton>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <GlassInput
                value={searchQuery}
                onValueChange={setSearchQuery}
                placeholder="Поиск курсов..."
                className="flex-1 min-w-[300px]"
              />

              {/* Filters */}
              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">Категория:</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="glass-bg-primary glass-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'Все категории' : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">Уровень:</span>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="glass-bg-primary glass-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl === 'all' ? 'Все уровни' : lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Navigation Tabs */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'courses', label: 'Все курсы', icon: '📚' },
                { id: 'my-courses', label: 'Мои курсы', icon: '🎓' },
                { id: 'lessons', label: 'Уроки', icon: '📖' }
              ].map((tab) => (
                <GlassButton
                  key={tab.id}
                  variant={activeTab === tab.id ? 'gradient' : 'ghost'}
                  size="md"
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </GlassButton>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Content based on active tab */}
        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <GlassCard key={course.id} variant="interactive" padding="none" className="hover:glass-shadow-lg transition-all">
                <div className="relative aspect-video">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-blue-500/20 flex items-center justify-center">
                    <div className="w-16 h-16 glass-bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Level Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                      {getLevelText(course.level)}
                    </span>
                  </div>
                  
                  {/* Price */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 glass-bg-primary text-white rounded-full text-xs font-medium">
                      {formatCurrency(course.price)}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold glass-text-primary mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-sm glass-text-secondary mb-3 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                      {course.instructor.avatar ? (
                        <img 
                          src={course.instructor.avatar} 
                          alt={course.instructor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-4 h-4 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm glass-text-primary font-medium">
                        {course.instructor.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs glass-text-muted">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span>{course.rating}</span>
                        </div>
                        <span>•</span>
                        <span>{formatStudents(course.studentsCount)} студентов</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm glass-text-muted mb-3">
                    <span>{course.duration}</span>
                    <span>{course.lessonsCount} уроков</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <GlassButton variant="gradient" size="sm" className="flex-1">
                      {course.price === 0 ? 'Начать' : 'Купить'}
                    </GlassButton>
                    <GlassButton variant="ghost" size="sm">
                      ⋯
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'my-courses' && (
          <div className="space-y-6">
            {myCourses.map((course) => (
              <GlassCard key={course.id} variant="elevated" padding="lg">
                <GlassCardHeader>
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="w-48 h-32 glass-bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
                      <div className="w-12 h-12 glass-bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold glass-text-primary mb-2">
                        {course.title}
                      </h3>
                      <p className="glass-text-secondary mb-4">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm glass-text-secondary mb-4">
                        <span>{course.duration}</span>
                        <span>•</span>
                        <span>{course.lessonsCount} уроков</span>
                        <span>•</span>
                        <span>{getLevelText(course.level)}</span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm glass-text-secondary mb-2">
                          <span>Прогресс</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full glass-bg-secondary rounded-full h-2">
                          <div 
                            className="h-2 glass-bg-accent-orange-500 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <GlassButton variant="gradient" size="md">
                        Продолжить
                      </GlassButton>
                      <GlassButton variant="secondary" size="md">
                        Уроки
                      </GlassButton>
                    </div>
                  </div>
                </GlassCardHeader>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <GlassCard key={lesson.id} variant="interactive" padding="lg" className="hover:glass-shadow-md transition-all">
                <GlassCardHeader>
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {getLessonTypeIcon(lesson.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold glass-text-primary">
                          {lesson.title}
                        </h3>
                        {lesson.isCompleted && (
                          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        )}
                        {lesson.isLocked && (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm glass-text-secondary mb-2">
                        {lesson.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs glass-text-muted">
                        <span>{lesson.duration}</span>
                        <span>•</span>
                        <span className="capitalize">{lesson.type}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {lesson.isLocked ? (
                        <GlassButton variant="ghost" size="sm" disabled>
                          Заблокировано
                        </GlassButton>
                      ) : (
                        <GlassButton variant="gradient" size="sm">
                          {lesson.isCompleted ? 'Повторить' : 'Начать'}
                        </GlassButton>
                      )}
                    </div>
                  </div>
                </GlassCardHeader>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
