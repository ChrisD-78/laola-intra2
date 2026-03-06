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
    const forUser = searchParams.get('forUser') // optional: für wen werden die Lesebestätigungen geladen

    let messages

    if (groupId) {
      // Get group messages inkl. Lesebestätigungen
      messages = await sql`
        SELECT 
          m.*,
          COALESCE(
            (
              SELECT array_agg(r.user_id)
              FROM chat_message_reads r
              WHERE r.message_id = m.id
            ),
            ARRAY[]::VARCHAR[]
          ) AS read_by
        FROM chat_messages m
        WHERE m.group_id = ${groupId}
        ORDER BY m.created_at ASC
      `
    } else if (user1 && user2) {
      // Get direct messages zwischen zwei Benutzern inkl. Lesebestätigungen
      messages = await sql`
        SELECT 
          m.*,
          COALESCE(
            (
              SELECT array_agg(r.user_id)
              FROM chat_message_reads r
              WHERE r.message_id = m.id
            ),
            ARRAY[]::VARCHAR[]
          ) AS read_by
        FROM chat_messages m
        WHERE (m.sender_id = ${user1} AND m.recipient_id = ${user2})
           OR (m.sender_id = ${user2} AND m.recipient_id = ${user1})
        ORDER BY m.created_at ASC
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
    const { messageId, isRead, readerId } = body

    if (!messageId || typeof isRead !== 'boolean' || !readerId) {
      return NextResponse.json(
        { error: 'Missing required fields (messageId, isRead, readerId)' },
        { status: 400 }
      )
    }

    // Für Direktnachrichten: is_read-Flag in der Nachricht selbst setzen,
    // für Gruppennachrichten bleibt is_read unverändert und es wird nur
    // der Leseeintrag pro Benutzer erfasst.
    const result = await sql`
      UPDATE chat_messages 
      SET is_read = CASE 
        WHEN group_id IS NULL THEN ${isRead}
        ELSE is_read
      END
      WHERE id = ${messageId}
      RETURNING *
    `

    // Lese-Bestätigung pro Benutzer speichern
    await sql`
      INSERT INTO chat_message_reads (message_id, user_id)
      VALUES (${messageId}, ${readerId})
      ON CONFLICT (message_id, user_id)
      DO UPDATE SET read_at = NOW()
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
