import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { emailText } = await request.json()

    if (!emailText) {
      return NextResponse.json(
        { error: 'Keine E-Mail-Text angegeben' },
        { status: 400 }
      )
    }

    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json(
        {
          error:
            'OpenAI API-Schlüssel nicht konfiguriert. Bitte OPENAI_API_KEY Umgebungsvariable setzen.'
        },
        { status: 500 }
      )
    }

    const responseText = await generateResponse(emailText, openaiKey)

    return NextResponse.json({
      success: true,
      response: responseText
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler bei der Antworterstellung'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function generateResponse(emailText: string, apiKey: string) {
  const systemPrompt = `Du bist ein professioneller E-Mail-Assistent für deutschsprachige Geschäftskommunikation.

Deine Hauptaufgabe ist es, eingehende E-Mails zu analysieren und einen passenden Antwortentwurf vorzubereiten.

Richtlinien:
1. Verwende immer korrekte Rechtschreibung und Grammatik.
2. Formuliere klar, höflich und professionell.
3. Passe den Ton an den Absender an:
   - Wenn der Absender formell schreibt → du antwortest formell.
   - Wenn der Absender locker schreibt → du bleibst freundlich und natürlich.
4. Antworte nur auf das, was inhaltlich relevant ist; vermeide Wiederholungen oder irrelevante Höflichkeiten.
5. Wenn eine Handlung erforderlich ist (z. B. Terminbestätigung, Rückfrage, Weiterleitung), schlage klar formulierte nächste Schritte vor.
6. Füge eine passende Grußformel am Ende hinzu.
7. Verwende kein Markdown, keine Listen, kein HTML — nur reinen Fließtext, sendefertig für eine E-Mail.

Wenn Informationen fehlen, schreibe eine höfliche Rückfrage, anstatt Annahmen zu treffen.`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Bitte erstelle einen Antwortentwurf für folgende E-Mail:\n\n${emailText}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'OpenAI API-Anfrage fehlgeschlagen')
  }

  const data = await response.json()
  return data.choices[0].message.content
}
