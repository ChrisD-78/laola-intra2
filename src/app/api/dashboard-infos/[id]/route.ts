import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const { title, content, is_popup } = await request.json()
    const { id } = params

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL)
    
    const result = await sql(
      `UPDATE dashboard_infos 
       SET title = $1, content = $2, is_popup = $3
       WHERE id = $4
       RETURNING *`,
      [title, content, is_popup || false, id]
    )

    if (result.length === 0) {
      return NextResponse.json({ error: 'Dashboard info not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error('Failed to update dashboard info:', error)
    return NextResponse.json({ error: 'Failed to update dashboard info' }, { status: 500 })
  }
}

