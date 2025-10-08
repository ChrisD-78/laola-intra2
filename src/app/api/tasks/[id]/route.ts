import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// PATCH update task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params

    // Simple approach: allow updating specific fields
    const { title, description, priority, status, due_date, assigned_to } = body

    const result = await sql`
      UPDATE tasks 
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        priority = COALESCE(${priority}, priority),
        status = COALESCE(${status}, status),
        due_date = COALESCE(${due_date}, due_date),
        assigned_to = COALESCE(${assigned_to}, assigned_to),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}
