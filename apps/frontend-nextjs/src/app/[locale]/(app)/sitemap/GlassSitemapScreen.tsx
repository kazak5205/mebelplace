'use client';

import React from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass';

export default function GlassSitemapScreen() {
  const sections = [
    {
      title: 'Основные разделы',
      links: [
        {name: 'Главная', url: '/'},
        {name: 'Поиск', url: '/search'},
        {name: 'Заявки', url: '/requests'},
        {name: 'Профиль', url: '/profile'}
      ]
    },
    {
      title: 'Услуги',
      links: [
        {name: 'Создать заказ', url: '/requests/create'},
        {name: 'Мои заказы', url: '/orders'},
        {name: 'Мои заявки', url: '/my-requests'},
        {name: 'Мои предложения', url: '/my-proposals'}
      ]
    },
    {
      title: 'Медиа',
      links: [
        {name: 'Видео', url: '/video'},
        {name: 'Мои видео', url: '/my-videos'},
        {name: 'Канал', url: '/channel'},
        {name: 'Мой канал', url: '/my-channel'}
      ]
    },
    {
      title: 'Настройки',
      links: [
        {name: 'Профиль', url: '/settings/profile'},
        {name: 'Безопасность', url: '/settings/security'},
        {name: 'Уведомления', url: '/settings/notifications'},
        {name: 'Конфиденциальность', url: '/settings/privacy'}
      ]
    },
    {
      title: 'Информация',
      links: [
        {name: 'О нас', url: '/about'},
        {name: 'Контакты', url: '/contact'},
        {name: 'Блог', url: '/blog'},
        {name: 'Карьера', url: '/careers'}
      ]
    },
    {
      title: 'Правовая информация',
      links: [
        {name: 'Политика конфиденциальности', url: '/privacy-policy'},
        {name: 'Условия использования', url: '/terms'},
        {name: 'Поддержка', url: '/support'},
        {name: 'FAQ', url: '/faq'}
      ]
    }
  ];

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto">
        <GlassCard variant="elevated" padding="xl" className="mb-8">
          <GlassCardHeader>
            <GlassCardTitle level={1}>Карта сайта</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="glass-text-secondary">Все основные разделы и страницы нашего сайта</p>
          </GlassCardContent>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, i) => (
            <GlassCard key={i} variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={2} className="text-lg">{section.title}</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-2">
                  {section.links.map((link, j) => (
                    <a key={j} href={link.url} className="block glass-text-secondary hover:glass-text-primary transition-colors">
                      {link.name}
                    </a>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
