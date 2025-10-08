import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// PATCH update recurring task
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { id } = params

    // Build dynamic update query
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    Object.entries(body).forEach(([key, value]) => {
      updates.push(`${key} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    })

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Add updated_at
    updates.push(`updated_at = NOW()`)

    const query = `
      UPDATE recurring_tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `
    values.push(id)

    const result = await sql(query, values)

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
