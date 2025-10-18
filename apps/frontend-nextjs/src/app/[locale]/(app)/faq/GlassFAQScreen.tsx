'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton, GlassInput } from '@/components/ui/glass';

export default function GlassFAQScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const faqs = [
    {
      id: '1',
      category: 'general',
      question: 'Как создать заказ?',
      answer: 'Перейдите в раздел "Заказы" и нажмите "Создать заказ". Заполните все необходимые поля и приложите фотографии или эскизы.'
    },
    {
      id: '2',
      category: 'payment',
      question: 'Какие способы оплаты доступны?',
      answer: 'Мы поддерживаем оплату банковскими картами, переводы на банковские счета, электронные кошельки и наличные при встрече.'
    },
    {
      id: '3',
      category: 'general',
      question: 'Как связаться с мастером?',
      answer: 'Вы можете связаться с мастером через встроенную систему сообщений, по телефону или через видеозвонок.'
    }
  ];

  const categories = [
    {id: 'all', name: 'Все вопросы'},
    {id: 'general', name: 'Общие'},
    {id: 'payment', name: 'Платежи'},
    {id: 'orders', name: 'Заказы'},
    {id: 'account', name: 'Аккаунт'}
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto">
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle level={1}>Часто задаваемые вопросы</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <GlassInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Поиск по вопросам..." className="mb-4" />
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <GlassButton key={cat.id} variant={activeCategory === cat.id ? 'gradient' : 'ghost'} onClick={() => setActiveCategory(cat.id)}>
                  {cat.name}
                </GlassButton>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        <div className="space-y-4">
          {filteredFaqs.map(faq => (
            <GlassCard key={faq.id} variant="interactive" padding="lg">
              <h3 className="font-semibold glass-text-primary mb-3">{faq.question}</h3>
              <p className="glass-text-secondary">{faq.answer}</p>
            </GlassCard>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">Вопросы не найдены</h3>
              <p className="glass-text-secondary mb-4">Попробуйте изменить поисковый запрос</p>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
