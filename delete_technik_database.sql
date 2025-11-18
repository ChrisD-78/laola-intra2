-- =====================================================
-- Delete Technik Inspections Database
-- LA OLA Intranet - Remove all Technik-related database objects
-- =====================================================
-- Run this SQL in your Neon SQL Editor to delete all Technik data
-- =====================================================

-- Drop trigger first (if exists)
DROP TRIGGER IF EXISTS update_technik_inspections_updated_at ON technik_inspections;

-- Drop indexes
DROP INDEX IF EXISTS idx_technik_inspections_status;
DROP INDEX IF EXISTS idx_technik_inspections_naechste_pruefung;
DROP INDEX IF EXISTS idx_technik_inspections_rubrik;

-- Drop the table (this will also delete all data)
DROP TABLE IF EXISTS technik_inspections;

-- Verify deletion
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'technik_inspections'
  ) THEN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Technik Inspections Table Deleted Successfully!';
    RAISE NOTICE 'All Technik data has been removed from the database';
    RAISE NOTICE '==============================================';
  ELSE
    RAISE NOTICE 'WARNING: Table still exists. Please check manually.';
  END IF;
END $$;

