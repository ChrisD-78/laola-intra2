import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import webpush from 'web-push'

const sql = neon(process.env.DATABASE_URL!)

// Konfiguriere VAPID Keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@laola.baederbook.de'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

// POST - Benachrichtigung senden
export async function POST(request: NextRequest) {
  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'VAPID Keys nicht konfiguriert' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { title, body, icon, url, userId } = body

    // Hole alle Subscriptions (optional gefiltert nach userId)
    let subscriptions
    if (userId) {
      subscriptions = await sql`
        SELECT endpoint, p256dh, auth
        FROM push_subscriptions
        WHERE user_id = ${userId}
      `
    } else {
      subscriptions = await sql`
        SELECT endpoint, p256dh, auth
        FROM push_subscriptions
      `
    }

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        failed: 0,
        total: 0,
        message: 'Keine Subscriptions gefunden'
      })
    }

    const payload = JSON.stringify({
      title: title || 'Schichtplan Update',
      body: body || 'Der Schichtplan wurde aktualisiert',
      icon: icon || '/favicon-96x96.png',
      url: url || '/schichtplan',
      badge: '/favicon-32x32.png'
    })

    let successCount = 0
    let failCount = 0
    const errors: string[] = []

    // Sende an alle Subscriptions
    const promises = subscriptions.map(async (sub: any) => {
      try {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }

        await webpush.sendNotification(subscription, payload)
        successCount++
      } catch (error: any) {
        failCount++
        console.error('Fehler beim Senden:', error)
        
        // Ungültige Subscription entfernen
        if (error.statusCode === 410 || error.statusCode === 404) {
          await sql`
            DELETE FROM push_subscriptions WHERE endpoint = ${sub.endpoint}
          `
        }
        
        errors.push(`Endpoint ${sub.endpoint.substring(0, 50)}...: ${error.message}`)
      }
    })

    await Promise.all(promises)

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failCount,
      total: subscriptions.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Failed to send notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

