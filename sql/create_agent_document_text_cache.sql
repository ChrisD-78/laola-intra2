-- Persistenter Text-Cache für den Wissens-Chatbot (Agent).
-- Wird vom Server automatisch angelegt (CREATE TABLE IF NOT EXISTS),
-- diese Datei dient nur der Dokumentation.
--
-- Pro PDF aus „Dokumente" wird der extrahierte Text seitenweise als JSONB
-- gespeichert, damit Chat-Anfragen nicht bei jedem Aufruf alle PDFs neu
-- herunterladen und parsen müssen (Serverless-Timeout-Problem).

CREATE TABLE IF NOT EXISTS agent_document_text_cache (
  document_id UUID PRIMARY KEY,
  file_url TEXT NOT NULL,
  pages JSONB NOT NULL,
  extracted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
