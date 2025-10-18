'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton, GlassInput } from '@/components/ui/glass';

export default function GlassSecuritySettingsScreen() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={2}>Изменить пароль</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              <GlassInput label="Текущий пароль" type="password" />
              <GlassInput label="Новый пароль" type="password" />
              <GlassInput label="Подтвердите пароль" type="password" />
              <GlassButton variant="gradient">Изменить пароль</GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={2}>Двухфакторная аутентификация</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="glass-text-primary font-medium">2FA {twoFactorEnabled ? 'включена' : 'выключена'}</p>
                <p className="text-sm glass-text-secondary">Дополнительная защита вашего аккаунта</p>
              </div>
              <GlassButton variant={twoFactorEnabled ? 'secondary' : 'gradient'} onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}>
                {twoFactorEnabled ? 'Отключить' : 'Включить'}
              </GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={2}>Активные сеансы</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              {[
                {device: 'Chrome на Windows', location: 'Алматы, Казахстан', time: 'Сейчас', current: true},
                {device: 'Safari на iPhone', location: 'Алматы, Казахстан', time: '2 часа назад', current: false}
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between glass-bg-secondary p-4 rounded-lg">
                  <div>
                    <p className="glass-text-primary font-medium">{session.device}</p>
                    <p className="text-sm glass-text-secondary">{session.location} • {session.time}</p>
                  </div>
                  {!session.current && <GlassButton variant="ghost" size="sm">Завершить</GlassButton>}
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
