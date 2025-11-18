-- =====================================================
-- LA OLA INTRANET - VOLLSTÄNDIGE DATENBANK-SETUP
-- =====================================================
-- Diese Datei enthält alle SQL-Skripte für das LA OLA Intranet
-- Führen Sie dieses Skript in Ihrem Neon SQL Editor aus
-- =====================================================
-- Erstellt: 2025
-- Version: 1.0
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
-- TEIL 4: POPUP-FUNKTION FÜR DASHBOARD-INFOS
-- =====================================================

-- Füge is_popup Spalte zur dashboard_infos Tabelle hinzu
ALTER TABLE dashboard_infos 
ADD COLUMN IF NOT EXISTS is_popup BOOLEAN DEFAULT false;

-- Erstelle Index für bessere Performance beim Abrufen von Popup-Infos
CREATE INDEX IF NOT EXISTS idx_dashboard_infos_popup ON dashboard_infos (is_popup, created_at DESC);

-- =====================================================
-- TEIL 5: QUIZ-SYSTEM
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
-- TEIL 6: QUIZ-ERGEBNISSE MIGRATION (Detaillierte Antworten)
-- =====================================================

-- Füge user_answers Spalte hinzu (JSONB für flexible Speicherung)
ALTER TABLE quiz_results 
ADD COLUMN IF NOT EXISTS user_answers JSONB;

-- Erstelle Index für bessere Performance bei Abfragen
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_answers ON quiz_results USING GIN (user_answers);

-- Kommentar hinzufügen
COMMENT ON COLUMN quiz_results.user_answers IS 'Speichert die gegebenen Antworten pro Frage: [{"question_id": "uuid", "user_answer": "A", "correct_answer": "B", "is_correct": false}]';

-- =====================================================
-- TEIL 7: WIEDERKEHRENDE AUFGABEN COMPLETIONS
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
-- TEIL 8: TRAININGS TABELLE UPDATES
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
-- TEIL 9: QUIZ-DATEN EINFÜGEN
-- =====================================================

-- WICHTIG: Zuerst alle alten Quizze löschen
DELETE FROM quiz_results;
DELETE FROM quiz_questions;
DELETE FROM quizzes;

-- Quiz 1: Ultrafiltration
DO $$
DECLARE
  quiz1_id UUID;
BEGIN
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
END $$;

-- Quiz 2: Wasserkreislauf im Schwimmbadbetrieb
DO $$
DECLARE
  quiz2_id UUID;
BEGIN
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
END $$;

-- Quiz 3: DIN 19643 Allgemein (Update mit korrigierten Fragen)
DO $$
DECLARE
  quiz3_id UUID;
BEGIN
  -- Lösche altes Quiz falls vorhanden
  DELETE FROM quiz_results WHERE quiz_id IN (SELECT id FROM quizzes WHERE title = 'DIN 19643 Allgemein');
  DELETE FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE title = 'DIN 19643 Allgemein');
  DELETE FROM quizzes WHERE title = 'DIN 19643 Allgemein';

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

-- =====================================================
-- TEIL 10: VERIFIZIERUNG UND ABSCHLUSS
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

