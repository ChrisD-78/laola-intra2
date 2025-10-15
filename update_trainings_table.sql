-- =====================================================
-- UPDATE TRAININGS AND COMPLETED_TRAININGS TABLES
-- Fügt fehlende Spalten hinzu
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

-- Überprüfe die aktualisierte Struktur der trainings Tabelle
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'trainings'
ORDER BY ordinal_position;

-- Überprüfe die aktualisierte Struktur der completed_trainings Tabelle
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'completed_trainings'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Database Update Complete!';
  RAISE NOTICE 'Trainings Table: Neue Spalten hinzugefügt';
  RAISE NOTICE 'Completed Trainings Table: Neue Spalten hinzugefügt';
  RAISE NOTICE '==============================================';
END $$;

