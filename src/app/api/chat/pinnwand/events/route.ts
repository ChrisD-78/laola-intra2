import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET: Alle Events (für Anmeldungen)
export async function GET() {
  try {
    const rows = await sql`
      SELECT
        id,
        title,
        event_date,
        created_by,
        created_at
      FROM chat_pinnwand_events
      ORDER BY event_date ASC
      LIMIT 100
    `
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Failed to fetch pinnwand events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pinnwand events' },
      { status: 500 }
    )
  }
}

// POST: Neues Event anlegen (nur Admin – Berechtigung wird im Frontend geprüft)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, event_date, created_by } = body || {}

    if (!title || !event_date || !created_by) {
      return NextResponse.json(
        { error: 'Missing required fields (title, event_date, created_by)' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO chat_pinnwand_events (title, event_date, created_by)
      VALUES (${title}, ${event_date}, ${created_by})
      RETURNING id, title, event_date, created_by, created_at
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create pinnwand event:', error)
    return NextResponse.json(
      { error: 'Failed to create pinnwand event' },
      { status: 500 }
    )
  }
}
