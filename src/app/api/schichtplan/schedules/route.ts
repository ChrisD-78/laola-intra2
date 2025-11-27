import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

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

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to update schedule:', error)
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    )
  }
}

