import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET all completions for a specific recurring task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const completions = await sql`
      SELECT * FROM recurring_task_completions 
      WHERE recurring_task_id = ${id}
      ORDER BY completed_at DESC
    `
    
    return NextResponse.json(completions)
  } catch (error) {
    console.error('Failed to fetch task completions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task completions' },
      { status: 500 }
    )
  }
}
