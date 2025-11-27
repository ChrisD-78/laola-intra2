import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import webpush from 'web-push'

const sql = neon(process.env.DATABASE_URL!)

// Konfiguriere VAPID Keys für Push Notifications
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@laola.baederbook.de'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

// Hilfsfunktion zum Senden von Push-Benachrichtigungen
async function sendScheduleUpdateNotification(date: string) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return // VAPID Keys nicht konfiguriert, überspringe
  }

  try {
    // Hole alle Subscriptions
    const subscriptions = await sql`
      SELECT endpoint, p256dh, auth
      FROM push_subscriptions
    `

    if (subscriptions.length === 0) {
      return // Keine Subscriptions
    }

    const scheduleDate = new Date(date)
    const formattedDate = scheduleDate.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const payload = JSON.stringify({
      title: '📅 Schichtplan aktualisiert',
      body: `Der Schichtplan für ${formattedDate} wurde geändert`,
      icon: '/favicon-96x96.png',
      url: '/schichtplan',
      badge: '/favicon-32x32.png'
    })

    // Sende an alle Subscriptions (asynchron, nicht blockierend)
    subscriptions.forEach(async (sub: any) => {
      try {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }
        await webpush.sendNotification(subscription, payload)
      } catch (error: any) {
        console.error('Fehler beim Senden der Push-Benachrichtigung:', error)
        // Ungültige Subscription entfernen
        if (error.statusCode === 410 || error.statusCode === 404) {
          await sql`
            DELETE FROM push_subscriptions WHERE endpoint = ${sub.endpoint}
          `
        }
      }
    })
  } catch (error) {
    console.error('Fehler bei Push-Notification:', error)
    // Nicht kritisch, weiter mit normaler Antwort
  }
}

// GET all schedules (optionally filtered by date range)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let schedules
    if (startDate && endDate) {
      schedules = await sql`
        SELECT 
          date,
          shifts,
          special_status as "specialStatus"
        FROM schichtplan_schedules
        WHERE date >= ${startDate} AND date <= ${endDate}
        ORDER BY date
      `
    } else {
      schedules = await sql`
        SELECT 
          date,
          shifts,
          special_status as "specialStatus"
        FROM schichtplan_schedules
        ORDER BY date DESC
        LIMIT 100
      `
    }

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Failed to fetch schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}

// POST create or update schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, shifts, specialStatus } = body

    const result = await sql`
      INSERT INTO schichtplan_schedules (date, shifts, special_status)
      VALUES (${date}, ${JSON.stringify(shifts)}::jsonb, ${specialStatus ? JSON.stringify(specialStatus) : null}::jsonb)
      ON CONFLICT (date) 
      DO UPDATE SET 
        shifts = EXCLUDED.shifts,
        special_status = EXCLUDED.special_status,
        updated_at = NOW()
      RETURNING 
        date,
        shifts,
        special_status as "specialStatus"
    `

    // Sende Push-Benachrichtigung bei Schichtplan-Update (asynchron, nicht blockierend)
    sendScheduleUpdateNotification(date).catch(err => {
      console.error('Fehler bei Push-Notification:', err)
    })

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to save schedule:', error)
    return NextResponse.json(
      { error: 'Failed to save schedule' },
      { status: 500 }
    )
  }
}

// PUT update schedule
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, shifts, specialStatus } = body

    const result = await sql`
      UPDATE schichtplan_schedules
      SET 
        shifts = ${JSON.stringify(shifts)}::jsonb,
        special_status = ${specialStatus ? JSON.stringify(specialStatus) : null}::jsonb,
        updated_at = NOW()
      WHERE date = ${date}
      RETURNING 
        date,
        shifts,
        special_status as "specialStatus"
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    // Sende Push-Benachrichtigung bei Schichtplan-Update (asynchron, nicht blockierend)
    sendScheduleUpdateNotification(date).catch(err => {
      console.error('Fehler bei Push-Notification:', err)
    })

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to update schedule:', error)
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    )
  }
}

