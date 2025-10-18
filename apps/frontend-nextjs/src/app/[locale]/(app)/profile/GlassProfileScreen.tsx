'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';
import { useUser, useUpdateProfile, useUploadAvatar } from '@/lib/api/hooks';

interface UserStats {
  videos: number;
  followers: number;
  following: number;
  likes: number;
  views: number;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'buyer' | 'master' | 'admin';
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  stats: UserStats;
  isVerified: boolean;
  joinedAt: string;
}

export default function GlassProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'videos' | 'requests' | 'orders' | 'settings'>('videos');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});

  // API hooks - temporarily disabled to prevent hanging
  // const { data: userData, loading, error, refetch } = useUser();
  // const { updateProfile, loading: updateLoading } = useUpdateProfile();
  // const { uploadAvatar, loading: avatarLoading } = useUploadAvatar();
  
  // Temporary mock data to prevent hanging
  const loading = false;
  const error = null;
  const userData = {
    id: '1',
    name: 'Тестовый пользователь',
    username: 'testuser',
    email: 'test@example.com',
    role: 'buyer',
    avatar: null,
    bio: 'Тестовый профиль пользователя',
    location: 'Алматы',
    phone: '+7 777 123 45 67',
    isVerified: false,
    createdAt: new Date().toISOString(),
    stats: {
      videos: 0,
      followers: 0,
      following: 0,
      likes: 0,
      views: 0
    }
  };
  
  const refetch = () => {};
  const updateProfile = async (data: any) => ({ success: true });
  const uploadAvatar = async (file: File) => ({ success: true });

  useEffect(() => {
    if (userData) {
      const transformedProfile: UserProfile = {
        id: (userData as any).id,
        username: (userData as any).name || (userData as any).username,
        email: (userData as any).email,
        role: (userData as any).role || 'buyer',
        avatar: (userData as any).avatar,
        bio: (userData as any).bio,
        location: (userData as any).location,
        phone: (userData as any).phone,
        isVerified: (userData as any).isVerified || false,
        joinedAt: (userData as any).createdAt || new Date().toISOString(),
        stats: {
          videos: (userData as any).stats?.videos || 0,
          followers: (userData as any).stats?.followers || 0,
          following: (userData as any).stats?.following || 0,
          likes: (userData as any).stats?.likes || 0,
          views: (userData as any).stats?.views || 0
        }
      };
      setProfile(transformedProfile);
      setEditData(transformedProfile);
    }
  }, [userData]);

  const handleSaveProfile = async () => {
    try {
      const response = await updateProfile(editData);
      if (response.success) {
        setEditMode(false);
        refetch();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const response = await uploadAvatar(file);
        if (response.success) {
          refetch();
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-4xl mx-auto">
          <GlassCard variant="elevated" padding="lg" className="animate-pulse">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 glass-bg-secondary rounded-full" />
              <div className="flex-1">
                <div className="h-6 glass-bg-secondary rounded mb-2" />
                <div className="h-4 glass-bg-secondary rounded w-2/3" />
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-4xl mx-auto">
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <p className="glass-text-secondary">Ошибка загрузки профиля</p>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-12 h-12 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              {profile.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 glass-bg-accent-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold glass-text-primary">
                  {profile.username}
                </h1>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    profile.role === 'master' ? 'glass-bg-accent-orange-500 text-white' :
                    profile.role === 'buyer' ? 'glass-bg-accent-blue-500 text-white' :
                    'glass-bg-accent-purple-500 text-white'
                  }`}>
                    {profile.role === 'master' && 'Мастер'}
                    {profile.role === 'buyer' && 'Покупатель'}
                    {profile.role === 'admin' && 'Администратор'}
                  </span>
                  {profile.isVerified && (
                    <span className="px-3 py-1 glass-bg-success rounded-full text-xs font-medium text-white">
                      Подтвержден
                    </span>
                  )}
                </div>
              </div>

              {profile.bio && (
                <p className="glass-text-secondary mb-4">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm glass-text-muted mb-4">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {profile.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  На сайте с {formatDate(profile.joinedAt)}
                </div>
              </div>

              <div className="flex gap-4">
                <GlassButton variant="gradient" size="md">
                  Редактировать профиль
                </GlassButton>
                <GlassButton variant="secondary" size="md">
                  Поделиться
                </GlassButton>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Stats */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold glass-text-primary">{profile.stats.videos}</div>
              <div className="text-sm glass-text-secondary">Видео</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold glass-text-primary">{profile.stats.followers.toLocaleString()}</div>
              <div className="text-sm glass-text-secondary">Подписчики</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold glass-text-primary">{profile.stats.following}</div>
              <div className="text-sm glass-text-secondary">Подписки</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold glass-text-primary">{profile.stats.likes.toLocaleString()}</div>
              <div className="text-sm glass-text-secondary">Лайки</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold glass-text-primary">{profile.stats.views.toLocaleString()}</div>
              <div className="text-sm glass-text-secondary">Просмотры</div>
            </div>
          </div>
        </GlassCard>

        {/* Tabs */}
        <GlassCard variant="elevated" padding="lg">
          <div className="flex flex-wrap gap-2 mb-6">
            {(['videos', 'requests', 'orders', 'settings'] as const).map((tab) => (
              <GlassButton
                key={tab}
                variant={activeTab === tab ? 'gradient' : 'ghost'}
                size="md"
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'videos' && 'Видео'}
                {tab === 'requests' && 'Заявки'}
                {tab === 'orders' && 'Заказы'}
                {tab === 'settings' && 'Настройки'}
              </GlassButton>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'videos' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold glass-text-primary mb-2">
                  Ваши видео
                </h3>
                <p className="glass-text-secondary mb-4">
                  Здесь будут отображаться ваши загруженные видео
                </p>
                <GlassButton variant="gradient" size="lg">
                  Загрузить видео
                </GlassButton>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold glass-text-primary mb-2">
                  Ваши заявки
                </h3>
                <p className="glass-text-secondary mb-4">
                  Здесь будут отображаться ваши заявки на изготовление мебели
                </p>
                <GlassButton variant="gradient" size="lg">
                  Создать заявку
                </GlassButton>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold glass-text-primary mb-2">
                  Ваши заказы
                </h3>
                <p className="glass-text-secondary mb-4">
                  Здесь будут отображаться ваши заказы
                </p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium glass-text-primary mb-2">
                      Имя пользователя
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium glass-text-primary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium glass-text-primary mb-2">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      value={profile.phone || ''}
                      className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium glass-text-primary mb-2">
                      Город
                    </label>
                    <input
                      type="text"
                      value={profile.location || ''}
                      className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium glass-text-primary mb-2">
                    О себе
                  </label>
                  <textarea
                    value={profile.bio || ''}
                    rows={4}
                    className="w-full glass-bg-primary glass-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex gap-4">
                  <GlassButton variant="gradient" size="md">
                    Сохранить изменения
                  </GlassButton>
                  <GlassButton variant="secondary" size="md">
                    Отмена
                  </GlassButton>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
