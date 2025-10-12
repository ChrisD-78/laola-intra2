import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET all chat groups
export async function GET() {
  try {
    const groups = await sql`
      SELECT * FROM chat_groups 
      ORDER BY created_at DESC
    `
    return NextResponse.json(groups)
  } catch (error) {
    console.error('Failed to fetch chat groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat groups' },
      { status: 500 }
    )
  }
}

// POST create new chat group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, created_by } = body

    const result = await sql`
      INSERT INTO chat_groups (name, description, created_by)
      VALUES (${name}, ${description || null}, ${created_by})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create chat group:', error)
    return NextResponse.json(
      { error: 'Failed to create chat group' },
      { status: 500 }
    )
  }
}
