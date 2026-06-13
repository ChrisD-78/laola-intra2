import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import webpush from 'web-push'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const sql = neon(process.env.DATABASE_URL!)

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@laola.baederbook.de'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

type ShiftChange = {
  employeeId: string
  employeeName: string
  date: string
  area: string
  shift: string
}

let constraintReady = false

/** CHECK-Constraint der Notification-Tabelle um 'shift_assigned' erweitern (einmalig). */
async function ensureNotificationTypeConstraint() {
  if (constraintReady) return
  try {
    await sql`ALTER TABLE schichtplan_notifications DROP CONSTRAINT IF EXISTS schichtplan_notifications_type_check`
    await sql`
      ALTER TABLE schichtplan_notifications
      ADD CONSTRAINT schichtplan_notifications_type_check
      CHECK (type IN ('vacation_approved', 'vacation_rejected', 'shift_assigned'))
    `
  } catch (e) {
    // Bei parallelem Aufruf kann das Hinzufügen kollidieren – Constraint existiert dann bereits
    console.error('notify-shifts: Constraint-Anpassung', e)
  }
  constraintReady = true
}

function formatShiftLine(change: ShiftChange): string {
  const dateLabel = new Date(`${change.date}T00:00:00`).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  return `${change.shift} (${change.area}) am ${dateLabel}`
}

/**
 * Benachrichtigt die von neuen Schichten betroffenen Mitarbeiter:
 * - In-App-Benachrichtigung (Glocke im Schichtplan) für jeden Mitarbeiter
 * - Web-Push an alle Geräte des Mitarbeiters (sofern aktiviert)
 * Der Versand wird VOR der Antwort abgeschlossen (wichtig für Serverless).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const changes: ShiftChange[] = Array.isArray(body.changes)
      ? body.changes
          .filter(
            (c: unknown): c is ShiftChange =>
              Boolean(c) &&
              typeof (c as ShiftChange).employeeId === 'string' &&
              typeof (c as ShiftChange).date === 'string' &&
              typeof (c as ShiftChange).shift === 'string',
          )
          .slice(0, 300)
      : []

    if (changes.length === 0) {
      return NextResponse.json({ error: 'Keine Änderungen übermittelt.' }, { status: 400 })
    }

    // Änderungen je Mitarbeiter bündeln (eine Nachricht pro Person)
    const byEmployee = new Map<string, ShiftChange[]>()
    for (const change of changes) {
      if (!byEmployee.has(change.employeeId)) byEmployee.set(change.employeeId, [])
      byEmployee.get(change.employeeId)!.push(change)
    }

    const employeeIds = [...byEmployee.keys()]
    const employees = (await sql`
      SELECT id, first_name, last_name, user_id
      FROM schichtplan_employees
      WHERE id = ANY(${employeeIds})
    `) as { id: string; first_name: string; last_name: string; user_id: string | null }[]
    const employeeById = new Map(employees.map((e) => [e.id, e]))

    await ensureNotificationTypeConstraint()

    let pushSent = 0
    let pushFailed = 0
    const withoutPush: string[] = []

    for (const [employeeId, employeeChanges] of byEmployee) {
      const employee = employeeById.get(employeeId)
      if (!employee) continue

      employeeChanges.sort((a, b) => a.date.localeCompare(b.date))
      const lines = employeeChanges.map(formatShiftLine)
      const message =
        employeeChanges.length === 1
          ? `Du wurdest für eine neue Schicht eingeteilt: ${lines[0]}`
          : `Du wurdest für ${employeeChanges.length} neue Schichten eingeteilt:\n${lines.join('\n')}`

      // In-App-Benachrichtigung (Glocke im Schichtplan)
      try {
        const notifId = `shift_${Date.now()}_${employeeId.slice(0, 12)}_${Math.random().toString(36).slice(2, 8)}`
        await sql`
          INSERT INTO schichtplan_notifications (id, employee_id, type, message, date)
          VALUES (${notifId}, ${employeeId}, 'shift_assigned', ${message}, ${employeeChanges[0].date})
        `
      } catch (e) {
        console.error(`notify-shifts: In-App-Benachrichtigung für ${employee.first_name}`, e)
      }

      // Web-Push an alle Geräte des Mitarbeiters
      if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        withoutPush.push(`${employee.first_name} ${employee.last_name}`)
        continue
      }
      if (!employee.user_id) {
        withoutPush.push(`${employee.first_name} ${employee.last_name}`)
        continue
      }

      const subscriptions = (await sql`
        SELECT endpoint, p256dh, auth
        FROM push_subscriptions
        WHERE user_id = ${employee.user_id}
      `) as { endpoint: string; p256dh: string; auth: string }[]

      if (subscriptions.length === 0) {
        withoutPush.push(`${employee.first_name} ${employee.last_name}`)
        continue
      }

      const payload = JSON.stringify({
        title: '📅 Neue Schicht für dich',
        body:
          employeeChanges.length === 1
            ? `Hallo ${employee.first_name}! ${lines[0]}`
            : `Hallo ${employee.first_name}! ${employeeChanges.length} neue Schichten – z. B. ${lines[0]}`,
        icon: '/favicon-96x96.png',
        badge: '/favicon-32x32.png',
        url: '/schichtplan',
      })

      // WICHTIG: vor der Response abwarten, sonst bricht Serverless den Versand ab
      const results = await Promise.allSettled(
        subscriptions.map((sub) =>
          webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
          ),
        ),
      )

      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        if (result.status === 'fulfilled') {
          pushSent += 1
        } else {
          pushFailed += 1
          const statusCode = (result.reason as { statusCode?: number })?.statusCode
          console.error('notify-shifts: Push fehlgeschlagen', statusCode, result.reason)
          if (statusCode === 410 || statusCode === 404) {
            await sql`DELETE FROM push_subscriptions WHERE endpoint = ${subscriptions[i].endpoint}`
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      employees: byEmployee.size,
      pushSent,
      pushFailed,
      withoutPush,
      vapidConfigured: Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY),
    })
  } catch (error) {
    console.error('POST /api/schichtplan/notify-shifts', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Benachrichtigung fehlgeschlagen' },
      { status: 500 },
    )
  }
}
