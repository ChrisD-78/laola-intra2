-- Migration: Add birth_date column to schichtplan_employees table if it doesn't exist
-- This ensures that the birth_date column exists for storing employee birth dates

-- Add birth_date column if it doesn't exist
DO $$
BEGIN
    -- Prüfen, ob die Spalte 'birth_date' bereits existiert
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'schichtplan_employees' 
        AND column_name = 'birth_date'
    ) THEN
        -- Spalte hinzufügen
        ALTER TABLE schichtplan_employees
        ADD COLUMN birth_date DATE;
        
        RAISE NOTICE 'Spalte birth_date wurde zur Tabelle schichtplan_employees hinzugefügt.';
    ELSE
        RAISE NOTICE 'Spalte birth_date existiert bereits in der Tabelle schichtplan_employees.';
    END IF;
END $$;

-- Create index for performance if filtering by birth dates is needed
CREATE INDEX IF NOT EXISTS idx_schichtplan_employees_birth_date 
ON schichtplan_employees (birth_date);

