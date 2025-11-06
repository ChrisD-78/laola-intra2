-- =====================================================
-- ROLES MIGRATION
-- LA OLA Intranet - Rollen-System erweitern
-- =====================================================
-- Fügt ein Rollen-System hinzu: Admin, Benutzer, Technik, Verwaltung
-- =====================================================

-- 1. Füge role Spalte hinzu
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Benutzer';

-- 2. Erstelle Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- 3. Migriere bestehende Daten (is_admin -> role)
UPDATE users 
SET role = CASE 
  WHEN is_admin = true THEN 'Admin'
  ELSE 'Benutzer'
END;

-- 4. Setze spezifische Rollen für bestimmte Benutzer (optional)
-- UPDATE users SET role = 'Technik' WHERE username = 'technik_username';
-- UPDATE users SET role = 'Verwaltung' WHERE username = 'verwaltung_username';

-- 5. Überprüfe die Rollen-Verteilung
SELECT 
  role,
  COUNT(*) as anzahl,
  STRING_AGG(display_name, ', ') as benutzer
FROM users
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'Admin' THEN 1
    WHEN 'Verwaltung' THEN 2
    WHEN 'Technik' THEN 3
    WHEN 'Benutzer' THEN 4
    ELSE 5
  END;

-- 6. Zeige alle Benutzer mit ihren neuen Rollen
SELECT 
  username,
  display_name,
  role,
  is_admin,
  is_active,
  created_at
FROM users
ORDER BY 
  CASE role
    WHEN 'Admin' THEN 1
    WHEN 'Verwaltung' THEN 2
    WHEN 'Technik' THEN 3
    WHEN 'Benutzer' THEN 4
    ELSE 5
  END,
  display_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Rollen-System Migration abgeschlossen!';
  RAISE NOTICE 'Verfügbare Rollen: Admin, Verwaltung, Technik, Benutzer';
  RAISE NOTICE 'Hinweis: is_admin Spalte wird beibehalten für Kompatibilität';
  RAISE NOTICE '==============================================';
END $$;

-- HINWEIS: Die is_admin Spalte wird aus Kompatibilitätsgründen beibehalten
-- Sie kann später entfernt werden, wenn das neue Rollen-System vollständig implementiert ist

