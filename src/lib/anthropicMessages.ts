const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'

export type AnthropicChatMessage = { role: 'user' | 'assistant'; content: string }

/**
 * Server-only: ruft die Anthropic Messages API auf.
 */
export async function completeAnthropic(options: {
  system: string
  messages: AnthropicChatMessage[]
  max_tokens?: number
  model?: string
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY fehlt. Bitte in der Server-Umgebung setzen (z. B. .env.local / Netlify).',
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
      system: options.system.slice(0, 200_000),
      messages: sanitized,
    }),
  })

  const data = (await res.json()) as {
    content?: { type?: string; text?: string }[]
    error?: { message?: string } | string
  }

  if (!res.ok) {
    const msg =
      (typeof data?.error === 'object' && data.error?.message) ||
      (typeof data?.error === 'string' ? data.error : null) ||
      'Anthropic API-Fehler'
    throw new Error(msg)
  }

  const block = data.content?.find((c) => c.type === 'text')
  return block?.text ?? ''
}
