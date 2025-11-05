-- =====================================================
-- Technik Inspections Table
-- LA OLA Intranet - Technical Inspection Management
-- =====================================================
-- Run this SQL in your Neon SQL Editor to create the technik_inspections table
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

-- Verify table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'technik_inspections'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Technik Inspections Table Created!';
  RAISE NOTICE 'Table: technik_inspections';
  RAISE NOTICE 'Ready to store technical inspection data';
  RAISE NOTICE '==============================================';
END $$;

