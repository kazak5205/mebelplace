'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton } from '@/components/ui/glass';

export default function GlassAdminSecurityScreen() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    ipWhitelist: false,
    sessionTimeout: 30,
    passwordPolicy: true,
    loginAttempts: 5
  });

  const recentActivities = [
    {id: '1', action: 'Вход в систему', user: 'admin@mebelplace.com.kz', ip: '192.168.1.100', timestamp: '2024-01-15 14:30:25', status: 'success'},
    {id: '2', action: 'Изменение настроек', user: 'admin@mebelplace.com.kz', ip: '192.168.1.100', timestamp: '2024-01-15 14:25:10', status: 'success'},
    {id: '3', action: 'Попытка входа', user: 'unknown@example.com', ip: '203.0.113.42', timestamp: '2024-01-15 14:20:05', status: 'failed'},
    {id: '4', action: 'Экспорт данных', user: 'admin@mebelplace.com.kz', ip: '192.168.1.100', timestamp: '2024-01-15 14:15:30', status: 'success'}
  ];

  const getStatusColor = (status: string) => {
    return status === 'success' ? 'glass-text-success' : 'glass-text-danger';
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={1}>Безопасность системы</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="glass-text-primary font-medium">Двухфакторная аутентификация</p>
                    <p className="text-sm glass-text-secondary">Обязательная 2FA для всех администраторов</p>
                  </div>
                  <button onClick={() => setSecuritySettings({...securitySettings, twoFactorAuth: !securitySettings.twoFactorAuth})} className={`w-12 h-6 rounded-full transition-colors ${securitySettings.twoFactorAuth ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="glass-text-primary font-medium">Белый список IP</p>
                    <p className="text-sm glass-text-secondary">Ограничить доступ по IP адресам</p>
                  </div>
                  <button onClick={() => setSecuritySettings({...securitySettings, ipWhitelist: !securitySettings.ipWhitelist})} className={`w-12 h-6 rounded-full transition-colors ${securitySettings.ipWhitelist ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${securitySettings.ipWhitelist ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium glass-text-primary mb-2">Таймаут сессии (минуты)</label>
                  <input type="number" value={securitySettings.sessionTimeout} onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: Number(e.target.value)})} className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="glass-text-primary font-medium">Политика паролей</p>
                    <p className="text-sm glass-text-secondary">Строгие требования к паролям</p>
                  </div>
                  <button onClick={() => setSecuritySettings({...securitySettings, passwordPolicy: !securitySettings.passwordPolicy})} className={`w-12 h-6 rounded-full transition-colors ${securitySettings.passwordPolicy ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${securitySettings.passwordPolicy ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium glass-text-primary mb-2">Максимум попыток входа</label>
                  <input type="number" value={securitySettings.loginAttempts} onChange={(e) => setSecuritySettings({...securitySettings, loginAttempts: Number(e.target.value)})} className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white" />
                </div>

                <GlassButton variant="gradient" size="lg" className="w-full">
                  Сохранить настройки
                </GlassButton>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={2}>Последняя активность</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-3">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-center justify-between glass-bg-secondary p-3 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'glass-bg-success' : 'glass-bg-danger'}`} />
                    <div>
                      <div className="font-medium glass-text-primary">{activity.action}</div>
                      <div className="text-sm glass-text-secondary">
                        {activity.user} • {activity.ip}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status === 'success' ? 'Успешно' : 'Ошибка'}
                    </div>
                    <div className="text-xs glass-text-muted">{activity.timestamp}</div>
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
