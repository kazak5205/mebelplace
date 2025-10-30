# 🎯 ПЛАН ДЕЙСТВИЙ: СИНХРОНИЗАЦИЯ МОБИЛКИ, ВЕБА И БЭКЕНДА

## 📋 КРИТИЧЕСКИЕ ЗАДАЧИ (СДЕЛАТЬ НЕМЕДЛЕННО)

### 1️⃣ БЕЗОПАСНОСТЬ: Защищенное хранение токенов в мобилке 🔥

**Проблема:** JWT токены хранятся в SharedPreferences (можно извлечь через ADB/root)

**Решение:**

```dart
// pubspec.yaml
dependencies:
  flutter_secure_storage: ^9.0.0

// lib/data/datasources/secure_storage.dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  static final SecureStorage _instance = SecureStorage._internal();
  factory SecureStorage() => _instance;
  SecureStorage._internal();

  final _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock,
    ),
  );

  Future<void> saveToken(String token) async {
    await _storage.write(key: 'access_token', value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: 'access_token');
  }

  Future<void> saveRefreshToken(String token) async {
    await _storage.write(key: 'refresh_token', value: token);
  }

  Future<String?> getRefreshToken() async {
    return await _storage.read(key: 'refresh_token');
  }

  Future<void> deleteAll() async {
    await _storage.deleteAll();
  }
}

// ЗАМЕНИТЬ ВСЕ ВЫЗОВЫ LocalStorage() на SecureStorage()
// lib/data/datasources/api_service.dart (строка 42)
final token = await SecureStorage().getToken();  // ← Изменить

// lib/data/repositories/app_repositories.dart
await SecureStorage().saveToken(accessToken);    // ← Изменить
```

**Файлы для изменения:**
- `mebelplace_demo/lib/data/datasources/api_service.dart` (строка 42, 242-244, 284-286)
- `mebelplace_demo/lib/data/repositories/app_repositories.dart` (все вхождения LocalStorage)

**Время:** 2-3 часа  
**Приоритет:** 🔴 КРИТИЧЕСКИЙ

---

### 2️⃣ ВЕБ: Убрать дублирование ключей в API трансформации 🟡

**Проблема:** Веб-версия сохраняет и snake_case, и camelCase ключи → +50% payload

**Решение:**

```typescript
// client/src/services/api.ts (строка 8-29)

// ❌ СТАРЫЙ КОД (УДАЛИТЬ):
private transformKeys(obj: any): any {
  // ...
  result[camelKey] = this.transformKeys(obj[key]);
  
  // ❌ УДАЛИТЬ ЭТИ СТРОКИ:
  if (key !== camelKey) {
    result[key] = this.transformKeys(obj[key]);  // ← Дубль!
  }
  
  return result;
}

// ✅ НОВЫЙ КОД:
private transformKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => this.transformKeys(item));
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => 
        letter.toUpperCase()
      );
      // Используем ТОЛЬКО camelCase ключ
      result[camelKey] = this.transformKeys(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}
```

**Файлы для изменения:**
- `client/src/services/api.ts` (строки 8-29)

**Тестирование:**
```bash
# Проверить что всё работает
cd client
npm run dev
# Открыть DevTools → Network → проверить размер ответов
```

**Время:** 30 минут + 1 час тестирования  
**Приоритет:** 🟡 СРЕДНИЙ

---

## 📊 СРЕДНИЕ ЗАДАЧИ (СДЕЛАТЬ В ТЕЧЕНИЕ МЕСЯЦА)

### 3️⃣ ВЕБ: Добавить централизованный state management (Redux Toolkit)

**Проблема:** Каждая страница дублирует логику загрузки видео/заказов

**Решение:**

```bash
cd client
npm install @reduxjs/toolkit react-redux
```

```typescript
// client/src/store/slices/videoSlice.ts (НОВЫЙ ФАЙЛ)
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { videoService } from '../../services/videoService';
import { Video } from '../../types';

interface VideoState {
  videos: Video[];
  loading: boolean;
  error: string | null;
  currentIndex: number;
}

const initialState: VideoState = {
  videos: [],
  loading: false,
  error: null,
  currentIndex: 0,
};

// Async thunk для загрузки видео
export const loadVideos = createAsyncThunk(
  'videos/loadVideos',
  async (params: any = {}) => {
    const response = await videoService.getVideos(params);
    return response.videos;
  }
);

// Async thunk для лайка
export const likeVideo = createAsyncThunk(
  'videos/likeVideo',
  async (videoId: string) => {
    await videoService.likeVideo(videoId);
    return videoId;
  }
);

const videoSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    setCurrentIndex: (state, action: PayloadAction<number>) => {
      state.currentIndex = action.payload;
    },
    // Оптимистичный update для лайка
    toggleLike: (state, action: PayloadAction<string>) => {
      const video = state.videos.find(v => v.id === action.payload);
      if (video) {
        video.isLiked = !video.isLiked;
        video.likesCount = video.isLiked 
          ? (video.likesCount || 0) + 1 
          : (video.likesCount || 0) - 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload;
      })
      .addCase(loadVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load videos';
      })
      .addCase(likeVideo.fulfilled, (state, action) => {
        // Лайк уже обновлен оптимистично через toggleLike
      });
  },
});

export const { setCurrentIndex, toggleLike } = videoSlice.actions;
export default videoSlice.reducer;

// client/src/store/index.ts (НОВЫЙ ФАЙЛ)
import { configureStore } from '@reduxjs/toolkit';
import videoReducer from './slices/videoSlice';

export const store = configureStore({
  reducer: {
    videos: videoReducer,
    // Добавить другие слайсы: orders, chat, etc.
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// client/src/main.tsx (ИЗМЕНИТЬ)
import { Provider } from 'react-redux';
import { store } from './store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>  {/* ← Добавить */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);

// client/src/pages/HomePage.tsx (ИЗМЕНИТЬ)
import { useDispatch, useSelector } from 'react-redux';
import { loadVideos, likeVideo, toggleLike } from '../store/slices/videoSlice';
import type { RootState, AppDispatch } from '../store';

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { videos, loading, error } = useSelector((state: RootState) => state.videos);

  useEffect(() => {
    dispatch(loadVideos());
  }, [dispatch]);

  const handleLike = async (videoId: string) => {
    dispatch(toggleLike(videoId)); // Оптимистичный update
    dispatch(likeVideo(videoId));   // Реальный API вызов
  };

  // ... остальной код
};
```

**Файлы для создания:**
- `client/src/store/index.ts`
- `client/src/store/slices/videoSlice.ts`
- `client/src/store/slices/orderSlice.ts` (аналогично)

**Файлы для изменения:**
- `client/src/main.tsx`
- `client/src/pages/HomePage.tsx`
- `client/src/pages/OrdersPage.tsx`

**Время:** 1-2 недели  
**Приоритет:** 🟡 СРЕДНИЙ

---

### 4️⃣ БЭКЕНД: Добавить CDN для статических файлов

**Проблема:** Видео/изображения загружаются напрямую с сервера → медленно из-за рубежа

**Решение: CloudFlare R2 (S3-совместимый, бесплатный egress)**

```bash
npm install @aws-sdk/client-s3
```

```javascript
// server/config/storage.js (НОВЫЙ ФАЙЛ)
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT, // https://xxx.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function uploadToR2(filePath, key, contentType) {
  const fileStream = fs.createReadStream(filePath);

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
    },
  });

  await upload.done();
  
  // Возвращаем публичный CDN URL
  return `${process.env.CDN_URL}/${key}`;
}

module.exports = { uploadToR2 };

// server/services/videoService.js (ИЗМЕНИТЬ)
const { uploadToR2 } = require('../config/storage');

async function createVideo(videoData) {
  // После обработки видео загружаем на CDN
  const cdnVideoUrl = await uploadToR2(
    videoData.videoUrl, 
    `videos/${Date.now()}.mp4`,
    'video/mp4'
  );
  
  const cdnThumbnailUrl = await uploadToR2(
    thumbnailPath,
    `thumbnails/${Date.now()}.jpg`,
    'image/jpeg'
  );

  // Сохраняем CDN URLs в БД
  const result = await pool.query(`
    INSERT INTO videos (title, video_url, thumbnail_url, ...)
    VALUES ($1, $2, $3, ...)
  `, [title, cdnVideoUrl, cdnThumbnailUrl, ...]);

  return result.rows[0];
}

// .env (ДОБАВИТЬ)
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=mebelplace-videos
CDN_URL=https://cdn.mebelplace.com.kz
```

**Настройка CloudFlare:**
1. Создать R2 bucket
2. Настроить Custom Domain для CDN
3. Включить cache (TTL 1 год для видео)

**Файлы для создания:**
- `server/config/storage.js`

**Файлы для изменения:**
- `server/services/videoService.js`
- `.env` / `.env.production`

**Время:** 1 неделя  
**Приоритет:** 🟡 СРЕДНИЙ  
**Стоимость:** $0 (CloudFlare R2 бесплатный egress)

---

### 5️⃣ МОБИЛКА + ВЕБ: Индикация обработки видео

**Проблема:** После загрузки видео пользователь не видит статус обработки

**Решение через WebSocket:**

```javascript
// server/socket/videoSocket.js (ИЗМЕНИТЬ)
io.on('connection', (socket) => {
  // Когда видео начинает обрабатываться
  socket.emit('video_processing_started', { videoId, status: 'processing' });

  // Когда обработка завершена
  socket.to(`user:${userId}`).emit('video_processing_complete', {
    videoId,
    status: 'completed',
    videoUrl: cdnVideoUrl,
    thumbnailUrl: cdnThumbnailUrl,
  });
  
  // Если ошибка
  socket.to(`user:${userId}`).emit('video_processing_failed', {
    videoId,
    status: 'failed',
    error: 'Processing failed',
  });
});

// server/services/videoQueue.js (ИЗМЕНИТЬ)
async function processVideo(job) {
  const { videoId, userId } = job.data;
  
  try {
    // Уведомляем о начале
    io.to(`user:${userId}`).emit('video_processing_started', { videoId });

    // Обработка видео...
    const result = await videoService.compressAndOptimizeVideo(videoPath);
    
    // Уведомляем о завершении
    io.to(`user:${userId}`).emit('video_processing_complete', { 
      videoId, 
      ...result 
    });
  } catch (error) {
    // Уведомляем об ошибке
    io.to(`user:${userId}`).emit('video_processing_failed', { 
      videoId, 
      error: error.message 
    });
  }
}
```

```dart
// mebelplace_demo/lib/data/datasources/socket_service.dart (ИЗМЕНИТЬ)
void connect() {
  // ...
  
  _socket!.on('video_processing_started', (data) {
    print('📹 Video processing started: ${data['videoId']}');
    // Обновить UI через provider
  });

  _socket!.on('video_processing_complete', (data) {
    print('✅ Video processing complete: ${data['videoId']}');
    // Обновить видео в ленте
  });

  _socket!.on('video_processing_failed', (data) {
    print('❌ Video processing failed: ${data['videoId']}');
    // Показать ошибку пользователю
  });
}

// mebelplace_demo/lib/presentation/pages/video/create_video_screen.dart (ИЗМЕНИТЬ)
// После загрузки видео показать processing indicator
if (uploadResponse.success) {
  // Показываем snackbar "Видео обрабатывается"
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text('Видео загружено, идёт обработка...'),
      duration: Duration(seconds: 3),
    ),
  );
}
```

```typescript
// client/src/contexts/SocketContext.tsx (ИЗМЕНИТЬ)
useEffect(() => {
  if (socket) {
    socket.on('video_processing_started', (data) => {
      console.log('📹 Video processing started:', data.videoId);
      // Показать toast "Обработка видео..."
    });

    socket.on('video_processing_complete', (data) => {
      console.log('✅ Video complete:', data.videoId);
      // Обновить видео в Redux store
    });

    socket.on('video_processing_failed', (data) => {
      console.error('❌ Video failed:', data.videoId);
      // Показать ошибку
    });
  }
}, [socket]);
```

**Файлы для изменения:**
- `server/socket/videoSocket.js`
- `server/services/videoQueue.js`
- `mebelplace_demo/lib/data/datasources/socket_service.dart`
- `mebelplace_demo/lib/presentation/pages/video/create_video_screen.dart`
- `client/src/contexts/SocketContext.tsx`

**Время:** 3-4 дня  
**Приоритет:** 🟢 НИЗКИЙ (nice-to-have)

---

## 🧪 ДОЛГОСРОЧНЫЕ ЗАДАЧИ (3+ МЕСЯЦА)

### 6️⃣ Добавить E2E тесты

**Мобилка (Flutter integration_test):**

```dart
// mebelplace_demo/integration_test/app_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mebelplace_demo/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Login flow test', (tester) async {
    app.main();
    await tester.pumpAndSettle();

    // Найти поля ввода
    final phoneField = find.byKey(Key('phone_field'));
    final passwordField = find.byKey(Key('password_field'));
    final loginButton = find.byKey(Key('login_button'));

    // Ввести данные
    await tester.enterText(phoneField, '+77001234567');
    await tester.enterText(passwordField, 'password123');
    
    // Нажать кнопку входа
    await tester.tap(loginButton);
    await tester.pumpAndSettle();

    // Проверить что появился главный экран
    expect(find.text('Главная'), findsOneWidget);
  });
}
```

```bash
# Запустить тесты
cd mebelplace_demo
flutter test integration_test/app_test.dart
```

**Веб (Playwright):**

```bash
cd client
npm install -D @playwright/test
npx playwright install
```

```typescript
// client/tests/login.spec.ts
import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  
  await page.fill('input[name="phone"]', '+77001234567');
  await page.fill('input[name="password"]', 'password123');
  
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('http://localhost:5173/');
  await expect(page.locator('text=Главная')).toBeVisible();
});

test('video feed loads', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Ждем загрузки видео
  await page.waitForSelector('.video-player', { timeout: 5000 });
  
  const videos = await page.locator('.video-player').count();
  expect(videos).toBeGreaterThan(0);
});
```

```bash
# Запустить тесты
npx playwright test
```

**Время:** 2-3 недели  
**Приоритет:** 🟡 СРЕДНИЙ

---

### 7️⃣ Мониторинг и error tracking (Sentry)

```bash
# Мобилка
flutter pub add sentry_flutter

# Веб
cd client
npm install @sentry/react
```

```dart
// mebelplace_demo/lib/main.dart
import 'package:sentry_flutter/sentry_flutter.dart';

Future<void> main() async {
  await SentryFlutter.init(
    (options) {
      options.dsn = 'https://xxx@sentry.io/xxx';
      options.tracesSampleRate = 1.0;
    },
    appRunner: () => runApp(MyApp()),
  );
}
```

```typescript
// client/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxx@sentry.io/xxx",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

**Время:** 1 день  
**Приоритет:** 🟡 СРЕДНИЙ

---

## 📝 ЧЕКЛИСТ ВЫПОЛНЕНИЯ

### Неделя 1 (КРИТИЧЕСКИЕ)
- [ ] ✅ Заменить SharedPreferences на FlutterSecureStorage (мобилка)
- [ ] ✅ Убрать дублирование ключей в API (веб)
- [ ] ✅ Протестировать изменения

### Месяц 1 (ВАЖНЫЕ)
- [ ] 🔄 Добавить Redux Toolkit (веб)
- [ ] 🔄 Настроить CDN для статики (backend)
- [ ] 🔄 Добавить индикацию обработки видео

### Месяц 2-3 (УЛУЧШЕНИЯ)
- [ ] 📊 Добавить E2E тесты (мобилка + веб)
- [ ] 📊 Настроить Sentry monitoring
- [ ] 📊 Performance optimization

---

## 🎯 ИТОГОВЫЕ МЕТРИКИ УСПЕХА

После выполнения всех задач:

| Метрика | До | После | Улучшение |
|---------|----|-

------|-----------|
| **Безопасность токенов** | ⚠️ SharedPreferences | ✅ Secure Storage | +95% |
| **Payload size (веб)** | 100 KB | 50 KB | -50% |
| **State management (веб)** | ❌ Дублирование | ✅ Redux | +80% maintainability |
| **CDN latency** | 2-5s (из-за рубежа) | 0.2-0.5s | -90% |
| **Test coverage** | 0% | 60%+ | ♾️ |

---

**Автор:** AI Assistant  
**Дата:** 30 октября 2025  
**Версия:** 1.0

