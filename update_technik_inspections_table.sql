-- =====================================================
-- Update Technik Inspections Table
-- LA OLA Intranet - Add new fields for PDF support
-- =====================================================
-- Run this SQL in your Neon SQL Editor if you already created the table
-- This adds the new fields for Bild and Bericht PDFs
-- =====================================================

-- Add new columns for PDF filenames
ALTER TABLE technik_inspections 
ADD COLUMN IF NOT EXISTS bild_name VARCHAR(255);

ALTER TABLE technik_inspections 
ADD COLUMN IF NOT EXISTS bericht_url TEXT;

ALTER TABLE technik_inspections 
ADD COLUMN IF NOT EXISTS bericht_name VARCHAR(255);

-- Update existing 'bericht' text column if it exists (backup to bemerkungen)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'technik_inspections' 
    AND column_name = 'bericht'
  ) THEN
    -- Merge existing text reports into bemerkungen
    UPDATE technik_inspections 
    SET bemerkungen = CONCAT(
      COALESCE(bemerkungen, ''), 
      CASE WHEN bemerkungen IS NOT NULL AND bericht IS NOT NULL THEN E'\n\nBericht:\n' ELSE '' END,
      COALESCE(bericht, '')
    )
    WHERE bericht IS NOT NULL AND bericht != '';
    
    -- Drop the old bericht column
    ALTER TABLE technik_inspections DROP COLUMN bericht;
  END IF;
END $$;

-- Verify the updated structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'technik_inspections'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Technik Inspections Table Updated!';
  RAISE NOTICE 'New fields added: bild_name, bericht_url, bericht_name';
  RAISE NOTICE 'Ready for PDF uploads';
  RAISE NOTICE '==============================================';
END $$;

