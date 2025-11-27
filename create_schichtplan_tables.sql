-- =====================================================
-- SCHICHTPLAN TABELLEN
-- =====================================================
-- Diese Datei enthält die SQL-Skripte für den Schichtplan
-- Führen Sie dieses Skript in Ihrem Neon SQL Editor aus
-- =====================================================

-- Employees Table (Mitarbeiter)
CREATE TABLE IF NOT EXISTS schichtplan_employees (
  id VARCHAR(255) PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  areas TEXT[] NOT NULL, -- Array von Bereichen: ['Halle', 'Kasse', etc.]
  phone VARCHAR(50),
  email VARCHAR(255),
  weekly_hours DECIMAL(5,2),
  color VARCHAR(20), -- 'Rot', 'Braun', 'Schwarz', 'Grün', 'Violett'
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Day Schedules Table (Tagespläne)
CREATE TABLE IF NOT EXISTS schichtplan_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  shifts JSONB NOT NULL, -- Struktur: { "Halle": { "Frühschicht": [{employeeId, employeeName}], ... }, ... }
  special_status JSONB, -- Struktur: { employeeId: "Urlaub" | "Krank" | etc. }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Vacation Requests Table (Urlaubsanträge)
CREATE TABLE IF NOT EXISTS schichtplan_vacation_requests (
  id VARCHAR(255) PRIMARY KEY,
  employee_id VARCHAR(255) NOT NULL REFERENCES schichtplan_employees(id) ON DELETE CASCADE,
  employee_name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Urlaub', 'Überstunden')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by VARCHAR(255)
);

-- Notifications Table (Benachrichtigungen)
CREATE TABLE IF NOT EXISTS schichtplan_notifications (
  id VARCHAR(255) PRIMARY KEY,
  employee_id VARCHAR(255) NOT NULL REFERENCES schichtplan_employees(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('vacation_approved', 'vacation_rejected')),
  message TEXT NOT NULL,
  date DATE NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_schichtplan_schedules_date ON schichtplan_schedules (date);
CREATE INDEX IF NOT EXISTS idx_schichtplan_vacation_requests_employee ON schichtplan_vacation_requests (employee_id, status);
CREATE INDEX IF NOT EXISTS idx_schichtplan_vacation_requests_status ON schichtplan_vacation_requests (status);
CREATE INDEX IF NOT EXISTS idx_schichtplan_notifications_employee ON schichtplan_notifications (employee_id, read);
CREATE INDEX IF NOT EXISTS idx_schichtplan_employees_name ON schichtplan_employees (last_name, first_name);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_schichtplan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_schichtplan_employees_updated_at
  BEFORE UPDATE ON schichtplan_employees
  FOR EACH ROW
  EXECUTE FUNCTION update_schichtplan_updated_at();

CREATE TRIGGER update_schichtplan_schedules_updated_at
  BEFORE UPDATE ON schichtplan_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_schichtplan_updated_at();

