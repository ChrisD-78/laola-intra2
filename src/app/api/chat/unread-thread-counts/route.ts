import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { NO_STORE_PRIVATE } from '@/lib/apiCache'

const sql = neon(process.env.DATABASE_URL!)

/**
 * Sidebar-Badges: Ungelesene Direktnachrichten pro Partner + Gruppen pro Gruppe.
 * Logik wie /api/chat/unread-summary (is_read ODER Eintrag in chat_message_reads).
 */
export async function GET(request: NextRequest) {
  try {
    const viewer = request.nextUrl.searchParams.get('viewer')
    if (!viewer?.trim()) {
      return NextResponse.json({ error: 'Missing viewer' }, { status: 400 })
    }

    const [directRows, groupRows] = await Promise.all([
      sql`
        SELECT m.sender_id AS peer_id, COUNT(*)::int AS c
        FROM chat_messages m
        WHERE m.group_id IS NULL
          AND m.recipient_id = ${viewer}
          AND NOT (
            COALESCE(m.is_read, false)
            OR EXISTS (
              SELECT 1 FROM chat_message_reads r
              WHERE r.message_id = m.id AND r.user_id = ${viewer}
            )
          )
        GROUP BY m.sender_id
      `,
      sql`
        SELECT m.group_id::text AS gid, COUNT(*)::int AS c
        FROM chat_messages m
        INNER JOIN chat_group_members gm ON gm.group_id = m.group_id AND gm.user_id = ${viewer}
        WHERE m.group_id IS NOT NULL
          AND m.sender_id <> ${viewer}
          AND NOT (
            COALESCE(m.is_read, false)
            OR EXISTS (
              SELECT 1 FROM chat_message_reads r
              WHERE r.message_id = m.id AND r.user_id = ${viewer}
            )
          )
        GROUP BY m.group_id
      `,
    ])

    const directByPeer: Record<string, number> = {}
    for (const row of directRows as { peer_id: string; c: number }[]) {
      if (row.peer_id) directByPeer[row.peer_id] = Number(row.c) || 0
    }

    const groupById: Record<string, number> = {}
    for (const row of groupRows as { gid: string; c: number }[]) {
      if (row.gid) groupById[row.gid] = Number(row.c) || 0
    }

    return NextResponse.json(
      { directByPeer, groupById },
      { headers: { 'Cache-Control': NO_STORE_PRIVATE } },
    )
  } catch (error) {
    console.error('Failed to fetch unread thread counts:', error)
    return NextResponse.json({ error: 'Failed to fetch unread thread counts' }, { status: 500 })
  }
}
