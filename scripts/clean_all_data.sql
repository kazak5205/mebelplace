-- ========================================
-- ПОЛНАЯ ОЧИСТКА ВСЕХ ДАННЫХ
-- ========================================

-- Отключаем триггеры для быстрой очистки
SET session_replication_role = 'replica';

-- Очищаем таблицы в правильном порядке (от зависимых к основным)

-- Сторисы
TRUNCATE TABLE story_replies RESTART IDENTITY CASCADE;
TRUNCATE TABLE story_likes RESTART IDENTITY CASCADE;
TRUNCATE TABLE story_views RESTART IDENTITY CASCADE;
TRUNCATE TABLE stories RESTART IDENTITY CASCADE;

-- Письменные каналы
TRUNCATE TABLE written_channel_post_comments RESTART IDENTITY CASCADE;
TRUNCATE TABLE written_channel_posts RESTART IDENTITY CASCADE;
TRUNCATE TABLE written_channel_subscriptions RESTART IDENTITY CASCADE;
TRUNCATE TABLE written_channels RESTART IDENTITY CASCADE;

-- Каналы мастеров
TRUNCATE TABLE channel_subscriptions RESTART IDENTITY CASCADE;
TRUNCATE TABLE master_channels RESTART IDENTITY CASCADE;

-- Групповые чаты
TRUNCATE TABLE group_chat_members RESTART IDENTITY CASCADE;
TRUNCATE TABLE group_chat_messages RESTART IDENTITY CASCADE;
TRUNCATE TABLE group_chats RESTART IDENTITY CASCADE;

-- Чаты 1-на-1
TRUNCATE TABLE chat_messages RESTART IDENTITY CASCADE;
TRUNCATE TABLE chats RESTART IDENTITY CASCADE;

-- Поддержка
TRUNCATE TABLE support_ticket_replies RESTART IDENTITY CASCADE;
TRUNCATE TABLE support_tickets RESTART IDENTITY CASCADE;

-- Заказы и предложения
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;
TRUNCATE TABLE proposals RESTART IDENTITY CASCADE;
TRUNCATE TABLE requests RESTART IDENTITY CASCADE;

-- Видео
TRUNCATE TABLE video_comments RESTART IDENTITY CASCADE;
TRUNCATE TABLE video_likes RESTART IDENTITY CASCADE;
TRUNCATE TABLE videos RESTART IDENTITY CASCADE;

-- Пользователи (самое последнее!)
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- Включаем триггеры обратно
SET session_replication_role = 'origin';

-- Проверка результата
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'videos', COUNT(*) FROM videos
UNION ALL
SELECT 'requests', COUNT(*) FROM requests
UNION ALL
SELECT 'chats', COUNT(*) FROM chats
UNION ALL
SELECT 'stories', COUNT(*) FROM stories
UNION ALL
SELECT 'written_channels', COUNT(*) FROM written_channels
UNION ALL
SELECT 'group_chats', COUNT(*) FROM group_chats;

-- Вывод
SELECT '✅ ВСЕ ДАННЫЕ ОЧИЩЕНЫ!' as result;

