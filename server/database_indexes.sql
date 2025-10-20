-- ============================================
-- MebelPlace Database Indexes
-- Оптимизация производительности запросов
-- ============================================

-- ============================================
-- USERS INDEXES
-- ============================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_active ON users(role, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_location ON users(location_city, location_region);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_rating ON users(rating DESC) WHERE rating > 0;

-- ============================================
-- VIDEOS INDEXES
-- ============================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_author_active ON videos(author_id, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_category_active ON videos(category, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_created_views ON videos(created_at DESC, views DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_engagement ON videos((likes + comments + shares)) WHERE is_active = TRUE;

-- Composite index for feed queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_feed ON videos(is_active, admin_priority DESC, created_at DESC) 
  WHERE is_public = TRUE AND processing_status = 'completed';

-- ============================================
-- ORDERS INDEXES
-- ============================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_active ON orders(status, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_location_status ON orders(city, region, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_price_range ON orders(price) WHERE price IS NOT NULL;

-- Composite index for master's order feed
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_master_feed ON orders(status, created_at DESC) 
  WHERE is_active = TRUE AND status = 'pending';

-- ============================================
-- MESSAGES INDEXES
-- ============================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_unread ON messages(chat_id, is_read) WHERE is_read = FALSE;

-- ============================================
-- NOTIFICATIONS INDEXES
-- ============================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- ============================================
-- PERFORMANCE ANALYTICS INDEXES
-- ============================================

-- For trending videos calculation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_views_recent ON video_views(video_id, created_at DESC) 
  WHERE created_at > NOW() - INTERVAL '7 days';

-- For user engagement metrics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_likes_recent ON video_likes(user_id, created_at DESC) 
  WHERE created_at > NOW() - INTERVAL '30 days';

-- ============================================
-- FULL TEXT SEARCH OPTIMIZATION
-- ============================================

-- Create GiST indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_search_gist ON videos USING GIST (to_tsvector('russian', title || ' ' || COALESCE(description, '')));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_search_gist ON users USING GIST (to_tsvector('russian', username || ' ' || COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')));

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT 'Database indexes created successfully!' as status;
