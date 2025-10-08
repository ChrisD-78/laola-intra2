import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET all tasks
export async function GET() {
  try {
    const tasks = await sql`
      SELECT * FROM tasks 
      ORDER BY created_at DESC
    `
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST create new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, priority, status, due_date, assigned_to } = body

    const result = await sql`
      INSERT INTO tasks (
        title, description, priority, status, due_date, assigned_to
      ) VALUES (
        ${title}, ${description}, ${priority}, ${status || 'Offen'}, ${due_date}, ${assigned_to}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

// DELETE task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await sql`DELETE FROM tasks WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
