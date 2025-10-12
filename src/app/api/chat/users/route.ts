import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET all chat users
export async function GET() {
  try {
    const users = await sql`
      SELECT * FROM chat_users 
      ORDER BY name ASC
    `
    return NextResponse.json(users)
  } catch (error) {
    console.error('Failed to fetch chat users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat users' },
      { status: 500 }
    )
  }
}

// POST create or update chat user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, avatar } = body

    // Upsert user (insert or update if exists)
    const result = await sql`
      INSERT INTO chat_users (id, name, avatar, is_online)
      VALUES (${id}, ${name}, ${avatar || null}, true)
      ON CONFLICT (id) 
      DO UPDATE SET 
        name = ${name},
        avatar = ${avatar || null},
        is_online = true,
        updated_at = NOW()
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to upsert chat user:', error)
    return NextResponse.json(
      { error: 'Failed to upsert chat user' },
      { status: 500 }
    )
  }
}
