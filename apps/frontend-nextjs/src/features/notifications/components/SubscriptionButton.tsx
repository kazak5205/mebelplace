'use client';

/**
 * Subscription Button Component
 * Кнопка подписки на канал с выбором уровня уведомлений
 */

import { useState } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { useSubscription, useSubscribe, useUnsubscribe } from '@/lib/api/hooks/useSubscriptions';
import { Button } from '@/components/ui';
import { SubscriptionLevel } from '@/lib/api/subscriptionsApi';

interface SubscriptionButtonProps {
  channelId: string;
  channelName?: string; // Will be used for notification text in future
  size?: 'sm' | 'md' | 'lg';
}

export function SubscriptionButton({
  channelId,
  size = 'md',
}: SubscriptionButtonProps) {
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  
  const { data: subscription, isLoading } = useSubscription(channelId);
  const subscribeMutation = useSubscribe();
  const unsubscribeMutation = useUnsubscribe();

  const isSubscribed = subscription !== null && subscription?.level !== 'off';
  const currentLevel = subscription?.level || 'off';

  const handleSubscribe = async (level: SubscriptionLevel) => {
    try {
      await subscribeMutation.mutateAsync({ channelId, level });
      setShowLevelSelect(false);
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await handleSubscribe('off');
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  };

  const handleClick = () => {
    if (isSubscribed) {
      setShowLevelSelect(!showLevelSelect);
    } else {
      // Quick subscribe with "all" level
      handleSubscribe('all');
    }
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size={size} disabled>
        <Bell className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant={isSubscribed ? 'primary' : 'secondary'}
        size={size}
        onClick={handleClick}
        disabled={subscribeMutation.isPending || unsubscribeMutation.isPending}
        icon={
          currentLevel === 'all' ? (
            <BellRing className="w-4 h-4" />
          ) : currentLevel === 'important' ? (
            <Bell className="w-4 h-4" />
          ) : (
            <BellOff className="w-4 h-4" />
          )
        }
      >
        {isSubscribed ? 'Подписан' : 'Подписаться'}
      </Button>

      {/* Level selection dropdown */}
      {showLevelSelect && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            marginTop: '8px',
            right: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            zIndex: 1000,
            minWidth: '200px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => handleSubscribe('all')}
              style={{
                padding: '12px',
                textAlign: 'left',
                border: 'none',
                backgroundColor: currentLevel === 'all' ? '#FF6600' : 'transparent',
                color: currentLevel === 'all' ? 'white' : '#333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                🔔 Все уведомления
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                Видео, истории и стримы
              </div>
            </button>

            <button
              onClick={() => handleSubscribe('important')}
              style={{
                padding: '12px',
                textAlign: 'left',
                border: 'none',
                backgroundColor: currentLevel === 'important' ? '#FF6600' : 'transparent',
                color: currentLevel === 'important' ? 'white' : '#333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                ⭐ Важные
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                Только стримы и истории
              </div>
            </button>

            <button
              onClick={handleUnsubscribe}
              style={{
                padding: '12px',
                textAlign: 'left',
                border: 'none',
                backgroundColor: currentLevel === 'off' ? '#FF6600' : 'transparent',
                color: currentLevel === 'off' ? 'white' : '#333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                🔕 Отключить
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                Без уведомлений
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

