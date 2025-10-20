-- Рекомендуемые индексы для оптимизации VideoService
-- Выполните эти команды в вашей PostgreSQL базе данных

-- Индексы для таблицы videos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_active_public ON videos(is_active, is_public) WHERE is_active = true AND is_public = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC) WHERE is_active = true AND is_public = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_author_id ON videos(author_id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_category ON videos(category) WHERE is_active = true AND is_public = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_views ON videos(views DESC) WHERE is_active = true AND is_public = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_likes ON videos(likes DESC) WHERE is_active = true AND is_public = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_trending ON videos((likes + views * 0.1) DESC, created_at DESC) WHERE is_active = true AND is_public = true AND created_at > NOW() - INTERVAL '7 days';

-- Полнотекстовый поиск для videos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_search ON videos USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_tags ON videos USING gin(tags);

-- Индексы для таблицы video_likes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_likes_video_user ON video_likes(video_id, user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_likes_video_id ON video_likes(video_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_likes_user_id ON video_likes(user_id);

-- Индексы для таблицы video_comments
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_comments_video_active ON video_comments(video_id, is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_comments_parent_id ON video_comments(parent_id) WHERE parent_id IS NOT NULL AND is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_comments_created_at ON video_comments(created_at DESC) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_comments_user_id ON video_comments(user_id) WHERE is_active = true;

-- Индексы для таблицы video_views (если используется)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_views_video_created ON video_views(video_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_views_user_created ON video_views(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_views_ip_created ON video_views(ip_address, created_at DESC) WHERE ip_address IS NOT NULL;

-- Индексы для таблицы users (если используется в JOIN'ах)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username);

-- Статистика для оптимизатора запросов
ANALYZE videos;
ANALYZE video_likes;
ANALYZE video_comments;
ANALYZE video_views;
ANALYZE users;

-- Комментарии к индексам:
-- 1. CONCURRENTLY - создает индексы без блокировки таблицы
-- 2. WHERE условия - создают частичные индексы только для нужных данных
-- 3. gin индексы - для полнотекстового поиска и массивов
-- 4. Композитные индексы - для сложных запросов с несколькими условиями
