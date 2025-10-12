import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET messages (direct or group)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user1 = searchParams.get('user1')
    const user2 = searchParams.get('user2')
    const groupId = searchParams.get('groupId')

    let messages

    if (groupId) {
      // Get group messages
      messages = await sql`
        SELECT * FROM chat_messages 
        WHERE group_id = ${groupId}
        ORDER BY created_at ASC
      `
    } else if (user1 && user2) {
      // Get direct messages between two users
      messages = await sql`
        SELECT * FROM chat_messages 
        WHERE (sender_id = ${user1} AND recipient_id = ${user2})
           OR (sender_id = ${user2} AND recipient_id = ${user1})
        ORDER BY created_at ASC
      `
    } else {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST send new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sender_id, recipient_id, group_id, content, image_url, image_name } = body

    const result = await sql`
      INSERT INTO chat_messages (
        sender_id, recipient_id, group_id, content, image_url, image_name
      ) VALUES (
        ${sender_id}, ${recipient_id || null}, ${group_id || null}, 
        ${content}, ${image_url || null}, ${image_name || null}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// PATCH update message (mark as read)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, isRead } = body

    const result = await sql`
      UPDATE chat_messages 
      SET is_read = ${isRead}
      WHERE id = ${messageId}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to update message:', error)
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    )
  }
}
