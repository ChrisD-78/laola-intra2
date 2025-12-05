-- Migration: Add 'employment_type' and 'monthly_hours' fields to schichtplan_employees table

-- Add the new 'employment_type' column (Vollzeit, Teilzeit, Aushilfe)
ALTER TABLE schichtplan_employees
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(20);

-- Add the new 'monthly_hours' column for Aushilfen
ALTER TABLE schichtplan_employees
ADD COLUMN IF NOT EXISTS monthly_hours DECIMAL(5,2);

-- Add index for performance if filtering by employment type is common
CREATE INDEX IF NOT EXISTS idx_schichtplan_employees_employment_type ON schichtplan_employees (employment_type);

