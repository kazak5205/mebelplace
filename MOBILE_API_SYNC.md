# 🔄 Mobile-Backend API Синхронизация

## ✅ Синхронизация завершена!

Мобильное приложение теперь полностью синхронизировано с backend и использует те же API endpoints что и веб-версия.

### 📦 Созданные/Обновленные файлы:

#### Новые сервисы (синхронизированы с web):
1. **`/mobile/src/services/videoService.ts`** ✅
   - `getVideos()` - получить ленту видео
   - `getVideo(id)` - получить одно видео
   - `getTrendingVideos()` - трендовые видео
   - `uploadVideo()` - загрузка видео
   - `likeVideo()` / `unlikeVideo()` - лайки
   - `recordView()` - запись просмотра
   - `getComments()` / `addComment()` - комментарии
   - `likeComment()` / `unlikeComment()` - лайки комментов
   - `addBookmark()` / `removeBookmark()` - закладки

2. **`/mobile/src/services/orderService.ts`** ✅
   - `getOrders()` - получить заказы
   - `getOrder(id)` - получить один заказ
   - `createOrder()` - создать заказ
   - `updateOrder()` / `deleteOrder()` - управление
   - `updateOrderStatus()` - изменить статус
   - `createResponse()` / `respondToOrder()` - ответы на заказы
   - `getOrderResponses()` - получить ответы
   - `acceptResponse()` / `rejectResponse()` - принять/отклонить
   - `uploadOrderImages()` - загрузка фото
   - `getRegions()` - получить регионы

3. **`/mobile/src/services/chatService.ts`** ✅
   - `getChats()` - получить чаты
   - `getChat(id)` - получить один чат
   - `createChat()` / `createChatWithUser()` - создание чата
   - `getMessages()` - получить сообщения
   - `sendMessage()` - отправить сообщение
   - `markAsRead()` / `markChatAsRead()` - пометить прочитанным
   - `uploadFile()` - загрузка файлов (адаптирован для React Native)

4. **`/mobile/src/services/authService.ts`** ✅
   - `login()` - вход с сохранением токена в AsyncStorage
   - `register()` - регистрация
   - `getCurrentUser()` - получить текущего пользователя
   - `updateUser()` - обновить профиль
   - `logout()` - выход с очисткой токенов
   - `refreshToken()` - обновление токена
   - `verifyToken()` - проверка токена

5. **`/mobile/src/services/userService.ts`** ✅
   - `getUser(id)` - получить пользователя
   - `updateUser()` - обновить данные
   - `deleteUser()` - удалить
   - `uploadAvatar()` - загрузка аватара (адаптирован для React Native)

6. **`/mobile/src/services/index.ts`** ✅
   - Централизованный экспорт всех сервисов

#### Обновленные файлы:
- **`/mobile/src/services/apiService.ts`** ✅
  - Добавлен экспорт `refreshToken` в onUnauthorized
  - Добавлены реэкспорты всех новых сервисов
  - Улучшена документация

### 🔌 Используемые технологии:

#### Shared API Client (`@shared/utils/api`):
- ✅ **ApiClient** - базовый HTTP клиент (общий для web и mobile)
- ✅ **videoApi** - API для видео
- ✅ **orderApi** - API для заказов
- ✅ **chatApi** - API для чатов
- ✅ **userApi** - API для пользователей
- ✅ **authApi** - API для аутентификации
- ✅ **notificationApi** - API для уведомлений

### 🌐 Конфигурация API:

```typescript
// /mobile/src/config/environment.ts
API_URL: 'https://mebelplace.com.kz/api'
SOCKET_URL: 'https://mebelplace.com.kz'
TIMEOUT: 10000ms
```

### 🔑 Токен менеджмент:

**Mobile (AsyncStorage):**
```typescript
getToken: async () => await AsyncStorage.getItem('authToken')
onUnauthorized: async () => {
  await AsyncStorage.removeItem('authToken')
  await AsyncStorage.removeItem('refreshToken')
  navigateToLogin()
}
```

**Web (localStorage):**
```typescript
getToken: () => localStorage.getItem('authToken')
onUnauthorized: () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  window.location.href = '/login'
}
```

### 📱 Особенности мобильной версии:

1. **File uploads** - адаптированы для React Native:
   ```typescript
   // Web
   formData.append('file', file)
   
   // Mobile
   formData.append('file', {
     uri: fileUri,
     type: 'image/jpeg',
     name: 'upload.jpg',
   } as any)
   ```

2. **Navigation** - использует `navigateToLogin()` вместо `window.location`

3. **Storage** - `AsyncStorage` вместо `localStorage`

### ✅ Что синхронизировано:

- ✅ API endpoints полностью идентичны web-версии
- ✅ Методы сервисов имеют одинаковые сигнатуры
- ✅ Используется общий `ApiClient` из `@shared`
- ✅ Обработка ошибок идентична
- ✅ Токен менеджмент адаптирован под платформу
- ✅ File uploads адаптированы для React Native

### 🚀 Использование:

```typescript
// Import services
import { 
  videoService, 
  orderService, 
  chatService, 
  authService,
  userService 
} from '@/services';

// OR use legacy apiService
import { apiService } from '@/services';

// Examples:
const videos = await videoService.getVideos({ page: 1, limit: 10 });
const order = await orderService.createOrder(orderData);
const chat = await chatService.createChat(userId);
const user = await authService.getCurrentUser();
```

### 📊 API Response Format:

Все endpoints возвращают одинаковый формат:
```typescript
{
  success: boolean,
  data: T,
  message: string,
  timestamp: string
}
```

`ApiClient` автоматически извлекает `data` из ответа, поэтому сервисы возвращают уже распакованные данные.

### 🎯 Готово к использованию!

Мобильное приложение теперь использует те же API что и веб-версия. Все endpoints синхронизированы и готовы к работе.

