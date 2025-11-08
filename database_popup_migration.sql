-- =====================================================
-- POPUP MIGRATION
-- LA OLA Intranet - Popup-Funktion für Dashboard-Infos
-- =====================================================
-- Fügt Popup-Funktion zu Dashboard-Informationen hinzu
-- =====================================================

-- 1. Füge is_popup Spalte zur dashboard_infos Tabelle hinzu
ALTER TABLE dashboard_infos 
ADD COLUMN IF NOT EXISTS is_popup BOOLEAN DEFAULT false;

-- 2. Erstelle Index für bessere Performance beim Abrufen von Popup-Infos
CREATE INDEX IF NOT EXISTS idx_dashboard_infos_popup ON dashboard_infos (is_popup, created_at DESC);

-- 3. Überprüfe die Struktur
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'dashboard_infos'
ORDER BY ordinal_position;

-- 4. Zeige alle Popup-Informationen
SELECT 
  id,
  title,
  is_popup,
  created_at
FROM dashboard_infos
WHERE is_popup = true
ORDER BY created_at DESC;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Popup-Funktion Migration abgeschlossen!';
  RAISE NOTICE 'is_popup Spalte wurde hinzugefügt';
  RAISE NOTICE 'Popup-Infos werden beim Login automatisch angezeigt';
  RAISE NOTICE '==============================================';
END $$;

