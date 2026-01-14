-- =====================================================
-- LA OLA INTRANET - ALLE SQL-MIGRATIONEN
-- =====================================================
-- Diese Datei enthält alle SQL-Skripte für das LA OLA Intranet
-- Führen Sie dieses Skript in Ihrem Neon SQL Editor aus
-- =====================================================
-- Erstellt: 2025
-- Version: 1.0 - Konsolidierte Version aller Migrationen
-- =====================================================

-- =====================================================
-- TEIL 1: BASIS-SETUP (Tabellen, Trigger, Indizes)
-- =====================================================

-- ==============================================
-- TABELLEN
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

-- =====================================================
-- TEIL 2: BENUTZER-VERWALTUNG
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

-- =====================================================
-- TEIL 3: ROLLEN-SYSTEM
-- =====================================================

-- Füge role Spalte hinzu
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Benutzer';

-- Erstelle Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- Migriere bestehende Daten (is_admin -> role)
UPDATE users 
SET role = CASE 
  WHEN is_admin = true THEN 'Admin'
  ELSE 'Benutzer'
END
WHERE role IS NULL OR role = 'Benutzer';

-- =====================================================
-- TEIL 4: TELEFON UND E-MAIL ZUR USERS TABELLE
-- =====================================================

-- Füge phone Spalte zur users Tabelle hinzu
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Füge email Spalte zur users Tabelle hinzu
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Erstelle Index für bessere Performance beim Suchen nach E-Mail
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- =====================================================
-- TEIL 5: POPUP-FUNKTION FÜR DASHBOARD-INFOS
-- =====================================================

-- Füge is_popup Spalte zur dashboard_infos Tabelle hinzu
ALTER TABLE dashboard_infos 
ADD COLUMN IF NOT EXISTS is_popup BOOLEAN DEFAULT false;

-- Erstelle Index für bessere Performance beim Abrufen von Popup-Infos
CREATE INDEX IF NOT EXISTS idx_dashboard_infos_popup ON dashboard_infos (is_popup, created_at DESC);

-- =====================================================
-- TEIL 6: QUIZ-SYSTEM
-- =====================================================

-- Quizzes Tabelle
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  total_questions INTEGER DEFAULT 0,
  passing_score INTEGER DEFAULT 70,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255)
);

-- Quiz Questions Tabelle
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  question_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Results Tabelle (Rangliste)
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  time_taken_seconds INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions (quiz_id, question_order);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results (quiz_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_leaderboard ON quiz_results (quiz_id, score DESC, completed_at ASC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results (user_name, completed_at DESC);

-- =====================================================
-- TEIL 7: QUIZ-ERGEBNISSE MIGRATION (Detaillierte Antworten)
-- =====================================================

-- Füge user_answers Spalte hinzu (JSONB für flexible Speicherung)
ALTER TABLE quiz_results 
ADD COLUMN IF NOT EXISTS user_answers JSONB;

-- Erstelle Index für bessere Performance bei Abfragen
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_answers ON quiz_results USING GIN (user_answers);

-- Kommentar hinzufügen
COMMENT ON COLUMN quiz_results.user_answers IS 'Speichert die gegebenen Antworten pro Frage: [{"question_id": "uuid", "user_answer": "A", "correct_answer": "B", "is_correct": false}]';

-- =====================================================
-- TEIL 8: WIEDERKEHRENDE AUFGABEN COMPLETIONS
-- =====================================================

-- Recurring Task Completions Table
CREATE TABLE IF NOT EXISTS recurring_task_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recurring_task_id UUID REFERENCES recurring_tasks(id) ON DELETE CASCADE,
  completed_by VARCHAR(255) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  next_due_date VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_recurring_task_completions_task_id
  ON recurring_task_completions (recurring_task_id, completed_at);

CREATE INDEX IF NOT EXISTS idx_recurring_task_completions_completed_by
  ON recurring_task_completions (completed_by, completed_at);

-- =====================================================
-- TEIL 9: TRAININGS TABELLE UPDATES
-- =====================================================

-- Füge neue Spalten zur trainings Tabelle hinzu
ALTER TABLE trainings 
ADD COLUMN IF NOT EXISTS duration VARCHAR(100),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Verfügbar',
ADD COLUMN IF NOT EXISTS date VARCHAR(100),
ADD COLUMN IF NOT EXISTS instructor VARCHAR(255),
ADD COLUMN IF NOT EXISTS thumbnail TEXT DEFAULT '📚',
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Füge neue Spalten zur completed_trainings Tabelle hinzu
ALTER TABLE completed_trainings
ADD COLUMN IF NOT EXISTS training_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS participant_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS participant_surname VARCHAR(255),
ADD COLUMN IF NOT EXISTS completed_date VARCHAR(100),
ADD COLUMN IF NOT EXISTS score INTEGER,
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS instructor VARCHAR(255),
ADD COLUMN IF NOT EXISTS duration VARCHAR(100);

-- =====================================================
-- TEIL 10: SCHICHTPLAN TABELLEN
-- =====================================================

-- Employees Table (Mitarbeiter)
CREATE TABLE IF NOT EXISTS schichtplan_employees (
  id VARCHAR(255) PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  areas TEXT[] NOT NULL, -- Array von Bereichen: ['Halle', 'Kasse', etc.]
  phone VARCHAR(50),
  email VARCHAR(255),
  weekly_hours DECIMAL(5,2),
  color VARCHAR(20), -- 'Rot', 'Braun', 'Schwarz', 'Grün', 'Violett', 'Blau', 'Gelb'
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Day Schedules Table (Tagespläne)
CREATE TABLE IF NOT EXISTS schichtplan_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  shifts JSONB NOT NULL, -- Struktur: { "Halle": { "Frühschicht": [{employeeId, employeeName}], ... }, ... }
  special_status JSONB, -- Struktur: { employeeId: "Urlaub" | "Krank" | etc. }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Vacation Requests Table (Urlaubsanträge)
CREATE TABLE IF NOT EXISTS schichtplan_vacation_requests (
  id VARCHAR(255) PRIMARY KEY,
  employee_id VARCHAR(255) NOT NULL REFERENCES schichtplan_employees(id) ON DELETE CASCADE,
  employee_name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Urlaub', 'Überstunden')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by VARCHAR(255)
);

-- Notifications Table (Benachrichtigungen)
CREATE TABLE IF NOT EXISTS schichtplan_notifications (
  id VARCHAR(255) PRIMARY KEY,
  employee_id VARCHAR(255) NOT NULL REFERENCES schichtplan_employees(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('vacation_approved', 'vacation_rejected')),
  message TEXT NOT NULL,
  date DATE NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_schichtplan_schedules_date ON schichtplan_schedules (date);
CREATE INDEX IF NOT EXISTS idx_schichtplan_vacation_requests_employee ON schichtplan_vacation_requests (employee_id, status);
CREATE INDEX IF NOT EXISTS idx_schichtplan_vacation_requests_status ON schichtplan_vacation_requests (status);
CREATE INDEX IF NOT EXISTS idx_schichtplan_notifications_employee ON schichtplan_notifications (employee_id, read);
CREATE INDEX IF NOT EXISTS idx_schichtplan_employees_name ON schichtplan_employees (last_name, first_name);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_schichtplan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_schichtplan_employees_updated_at
  BEFORE UPDATE ON schichtplan_employees
  FOR EACH ROW
  EXECUTE FUNCTION update_schichtplan_updated_at();

CREATE TRIGGER update_schichtplan_schedules_updated_at
  BEFORE UPDATE ON schichtplan_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_schichtplan_updated_at();

-- =====================================================
-- TEIL 11: SCHICHTPLAN TABELLEN ERWEITERN
-- =====================================================

-- Füge user_id Spalte zur schichtplan_employees Tabelle hinzu
ALTER TABLE schichtplan_employees 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Erstelle Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_schichtplan_employees_user_id ON schichtplan_employees (user_id);

-- Füge role Spalte hinzu (wird aus users übernommen)
ALTER TABLE schichtplan_employees 
ADD COLUMN IF NOT EXISTS role VARCHAR(50);

-- Erstelle Index für role
CREATE INDEX IF NOT EXISTS idx_schichtplan_employees_role ON schichtplan_employees (role);

-- =====================================================
-- TEIL 12: SCHICHTPLAN MITARBEITER ERWEITERUNGEN
-- =====================================================

-- Add 'employment_type' and 'monthly_hours' fields to schichtplan_employees table
ALTER TABLE schichtplan_employees
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(20);

ALTER TABLE schichtplan_employees
ADD COLUMN IF NOT EXISTS monthly_hours DECIMAL(5,2);

-- Add index for performance if filtering by employment type is common
CREATE INDEX IF NOT EXISTS idx_schichtplan_employees_employment_type ON schichtplan_employees (employment_type);

-- Hinzufügen von active-Feld zur schichtplan_employees Tabelle
DO $$
BEGIN
    -- Prüfen, ob die Spalte 'active' bereits existiert
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schichtplan_employees' AND column_name='active') THEN
        ALTER TABLE schichtplan_employees ADD COLUMN active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Spalte "active" zur Tabelle "schichtplan_employees" hinzugefügt.';
    ELSE
        RAISE NOTICE 'Spalte "active" existiert bereits in Tabelle "schichtplan_employees".';
    END IF;

    -- Alle bestehenden Mitarbeiter auf aktiv setzen
    UPDATE schichtplan_employees SET active = true WHERE active IS NULL;
    RAISE NOTICE 'Alle bestehenden Mitarbeiter wurden als aktiv markiert.';
END $$;

-- =====================================================
-- TEIL 13: TECHNIK INSPECTIONS TABLE
-- =====================================================

-- Technik Inspections Table
CREATE TABLE IF NOT EXISTS technik_inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rubrik VARCHAR(100) NOT NULL,                  -- Category: Messgeräte, Wartungen, Prüfungen, Elektrische Prüfungen, Lüftungen
  id_nr VARCHAR(100) NOT NULL,                   -- ID Number (e.g., M-001)
  name VARCHAR(255) NOT NULL,                    -- Name/Description of equipment
  standort VARCHAR(255) NOT NULL,                -- Location
  bild_url TEXT,                                 -- Image PDF URL
  bild_name VARCHAR(255),                        -- Image PDF filename
  letzte_pruefung VARCHAR(100) NOT NULL,         -- Last inspection date
  interval VARCHAR(50) NOT NULL,                 -- Inspection interval (Täglich, Wöchentlich, etc.)
  naechste_pruefung VARCHAR(100) NOT NULL,       -- Next inspection date
  bericht_url TEXT,                              -- Inspection report PDF URL
  bericht_name VARCHAR(255),                     -- Report PDF filename
  bemerkungen TEXT,                              -- Additional notes
  in_betrieb BOOLEAN DEFAULT true,               -- In/Out of operation
  kontaktdaten TEXT,                             -- Contact information
  status VARCHAR(50) DEFAULT 'Offen',            -- Status: Offen, Überfällig, Erledigt
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_technik_inspections_status
  ON technik_inspections (status);

CREATE INDEX IF NOT EXISTS idx_technik_inspections_naechste_pruefung
  ON technik_inspections (naechste_pruefung);

CREATE INDEX IF NOT EXISTS idx_technik_inspections_rubrik
  ON technik_inspections (rubrik);

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_technik_inspections_updated_at ON technik_inspections;
CREATE TRIGGER update_technik_inspections_updated_at
  BEFORE UPDATE ON technik_inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TEIL 13.1: GEFAHRSTOFFE TABELLE
-- =====================================================

-- Gefahrstoffe Table
CREATE TABLE IF NOT EXISTS gefahrstoffe (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,                                    -- Name des Gefahrstoffs
  gefahrstoffsymbole TEXT,                                       -- Gefahrstoffsymbole (kann mehrere enthalten, z.B. "GHS02, GHS05")
  info TEXT,                                                      -- Zusätzliche Informationen
  bemerkung TEXT,                                                -- Bemerkungen
  sicherheitsdatenblatt_url TEXT,                               -- Sicherheitsdatenblatt PDF URL
  sicherheitsdatenblatt_name VARCHAR(255),                      -- Sicherheitsdatenblatt PDF Dateiname
  betriebsanweisung_laola_url TEXT,                             -- Betriebsanweisung LA OLA PDF URL
  betriebsanweisung_laola_name VARCHAR(255),                    -- Betriebsanweisung LA OLA PDF Dateiname
  betriebsanweisung_freibad_url TEXT,                           -- Betriebsanweisung Freibad PDF URL
  betriebsanweisung_freibad_name VARCHAR(255),                  -- Betriebsanweisung Freibad PDF Dateiname
  wassergefaehrdungsklasse VARCHAR(50),                           -- Einstufung Wassergefährdungsklasse (z.B. "WGK 1", "WGK 2", "WGK 3")
  verbrauch_jahresmenge VARCHAR(100),                           -- Verbrauch Jahresmenge (z.B. "50 Liter", "100 kg")
  substitution_geprueft_ergebnis TEXT,                          -- Substitution geprüft Ergebnis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_gefahrstoffe_name
  ON gefahrstoffe (name);

CREATE INDEX IF NOT EXISTS idx_gefahrstoffe_wassergefaehrdungsklasse
  ON gefahrstoffe (wassergefaehrdungsklasse);

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_gefahrstoffe_updated_at ON gefahrstoffe;
CREATE TRIGGER update_gefahrstoffe_updated_at
  BEFORE UPDATE ON gefahrstoffe
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TEIL 13.2: GEFAHRSTOFFE - HERSTELLER FELD HINZUFÜGEN
-- =====================================================

-- Add hersteller column if it doesn't exist
ALTER TABLE gefahrstoffe
ADD COLUMN IF NOT EXISTS hersteller VARCHAR(255);

-- Add comment
COMMENT ON COLUMN gefahrstoffe.hersteller IS 'Hersteller des Gefahrstoffs';

-- =====================================================
-- TEIL 14: PUSH NOTIFICATIONS TABELLE
-- =====================================================

-- Push Subscriptions Table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions (endpoint);

-- Trigger für updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_schichtplan_updated_at();

-- =====================================================
-- TEIL 15: QUIZ-DATEN EINFÜGEN
-- =====================================================

-- WICHTIG: Zuerst alle alten Quizze löschen (optional - nur wenn komplett neu aufsetzen)
-- DELETE FROM quiz_results;
-- DELETE FROM quiz_questions;
-- DELETE FROM quizzes;

-- Quiz 1: Ultrafiltration
DO $$
DECLARE
  quiz1_id UUID;
  existing_quiz_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_quiz_count 
  FROM quizzes 
  WHERE title = 'Ultrafiltration';
  
  IF existing_quiz_count = 0 THEN
    INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
    VALUES (
      'Ultrafiltration',
      'Grundlagen der Ultrafiltration in der Schwimmbadtechnik',
      'Technik',
      12,
      70,
      true,
      'System'
    ) RETURNING id INTO quiz1_id;

    INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
    VALUES 
      (quiz1_id, 'Was ist das grundlegende Prinzip der Ultrafiltration?', 
        'Abtrennung von Stoffen durch chemische Reaktion', 
        'Abtrennung durch Membran mit Poren im Nanometerbereich', 
        'Abtrennung durch Zentrifugalkraft', 
        'Abtrennung durch Ionenaustausch', 
        'B', 1),
      (quiz1_id, 'Welcher Größenbereich wird bei der Ultrafiltration typischerweise abgetrennt?', 
        '0,01–0,1 µm', '1–10 µm', '10–100 µm', '0,0001 µm', 'A', 2),
      (quiz1_id, 'Welche Stoffe werden durch Ultrafiltration zuverlässig entfernt?', 
        'Bakterien', 'Gelöste Salze', 'Chlor', 'Kohlensäure', 'A', 3),
      (quiz1_id, 'Welches Ziel verfolgt der Einsatz der Ultrafiltration in der Schwimmbadtechnik?', 
        'Ersatz der Chlorung', 'Entfernung von Mikroorganismen und Trübstoffen', 'pH-Regulierung', 'Kalkentfernung', 'B', 4),
      (quiz1_id, 'Welche Filtrationsrichtung ist typisch für Ultrafiltrationsmodule?', 
        'Cross-Flow (Querströmung)', 'Dead-End (Stirnströmung)', 'Gegenstrom', 'Rückwärtsströmung', 'A', 5),
      (quiz1_id, 'Welche Maßnahme ist bei einem steigenden Transmembrandruck (TMP) erforderlich?', 
        'Reduzierung der Chlorzugabe', 'Chemische oder hydraulische Reinigung der Membran', 'Erhöhung der Temperatur', 'Senkung des pH-Wertes', 'B', 6),
      (quiz1_id, 'Was bedeutet der Begriff „Permeatfluss" (Flux)?', 
        'Geschwindigkeit der Rückspülung', 'Menge des durch die Membran gehenden Wassers pro Fläche und Zeit', 'Druckverlust im System', 'Salzgehalt des Permeats', 'B', 7),
      (quiz1_id, 'Welche Reinigung wird regelmäßig zur Aufrechterhaltung der Leistung durchgeführt?', 
        'Rückspülung mit Permeatwasser', 'Spülung mit Rohwasser', 'Trocknung der Membran', 'Erhöhung des Betriebsdrucks', 'A', 8),
      (quiz1_id, 'Welcher Vorteil entsteht durch die Ultrafiltration im Vergleich zur konventionellen Mehrschichtfiltration?', 
        'Geringerer Energieverbrauch', 'Keine Notwendigkeit zur Rückspülung', 'Höhere Rückhaltefähigkeit für Keime und Partikel', 'Günstigere Anschaffungskosten', 'C', 9),
      (quiz1_id, 'Wie kann eine chemische Membranreinigung durchgeführt werden?', 
        'Mit Säuren oder Laugen je nach Verschmutzungsart', 'Nur mit klarem Wasser', 'Durch Druckerhöhung', 'Durch Kühlung', 'A', 10),
      (quiz1_id, 'Welcher Parameter gibt Aufschluss über eine beginnende Membranverschmutzung?', 
        'pH-Wert', 'Temperatur', 'Anstieg des Transmembrandrucks', 'Chlorwert', 'C', 11),
      (quiz1_id, 'Wie trägt die Ultrafiltration zur Hygiene-Sicherheit nach DIN 19643 bei?', 
        'Sie ersetzt die Desinfektion vollständig', 'Sie minimiert das Risiko pathogener Keime im Umwälzwasser', 'Sie reguliert den pH-Wert automatisch', 'Sie verringert die Wasserverluste beim Rückspülen', 'B', 12);
  END IF;
END $$;

-- Quiz 2: Wasserkreislauf im Schwimmbadbetrieb
DO $$
DECLARE
  quiz2_id UUID;
  existing_quiz_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_quiz_count 
  FROM quizzes 
  WHERE title = 'Wasserkreislauf im Schwimmbadbetrieb';
  
  IF existing_quiz_count = 0 THEN
    INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
    VALUES (
      'Wasserkreislauf im Schwimmbadbetrieb',
      'Funktionsweise und Komponenten des Wasserkreislaufs',
      'Technik',
      12,
      70,
      true,
      'System'
    ) RETURNING id INTO quiz2_id;

    INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
    VALUES 
      (quiz2_id, 'Welches ist die richtige Reihenfolge im Wasserkreislauf eines Schwimmbeckens?', 
        'Becken → Filter → Chlorung → Ausgleichsbehälter → Becken', 
        'Becken → Ausgleichsbehälter → Pumpe → Filter → Desinfektion → Becken', 
        'Becken → Pumpe → Filter → Ausgleichsbehälter → Becken', 
        'Becken → Chlorung → Filter → Pumpe → Becken', 
        'B', 1),
      (quiz2_id, 'Welche Funktion hat der Ausgleichsbehälter im Wasserkreislauf?', 
        'Dient der Chloraufbereitung', 'Regelt den Wasserstand im Becken bei Schwimmbewegungen', 'Erwärmt das Wasser', 'Entfernt Feststoffe', 'B', 2),
      (quiz2_id, 'Wie gelangt das Wasser im Überlaufbecken in den Wasserkreislauf zurück?', 
        'Über Skimmer', 'Über den Bodenablauf', 'Über die Überlaufrinne in den Ausgleichsbehälter', 'Direkt zur Pumpe', 'C', 3),
      (quiz2_id, 'Welche Aufgabe hat die Umwälzpumpe im Kreislauf?', 
        'Hält die Temperatur konstant', 'Bewegt das Wasser durch die Aufbereitungsstufen', 'Desinfiziert das Wasser', 'Entfernt Trübstoffe', 'B', 4),
      (quiz2_id, 'Was passiert im Filter des Wasserkreislaufs?', 
        'Chemische Desinfektion', 'Entfernung von gelösten Stoffen', 'Entfernung von Schwebstoffen und Partikeln', 'Regelung des pH-Wertes', 'C', 5),
      (quiz2_id, 'Wie gelangt das gereinigte Wasser zurück ins Becken?', 
        'Über Einströmdüsen', 'Über den Bodenablauf', 'Über die Überlaufrinne', 'Über den Ausgleichsbehälter', 'A', 6),
      (quiz2_id, 'Was versteht man unter dem Begriff „Umwälzzeit"?', 
        'Zeit, die das Wasser für eine Filterdurchströmung benötigt', 
        'Zeit, bis das gesamte Beckenvolumen einmal aufbereitet wurde', 
        'Zeit zwischen zwei Rückspülungen', 
        'Zeit, bis das Chlor vollständig reagiert', 
        'B', 7),
      (quiz2_id, 'Welche Umwälzzeit gilt typischerweise für ein Schwimmerbecken?', 
        '1 Stunde', '2 Stunden', '4 Stunden', '8 Stunden', 'C', 8),
      (quiz2_id, 'Warum wird dem Kreislauf Frischwasser zugeführt?', 
        'Um Kalk zu entfernen', 'Um organische Stoffe und gelöste Salze zu verdünnen', 'Um die Temperatur zu senken', 'Um die Leitfähigkeit zu erhöhen', 'B', 9),
      (quiz2_id, 'Was ist eine häufige Folge eines zu geringen Wasserdurchsatzes im Kreislauf?', 
        'Übermäßige Erwärmung', 'Schlechte Durchströmung und Desinfektion', 'Zu niedriger pH-Wert', 'Überchlorierung', 'B', 10),
      (quiz2_id, 'Was passiert, wenn die Rückspülung des Filters im Wasserkreislauf zu selten durchgeführt wird?', 
        'Der Filter reinigt besser', 'Der Druckverlust sinkt', 'Die Filtration wird schlechter, der Druck steigt', 'Es wird weniger Wasser benötigt', 'C', 11),
      (quiz2_id, 'Welches Hauptziel verfolgt der gesamte Wasserkreislauf im Schwimmbad?', 
        'Ästhetik des Wassers', 'Minimierung des Energieverbrauchs', 'Sicherstellung hygienisch einwandfreien, klaren und angenehmen Wassers', 'Erhöhung der Wassertemperatur', 'C', 12);
  END IF;
END $$;

-- Quiz 3: DIN 19643 Allgemein
DO $$
DECLARE
  quiz3_id UUID;
  existing_quiz_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_quiz_count 
  FROM quizzes 
  WHERE title = 'DIN 19643 Allgemein';
  
  IF existing_quiz_count = 0 THEN
    INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
    VALUES (
      'DIN 19643 Allgemein',
      'Grundlegendes Wissen zu DIN 19643 - pH-Wert, Chlor, Wasserqualität und hygienische Standards',
      'Wasseraufbereitung',
      21,
      70,
      true,
      'System'
    ) RETURNING id INTO quiz3_id;

    INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order) VALUES
      (quiz3_id, 'Was ist bei einer Überschreitung des pH-Wertes über 7,8 zu tun?', 
        'Mehr Chlor zudosieren', 'pH-Wert mit Säure senken', 'Wasser aufheizen', 'Filter rückspülen', 'B', 1),
      (quiz3_id, 'Welche Wirkung hat ein zu hoher pH-Wert auf die Desinfektionswirkung von Chlor?', 
        'Keine Auswirkung', 'Desinfektionswirkung steigt', 'Desinfektionswirkung sinkt', 'Chlor wird stabiler', 'C', 2),
      (quiz3_id, 'Welcher freie Chlorwert ist für Schwimmerbecken nach DIN 19643 gefordert?', 
        '0,1–0,3 mg/l', '0,3–0,6 mg/l', '0,4–0,8 mg/l', '0,6–1,0 mg/l', 'B', 3),
      (quiz3_id, 'Was ist zu tun, wenn der freie Chlorwert unter 0,3 mg/l liegt?', 
        'Bad schließen', 'Chlorzugabe erhöhen', 'Filter rückspülen', 'pH-Wert erhöhen', 'B', 4),
      (quiz3_id, 'Wie hoch darf der gebundene Chlorwert maximal sein?', 
        '0,1 mg/l', '0,2 mg/l', '0,3 mg/l', '0,5 mg/l', 'B', 5),
      (quiz3_id, 'Was bedeutet ein zu hoher gebundener Chlorwert?', 
        'Zu wenig Filtration', 'Zu viel Frischwasser', 'Zu viele organische Belastungen', 'Zu wenig pH-Regulierung', 'C', 6),
      (quiz3_id, 'Welche Maßnahme hilft, wenn gebundenes Chlor regelmäßig zu hoch ist?', 
        'Aktivkohlezugabe erhöhen', 'pH-Wert senken', 'Chlorzufuhr drosseln', 'Filterlaufzeit verkürzen', 'A', 7),
      (quiz3_id, 'Was geschieht bei zu niedrigem Redoxpotenzial (unter 750 mV)?', 
        'Gute Desinfektionswirkung', 'Unzureichende Desinfektion', 'Überchlorierung', 'Zu hoher pH-Wert', 'B', 8),
      (quiz3_id, 'Was kann ein zu niedriger pH-Wert (< 6,8) verursachen?', 
        'Kalkablagerungen', 'Korrosion an metallischen Teilen', 'Schlechte Desinfektion', 'Trübung', 'B', 9),
      (quiz3_id, 'Welche Wirkung hat zu hoher pH-Wert auf Trübungen?', 
        'Keine', 'Sie nehmen ab', 'Sie nehmen zu', 'Wasser wird klarer', 'C', 10),
      (quiz3_id, 'Was ist bei zu hohem Nitratwert zu prüfen?', 
        'Frischwasseranteil', 'Filtergeschwindigkeit', 'Chlorpumpe', 'Wassertemperatur', 'A', 11),
      (quiz3_id, 'Was ist der Zweck der Aktivkohlefiltration in DIN 19643-4?', 
        'Entfernung von Bakterien', 'Entfernung von Chloraminen und organischen Stoffen', 'Entfernung von Kalk', 'Erhöhung des pH-Wertes', 'B', 12),
      (quiz3_id, 'Welcher Parameter zeigt die Wirksamkeit der Desinfektion am besten an?', 
        'pH-Wert', 'Redoxpotenzial', 'Temperatur', 'Leitfähigkeit', 'B', 13),
      (quiz3_id, 'Wie hoch sollte das Redoxpotenzial idealerweise sein?', 
        '650–700 mV', '700–750 mV', '750–780 mV', '800–850 mV', 'C', 14),
      (quiz3_id, 'Was zeigt ein hoher TOC-Wert (Total Organic Carbon) an?', 
        'Geringe organische Belastung', 'Hohe organische Belastung', 'Zu viel Chlor', 'Zu wenig Frischwasser', 'B', 15),
      (quiz3_id, 'Welche Maßnahme ist bei dauerhaft hoher TOC-Belastung sinnvoll?', 
        'Erhöhung der Rückspülintervalle', 'Verringerung des Frischwasseranteils', 'Häufigere Filterrückspülung und Frischwasserzufuhr', 'Reduktion der Chlorzugabe', 'C', 16),
      (quiz3_id, 'Was ist der Sollwert für Trübung (NTU)?', 
        '< 0,5 NTU', '< 1,0 NTU', '< 2,0 NTU', '< 5,0 NTU', 'A', 17),
      (quiz3_id, 'Was kann eine zu hohe Trübung verursachen?', 
        'Übermäßiger Chlorverbrauch', 'Geringere Sichttiefe, Hygienerisiko', 'pH-Schwankungen', 'Sinkende Temperatur', 'B', 18),
      (quiz3_id, 'Welche Ursache kann eine plötzliche Chlorwert-Schwankung haben?', 
        'Leck in der Chlorleitung', 'Falscher pH-Wert', 'Schwankender Badebetrieb', 'Alle genannten', 'D', 19),
      (quiz3_id, 'Was ist bei Überschreitung des gebundenen Chlorwerts (> 0,2 mg/l) vorgeschrieben?', 
        'Filter sofort rückspülen', 'Frischwasseranteil erhöhen', 'Chloranlage abschalten', 'Badebetrieb beenden', 'B', 20),
      (quiz3_id, 'Was ist das Ziel der DIN 19643 insgesamt?', 
        'Energieeinsparung', 'Einhaltung der chemischen Gleichgewichte', 'Sicherstellung hygienisch einwandfreien Beckenwassers', 'Reduktion von Betriebskosten', 'C', 21);
  END IF;
END $$;

-- Quiz 4: Chemische und physikalische Eigenschaften von Wasser
DO $$
DECLARE
  quiz4_id UUID;
  existing_quiz_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_quiz_count 
  FROM quizzes 
  WHERE title = 'Chemische und physikalische Eigenschaften von Wasser';
  
  IF existing_quiz_count = 0 THEN
    INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
    VALUES (
      'Chemische und physikalische Eigenschaften von Wasser',
      'Grundlegende Eigenschaften von Wasser in der Schwimmbadtechnik',
      'Chemie',
      18,
      70,
      true,
      'System'
    ) RETURNING id INTO quiz4_id;

    INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
    VALUES 
      (quiz4_id, 'Wie lautet die chemische Formel von Wasser?', 'HO₂', 'H₂O', 'OH₂', 'H₃O', 'B', 1),
      (quiz4_id, 'Welche geometrische Struktur hat das Wassermolekül?', 'Linear', 'Tetraedrisch', 'Gewinkelt', 'Planar', 'C', 2),
      (quiz4_id, 'Welche Aggregatzustände kann Wasser annehmen?', 'Fest, flüssig, gasförmig', 'Nur flüssig', 'Flüssig und gasförmig', 'Nur fest und flüssig', 'A', 3),
      (quiz4_id, 'Bei welcher Temperatur siedet reines Wasser auf Meereshöhe?', '50 °C', '90 °C', '100 °C', '110 °C', 'C', 4),
      (quiz4_id, 'Bei welcher Temperatur gefriert reines Wasser unter Normaldruck?', '0 °C', '–10 °C', '5 °C', '32 °C', 'A', 5),
      (quiz4_id, 'Warum ist Eis leichter als flüssiges Wasser?', 'Geringere Dichte durch Wasserstoffbrücken', 'Höherer Druck', 'Dichtere Molekülpackung', 'Wegen gelöster Luftblasen', 'A', 6),
      (quiz4_id, 'Welche Dichte hat Wasser bei 4 °C?', '1,00 g/cm³', '0,90 g/cm³', '1,10 g/cm³', '0,99 g/cm³', 'A', 7),
      (quiz4_id, 'Welche Polarität besitzt das Wassermolekül?', 'Unpolar', 'Polar', 'Neutral', 'Dipolfrei', 'B', 8),
      (quiz4_id, 'Welche der folgenden Substanzen löst sich am besten in Wasser?', 'Öl', 'Benzin', 'Kochsalz', 'Wachs', 'C', 9),
      (quiz4_id, 'Was beschreibt der pH-Wert von Wasser?', 'Temperatur', 'Härtegrad', 'Konzentration der H⁺-Ionen', 'Leitfähigkeit', 'C', 10),
      (quiz4_id, 'Wie lautet der pH-Wert von reinem Wasser bei 25 °C?', '0', '7', '10', '14', 'B', 11),
      (quiz4_id, 'Welche Aussage zur spezifischen Wärmekapazität von Wasser ist richtig?', 'Wasser erwärmt sich sehr schnell', 'Wasser hat eine sehr hohe Wärmekapazität', 'Wasser speichert kaum Wärme', 'Wasser verliert Wärme sofort', 'B', 12),
      (quiz4_id, 'Was ist die Ursache für die hohe Siedetemperatur von Wasser im Vergleich zu ähnlichen Molekülen?', 'Große Molekülmasse', 'Wasserstoffbrückenbindungen', 'Elektronenkonfiguration', 'Ionische Struktur', 'B', 13),
      (quiz4_id, 'Wie nennt man Wasser, das viele Calcium- und Magnesiumionen enthält?', 'Destilliertes Wasser', 'Weiches Wasser', 'Hartes Wasser', 'Leitungsfreies Wasser', 'C', 14),
      (quiz4_id, 'Welche physikalische Eigenschaft ermöglicht Kapillarwirkung?', 'Dichte', 'Oberflächenspannung', 'Siedepunkt', 'Leitfähigkeit', 'B', 15),
      (quiz4_id, 'Was passiert mit dem Volumen von Wasser beim Gefrieren?', 'Es bleibt gleich', 'Es nimmt ab', 'Es nimmt zu', 'Es verdampft', 'C', 16),
      (quiz4_id, 'Warum ist Wasser ein gutes Lösungsmittel für viele Stoffe?', 'Wegen seiner unpolaren Struktur', 'Wegen seiner hohen Dichte', 'Wegen seiner Polarität', 'Wegen seiner Farbe', 'C', 17),
      (quiz4_id, 'Welche physikalische Größe beschreibt die Wärmemenge, die benötigt wird, um 1 g Wasser um 1 °C zu erwärmen?', 'Schmelzwärme', 'Wärmekapazität', 'Verdampfungswärme', 'Siedepunkt', 'B', 18);
  END IF;
END $$;

-- Quiz 5: pH-Wert Grundlagen
DO $$
DECLARE
  quiz5_id UUID;
  existing_quiz_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_quiz_count 
  FROM quizzes 
  WHERE title = 'pH-Wert Grundlagen';
  
  IF existing_quiz_count = 0 THEN
    INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
    VALUES (
      'pH-Wert Grundlagen',
      'Alles Wichtige rund um den pH-Wert in der Wasserchemie',
      'Chemie',
      17,
      70,
      true,
      'System'
    ) RETURNING id INTO quiz5_id;

    INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
    VALUES 
      (quiz5_id, 'Wofür steht die Abkürzung „pH"?', 'Potenz der Härte', 'Potenz des Wasserstoffs', 'Protonenhäufigkeit', 'Phasen-Harmonie', 'B', 1),
      (quiz5_id, 'Welcher pH-Wert gilt als neutral?', '0', '5', '7', '10', 'C', 2),
      (quiz5_id, 'Was bedeutet ein pH-Wert kleiner als 7?', 'Basisch', 'Neutral', 'Sauer', 'Laugenhaltig', 'C', 3),
      (quiz5_id, 'Was bedeutet ein pH-Wert größer als 7?', 'Sauer', 'Neutral', 'Basisch', 'Oxidierend', 'C', 4),
      (quiz5_id, 'Wie berechnet man den pH-Wert?', 'pH = log [H⁺]', 'pH = –log [H⁺]', 'pH = 10 × [H⁺]', 'pH = [H⁺] / log', 'B', 5),
      (quiz5_id, 'Was beschreibt der pH-Wert?', 'Die Temperatur der Lösung', 'Die Konzentration der Hydroxidionen', 'Die Konzentration der Wasserstoffionen (H⁺)', 'Die Dichte der Flüssigkeit', 'C', 6),
      (quiz5_id, 'Welchen pH-Wert hat destilliertes Wasser bei 25 °C?', '0', '5', '7', '10', 'C', 7),
      (quiz5_id, 'Welcher pH-Wert ist typisch für Natronlauge?', '1', '5', '9', '13', 'D', 8),
      (quiz5_id, 'Was gilt für starke Säuren im Vergleich zu schwachen Säuren?', 'Sie haben denselben pH-Wert', 'Sie haben einen höheren pH-Wert', 'Sie haben einen niedrigeren pH-Wert', 'Sie sind neutral', 'C', 9),
      (quiz5_id, 'Wie nennt man eine Lösung mit pH = 0?', 'Sehr schwache Säure', 'Sehr starke Säure', 'Neutral', 'Starke Base', 'B', 10),
      (quiz5_id, 'Welches Ion bestimmt den pH-Wert einer Lösung hauptsächlich?', 'Na⁺', 'OH⁻', 'H⁺', 'Cl⁻', 'C', 11),
      (quiz5_id, 'Was beschreibt der pOH-Wert?', 'Die Konzentration von Wasser', 'Die Konzentration der Hydroxidionen (OH⁻)', 'Die Konzentration von H₂O', 'Die Dichte', 'B', 12),
      (quiz5_id, 'Wie hängen pH- und pOH-Wert bei 25 °C zusammen?', 'pH + pOH = 7', 'pH × pOH = 7', 'pH + pOH = 14', 'pH – pOH = 0', 'C', 13),
      (quiz5_id, 'Welchen pH-Wert hat eine 0,1 M Salzsäure-Lösung (HCl)?', '0', '1', '7', '14', 'B', 14),
      (quiz5_id, 'Welche Farbe zeigt Phenolphthalein in basischer Lösung?', 'Farblos', 'Rot', 'Rosa', 'Gelb', 'C', 15),
      (quiz5_id, 'Was passiert mit dem pH-Wert, wenn eine Säure verdünnt wird?', 'Er sinkt', 'Er bleibt gleich', 'Er steigt', 'Er wird unendlich groß', 'C', 16),
      (quiz5_id, 'Wie nennt man eine Lösung, die den pH-Wert trotz Zugabe von Säuren oder Basen weitgehend konstant hält?', 'Neutralisator', 'Indikator', 'Pufferlösung', 'Elektrolyt', 'C', 17);
  END IF;
END $$;

-- Quiz 6: Herz-Kreislauf-Quiz
DO $$
DECLARE
  quiz_new_id UUID;
  existing_quiz_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_quiz_count 
  FROM quizzes 
  WHERE title = 'Herz-Kreislauf-Quiz';
  
  IF existing_quiz_count = 0 THEN
    INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
    VALUES (
      'Herz-Kreislauf-Quiz',
      'Grundlagen des Herz-Kreislauf-Systems und der Blutversorgung',
      'Gesundheit',
      18,
      70,
      true,
      'System'
    ) RETURNING id INTO quiz_new_id;

    INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
    VALUES 
      (quiz_new_id, 'Aus wie vielen Kammern besteht das menschliche Herz?', 
        '2 Kammern', 
        '3 Kammern', 
        '4 Kammern', 
        '5 Kammern', 
        'C', 1),
      (quiz_new_id, 'Welche Blutgefäße führen sauerstoffreiches Blut vom Herzen weg?', 
        'Venen', 
        'Arterien', 
        'Kapillaren', 
        'Lymphgefäße', 
        'B', 2),
      (quiz_new_id, 'Wie nennt man die Phase, in der sich das Herz zusammenzieht?', 
        'Diastole', 
        'Systole', 
        'Bradykardie', 
        'Tachykardie', 
        'B', 3),
      (quiz_new_id, 'In welcher Herzkammer beginnt der große Blutkreislauf (Körperkreislauf)?', 
        'Rechter Vorhof', 
        'Rechte Kammer', 
        'Linker Vorhof', 
        'Linke Kammer', 
        'D', 4),
      (quiz_new_id, 'Welche Aufgabe haben die Herzklappen?', 
        'Sie pumpen das Blut durch den Körper', 
        'Sie verhindern einen Rückfluss des Blutes', 
        'Sie produzieren rote Blutkörperchen', 
        'Sie regulieren den Blutdruck', 
        'B', 5),
      (quiz_new_id, 'Wo findet der Gasaustausch zwischen Blut und Luft statt?', 
        'Im Herzen', 
        'In den Lungenbläschen (Alveolen)', 
        'In den Arterien', 
        'In der Leber', 
        'B', 6),
      (quiz_new_id, 'Was transportieren die roten Blutkörperchen (Erythrozyten) hauptsächlich?', 
        'Nährstoffe', 
        'Sauerstoff', 
        'Hormone', 
        'Vitamine', 
        'B', 7),
      (quiz_new_id, 'Wie viele Liter Blut hat ein erwachsener Mensch durchschnittlich?', 
        '2-3 Liter', 
        '5-6 Liter', 
        '8-9 Liter', 
        '10-12 Liter', 
        'B', 8),
      (quiz_new_id, 'Was ist der Ruhepuls eines gesunden Erwachsenen?', 
        '30-40 Schläge pro Minute', 
        '60-80 Schläge pro Minute', 
        '100-120 Schläge pro Minute', 
        '140-160 Schläge pro Minute', 
        'B', 9),
      (quiz_new_id, 'Welches Blutgefäß bringt sauerstoffarmes Blut zurück zum Herzen?', 
        'Vene', 
        'Arterie', 
        'Aorta', 
        'Bronchie', 
        'A', 10),
      (quiz_new_id, 'Wie heißt die größte Arterie im menschlichen Körper?', 
        'Lungenarterie', 
        'Aorta', 
        'Halsschlagader', 
        'Oberschenkelarterie', 
        'B', 11),
      (quiz_new_id, 'Welche Aufgabe hat das Blut NICHT?', 
        'Sauerstofftransport', 
        'Wärmeregulierung', 
        'Verdauung von Nahrung', 
        'Abwehr von Krankheitserregern', 
        'C', 12),
      (quiz_new_id, 'Was sind Kapillaren?', 
        'Große Blutgefäße', 
        'Herzklappen', 
        'Feinste, haardünne Blutgefäße', 
        'Teile des Herzens', 
        'C', 13),
      (quiz_new_id, 'Was passiert im kleinen Blutkreislauf (Lungenkreislauf)?', 
        'Das Blut versorgt die Muskeln mit Sauerstoff', 
        'Das Blut wird in der Lunge mit Sauerstoff angereichert', 
        'Das Blut fließt durch die Nieren', 
        'Das Blut versorgt das Gehirn', 
        'B', 14),
      (quiz_new_id, 'Welche Zellen sind für die Blutgerinnung wichtig?', 
        'Rote Blutkörperchen', 
        'Weiße Blutkörperchen', 
        'Blutplättchen (Thrombozyten)', 
        'Nervenzellen', 
        'C', 15),
      (quiz_new_id, 'Was ist die Hauptaufgabe der weißen Blutkörperchen?', 
        'Sauerstofftransport', 
        'Abwehr von Krankheitserregern', 
        'Blutgerinnung', 
        'Wärmetransport', 
        'B', 16),
      (quiz_new_id, 'Welcher Faktor erhöht das Risiko für Herz-Kreislauf-Erkrankungen NICHT?', 
        'Rauchen', 
        'Bewegungsmangel', 
        'Ungesunde Ernährung', 
        'Regelmäßiger Sport', 
        'D', 17),
      (quiz_new_id, 'Was misst man mit einem EKG (Elektrokardiogramm)?', 
        'Den Blutdruck', 
        'Die Blutzuckerwerte', 
        'Die elektrische Aktivität des Herzens', 
        'Die Anzahl der Blutkörperchen', 
        'C', 18);
  END IF;
END $$;

-- Quiz 7: Trainingslehre-Quiz
DO $$
DECLARE
  quiz_new_id UUID;
  existing_quiz_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_quiz_count 
  FROM quizzes 
  WHERE title = 'Trainingslehre-Quiz';
  
  IF existing_quiz_count = 0 THEN
    INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
    VALUES (
      'Trainingslehre-Quiz',
      'Grundlagen der Trainingslehre: Trainingsprinzipien, motorische Fähigkeiten und Trainingsmethoden',
      'Sport',
      22,
      70,
      true,
      'System'
    ) RETURNING id INTO quiz_new_id;

    INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
    VALUES 
      (quiz_new_id, 'Was versteht man unter dem Prinzip der Superkompensation?', 
        'Das Training wird ständig schwieriger', 
        'Nach einer Belastung steigt die Leistungsfähigkeit über das Ausgangsniveau', 
        'Man trainiert jeden Tag zur gleichen Zeit', 
        'Man trainiert mit immer weniger Gewicht', 
        'B', 1),
      (quiz_new_id, 'Welche motorische Fähigkeit wird beim Dauerlauf hauptsächlich trainiert?', 
        'Kraft', 
        'Schnelligkeit', 
        'Ausdauer', 
        'Beweglichkeit', 
        'C', 2),
      (quiz_new_id, 'Was bedeutet das Trainingsprinzip der "progressiven Belastung"?', 
        'Man trainiert immer gleich intensiv', 
        'Die Trainingsbelastung wird allmählich gesteigert', 
        'Man macht nach jedem Training eine Woche Pause', 
        'Man trainiert nur eine Muskelgruppe', 
        'B', 3),
      (quiz_new_id, 'Wie nennt man die Fähigkeit, Kraft über einen längeren Zeitraum aufrechtzuerhalten?', 
        'Maximalkraft', 
        'Schnellkraft', 
        'Kraftausdauer', 
        'Reaktivkraft', 
        'C', 4),
      (quiz_new_id, 'Was versteht man unter anaerober Ausdauer?', 
        'Ausdauer ohne ausreichende Sauerstoffversorgung', 
        'Ausdauer mit viel Sauerstoff', 
        'Ausdauer im Wasser', 
        'Ausdauer an der frischen Luft', 
        'A', 5),
      (quiz_new_id, 'Wie lange sollte eine Trainingseinheit mindestens dauern, um die Ausdauer zu verbessern?', 
        '5-10 Minuten', 
        '10-15 Minuten', 
        '20-30 Minuten', 
        '60-90 Minuten', 
        'C', 6),
      (quiz_new_id, 'Was ist Maximalkraft?', 
        'Die Kraft bei schnellen Bewegungen', 
        'Die höchstmögliche Kraft, die ein Muskel aufbringen kann', 
        'Die Kraft bei langen Belastungen', 
        'Die Kraft beim Dehnen', 
        'B', 7),
      (quiz_new_id, 'Welche Trainingsmethode eignet sich am besten für den Muskelaufbau?', 
        'Ausdauertraining mit niedriger Intensität', 
        'Krafttraining mit hohen Gewichten und wenigen Wiederholungen', 
        'Stretching', 
        'Koordinationstraining', 
        'B', 8),
      (quiz_new_id, 'Was bedeutet der Begriff "Laktat"?', 
        'Ein Vitamin im Blut', 
        'Milchsäure, die bei intensiver Belastung entsteht', 
        'Ein Hormon', 
        'Eine Art von Protein', 
        'B', 9),
      (quiz_new_id, 'Wie viele Tage Pause sollten nach einem intensiven Krafttraining mindestens eingelegt werden?', 
        'Keine Pause nötig', 
        '1-2 Tage', 
        '5-7 Tage', 
        '2 Wochen', 
        'B', 10),
      (quiz_new_id, 'Was trainiert man beim Seilspringen hauptsächlich?', 
        'Nur die Beine', 
        'Ausdauer und Koordination', 
        'Nur die Arme', 
        'Nur die Beweglichkeit', 
        'B', 11),
      (quiz_new_id, 'Was ist Schnellkraft?', 
        'Die Kraft bei langen Belastungen', 
        'Die Fähigkeit, in kürzester Zeit eine hohe Kraft zu entwickeln', 
        'Die maximale Kraft eines Muskels', 
        'Die Kraft beim langsamen Laufen', 
        'B', 12),
      (quiz_new_id, 'Wann sollte man sich am besten dehnen?', 
        'Nur vor dem Training', 
        'Niemals', 
        'Nach dem Aufwärmen oder nach dem Training', 
        'Nur morgens nach dem Aufstehen', 
        'C', 13),
      (quiz_new_id, 'Was versteht man unter dem Begriff "Übertraining"?', 
        'Besonders effektives Training', 
        'Zu viel Training ohne ausreichende Erholung', 
        'Training mit zu leichten Gewichten', 
        'Training nur eines Körperteils', 
        'B', 14),
      (quiz_new_id, 'Welche Trainingsform verbessert die Beweglichkeit am effektivsten?', 
        'Krafttraining', 
        'Ausdauertraining', 
        'Dehnübungen (Stretching)', 
        'Schnelligkeitstraining', 
        'C', 15),
      (quiz_new_id, 'Was ist die aerobe Schwelle?', 
        'Die Belastungsgrenze, bei der noch genug Sauerstoff vorhanden ist', 
        'Die höchste Herzfrequenz', 
        'Die niedrigste Trainingsintensität', 
        'Die Grenze zur Erschöpfung', 
        'A', 16),
      (quiz_new_id, 'Wie oft pro Woche sollten Erwachsene mindestens Sport treiben?', 
        '1-mal pro Woche', 
        '2-3-mal pro Woche', 
        '7-mal pro Woche', 
        'Jeden zweiten Tag intensiv', 
        'B', 17),
      (quiz_new_id, 'Was ist ein Wiederholungsmaximum (1RM)?', 
        'Die Anzahl der Trainingstage pro Woche', 
        'Das maximale Gewicht, das man einmal bewegen kann', 
        'Die Anzahl der Sätze pro Übung', 
        'Die Trainingsdauer in Minuten', 
        'B', 18),
      (quiz_new_id, 'Welche Aussage zum Aufwärmen ist richtig?', 
        'Aufwärmen ist unnötig', 
        'Aufwärmen bereitet den Körper auf die Belastung vor und senkt das Verletzungsrisiko', 
        'Aufwärmen schwächt die Leistung', 
        'Nur Profisportler müssen sich aufwärmen', 
        'B', 19),
      (quiz_new_id, 'Was trainiert man durch Intervalltraining?', 
        'Nur Beweglichkeit', 
        'Ausdauer und Schnelligkeit wechselnd', 
        'Nur Maximalkraft', 
        'Nur Koordination', 
        'B', 20),
      (quiz_new_id, 'Welcher Nährstoff ist besonders wichtig für den Muskelaufbau?', 
        'Vitamine', 
        'Proteine (Eiweiß)', 
        'Wasser', 
        'Mineralstoffe', 
        'B', 21),
      (quiz_new_id, 'Was ist der Unterschied zwischen statischem und dynamischem Krafttraining?', 
        'Statisch: Muskel spannt ohne Bewegung; Dynamisch: Muskel bewegt sich', 
        'Statisch: schnelle Bewegungen; Dynamisch: langsame Bewegungen', 
        'Statisch: mit Geräten; Dynamisch: ohne Geräte', 
        'Es gibt keinen Unterschied', 
        'A', 22);
  END IF;
END $$;

-- Quiz 8: Sauna-Quiz
DO $$
DECLARE
  quiz_new_id UUID;
  existing_quiz_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_quiz_count 
  FROM quizzes 
  WHERE title = 'Sauna-Quiz';
  
  IF existing_quiz_count = 0 THEN
    INSERT INTO quizzes (title, description, category, total_questions, passing_score, is_active, created_by)
    VALUES (
      'Sauna-Quiz',
      'Grundlagen des Saunierens: Temperatur, Wirkungen, Verhaltensregeln und gesundheitliche Aspekte',
      'Wellness',
      24,
      70,
      true,
      'System'
    ) RETURNING id INTO quiz_new_id;

    INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order)
    VALUES 
      (quiz_new_id, 'Bei welcher Temperatur liegt die Raumtemperatur in einer klassischen finnischen Sauna?', 
        '40-50°C', 
        '60-70°C', 
        '80-100°C', 
        '110-120°C', 
        'C', 1),
      (quiz_new_id, 'Wie wirkt sich regelmäßiges Saunieren auf das Immunsystem aus?', 
        'Es schwächt das Immunsystem', 
        'Es stärkt das Immunsystem und macht widerstandsfähiger gegen Erkältungen', 
        'Es hat keinen Einfluss auf das Immunsystem', 
        'Es zerstört die weißen Blutkörperchen', 
        'B', 2),
      (quiz_new_id, 'Warum sollte man vor dem ersten Saunagang duschen?', 
        'Um den Körper abzukühlen', 
        'Aus hygienischen Gründen und um Schmutz und Kosmetika zu entfernen', 
        'Um die Haut zu erwärmen', 
        'Es ist nicht notwendig zu duschen', 
        'B', 3),
      (quiz_new_id, 'Wie lange sollte ein Saunagang für Anfänger maximal dauern?', 
        '3-5 Minuten', 
        '8-12 Minuten', 
        '20-25 Minuten', 
        '30-40 Minuten', 
        'B', 4),
      (quiz_new_id, 'Was bewirkt ein Aufguss in der Sauna?', 
        'Er kühlt die Sauna ab', 
        'Er erhöht kurzzeitig die gefühlte Hitze durch höhere Luftfeuchtigkeit', 
        'Er desinfiziert die Luft', 
        'Er senkt die Temperatur', 
        'B', 5),
      (quiz_new_id, 'Warum ist die Abkühlung nach dem Saunagang wichtig?', 
        'Um schneller zu schwitzen', 
        'Um den Kreislauf zu trainieren und die Blutgefäße zu stärken', 
        'Um Gewicht zu verlieren', 
        'Um die Muskeln zu entspannen', 
        'B', 6),
      (quiz_new_id, 'Wie viele Saunagänge werden für eine typische Saunasitzung empfohlen?', 
        '1 Saunagang', 
        '2-3 Saunagänge', 
        '5-6 Saunagänge', 
        'So viele wie möglich', 
        'B', 7),
      (quiz_new_id, 'Welche Wirkung hat die Sauna auf die Haut?', 
        'Sie trocknet die Haut dauerhaft aus', 
        'Sie fördert die Durchblutung und reinigt die Poren', 
        'Sie verursacht Hautausschlag', 
        'Sie hat keine Wirkung auf die Haut', 
        'B', 8),
      (quiz_new_id, 'Wo sollte man in der Sauna am besten sitzen, wenn man Anfänger ist?', 
        'Auf den unteren Bänken, wo es kühler ist', 
        'Immer ganz oben, wo es am heißesten ist', 
        'In der Mitte der Sauna', 
        'Direkt neben dem Ofen', 
        'A', 9),
      (quiz_new_id, 'Warum sollte man vor dem Saunagang gut abtrocknen?', 
        'Um schneller zu schwitzen', 
        'Weil trockene Haut schneller schwitzt als nasse', 
        'Um die Handtücher zu schonen', 
        'Um Bakterien zu entfernen', 
        'B', 10),
      (quiz_new_id, 'Was sollte man während des Saunierens trinken?', 
        'Alkohol zur Entspannung', 
        'Kaffee', 
        'Wasser oder ungesüßte Tees', 
        'Energydrinks', 
        'C', 11),
      (quiz_new_id, 'Welche Auswirkung hat die Sauna auf den Blutdruck?', 
        'Der Blutdruck steigt dauerhaft an', 
        'Der Blutdruck sinkt zunächst in der Wärme, steigt beim Abkühlen kurz an', 
        'Der Blutdruck bleibt immer gleich', 
        'Der Blutdruck sinkt gefährlich ab', 
        'B', 12),
      (quiz_new_id, 'Wann sollte man NICHT in die Sauna gehen?', 
        'Nach dem Sport', 
        'Am Abend', 
        'Bei Fieber oder akuten Infektionen', 
        'Am Wochenende', 
        'C', 13),
      (quiz_new_id, 'Wie wirkt sich Saunieren auf die Muskulatur aus?', 
        'Die Muskeln werden schwächer', 
        'Die Durchblutung wird gefördert und Verspannungen lösen sich', 
        'Die Muskeln verkrampfen', 
        'Es hat keine Wirkung auf die Muskeln', 
        'B', 14),
      (quiz_new_id, 'Was bedeutet "Sauna" im Finnischen?', 
        'Heißer Raum', 
        'Schwitzstube oder Dampfbad', 
        'Entspannung', 
        'Holzhaus', 
        'B', 15),
      (quiz_new_id, 'Wie sollte man sich nach dem Saunagang abkühlen?', 
        'Sofort ins eiskalte Wasser springen', 
        'Erst an der frischen Luft abkühlen, dann kalt duschen oder ins Tauchbecken', 
        'Gar nicht abkühlen', 
        'Nur mit warmem Wasser duschen', 
        'B', 16),
      (quiz_new_id, 'Welche Wirkung hat die Sauna auf das Herz-Kreislauf-System?', 
        'Sie belastet das Herz stark negativ', 
        'Sie trainiert die Blutgefäße und stärkt das Herz-Kreislauf-System', 
        'Sie hat keine Wirkung', 
        'Sie verursacht Herzrhythmusstörungen', 
        'B', 17),
      (quiz_new_id, 'Warum sollte man in der Sauna ein Handtuch unterlegen?', 
        'Um bequemer zu sitzen', 
        'Aus hygienischen Gründen - kein Schweiß soll auf das Holz gelangen', 
        'Um sich nicht zu verbrennen', 
        'Um das Holz zu schützen', 
        'B', 18),
      (quiz_new_id, 'Wie viel Flüssigkeit verliert man durchschnittlich bei einem Saunabesuch?', 
        '0,1-0,2 Liter', 
        '0,5-1,5 Liter', 
        '3-4 Liter', 
        '5-6 Liter', 
        'B', 19),
      (quiz_new_id, 'Ab welchem Alter dürfen Kinder in die Sauna?', 
        'Erst ab 16 Jahren', 
        'Erst ab 12 Jahren', 
        'Bereits als Kleinkind, aber mit kürzeren Saunagängen und niedrigerer Temperatur', 
        'Kinder dürfen gar nicht in die Sauna', 
        'C', 20),
      (quiz_new_id, 'Was sollte man zwischen den Saunagängen tun?', 
        'Sofort wieder in die Sauna gehen', 
        'Sport treiben', 
        'Eine Ruhepause von mindestens 15-20 Minuten einlegen', 
        'Schwer essen', 
        'C', 21),
      (quiz_new_id, 'Welche Wirkung hat die Sauna auf Stress?', 
        'Sie erhöht den Stress', 
        'Sie reduziert Stress und fördert die Entspannung', 
        'Sie hat keine Wirkung auf Stress', 
        'Sie verursacht Angstzustände', 
        'B', 22),
      (quiz_new_id, 'Was ist der Unterschied zwischen einer finnischen Sauna und einem Dampfbad?', 
        'Finnische Sauna: hohe Temperatur, niedrige Luftfeuchtigkeit; Dampfbad: niedrigere Temperatur, sehr hohe Luftfeuchtigkeit', 
        'Es gibt keinen Unterschied', 
        'Finnische Sauna ist kühler als ein Dampfbad', 
        'Im Dampfbad ist es trockener', 
        'A', 23),
      (quiz_new_id, 'Wie wirkt sich regelmäßiges Saunieren auf den Schlaf aus?', 
        'Es verursacht Schlaflosigkeit', 
        'Es kann die Schlafqualität verbessern und für besseren Schlaf sorgen', 
        'Es hat keine Wirkung auf den Schlaf', 
        'Es macht übermäßig müde am Tag', 
        'B', 24);
  END IF;
END $$;

-- =====================================================
-- TEIL 16: VERIFIZIERUNG UND ABSCHLUSS
-- =====================================================

-- Überprüfung aller Tabellen
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- Überprüfung der Quizze
SELECT 
  q.title,
  q.total_questions,
  q.category,
  COUNT(qq.id) as eingefuegte_fragen
FROM quizzes q
LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
GROUP BY q.id, q.title, q.total_questions, q.category
ORDER BY q.created_at;

-- Überprüfung der Benutzer
SELECT 
  username,
  display_name,
  role,
  is_admin,
  is_active,
  created_at
FROM users
ORDER BY 
  CASE role
    WHEN 'Admin' THEN 1
    WHEN 'Verwaltung' THEN 2
    WHEN 'Technik' THEN 3
    WHEN 'Benutzer' THEN 4
    ELSE 5
  END,
  display_name;

-- Erfolgsmeldung
DO $$
DECLARE
  total_tables INTEGER;
  total_quizzes INTEGER;
  total_questions INTEGER;
  total_users INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_tables FROM information_schema.tables WHERE table_schema = 'public';
  SELECT COUNT(*) INTO total_quizzes FROM quizzes;
  SELECT COUNT(*) INTO total_questions FROM quiz_questions;
  SELECT COUNT(*) INTO total_users FROM users;
  
-- TEIL 14: URLAUBSPLANUNG VOREINSTELLUNGEN
-- =====================================================

-- Create vacation limits table if it doesn't exist
CREATE TABLE IF NOT EXISTS schichtplan_vacation_limits (
  id SERIAL PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  area VARCHAR(50) NOT NULL,
  max_employees INTEGER NOT NULL CHECK (max_employees > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_vacation_limits_area_date 
ON schichtplan_vacation_limits (area, start_date, end_date);

-- Add comment
COMMENT ON TABLE schichtplan_vacation_limits IS 'Voreinstellungen für maximale Urlaubsanträge pro Bereich und Zeitraum';

-- =====================================================
-- ENDE DER MIGRATIONEN
-- =====================================================

  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ LA OLA INTRANET DATENBANK-SETUP ABGESCHLOSSEN!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Statistiken:';
  RAISE NOTICE '   Tabellen erstellt: %', total_tables;
  RAISE NOTICE '   Quizze: %', total_quizzes;
  RAISE NOTICE '   Quiz-Fragen: %', total_questions;
  RAISE NOTICE '   Benutzer: %', total_users;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Nächste Schritte:';
  RAISE NOTICE '   1. Kopieren Sie Ihre Neon Connection String';
  RAISE NOTICE '   2. Fügen Sie ihn in Ihre .env.local ein';
  RAISE NOTICE '   3. Starten Sie die Anwendung';
  RAISE NOTICE '==============================================';
END $$;

