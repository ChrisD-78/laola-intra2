import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    const openaiKey = process.env.OPENAI_API_KEY

    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured.' },
        { status: 500 }
      )
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const systemPrompt = `Du bist Lola, ein freundlicher und hilfsbereiter KI-Assistent. Du arbeitest für Christof Drost, der die Bäder in Landau in der Pfalz leitet.

**Wichtige Informationen über Christof:**
- Name: Christof Drost
- Position: Leiter der Bäder in Landau in der Pfalz
- Verantwortlich für: Freizeitbad LA OLA und Freibad Landau

**Deine Aufgaben:**
1. Beantworte Fragen zu den Bädern (LA OLA und Freibad Landau)
2. Unterstütze bei der täglichen Arbeitsplanung
3. Gib hilfreiche Informationen und Tipps für den Arbeitsalltag
4. Sei freundlich, professionell und auf Deutsch

**Dein Kommunikationsstil:**
- Verwende "Du" (freundlich und persönlich, aber professionell)
- Sei präzise und hilfreich
- Wenn du etwas nicht weißt, gib ehrlich zu, dass du die Information nicht hast
- Biete praktische Lösungen an
- Sei proaktiv und denke mit

**Hinweise:**
- Wenn nach spezifischen Daten gefragt wird (z.B. Besucherzahlen, Öffnungszeiten), die du nicht kennst, erkläre, dass diese Informationen aktuell nicht verfügbar sind, aber du gerne helfen würdest, sie zu finden
- Bei Fragen zu Veranstaltungen, Preisen oder anderen betrieblichen Details: Sei hilfreich, aber ehrlich über fehlende aktuelle Daten
- Unterstütze bei der Tagesplanung, Priorisierung von Aufgaben und allgemeinen geschäftlichen Fragen

Antworte immer auf Deutsch, sei präzise und hilfreich. Verwende die Du-Form.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Fehler bei der OpenAI API-Anfrage')
    }

    const data = await response.json()
    const generatedResponse = data.choices[0].message.content

    return NextResponse.json({ response: generatedResponse })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler'
    return NextResponse.json(
      { error: 'Fehler bei der Kommunikation mit Lola: ' + message },
      { status: 500 }
    )
  }
}
