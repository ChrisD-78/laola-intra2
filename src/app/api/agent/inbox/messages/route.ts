import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Liste der per IMAP gespeicherten Agent-Mails (neueste zuerst).
 * Hinweis: wie andere interne APIs ohne Session-Schutz – Zugriff nur über eingeloggtes Intranet vorgesehen.
 */
export async function GET() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    return NextResponse.json({ error: 'DATABASE_URL fehlt' }, { status: 500 })
  }

  try {
    const sql = neon(dbUrl)
    const rows = await sql`
      SELECT
        id::text AS id,
        rfc_message_id,
        from_name,
        from_email,
        subject,
        body_text,
        received_at,
        ai_reply_draft
      FROM agent_inbound_mails
      ORDER BY received_at DESC
      LIMIT 100
    `
    return NextResponse.json({ messages: rows })
  } catch (e) {
    console.error('GET /api/agent/inbox/messages', e)
    const msg =
      e && typeof e === 'object' && 'message' in e
        ? String((e as { message: string }).message)
        : 'Abfrage fehlgeschlagen'
    if (msg.includes('does not exist') || msg.includes('relation') || msg.includes('agent_inbound')) {
      return NextResponse.json(
        {
          error:
            'Tabelle agent_inbound_mails fehlt. Bitte sql/create_agent_inbound_mails.sql in Neon ausführen.',
          messages: [],
        },
        { status: 503 },
      )
    }
    return NextResponse.json({ error: msg, messages: [] }, { status: 500 })
  }
}
