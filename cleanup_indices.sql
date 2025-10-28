-- ============================================
-- CLEANUP: Удаление неиспользуемых и дублирующихся индексов
-- Date: 2025-10-28
-- WARNING: Применять только после анализа!
-- ============================================

-- 1. Удаление PostGIS tiger индексов (если геокодинг не используется)
DROP INDEX IF EXISTS tiger.county_lookup_name_idx;
DROP INDEX IF EXISTS tiger.county_lookup_state_idx;
DROP INDEX IF EXISTS tiger.countysub_lookup_name_idx;
DROP INDEX IF EXISTS tiger.countysub_lookup_state_idx;
DROP INDEX IF EXISTS tiger.direction_lookup_abbrev_idx;
DROP INDEX IF EXISTS tiger.idx_addrfeat_geom_gist;
DROP INDEX IF EXISTS tiger.idx_addrfeat_tlid;
DROP INDEX IF EXISTS tiger.idx_addrfeat_zipl;
DROP INDEX IF EXISTS tiger.idx_addrfeat_zipr;

-- 2. Удаление дублирующихся индексов (оставляем более короткие названия)
-- chat_participants: удаляем длинные, оставляем короткие
DROP INDEX IF EXISTS idx_chat_participants_chat_id;
DROP INDEX IF EXISTS idx_chat_participants_user_id;

-- messages: удаляем длинные варианты
DROP INDEX IF EXISTS idx_messages_chat_id;
DROP INDEX IF EXISTS idx_messages_sender_id;
DROP INDEX IF EXISTS idx_messages_created_at;

-- notifications: удаляем длинные варианты
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_is_read;

-- orders: удаляем длинные варианты
DROP INDEX IF EXISTS idx_orders_client_id;
DROP INDEX IF EXISTS idx_orders_created_at;

-- videos: удаляем длинные варианты
DROP INDEX IF EXISTS idx_videos_author_id;
DROP INDEX IF EXISTS idx_videos_created_at;

-- 3. Удаление неиспользуемых admin индексов
DROP INDEX IF EXISTS idx_admin_audit_log_action;
DROP INDEX IF EXISTS idx_admin_audit_log_created_at;
DROP INDEX IF EXISTS idx_admin_audit_log_resource_type;

-- 4. Удаление уникальных индексов на SMS verification (проблема повторной отправки)
DROP INDEX IF EXISTS idx_sms_verifications_phone_unique;

SELECT 'Индексы успешно удалены!' as message;

