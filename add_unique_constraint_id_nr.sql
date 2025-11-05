-- =====================================================
-- Add UNIQUE Constraint to id_nr
-- LA OLA Intranet - Ensure unique ID numbers
-- =====================================================
-- Run this SQL in your Neon SQL Editor
-- This ensures that each ID-Nr. can only be assigned once
-- =====================================================

-- Add UNIQUE constraint to id_nr column
ALTER TABLE technik_inspections 
ADD CONSTRAINT technik_inspections_id_nr_unique UNIQUE (id_nr);

-- Create index for performance (already done by UNIQUE constraint, but explicit)
CREATE INDEX IF NOT EXISTS idx_technik_inspections_id_nr 
ON technik_inspections (id_nr);

-- Verify the constraint
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'technik_inspections'::regclass
  AND conname = 'technik_inspections_id_nr_unique';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'UNIQUE Constraint Added!';
  RAISE NOTICE 'id_nr must now be unique across all inspections';
  RAISE NOTICE 'Format: [3 letters]-[3 digits]';
  RAISE NOTICE 'Examples: MES-001, WAR-002, PRÜ-003';
  RAISE NOTICE '==============================================';
END $$;

