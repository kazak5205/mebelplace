-- Create channel_subscriptions table for managing user subscriptions to channels
-- Supports 3 notification levels: all, important, off

CREATE TABLE IF NOT EXISTS channel_subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    channel_id VARCHAR(36) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('all', 'important', 'off')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure a user can only have one subscription per channel
    UNIQUE (user_id, channel_id),
    
    -- Foreign key constraints (assuming users table exists)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    -- Note: channel_id references user_id (masters are channels)
);

-- Indexes for performance
CREATE INDEX idx_channel_subscriptions_user_id ON channel_subscriptions(user_id);
CREATE INDEX idx_channel_subscriptions_channel_id ON channel_subscriptions(channel_id);
CREATE INDEX idx_channel_subscriptions_level ON channel_subscriptions(level);

-- Composite index for notification queries
CREATE INDEX idx_channel_subscriptions_channel_level ON channel_subscriptions(channel_id, level);

-- Comments
COMMENT ON TABLE channel_subscriptions IS 'User subscriptions to channels with notification levels';
COMMENT ON COLUMN channel_subscriptions.level IS 'Notification level: all (all notifications), important (only streams and stories), off (no notifications)';

