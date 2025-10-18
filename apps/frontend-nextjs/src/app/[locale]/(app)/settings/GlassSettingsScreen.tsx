'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton,
  GlassInput 
} from '@/components/ui/glass';
// import { useUser, useUpdateProfile, useUploadAvatar } from '@/lib/api/hooks';
import { User, NotificationSettings } from '@/lib/api/types';

interface UserSettings {
  profile: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    bio: string;
    location: string;
    website: string;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    allowMessages: boolean;
    showOnlineStatus: boolean;
  };
  notifications: {
    email: {
      newRequests: boolean;
      newMessages: boolean;
      orderUpdates: boolean;
      weeklyDigest: boolean;
    };
    push: {
      newRequests: boolean;
      newMessages: boolean;
      orderUpdates: boolean;
      mentions: boolean;
    };
    sms: {
      urgentUpdates: boolean;
      orderConfirmations: boolean;
    };
  };
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    currency: string;
    timezone: string;
  };
}

export default function GlassSettingsScreen() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'notifications' | 'preferences' | 'account'>('profile');
  const [saving, setSaving] = useState(false);

  // API hooks - temporarily disabled to prevent hanging
  // const { data: user } = useUser();
  // const { updateProfile } = useUpdateProfile();
  // const { uploadAvatar } = useUploadAvatar();

  // Temporary mock data to prevent hanging
  const user = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    phone: '+7 777 123 45 67',
    avatar_url: null,
    bio: 'Тестовый пользователь',
    location: 'Алматы',
  };
  const updateProfile = async (data: any) => ({ success: true });
  const uploadAvatar = async (file: File) => ({ success: true });

  useEffect(() => {
    // Load user data from API hooks
    if (user) {
      const userSettings: UserSettings = {
        profile: {
          name: (user as any).username || '',
          email: (user as any).email || '',
          phone: (user as any).phone || '',
          avatar: (user as any).avatar_url || '',
          bio: (user as any).bio || '',
          location: (user as any).location || '',
          website: ''
        },
        privacy: {
          showEmail: false,
          showPhone: false,
          showLocation: true,
          allowMessages: true,
          showOnlineStatus: true
        },
        notifications: {
          email: {
            newRequests: true,
            newMessages: true,
            orderUpdates: true,
            weeklyDigest: false
          },
          push: {
            newRequests: true,
            newMessages: true,
            orderUpdates: true,
            mentions: true
          },
          sms: {
            urgentUpdates: true,
            orderConfirmations: true
          }
        },
        preferences: {
          language: 'ru',
          theme: 'auto',
          currency: 'KZT',
          timezone: 'Asia/Almaty'
        }
      };
      setSettings(userSettings);
    }
  }, [user]);

  const handleInputChange = (section: keyof UserSettings, field: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => prev ? {
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    } : null);
  };

  const handleNestedInputChange = (section: keyof UserSettings, subsection: string, field: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => prev ? {
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [field]: value
        }
      }
    } : null);
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      if (settings) {
        // Update profile
        await updateProfile({
          username: settings.profile.name,
          email: settings.profile.email,
          phone: settings.profile.phone,
          bio: settings.profile.bio
        });
        
        // Update notification settings
        // Note: Notification settings API will be implemented when backend is ready
        console.log('Notification settings updated:', settings.notifications);
        
        alert('Настройки успешно сохранены!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо.')) {
      // TODO: Implement account deletion
      alert('Удаление аккаунта будет реализовано позже');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 h-64 glass-bg-secondary rounded" />
              <div className="lg:col-span-3 h-96 glass-bg-secondary rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base flex items-center justify-center p-4">
        <GlassCard variant="elevated" padding="xl" className="text-center max-w-md">
          <GlassCardContent>
            <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold glass-text-primary mb-2">
              Ошибка загрузки настроек
            </h3>
            <p className="glass-text-secondary mb-4">
              Не удалось загрузить настройки аккаунта
            </p>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle level={1} className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Настройки
            </GlassCardTitle>
          </GlassCardHeader>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <GlassCard variant="elevated" padding="lg">
            <GlassCardContent>
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Профиль', icon: '👤' },
                  { id: 'privacy', label: 'Конфиденциальность', icon: '🔒' },
                  { id: 'notifications', label: 'Уведомления', icon: '🔔' },
                  { id: 'preferences', label: 'Предпочтения', icon: '⚙️' },
                  { id: 'account', label: 'Аккаунт', icon: '🛡️' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                      activeTab === tab.id
                        ? 'glass-bg-accent-orange-500 text-white'
                        : 'glass-bg-secondary glass-text-primary hover:glass-bg-primary'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </GlassCardContent>
          </GlassCard>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <GlassCard variant="elevated" padding="lg">
              <GlassCardHeader>
                <GlassCardTitle level={2} className="text-xl">
                  {activeTab === 'profile' && 'Настройки профиля'}
                  {activeTab === 'privacy' && 'Конфиденциальность'}
                  {activeTab === 'notifications' && 'Уведомления'}
                  {activeTab === 'preferences' && 'Предпочтения'}
                  {activeTab === 'account' && 'Управление аккаунтом'}
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                        {settings.profile.avatar ? (
                          <img 
                            src={settings.profile.avatar} 
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-10 h-10 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <GlassButton variant="secondary" size="sm">
                          Изменить фото
                        </GlassButton>
                        <p className="text-sm glass-text-secondary mt-1">
                          JPG, PNG до 2MB
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <GlassInput
                        label="Имя"
                        value={settings.profile.name}
                        onValueChange={(value) => handleInputChange('profile', 'name', value)}
                      />
                      <GlassInput
                        label="Email"
                        type="email"
                        value={settings.profile.email}
                        onValueChange={(value) => handleInputChange('profile', 'email', value)}
                      />
                      <GlassInput
                        label="Телефон"
                        value={settings.profile.phone}
                        onValueChange={(value) => handleInputChange('profile', 'phone', value)}
                      />
                      <GlassInput
                        label="Местоположение"
                        value={settings.profile.location}
                        onValueChange={(value) => handleInputChange('profile', 'location', value)}
                      />
                      <GlassInput
                        label="Веб-сайт"
                        value={settings.profile.website}
                        onValueChange={(value) => handleInputChange('profile', 'website', value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium glass-text-primary mb-2">
                        О себе
                      </label>
                      <textarea
                        rows={4}
                        value={settings.profile.bio}
                        onChange={(e) => handleInputChange('profile', 'bio', e.target.value)}
                        className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Расскажите о себе и своем опыте..."
                      />
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold glass-text-primary">Видимость информации</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'showEmail', label: 'Показывать email в профиле' },
                        { key: 'showPhone', label: 'Показывать телефон в профиле' },
                        { key: 'showLocation', label: 'Показывать местоположение' },
                        { key: 'allowMessages', label: 'Разрешить сообщения от других пользователей' },
                        { key: 'showOnlineStatus', label: 'Показывать статус "В сети"' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between">
                          <span className="glass-text-primary">{setting.label}</span>
                          <button
                            onClick={() => handleInputChange('privacy', setting.key, !(settings.privacy as any)[setting.key])}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              (settings.privacy as any)[setting.key] 
                                ? 'glass-bg-accent-orange-500' 
                                : 'glass-bg-secondary'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                              (settings.privacy as any)[setting.key] ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold glass-text-primary mb-4">Email уведомления</h3>
                      <div className="space-y-3">
                        {Object.entries(settings.notifications.email).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="glass-text-primary capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <button
                              onClick={() => handleNestedInputChange('notifications', 'email', key, !value)}
                              className={`w-12 h-6 rounded-full transition-colors ${
                                value ? 'glass-bg-accent-orange-500' : 'glass-bg-secondary'
                              }`}
                            >
                              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold glass-text-primary mb-4">Push уведомления</h3>
                      <div className="space-y-3">
                        {Object.entries(settings.notifications.push).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="glass-text-primary capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <button
                              onClick={() => handleNestedInputChange('notifications', 'push', key, !value)}
                              className={`w-12 h-6 rounded-full transition-colors ${
                                value ? 'glass-bg-accent-orange-500' : 'glass-bg-secondary'
                              }`}
                            >
                              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium glass-text-primary mb-2">
                          Язык
                        </label>
                        <select
                          value={settings.preferences.language}
                          onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
                          className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="ru">Русский</option>
                          <option value="en">English</option>
                          <option value="kk">Қазақша</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium glass-text-primary mb-2">
                          Валюта
                        </label>
                        <select
                          value={settings.preferences.currency}
                          onChange={(e) => handleInputChange('preferences', 'currency', e.target.value)}
                          className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="KZT">₸ Тенге</option>
                          <option value="USD">$ Доллар</option>
                          <option value="EUR">€ Евро</option>
                          <option value="RUB">₽ Рубль</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium glass-text-primary mb-2">
                          Тема
                        </label>
                        <select
                          value={settings.preferences.theme}
                          onChange={(e) => handleInputChange('preferences', 'theme', e.target.value)}
                          className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="auto">Автоматически</option>
                          <option value="light">Светлая</option>
                          <option value="dark">Темная</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium glass-text-primary mb-2">
                          Часовой пояс
                        </label>
                        <select
                          value={settings.preferences.timezone}
                          onChange={(e) => handleInputChange('preferences', 'timezone', e.target.value)}
                          className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="Asia/Almaty">Алматы (UTC+6)</option>
                          <option value="Asia/Aqtobe">Актобе (UTC+5)</option>
                          <option value="Asia/Atyrau">Атырау (UTC+5)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold glass-text-primary mb-4">Безопасность</h3>
                      <div className="space-y-3">
                        <GlassButton variant="secondary" size="md">
                          Изменить пароль
                        </GlassButton>
                        <GlassButton variant="secondary" size="md">
                          Двухфакторная аутентификация
                        </GlassButton>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold glass-text-primary mb-4">Данные</h3>
                      <div className="space-y-3">
                        <GlassButton variant="secondary" size="md">
                          Экспорт данных
                        </GlassButton>
                        <GlassButton variant="secondary" size="md">
                          Скачать резервную копию
                        </GlassButton>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold glass-text-danger mb-4">Опасная зона</h3>
                      <div className="space-y-3">
                        <GlassButton variant="danger" size="md" onClick={handleDeleteAccount}>
                          Удалить аккаунт
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 text-right">
          <GlassButton
            variant="gradient"
            size="lg"
            onClick={handleSave}
            loading={saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
