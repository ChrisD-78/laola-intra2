import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// PATCH update recurring task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params

    // Simple approach: allow updating specific fields
    const { title, description, frequency, priority, start_time, assigned_to, is_active, next_due } = body

    const result = await sql`
      UPDATE recurring_tasks 
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        frequency = COALESCE(${frequency}, frequency),
        priority = COALESCE(${priority}, priority),
        start_time = COALESCE(${start_time}, start_time),
        assigned_to = COALESCE(${assigned_to}, assigned_to),
        is_active = COALESCE(${is_active}, is_active),
        next_due = COALESCE(${next_due}, next_due),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to update recurring task:', error)
    return NextResponse.json(
      { error: 'Failed to update recurring task' },
      { status: 500 }
    )
  }
}
