import { NextRequest, NextResponse } from 'next/server'
import { completeAnthropic } from '@/lib/anthropicMessages'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export type ExtractedTask = {
  title: string
  description: string
  assigned_to: string
  due_date: string
  priority: 'Kritisch' | 'Hoch' | 'Mittel' | 'Niedrig'
}

const PRIORITIES = new Set(['Kritisch', 'Hoch', 'Mittel', 'Niedrig'])

/** JSON aus der KI-Antwort robust herauslösen (auch wenn Text drumherum steht). */
function parseTasksJson(raw: string): ExtractedTask[] {
  const cleaned = raw.replace(/```(?:json)?/gi, '').trim()
  const start = cleaned.indexOf('[')
  const end = cleaned.lastIndexOf(']')
  if (start === -1 || end === -1 || end <= start) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned.slice(start, end + 1))
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []
  return parsed
    .filter((t): t is Record<string, unknown> => Boolean(t) && typeof t === 'object')
    .map((t) => ({
      title: String(t.title || '').trim().slice(0, 255),
      description: String(t.description || '').trim().slice(0, 2000),
      assigned_to: String(t.assigned_to || '').trim().slice(0, 255) || 'Nicht zugewiesen',
      due_date: /^\d{4}-\d{2}-\d{2}$/.test(String(t.due_date || '')) ? String(t.due_date) : '',
      priority: (PRIORITIES.has(String(t.priority)) ? String(t.priority) : 'Mittel') as ExtractedTask['priority'],
    }))
    .filter((t) => t.title.length > 2)
    .slice(0, 20)
}

/** Aufgaben mit Verantwortlichem und Frist aus einem Besprechungsprotokoll extrahieren. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const protocolText = typeof body.protocolText === 'string' ? body.protocolText.trim().slice(0, 30_000) : ''
    const meetingDate = typeof body.meetingDate === 'string' ? body.meetingDate.trim().slice(0, 20) : ''
    const participants = typeof body.participants === 'string' ? body.participants.trim().slice(0, 500) : ''

    if (!protocolText) {
      return NextResponse.json({ error: 'Kein Protokolltext übermittelt.' }, { status: 400 })
    }

    const system = `Du extrahierst Aufgaben (Action Items) aus Besprechungsprotokollen der Stadtholding Landau / Freizeitbad LA OLA.

Antworte AUSSCHLIESSLICH mit einem JSON-Array, ohne Erklärungen und ohne Markdown. Format:
[{"title": "...", "description": "...", "assigned_to": "...", "due_date": "YYYY-MM-DD", "priority": "Kritisch|Hoch|Mittel|Niedrig"}]

Regeln:
- Nimm nur Aufgaben auf, die wirklich im Protokoll stehen oder eindeutig beschlossen wurden. Erfinde nichts.
- title: kurz und handlungsorientiert (max. 10 Wörter). description: 1–2 Sätze Kontext aus dem Protokoll.
- assigned_to: Name der verantwortlichen Person aus dem Protokoll. Wenn niemand genannt ist: "Nicht zugewiesen".
- due_date: Frist aus dem Protokoll als YYYY-MM-DD. Relative Angaben ("bis nächste Woche") anhand des Besprechungsdatums umrechnen. Ohne Frist: Besprechungsdatum + 14 Tage.
- priority: aus Dringlichkeit im Protokoll ableiten, im Zweifel "Mittel".
- Keine Aufgaben gefunden: leeres Array [].`

    const userMsg = `Besprechungsdatum: ${meetingDate || 'unbekannt'}
Teilnehmer: ${participants || 'unbekannt'}

Protokoll:
---
${protocolText}
---`

    const raw = await completeAnthropic({
      system,
      messages: [{ role: 'user', content: userMsg }],
      max_tokens: 2000,
    })

    const tasks = parseTasksJson(raw)

    // Fallback-Frist: Besprechungsdatum + 14 Tage
    const base = /^\d{4}-\d{2}-\d{2}$/.test(meetingDate) ? new Date(meetingDate) : new Date()
    const fallback = new Date(base)
    fallback.setDate(fallback.getDate() + 14)
    const fallbackDue = fallback.toISOString().split('T')[0]
    for (const t of tasks) {
      if (!t.due_date) t.due_date = fallbackDue
    }

    return NextResponse.json({ tasks })
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Interner Serverfehler'
    if (err.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json({ error: err }, { status: 503 })
    }
    console.error('POST /api/agent/protocol-tasks', e)
    return NextResponse.json({ error: err }, { status: 500 })
  }
}
