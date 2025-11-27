import { NextResponse } from 'next/server'

// GET - VAPID Public Key abrufen (für Frontend)
export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  
  if (!publicKey) {
    return NextResponse.json(
      { error: 'VAPID Public Key nicht konfiguriert' },
      { status: 500 }
    )
  }

  return NextResponse.json({ publicKey })
}

