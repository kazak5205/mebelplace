'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton } from '@/components/ui/glass';

export default function GlassIntegrationsSettingsScreen() {
  const [integrations, setIntegrations] = useState({
    kaspi: { enabled: false, apiKey: '' },
    halyk: { enabled: true, apiKey: '***' },
    telegram: { enabled: false, botToken: '' },
    instagram: { enabled: true, accessToken: '***' }
  });

  const toggle = (service: keyof typeof integrations) => {
    setIntegrations(prev => ({
      ...prev,
      [service]: { ...prev[service], enabled: !prev[service].enabled }
    }));
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={1}>Интеграции</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-6">
              {[
                {key: 'kaspi', name: 'Kaspi Bank', desc: 'Интеграция с банковскими сервисами'},
                {key: 'halyk', name: 'Halyk Bank', desc: 'Платежная система банка'},
                {key: 'telegram', name: 'Telegram Bot', desc: 'Уведомления через Telegram'},
                {key: 'instagram', name: 'Instagram', desc: 'Публикация в Instagram'}
              ].map(({key, name, desc}) => (
                <div key={key} className="flex items-center justify-between p-4 glass-bg-secondary rounded-lg">
                  <div>
                    <h3 className="font-semibold glass-text-primary">{name}</h3>
                    <p className="text-sm glass-text-secondary">{desc}</p>
                    <span className={`px-2 py-1 rounded-full text-xs mt-2 ${integrations[key as keyof typeof integrations].enabled ? 'glass-bg-success text-white' : 'glass-bg-secondary text-white'}`}>
                      {integrations[key as keyof typeof integrations].enabled ? 'Подключено' : 'Отключено'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggle(key as keyof typeof integrations)} className={`w-12 h-6 rounded-full transition-colors ${integrations[key as keyof typeof integrations].enabled ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${integrations[key as keyof typeof integrations].enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <GlassButton variant="secondary" size="sm">Настроить</GlassButton>
                  </div>
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
