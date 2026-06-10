import { NextRequest, NextResponse } from 'next/server'
import OpenAI, { toFile } from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 120
export const dynamic = 'force-dynamic'

const MAX_BYTES = 25 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/ogg',
  'video/mp4',
  'video/webm',
])

function isAllowedAudio(file: File): boolean {
  const type = (file.type || '').toLowerCase()
  if (ALLOWED_TYPES.has(type)) return true
  const name = file.name.toLowerCase()
  return /\.(mp3|m4a|wav|webm|ogg|mp4|mpeg|mpga)$/.test(name)
}

/** Audio-Datei per OpenAI Whisper in Text umwandeln (Deutsch). */
export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'Audio-Transkription nicht konfiguriert. Bitte OPENAI_API_KEY in Netlify setzen (Whisper API) oder Live-Aufnahme nutzen.',
      },
      { status: 503 },
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Ungültige Formulardaten' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Keine Audio-Datei übermittelt.' }, { status: 400 })
  }

  if (!isAllowedAudio(file)) {
    return NextResponse.json(
      { error: 'Nicht unterstütztes Format. Erlaubt: MP3, M4A, WAV, WEBM, OGG, MP4.' },
      { status: 400 },
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Datei zu groß (max. 25 MB).' }, { status: 413 })
  }

  try {
    const openai = new OpenAI({ apiKey })
    const buffer = Buffer.from(await file.arrayBuffer())
    const upload = await toFile(buffer, file.name || 'audio.webm', { type: file.type || 'audio/webm' })

    const result = await openai.audio.transcriptions.create({
      file: upload,
      model: 'whisper-1',
      language: 'de',
      response_format: 'text',
    })

    const text = typeof result === 'string' ? result.trim() : ''
    if (!text) {
      return NextResponse.json(
        { error: 'Kein Text in der Audio-Datei erkannt. Bitte Datei prüfen oder Transkript manuell eintragen.' },
        { status: 422 },
      )
    }

    return NextResponse.json({ text })
  } catch (e) {
    console.error('POST /api/agent/transcribe', e)
    const msg = e instanceof Error ? e.message : 'Transkription fehlgeschlagen'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
