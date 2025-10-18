'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton } from '@/components/ui/glass';

export default function GlassAdminModerateScreen() {
  const [activeTab, setActiveTab] = useState('reports');
  
  const reports = [
    {id: '1', type: 'spam', content: 'Спам сообщение', reporter: 'Петр П.', reported: 'Иван И.', status: 'pending'},
    {id: '2', type: 'inappropriate', content: 'Неподходящий контент', reporter: 'Анна С.', reported: 'Мария М.', status: 'reviewed'},
    {id: '3', type: 'fake', content: 'Поддельный профиль', reporter: 'Алексей А.', reported: 'Сергей С.', status: 'pending'}
  ];

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto">
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle level={1}>Модерация</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex gap-2">
              {['reports', 'content', 'users'].map(tab => (
                <GlassButton key={tab} variant={activeTab === tab ? 'gradient' : 'ghost'} onClick={() => setActiveTab(tab)}>
                  {tab === 'reports' && 'Жалобы'}
                  {tab === 'content' && 'Контент'}
                  {tab === 'users' && 'Пользователи'}
                </GlassButton>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        <div className="space-y-4">
          {reports.map(report => (
            <GlassCard key={report.id} variant="interactive" padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold glass-text-primary">{report.content}</h3>
                  <p className="text-sm glass-text-secondary">Жалоба от: {report.reporter} на: {report.reported}</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${report.status === 'pending' ? 'glass-bg-danger text-white' : 'glass-bg-success text-white'}`}>
                    {report.status === 'pending' ? 'Ожидает' : 'Рассмотрено'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <GlassButton variant="secondary" size="sm">Подробнее</GlassButton>
                  <GlassButton variant="gradient" size="sm">Принять</GlassButton>
                  <GlassButton variant="ghost" size="sm">Отклонить</GlassButton>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
