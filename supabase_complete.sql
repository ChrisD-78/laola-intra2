-- Complete Supabase Schema for LA OLA Intranet
-- This file contains all tables, RLS policies, and storage buckets

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

-- Recurring Tasks Table
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

-- Profiles Table (for user management)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ROW LEVEL SECURITY POLICIES
-- ==============================================

-- RLS Policies for form_submissions
DROP POLICY IF EXISTS "form_submissions select anon" ON public.form_submissions;
CREATE POLICY "form_submissions select anon" ON public.form_submissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "form_submissions insert anon" ON public.form_submissions;
CREATE POLICY "form_submissions insert anon" ON public.form_submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "form_submissions update anon" ON public.form_submissions;
CREATE POLICY "form_submissions update anon" ON public.form_submissions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "form_submissions delete anon" ON public.form_submissions;
CREATE POLICY "form_submissions delete anon" ON public.form_submissions FOR DELETE USING (true);

-- RLS Policies for trainings
DROP POLICY IF EXISTS "trainings select anon" ON public.trainings;
CREATE POLICY "trainings select anon" ON public.trainings FOR SELECT USING (true);

DROP POLICY IF EXISTS "trainings insert anon" ON public.trainings;
CREATE POLICY "trainings insert anon" ON public.trainings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "trainings update anon" ON public.trainings;
CREATE POLICY "trainings update anon" ON public.trainings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "trainings delete anon" ON public.trainings;
CREATE POLICY "trainings delete anon" ON public.trainings FOR DELETE USING (true);

-- RLS Policies for completed_trainings
DROP POLICY IF EXISTS "completed_trainings select anon" ON public.completed_trainings;
CREATE POLICY "completed_trainings select anon" ON public.completed_trainings FOR SELECT USING (true);

DROP POLICY IF EXISTS "completed_trainings insert anon" ON public.completed_trainings;
CREATE POLICY "completed_trainings insert anon" ON public.completed_trainings FOR INSERT WITH CHECK (true);

-- RLS Policies for dashboard_infos
DROP POLICY IF EXISTS "dashboard_infos select anon" ON public.dashboard_infos;
CREATE POLICY "dashboard_infos select anon" ON public.dashboard_infos FOR SELECT USING (true);

DROP POLICY IF EXISTS "dashboard_infos insert anon" ON public.dashboard_infos;
CREATE POLICY "dashboard_infos insert anon" ON public.dashboard_infos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "dashboard_infos update anon" ON public.dashboard_infos;
CREATE POLICY "dashboard_infos update anon" ON public.dashboard_infos FOR UPDATE USING (true);

DROP POLICY IF EXISTS "dashboard_infos delete anon" ON public.dashboard_infos;
CREATE POLICY "dashboard_infos delete anon" ON public.dashboard_infos FOR DELETE USING (true);

-- RLS Policies for tasks
DROP POLICY IF EXISTS "tasks select anon" ON public.tasks;
CREATE POLICY "tasks select anon" ON public.tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "tasks insert anon" ON public.tasks;
CREATE POLICY "tasks insert anon" ON public.tasks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "tasks update anon" ON public.tasks;
CREATE POLICY "tasks update anon" ON public.tasks FOR UPDATE USING (true);

DROP POLICY IF EXISTS "tasks delete anon" ON public.tasks;
CREATE POLICY "tasks delete anon" ON public.tasks FOR DELETE USING (true);

-- RLS Policies for recurring_tasks
DROP POLICY IF EXISTS "recurring_tasks select anon" ON public.recurring_tasks;
CREATE POLICY "recurring_tasks select anon" ON public.recurring_tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "recurring_tasks insert anon" ON public.recurring_tasks;
CREATE POLICY "recurring_tasks insert anon" ON public.recurring_tasks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "recurring_tasks update anon" ON public.recurring_tasks;
CREATE POLICY "recurring_tasks update anon" ON public.recurring_tasks FOR UPDATE USING (true);

DROP POLICY IF EXISTS "recurring_tasks delete anon" ON public.recurring_tasks;
CREATE POLICY "recurring_tasks delete anon" ON public.recurring_tasks FOR DELETE USING (true);

-- RLS Policies for documents
DROP POLICY IF EXISTS "documents select anon" ON public.documents;
CREATE POLICY "documents select anon" ON public.documents FOR SELECT USING (true);

DROP POLICY IF EXISTS "documents insert anon" ON public.documents;
CREATE POLICY "documents insert anon" ON public.documents FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "documents update anon" ON public.documents;
CREATE POLICY "documents update anon" ON public.documents FOR UPDATE USING (true);

DROP POLICY IF EXISTS "documents delete anon" ON public.documents;
CREATE POLICY "documents delete anon" ON public.documents FOR DELETE USING (true);

-- RLS Policies for external_proofs
DROP POLICY IF EXISTS "external_proofs select anon" ON public.external_proofs;
CREATE POLICY "external_proofs select anon" ON public.external_proofs FOR SELECT USING (true);

DROP POLICY IF EXISTS "external_proofs insert anon" ON public.external_proofs;
CREATE POLICY "external_proofs insert anon" ON public.external_proofs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "external_proofs update anon" ON public.external_proofs;
CREATE POLICY "external_proofs update anon" ON public.external_proofs FOR UPDATE USING (true);

DROP POLICY IF EXISTS "external_proofs delete anon" ON public.external_proofs;
CREATE POLICY "external_proofs delete anon" ON public.external_proofs FOR DELETE USING (true);

-- RLS Policies for chat_users
DROP POLICY IF EXISTS "chat_users select anon" ON public.chat_users;
CREATE POLICY "chat_users select anon" ON public.chat_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "chat_users insert anon" ON public.chat_users;
CREATE POLICY "chat_users insert anon" ON public.chat_users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "chat_users update anon" ON public.chat_users;
CREATE POLICY "chat_users update anon" ON public.chat_users FOR UPDATE USING (true);

-- RLS Policies for chat_groups
DROP POLICY IF EXISTS "chat_groups select anon" ON public.chat_groups;
CREATE POLICY "chat_groups select anon" ON public.chat_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "chat_groups insert anon" ON public.chat_groups;
CREATE POLICY "chat_groups insert anon" ON public.chat_groups FOR INSERT WITH CHECK (true);

-- RLS Policies for chat_group_members
DROP POLICY IF EXISTS "chat_group_members select anon" ON public.chat_group_members;
CREATE POLICY "chat_group_members select anon" ON public.chat_group_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "chat_group_members insert anon" ON public.chat_group_members;
CREATE POLICY "chat_group_members insert anon" ON public.chat_group_members FOR INSERT WITH CHECK (true);

-- RLS Policies for chat_messages
DROP POLICY IF EXISTS "chat_messages select anon" ON public.chat_messages;
CREATE POLICY "chat_messages select anon" ON public.chat_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "chat_messages insert anon" ON public.chat_messages;
CREATE POLICY "chat_messages insert anon" ON public.chat_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "chat_messages update anon" ON public.chat_messages;
CREATE POLICY "chat_messages update anon" ON public.chat_messages FOR UPDATE USING (true);

-- RLS Policies for profiles
DROP POLICY IF EXISTS "profiles select anon" ON public.profiles;
CREATE POLICY "profiles select anon" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles insert anon" ON public.profiles;
CREATE POLICY "profiles insert anon" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "profiles update anon" ON public.profiles;
CREATE POLICY "profiles update anon" ON public.profiles FOR UPDATE USING (true);

-- ==============================================
-- ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_infos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- STORAGE BUCKETS
-- ==============================================

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('documents', 'documents', true),
  ('trainings', 'trainings', true),
  ('proofs', 'proofs', true),
  ('dashboard', 'dashboard', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
DROP POLICY IF EXISTS "documents select anon" ON storage.objects;
CREATE POLICY "documents select anon" ON storage.objects FOR SELECT USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "documents insert anon" ON storage.objects;
CREATE POLICY "documents insert anon" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "documents update anon" ON storage.objects;
CREATE POLICY "documents update anon" ON storage.objects FOR UPDATE USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "documents delete anon" ON storage.objects;
CREATE POLICY "documents delete anon" ON storage.objects FOR DELETE USING (bucket_id = 'documents');

-- Storage policies for trainings bucket
DROP POLICY IF EXISTS "trainings select anon" ON storage.objects;
CREATE POLICY "trainings select anon" ON storage.objects FOR SELECT USING (bucket_id = 'trainings');

DROP POLICY IF EXISTS "trainings insert anon" ON storage.objects;
CREATE POLICY "trainings insert anon" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'trainings');

DROP POLICY IF EXISTS "trainings update anon" ON storage.objects;
CREATE POLICY "trainings update anon" ON storage.objects FOR UPDATE USING (bucket_id = 'trainings');

DROP POLICY IF EXISTS "trainings delete anon" ON storage.objects;
CREATE POLICY "trainings delete anon" ON storage.objects FOR DELETE USING (bucket_id = 'trainings');

-- Storage policies for proofs bucket
DROP POLICY IF EXISTS "proofs select anon" ON storage.objects;
CREATE POLICY "proofs select anon" ON storage.objects FOR SELECT USING (bucket_id = 'proofs');

DROP POLICY IF EXISTS "proofs insert anon" ON storage.objects;
CREATE POLICY "proofs insert anon" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'proofs');

DROP POLICY IF EXISTS "proofs update anon" ON storage.objects;
CREATE POLICY "proofs update anon" ON storage.objects FOR UPDATE USING (bucket_id = 'proofs');

DROP POLICY IF EXISTS "proofs delete anon" ON storage.objects;
CREATE POLICY "proofs delete anon" ON storage.objects FOR DELETE USING (bucket_id = 'proofs');

-- Storage policies for dashboard bucket
DROP POLICY IF EXISTS "dashboard select anon" ON storage.objects;
CREATE POLICY "dashboard select anon" ON storage.objects FOR SELECT USING (bucket_id = 'dashboard');

DROP POLICY IF EXISTS "dashboard insert anon" ON storage.objects;
CREATE POLICY "dashboard insert anon" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'dashboard');

DROP POLICY IF EXISTS "dashboard update anon" ON storage.objects;
CREATE POLICY "dashboard update anon" ON storage.objects FOR UPDATE USING (bucket_id = 'dashboard');

DROP POLICY IF EXISTS "dashboard delete anon" ON storage.objects;
CREATE POLICY "dashboard delete anon" ON storage.objects FOR DELETE USING (bucket_id = 'dashboard');
