/**
 * Deep Linking Configuration для Mobile App
 * Обработка ссылок вида:
 * - mebelplace://video/123
 * - mebelplace://order/456
 * - https://mebelplace.com.kz/video/123
 */

import * as Linking from 'expo-linking';
import { navigationRef } from './navigationRef';

// Префикс схемы приложения
const APP_SCHEME = 'mebelplace';
const APP_PREFIX = `${APP_SCHEME}://`;
const WEB_PREFIX = 'https://mebelplace.com.kz';

export interface DeepLinkConfig {
  path: string;
  screen: string;
  params?: any;
}

/**
 * Парсинг deep link URL
 */
export const parseDeepLink = (url: string): DeepLinkConfig | null => {
  try {
    const { path, queryParams } = Linking.parse(url);
    
    if (!path) return null;

    // Видео: mebelplace://video/:id
    if (path.startsWith('video/')) {
      const videoId = path.replace('video/', '');
      return {
        path: 'video',
        screen: 'Видео',
        params: {
          screen: 'TikTokPlayer',
          params: { videoId }
        }
      };
    }

    // Заявка: mebelplace://order/:id
    if (path.startsWith('order/')) {
      const orderId = path.replace('order/', '');
      return {
        path: 'order',
        screen: 'Заявки',
        params: {
          screen: 'OrderDetails',
          params: { orderId }
        }
      };
    }

    // Чат: mebelplace://chat/:id
    if (path.startsWith('chat/')) {
      const chatId = path.replace('chat/', '');
      return {
        path: 'chat',
        screen: 'Чат',
        params: {
          screen: 'Chat',
          params: { chatId }
        }
      };
    }

    // Профиль мастера: mebelplace://master/:id
    if (path.startsWith('master/')) {
      const masterId = path.replace('master/', '');
      return {
        path: 'master',
        screen: 'Поиск',
        params: {
          screen: 'MasterChannel',
          params: { masterId }
        }
      };
    }

    // Дефолт: главная
    return {
      path: '',
      screen: 'Видео',
      params: {}
    };

  } catch (error) {
    console.error('Error parsing deep link:', error);
    return null;
  }
};

/**
 * Обработка deep link
 */
export const handleDeepLink = (url: string) => {
  const config = parseDeepLink(url);
  
  if (!config) {
    console.warn('Invalid deep link:', url);
    return;
  }

  // Навигация на нужный экран
  if (navigationRef.isReady()) {
    navigationRef.navigate(config.screen as never, config.params as never);
  } else {
    // Если навигация не готова, сохраняем для обработки позже
    setTimeout(() => handleDeepLink(url), 100);
  }
};

/**
 * Инициализация deep linking
 */
export const initDeepLinking = () => {
  // Обработка начального URL (когда приложение открывается по ссылке)
  Linking.getInitialURL().then((url) => {
    if (url) {
      console.log('Initial deep link:', url);
      handleDeepLink(url);
    }
  });

  // Слушаем события URL (когда приложение уже открыто)
  const subscription = Linking.addEventListener('url', (event) => {
    console.log('Deep link received:', event.url);
    handleDeepLink(event.url);
  });

  return subscription;
};

/**
 * Создание deep link для шаринга
 */
export const createDeepLink = (type: 'video' | 'order' | 'master' | 'chat', id: string): string => {
  return `${WEB_PREFIX}/${type}/${id}`;
};

/**
 * Создание универсальной ссылки
 */
export const createUniversalLink = (type: 'video' | 'order' | 'master' | 'chat', id: string) => {
  return {
    webUrl: `${WEB_PREFIX}/${type}/${id}`,
    appUrl: `${APP_PREFIX}${type}/${id}`,
  };
};

/**
 * Шаринг с deep link
 */
export const shareWithDeepLink = async (
  type: 'video' | 'order' | 'master' | 'chat',
  id: string,
  title: string,
  message?: string
) => {
  const { Share } = await import('react-native');
  const url = createDeepLink(type, id);

  try {
    const result = await Share.share({
      title: title,
      message: message ? `${message}\n\n${url}` : url,
      url: url,
    });

    if (result.action === Share.sharedAction) {
      return { success: true, shared: true };
    } else if (result.action === Share.dismissedAction) {
      return { success: true, shared: false };
    }
  } catch (error) {
    console.error('Error sharing:', error);
    return { success: false, error };
  }
};

export default {
  parseDeepLink,
  handleDeepLink,
  initDeepLinking,
  createDeepLink,
  createUniversalLink,
  shareWithDeepLink,
};

