-- LA OLA Sauna · Aufgussplan (JSON wie admin.html Version 2)
-- Einmalig im Neon SQL Editor ausführen (gleiche Datenbank wie Intranet, DATABASE_URL).
-- Frontend: /agent/sauna (Admin) · Öffentliche Anzeige /sauna/display.html · /sauna/gaeste.html

CREATE TABLE IF NOT EXISTS sauna_aufguss_snapshot (
  id INTEGER PRIMARY KEY DEFAULT 1 CONSTRAINT sauna_aufguss_single_row CHECK (id = 1),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE sauna_aufguss_snapshot IS 'Sauna Aufgussplan v2: schedules, events, saunas, adSlots (siehe public/sauna/README.md)';

-- Kein Pflicht-Default-Inhalt: Admin speichert den ersten Snapshot per PUT /api/sauna/snapshot
