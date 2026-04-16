import { NextRequest, NextResponse } from 'next/server'
import { completeAnthropic, type AnthropicChatMessage } from '@/lib/anthropicMessages'

/**
 * Serverseitiger Proxy zu Anthropic (API-Key nie im Browser).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const system = typeof body.system === 'string' ? body.system : ''
    const messages = Array.isArray(body.messages) ? body.messages : []
    const max_tokens =
      typeof body.max_tokens === 'number' && body.max_tokens > 0
        ? Math.min(body.max_tokens, 8192)
        : 1024
    const model =
      typeof body.model === 'string' && body.model.trim() ? body.model.trim() : undefined

    const sanitized: AnthropicChatMessage[] = messages
      .filter(
        (m: unknown) =>
          m &&
          typeof m === 'object' &&
          (m as AnthropicChatMessage).role &&
          typeof (m as AnthropicChatMessage).content === 'string',
      )
      .map((m: AnthropicChatMessage) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content.slice(0, 200_000),
      }))

    if (sanitized.length === 0) {
      return NextResponse.json({ error: 'Keine gültigen Nachrichten übermittelt.' }, { status: 400 })
    }

    const text = await completeAnthropic({
      system,
      messages: sanitized,
      max_tokens,
      model,
    })
    return NextResponse.json({ text })
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Interner Serverfehler'
    if (err.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        {
          error:
            'KI ist nicht konfiguriert. Bitte ANTHROPIC_API_KEY in der Server-Umgebung (z. B. .env.local) setzen.',
        },
        { status: 503 },
      )
    }
    console.error('POST /api/agent/message', e)
    return NextResponse.json({ error: err }, { status: 500 })
  }
}
