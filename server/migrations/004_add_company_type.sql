-- ============================================
-- Migration: Add company_type field for masters
-- Date: 2025-10-29
-- Description: Добавляет поле типа компании (мастер/компания/магазин) с цветовой маркировкой
-- ============================================

-- Создаём ENUM для типов компаний
DO $$ BEGIN
  CREATE TYPE company_type_enum AS ENUM ('master', 'company', 'shop');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Добавляем поле company_type
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS company_type company_type_enum DEFAULT 'master';

-- Создаем индекс для поиска по типу компании
CREATE INDEX IF NOT EXISTS idx_users_company_type 
ON users(company_type) 
WHERE role = 'master' AND is_active = true;

-- Комментарии
COMMENT ON COLUMN users.company_type IS 'Тип компании мастера: master (желтый), company (оранжевый), shop (красный)';

-- Устанавливаем дефолтное значение для существующих мастеров
UPDATE users 
SET company_type = 'master'
WHERE role = 'master' AND company_type IS NULL;

-- Success message
SELECT 'Migration 004: company_type field added successfully!' as message;

