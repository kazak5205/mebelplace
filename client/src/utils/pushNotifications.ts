/**
 * Push Notifications для Web Client
 */

const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HI0F8yVgK1eQ_O4VXQ9UYtWNf-Tew1_YhR0k7B1S8KVfU6Sx1gEo7B0Vk';

/**
 * Проверка поддержки Push Notifications
 */
export const isPushSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Запрос разрешения на уведомления
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported');
  }

  const permission = await Notification.requestPermission();
  return permission;
};

/**
 * Регистрация Service Worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration> => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker not supported');
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    throw error;
  }
};

/**
 * Подписка на Push уведомления
 */
export const subscribeToPush = async (): Promise<PushSubscription> => {
  try {
    // Регистрируем Service Worker
    const registration = await registerServiceWorker();

    // Проверяем существующую подписку
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Создаем новую подписку
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    console.log('Push subscription:', subscription);
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push:', error);
    throw error;
  }
};

/**
 * Отписка от Push уведомлений
 */
export const unsubscribeFromPush = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('Unsubscribed from push notifications');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    throw error;
  }
};

/**
 * Отправка подписки на сервер
 */
export const sendSubscriptionToServer = async (
  subscription: PushSubscription,
  apiClient: any
): Promise<void> => {
  try {
    await apiClient.post('/push/subscribe', {
      subscription: subscription.toJSON(),
    });
    console.log('Subscription sent to server');
  } catch (error) {
    console.error('Error sending subscription to server:', error);
    throw error;
  }
};

/**
 * Инициализация Push Notifications
 */
export const initPushNotifications = async (apiClient: any): Promise<boolean> => {
  try {
    // Проверяем поддержку
    if (!isPushSupported()) {
      console.warn('Push notifications not supported');
      return false;
    }

    // Проверяем разрешение
    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await requestNotificationPermission();
    }

    if (permission !== 'granted') {
      console.warn('Push notification permission denied');
      return false;
    }

    // Подписываемся на уведомления
    const subscription = await subscribeToPush();

    // Отправляем подписку на сервер
    await sendSubscriptionToServer(subscription, apiClient);

    console.log('Push notifications initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return false;
  }
};

/**
 * Проверка состояния подписки
 */
export const getSubscriptionStatus = async (): Promise<{
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
}> => {
  const supported = isPushSupported();
  const permission = supported ? Notification.permission : 'denied';
  
  let subscribed = false;
  if (supported && permission === 'granted') {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      subscribed = !!subscription;
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  }

  return { supported, permission, subscribed };
};

/**
 * Utility: конвертация base64 VAPID ключа
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export default {
  isPushSupported,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  sendSubscriptionToServer,
  initPushNotifications,
  getSubscriptionStatus,
};

