import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { completeAnthropic } from '@/lib/anthropicMessages'
import { fetchUnseenInboundMails } from '@/lib/agentInboxImap'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return out === 0
}

function authorize(request: NextRequest): boolean {
  const secret = process.env.AGENT_INBOX_CRON_SECRET
  if (!secret) return false
  const auth = request.headers.get('authorization') || ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (bearer && timingSafeEqual(bearer, secret)) return true
  const token = request.nextUrl.searchParams.get('token')
  if (token && timingSafeEqual(token, secret)) return true
  return false
}

async function draftReplyForMail(body: {
  fromName: string
  fromEmail: string
  subject: string
  bodyText: string
}): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null

  const signer = process.env.AGENT_MAIL_SIGNER_NAME || 'LA OLA Intranet'
  const systemPrompt = `Du bist der KI-E-Mail-Assistent von ${signer} (Bäderbook / LA OLA Landau).
Schreibe eine professionelle, freundliche Antwort auf Deutsch auf die eingegangene E-Mail.
Halte die Antwort konkret und praxistauglich. Signiere mit: "Mit freundlichen Grüßen\n${signer}\nLA OLA Landau"
Gib NUR den Antworttext zurück, keine Erklärungen davor oder danach.`

  const userMsg = `Eingehende E-Mail von ${body.fromName} (${body.fromEmail}):
Betreff: ${body.subject}
Inhalt: ${body.bodyText}

Bitte schreibe eine passende Antwort.`

  try {
    return await completeAnthropic({
      system: systemPrompt,
      messages: [{ role: 'user', content: userMsg }],
      max_tokens: 600,
    })
  } catch (e) {
    console.error('agent inbox anthropic', e)
    return null
  }
}

/**
 * Ruft IMAP ab, speichert neue Mails in Neon, optional KI-Antwortentwurf.
 * Absicherung: Header Authorization: Bearer AGENT_INBOX_CRON_SECRET oder ?token= (GET-Scheduler).
 *
 * Outlook → Gmail: Regel „Weiterleiten an“ die gleiche Adresse wie EMAIL_USER; Abruf per Gmail-IMAP.
 */
async function runInboxSync(): Promise<NextResponse> {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    return NextResponse.json({ error: 'DATABASE_URL fehlt' }, { status: 500 })
  }

  let fetched
  try {
    fetched = await fetchUnseenInboundMails(15)
  } catch (e) {
    console.error('agent inbox IMAP', e)
    const msg = e instanceof Error ? e.message : 'IMAP-Fehler'
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  const sql = neon(dbUrl)
  let imported = 0
  let skipped = 0

  for (const mail of fetched) {
    const rows = await sql`
      INSERT INTO agent_inbound_mails (
        rfc_message_id,
        from_name,
        from_email,
        subject,
        body_text,
        body_html,
        received_at
      ) VALUES (
        ${mail.rfcMessageId},
        ${mail.fromName},
        ${mail.fromEmail},
        ${mail.subject},
        ${mail.bodyText},
        ${mail.bodyHtml || null},
        ${mail.receivedAt.toISOString()}
      )
      ON CONFLICT (rfc_message_id) DO NOTHING
      RETURNING id
    `

    const row = rows[0] as { id: string } | undefined
    if (!row) {
      skipped++
      continue
    }
    imported++

    const draft = await draftReplyForMail({
      fromName: mail.fromName,
      fromEmail: mail.fromEmail,
      subject: mail.subject,
      bodyText: mail.bodyText,
    })

    if (draft) {
      await sql`
        UPDATE agent_inbound_mails
        SET ai_reply_draft = ${draft}
        WHERE id = ${row.id}
      `
    }
  }

  return NextResponse.json({
    ok: true,
    fetched: fetched.length,
    imported,
    skippedDuplicates: skipped,
  })
}

export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }
  return runInboxSync()
}

/** Für einfache Cron-Dienste (GET mit ?token=…); lieber POST + Bearer nutzen. */
export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }
  return runInboxSync()
}
