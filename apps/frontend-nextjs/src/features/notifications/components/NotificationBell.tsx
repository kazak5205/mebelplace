'use client';

/**
 * Notification Bell Component
 * Shows unread notification count and manages push notification subscription
 */

import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Button } from '@/components/ui';

export function NotificationBell() {
  const { isInitialized, isSubscribed, subscribe, unsubscribe } = usePushNotifications();
  // Note: unreadCount will be implemented when notification history API is ready
  const [unreadCount] = useState(0);

  const handleToggleSubscription = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  if (!isInitialized) {
    return null; // Don't show bell until OneSignal is initialized
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleSubscription}
        icon={isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        aria-label={isSubscribed ? 'Disable notifications' : 'Enable notifications'}
        style={{
          position: 'relative',
          padding: '8px',
          minHeight: '40px',
          minWidth: '40px',
        }}
      />
      
      {/* Unread count badge */}
      {isSubscribed && unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            backgroundColor: '#FF6600',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 'bold',
            pointerEvents: 'none',
          }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
}

