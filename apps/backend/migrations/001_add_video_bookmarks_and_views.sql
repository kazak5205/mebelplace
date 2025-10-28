-- Migration: Add video_bookmarks and video_views tables
-- Date: 2025-10-23

-- Create video_bookmarks table
CREATE TABLE IF NOT EXISTS video_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Create indexes for video_bookmarks
CREATE INDEX IF NOT EXISTS idx_video_bookmarks_user_id ON video_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_video_bookmarks_video_id ON video_bookmarks(video_id);
CREATE INDEX IF NOT EXISTS idx_video_bookmarks_created_at ON video_bookmarks(created_at DESC);

-- Create video_views table
CREATE TABLE IF NOT EXISTS video_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for video_views
CREATE INDEX IF NOT EXISTS idx_video_views_video_id ON video_views(video_id);
CREATE INDEX IF NOT EXISTS idx_video_views_user_id ON video_views(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_video_views_ip_address ON video_views(ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_video_views_created_at ON video_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_views_video_created ON video_views(video_id, created_at DESC);

-- Comments
COMMENT ON TABLE video_bookmarks IS 'User bookmarked/favorite videos';
COMMENT ON TABLE video_views IS 'Video view tracking with user and IP information';

