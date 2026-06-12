import { NextRequest, NextResponse } from 'next/server'
import { completeAnthropic } from '@/lib/anthropicMessages'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const MAX_BYTES = 50 * 1024 * 1024
const CATEGORIES = ['Sicherheit', 'Betrieb', 'Verwaltung', 'Technik'] as const

type Suggestion = {
  title: string
  description: string
  category: (typeof CATEGORIES)[number]
  tags: string[]
}

function parseSuggestion(raw: string): Suggestion | null {
  const cleaned = raw.replace(/```(?:json)?/gi, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>
    const category = CATEGORIES.includes(parsed.category as Suggestion['category'])
      ? (parsed.category as Suggestion['category'])
      : 'Betrieb'
    return {
      title: String(parsed.title || '').trim().slice(0, 120),
      description: String(parsed.description || '').trim().slice(0, 600),
      category,
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean).slice(0, 8)
        : [],
    }
  } catch {
    return null
  }
}

/** PDF lesen und Titel, Beschreibung, Kategorie und Tags vorschlagen. */
export async function POST(request: NextRequest) {
  try {
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json({ error: 'Ungültige Formulardaten' }, { status: 400 })
    }

    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Keine Datei übermittelt.' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Datei zu groß (max. 50 MB).' }, { status: 413 })
    }
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      return NextResponse.json(
        { error: 'KI-Analyse ist nur für PDF-Dateien möglich.' },
        { status: 400 },
      )
    }

    const data = new Uint8Array(await file.arrayBuffer())
    const { PDFParse } = await import('pdf-parse')
    const parser = new PDFParse({ data })
    const result = await parser.getText()
    const text = (result.text || '').replace(/\s+/g, ' ').trim().slice(0, 15_000)

    if (!text) {
      return NextResponse.json(
        { error: 'Im PDF wurde kein Text gefunden (z. B. gescanntes Dokument). Bitte Felder manuell ausfüllen.' },
        { status: 422 },
      )
    }

    const system = `Du katalogisierst interne Dokumente für das Intranet der Stadtholding Landau / Freizeitbad LA OLA.

Antworte AUSSCHLIESSLICH mit einem JSON-Objekt, ohne Erklärungen und ohne Markdown:
{"title": "...", "description": "...", "category": "...", "tags": ["...", "..."]}

Regeln:
- title: prägnanter deutscher Dokumenttitel (max. 8 Wörter), KEINE Dateiendungen. Jahreszahl übernehmen, falls im Dokument genannt.
- description: 1–2 Sätze, was das Dokument enthält und wofür es gebraucht wird.
- category: genau eine von: Sicherheit, Betrieb, Verwaltung, Technik.
- tags: 3–6 kleingeschriebene deutsche Schlagworte für die Suche.`

    const raw = await completeAnthropic({
      system,
      messages: [
        {
          role: 'user',
          content: `Dateiname: ${file.name}\n\nDokumentinhalt (Auszug):\n---\n${text}\n---`,
        },
      ],
      max_tokens: 500,
    })

    const suggestion = parseSuggestion(raw)
    if (!suggestion || !suggestion.title) {
      return NextResponse.json(
        { error: 'KI-Vorschlag konnte nicht erstellt werden. Bitte Felder manuell ausfüllen.' },
        { status: 502 },
      )
    }

    return NextResponse.json(suggestion)
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Interner Serverfehler'
    if (err.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json({ error: err }, { status: 503 })
    }
    console.error('POST /api/agent/analyze-document', e)
    return NextResponse.json({ error: err }, { status: 500 })
  }
}
