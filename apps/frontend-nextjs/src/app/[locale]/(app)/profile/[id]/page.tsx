/**
 * User/Master Profile Page by ID
 * Shows public profile of any user
 */

'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Spinner } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
  role: string;
  region?: string;
  bio?: string;
  rating?: number;
  videos_count?: number;
  followers_count?: number;
  following_count?: number;
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = parseInt(resolvedParams.id);
  const router = useRouter();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data as User;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          Пользователь не найден
        </h2>
        <Button onClick={() => router.push('/feed')}>Вернуться в ленту</Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] pb-20">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-[var(--color-surface)] rounded-2xl p-8 mb-6 shadow-lg">
          <div className="flex items-start gap-6">
            <Avatar
              src={user.avatar}
              name={user.username}
              size="xl"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">
                {user.username}
              </h1>
              <p className="text-[var(--color-text-secondary)] mb-4">
                @{user.username}
              </p>

              {user.bio && (
                <p className="text-[var(--color-text-primary)] mb-4">
                  {user.bio}
                </p>
              )}

              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {user.videos_count || 0}
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)]">Видео</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {user.followers_count || 0}
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)]">Подписчики</div>
                </div>
                {user.role === 'master' && user.rating && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                      ⭐ {user.rating.toFixed(1)}
                    </div>
                    <div className="text-sm text-[var(--color-text-secondary)]">Рейтинг</div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => router.push(`/chats?new=true&user_id=${user.id}`)}
                  variant="primary"
                >
                  💬 Написать
                </Button>
                <Button variant="outline">
                  ➕ Подписаться
                </Button>
                {user.role === 'master' && (
                  <Button variant="outline" onClick={() => router.push(`/channels/${user.id}`)}>
                    📺 Канал
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="bg-[var(--color-surface)] rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
            Видео
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {/* User videos will be loaded when video API is ready */}
            <div className="text-center py-12 col-span-3 text-[var(--color-text-secondary)]">
              Видео скоро появятся
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


