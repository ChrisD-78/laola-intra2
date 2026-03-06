import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET: Pinnwand-Einträge laden
export async function GET() {
  try {
    const rows = await sql`
      SELECT
        id,
        title,
        date,
        category,
        image_url,
        image_name,
        created_by,
        created_at
      FROM chat_pinnwand_entries
      ORDER BY created_at DESC
      LIMIT 200
    `
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Failed to fetch pinnwand entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pinnwand entries' },
      { status: 500 }
    )
  }
}

// POST: Neuen Pinnwand-Eintrag anlegen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, date, category, image_url, image_name, created_by } = body || {}

    if (!title || !category || !created_by) {
      return NextResponse.json(
        { error: 'Missing required fields (title, category, created_by)' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO chat_pinnwand_entries (
        title,
        date,
        category,
        image_url,
        image_name,
        created_by
      ) VALUES (
        ${title},
        ${date || null},
        ${category},
        ${image_url || null},
        ${image_name || null},
        ${created_by}
      )
      RETURNING
        id,
        title,
        date,
        category,
        image_url,
        image_name,
        created_by,
        created_at
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create pinnwand entry:', error)
    return NextResponse.json(
      { error: 'Failed to create pinnwand entry' },
      { status: 500 }
    )
  }
}

