import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  try {
    console.log('=== Testing OpenAI Configuration ===')
    
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        status: 'error',
        message: 'OpenAI API-Schlüssel nicht gefunden',
        details: 'Bitte OPENAI_API_KEY in Netlify Environment Variables setzen.'
      }, { status: 500 })
    }

    // Check API key format
    if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
      return NextResponse.json({
        status: 'error',
        message: 'Ungültiges API-Schlüssel Format',
        details: 'Der API-Schlüssel sollte mit "sk-" beginnen.'
      }, { status: 500 })
    }

    console.log('API key found, testing connection...')

    // Initialize OpenAI and test with a simple request
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    // Test with a minimal chat completion
    const testCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: 'Antworte nur mit "OK"'
        }
      ],
      max_tokens: 5
    })

    const response = testCompletion.choices[0]?.message?.content

    if (!response) {
      throw new Error('Keine Antwort von OpenAI erhalten')
    }

    console.log('OpenAI test successful')

    return NextResponse.json({
      status: 'success',
      message: 'OpenAI-Konfiguration funktioniert!',
      details: {
        model: 'gpt-4o-mini',
        response: response.trim(),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('=== OpenAI Test Failed ===')
    console.error('Error:', error)
    
    let errorMessage = 'Unbekannter Fehler'
    let details = ''

    if (error instanceof Error) {
      errorMessage = error.message
      
      if (errorMessage.includes('API key')) {
        details = 'Der API-Schlüssel ist ungültig. Bitte überprüfen Sie Ihre OpenAI API-Konfiguration.'
      } else if (errorMessage.includes('quota') || errorMessage.includes('insufficient_quota')) {
        details = 'Ihr OpenAI-Guthaben ist aufgebraucht. Bitte laden Sie Credits auf.'
      } else if (errorMessage.includes('rate_limit')) {
        details = 'API-Limit erreicht. Bitte warten Sie einen Moment und versuchen Sie es erneut.'
      } else {
        details = errorMessage
      }
    }

    return NextResponse.json({
      status: 'error',
      message: 'OpenAI-Test fehlgeschlagen',
      details: details
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'

