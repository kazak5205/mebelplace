const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'mebelplace',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mebelplace',
  password: process.env.DB_PASSWORD || 'mebelplace123',
  port: process.env.DB_PORT || 5432,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Initialize database tables
const initDatabase = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'client', 'master', 'admin')),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        avatar VARCHAR(500),
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create videos table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500),
        duration INTEGER DEFAULT 0,
        file_size BIGINT DEFAULT 0,
        author_id UUID REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(100),
        tags TEXT[],
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        is_public BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create video_likes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS video_likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        is_bookmark BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(video_id, user_id)
      )
    `);

    // Add is_bookmark column if it doesn't exist (for existing databases)
    await pool.query(`
      ALTER TABLE video_likes ADD COLUMN IF NOT EXISTS is_bookmark BOOLEAN DEFAULT false
    `);

    // Create video_comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS video_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        parent_id UUID REFERENCES video_comments(id) ON DELETE CASCADE,
        likes INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create comment_likes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        comment_id UUID REFERENCES video_comments(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(comment_id, user_id)
      )
    `);

    // Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        images TEXT[],
        client_id UUID REFERENCES users(id) ON DELETE CASCADE,
        master_id UUID REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
        price DECIMAL(10,2),
        deadline TIMESTAMP,
        location VARCHAR(255),
        region VARCHAR(100),
        category VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order_responses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_responses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        master_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        price DECIMAL(10,2),
        deadline TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order_response_replies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_response_replies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_response_id UUID REFERENCES order_responses(id) ON DELETE CASCADE,
        client_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create subscriptions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subscriber_id UUID REFERENCES users(id) ON DELETE CASCADE,
        channel_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(subscriber_id, channel_id)
      )
    `);

    // Create chats table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(20) NOT NULL CHECK (type IN ('private', 'group', 'channel')),
        name VARCHAR(255),
        description TEXT,
        creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        avatar VARCHAR(500),
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create chat_participants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(chat_id, user_id)
      )
    `);

    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'audio', 'file', 'sticker', 'voice')),
        reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
        file_path VARCHAR(500),
        file_name VARCHAR(255),
        file_size BIGINT,
        metadata JSONB DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create video_calls table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS video_calls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id VARCHAR(255) UNIQUE NOT NULL,
        chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        initiator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'initiated' CHECK (status IN ('initiated', 'active', 'ended', 'cancelled')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ended_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create video_call_participants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS video_call_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id VARCHAR(255) NOT NULL REFERENCES video_calls(room_id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'joined' CHECK (status IN ('joined', 'left')),
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        left_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(room_id, user_id)
      )
    `);

    // Create refresh_tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB DEFAULT '{}',
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create push_subscriptions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        endpoint TEXT NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, endpoint)
      )
    `);

    // Create admin_video_priorities table for managing video order in feed
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_video_priorities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
        priority_order INTEGER NOT NULL,
        is_featured BOOLEAN DEFAULT false,
        admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(video_id)
      )
    `);

    // Create video_analytics table for tracking video performance
    await pool.query(`
      CREATE TABLE IF NOT EXISTS video_analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view', 'like', 'share', 'comment', 'complete', 'skip')),
        duration_watched INTEGER DEFAULT 0,
        completion_rate DECIMAL(5,2) DEFAULT 0,
        device_type VARCHAR(50),
        user_agent TEXT,
        ip_address INET,
        location_data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_analytics table for tracking user behavior
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('login', 'logout', 'register', 'video_upload', 'order_create', 'order_complete')),
        metadata JSONB DEFAULT '{}',
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create admin_settings table for admin configuration
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(100) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        description TEXT,
        updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create content_categories table for video categorization
    await pool.query(`
      CREATE TABLE IF NOT EXISTS content_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        color VARCHAR(7) DEFAULT '#3B82F6',
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create admin_audit_log table for tracking admin actions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id UUID,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sms_verifications table for SMS verification codes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sms_verifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone VARCHAR(20) UNIQUE NOT NULL,
        code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        attempts INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON chat_participants(chat_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_video_calls_chat_id ON video_calls(chat_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_video_calls_initiator_id ON video_calls(initiator_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_video_call_participants_room_id ON video_call_participants(room_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_video_call_participants_user_id ON video_call_participants(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint)');
    
    // Admin and analytics indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_admin_video_priorities_video_id ON admin_video_priorities(video_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_admin_video_priorities_priority_order ON admin_video_priorities(priority_order)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_admin_video_priorities_is_featured ON admin_video_priorities(is_featured)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_video_analytics_video_id ON video_analytics(video_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_video_analytics_user_id ON video_analytics(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_video_analytics_event_type ON video_analytics(event_type)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_video_analytics_created_at ON video_analytics(created_at)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON user_analytics(event_type)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_content_categories_slug ON content_categories(slug)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_content_categories_is_active ON content_categories(is_active)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_admin_audit_log_resource_type ON admin_audit_log(resource_type)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at)');
    
    // SMS verification indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sms_verifications_phone ON sms_verifications(phone)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sms_verifications_expires_at ON sms_verifications(expires_at)');

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    throw error;
  }
};

module.exports = { pool, initDatabase };
