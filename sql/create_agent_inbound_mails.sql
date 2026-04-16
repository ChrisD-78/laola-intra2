-- Eingehende E-Mails für den KI-Agenten (IMAP → Neon)
-- Einmalig im Neon SQL Editor ausführen (oder in all_sql_migrations ergänzen).

CREATE TABLE IF NOT EXISTS agent_inbound_mails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfc_message_id TEXT NOT NULL UNIQUE,
  from_name TEXT,
  from_email TEXT,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  ai_reply_draft TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_inbound_mails_received
  ON agent_inbound_mails (received_at DESC);

COMMENT ON TABLE agent_inbound_mails IS 'Per IMAP abgerufene Mails für Agent E-Mail-Assistent';
