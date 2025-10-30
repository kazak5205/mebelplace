-- ============================================
-- Migration: Fix online status tracking
-- Date: 2025-10-30
-- Description: Разделяет is_active (статус аккаунта) и is_online (онлайн в чате)
-- ============================================

-- Добавляем отдельное поле для онлайн-статуса
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- Добавляем поле last_seen если его нет
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Создаем индекс для быстрого поиска онлайн пользователей
CREATE INDEX IF NOT EXISTS idx_users_is_online 
ON users(is_online) 
WHERE is_online = true;

-- Создаем индекс для last_seen
CREATE INDEX IF NOT EXISTS idx_users_last_seen 
ON users(last_seen DESC);

-- Комментарии для документации
COMMENT ON COLUMN users.is_active IS 'Статус аккаунта: true = активен, false = деактивирован (soft delete)';
COMMENT ON COLUMN users.is_online IS 'Онлайн статус в чате: true = пользователь онлайн, false = оффлайн';
COMMENT ON COLUMN users.last_seen IS 'Время последней активности пользователя';

-- Устанавливаем всех пользователей как оффлайн (при старте сервера)
UPDATE users SET is_online = false WHERE is_online = true;

-- Success message
SELECT 'Migration 005: Online status tracking fixed successfully!' as message;

