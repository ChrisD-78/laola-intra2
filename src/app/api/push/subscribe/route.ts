import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// POST - Subscription speichern
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscription, userId, userAgent } = body

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Ungültige Subscription-Daten' },
        { status: 400 }
      )
    }

    // Prüfe ob bereits vorhanden
    const existing = await sql`
      SELECT id FROM push_subscriptions WHERE endpoint = ${subscription.endpoint}
    `

    if (existing.length > 0) {
      // Aktualisiere bestehende Subscription
      await sql`
        UPDATE push_subscriptions
        SET 
          user_id = ${userId || null},
          p256dh = ${subscription.keys.p256dh},
          auth = ${subscription.keys.auth},
          user_agent = ${userAgent || null},
          updated_at = NOW()
        WHERE endpoint = ${subscription.endpoint}
      `
    } else {
      // Erstelle neue Subscription
      await sql`
        INSERT INTO push_subscriptions (
          user_id,
          endpoint,
          p256dh,
          auth,
          user_agent
        ) VALUES (
          ${userId || null},
          ${subscription.endpoint},
          ${subscription.keys.p256dh},
          ${subscription.keys.auth},
          ${userAgent || null}
        )
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save subscription:', error)
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    )
  }
}

