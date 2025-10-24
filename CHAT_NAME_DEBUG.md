# 🔍 Отладка: Почему мастер видит своё имя в чате

**Дата:** 24 октября 2025  
**Проблема:** Мастер в чате видит своё имя вместо имени клиента

## 🧪 Добавлена отладка

Добавлены `console.log` для проверки логики:

### В ChatListPage.tsx:
```typescript
const getOtherParticipant = (chat: Chat) => {
  const otherParticipant = chat.participants.find((p: any) => {
    const participantId = p.user_id || p.userId || p.id
    const currentUserId = user?.id
    console.log('[ChatList] Comparing:', participantId, '!==', currentUserId)
    return participantId !== currentUserId
  })
  console.log('[ChatList] Other participant:', otherParticipant?.name)
  return otherParticipant || null
}
```

### В ChatPage.tsx:
```typescript
const getOtherParticipant = () => {
  const otherParticipant = chat.participants.find((p: any) => {
    const participantId = p.user_id || p.userId || p.id
    const currentUserId = user?.id
    console.log('[ChatPage] Comparing:', participantId, '!==', currentUserId)
    return participantId !== currentUserId
  })
  console.log('[ChatPage] Other participant:', otherParticipant?.name)
  return otherParticipant || null
}
```

## 🔧 Как проверить

1. Откройте https://mebelplace.com.kz
2. Войдите как мастер (+77075551527)
3. Очистите кеш: **Ctrl + Shift + R**
4. Откройте чат с клиентом
5. Откройте **DevTools** (F12)
6. Перейдите в **Console**
7. Посмотрите логи:

```
[ChatList] Comparing: 68dbd13c-d04c-437e-aa3c-f904c6fd41ae !== 68dbd13c-d04c-437e-aa3c-f904c6fd41ae = false
[ChatList] Comparing: f8cae504-7f98-4ba2-a90c-8dc5662c5c17 !== 68dbd13c-d04c-437e-aa3c-f904c6fd41ae = true
[ChatList] Other participant: Али  ← ДОЛЖНО показывать это!
```

## 📊 Ожидаемое поведение

### Данные из API:
```json
{
  "participants": [
    {
      "user_id": "68dbd13c-d04c-437e-aa3c-f904c6fd41ae",
      "name": "Quick Lab"  ← это вы (мастер)
    },
    {
      "user_id": "f8cae504-7f98-4ba2-a90c-8dc5662c5c17",
      "name": " Али"  ← это клиент
    }
  ]
}
```

### Логика getOtherParticipant:

1. Берём участников чата
2. Ищем того, у кого `user_id !== user.id`
3. Для мастера (68dbd13c...) это будет "Али"
4. Показываем имя "Али" в чате ✅

## 🐛 Возможные причины бага

### 1. user.id не установлен
**Проверка:** `console.log('Current user:', user)`

### 2. Неправильный формат ID
**Проверка:** Логи покажут какие ID сравниваются

### 3. camelCase трансформация
API возвращает `user_id`, но возможно где-то трансформируется в `userId`

### 4. Fallback на первого участника
Старая логика: `|| chat.participants[0]` - могла возвращать себя

## ✅ Внесённые улучшения

1. **Улучшена логика поиска:**
   - Проверка `p.user_id || p.userId || p.id`
   - Проверка `user?.id`
   - Отладочные логи

2. **Убран опасный fallback:**
   - Было: `|| chat.participants[0]` (мог вернуть себя)
   - Стало: `|| null` (лучше ничего, чем неправильное имя)

3. **Добавлены console.log** для отладки

## 📝 Следующие шаги

1. Обновите страницу с Ctrl + Shift + R
2. Откройте Console (F12)
3. Откройте чат
4. Посмотрите логи - они покажут что происходит
5. Отправьте скриншот логов если проблема остаётся

---

**Статус:** В процессе отладки  
**Добавлено:** Логирование для диагностики

