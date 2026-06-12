import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { completeAnthropic } from '@/lib/anthropicMessages'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

type ShiftAssignment = { employeeId?: string; employeeName?: string }

function berlinToday(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' })
}

function berlinDateLabel(): string {
  return new Date().toLocaleDateString('de-DE', {
    timeZone: 'Europe/Berlin',
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Daten aus den Modulen einsammeln und als kompakte Faktenliste aufbereiten. */
async function collectFacts(): Promise<string> {
  const sql = neon(process.env.DATABASE_URL!)
  const today = berlinToday()
  const parts: string[] = []

  // Offene Aufgaben (überfällig / heute / nächste 7 Tage)
  try {
    const tasks = (await sql`
      SELECT title, assigned_to, due_date, priority, status
      FROM tasks
      WHERE status NOT IN ('Erledigt', 'Abgeschlossen')
      ORDER BY due_date ASC
      LIMIT 40
    `) as { title: string; assigned_to: string; due_date: string; priority: string; status: string }[]
    const overdue = tasks.filter((t) => t.due_date && t.due_date < today)
    const dueToday = tasks.filter((t) => t.due_date === today)
    const soon = tasks.filter((t) => t.due_date > today).slice(0, 8)
    parts.push(
      `OFFENE AUFGABEN (${tasks.length} gesamt):`,
      overdue.length
        ? `Überfällig: ${overdue.map((t) => `„${t.title}“ (${t.assigned_to}, fällig ${t.due_date}, ${t.priority})`).join('; ')}`
        : 'Überfällig: keine',
      dueToday.length
        ? `Heute fällig: ${dueToday.map((t) => `„${t.title}“ (${t.assigned_to}, ${t.priority})`).join('; ')}`
        : 'Heute fällig: keine',
      soon.length
        ? `Demnächst: ${soon.map((t) => `„${t.title}“ (${t.assigned_to}, ${t.due_date})`).join('; ')}`
        : '',
    )
  } catch {
    parts.push('OFFENE AUFGABEN: nicht verfügbar')
  }

  // Heutige Schichtbesetzung
  try {
    const [schedule] = (await sql`
      SELECT shifts, special_status FROM schichtplan_schedules WHERE date = ${today}::date LIMIT 1
    `) as { shifts: Record<string, Record<string, ShiftAssignment[]>>; special_status: Record<string, string> | null }[]
    if (schedule?.shifts) {
      const lines: string[] = []
      for (const [area, shifts] of Object.entries(schedule.shifts)) {
        const areaParts: string[] = []
        for (const [shiftName, people] of Object.entries(shifts)) {
          const names = (people || []).map((p) => p.employeeName).filter(Boolean)
          if (names.length) areaParts.push(`${shiftName}: ${names.join(', ')}`)
        }
        if (areaParts.length) lines.push(`${area} – ${areaParts.join(' | ')}`)
      }
      parts.push(`HEUTIGE SCHICHTBESETZUNG:\n${lines.join('\n') || 'keine Einträge'}`)
      const special = Object.values(schedule.special_status || {})
      if (special.length) {
        parts.push(`Abwesenheiten heute: ${special.length} (${[...new Set(special)].join(', ')})`)
      }
    } else {
      parts.push('HEUTIGE SCHICHTBESETZUNG: kein Tagesplan hinterlegt')
    }
  } catch {
    parts.push('HEUTIGE SCHICHTBESETZUNG: nicht verfügbar')
  }

  // Offene Urlaubsanträge
  try {
    const vacations = (await sql`
      SELECT employee_name, start_date, end_date, type
      FROM schichtplan_vacation_requests
      WHERE status = 'pending'
      ORDER BY requested_at ASC
      LIMIT 10
    `) as { employee_name: string; start_date: string; end_date: string; type: string }[]
    parts.push(
      vacations.length
        ? `OFFENE URLAUBSANTRÄGE: ${vacations.map((v) => `${v.employee_name} (${v.type} ${v.start_date} bis ${v.end_date})`).join('; ')}`
        : 'OFFENE URLAUBSANTRÄGE: keine',
    )
  } catch {
    /* Modul optional */
  }

  // Neue Pinnwand-Einträge (48 h)
  try {
    const pinnwand = (await sql`
      SELECT title, category, created_by FROM chat_pinnwand_entries
      WHERE created_at > NOW() - INTERVAL '48 hours'
      ORDER BY created_at DESC LIMIT 10
    `) as { title: string; category: string; created_by: string }[]
    parts.push(
      pinnwand.length
        ? `NEUE PINNWAND-EINTRÄGE (48 h): ${pinnwand.map((p) => `„${p.title}“ (${p.category}, von ${p.created_by})`).join('; ')}`
        : 'NEUE PINNWAND-EINTRÄGE (48 h): keine',
    )
  } catch {
    /* Modul optional */
  }

  // Neue Dokumente (48 h)
  try {
    const docs = (await sql`
      SELECT title, category FROM documents
      WHERE uploaded_at > NOW() - INTERVAL '48 hours'
      ORDER BY uploaded_at DESC LIMIT 10
    `) as { title: string; category: string }[]
    parts.push(
      docs.length
        ? `NEUE DOKUMENTE (48 h): ${docs.map((d) => `„${d.title}“ (${d.category})`).join('; ')}`
        : 'NEUE DOKUMENTE (48 h): keine',
    )
  } catch {
    /* Modul optional */
  }

  return parts.filter(Boolean).join('\n\n')
}

/** Briefing generieren und zurückgeben (nur Anzeige im Agent – keine Veröffentlichung). */
async function createBriefing(): Promise<{ title: string; content: string }> {
  const facts = await collectFacts()
  const dateLabel = berlinDateLabel()

  const system = `Du schreibst das tägliche Morgen-Briefing für die Leitung des Freizeitbads LA OLA (Stadtholding Landau).

Regeln:
- Deutsch, Du-Form, freundlich-knapp. Reiner Text, KEINE Markdown-Zeichen (kein **, kein #). Emojis als Abschnittsmarker sind erwünscht.
- Struktur: 1 Begrüßungssatz mit dem Wichtigsten des Tages, dann kurze Abschnitte: ✅ Aufgaben (überfällige zuerst!), 👥 Schichtbesetzung heute, 🏖️ Urlaubsanträge, 📌 Pinnwand, 📄 Dokumente.
- Nur Abschnitte aufnehmen, zu denen es etwas zu sagen gibt. Leere Bereiche in einem Sammelsatz abhaken.
- Maximal ~180 Wörter. Keine Fakten erfinden – nutze nur die gelieferten Daten.`

  const content = await completeAnthropic({
    system,
    messages: [{ role: 'user', content: `Heute ist ${dateLabel}. Hier die Daten aus dem Intranet:\n\n${facts}` }],
    max_tokens: 800,
  })

  return { title: `🤖 KI-Briefing – ${dateLabel}`, content: content.trim() }
}

/** POST: Briefing jetzt erstellen (Button im Agent-Dashboard). */
export async function POST() {
  try {
    const briefing = await createBriefing()
    return NextResponse.json(briefing)
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Interner Serverfehler'
    if (err.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json({ error: err }, { status: 503 })
    }
    console.error('POST /api/agent/briefing', e)
    return NextResponse.json({ error: err }, { status: 500 })
  }
}
