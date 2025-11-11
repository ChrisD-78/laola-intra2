import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const { title, content, is_popup } = await request.json()
    const { id } = await params

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL)
    
    // Use Neon's template string syntax
    const result = await sql`
      UPDATE dashboard_infos 
      SET title = ${title}, 
          content = ${content}, 
          is_popup = ${is_popup || false}
      WHERE id = ${id}
      RETURNING *
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Dashboard info not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error('Failed to update dashboard info:', error)
    return NextResponse.json({ 
      error: 'Failed to update dashboard info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

