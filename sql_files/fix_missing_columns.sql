-- Исправление недостающих колонок для всех таблиц

-- Геймификация
ALTER TABLE gamification_levels ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#000000';
ALTER TABLE gamification_levels ADD COLUMN IF NOT EXISTS icon VARCHAR(100);

-- Голосовые комнаты
ALTER TABLE voice_rooms ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 10;
ALTER TABLE voice_rooms ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE voice_rooms ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP;

-- Live стримы
ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS stream_key VARCHAR(255) UNIQUE;
ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;
ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS viewer_count INTEGER DEFAULT 0;
ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP;

-- Донаты на стримы
ALTER TABLE stream_donations ADD COLUMN IF NOT EXISTS donor_id INTEGER REFERENCES users(id);
ALTER TABLE stream_donations ADD COLUMN IF NOT EXISTS amount INTEGER NOT NULL;
ALTER TABLE stream_donations ADD COLUMN IF NOT EXISTS message TEXT;

-- Интеграции
ALTER TABLE payment_providers ADD COLUMN IF NOT EXISTS type VARCHAR(50) NOT NULL;
ALTER TABLE payment_providers ADD COLUMN IF NOT EXISTS config JSONB;
ALTER TABLE payment_providers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS provider_id INTEGER REFERENCES payment_providers(id);
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS amount INTEGER NOT NULL;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'KZT';
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS external_id VARCHAR(255);
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE messenger_integrations ADD COLUMN IF NOT EXISTS type VARCHAR(50) NOT NULL;
ALTER TABLE messenger_integrations ADD COLUMN IF NOT EXISTS config JSONB;
ALTER TABLE messenger_integrations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS external_id VARCHAR(255);
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Рефералы
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referrer_id INTEGER NOT NULL REFERENCES users(id);
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referred_id INTEGER REFERENCES users(id);
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS code VARCHAR(50) UNIQUE NOT NULL;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS is_used BOOLEAN DEFAULT false;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS used_at TIMESTAMP;

-- AR/3D модели
ALTER TABLE ar_3d_models ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL;
ALTER TABLE ar_3d_models ADD COLUMN IF NOT EXISTS model_url VARCHAR(500) NOT NULL;
ALTER TABLE ar_3d_models ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500);
ALTER TABLE ar_3d_models ADD COLUMN IF NOT EXISTS model_type VARCHAR(50) NOT NULL;
ALTER TABLE ar_3d_models ADD COLUMN IF NOT EXISTS scale FLOAT DEFAULT 1.0;
ALTER TABLE ar_3d_models ADD COLUMN IF NOT EXISTS position_x FLOAT DEFAULT 0;
ALTER TABLE ar_3d_models ADD COLUMN IF NOT EXISTS position_y FLOAT DEFAULT 0;
ALTER TABLE ar_3d_models ADD COLUMN IF NOT EXISTS position_z FLOAT DEFAULT 0;
ALTER TABLE ar_3d_models ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE ar_3d_models ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Версии AR/3D моделей
ALTER TABLE ar_3d_model_versions ADD COLUMN IF NOT EXISTS version VARCHAR(50) NOT NULL;
ALTER TABLE ar_3d_model_versions ADD COLUMN IF NOT EXISTS model_url VARCHAR(500) NOT NULL;
ALTER TABLE ar_3d_model_versions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- Геймификация - достижения
ALTER TABLE gamification_achievements ADD COLUMN IF NOT EXISTS icon VARCHAR(100);
ALTER TABLE gamification_achievements ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE gamification_achievements ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE gamification_achievements ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Геймификация - правила
ALTER TABLE gamification_rules ADD COLUMN IF NOT EXISTS action VARCHAR(100) NOT NULL;
ALTER TABLE gamification_rules ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE gamification_rules ADD COLUMN IF NOT EXISTS conditions JSONB;
ALTER TABLE gamification_rules ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE gamification_rules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Создаем недостающие индексы
CREATE INDEX IF NOT EXISTS idx_voice_room_participants_room_id ON voice_room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_voice_room_recordings_room_id ON voice_room_recordings(room_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_user_id ON live_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_donations_stream_id ON stream_donations(stream_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider_id ON payment_transactions(provider_id);
CREATE INDEX IF NOT EXISTS idx_messenger_integrations_user_id ON messenger_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_user_id ON crm_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_ar_3d_models_product_id ON ar_3d_models(product_id);
CREATE INDEX IF NOT EXISTS idx_ar_3d_models_user_id ON ar_3d_models(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_3d_model_versions_model_id ON ar_3d_model_versions(model_id);
CREATE INDEX IF NOT EXISTS idx_gamification_achievements_category ON gamification_achievements(category);
CREATE INDEX IF NOT EXISTS idx_gamification_rules_action ON gamification_rules(action);
