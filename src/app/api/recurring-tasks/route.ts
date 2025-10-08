import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET all recurring tasks
export async function GET() {
  try {
    const tasks = await sql`
      SELECT * FROM recurring_tasks 
      ORDER BY created_at DESC
    `
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Failed to fetch recurring tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recurring tasks' },
      { status: 500 }
    )
  }
}

// POST create new recurring task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, frequency, priority, start_time, assigned_to, is_active, next_due } = body

    const result = await sql`
      INSERT INTO recurring_tasks (
        title, description, frequency, priority, start_time, assigned_to, is_active, next_due
      ) VALUES (
        ${title}, ${description}, ${frequency}, ${priority}, ${start_time}, ${assigned_to}, ${is_active}, ${next_due}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create recurring task:', error)
    return NextResponse.json(
      { error: 'Failed to create recurring task', details: error },
      { status: 500 }
    )
  }
}

// DELETE recurring task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await sql`DELETE FROM recurring_tasks WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete recurring task:', error)
    return NextResponse.json(
      { error: 'Failed to delete recurring task' },
      { status: 500 }
    )
  }
}
