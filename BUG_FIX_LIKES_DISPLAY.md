# 🐛 Исправление бага с отображением лайков

**Дата:** 24 октября 2025  
**Проблема:** Неправильное отображение количества лайков на фронтенде

## 🔍 Найденная проблема

### Симптомы:
1. **В базе данных:** 1 лайк ✅
2. **API возвращает:** `like_count: 1` ✅
3. **На экране показывает:** 10 лайков ❌

### Причина 1: COUNT() возвращает строку вместо числа

PostgreSQL `COUNT()` возвращает тип `bigint`, который pg-драйвер Node.js конвертирует в **строку** для избежания переполнения JavaScript Number.

**API возвращало:**
```json
{
  "likes": 1,
  "like_count": "1"  ← строка вместо числа!
}
```

**После camelCase трансформации:**
```json
{
  "likes": 1,
  "likeCount": "1"  ← всё ещё строка!
}
```

### Причина 2: Фронтенд не преобразовывал строку в число

```typescript
// VideoPlayer.tsx:433
likeCount: currentVideo.likeCount || 0  ← "1" || 0 = "1" (строка!)
```

Строка `"1"` является truthy значением, поэтому `|| 0` не срабатывает.

## ✅ Исправление

### 1. Backend: Явное преобразование в integer (server/routes/videos.js)

Добавлено `::int` для приведения типа:

```sql
-- БЫЛО:
COUNT(DISTINCT vl.id) as like_count

-- СТАЛО:
COUNT(DISTINCT vl.id)::int as like_count
```

**Применено в 3 местах:**
- `GET /api/videos/feed` - основной feed (строки 103, 104)
- `GET /api/videos/feed` - админские видео (строки 145, 146)
- `GET /api/videos/:id` - одно видео (строки 639, 640)

**Результат:**
```json
{
  "likes": 1,
  "like_count": 1  ← теперь число!
}
```

### 2. Frontend: Безопасное преобразование (client/src/components/VideoPlayer.tsx)

Добавлен `parseInt()` для гарантии числового типа:

```typescript
// БЫЛО:
likeCount: currentVideo.likeCount || 0

// СТАЛО:
likeCount: parseInt(currentVideo.likeCount as any) || currentVideo.likes || 0
```

**Применено в 2 местах:**
- Инициализация состояния (строка 433)
- Обработка лайка (строка 213)

### 3. Types: Обновление TypeScript типов (client/src/types/index.ts)

Добавлены недостающие поля:

```typescript
export interface Video {
  // ...
  likes?: number;              ← добавлено
  likeCount?: number | string; ← разрешены оба типа для безопасности
  // ...
}
```

## 📊 Результаты

### До исправления:

**API:**
```json
{
  "likes": 1,
  "like_count": "1"  ← строка
}
```

**Фронтенд:**
- Отображает 10 или другое неправильное число
- Проблема с типами данных

### После исправления:

**API:**
```json
{
  "likes": 1,
  "like_count": 1  ← число
}
```

**Фронтенд:**
- Правильно отображает 1 лайк
- Безопасное преобразование типов

## 🔧 Применение изменений

Все изменения применены:

1. ✅ **Backend:**
   - Исправлен `/opt/mebelplace/server/routes/videos.js`
   - Скопирован в контейнер
   - Backend перезапущен

2. ✅ **Frontend:**
   - Исправлен `/opt/mebelplace/client/src/components/VideoPlayer.tsx`
   - Исправлен `/opt/mebelplace/client/src/types/index.ts`
   - Фронтенд пересобран (`npm run build`)
   - Скопирован в контейнер nginx

3. ✅ **Проверка:**
   - API возвращает числа: `curl https://mebelplace.com.kz/api/videos/...`
   - Типы правильные: `"like_count": "number"`

## 🧪 Тестирование

### Тест 1: Проверить API
```bash
curl -s "https://mebelplace.com.kz/api/videos/3cd91b71-e2ec-4889-b963-0ea2d4329dad" \
  | jq '.data | {likes, like_count, comment_count}'
```

**Ожидаемый результат:**
```json
{
  "likes": 1,
  "like_count": 1,
  "comment_count": 3
}
```

### Тест 2: Проверить типы
```bash
curl -s "https://mebelplace.com.kz/api/videos/3cd91b71-e2ec-4889-b963-0ea2d4329dad" \
  | jq '.data | {likes, like_count, comment_count} | map_values(type)'
```

**Ожидаемый результат:**
```json
{
  "likes": "number",
  "like_count": "number",
  "comment_count": "number"
}
```

### Тест 3: Проверить на сайте

1. Откройте https://mebelplace.com.kz
2. Очистите кеш: **Ctrl + Shift + R** (Windows/Linux) или **Cmd + Shift + R** (Mac)
3. Откройте видео
4. Проверьте количество лайков - должно быть **1**, а не 10

## 💡 Важные замечания

### Почему COUNT() возвращает строку?

PostgreSQL `COUNT()` возвращает `bigint` (64-bit integer), который может превышать максимальное безопасное значение JavaScript Number (2^53 - 1).

pg-драйвер Node.js **по умолчанию** конвертирует `bigint` в строку для безопасности.

### Решения:

1. **Приведение типа в SQL:** `COUNT(...)::int` ← наше решение
   - ✅ Простое и понятное
   - ✅ Работает для небольших значений (< 2 млрд)
   - ⚠️ Потенциальное переполнение при огромных значениях

2. **Настройка pg-драйвера:**
   ```javascript
   pg.types.setTypeParser(20, val => parseInt(val))
   ```
   - ✅ Работает глобально
   - ⚠️ Может сломать другой код

3. **Преобразование на клиенте:** `parseInt()` ← дополнительная защита
   - ✅ Безопасно
   - ✅ Работает даже если API вернёт строку

### Наш подход: Защита на всех уровнях

Мы применили исправления на **обоих уровнях**:
- **Backend:** `::int` для правильного типа из БД
- **Frontend:** `parseInt()` для дополнительной защиты

Это обеспечивает максимальную надёжность! 🛡️

## 🔍 Дополнительная проверка

Проверьте другие места, где используется COUNT():

```bash
grep -r "COUNT(" server/ | grep -v "::int" | grep -v "DISTINCT"
```

## 📝 Выводы

**Корневые причины:**
1. PostgreSQL COUNT() → bigint → строка в Node.js
2. Фронтенд не преобразовывал строку в число

**Решения:**
1. Backend: `COUNT(...)::int` для явного приведения типа
2. Frontend: `parseInt()` для безопасного преобразования
3. Types: Обновление TypeScript интерфейсов

**Статус:** ✅ ИСПРАВЛЕНО  
**Тип:** Type Mismatch / Data Display Bug

---

**Проверено:** Работает корректно, все типы данных правильные

