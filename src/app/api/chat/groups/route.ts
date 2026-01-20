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
    const members = await sql`
      SELECT group_id, user_id
      FROM chat_group_members
    `
    const membersByGroup = new Map<string, string[]>()
    members.forEach((row: { group_id: string; user_id: string }) => {
      const list = membersByGroup.get(row.group_id) || []
      list.push(row.user_id)
      membersByGroup.set(row.group_id, list)
    })

    const enriched = groups.map((group: { id: string }) => ({
      ...group,
      members: membersByGroup.get(group.id) || []
    }))

    return NextResponse.json(enriched)
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
    const { name, description, created_by, members } = body

    const result = await sql`
      INSERT INTO chat_groups (name, description, created_by)
      VALUES (${name}, ${description || null}, ${created_by})
      RETURNING *
    `

    const group = result[0]
    const memberList = Array.from(
      new Set([...(Array.isArray(members) ? members : []), created_by].filter(Boolean))
    )

    if (memberList.length > 0) {
      const values = memberList.map((userId: string) => [group.id, userId])
      await sql`
        INSERT INTO chat_group_members (group_id, user_id)
        SELECT * FROM UNNEST(
          ${values.map(v => v[0])}::uuid[],
          ${values.map(v => v[1])}::text[]
        )
      `
    }

    return NextResponse.json({ ...group, members: memberList }, { status: 201 })
  } catch (error) {
    console.error('Failed to create chat group:', error)
    return NextResponse.json(
      { error: 'Failed to create chat group' },
      { status: 500 }
    )
  }
}
