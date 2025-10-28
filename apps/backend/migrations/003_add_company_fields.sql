-- ============================================
-- Migration: Add company fields for masters
-- Date: 2025-10-28
-- Description: Добавляет поля для мебельных компаний (мастеров)
-- ============================================

-- Добавляем поля для компании
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS company_description TEXT;

-- Создаем индекс для поиска по названию компании
CREATE INDEX IF NOT EXISTS idx_users_company_name ON users(company_name) WHERE role = 'master';

-- Комментарии
COMMENT ON COLUMN users.company_name IS 'Company name for masters (furniture companies)';
COMMENT ON COLUMN users.company_address IS 'Company physical address for masters';
COMMENT ON COLUMN users.company_description IS 'Company description/about for masters';

-- Обновляем существующих мастеров: переносим firstName + lastName в company_name
UPDATE users 
SET company_name = COALESCE(
  NULLIF(TRIM(CONCAT(first_name, ' ', last_name)), ''),
  username
)
WHERE role = 'master' AND company_name IS NULL;

-- Success message
SELECT 'Migration 003: Company fields added successfully!' as message;

