'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton } from '@/components/ui/glass';

export default function GlassNotificationSettingsScreen() {
  const [settings, setSettings] = useState({
    emailOrders: true,
    emailMessages: true,
    emailPromotions: false,
    pushOrders: true,
    pushMessages: true,
    pushPromotions: false,
    smsOrders: false,
    smsMessages: false
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({...prev, [key]: !prev[key]}));
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={2}>Email уведомления</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              {[
                {key: 'emailOrders' as const, label: 'Заказы и транзакции'},
                {key: 'emailMessages' as const, label: 'Сообщения от пользователей'},
                {key: 'emailPromotions' as const, label: 'Акции и новости'}
              ].map(({key, label}) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="glass-text-primary">{label}</span>
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
            <GlassCardTitle level={2}>Push уведомления</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              {[
                {key: 'pushOrders' as const, label: 'Заказы и транзакции'},
                {key: 'pushMessages' as const, label: 'Сообщения от пользователей'},
                {key: 'pushPromotions' as const, label: 'Акции и новости'}
              ].map(({key, label}) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="glass-text-primary">{label}</span>
                  <button onClick={() => toggle(key)} className={`w-12 h-6 rounded-full transition-colors ${settings[key] ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassButton variant="gradient" size="lg" className="w-full">Сохранить настройки</GlassButton>
      </div>
    </div>
  );
}
