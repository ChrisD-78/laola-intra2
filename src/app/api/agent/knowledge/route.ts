import { NextRequest, NextResponse } from 'next/server'
import { completeAnthropic, type AnthropicChatMessage } from '@/lib/anthropicMessages'
import {
  buildDocumentIndex,
  buildKnowledgeContext,
  KNOWLEDGE_SYSTEM_PROMPT,
  selectRelevantDocuments,
} from '@/lib/agentDocumentKnowledge'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

/** PDF-Dokumente aus „Dokumente“ für die Wissensdatenbank. */
export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin
    const docs = await buildDocumentIndex(origin)
    return NextResponse.json({
      documents: docs.map((d) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        fileName: d.fileName,
      })),
      count: docs.length,
    })
  } catch (e) {
    console.error('GET /api/agent/knowledge', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Dokumente konnten nicht geladen werden' },
      { status: 500 },
    )
  }
}

/** Wissens-Chat: Antwort aus PDF-Inhalten mit Quellenangabe. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    const history = Array.isArray(body.history) ? body.history : []

    if (!message) {
      return NextResponse.json({ error: 'Keine Frage übermittelt.' }, { status: 400 })
    }

    const origin = request.nextUrl.origin
    const index = await buildDocumentIndex(origin)

    if (index.length === 0) {
      return NextResponse.json({
        text: 'Es sind noch keine PDF-Dokumente mit lesbarem Text im Bereich „Dokumente“ verfügbar. Bitte laden Sie zuerst PDFs unter Dokumente hoch.',
        sources: [],
        documentCount: 0,
      })
    }

    const relevant = selectRelevantDocuments(index, message)
    const context = buildKnowledgeContext(relevant)
    const system = `${KNOWLEDGE_SYSTEM_PROMPT}\n\n### Dokumentenauszüge\n${context}`

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
      max_tokens: 1200,
    })

    return NextResponse.json({
      text,
      sources: relevant.map((d) => d.title),
      documentCount: index.length,
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
