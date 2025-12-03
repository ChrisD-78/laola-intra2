-- =====================================================
-- Hinzufügen von active-Feld zur schichtplan_employees Tabelle
-- =====================================================

DO $$
BEGIN
    -- Prüfen, ob die Spalte 'active' bereits existiert
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schichtplan_employees' AND column_name='active') THEN
        ALTER TABLE schichtplan_employees ADD COLUMN active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Spalte "active" zur Tabelle "schichtplan_employees" hinzugefügt.';
    ELSE
        RAISE NOTICE 'Spalte "active" existiert bereits in Tabelle "schichtplan_employees".';
    END IF;

    -- Alle bestehenden Mitarbeiter auf aktiv setzen
    UPDATE schichtplan_employees SET active = true WHERE active IS NULL;
    RAISE NOTICE 'Alle bestehenden Mitarbeiter wurden als aktiv markiert.';

END $$;

