-- =====================================================
-- QUIZ RESULTS MIGRATION
-- LA OLA Intranet - Detaillierte Quiz-Ergebnisse
-- =====================================================
-- Erweitert quiz_results Tabelle um detaillierte Antworten
-- =====================================================

-- Füge user_answers Spalte hinzu (JSONB für flexible Speicherung)
ALTER TABLE quiz_results 
ADD COLUMN IF NOT EXISTS user_answers JSONB;

-- Erstelle Index für bessere Performance bei Abfragen
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_answers ON quiz_results USING GIN (user_answers);

-- Kommentar hinzufügen
COMMENT ON COLUMN quiz_results.user_answers IS 'Speichert die gegebenen Antworten pro Frage: [{"question_id": "uuid", "user_answer": "A", "correct_answer": "B", "is_correct": false}]';

-- Erfolgsbestätigung
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Quiz-Results Migration abgeschlossen!';
  RAISE NOTICE 'user_answers Spalte wurde hinzugefügt';
  RAISE NOTICE '==============================================';
END $$;

