-- =====================================
-- DROP UNUSED INDEXES
-- =====================================
-- Total: 35 неиспользуемых индексов
-- Date: 2025-10-28
-- Reason: idx_scan = 0 (never used)
-- =====================================

BEGIN;

-- Admin audit log (3)
DROP INDEX IF EXISTS idx_admin_audit_log_action;
DROP INDEX IF EXISTS idx_admin_audit_log_created_at;
DROP INDEX IF EXISTS idx_admin_audit_log_resource_type;

-- Admin settings (1)
DROP INDEX IF EXISTS idx_admin_settings_key;

-- Admin video priorities (1)
DROP INDEX IF EXISTS idx_admin_video_priorities_is_featured;

-- Chat participants (3 - включая дубликаты)
DROP INDEX IF EXISTS idx_chat_participants_chat;
DROP INDEX IF EXISTS idx_chat_participants_chat_id;
DROP INDEX IF EXISTS idx_chat_participants_user;

-- Content categories (2)
DROP INDEX IF EXISTS idx_content_categories_is_active;
DROP INDEX IF EXISTS idx_content_categories_slug;

-- Messages (6 - включая дубликаты)
DROP INDEX IF EXISTS idx_messages_chat;
DROP INDEX IF EXISTS idx_messages_chat_id;
DROP INDEX IF EXISTS idx_messages_created;
DROP INDEX IF EXISTS idx_messages_created_at;
DROP INDEX IF EXISTS idx_messages_sender;
DROP INDEX IF EXISTS idx_messages_sender_id;

-- Notifications (6 - включая дубликаты)
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_is_read;
DROP INDEX IF EXISTS idx_notifications_read;
DROP INDEX IF EXISTS idx_notifications_type;
DROP INDEX IF EXISTS idx_notifications_user;
DROP INDEX IF EXISTS idx_notifications_user_id;

-- Orders (1)
DROP INDEX IF EXISTS idx_orders_active;

-- Push subscriptions (1)
DROP INDEX IF EXISTS idx_push_subscriptions_endpoint;

-- Reviews (1)
DROP INDEX IF EXISTS idx_reviews_created_at;

-- SMS verifications (2)
DROP INDEX IF EXISTS idx_sms_verifications_expires_at;
DROP INDEX IF EXISTS idx_sms_verifications_phone;

-- Support tickets (2)
DROP INDEX IF EXISTS idx_support_tickets_created_at;
DROP INDEX IF EXISTS idx_support_tickets_priority;

-- User analytics (2)
DROP INDEX IF EXISTS idx_user_analytics_created_at;
DROP INDEX IF EXISTS idx_user_analytics_event_type;

-- Video analytics (1)
DROP INDEX IF EXISTS idx_video_analytics_event_type;

-- Video calls (2)
DROP INDEX IF EXISTS idx_video_call_participants_room_id;
DROP INDEX IF EXISTS idx_video_calls_room_id;

-- Videos (1)
DROP INDEX IF EXISTS idx_videos_category;

COMMIT;

-- =====================================
-- VERIFY: Check remaining unused indexes
-- =====================================
-- Run after:
-- SELECT COUNT(*) FROM pg_stat_user_indexes 
-- WHERE idx_scan = 0 AND schemaname = 'public' AND indexrelname LIKE 'idx_%';

