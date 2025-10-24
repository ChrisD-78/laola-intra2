import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// POST mark recurring task as completed
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { completedBy, notes } = body

    // Get the current task to calculate next due date
    const task = await sql`
      SELECT * FROM recurring_tasks WHERE id = ${id}
    `
    
    if (task.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const currentTask = task[0]
    const now = new Date()
    
    // Calculate next due date based on frequency
    let nextDueDate = new Date()
    switch (currentTask.frequency) {
      case 'Täglich':
        nextDueDate.setDate(now.getDate() + 1)
        break
      case 'Wöchentlich':
        nextDueDate.setDate(now.getDate() + 7)
        break
      case 'Alle 2 Wochen':
        nextDueDate.setDate(now.getDate() + 14)
        break
      case 'Monatlich':
        nextDueDate.setMonth(now.getMonth() + 1)
        break
      case 'Alle 3 Monate':
        nextDueDate.setMonth(now.getMonth() + 3)
        break
      case 'Jährlich':
        nextDueDate.setFullYear(now.getFullYear() + 1)
        break
      default:
        nextDueDate.setDate(now.getDate() + 1)
    }

    // Set the time to the start_time
    const [hours, minutes] = currentTask.start_time.split(':')
    nextDueDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    const nextDueString = nextDueDate.toISOString()

    // Insert completion record
    const completion = await sql`
      INSERT INTO recurring_task_completions (
        recurring_task_id, completed_by, notes, next_due_date
      ) VALUES (
        ${id}, ${completedBy}, ${notes || ''}, ${nextDueString}
      )
      RETURNING *
    `

    // Update the recurring task's next_due date
    await sql`
      UPDATE recurring_tasks 
      SET next_due = ${nextDueString}, updated_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json(completion[0], { status: 201 })
  } catch (error) {
    console.error('Failed to mark task as completed:', error)
    return NextResponse.json(
      { error: 'Failed to mark task as completed' },
      { status: 500 }
    )
  }
}
