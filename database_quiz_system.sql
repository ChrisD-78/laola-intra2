-- =====================================================
-- QUIZ SYSTEM SETUP
-- LA OLA Intranet - Quiz & Rangliste
-- =====================================================
-- Erstellt Quiz-System mit Fragen, Antworten und Rangliste
-- =====================================================

-- 1. Quizzes Tabelle
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

-- 2. Quiz Questions Tabelle
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

-- 3. Quiz Results Tabelle (Rangliste)
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

-- Erfolgsbestätigung
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Quiz-System Tabellen erfolgreich erstellt!';
  RAISE NOTICE 'Nächster Schritt: Quiz-Daten einfügen';
  RAISE NOTICE '==============================================';
END $$;

