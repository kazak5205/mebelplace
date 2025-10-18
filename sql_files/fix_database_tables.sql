-- Создание недостающих таблиц для исправления 500 ошибок

-- Групповые чаты
CREATE TABLE IF NOT EXISTS group_chats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Участники групповых чатов
CREATE TABLE IF NOT EXISTS group_chat_members (
    id SERIAL PRIMARY KEY,
    group_chat_id INTEGER NOT NULL REFERENCES group_chats(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_chat_id, user_id)
);

-- Сообщения групповых чатов
CREATE TABLE IF NOT EXISTS group_chat_messages (
    id SERIAL PRIMARY KEY,
    group_chat_id INTEGER NOT NULL REFERENCES group_chats(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Письменные каналы
CREATE TABLE IF NOT EXISTS written_channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Подписчики письменных каналов
CREATE TABLE IF NOT EXISTS written_channel_subscribers (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER NOT NULL REFERENCES written_channels(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(channel_id, user_id)
);

-- Посты письменных каналов
CREATE TABLE IF NOT EXISTS written_channel_posts (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER NOT NULL REFERENCES written_channels(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Истории
CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url VARCHAR(500),
    media_type VARCHAR(50) DEFAULT 'text',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Просмотры историй
CREATE TABLE IF NOT EXISTS story_views (
    id SERIAL PRIMARY KEY,
    story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(story_id, user_id)
);

-- Лайки историй
CREATE TABLE IF NOT EXISTS story_likes (
    id SERIAL PRIMARY KEY,
    story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(story_id, user_id)
);

-- Голосовые комнаты
CREATE TABLE IF NOT EXISTS voice_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    max_participants INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

-- Участники голосовых комнат
CREATE TABLE IF NOT EXISTS voice_room_participants (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    UNIQUE(room_id, user_id)
);

-- Записи голосовых комнат
CREATE TABLE IF NOT EXISTS voice_room_recordings (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
    started_by INTEGER NOT NULL REFERENCES users(id),
    recording_url VARCHAR(500),
    duration INTEGER, -- в секундах
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

-- AR/3D модели
CREATE TABLE IF NOT EXISTS ar_3d_models (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    model_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    model_type VARCHAR(50) NOT NULL,
    scale FLOAT DEFAULT 1.0,
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,
    position_z FLOAT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Версии AR/3D моделей
CREATE TABLE IF NOT EXISTS ar_3d_model_versions (
    id SERIAL PRIMARY KEY,
    model_id INTEGER NOT NULL REFERENCES ar_3d_models(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    model_url VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(model_id, version)
);

-- Геймификация - уровни
CREATE TABLE IF NOT EXISTS gamification_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    min_points INTEGER NOT NULL,
    max_points INTEGER,
    color VARCHAR(7) DEFAULT '#000000',
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Геймификация - достижения
CREATE TABLE IF NOT EXISTS gamification_achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    points INTEGER DEFAULT 0,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Геймификация - достижения пользователей
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL REFERENCES gamification_achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- Геймификация - правила
CREATE TABLE IF NOT EXISTS gamification_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    action VARCHAR(100) NOT NULL,
    points INTEGER DEFAULT 0,
    conditions JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Рефералы
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER NOT NULL REFERENCES users(id),
    referred_id INTEGER REFERENCES users(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Live стримы
CREATE TABLE IF NOT EXISTS live_streams (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    stream_key VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    viewer_count INTEGER DEFAULT 0,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Донаты на стримы
CREATE TABLE IF NOT EXISTS stream_donations (
    id SERIAL PRIMARY KEY,
    stream_id INTEGER NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
    donor_id INTEGER NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL, -- в тиынах
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Интеграции - платежные провайдеры
CREATE TABLE IF NOT EXISTS payment_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Интеграции - транзакции
CREATE TABLE IF NOT EXISTS payment_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    provider_id INTEGER NOT NULL REFERENCES payment_providers(id),
    amount INTEGER NOT NULL, -- в тиынах
    currency VARCHAR(3) DEFAULT 'KZT',
    status VARCHAR(50) DEFAULT 'pending',
    external_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Интеграции - мессенджеры
CREATE TABLE IF NOT EXISTS messenger_integrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- whatsapp, telegram, etc
    config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRM контакты
CREATE TABLE IF NOT EXISTS crm_contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    external_id VARCHAR(255),
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    metadata JSONB,
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_group_chat_members_user_id ON group_chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_group_id ON group_chat_messages(group_chat_id);
CREATE INDEX IF NOT EXISTS idx_written_channel_subscribers_user_id ON written_channel_subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_written_channel_posts_channel_id ON written_channel_posts(channel_id);
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_story_id ON story_likes(story_id);
CREATE INDEX IF NOT EXISTS idx_voice_room_participants_room_id ON voice_room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_ar_3d_models_product_id ON ar_3d_models(product_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_live_streams_user_id ON live_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_donations_stream_id ON stream_donations(stream_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_user_id ON crm_contacts(user_id);
