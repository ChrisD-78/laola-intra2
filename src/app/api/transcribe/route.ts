import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API-Schlüssel nicht konfiguriert. Bitte OPENAI_API_KEY in .env.local setzen.' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'Keine Audio-Datei erhalten' }, { status: 400 })
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    // Step 1: Transcribe audio using Whisper
    console.log('Transkribiere Audio mit Whisper...')
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'de',
      response_format: 'text'
    })

    console.log('Transkription abgeschlossen:', transcription.substring(0, 100) + '...')

    // Step 2: Format transcription into structured protocol using GPT-4
    console.log('Formatiere Protokoll mit GPT-4...')
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Du bist ein professioneller Meeting-Protokollant. Erstelle aus der folgenden Transkription ein strukturiertes Meeting-Protokoll auf Deutsch.

Das Protokoll soll folgendes Format haben (als JSON):
{
  "title": "Ein passender Titel für das Meeting",
  "date": "Das heutige Datum im Format DD.MM.YYYY HH:MM",
  "participants": "Liste der Teilnehmer (falls erwähnt, sonst 'Nicht spezifiziert')",
  "summary": "Eine prägnante Zusammenfassung des Meetings (2-3 Sätze)",
  "topics": ["Thema 1", "Thema 2", ...] - Array mit allen besprochenen Hauptthemen,
  "actionItems": ["Aufgabe 1", "Aufgabe 2", ...] - Array mit konkreten Aufgaben und nächsten Schritten,
  "transcription": "Die vollständige, leicht bereinigte Transkription"
}

Wichtig:
- Sei präzise und professionell
- Filtere Füllwörter in der Zusammenfassung
- Identifiziere klare Aufgaben und To-Dos
- Behalte wichtige Details bei
- Antworte NUR mit dem JSON-Objekt, ohne zusätzlichen Text`
        },
        {
          role: 'user',
          content: `Hier ist die Meeting-Transkription:\n\n${transcription}`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    const protocolText = completion.choices[0]?.message?.content
    if (!protocolText) {
      throw new Error('Keine Antwort von GPT erhalten')
    }

    console.log('Protokoll erstellt:', protocolText.substring(0, 100) + '...')

    const protocol = JSON.parse(protocolText)

    // Validate protocol structure
    if (!protocol.title || !protocol.summary || !protocol.topics || !protocol.actionItems) {
      throw new Error('Ungültiges Protokollformat von GPT erhalten')
    }

    return NextResponse.json({ protocol })

  } catch (error) {
    console.error('Fehler bei der Transkription:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Fehler bei der Verarbeitung: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Unbekannter Fehler bei der Verarbeitung' },
      { status: 500 }
    )
  }
}

// Increase max duration for audio processing
export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

