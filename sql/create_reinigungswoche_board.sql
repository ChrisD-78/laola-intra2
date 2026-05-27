-- Reinigungswoche / Bautagebuch: ein gemeinsamer JSON-Status für alle Kalenderwochen
-- In Neon SQL Editor ausführen (einmalig).

CREATE TABLE IF NOT EXISTS reinigungswoche_board (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  data_json TEXT NOT NULL DEFAULT '{"weeks":{}}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO reinigungswoche_board (id, data_json)
VALUES ('singleton', '{"weeks":{}}')
ON CONFLICT (id) DO NOTHING;
