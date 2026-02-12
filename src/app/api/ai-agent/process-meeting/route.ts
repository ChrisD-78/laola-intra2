import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API-Schlüssel nicht konfiguriert' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const audio = formData.get('audio')
    const meetingInfoRaw = formData.get('meetingInfo')

    if (!audio || !(audio instanceof File)) {
      return NextResponse.json(
        { error: 'Keine Audio-Datei gefunden' },
        { status: 400 }
      )
    }

    let meetingInfo: { title?: string; date?: string; participants?: string } = {}
    if (typeof meetingInfoRaw === 'string') {
      try {
        meetingInfo = JSON.parse(meetingInfoRaw)
      } catch {
        meetingInfo = {}
      }
    }

    const transcript = await transcribeAudio(audio, openaiKey)
    const protocol = await generateProtocol(transcript, meetingInfo, openaiKey)

    return NextResponse.json({
      success: true,
      transcript,
      protocol
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler bei der Verarbeitung'
    return NextResponse.json({ error: 'Fehler bei der Verarbeitung: ' + message }, { status: 500 })
  }
}

async function transcribeAudio(audio: File, apiKey: string) {
  const audioBuffer = await audio.arrayBuffer()
  const audioBlob = new Blob([audioBuffer], { type: audio.type || 'audio/webm' })

  const formData = new FormData()
  formData.append('file', audioBlob, 'meeting.webm')
  formData.append('model', 'whisper-1')
  formData.append('language', 'de')
  formData.append('response_format', 'text')

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Transkription fehlgeschlagen')
  }

  return await response.text()
}

async function generateProtocol(
  transcript: string,
  meetingInfo: { title?: string; date?: string; participants?: string },
  apiKey: string
) {
  const systemPrompt = `Du bist ein professioneller Assistent für die Erstellung von Meeting-Protokollen.

Deine Aufgabe ist es, aus einem Meeting-Transkript ein strukturiertes, professionelles Protokoll zu erstellen.

Richtlinien:
1. Erstelle ein klar strukturiertes Protokoll auf Deutsch
2. Gliedere in sinnvolle Abschnitte (z.B. Teilnehmer, Themen, Beschlüsse, Aufgaben, Nächste Schritte)
3. Fasse wichtige Punkte zusammen, ohne wichtige Details zu verlieren
4. Formuliere präzise und professionell
5. Hebe Entscheidungen und Aktionspunkte hervor
6. Nutze klare Absätze, KEINE Markdown-Formatierung
7. Falls To-Dos erwähnt werden, liste diese übersichtlich auf
8. Beginne mit einem Header (Meeting-Titel, Datum, Teilnehmer)
9. Verwende nur Fließtext und einfache Textformatierung, keine Listen mit - oder *

Das Protokoll sollte sendefertig für eine E-Mail oder ein Dokument sein.`

  const userPrompt = `Erstelle ein professionelles Meeting-Protokoll aus folgendem Transkript:

Meeting-Informationen:
Titel: ${meetingInfo.title || 'Besprechung'}
Datum: ${meetingInfo.date || new Date().toLocaleDateString('de-DE')}
Teilnehmer: ${meetingInfo.participants || 'Nicht angegeben'}

Transkript:
${transcript}

Bitte erstelle ein strukturiertes, professionelles Protokoll mit allen wichtigen Punkten, Entscheidungen und Aufgaben.`

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
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Protokollerstellung fehlgeschlagen')
  }

  const data = await response.json()
  return data.choices[0].message.content
}
