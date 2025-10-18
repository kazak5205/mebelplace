'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/api-wrapper';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface AdVideo {
  id: number;
  title: string;
  path: string;
  thumbnail_path: string;
  is_active: boolean;
  views_count: number;
  clicks_count: number;
  created_at: string;
}

export default function AdsManagement() {
  const [ads, setAds] = useState<AdVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const data = await api.get<{ ads: AdVideo[] }>('/admin/ads');
      setAds(data.ads || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast.error('Ошибка загрузки рекламы');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdStatus = async (adId: number, isActive: boolean) => {
    try {
      await api.patch(`/admin/ads/${adId}`, { is_active: !isActive });
      toast.success(isActive ? 'Реклама деактивирована' : 'Реклама активирована');
      fetchAds();
    } catch (error) {
      toast.error('Ошибка изменения статуса');
    }
  };

  const deleteAd = async (adId: number) => {
    if (!confirm('Удалить рекламное видео?')) return;

    try {
      await api.delete(`/admin/ads/${adId}`);
      toast.success('Реклама удалена');
      fetchAds();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Управление рекламой</h1>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Управление рекламой
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Рекламные видео показываются каждым 5-м в ленте
          </p>
        </div>
        <Button variant="primary" onClick={() => window.location.href = '/admin/ads/create'}>
          + Добавить рекламу
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--color-surface)] p-4 rounded-lg">
          <p className="text-sm text-[var(--color-text-secondary)]">Всего рекламы</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{ads.length}</p>
        </div>
        <div className="bg-[var(--color-surface)] p-4 rounded-lg">
          <p className="text-sm text-[var(--color-text-secondary)]">Активных</p>
          <p className="text-2xl font-bold text-green-500">
            {ads.filter(ad => ad.is_active).length}
          </p>
        </div>
        <div className="bg-[var(--color-surface)] p-4 rounded-lg">
          <p className="text-sm text-[var(--color-text-secondary)]">Всего просмотров</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {ads.reduce((sum, ad) => sum + ad.views_count, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Ads List */}
      <div className="space-y-4">
        {ads.length === 0 ? (
          <div className="text-center py-12 bg-[var(--color-surface)] rounded-lg">
            <p className="text-[var(--color-text-secondary)]">Нет рекламных видео</p>
          </div>
        ) : (
          ads.map((ad) => (
            <div
              key={ad.id}
              className="bg-[var(--color-surface)] rounded-lg p-4 flex items-start gap-4"
            >
              {/* Thumbnail */}
              <img
                src={ad.thumbnail_path}
                alt={ad.title}
                className="w-40 h-24 object-cover rounded-lg"
              />

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-[var(--color-text-primary)]">
                    {ad.title}
                  </h3>
                  <Badge variant={ad.is_active ? 'success' : 'default'}>
                    {ad.is_active ? 'Активна' : 'Неактивна'}
                  </Badge>
                </div>

                <div className="flex gap-6 text-sm text-[var(--color-text-secondary)]">
                  <div>👁️ {ad.views_count.toLocaleString()} просмотров</div>
                  <div>🖱️ {ad.clicks_count} кликов</div>
                  <div>📅 {new Date(ad.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={ad.is_active ? 'secondary' : 'primary'}
                  onClick={() => toggleAdStatus(ad.id, ad.is_active)}
                >
                  {ad.is_active ? 'Деактивировать' : 'Активировать'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => deleteAd(ad.id)}
                >
                  Удалить
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

