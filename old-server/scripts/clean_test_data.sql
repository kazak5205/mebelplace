-- MebelPlace: Очистка всех тестовых данных
-- Этот скрипт удалит ВСЕ данные из базы, сохранив только структуру таблиц

BEGIN;

-- Disable triggers temporarily for faster deletion
SET session_replication_role = replica;

-- Delete data from all tables (in correct order due to foreign keys)
TRUNCATE TABLE admin_audit_log CASCADE;
TRUNCATE TABLE admin_video_priorities CASCADE;
TRUNCATE TABLE video_analytics CASCADE;
TRUNCATE TABLE user_analytics CASCADE;
TRUNCATE TABLE content_categories CASCADE;
TRUNCATE TABLE admin_settings CASCADE;

TRUNCATE TABLE video_call_participants CASCADE;
TRUNCATE TABLE video_calls CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE chat_participants CASCADE;
TRUNCATE TABLE chats CASCADE;

TRUNCATE TABLE push_subscriptions CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE refresh_tokens CASCADE;

TRUNCATE TABLE comment_likes CASCADE;
TRUNCATE TABLE video_comments CASCADE;
TRUNCATE TABLE video_likes CASCADE;
TRUNCATE TABLE videos CASCADE;

TRUNCATE TABLE order_responses CASCADE;
TRUNCATE TABLE orders CASCADE;

TRUNCATE TABLE subscriptions CASCADE;
TRUNCATE TABLE users CASCADE;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

COMMIT;

-- Verify cleanup
SELECT 'users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'videos', COUNT(*) FROM videos
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'chats', COUNT(*) FROM chats
UNION ALL
SELECT 'messages', COUNT(*) FROM messages;

SELECT '✅ All test data has been deleted successfully!' AS status;

