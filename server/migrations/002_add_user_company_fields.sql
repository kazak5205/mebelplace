-- ============================================
-- Migration: Add company fields to users
-- Created: 2025-10-28
-- Purpose: Support master profiles with company information
-- ============================================

-- Add company fields for master users
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_address VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_description TEXT;

-- Performance index: Fast search by company name for masters
CREATE INDEX IF NOT EXISTS idx_users_company_name 
ON users(company_name) 
WHERE role = 'master' AND is_active = true;

-- Performance index: Fast search by role
CREATE INDEX IF NOT EXISTS idx_users_role 
ON users(role) 
WHERE is_active = true;

-- Comment for documentation
COMMENT ON COLUMN users.company_name IS 'Company name for master users';
COMMENT ON COLUMN users.bio IS 'Biography/description for all users';

