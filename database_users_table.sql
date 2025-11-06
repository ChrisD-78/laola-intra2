-- =====================================================
-- USERS TABLE SETUP
-- LA OLA Intranet - User Management & Authentication
-- =====================================================
-- Run this SQL in your Neon SQL Editor to add user management
-- =====================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users (is_active);

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert existing users with admin rights for Christof Drost and Kirstin
INSERT INTO users (username, password, display_name, is_admin, is_active) VALUES
  ('Christof Drost', '12345', 'Christof Drost', true, true),
  ('Kirstin', 'kirstin123', 'Kirstin Kreusch', true, true),
  ('Julia', 'julia112', 'Julia Wodonis', false, true),
  ('Lisa', 'lisa331', 'Lisa Schnagl', false, true),
  ('Jonas', 'Jonas554', 'Jonas Jooss', false, true),
  ('Dennis', 'Dennis812', 'Dennis Wilkens', false, true),
  ('Lea', 'lea331', 'Lea Hofmann', false, true),
  ('laola', 'laola123', 'Team LAOLA', false, true),
  ('staho', 'staho123', 'Verwaltung Stadtholding Landau', false, true)
ON CONFLICT (username) DO NOTHING;

-- Verify users table
SELECT 
  username,
  display_name,
  is_admin,
  is_active,
  created_at
FROM users
ORDER BY is_admin DESC, display_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Users Table Setup Complete!';
  RAISE NOTICE 'Admin users: Christof Drost, Kirstin Kreusch';
  RAISE NOTICE '==============================================';
END $$;

