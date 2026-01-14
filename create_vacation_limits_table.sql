-- Migration: Add schichtplan_vacation_limits table
-- This table stores vacation limits per area and date range

-- Create vacation limits table if it doesn't exist
CREATE TABLE IF NOT EXISTS schichtplan_vacation_limits (
  id SERIAL PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  area VARCHAR(50) NOT NULL,
  max_employees INTEGER NOT NULL CHECK (max_employees > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_vacation_limits_area_date 
ON schichtplan_vacation_limits (area, start_date, end_date);

-- Add comment
COMMENT ON TABLE schichtplan_vacation_limits IS 'Voreinstellungen für maximale Urlaubsanträge pro Bereich und Zeitraum';
