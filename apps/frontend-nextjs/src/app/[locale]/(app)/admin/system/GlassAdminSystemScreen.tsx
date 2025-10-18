'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton, GlassInput } from '@/components/ui/glass';

export default function GlassAdminSystemScreen() {
  const [settings, setSettings] = useState({
    siteName: 'MebelPlace',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({...prev, [key]: !prev[key]}));
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={1}>Системные настройки</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-6">
              <GlassInput label="Название сайта" value={settings.siteName} onValueChange={(value) => setSettings({...settings, siteName: value})} />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-primary font-medium">Режим обслуживания</p>
                  <p className="text-sm glass-text-secondary">Временно отключить сайт для пользователей</p>
                </div>
                <button onClick={() => toggle('maintenanceMode')} className={`w-12 h-6 rounded-full transition-colors ${settings.maintenanceMode ? 'glass-bg-danger' : 'glass-bg-secondary'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-primary font-medium">Регистрация пользователей</p>
                  <p className="text-sm glass-text-secondary">Разрешить новым пользователям регистрироваться</p>
                </div>
                <button onClick={() => toggle('registrationEnabled')} className={`w-12 h-6 rounded-full transition-colors ${settings.registrationEnabled ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings.registrationEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-primary font-medium">Email уведомления</p>
                  <p className="text-sm glass-text-secondary">Отправлять системные уведомления по email</p>
                </div>
                <button onClick={() => toggle('emailNotifications')} className={`w-12 h-6 rounded-full transition-colors ${settings.emailNotifications ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <GlassButton variant="gradient" size="lg" className="w-full">Сохранить настройки</GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
