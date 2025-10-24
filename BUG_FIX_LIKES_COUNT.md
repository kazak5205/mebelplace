# 🐛 Исправление бага с подсчётом лайков

**Дата:** 24 октября 2025  
**Проблема:** Неправильный подсчёт лайков из-за SQL JOIN

## 🔍 Найденная проблема

### Симптомы:
- На экране показывается 31 лайк
- API возвращает `like_count: "3"`
- В базе данных только 1 реальный лайк

### Причина:
SQL-запрос с множественными LEFT JOIN создаёт перекрёстное произведение (cartesian product):

```sql
LEFT JOIN video_likes vl ON v.id = vl.video_id
LEFT JOIN video_comments vc ON v.id = vc.video_id
COUNT(vl.id) as like_count  ← БАГ!
```

**Что происходит:**
- Видео имеет 1 лайк и 3 комментария
- JOIN создаёт 1 × 3 = 3 строки в результате
- `COUNT(vl.id)` считает все 3 строки вместо уникальных лайков
- Поэтому API возвращал `like_count: "3"` вместо `"1"`

### Пример:
```
| video_id | like_id | comment_id |
|----------|---------|------------|
| video-1  | like-1  | comment-1  |  ← JOIN создаёт 3 строки
| video-1  | like-1  | comment-2  |  ← для 1 лайка
| video-1  | like-1  | comment-3  |  ← COUNT считает все 3!
```

## ✅ Исправление

Заменено `COUNT(vl.id)` на `COUNT(DISTINCT vl.id)` в 3 местах:

### 1. GET /api/videos/feed - основной feed
**Файл:** `server/routes/videos.js:103-104`
```javascript
// БЫЛО:
COUNT(vl.id) as like_count,
COUNT(vc.id) as comment_count

// СТАЛО:
COUNT(DISTINCT vl.id) as like_count,
COUNT(DISTINCT vc.id) as comment_count
```

### 2. GET /api/videos/feed - админские видео
**Файл:** `server/routes/videos.js:145-146`
```javascript
// БЫЛО:
COUNT(vl.id) as like_count,
COUNT(vc.id) as comment_count

// СТАЛО:
COUNT(DISTINCT vl.id) as like_count,
COUNT(DISTINCT vc.id) as comment_count
```

### 3. GET /api/videos/:id - одно видео
**Файл:** `server/routes/videos.js:639-640`
```javascript
// БЫЛО:
COUNT(vl.id) as like_count,
COUNT(vc.id) as comment_count

// СТАЛО:
COUNT(DISTINCT vl.id) as like_count,
COUNT(DISTINCT vc.id) as comment_count
```

## 📊 Результаты

### До исправления:
```json
{
  "likes": 1,
  "like_count": "3",  ← НЕПРАВИЛЬНО (1 лайк × 3 комментария = 3)
  "comment_count": "3"
}
```

### После исправления:
```json
{
  "likes": 1,
  "like_count": "1",  ← ✅ ПРАВИЛЬНО
  "comment_count": "3"
}
```

## 🔧 Применение изменений

Изменения уже применены:
1. ✅ Код исправлен в `/opt/mebelplace/server/routes/videos.js`
2. ✅ Файл скопирован в backend контейнер
3. ✅ Backend перезапущен
4. ✅ Изменения протестированы и работают

## 🧪 Тестирование

### Тест 1: Проверить API для конкретного видео
```bash
curl -s "https://mebelplace.com.kz/api/videos/3cd91b71-e2ec-4889-b963-0ea2d4329dad" \
  | jq '.data | {likes, like_count, comment_count}'
```

**Ожидаемый результат:**
```json
{
  "likes": 1,
  "like_count": "1",
  "comment_count": "3"
}
```

### Тест 2: Проверить feed
```bash
curl -s "https://mebelplace.com.kz/api/videos/feed?limit=1" \
  | jq '.data.videos[0] | {likes, like_count, comment_count}'
```

### Тест 3: Проверить в базе данных
```bash
docker exec mebelplace-postgres psql -U mebelplace -d mebelplace -c \
  "SELECT v.id, v.likes, COUNT(DISTINCT vl.id) as real_likes 
   FROM videos v 
   LEFT JOIN video_likes vl ON v.id = vl.video_id 
   WHERE v.id = '3cd91b71-e2ec-4889-b963-0ea2d4329dad' 
   GROUP BY v.id, v.likes;"
```

## ⚠️ Важные замечания

1. **COUNT vs COUNT(DISTINCT):**
   - `COUNT(id)` - считает ВСЕ строки (включая дубликаты из JOIN)
   - `COUNT(DISTINCT id)` - считает только УНИКАЛЬНЫЕ значения

2. **Когда использовать DISTINCT:**
   - Всегда при COUNT с множественными JOIN
   - Когда JOIN может создать дубликаты строк
   - Когда нужно считать уникальные записи

3. **Производительность:**
   - `COUNT(DISTINCT)` немного медленнее чем `COUNT()`
   - Но это правильный способ для точного подсчёта
   - Для большой нагрузки можно использовать подзапросы

## 🔍 Дополнительная проверка

Проверьте другие файлы на наличие похожей проблемы:
```bash
grep -r "COUNT(" server/routes/ | grep -v "DISTINCT"
```

Особое внимание на:
- `server/routes/admin.js` - может быть похожая проблема
- Любые запросы с множественными JOIN

## 📝 Выводы

**Корневая причина:** Неправильное использование `COUNT()` с JOIN  
**Решение:** Использовать `COUNT(DISTINCT column)` для уникального подсчёта  
**Статус:** ✅ ИСПРАВЛЕНО  
**Тип:** SQL Bug / Data Integrity Issue

---

**Автор исправления:** AI Assistant  
**Проверено:** Работает корректно

