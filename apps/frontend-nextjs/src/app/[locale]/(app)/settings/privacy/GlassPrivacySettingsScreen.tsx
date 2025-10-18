'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton } from '@/components/ui/glass';

export default function GlassPrivacySettingsScreen() {
  const [settings, setSettings] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    showOnlineStatus: true,
    dataCollection: true
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({...prev, [key]: !prev[key]}));
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={2}>Видимость профиля</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              {[
                {key: 'profileVisible' as const, label: 'Профиль виден всем', desc: 'Другие пользователи могут видеть ваш профиль'},
                {key: 'showEmail' as const, label: 'Показывать email', desc: 'Email будет виден в вашем профиле'},
                {key: 'showPhone' as const, label: 'Показывать телефон', desc: 'Телефон будет виден в вашем профиле'},
                {key: 'showOnlineStatus' as const, label: 'Показывать статус онлайн', desc: 'Другие увидят когда вы в сети'}
              ].map(({key, label, desc}) => (
                <div key={key} className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="glass-text-primary font-medium">{label}</p>
                    <p className="text-sm glass-text-secondary">{desc}</p>
                  </div>
                  <button onClick={() => toggle(key)} className={`w-12 h-6 rounded-full transition-colors ${settings[key] ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={2}>Данные и конфиденциальность</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="glass-text-primary font-medium">Разрешить сбор данных</p>
                  <p className="text-sm glass-text-secondary">Помогает улучшить сервис</p>
                </div>
                <button onClick={() => toggle('dataCollection')} className={`w-12 h-6 rounded-full transition-colors ${settings.dataCollection ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings.dataCollection ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="pt-4 space-y-3">
                <GlassButton variant="secondary" className="w-full">Скачать мои данные</GlassButton>
                <GlassButton variant="ghost" className="w-full">Удалить аккаунт</GlassButton>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassButton variant="gradient" size="lg" className="w-full">Сохранить настройки</GlassButton>
      </div>
    </div>
  );
}
