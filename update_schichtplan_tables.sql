-- =====================================================
-- SCHICHTPLAN TABELLEN ERWEITERN
-- =====================================================
-- Diese Datei erweitert die Schichtplan-Tabellen um
-- Verknüpfung zur users Tabelle
-- =====================================================

-- Füge user_id Spalte zur schichtplan_employees Tabelle hinzu
ALTER TABLE schichtplan_employees 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Erstelle Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_schichtplan_employees_user_id ON schichtplan_employees (user_id);

-- Füge role Spalte hinzu (wird aus users übernommen)
ALTER TABLE schichtplan_employees 
ADD COLUMN IF NOT EXISTS role VARCHAR(50);

-- Erstelle Index für role
CREATE INDEX IF NOT EXISTS idx_schichtplan_employees_role ON schichtplan_employees (role);

