import { NextResponse } from 'next/server'

// GET - VAPID Public Key abrufen (für Frontend)
export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  
  if (!publicKey) {
    console.error('VAPID Public Key nicht gefunden in Environment Variables')
    return NextResponse.json(
      { 
        error: 'VAPID Public Key nicht konfiguriert',
        message: 'Bitte konfigurieren Sie NEXT_PUBLIC_VAPID_PUBLIC_KEY in Netlify Environment Variables'
      },
      { status: 500 }
    )
  }

  if (!privateKey) {
    console.warn('VAPID Private Key nicht gefunden - Push Notifications können nicht gesendet werden')
  }

  return NextResponse.json({ 
    publicKey,
    configured: !!publicKey && !!privateKey
  })
}

