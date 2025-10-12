import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET all trainings
export async function GET() {
  try {
    const trainings = await sql`
      SELECT * FROM trainings 
      ORDER BY created_at DESC
    `
    return NextResponse.json(trainings)
  } catch (error) {
    console.error('Failed to fetch trainings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trainings' },
      { status: 500 }
    )
  }
}

// POST create new training
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/trainings - Starting...')
    const body = await request.json()
    console.log('Request body:', body)
    
    const { title, description, category, file_name, file_size_mb, file_type, file_url } = body

    console.log('Inserting training into database...')
    const result = await sql`
      INSERT INTO trainings (
        title, description, category, file_name, file_size_mb, file_type, file_url
      ) VALUES (
        ${title}, ${description}, ${category}, ${file_name || null}, 
        ${file_size_mb || null}, ${file_type || null}, ${file_url || null}
      )
      RETURNING *
    `

    console.log('Training insert successful:', result[0])
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('=== TRAINING CREATE ERROR ===')
    console.error('Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create training',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// DELETE training
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await sql`DELETE FROM trainings WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete training:', error)
    return NextResponse.json(
      { error: 'Failed to delete training' },
      { status: 500 }
    )
  }
}
