import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
  console.log('=== Transcription API called ===')
  console.log('Timestamp:', new Date().toISOString())
  
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured')
      return NextResponse.json(
        { error: 'OpenAI API-Schlüssel nicht konfiguriert. Bitte OPENAI_API_KEY in Netlify Environment Variables setzen.' },
        { status: 500 }
      )
    }

    console.log('✅ OpenAI API key found')
    console.log('📥 Parsing form data...')
    
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      console.error('❌ No audio file in request')
      return NextResponse.json({ error: 'Keine Audio-Datei erhalten' }, { status: 400 })
    }

    console.log('✅ Audio file received:', {
      name: audioFile.name,
      size: `${(audioFile.size / 1024 / 1024).toFixed(2)} MB`,
      type: audioFile.type
    })

    // Check file size (max 25MB for Whisper)
    if (audioFile.size > 25 * 1024 * 1024) {
      console.error('❌ File too large:', audioFile.size)
      return NextResponse.json(
        { error: 'Audio-Datei zu groß (max. 25 MB). Bitte eine kürzere Aufnahme erstellen.' },
        { status: 400 }
      )
    }

    console.log('🔄 Converting audio file...')
    const audioBuffer = await audioFile.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' })
    const audioFileForOpenAI = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })

    console.log('✅ Audio file converted for OpenAI')

    // Initialize OpenAI
    console.log('🔧 Initializing OpenAI client...')
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 120000, // 2 minutes timeout
      maxRetries: 2
    })

    // Step 1: Transcribe audio using Whisper
    console.log('🎙️ Starting Whisper transcription...')
    console.log('⏳ This may take 30-120 seconds depending on audio length...')
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFileForOpenAI,
      model: 'whisper-1',
      language: 'de',
      response_format: 'text'
    })

    console.log('✅ Transcription completed!')
    console.log('📝 Text length:', transcription.length, 'characters')
    console.log('Preview:', transcription.substring(0, 100) + '...')

    // Step 2: Format transcription into structured protocol using GPT-4
    console.log('🤖 Formatting protocol with GPT-4o-mini...')
    console.log('⏳ This may take 10-30 seconds...')
    
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
      console.error('❌ No response from GPT')
      throw new Error('Keine Antwort von GPT erhalten')
    }

    console.log('✅ GPT response received')
    console.log('📄 Protocol preview:', protocolText.substring(0, 200) + '...')

    console.log('🔍 Parsing JSON protocol...')
    const protocol = JSON.parse(protocolText)

    // Validate protocol structure
    if (!protocol.title || !protocol.summary || !protocol.topics || !protocol.actionItems) {
      console.error('❌ Invalid protocol format:', {
        hasTitle: !!protocol.title,
        hasSummary: !!protocol.summary,
        hasTopics: !!protocol.topics,
        hasActionItems: !!protocol.actionItems
      })
      throw new Error('Ungültiges Protokollformat von GPT erhalten')
    }

    console.log('✅ Protocol validated successfully')
    console.log('📊 Protocol stats:', {
      title: protocol.title,
      topics: protocol.topics.length,
      actionItems: protocol.actionItems.length,
      transcriptionLength: protocol.transcription.length
    })

    console.log('✅ Sending successful response')
    return NextResponse.json({ protocol })

  } catch (error) {
    console.error('❌❌❌ ERROR in transcription API ❌❌❌')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error details:', error)
    
    let errorMessage = 'Unbekannter Fehler bei der Verarbeitung'
    let statusCode = 500
    
    if (error instanceof Error) {
      errorMessage = error.message
      console.error('💥 Error message:', errorMessage)
      console.error('📚 Error stack:', error.stack)
      
      // Check for specific OpenAI errors
      if (errorMessage.includes('API key') || errorMessage.includes('Incorrect API key')) {
        errorMessage = 'OpenAI API-Schlüssel ungültig oder nicht konfiguriert. Bitte OPENAI_API_KEY in Netlify Environment Variables überprüfen.'
        statusCode = 401
      } else if (errorMessage.includes('quota') || errorMessage.includes('insufficient_quota') || errorMessage.includes('billing')) {
        errorMessage = 'OpenAI API-Guthaben aufgebraucht. Bitte Credits auf platform.openai.com aufladen.'
        statusCode = 402
      } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        errorMessage = 'Zeitüberschreitung bei der Verarbeitung. Bitte versuchen Sie es mit einer kürzeren Aufnahme oder versuchen Sie es später erneut.'
        statusCode = 504
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('Too Many Requests')) {
        errorMessage = 'Zu viele Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.'
        statusCode = 429
      } else if (errorMessage.includes('model') || errorMessage.includes('whisper-1') || errorMessage.includes('gpt-4')) {
        errorMessage = 'OpenAI Modell nicht verfügbar. Bitte versuchen Sie es später erneut.'
        statusCode = 503
      } else if (errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed')) {
        errorMessage = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.'
        statusCode = 503
      }
    }
    
    console.error('📤 Sending error response:', errorMessage)
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unbekannt',
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    )
  }
}

// Increase max duration for audio processing
export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

