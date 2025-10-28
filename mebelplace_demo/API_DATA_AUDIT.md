# Аудит использования API данных во Flutter приложении

## ✅ Страницы с реальными API данными:

### 1. **HomeScreen** (главная - видео)
- ✅ Видео загружаются через `videoProvider.loadVideos()`
- ✅ Лайки через API: `videoProvider.likeVideo()`
- ✅ Комментарии через API: `commentProvider` в `CommentsBottomSheet`
- ✅ Просмотры записываются: `videoProvider.recordView()`

### 2. **OrdersScreen** (заявки)
- ✅ Заказы загружаются через `orderProvider.loadOrders()`
- ✅ Фильтрация по статусу работает
- ⚠️ **ПРОБЛЕМА:** `budget: '0'` - захардкожено, нужно брать из `order.price`

### 3. **MessagesScreen** (чаты)
- ✅ Чаты загружаются через `chatProvider.loadChats()`
- ✅ Реальные данные с API

### 4. **ProfileScreen** (профиль)
- ✅ Видео/заказы считаются из provider
- ✅ Подписчики из `user.followersCount`
- ⚠️ **ПРОБЛЕМА:** Подписки = '0' (нет в API)
- ⚠️ **ПРОБЛЕМА:** Лайки = '0' (нужно считать)

### 5. **MasterChannelPage** (канал мастера)
- ✅ Данные мастера через `apiService.getUser()`
- ✅ Видео мастера через `videoProvider.loadMasterVideos()`
- ✅ Сетка видео с реальными данными
- ✅ Подписка работает (локально)

### 6. **SearchResultsPage** (поиск)
- ✅ Поиск видео через `videoProvider.searchVideos()`
- ✅ Поиск заказов через `orderProvider.searchOrders()`
- ✅ Поиск мастеров через `masterProvider.searchMasters()`

### 7. **OrderDetailPage** (детали заявки)
- ✅ Детали через `apiService.getOrder()`
- ✅ Отклики через `apiService.getOrderResponses()`

### 8. **ChatPage** (чат)
- ✅ Сообщения через `chatProvider.loadMessages()`
- ✅ Отправка через `chatProvider.sendMessage()`

### 9. **CreateOrderPage** (создание заказа)
- ✅ Создание через `apiService.createOrder()`
- ✅ Загрузка фото работает

### 10. **CreateVideoScreen** (создание видео)
- ✅ Загрузка видео через `apiService.uploadVideo()`

### 11. **SupportPage** (поддержка)
- ✅ Отправка обращений через `apiService.submitSupportTicket()`

### 12. **Auth страницы**
- ✅ Регистрация через `apiService.register()`
- ✅ Логин через `apiService.login()`
- ✅ SMS верификация через `apiService.verifySmsCode()`

---

## ✅ Модальные окна с реальными API данными:

### 1. **CommentsBottomSheet** (`home_screen.dart`)
- ✅ Комментарии загружаются через `commentProvider(videoId)`
- ✅ Добавление комментария работает
- ✅ Аватары пользователей с API

### 2. **OrderDialog** (`home_screen.dart`)
- ✅ Данные мастера из `video` (avatar, name)
- ✅ Переход на создание заказа работает

### 3. **ShareDialog** (`home_screen.dart`)
- ✅ Данные видео передаются
- ✅ Использует Share.share() API

### 4. **EditProfileDialog** (`profile_screen.dart`)
- ⚠️ Заглушка "Функция будет доступна в следующей версии"

---

## ⚠️ Найденные проблемы:

### 1. **ProfileScreen** - захардкоженные '0'
```dart
// Строка 264
value: '0', // TODO: Добавить в UserModel subscriptionsCount

// Строка 268
value: '0', // TODO: Подсчитать лайки пользователя
```
**Решение:** Оставить как есть с TODO - это данные, которых нет в текущей API

### 2. **OrdersScreen** - бюджет захардкожен
```dart
// Строка 284
budget: '0', // TODO: Add budget field to OrderModel if available
```
**Решение:** Использовать `order.price` вместо '0'

### 3. **OrderModel** - отсутствует поле budget
**Решение:** OrderModel уже имеет поле `price`, нужно просто использовать его

---

## 📊 Итог:

### ✅ Используют API (100%):
- HomeScreen
- OrdersScreen (кроме budget)
- MessagesScreen
- MasterChannelPage
- SearchResultsPage
- OrderDetailPage
- ChatPage
- CreateOrderPage
- CreateVideoScreen
- SupportPage
- Auth страницы
- CommentsBottomSheet
- OrderDialog
- ShareDialog

### ⚠️ Имеют placeholder данные (допустимо):
- ProfileScreen: подписки/лайки (нет в API)
- OrdersScreen: budget → **ИСПРАВИТЬ** на `order.price`

### 🎯 Что нужно исправить:
1. **OrdersScreen** - заменить `budget: '0'` на `budget: order.price?.toString() ?? 'Не указан'`

Всё остальное использует реальные API данные! ✅

