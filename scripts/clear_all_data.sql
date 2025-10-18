-- СКРИПТ ПОЛНОЙ ОЧИСТКИ ТЕСТОВЫХ ДАННЫХ
-- Запускать ТОЛЬКО для сброса БД к чистому состоянию!

-- Disable triggers temporarily
SET session_replication_role = 'replica';

-- Clear all data (CASCADE will handle foreign keys)
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE chat_participants CASCADE;
TRUNCATE TABLE chats CASCADE;
TRUNCATE TABLE master_orders CASCADE;
TRUNCATE TABLE request_proposals CASCADE;
TRUNCATE TABLE requests CASCADE;
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE video_likes CASCADE;
TRUNCATE TABLE video_views CASCADE;
TRUNCATE TABLE videos CASCADE;
TRUNCATE TABLE user_subscriptions CASCADE;
TRUNCATE TABLE users CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Verify all tables are empty
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'videos', COUNT(*) FROM videos
UNION ALL
SELECT 'requests', COUNT(*) FROM requests
UNION ALL
SELECT 'request_proposals', COUNT(*) FROM request_proposals
UNION ALL
SELECT 'master_orders', COUNT(*) FROM master_orders
UNION ALL
SELECT 'chats', COUNT(*) FROM chats
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'video_likes', COUNT(*) FROM video_likes
UNION ALL
SELECT 'video_views', COUNT(*) FROM video_views;

-- Reset sequences
SELECT setval(pg_get_serial_sequence('users', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('videos', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('requests', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('request_proposals', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('master_orders', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('chats', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('messages', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('comments', 'id'), 1, false);

SELECT '✅ ВСЕ ДАННЫЕ ОЧИЩЕНЫ!' as status;


