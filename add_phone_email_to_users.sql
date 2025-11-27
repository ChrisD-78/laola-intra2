-- =====================================================
-- TELEFON UND E-MAIL ZUR USERS TABELLE HINZUFÜGEN
-- =====================================================
-- Diese Datei fügt phone und email Spalten zur users Tabelle hinzu
-- Führen Sie dieses Skript in Ihrem Neon SQL Editor aus
-- =====================================================

-- Füge phone Spalte zur users Tabelle hinzu
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Füge email Spalte zur users Tabelle hinzu
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Erstelle Index für bessere Performance beim Suchen nach E-Mail
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

