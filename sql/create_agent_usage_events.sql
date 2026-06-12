-- Nutzungszähler für das Agent-Dashboard (Chat / Protokoll / Marketing).
-- Wird vom Server automatisch angelegt (CREATE TABLE IF NOT EXISTS),
-- diese Datei dient nur der Dokumentation.

CREATE TABLE IF NOT EXISTS agent_usage_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'chat' | 'protocol' | 'marketing'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
