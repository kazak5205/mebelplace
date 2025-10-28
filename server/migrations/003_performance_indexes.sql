-- ============================================
-- Migration: Add performance indexes
-- Created: 2025-10-28
-- Purpose: Optimize queries for 1000 concurrent users
-- ============================================

-- ========== USERS INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_users_company_name 
ON users(company_name) 
WHERE role = 'master' AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_users_role 
ON users(role) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_users_phone 
ON users(phone) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_users_username_lower 
ON users(LOWER(username));

-- ========== VIDEOS INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_videos_author_created 
ON videos(author_id, created_at DESC) 
WHERE is_active = true AND is_public = true;

CREATE INDEX IF NOT EXISTS idx_videos_category_created 
ON videos(category, created_at DESC) 
WHERE is_active = true AND is_public = true;

CREATE INDEX IF NOT EXISTS idx_videos_created_at 
ON videos(created_at DESC) 
WHERE is_active = true AND is_public = true;

CREATE INDEX IF NOT EXISTS idx_videos_views 
ON videos(views DESC) 
WHERE is_active = true AND is_public = true;

-- ========== ORDERS INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_orders_client_status 
ON orders(client_id, status, created_at DESC) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_orders_city_category 
ON orders(city, category, created_at DESC) 
WHERE is_active = true AND status IN ('pending', 'open');

CREATE INDEX IF NOT EXISTS idx_orders_status_created 
ON orders(status, created_at DESC) 
WHERE is_active = true;

-- ========== ORDER_RESPONSES INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_order_responses_master 
ON order_responses(master_id, created_at DESC) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_order_responses_order_status 
ON order_responses(order_id, status, created_at DESC);

-- UNIQUE constraint for accepted responses (only one per order)
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_responses_accepted_unique 
ON order_responses(order_id) 
WHERE status = 'accepted';

-- ========== SUBSCRIPTIONS INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber 
ON subscriptions(subscriber_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscriptions_channel 
ON subscriptions(channel_id, created_at DESC);

-- ========== CHATS INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_chats_order 
ON chats(order_id) 
WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_participants_user 
ON chat_participants(user_id, joined_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_chat_created 
ON messages(chat_id, created_at DESC);

-- ========== VIDEO ENGAGEMENT INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_video_likes_video 
ON video_likes(video_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_video_likes_user 
ON video_likes(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_video_comments_video 
ON video_comments(video_id, created_at DESC) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_video_bookmarks_user 
ON video_bookmarks(user_id, created_at DESC);

-- ========== NOTIFICATIONS INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, created_at DESC) 
WHERE is_read = false;

-- Comments for documentation
COMMENT ON INDEX idx_videos_author_created IS 'Fast lookup of videos by author with date sorting';
COMMENT ON INDEX idx_orders_city_category IS 'Fast search of open orders by location and category';
COMMENT ON INDEX idx_order_responses_accepted_unique IS 'Ensures only one accepted response per order';

