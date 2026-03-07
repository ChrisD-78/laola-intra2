import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET: Anmeldungen zu einem Event (event_id Query)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('event_id')

    if (!eventId) {
      return NextResponse.json(
        { error: 'Missing event_id' },
        { status: 400 }
      )
    }

    const rows = await sql`
      SELECT
        id,
        event_id,
        participant_name,
        kleidergroesse,
        created_by,
        created_at
      FROM chat_pinnwand_event_registrations
      WHERE event_id = ${eventId}
      ORDER BY created_at ASC
    `
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Failed to fetch pinnwand registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pinnwand registrations' },
      { status: 500 }
    )
  }
}

// POST: Anmeldung für ein Event (jeder Mitarbeiter)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_id, participant_name, kleidergroesse, created_by } = body || {}

    if (!event_id || !participant_name || !created_by) {
      return NextResponse.json(
        { error: 'Missing required fields (event_id, participant_name, created_by)' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO chat_pinnwand_event_registrations (
        event_id,
        participant_name,
        kleidergroesse,
        created_by
      ) VALUES (
        ${event_id},
        ${participant_name},
        ${kleidergroesse || null},
        ${created_by}
      )
      RETURNING id, event_id, participant_name, kleidergroesse, created_by, created_at
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create pinnwand registration:', error)
    return NextResponse.json(
      { error: 'Failed to create pinnwand registration' },
      { status: 500 }
    )
  }
}
