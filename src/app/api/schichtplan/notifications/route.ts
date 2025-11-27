import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET notifications for an employee
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId is required' }, { status: 400 })
    }

    const notifications = await sql`
      SELECT 
        id,
        employee_id as "employeeId",
        type,
        message,
        date,
        read,
        created_at as "createdAt"
      FROM schichtplan_notifications
      WHERE employee_id = ${employeeId}
      ORDER BY created_at DESC
    `

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST create notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, employeeId, type, message, date } = body

    const result = await sql`
      INSERT INTO schichtplan_notifications (
        id, employee_id, type, message, date
      ) VALUES (
        ${id}, ${employeeId}, ${type}, ${message}, ${date}
      )
      RETURNING 
        id,
        employee_id as "employeeId",
        type,
        message,
        date,
        read,
        created_at as "createdAt"
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// PUT mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    const result = await sql`
      UPDATE schichtplan_notifications
      SET read = true
      WHERE id = ${id}
      RETURNING 
        id,
        employee_id as "employeeId",
        type,
        message,
        date,
        read,
        created_at as "createdAt"
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to update notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

