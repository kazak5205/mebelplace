'use client';

import React, { useState } from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton } from '@/components/ui/glass';

export default function GlassAdminBackupScreen() {
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    frequency: 'daily',
    retention: 30,
    cloudStorage: true
  });

  const backups = [
    {id: '1', name: 'backup_2024_01_15_full.tar.gz', size: '2.4 GB', type: 'Полный', date: '2024-01-15 03:00:00', status: 'completed'},
    {id: '2', name: 'backup_2024_01_14_incremental.tar.gz', size: '156 MB', type: 'Инкрементальный', date: '2024-01-14 03:00:00', status: 'completed'},
    {id: '3', name: 'backup_2024_01_13_full.tar.gz', size: '2.3 GB', type: 'Полный', date: '2024-01-13 03:00:00', status: 'completed'},
    {id: '4', name: 'backup_2024_01_12_incremental.tar.gz', size: '89 MB', type: 'Инкрементальный', date: '2024-01-12 03:00:00', status: 'failed'}
  ];

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'glass-text-success' : 'glass-text-danger';
  };

  const getStatusBg = (status: string) => {
    return status === 'completed' ? 'glass-bg-success' : 'glass-bg-danger';
  };

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <GlassCardTitle level={1}>Управление резервными копиями</GlassCardTitle>
              <div className="flex gap-3">
                <GlassButton variant="gradient">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Создать резервную копию
                </GlassButton>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="glass-text-primary font-medium">Автоматическое резервное копирование</p>
                    <p className="text-sm glass-text-secondary">Регулярное создание резервных копий</p>
                  </div>
                  <button onClick={() => setBackupSettings({...backupSettings, autoBackup: !backupSettings.autoBackup})} className={`w-12 h-6 rounded-full transition-colors ${backupSettings.autoBackup ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${backupSettings.autoBackup ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium glass-text-primary mb-2">Частота резервного копирования</label>
                  <select value={backupSettings.frequency} onChange={(e) => setBackupSettings({...backupSettings, frequency: e.target.value})} className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white">
                    <option value="hourly">Каждый час</option>
                    <option value="daily">Ежедневно</option>
                    <option value="weekly">Еженедельно</option>
                    <option value="monthly">Ежемесячно</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium glass-text-primary mb-2">Хранение копий (дни)</label>
                  <input type="number" value={backupSettings.retention} onChange={(e) => setBackupSettings({...backupSettings, retention: Number(e.target.value)})} className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="glass-text-primary font-medium">Облачное хранилище</p>
                    <p className="text-sm glass-text-secondary">Загрузка копий в облако</p>
                  </div>
                  <button onClick={() => setBackupSettings({...backupSettings, cloudStorage: !backupSettings.cloudStorage})} className={`w-12 h-6 rounded-full transition-colors ${backupSettings.cloudStorage ? 'glass-bg-success' : 'glass-bg-secondary'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${backupSettings.cloudStorage ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="glass-bg-secondary p-4 rounded-lg">
                  <h4 className="font-semibold glass-text-primary mb-2">Статистика</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="glass-text-secondary">Всего копий:</span>
                      <span className="glass-text-primary">4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="glass-text-secondary">Общий размер:</span>
                      <span className="glass-text-primary">4.95 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="glass-text-secondary">Последняя копия:</span>
                      <span className="glass-text-primary">15 января 2024</span>
                    </div>
                  </div>
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
            <GlassCardTitle level={2}>История резервных копий</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-3">
              {backups.map(backup => (
                <div key={backup.id} className="flex items-center justify-between glass-bg-secondary p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${backup.status === 'completed' ? 'glass-bg-success' : 'glass-bg-danger'}`} />
                    <div>
                      <div className="font-medium glass-text-primary">{backup.name}</div>
                      <div className="text-sm glass-text-secondary">
                        {backup.type} • {backup.size} • {backup.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusBg(backup.status)}`}>
                      {backup.status === 'completed' ? 'Завершен' : 'Ошибка'}
                    </span>
                    <GlassButton variant="secondary" size="sm">
                      Скачать
                    </GlassButton>
                    <GlassButton variant="ghost" size="sm">
                      Восстановить
                    </GlassButton>
                    <GlassButton variant="ghost" size="sm">
                      Удалить
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
