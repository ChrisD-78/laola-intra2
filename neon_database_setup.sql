-- =====================================================
-- NEON POSTGRESQL DATABASE SETUP
-- LA OLA Intranet - Complete Schema
-- =====================================================
-- Run this SQL in your Neon SQL Editor after creating the database
-- This creates all tables needed for the application
-- =====================================================

-- ==============================================
-- TABLES
-- ==============================================

-- Form Submissions Table
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'Eingegangen',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  form_data JSONB NOT NULL,
  submitted_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trainings Table
CREATE TABLE IF NOT EXISTS trainings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  file_name VARCHAR(255),
  file_size_mb DECIMAL(10,2),
  file_type VARCHAR(100),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Completed Trainings Table
CREATE TABLE IF NOT EXISTS completed_trainings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
  completed_by VARCHAR(255) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Dashboard Infos Table
CREATE TABLE IF NOT EXISTS dashboard_infos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  timestamp VARCHAR(100) NOT NULL,
  pdf_name VARCHAR(255),
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'Offen',
  priority VARCHAR(50) DEFAULT 'Normal',
  assigned_to VARCHAR(255) NOT NULL,
  due_date VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring Tasks Table (WITH ALL REQUIRED COLUMNS!)
CREATE TABLE IF NOT EXISTS recurring_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(50) NOT NULL,
  priority VARCHAR(50) DEFAULT 'Normal',
  start_time VARCHAR(100) NOT NULL,
  assigned_to VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  next_due VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size_mb DECIMAL(10,2) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  tags TEXT[],
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by VARCHAR(255) NOT NULL,
  file_url TEXT
);

-- External Proofs Table
CREATE TABLE IF NOT EXISTS external_proofs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bezeichnung VARCHAR(255) NOT NULL,
  vorname VARCHAR(255) NOT NULL,
  nachname VARCHAR(255) NOT NULL,
  datum VARCHAR(100) NOT NULL,
  pdf_name VARCHAR(255),
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Users Table
CREATE TABLE IF NOT EXISTS chat_users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  is_online BOOLEAN DEFAULT false,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Groups Table
CREATE TABLE IF NOT EXISTS chat_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Group Members Table
CREATE TABLE IF NOT EXISTS chat_group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES chat_groups(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id VARCHAR(255) NOT NULL,
  recipient_id VARCHAR(255),
  group_id UUID REFERENCES chat_groups(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  image_name VARCHAR(255),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_recipient
  ON chat_messages (sender_id, recipient_id, created_at);
  
CREATE INDEX IF NOT EXISTS idx_chat_messages_group
  ON chat_messages (group_id, created_at);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to
  ON tasks (assigned_to);

CREATE INDEX IF NOT EXISTS idx_recurring_tasks_active
  ON recurring_tasks (is_active, next_due);

-- ==============================================
-- TRIGGERS FOR AUTO-UPDATING updated_at
-- ==============================================

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to recurring_tasks
DROP TRIGGER IF EXISTS update_recurring_tasks_updated_at ON recurring_tasks;
CREATE TRIGGER update_recurring_tasks_updated_at
  BEFORE UPDATE ON recurring_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to tasks
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to trainings
DROP TRIGGER IF EXISTS update_trainings_updated_at ON trainings;
CREATE TRIGGER update_trainings_updated_at
  BEFORE UPDATE ON trainings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- VERIFICATION
-- ==============================================

-- Verify recurring_tasks structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'recurring_tasks'
ORDER BY ordinal_position;

-- Count tables created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Neon Database Setup Complete!';
  RAISE NOTICE 'All tables created successfully';
  RAISE NOTICE 'Next: Copy your Neon connection string';
  RAISE NOTICE '==============================================';
END $$;
