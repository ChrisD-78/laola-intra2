import { NextRequest, NextResponse } from 'next/server'
import { completeAnthropic, type AnthropicChatMessage } from '@/lib/anthropicMessages'
import { logAgentEvent } from '@/lib/agentUsage'
import {
  buildKnowledgeContext,
  KNOWLEDGE_SYSTEM_PROMPT,
  listPdfDocuments,
  loadKnowledgeForQuery,
  resolveDocumentFileUrl,
  warmDocumentIndex,
} from '@/lib/agentDocumentKnowledge'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

/**
 * GET: PDF-Dokumente aus „Dokumente“ (nur Metadaten, schnell).
 * GET ?warm=1: indexiert zusätzlich bis zu 2 noch nicht gecachte PDFs
 * (Frontend ruft das wiederholt auf, bis remaining = 0).
 */
export async function GET(request: NextRequest) {
  try {
    if (request.nextUrl.searchParams.get('warm')) {
      const result = await warmDocumentIndex(request.nextUrl.origin)
      return NextResponse.json(result)
    }

    const documents = await listPdfDocuments()
    return NextResponse.json({
      documents: documents.map((d) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        fileName: d.fileName,
      })),
      count: documents.length,
    })
  } catch (e) {
    console.error('GET /api/agent/knowledge', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Dokumente konnten nicht geladen werden' },
      { status: 500 },
    )
  }
}

/** Wissens-Chat: Antwort aus PDF-Inhalten mit Quellenangabe (Titel + Seite). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    const history = Array.isArray(body.history) ? body.history : []
    const userName = typeof body.userName === 'string' ? body.userName.trim().slice(0, 100) : ''
    const firstName = userName.split(/\s+/)[0] || ''

    if (!message) {
      return NextResponse.json({ error: 'Keine Frage übermittelt.' }, { status: 400 })
    }

    const origin = request.nextUrl.origin
    const { chunks, loadedDocs, skippedDocs, totalDocs } = await loadKnowledgeForQuery(
      message,
      origin,
    )

    if (totalDocs === 0) {
      return NextResponse.json({
        text: 'Es sind noch keine PDF-Dokumente im Bereich „Dokumente“ verfügbar. Bitte laden Sie zuerst PDFs unter Dokumente hoch.',
        sources: [],
        documentCount: 0,
      })
    }

    if (chunks.length === 0) {
      return NextResponse.json({
        text: `Es wurden ${totalDocs} PDF(s) gefunden, aber der Text konnte (noch) nicht gelesen werden – z. B. gescanntes PDF ohne Textschicht oder die Indexierung läuft noch. Bitte versuchen Sie es in einem Moment erneut oder prüfen Sie die Dateien unter Dokumente.`,
        sources: [],
        documentCount: totalDocs,
      })
    }

    const { context, sources } = buildKnowledgeContext(chunks)

    let system = KNOWLEDGE_SYSTEM_PROMPT
    if (firstName) {
      system += `\n\n### Ansprache\nDie angemeldete Mitarbeiterin / der angemeldete Mitarbeiter heißt ${firstName}. Sprich sie/ihn mit dem Vornamen „${firstName}“ und in der Du-Form an (z. B. „Hallo ${firstName}, …“ oder „${firstName}, dabei musst du …“). Nutze den Namen natürlich und nicht in jedem Satz.`
    }
    system += `\n\n### Dokumentenauszüge\n${context}`
    if (skippedDocs.length > 0) {
      system += `\n\n### Hinweis\nFolgende Dokumente konnten in dieser Anfrage noch nicht gelesen werden: ${skippedDocs
        .map((d) => d.title)
        .join(', ')}. Falls die Antwort dort vermutet wird, weise den Nutzer darauf hin, die Frage gleich noch einmal zu stellen.`
    }

    const sanitizedHistory: AnthropicChatMessage[] = history
      .filter(
        (m: unknown) =>
          m &&
          typeof m === 'object' &&
          ((m as AnthropicChatMessage).role === 'user' ||
            (m as AnthropicChatMessage).role === 'assistant') &&
          typeof (m as AnthropicChatMessage).content === 'string',
      )
      .slice(-8)
      .map((m: AnthropicChatMessage) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content.slice(0, 4000),
      }))

    const text = await completeAnthropic({
      system,
      messages: [...sanitizedHistory, { role: 'user', content: message }],
      max_tokens: 1500,
    })

    await logAgentEvent('chat')

    return NextResponse.json({
      text,
      sources: sources.map((s) => ({
        title: s.title,
        pages: s.pages,
        url: resolveDocumentFileUrl(s.fileUrl, origin),
      })),
      documentCount: totalDocs,
      usedDocuments: loadedDocs.map((d) => d.title),
      skippedDocuments: skippedDocs.map((d) => d.title),
    })
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Interner Serverfehler'
    if (err.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json({ error: err }, { status: 503 })
    }
    console.error('POST /api/agent/knowledge', e)
    return NextResponse.json({ error: err }, { status: 500 })
  }
}
