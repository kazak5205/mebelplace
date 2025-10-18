'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton } from '@/components/ui/glass';

export default function GlassBackupSettingsScreen() {
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    cloudBackup: false,
    localBackup: true,
    includeMedia: true
  });

  const backups = [
    {id: '1', date: '2024-01-15', size: '2.4 MB', type: 'Автоматический', status: 'completed'},
    {id: '2', date: '2024-01-14', size: '2.1 MB', type: 'Ручной', status: 'completed'},
    {id: '3', date: '2024-01-13', size: '2.0 MB', type: 'Автоматический', status: 'completed'},
    {id: '4', date: '2024-01-12', size: '1.9 MB', type: 'Автоматический', status: 'failed'}
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={1}>Резервное копирование</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-primary font-medium">Автоматическое резервное копирование</p>
                  <p className="text-sm glass-text-secondary">Регулярное создание резервных копий ваших данных</p>
                </div>
                <button onClick={() => setBackupSettings({...backupSettings, autoBackup: !backupSettings.autoBackup})} className={`w-12 h-6 rounded-full transition-colors ${backupSettings.autoBackup ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${backupSettings.autoBackup ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {backupSettings.autoBackup && (
                <div>
                  <label className="block text-sm font-medium glass-text-primary mb-2">Частота резервного копирования</label>
                  <select value={backupSettings.backupFrequency} onChange={(e) => setBackupSettings({...backupSettings, backupFrequency: e.target.value})} className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white">
                    <option value="hourly">Каждый час</option>
                    <option value="daily">Ежедневно</option>
                    <option value="weekly">Еженедельно</option>
                    <option value="monthly">Ежемесячно</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-primary font-medium">Облачное резервное копирование</p>
                  <p className="text-sm glass-text-secondary">Сохранение копий в облачном хранилище</p>
                </div>
                <button onClick={() => setBackupSettings({...backupSettings, cloudBackup: !backupSettings.cloudBackup})} className={`w-12 h-6 rounded-full transition-colors ${backupSettings.cloudBackup ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${backupSettings.cloudBackup ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-primary font-medium">Локальное резервное копирование</p>
                  <p className="text-sm glass-text-secondary">Сохранение копий на вашем устройстве</p>
                </div>
                <button onClick={() => setBackupSettings({...backupSettings, localBackup: !backupSettings.localBackup})} className={`w-12 h-6 rounded-full transition-colors ${backupSettings.localBackup ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${backupSettings.localBackup ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="glass-text-primary font-medium">Включить медиафайлы</p>
                  <p className="text-sm glass-text-secondary">Включить изображения и видео в резервную копию</p>
                </div>
                <button onClick={() => setBackupSettings({...backupSettings, includeMedia: !backupSettings.includeMedia})} className={`w-12 h-6 rounded-full transition-colors ${backupSettings.includeMedia ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${backupSettings.includeMedia ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex gap-3">
                <GlassButton variant="gradient" size="lg">
                  Создать резервную копию
                </GlassButton>
                <GlassButton variant="secondary" size="lg">
                  Восстановить из копии
                </GlassButton>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={2}>История резервных копий</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              {backups.map(backup => (
                <div key={backup.id} className="flex items-center justify-between glass-bg-secondary p-4 rounded-lg">
                  <div>
                    <div className="font-semibold glass-text-primary">
                      {formatDate(backup.date)}
                    </div>
                    <div className="text-sm glass-text-secondary">
                      {backup.type} • {backup.size}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      backup.status === 'completed' ? 'glass-bg-success text-white' : 'glass-bg-danger text-white'
                    }`}>
                      {backup.status === 'completed' ? 'Завершен' : 'Ошибка'}
                    </span>
                    <GlassButton variant="secondary" size="sm">
                      Скачать
                    </GlassButton>
                    <GlassButton variant="ghost" size="sm">
                      Восстановить
                    </GlassButton>
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
