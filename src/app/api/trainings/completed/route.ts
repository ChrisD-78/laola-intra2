import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET all completed trainings
export async function GET() {
  try {
    const completed = await sql`
      SELECT 
        ct.*,
        t.title as training_title
      FROM completed_trainings ct
      LEFT JOIN trainings t ON ct.training_id = t.id
      ORDER BY ct.completed_at DESC
    `
    return NextResponse.json(completed)
  } catch (error) {
    console.error('Failed to fetch completed trainings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch completed trainings' },
      { status: 500 }
    )
  }
}

// POST mark training as completed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { training_id, completed_by, notes } = body

    const result = await sql`
      INSERT INTO completed_trainings (
        training_id, completed_by, notes
      ) VALUES (
        ${training_id}, ${completed_by}, ${notes || null}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to mark training as completed:', error)
    return NextResponse.json(
      { error: 'Failed to mark training as completed' },
      { status: 500 }
    )
  }
}
