import { NextRequest, NextResponse } from 'next/server'

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

/**
 * Serverseitiger Proxy zu Anthropic (API-Key nie im Browser).
 * Benötigt ANTHROPIC_API_KEY in der Umgebung.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'KI ist nicht konfiguriert. Bitte ANTHROPIC_API_KEY in der Server-Umgebung (z. B. .env.local) setzen.',
        },
        { status: 503 },
      )
    }

    const body = await request.json()
    const system = typeof body.system === 'string' ? body.system : ''
    const messages = Array.isArray(body.messages) ? body.messages : []
    const max_tokens =
      typeof body.max_tokens === 'number' && body.max_tokens > 0
        ? Math.min(body.max_tokens, 8192)
        : 1024
    const model =
      typeof body.model === 'string' && body.model.trim()
        ? body.model.trim()
        : process.env.AGENT_ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'

    const sanitized: ChatMessage[] = messages
      .filter(
        (m: unknown) =>
          m &&
          typeof m === 'object' &&
          (m as ChatMessage).role &&
          typeof (m as ChatMessage).content === 'string',
      )
      .map((m: ChatMessage) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content.slice(0, 200_000),
      }))

    if (sanitized.length === 0) {
      return NextResponse.json({ error: 'Keine gültigen Nachrichten übermittelt.' }, { status: 400 })
    }

    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens,
        system: system.slice(0, 200_000),
        messages: sanitized,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      const msg =
        data?.error?.message ||
        (typeof data?.error === 'string' ? data.error : null) ||
        'Anthropic API-Fehler'
      return NextResponse.json({ error: msg }, { status: res.status >= 400 ? res.status : 502 })
    }

    const block = data.content?.find((c: { type?: string }) => c.type === 'text')
    const text = block?.text ?? ''
    return NextResponse.json({ text })
  } catch (e) {
    console.error('POST /api/agent/message', e)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
