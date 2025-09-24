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

-- Training Records Table
CREATE TABLE IF NOT EXISTS trainings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'Verfügbar',
  date VARCHAR(100) NOT NULL,
  instructor VARCHAR(255) NOT NULL,
  pdf_url TEXT,
  video_url TEXT,
  thumbnail VARCHAR(10) DEFAULT '📚',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Completed Trainings Table
CREATE TABLE IF NOT EXISTS completed_trainings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
  training_title VARCHAR(255) NOT NULL,
  participant_name VARCHAR(255) NOT NULL,
  participant_surname VARCHAR(255) NOT NULL,
  completed_date DATE NOT NULL,
  score INTEGER,
  category VARCHAR(100) NOT NULL,
  instructor VARCHAR(255) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

DROP POLICY IF EXISTS "completed_trainings update anon" ON public.completed_trainings;
CREATE POLICY "completed_trainings update anon" ON public.completed_trainings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "completed_trainings delete anon" ON public.completed_trainings;
CREATE POLICY "completed_trainings delete anon" ON public.completed_trainings FOR DELETE USING (true);

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

-- RLS Policies for dashboard_infos
DROP POLICY IF EXISTS "dashboard_infos select anon" ON public.dashboard_infos;
CREATE POLICY "dashboard_infos select anon" ON public.dashboard_infos FOR SELECT USING (true);

DROP POLICY IF EXISTS "dashboard_infos insert anon" ON public.dashboard_infos;
CREATE POLICY "dashboard_infos insert anon" ON public.dashboard_infos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "dashboard_infos update anon" ON public.dashboard_infos;
CREATE POLICY "dashboard_infos update anon" ON public.dashboard_infos FOR UPDATE USING (true);

DROP POLICY IF EXISTS "dashboard_infos delete anon" ON public.dashboard_infos;
CREATE POLICY "dashboard_infos delete anon" ON public.dashboard_infos FOR DELETE USING (true);

-- Enable RLS
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_infos ENABLE ROW LEVEL SECURITY;

-- Profiles for users
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles select anon" ON public.profiles;
CREATE POLICY "profiles select anon" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles insert anon" ON public.profiles;
CREATE POLICY "profiles insert anon" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "profiles update self" ON public.profiles;
CREATE POLICY "profiles update self" ON public.profiles FOR UPDATE USING (auth.uid() = id);
