/**
 * Service Worker для MebelPlace PWA
 * Полностью соответствует спецификации FRONTEND_API_SPECIFICATION.yaml
 */

const CACHE_NAME = 'mebelplace-v1.0.0';
const STATIC_CACHE = 'mebelplace-static-v1.0.0';
const DYNAMIC_CACHE = 'mebelplace-dynamic-v1.0.0';
const API_CACHE = 'mebelplace-api-v1.0.0';

// Статические ресурсы для кэширования
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/og-image.jpg',
  '/favicon.ico',
];

// API endpoints для кэширования
const API_ENDPOINTS = [
  '/api/v2/health',
  '/api/v2/live',
  '/api/v2/ready',
];

// Максимальный размер кэша
const MAX_CACHE_SIZE = 50;

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Удаляем старые кэши
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем неподдерживаемые типы запросов
  if (request.method !== 'GET') {
    return;
  }

  // Обработка API запросов
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Обработка статических ресурсов
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Обработка изображений и видео
  if (isMediaAsset(url.pathname)) {
    event.respondWith(handleMediaRequest(request));
    return;
  }

  // Обработка навигационных запросов
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Fallback для остальных запросов
  event.respondWith(handleFallbackRequest(request));
});

// Обработка API запросов (Network First)
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Пытаемся получить свежие данные из сети
    const networkResponse = await fetch(request);
    
    // Кэшируем успешные ответы
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for API request');
    
    // Если сеть недоступна, пытаемся получить из кэша
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Возвращаем fallback ответ
    return new Response(
      JSON.stringify({ 
        error: 'Network unavailable', 
        message: 'Проверьте подключение к интернету' 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Обработка статических ресурсов (Cache First)
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Возвращаем fallback для статических ресурсов
    if (request.destination === 'document') {
      return caches.match('/offline');
    }
    
    throw error;
  }
}

// Обработка медиа ресурсов (Stale While Revalidate)
async function handleMediaRequest(request) {
  const cachedResponse = await caches.match(request);
  
  // Запускаем обновление кэша в фоне
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => {
    // Игнорируем ошибки сети для фонового обновления
  });
  
  // Возвращаем кэшированный ответ если есть, иначе ждем сеть
  return cachedResponse || fetchPromise;
}

// Обработка навигационных запросов
async function handleNavigationRequest(request) {
  try {
    // Пытаемся получить свежую страницу
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Если сеть недоступна, показываем offline страницу
    const offlineResponse = await caches.match('/offline');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Fallback HTML для offline режима
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MebelPlace - Офлайн</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .container {
            max-width: 400px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          h1 { margin-bottom: 20px; }
          p { margin-bottom: 30px; opacity: 0.8; }
          button {
            background: #FF6600;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
          }
          button:hover { background: #FF8533; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔌 Нет подключения</h1>
          <p>Проверьте подключение к интернету и попробуйте снова</p>
          <button onclick="window.location.reload()">Повторить</button>
        </div>
      </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Fallback обработка
async function handleFallbackRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Not found', { status: 404 });
  }
}

// Проверка статических ресурсов
function isStaticAsset(pathname) {
  return STATIC_ASSETS.includes(pathname) ||
         pathname.startsWith('/_next/static/') ||
         pathname.startsWith('/static/') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.woff2') ||
         pathname.endsWith('.woff') ||
         pathname.endsWith('.ttf');
}

// Проверка медиа ресурсов
function isMediaAsset(pathname) {
  return pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|ogg)$/i);
}

// Очистка старых кэшей
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.startsWith('mebelplace-') && 
    name !== STATIC_CACHE && 
    name !== DYNAMIC_CACHE && 
    name !== API_CACHE
  );
  
  await Promise.all(
    oldCaches.map(cacheName => caches.delete(cacheName))
  );
}

// Ограничение размера кэша
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    const keysToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Синхронизация в фоне
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Фоновая синхронизация
async function doBackgroundSync() {
  try {
    // Здесь можно реализовать синхронизацию данных
    console.log('Service Worker: Performing background sync');
    
    // Очистка старых кэшей
    await cleanupOldCaches();
    
    // Ограничение размера кэшей
    await limitCacheSize(DYNAMIC_CACHE, MAX_CACHE_SIZE);
    await limitCacheSize(API_CACHE, MAX_CACHE_SIZE);
    
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Обработка push уведомлений
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Новое уведомление от MebelPlace',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: data.actions || [
        {
          action: 'view',
          title: 'Посмотреть',
          icon: '/icon-192x192.png'
        },
        {
          action: 'dismiss',
          title: 'Закрыть'
        }
      ],
      requireInteraction: data.requireInteraction || false,
      tag: data.tag || 'mebelplace-notification',
      renotify: data.renotify || false
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'MebelPlace', options)
    );
  }
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'dismiss') {
    // Просто закрываем уведомление
  } else {
    // Клик по самому уведомлению
    event.waitUntil(
      clients.matchAll().then(clientList => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('Service Worker: Loaded successfully');