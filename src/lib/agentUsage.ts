import { neon } from '@neondatabase/serverless'

export type AgentEventType = 'chat' | 'protocol' | 'marketing'

let tableReady = false

async function ensureTable() {
  if (tableReady) return
  const sql = neon(process.env.DATABASE_URL!)
  await sql`
    CREATE TABLE IF NOT EXISTS agent_usage_events (
      id BIGSERIAL PRIMARY KEY,
      event_type TEXT NOT NULL,
      detail TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  // Bestandstabellen aus früherer Version um die Detail-Spalte ergänzen
  await sql`ALTER TABLE agent_usage_events ADD COLUMN IF NOT EXISTS detail TEXT`
  tableReady = true
}

/**
 * Nutzung des Agenten zählen (Dashboard-Statistik und Aktivitätenliste).
 * Fehler werden geschluckt – die Statistik darf nie eine KI-Antwort blockieren.
 */
export async function logAgentEvent(type: AgentEventType, detail?: string): Promise<void> {
  try {
    if (!process.env.DATABASE_URL) return
    await ensureTable()
    const sql = neon(process.env.DATABASE_URL)
    const cleanDetail = (detail || '').replace(/\s+/g, ' ').trim().slice(0, 160) || null
    await sql`INSERT INTO agent_usage_events (event_type, detail) VALUES (${type}, ${cleanDetail})`
  } catch (e) {
    console.error('agent usage: Ereignis konnte nicht gezählt werden', e)
  }
}

export type AgentActivity = {
  type: AgentEventType
  detail: string | null
  createdAt: string
}

export type AgentStats = {
  chatToday: number
  protocolsTotal: number
  marketingTotal: number
  pdfsIndexed: number
  pdfsTotal: number
  activities: AgentActivity[]
}

/** Echte Kennzahlen und letzte Aktivitäten für das Agent-Dashboard. */
export async function getAgentStats(): Promise<AgentStats> {
  const sql = neon(process.env.DATABASE_URL!)
  await ensureTable()

  const [counts] = (await sql`
    SELECT
      COUNT(*) FILTER (
        WHERE event_type = 'chat'
        AND (created_at AT TIME ZONE 'Europe/Berlin')::date = (NOW() AT TIME ZONE 'Europe/Berlin')::date
      ) AS chat_today,
      COUNT(*) FILTER (WHERE event_type = 'protocol') AS protocols_total,
      COUNT(*) FILTER (WHERE event_type = 'marketing') AS marketing_total
    FROM agent_usage_events
  `) as [{ chat_today: string; protocols_total: string; marketing_total: string }]

  const activityRows = (await sql`
    SELECT event_type, detail, created_at
    FROM agent_usage_events
    ORDER BY created_at DESC
    LIMIT 6
  `) as { event_type: AgentEventType; detail: string | null; created_at: string }[]

  let pdfsIndexed = 0
  let pdfsTotal = 0
  try {
    const [pdf] = (await sql`
      SELECT
        (SELECT COUNT(*) FROM documents d
          WHERE d.file_url IS NOT NULL
          AND (LOWER(d.file_type) LIKE '%pdf%' OR LOWER(d.file_name) LIKE '%.pdf')) AS pdfs_total,
        (SELECT COUNT(*) FROM agent_document_text_cache c
          WHERE EXISTS (SELECT 1 FROM documents d WHERE d.id = c.document_id)) AS pdfs_indexed
    `) as [{ pdfs_total: string; pdfs_indexed: string }]
    pdfsTotal = Number(pdf.pdfs_total) || 0
    pdfsIndexed = Number(pdf.pdfs_indexed) || 0
  } catch {
    // Text-Cache-Tabelle existiert ggf. noch nicht (erste Nutzung)
  }

  return {
    chatToday: Number(counts.chat_today) || 0,
    protocolsTotal: Number(counts.protocols_total) || 0,
    marketingTotal: Number(counts.marketing_total) || 0,
    pdfsIndexed,
    pdfsTotal,
    activities: activityRows.map((row) => ({
      type: row.event_type,
      detail: row.detail,
      createdAt: new Date(row.created_at).toISOString(),
    })),
  }
}
