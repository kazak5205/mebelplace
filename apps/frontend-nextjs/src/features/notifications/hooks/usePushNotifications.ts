'use client';

/**
 * Push Notifications Hook
 * Manages OneSignal push notifications setup and subscription
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/api/hooks/useAuth';

declare global {
  interface Window {
    OneSignalDeferred?: Promise<any>;
  }
}

export function usePushNotifications() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Only initialize in browser
    if (typeof window === 'undefined') return;

    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (!appId) {
      console.warn('OneSignal App ID not configured');
      return;
    }

    // Initialize OneSignal
    const initOneSignal = async () => {
      try {
        // Dynamically load OneSignal
        const script = document.createElement('script');
        script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
        script.defer = true;
        document.head.appendChild(script);

        await new Promise<void>((resolve) => {
          script.onload = () => resolve();
        });

        // Wait for OneSignal to be available
        if (window.OneSignalDeferred) {
          const OneSignal = await window.OneSignalDeferred;
          
          // Initialize with app ID
          await OneSignal.init({
            appId: appId,
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
              enable: false, // We'll use our custom notification bell
            },
          });

          setIsInitialized(true);

          // Check subscription status
          const isPushSubscribed = await OneSignal.User.PushSubscription.optedIn;
          setIsSubscribed(isPushSubscribed);

          // Set external user ID if user is logged in
          if (user?.id) {
            await OneSignal.login(user.id);
          }
        }
      } catch (err) {
        console.error('Failed to initialize OneSignal:', err);
        setError('Failed to initialize push notifications');
      }
    };

    initOneSignal();
  }, [user?.id]);

  const subscribe = async () => {
    try {
      if (!window.OneSignalDeferred) {
        throw new Error('OneSignal not initialized');
      }

      const OneSignal = await window.OneSignalDeferred;
      
      // Request permission
      await OneSignal.Slidedown.promptPush();
      
      // Wait for permission
      const permission = await OneSignal.Notifications.permission;
      
      if (permission) {
        setIsSubscribed(true);
        
        // Set external user ID if user is logged in
        if (user?.id) {
          await OneSignal.login(user.id);
        }
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err);
      setError('Failed to subscribe to push notifications');
      return false;
    }
  };

  const unsubscribe = async () => {
    try {
      if (!window.OneSignalDeferred) {
        throw new Error('OneSignal not initialized');
      }

      const OneSignal = await window.OneSignalDeferred;
      await OneSignal.User.PushSubscription.optOut();
      setIsSubscribed(false);
      return true;
    } catch (err) {
      console.error('Failed to unsubscribe from push notifications:', err);
      setError('Failed to unsubscribe from push notifications');
      return false;
    }
  };

  return {
    isInitialized,
    isSubscribed,
    error,
    subscribe,
    unsubscribe,
  };
}

