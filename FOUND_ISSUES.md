# 🐛 НАЙДЕННЫЕ ПРОБЛЕМЫ В MEBELPLACE FLUTTER APP

**Дата анализа:** 2025-10-28 03:48 UTC  
**Тестирование:** Эмулятор Android API 33  
**Аккаунты:** +77785421871 (user), +77475678424 (master)  
**Пароль:** 24526Wse

---

## 🔴 КРИТИЧНЫЕ ПРОБЛЕМЫ (БЛОКИРУЮТ ИСПОЛЬЗОВАНИЕ)

### ❌ **ПРОБЛЕМА #1: КОММЕНТАРИИ - МОК ДАННЫЕ**
**Файл:** `lib/presentation/pages/home_screen.dart:254`  
**Описание:** При открытии комментариев показываются 10 фейковых комментариев вместо реальных  
**Код:**
```dart
itemCount: 10, // Mock comments
itemBuilder: (context, index) {
  return Container(
    child: Text('Пользователь ${index + 1}'), // Мок!
    child: Text('Отличное видео! Очень понравилось качество работы.'), // Мок!
```

**Решение:**
1. ✅ Создан `CommentModel` - `/lib/data/models/comment_model.dart`
2. ✅ Добавлен метод `getVideoComments()` в `api_service.dart:901`
3. ⏳ TODO: Заменить мок на реальную загрузку через API

**API Endpoint:** `GET /api/videos/:id/comments` ✅ РАБОТАЕТ  
**Проверка:** `curl https://mebelplace.com.kz/api/videos/de669f60-3ec2-4cb3-82e3-8dbb0c17f6e1/comments`

---

### ❌ **ПРОБЛЕМА #2: USERNAME vs FIRSTNAME ПУТАНИЦА**
**Файл:** Множественные файлы  
**Описание:** В коде смешиваются `username` и `firstName`/`lastName`. Сервер возвращает `username: "Ибрагим"` но это на самом деле firstName.

**Пример из API ответа:**
```json
{
  "user": {
    "username": "Ибрагим",   ← ЭТО firstName!
    "firstName": null,
    "lastName": null
  }
}
```

**Где проявляется:**
- Отображение имени пользователя в видео
- Отображение в комментариях
- Отображение в профиле

**Решение:** Использовать `user.displayName` getter из `UserModel`:
```dart
String get displayName {
  if (firstName != null && lastName != null) {
    return '$firstName $lastName';
  }
  return username;
}
```

---

### ❌ **ПРОБЛЕМА #3: АВАТАРЫ НЕ ПОКАЗЫВАЮТСЯ**
**Описание:** Многие пользователи не имеют аватаров (`avatar: null`), показывается placeholder

**API возвращает:** `"avatar": null` для большинства пользователей

**Решение:** 
1. Использовать fallback к инициалам имени
2. Генерировать цветные аватары по первой букве имени

**Реализация:** Уже есть в `CircleAvatar` но нужно проверить везде

---

## ⚠️ ВЫСОКИЙ ПРИОРИТЕТ (ВЛИЯЮТ НА UX)

### ⚠️ **ПРОБЛЕМА #4: СЧЁТЧИКИ (likes, comments, views) - НЕСООТВЕТСТВИЕ**
**Описание:** В `VideoModel` есть И `likes` И `likesCount` - это разные поля!

**Из API:**
```json
{
  "likes": 1,           ← Количество лайков (легаси)
  "likesCount": 2,      ← Правильное поле (используется)
  "commentsCount": 4
}
```

**Проблема:** В коде используется `likesCount`, но при форматировании могут быть ошибки

**Решение:** Использовать ТОЛЬКО `likesCount`, `commentsCount`, `views` (не `viewsCount`)

---

### ⚠️ **ПРОБЛЕМА #5: DURATION = NULL**
**Файл:** `VideoModel`  
**Описание:** Многие видео имеют `duration: null` потому что бэкенд ещё не обработал

**API возвращает:**
```json
{
  "duration": null,  ← Видео ещё обрабатывается!
  "thumbnail_url": null
}
```

**Решение:** ✅ УЖЕ ИСПРАВЛЕНО - `duration` сделан nullable (`int?`)

---

### ⚠️ **ПРОБЛЕМА #6: FILE_SIZE ВОЗВРАЩАЕТСЯ КАК STRING**
**API возвращает:**
```json
{
  "file_size": "1168515"  ← Строка вместо числа!
}
```

**Решение:** ✅ УЖЕ ИСПРАВЛЕНО в `VideoModel.fromJson`:
```dart
fileSize: int.tryParse(json['fileSize']?.toString() ?? '0') ?? 0,
```

---

### ⚠️ **ПРОБЛЕМА #7: TAGS ВОЗВРАЩАЮТСЯ КАК STRING ИЛИ ARRAY**
**API может вернуть:**
```json
{
  "tags": ["кухня"]           ← Массив (правильно)
  "tags": "кухня,мебель"      ← Строка через запятую (иногда)
}
```

**Решение:** ✅ УЖЕ ИСПРАВЛЕНО в `VideoModel.fromJson`:
```dart
List<String> parsedTags = [];
if (json['tags'] != null) {
  if (json['tags'] is List) {
    parsedTags = (json['tags'] as List).map((e) => e.toString()).toList();
  } else if (json['tags'] is String) {
    parsedTags = (json['tags'] as String).split(',').map((e) => e.trim()).toList();
  }
}
```

---

## 📝 СРЕДНИЙ ПРИОРИТЕТ (МОЖНО УЛУЧШИТЬ)

### 📝 **ПРОБЛЕМА #8: ИЗБЫТОЧНЫЕ FALLBACK ЗНАЧЕНИЯ**
**Файл:** Множественные  
**Описание:** В коде много избыточных проверок:

```dart
likesCount: video.likes_count || video.likesCount || video.likes  // 3 варианта!
```

**После `snakeToCamel` трансформации** в `ApiService` уже есть ОБА варианта:
- `likes_count` (оригинал)
- `likesCount` (трансформированный)

**Решение:** Упростить до:
```dart
likesCount: video.likesCount || 0  // Только camelCase после трансформации
```

---

### 📝 **ПРОБЛЕМА #9: ПРОВЕРКА НЕСУЩЕСТВУЮЩИХ ПОЛЕЙ**
**Пример:**
```dart
likesCount: video.likes_count || video.likesCount || video.likes
```

Поле `video.likes` (без `Count`) **НЕ СУЩЕСТВУЕТ** в новом API!

**Решение:** Удалить проверку `video.likes`

---

### 📝 **ПРОБЛЕМА #10: СМЕШИВАНИЕ authorId И masterId**
**Файл:** `tiktok_video_player.dart:244` (было исправлено)  
**Описание:** В некоторых местах путаются `authorId` и `masterId`:

```dart
const authorId = video.authorId || video.masterId  // НЕПРАВИЛЬНО!
```

**Разница:**
- `author_id` = ID автора видео (может быть мастер ИЛИ клиент)
- `master_id` = ID мастера (только если автор - мастер)

**Решение:** ✅ УЖЕ ИСПРАВЛЕНО - использовать `video.authorId`

---

## ✅ УЖЕ ИСПРАВЛЕНО

### ✅ **БЫЛ БАГ: UserModel крашил после логина**
**Описание:** Поля `isActive`, `isVerified`, `createdAt` были required, но API не всегда их возвращает

**Решение:** ✅ ИСПРАВЛЕНО - сделаны nullable:
```dart
final bool? isActive;
final bool? isVerified;
final DateTime? createdAt;
```

---

### ✅ **БЫЛ БАГ: Relative URLs вместо absolute**
**Решение:** ✅ ИСПРАВЛЕНО - бэкенд теперь возвращает полные URL:
```
https://mebelplace.com.kz/uploads/videos/...
```

---

### ✅ **БЫЛ БАГ: snake_case / camelCase**
**Решение:** ✅ ИСПРАВЛЕНО - `ApiService` трансформирует автоматически через `snakeToCamel()`

---

## 🟢 НЕ ПРОБЛЕМЫ (РАБОТАЕТ ПРАВИЛЬНО)

### 🟢 **ЭНДПОИНТ /api/search СУЩЕСТВУЕТ**
**Проверка:**
```bash
curl "https://mebelplace.com.kz/api/search?q=кухня&type=video"
```
**Результат:** ✅ Возвращает 2 видео

---

### 🟢 **ДУБЛИРОВАНИЕ КЛЮЧЕЙ В ApiService**
**Описание:** `snakeToCamel()` сохраняет ОБА варианта ключей:
```typescript
result[camelKey] = value  // camelCase
result[key] = value       // snake_case (оригинал)
```

**Это ПРАВИЛЬНО!** Обеспечивает обратную совместимость.

---

### 🟢 **ПОРЯДОК МАРШРУТОВ**
Специфичные маршруты (`/feed`, `/master/:id`) идут ДО общего (`/:id`) - ✅ ПРАВИЛЬНО

---

## 📊 СТАТИСТИКА

| Категория | Количество |
|-----------|-----------|
| 🔴 Критичные | 3 |
| ⚠️ Высокий приоритет | 4 |
| 📝 Средний приоритет | 3 |
| ✅ Исправлено | 3 |
| 🟢 Не проблемы | 3 |
| **ВСЕГО** | **16** |

---

## 🎯 ПЛАН ИСПРАВЛЕНИЯ

### Фаза 1: Критичные (СЕЙЧАС)
1. ✅ Создать `CommentModel`
2. ✅ Добавить `getVideoComments()` в API
3. ⏳ Заменить мок комментариев на реальные
4. ⏳ Исправить путаницу username/firstName
5. ⏳ Исправить отображение аватаров

### Фаза 2: Высокий приоритет
6. Проверить счётчики (likes, comments, views)
7. Убедиться что duration/thumbnail handle null

### Фаза 3: Средний приоритет
8. Упростить fallback значения
9. Удалить проверки несуществующих полей
10. Проверить authorId vs masterId везде

### Фаза 4: Тестирование
11. Пересобрать APK
12. Протестировать ВСЕ 25 сценариев
13. Проверить на эмуляторе

---

## ⏰ ВРЕМЯ РАБОТЫ

**Начало:** 20:03  
**Текущее время:** 03:48  
**Прошло:** 3 часа 45 минут  
**Осталось:** 3 часа 15 минут

**ПРОДОЛЖАЮ БЕЗ ОСТАНОВОК!** 💪

