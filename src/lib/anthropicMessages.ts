const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'

export type AnthropicChatMessage = { role: 'user' | 'assistant'; content: string }

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Bei Überlastung (529), Rate-Limit (429) oder Serverfehlern lohnt ein erneuter Versuch. */
function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 529 || (status >= 500 && status < 600)
}

function friendlyError(status: number, raw: string): string {
  if (status === 529 || /overloaded/i.test(raw)) {
    return 'Die KI ist gerade überlastet (Anthropic-Server). Bitte versuchen Sie es in einem Moment erneut.'
  }
  if (status === 429) {
    return 'Zu viele Anfragen in kurzer Zeit (Rate-Limit). Bitte kurz warten und erneut versuchen.'
  }
  if (status === 401 || status === 403) {
    return 'Der Claude API-Schlüssel ist ungültig oder abgelaufen. Bitte ANTHROPIC_API_KEY in Netlify prüfen.'
  }
  if (status >= 500) {
    return `Anthropic-Serverfehler (${status}). Bitte erneut versuchen.${raw ? ` Details: ${raw}` : ''}`
  }
  return raw || 'Anthropic API-Fehler'
}

/**
 * Server-only: ruft die Anthropic Messages API auf.
 * Bei Überlastung/Serverfehlern wird automatisch bis zu 3× mit Backoff wiederholt.
 */
export async function completeAnthropic(options: {
  system: string
  messages: AnthropicChatMessage[]
  max_tokens?: number
  model?: string
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY fehlt. Bitte in Netlify unter Site configuration → Environment variables setzen und neu deployen.',
    )
  }

  const max_tokens =
    typeof options.max_tokens === 'number' && options.max_tokens > 0
      ? Math.min(options.max_tokens, 8192)
      : 1024

  const model =
    options.model?.trim() ||
    process.env.AGENT_ANTHROPIC_MODEL ||
    'claude-sonnet-4-20250514'

  const sanitized: AnthropicChatMessage[] = options.messages
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string',
    )
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content.slice(0, 200_000),
    }))

  const body = JSON.stringify({
    model,
    max_tokens,
    system: options.system.slice(0, 200_000),
    messages: sanitized,
  })

  const maxAttempts = 3
  const backoffMs = [1000, 2500]
  let lastError = new Error('Anthropic API-Fehler')

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let res: Response
    try {
      res = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body,
      })
    } catch (e) {
      // Netzwerkfehler: erneut versuchen
      lastError = new Error('Verbindung zur Anthropic API fehlgeschlagen. Bitte erneut versuchen.')
      if (attempt < maxAttempts - 1) {
        await sleep(backoffMs[attempt])
        continue
      }
      throw lastError
    }

    const data = (await res.json().catch(() => ({}))) as {
      content?: { type?: string; text?: string }[]
      error?: { message?: string } | string
    }

    if (res.ok) {
      const block = data.content?.find((c) => c.type === 'text')
      return block?.text ?? ''
    }

    const rawMsg =
      (typeof data?.error === 'object' && data.error?.message) ||
      (typeof data?.error === 'string' ? data.error : '') ||
      ''
    lastError = new Error(friendlyError(res.status, rawMsg))

    if (isRetryableStatus(res.status) && attempt < maxAttempts - 1) {
      await sleep(backoffMs[attempt])
      continue
    }
    throw lastError
  }

  throw lastError
}
