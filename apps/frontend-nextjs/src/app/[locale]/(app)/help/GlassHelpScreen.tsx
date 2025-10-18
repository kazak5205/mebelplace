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

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  isHelpful?: boolean;
}

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  articleCount: number;
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  views: number;
  lastUpdated: string;
  tags: string[];
}

export default function GlassHelpScreen() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'faq' | 'articles' | 'contact'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchHelpData = async () => {
      // Loading handled by API hooks
    };

    fetchHelpData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleHelpful = (faqId: string) => {
    setFaqs(prev => prev.map(faq => 
      faq.id === faqId 
        ? {
            ...faq,
            isHelpful: !faq.isHelpful,
            helpful: faq.isHelpful ? faq.helpful - 1 : faq.helpful + 1
          }
        : faq
    ));
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 glass-bg-secondary rounded" />
              ))}
            </div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Центр помощи
              </GlassCardTitle>
              
              <div className="flex gap-3">
                <GlassButton variant="secondary" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Связаться с поддержкой
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
                placeholder="Поиск по вопросам, статьям или тегам..."
                className="flex-1 min-w-[300px]"
              />

              {/* Navigation */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'overview', label: 'Обзор', icon: '🏠' },
                  { id: 'faq', label: 'FAQ', icon: '❓' },
                  { id: 'articles', label: 'Статьи', icon: '📚' },
                  { id: 'contact', label: 'Контакты', icon: '📞' }
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
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {categories.map((category) => (
                <GlassCard key={category.id} variant="interactive" padding="lg" className="hover:glass-shadow-md transition-all">
                  <GlassCardHeader>
                    <div className="text-center">
                      <div className="text-4xl mb-4">{category.icon}</div>
                      <h3 className="text-xl font-semibold glass-text-primary mb-2">
                        {category.name}
                      </h3>
                      <p className="glass-text-secondary mb-4">
                        {category.description}
                      </p>
                      <div className="text-sm glass-text-muted">
                        {category.articleCount} статей
                      </div>
                    </div>
                  </GlassCardHeader>
                  <GlassCardContent>
                    <GlassButton variant="gradient" size="md" className="w-full">
                      Перейти к разделу
                    </GlassButton>
                  </GlassCardContent>
                </GlassCard>
              ))}
            </div>

            {/* Popular FAQs */}
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={2} className="text-lg">
                  Популярные вопросы
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-4">
                  {faqs.slice(0, 5).map((faq) => (
                    <div key={faq.id} className="border-b border-white/10 pb-4">
                      <h4 className="font-semibold glass-text-primary mb-2">
                        {faq.question}
                      </h4>
                      <p className="glass-text-secondary text-sm mb-3">
                        {faq.answer}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs glass-text-muted">
                          {faq.helpful} нашли полезным
                        </span>
                        <button
                          onClick={() => handleHelpful(faq.id)}
                          className={`text-xs transition-colors ${
                            faq.isHelpful ? 'glass-text-accent-orange-500' : 'glass-text-muted hover:glass-text-primary'
                          }`}
                        >
                          {faq.isHelpful ? '✓ Полезно' : 'Было полезно?'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>
          </>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <>
            {/* Category Filter */}
            <GlassCard variant="elevated" padding="lg" className="mb-6">
              <GlassCardContent>
                <div className="flex flex-wrap gap-2">
                  <GlassButton
                    variant={selectedCategory === 'all' ? 'gradient' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    Все категории
                  </GlassButton>
                  {categories.map((category) => (
                    <GlassButton
                      key={category.id}
                      variant={selectedCategory === category.id ? 'gradient' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.icon} {category.name}
                    </GlassButton>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <GlassCard key={faq.id} variant="interactive" padding="lg" className="hover:glass-shadow-md transition-all">
                  <GlassCardHeader>
                    <h3 className="font-semibold glass-text-primary mb-3">
                      {faq.question}
                    </h3>
                    <p className="glass-text-secondary leading-relaxed mb-4">
                      {faq.answer}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm glass-text-muted">
                        Категория: {categories.find(c => c.id === faq.category)?.name}
                      </span>
                      <button
                        onClick={() => handleHelpful(faq.id)}
                        className={`flex items-center gap-2 text-sm transition-colors ${
                          faq.isHelpful ? 'glass-text-accent-orange-500' : 'glass-text-muted hover:glass-text-primary'
                        }`}
                      >
                        <svg className="w-4 h-4" fill={faq.isHelpful ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V18m-7-8l2 2m0 0l2-2m-2 2V4" />
                        </svg>
                        {faq.helpful} нашли полезным
                      </button>
                    </div>
                  </GlassCardHeader>
                </GlassCard>
              ))}
            </div>
          </>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <>
            {/* Category Filter */}
            <GlassCard variant="elevated" padding="lg" className="mb-6">
              <GlassCardContent>
                <div className="flex flex-wrap gap-2">
                  <GlassButton
                    variant={selectedCategory === 'all' ? 'gradient' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    Все категории
                  </GlassButton>
                  {categories.map((category) => (
                    <GlassButton
                      key={category.id}
                      variant={selectedCategory === category.id ? 'gradient' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.icon} {category.name}
                    </GlassButton>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Articles List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArticles.map((article) => (
                <GlassCard key={article.id} variant="interactive" padding="lg" className="hover:glass-shadow-md transition-all">
                  <GlassCardHeader>
                    <h3 className="font-semibold glass-text-primary mb-3">
                      {article.title}
                    </h3>
                    <p className="glass-text-secondary text-sm mb-4 line-clamp-3">
                      {article.content}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 glass-bg-accent-blue-500 text-white rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm glass-text-muted">
                      <span>{article.views} просмотров</span>
                      <span>Обновлено: {formatDate(article.lastUpdated)}</span>
                    </div>
                  </GlassCardHeader>
                  <GlassCardContent>
                    <GlassButton variant="gradient" size="sm" className="w-full">
                      Читать статью
                    </GlassButton>
                  </GlassCardContent>
                </GlassCard>
              ))}
            </div>
          </>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={2} className="text-lg">
                  Связаться с поддержкой
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 glass-bg-accent-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold glass-text-primary">Email</div>
                      <div className="text-sm glass-text-secondary">support@mebelplace.com.kz</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 glass-bg-success rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold glass-text-primary">Телефон</div>
                      <div className="text-sm glass-text-secondary">+7 777 123 45 67</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 glass-bg-accent-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold glass-text-primary">Время работы</div>
                      <div className="text-sm glass-text-secondary">Пн-Пт: 9:00-18:00</div>
                    </div>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={2} className="text-lg">
                  Отправить сообщение
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-4">
                  <GlassInput
                    label="Тема"
                    placeholder="Опишите проблему кратко"
                    className="w-full"
                  />
                  <div>
                    <label className="block text-sm font-medium glass-text-primary mb-2">
                      Сообщение
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Подробно опишите ваш вопрос или проблему..."
                      className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <GlassButton variant="gradient" size="md" className="w-full">
                    Отправить сообщение
                  </GlassButton>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
