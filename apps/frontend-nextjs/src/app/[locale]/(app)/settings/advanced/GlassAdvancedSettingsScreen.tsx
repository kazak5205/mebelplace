'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton } from '@/components/ui/glass';

export default function GlassAdvancedSettingsScreen() {
  const [settings, setSettings] = useState({
    debugMode: false,
    analytics: true,
    crashReporting: true,
    autoBackup: true,
    apiAccess: false,
    experimentalFeatures: false
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({...prev, [key]: !prev[key]}));
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={1}>Расширенные настройки</GlassCardTitle>
            <p className="glass-text-secondary">Внимание: Изменение этих настроек может повлиять на работу приложения</p>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-primary font-medium">Режим отладки</p>
                  <p className="text-sm glass-text-secondary">Включает дополнительное логирование и отладочную информацию</p>
                </div>
                <button onClick={() => toggle('debugMode')} className={`w-12 h-6 rounded-full transition-colors ${settings.debugMode ? 'glass-bg-danger' : 'glass-bg-secondary'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings.debugMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-primary font-medium">Аналитика</p>
                  <p className="text-sm glass-text-secondary">Отправка анонимных данных об использовании для улучшения сервиса</p>
                </div>
                <button onClick={() => toggle('analytics')} className={`w-12 h-6 rounded-full transition-colors ${settings.analytics ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings.analytics ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-primary font-medium">Отчеты о сбоях</p>
                  <p className="text-sm glass-text-secondary">Автоматическая отправка отчетов об ошибках для их исправления</p>
                </div>
                <button onClick={() => toggle('crashReporting')} className={`w-12 h-6 rounded-full transition-colors ${settings.crashReporting ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings.crashReporting ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-primary font-medium">Автоматическое резервное копирование</p>
                  <p className="text-sm glass-text-secondary">Регулярное создание резервных копий ваших данных</p>
                </div>
                <button onClick={() => toggle('autoBackup')} className={`w-12 h-6 rounded-full transition-colors ${settings.autoBackup ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings.autoBackup ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-primary font-medium">API доступ</p>
                  <p className="text-sm glass-text-secondary">Предоставление доступа к API для сторонних приложений</p>
                </div>
                <button onClick={() => toggle('apiAccess')} className={`w-12 h-6 rounded-full transition-colors ${settings.apiAccess ? 'glass-bg-accent-orange-500' : 'glass-bg-secondary'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings.apiAccess ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-primary font-medium">Экспериментальные функции</p>
                  <p className="text-sm glass-text-secondary">Доступ к новым функциям, которые находятся в разработке</p>
                </div>
                <button onClick={() => toggle('experimentalFeatures')} className={`w-12 h-6 rounded-full transition-colors ${settings.experimentalFeatures ? 'glass-bg-accent-purple-500' : 'glass-bg-secondary'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings.experimentalFeatures ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="flex gap-4">
                  <GlassButton variant="gradient" size="lg">
                    Сохранить настройки
                  </GlassButton>
                  <GlassButton variant="secondary" size="lg">
                    Сбросить по умолчанию
                  </GlassButton>
                  <GlassButton variant="ghost" size="lg">
                    Экспорт настроек
                  </GlassButton>
                </div>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
