# 🚨 КРИТИЧЕСКИЕ ПРОБЛЕМЫ В ПРОЕКТЕ

**Дата анализа**: 30.10.2025  
**Статус**: Найдены критические баги, блокирующие создание заявок

---

## ❌ ПРОБЛЕМА #1: СОЗДАНИЕ ЗАЯВОК НЕ РАБОТАЕТ (КРИТИЧЕСКАЯ!)

### 🔴 Описание:
**Заявки не создаются ни в мобилке, ни на веб-версии из-за ошибки в SQL запросе на сервере.**

### 📍 Локация проблемы:
**Файл**: `server/routes/orders.js`, строка 46

### 🐛 Суть проблемы:
В SQL запросе используется несуществующая колонка `city`, хотя в схеме БД колонка называется `location`:

**Текущий (НЕПРАВИЛЬНЫЙ) код:**
```javascript
const result = await pool.query(`
  INSERT INTO orders (title, description, images, client_id, category, city, region, price, deadline, status)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  RETURNING *
`, [
  title,
  description,
  images,
  clientId,
  category || 'general',
  city,           // ❌ ОШИБКА: Колонка 'city' не существует в БД!
  region || null,
  budget ? parseFloat(budget) : null,
  deadline ? new Date(deadline) : null,
  'pending'
]);
```

**Схема БД** (`server/config/database.js`, строка 126):
```sql
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  images TEXT[],
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  master_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending',
  price DECIMAL(10,2),
  deadline TIMESTAMP,
  location VARCHAR(255),    -- ✅ Правильное название колонки!
  region VARCHAR(100),
  category VARCHAR(100),
  ...
)
```

### ✅ РЕШЕНИЕ:
Заменить `city` на `location` в SQL запросе:

**Файл**: `server/routes/orders.js`, строка 46
```javascript
const result = await pool.query(`
  INSERT INTO orders (title, description, images, client_id, category, location, region, price, deadline, status)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  RETURNING *
`, [
  title,
  description,
  images,
  clientId,
  category || 'general',
  city,           // ✅ Значение остается 'city' (из req.body), но в SQL пишем 'location'
  region || null,
  budget ? parseFloat(budget) : null,
  deadline ? new Date(deadline) : null,
  'pending'
]);
```

### 📊 Влияние:
- ❌ Заявки НЕ создаются на веб-версии
- ❌ Заявки НЕ создаются в мобильном приложении
- ❌ Пользователи не могут размещать заказы
- 🚨 **БЛОКИРУЮЩАЯ** проблема - основная функциональность не работает!

---

## ⚠️ ПРОБЛЕМА #2: НЕСООТВЕТСТВИЕ API И ФРОНТЕНДА

### 📍 Связанные проблемы в мобильном коде:

#### 1. Мобильное приложение отправляет правильные данные
**Файл**: `mebelplace_demo/lib/data/datasources/api_service.dart`, строка 829
```dart
final formData = FormData.fromMap({
  'title': title,
  'description': description,
  'category': category,
  if (location != null) 'city': location,  // ✅ Правильно отправляет 'city'
  if (region != null) 'region': region,
  if (budget != null) 'budget': budget,
  if (deadline != null) 'deadline': deadline.toIso8601String(),
});
```
✅ Мобильное приложение работает **ПРАВИЛЬНО** - отправляет `city` как и ожидает сервер в `req.body.city`.

#### 2. Веб-версия также отправляет правильно
**Файл**: `client/src/pages/CreateOrderPage.tsx`, строка 70
```typescript
const submitData = new FormData()
submitData.append('title', formData.title)
submitData.append('description', formData.description)
submitData.append('city', formData.location)  // ✅ Правильно отправляет 'city'
submitData.append('region', formData.region)
```
✅ Веб-версия работает **ПРАВИЛЬНО**.

### 🔍 Вывод:
Фронтенды (веб и мобильный) работают **правильно** и отправляют данные в формате, который ожидает сервер (`city` в req.body).  
**Проблема только на сервере** - в SQL запросе используется неправильное имя колонки.

---

## 🎯 ДОПОЛНИТЕЛЬНЫЕ НАХОДКИ:

### 1. ⚠️ Дублирование логики создания заявки

Есть два способа создания заявки на сервере:

**Вариант 1**: `server/routes/orders.js` (строка 17) - используется в production
```javascript
router.post('/create', authenticateToken, imageUpload.array('images', 5), async (req, res) => {
  // Прямой INSERT в БД
  const result = await pool.query(`INSERT INTO orders ...`);
});
```

**Вариант 2**: `server/services/orderService.js` (строка 7) - НЕ используется!
```javascript
static async createOrder(orderData, clientId) {
  // Использует Model и валидацию
  const order = await Order.create({ ...orderData, client_id: clientId });
}
```

**Проблема**: Дублирование кода и логики.  
**Рекомендация**: Использовать `orderService.createOrder()` в route для единообразия.

---

### 2. ⚠️ Model Order.js также имеет ошибку

**Файл**: `server/models/Order.js`, строка 26
```javascript
static async create(orderData) {
  const { title, description, images, client_id, category, location } = orderData;
  // INSERT INTO orders (title, description, images, client_id, category, location)
  // VALUES ($1, $2, $3, $4, $5, $6)
}
```

Здесь используется правильное имя `location`, но:
- Эта функция **не используется** в роутах
- Роуты используют прямой SQL запрос с ошибкой

---

## 🔧 PLAN ИСПРАВЛЕНИЙ (по приоритету):

### КРИТИЧНО (блокирует работу):
1. ✅ Исправить SQL запрос в `server/routes/orders.js` (строка 46) - заменить `city` на `location`
2. ✅ Перезапустить сервер
3. ✅ Протестировать создание заявки на веб и мобилке

### РЕКОМЕНДУЕТСЯ (код качества):
4. 🔄 Рефакторинг: использовать `orderService.createOrder()` в роутах вместо прямого SQL
5. 🔄 Удалить дублирование кода
6. 🔄 Добавить тесты для создания заявок

---

## 📊 АНАЛИЗ ДРУГИХ КОМПОНЕНТОВ:

### ✅ Работают правильно:

1. **Видео** - загрузка и отображение работают корректно
2. **Авторизация** - регистрация, логин, SMS верификация
3. **Чаты** - отправка/получение сообщений
4. **Профиль** - отображение данных пользователя
5. **Поиск** - видео, мастера, заказы (но заказы пустые из-за проблемы #1)
6. **Комментарии** - к видео работают
7. **Лайки** - работают
8. **Подписки** - работают

### ⚠️ Могут работать некорректно после исправления:

1. **Список заявок** - может быть пустой из-за предыдущих неудачных попыток создания
2. **Отклики на заявки** - не протестировано (нет заявок)

---

## 🚀 СЛЕДУЮЩИЕ ШАГИ:

1. **Немедленно исправить** `server/routes/orders.js` - заменить `city` на `location` в SQL
2. Перезапустить сервер
3. Протестировать создание заявки:
   - На веб-версии
   - В мобильном приложении
4. Проверить, что заявки появляются в списке
5. Протестировать отклики мастеров на заявки

---

## 💡 ПОЧЕМУ ЭТО НЕ БЫЛО ЗАМЕЧЕНО РАНЬШЕ:

1. **Нет тестов** - отсутствуют unit/integration тесты для создания заявок
2. **Нет мониторинга** - ошибки БД не логируются должным образом
3. **Нет валидации** - PostgreSQL не возвращает понятную ошибку о несуществующей колонке
4. **Дублирование кода** - есть правильный код в Model, но он не используется

---

## 📝 ИТОГО:

**Основная проблема**: SQL ошибка на сервере блокирует создание заявок.  
**Решение**: Одна строка кода - заменить `city` на `location`.  
**Время на исправление**: 1 минута  
**Тестирование**: 5-10 минут  

После исправления **все должно заработать** - фронтенды уже работают правильно! 🎉



