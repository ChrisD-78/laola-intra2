import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
  console.log('=== Transcription API called ===')
  
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      return NextResponse.json(
        { error: 'OpenAI API-Schlüssel nicht konfiguriert. Bitte OPENAI_API_KEY in Netlify Environment Variables setzen.' },
        { status: 500 }
      )
    }

    console.log('OpenAI API key found, parsing form data...')
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      console.error('No audio file in request')
      return NextResponse.json({ error: 'Keine Audio-Datei erhalten' }, { status: 400 })
    }

    console.log('Audio file received:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type
    })

    // Convert File to format OpenAI expects
    const audioBuffer = await audioFile.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' })
    const audioFileForOpenAI = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })

    console.log('Audio file converted for OpenAI')

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    // Step 1: Transcribe audio using Whisper
    console.log('Starting Whisper transcription...')
    const transcription = await openai.audio.transcriptions.create({
      file: audioFileForOpenAI,
      model: 'whisper-1',
      language: 'de',
      response_format: 'text'
    })

    console.log('Transcription completed, length:', transcription.length)

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
    console.error('=== ERROR in transcription API ===')
    console.error('Error details:', error)
    
    let errorMessage = 'Unbekannter Fehler bei der Verarbeitung'
    
    if (error instanceof Error) {
      errorMessage = error.message
      console.error('Error message:', errorMessage)
      console.error('Error stack:', error.stack)
      
      // Check for specific OpenAI errors
      if (errorMessage.includes('API key')) {
        errorMessage = 'OpenAI API-Schlüssel ungültig. Bitte überprüfen Sie Ihre Konfiguration.'
      } else if (errorMessage.includes('quota') || errorMessage.includes('insufficient_quota')) {
        errorMessage = 'OpenAI API-Guthaben aufgebraucht. Bitte Credits aufladen.'
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Zeitüberschreitung bei der Verarbeitung. Bitte versuchen Sie es mit einer kürzeren Aufnahme.'
      }
    }
    
    return NextResponse.json(
      { 
        error: `Fehler bei der Verarbeitung: ${errorMessage}`,
        details: error instanceof Error ? error.message : 'Unbekannt'
      },
      { status: 500 }
    )
  }
}

// Increase max duration for audio processing
export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

