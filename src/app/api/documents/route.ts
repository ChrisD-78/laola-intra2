import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET all documents (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const tags = searchParams.get('tags')

    let documents
    
    if (category) {
      documents = await sql`
        SELECT * FROM documents 
        WHERE category = ${category}
        ORDER BY uploaded_at DESC
      `
    } else if (tags) {
      const tagArray = tags.split(',')
      documents = await sql`
        SELECT * FROM documents 
        WHERE tags && ${tagArray}
        ORDER BY uploaded_at DESC
      `
    } else {
      documents = await sql`
        SELECT * FROM documents 
        ORDER BY uploaded_at DESC
      `
    }

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Failed to fetch documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

// POST create new document
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/documents - Starting...')
    const body = await request.json()
    console.log('Request body:', body)
    
    const { title, description, category, file_name, file_size_mb, file_type, tags, uploaded_by, file_url } = body

    console.log('Inserting document into database...')
    const result = await sql`
      INSERT INTO documents (
        title, description, category, file_name, file_size_mb, file_type, tags, uploaded_by, file_url
      ) VALUES (
        ${title}, ${description}, ${category}, ${file_name}, ${file_size_mb}, ${file_type}, 
        ${tags || []}, ${uploaded_by}, ${file_url}
      )
      RETURNING *
    `

    console.log('Document insert successful:', result[0])
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('=== DOCUMENT CREATE ERROR ===')
    console.error('Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create document',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// DELETE document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await sql`DELETE FROM documents WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
