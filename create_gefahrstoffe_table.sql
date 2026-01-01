-- =====================================================
-- GEFAHRSTOFFE TABELLE
-- =====================================================
-- Diese Datei erstellt die Tabelle für Gefahrstoffe
-- Führen Sie dieses Skript in Ihrem Neon SQL Editor aus
-- =====================================================

-- Gefahrstoffe Table
CREATE TABLE IF NOT EXISTS gefahrstoffe (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  gefahrstoffsymbole TEXT,
  info TEXT,
  bemerkung TEXT,
  sicherheitsdatenblatt_url TEXT,
  sicherheitsdatenblatt_name VARCHAR(255),
  betriebsanweisung_laola_url TEXT,
  betriebsanweisung_laola_name VARCHAR(255),
  betriebsanweisung_freibad_url TEXT,
  betriebsanweisung_freibad_name VARCHAR(255),
  wassergefaehrdungsklasse VARCHAR(50),
  verbrauch_jahresmenge VARCHAR(100),
  substitution_geprueft_ergebnis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_gefahrstoffe_name
  ON gefahrstoffe (name);

CREATE INDEX IF NOT EXISTS idx_gefahrstoffe_wassergefaehrdungsklasse
  ON gefahrstoffe (wassergefaehrdungsklasse);

-- Trigger für automatische updated_at Aktualisierung
DROP TRIGGER IF EXISTS update_gefahrstoffe_updated_at ON gefahrstoffe;
CREATE TRIGGER update_gefahrstoffe_updated_at
  BEFORE UPDATE ON gefahrstoffe
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

