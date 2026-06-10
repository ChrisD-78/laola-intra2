import { NextResponse } from 'next/server'

/** Prüft, ob ANTHROPIC_API_KEY auf dem Server (z. B. Netlify) gesetzt ist – ohne den Schlüssel preiszugeben. */
export async function GET() {
  const configured = Boolean(process.env.ANTHROPIC_API_KEY?.trim())
  return NextResponse.json({ configured })
}
