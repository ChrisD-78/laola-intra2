-- Migration: Add hersteller field to gefahrstoffe table
-- This adds a manufacturer field to the gefahrstoffe table

-- Add hersteller column if it doesn't exist
ALTER TABLE gefahrstoffe
ADD COLUMN IF NOT EXISTS hersteller VARCHAR(255);

-- Add comment
COMMENT ON COLUMN gefahrstoffe.hersteller IS 'Hersteller des Gefahrstoffs';
