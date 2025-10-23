# API Examples для системы заявок

## Базовый URL
```
https://mebelplace.com.kz/api
```

## Аутентификация
Все запросы (кроме получения категорий) требуют заголовок:
```
Authorization: Bearer <JWT_TOKEN>
```

## 1. Создание заявки

### POST /api/orders
```bash
curl -X POST https://mebelplace.com.kz/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "title=Нужен диван для гостиной" \
  -F "description=Ищу качественный диван для гостиной комнаты. Размер примерно 2x1.5 метра. Предпочтительно серый или бежевый цвет." \
  -F "category=диван" \
  -F "location=Алматы, ул. Абая 150" \
  -F "images=@sofa1.jpg" \
  -F "images=@sofa2.jpg"
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Нужен диван для гостиной",
    "description": "Ищу качественный диван для гостиной комнаты...",
    "images": ["/uploads/orders/order-1234567890-sofa1.jpg"],
    "client_id": "456e7890-e89b-12d3-a456-426614174001",
    "master_id": null,
    "status": "pending",
    "price": null,
    "deadline": null,
    "location": "Алматы, ул. Абая 150",
    "category": "диван",
    "is_active": true,
    "created_at": "2025-01-20T10:30:00Z",
    "updated_at": "2025-01-20T10:30:00Z"
  },
  "message": "Order created successfully",
  "timestamp": "2025-01-20T10:30:00Z"
}
```

## 2. Получение списка заявок

### GET /api/orders
```bash
curl -X GET "https://mebelplace.com.kz/api/orders?status=pending&category=диван&limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Параметры запроса:**
- `status` - статус заявки (pending, accepted, in_progress, completed, cancelled)
- `category` - категория мебели
- `limit` - количество заявок (1-100)
- `offset` - смещение для пагинации

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Нужен диван для гостиной",
      "description": "Ищу качественный диван...",
      "images": ["/uploads/orders/order-1234567890-sofa1.jpg"],
      "client_id": "456e7890-e89b-12d3-a456-426614174001",
      "master_id": null,
      "status": "pending",
      "price": null,
      "deadline": null,
      "location": "Алматы, ул. Абая 150",
      "category": "диван",
      "is_active": true,
      "created_at": "2025-01-20T10:30:00Z",
      "updated_at": "2025-01-20T10:30:00Z",
      "client_username": "ivan_petrov",
      "client_first_name": "Иван",
      "client_last_name": "Петров",
      "client_avatar": "/avatars/ivan.jpg"
    }
  ],
  "message": "Orders retrieved successfully",
  "timestamp": "2025-01-20T10:30:00Z"
}
```

## 3. Получение заявки по ID

### GET /api/orders/:id
```bash
curl -X GET https://mebelplace.com.kz/api/orders/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Нужен диван для гостиной",
    "description": "Ищу качественный диван...",
    "images": ["/uploads/orders/order-1234567890-sofa1.jpg"],
    "client_id": "456e7890-e89b-12d3-a456-426614174001",
    "master_id": null,
    "status": "pending",
    "price": null,
    "deadline": null,
    "location": "Алматы, ул. Абая 150",
    "category": "диван",
    "is_active": true,
    "created_at": "2025-01-20T10:30:00Z",
    "updated_at": "2025-01-20T10:30:00Z",
    "responses": [
      {
        "id": "789e0123-e89b-12d3-a456-426614174002",
        "order_id": "123e4567-e89b-12d3-a456-426614174000",
        "master_id": "321e6543-e89b-12d3-a456-426614174003",
        "message": "Здравствуйте! Могу изготовить диван по вашим требованиям. У меня большой опыт работы с мебелью.",
        "price": 150000,
        "deadline": "2025-02-15T00:00:00Z",
        "is_active": true,
        "created_at": "2025-01-20T11:00:00Z",
        "updated_at": "2025-01-20T11:00:00Z",
        "username": "master_sergey",
        "first_name": "Сергей",
        "last_name": "Иванов",
        "avatar": "/avatars/sergey.jpg",
        "phone": "+7 777 123 4567"
      }
    ]
  },
  "message": "Order retrieved successfully",
  "timestamp": "2025-01-20T10:30:00Z"
}
```

## 4. Создание отклика на заявку

### POST /api/orders/:id/responses
```bash
curl -X POST https://mebelplace.com.kz/api/orders/123e4567-e89b-12d3-a456-426614174000/responses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Здравствуйте! Могу изготовить диван по вашим требованиям. У меня большой опыт работы с мебелью. Предоставлю фото портфолио.",
    "price": 150000,
    "deadline": "2025-02-15T00:00:00Z"
  }'
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": "789e0123-e89b-12d3-a456-426614174002",
    "order_id": "123e4567-e89b-12d3-a456-426614174000",
    "master_id": "321e6543-e89b-12d3-a456-426614174003",
    "message": "Здравствуйте! Могу изготовить диван...",
    "price": 150000,
    "deadline": "2025-02-15T00:00:00Z",
    "is_active": true,
    "created_at": "2025-01-20T11:00:00Z",
    "updated_at": "2025-01-20T11:00:00Z",
    "master": {
      "id": "321e6543-e89b-12d3-a456-426614174003",
      "username": "master_sergey",
      "first_name": "Сергей",
      "last_name": "Иванов",
      "avatar": "/avatars/sergey.jpg",
      "phone": "+7 777 123 4567"
    }
  },
  "message": "Response created successfully",
  "timestamp": "2025-01-20T11:00:00Z"
}
```

## 5. Принятие предложения мастера

### POST /api/orders/:id/responses/:responseId/accept
```bash
curl -X POST https://mebelplace.com.kz/api/orders/123e4567-e89b-12d3-a456-426614174000/responses/789e0123-e89b-12d3-a456-426614174002/accept \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Нужен диван для гостиной",
      "description": "Ищу качественный диван...",
      "status": "accepted",
      "master_id": "321e6543-e89b-12d3-a456-426614174003",
      "price": 150000,
      "deadline": "2025-02-15T00:00:00Z",
      "updated_at": "2025-01-20T11:15:00Z"
    },
    "chat": {
      "id": "555e9999-e89b-12d3-a456-426614174004",
      "order_id": "123e4567-e89b-12d3-a456-426614174000",
      "client_id": "456e7890-e89b-12d3-a456-426614174001",
      "master_id": "321e6543-e89b-12d3-a456-426614174003",
      "is_active": true,
      "created_at": "2025-01-20T11:15:00Z",
      "updated_at": "2025-01-20T11:15:00Z"
    }
  },
  "message": "Response accepted successfully",
  "timestamp": "2025-01-20T11:15:00Z"
}
```

## 6. Получение статистики заявок

### GET /api/orders/stats
```bash
curl -X GET https://mebelplace.com.kz/api/orders/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Ответ для клиента:**
```json
{
  "success": true,
  "data": {
    "total_orders": 5,
    "pending_orders": 2,
    "accepted_orders": 1,
    "in_progress_orders": 1,
    "completed_orders": 1,
    "cancelled_orders": 0
  },
  "message": "Stats retrieved successfully",
  "timestamp": "2025-01-20T10:30:00Z"
}
```

**Ответ для мастера:**
```json
{
  "success": true,
  "data": {
    "total_orders": 3,
    "accepted_orders": 2,
    "in_progress_orders": 1,
    "completed_orders": 0
  },
  "message": "Stats retrieved successfully",
  "timestamp": "2025-01-20T10:30:00Z"
}
```

## 7. Получение доступных категорий

### GET /api/orders/categories
```bash
curl -X GET https://mebelplace.com.kz/api/orders/categories
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    "диван",
    "стол",
    "шкаф",
    "кровать",
    "стул",
    "кресло",
    "комод",
    "тумба",
    "полка",
    "стенка",
    "кухня",
    "прихожая",
    "детская",
    "офисная",
    "другое"
  ],
  "message": "Categories retrieved successfully",
  "timestamp": "2025-01-20T10:30:00Z"
}
```

## 8. Обновление заявки

### PUT /api/orders/:id
```bash
curl -X PUT https://mebelplace.com.kz/api/orders/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Обновленное название заявки",
    "description": "Обновленное описание заявки",
    "status": "in_progress"
  }'
```

## 9. Удаление заявки

### DELETE /api/orders/:id
```bash
curl -X DELETE https://mebelplace.com.kz/api/orders/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## WebSocket события

### Подключение к Socket.IO
```javascript
const socket = io('https://mebelplace.com.kz', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// Присоединение к персональной комнате
socket.emit('join_user_room', userId);

// Присоединение к комнате заявки
socket.emit('join_order_room', orderId);

// Слушание событий
socket.on('new_order', (data) => {
  console.log('Новая заявка:', data);
});

socket.on('new_order_response', (data) => {
  console.log('Новый отклик на заявку:', data);
});

socket.on('order_accepted', (data) => {
  console.log('Заявка принята:', data);
});

socket.on('chat_created', (data) => {
  console.log('Создан чат:', data);
});

socket.on('new_message', (data) => {
  console.log('Новое сообщение:', data);
});
```

## Коды ошибок

- `400` - Ошибка валидации данных
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

## Формат ошибок

```json
{
  "success": false,
  "data": null,
  "message": "Описание ошибки",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ],
  "timestamp": "2025-01-20T10:30:00Z"
}
```
