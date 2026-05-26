import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { NO_STORE_PRIVATE } from '@/lib/apiCache'

const sql = neon(process.env.DATABASE_URL!)

/** GET nur für einen Viewer-Kontext — wie bisher ohne Server-Session vom Client gesetzt */
export async function GET(request: NextRequest) {
  try {
    const viewer = request.nextUrl.searchParams.get('viewer')
    if (!viewer?.trim()) {
      return NextResponse.json({ error: 'Missing viewer' }, { status: 400 })
    }

    const [directRow, groupRow, latestRows] = await Promise.all([
      sql`
        SELECT COUNT(*)::int AS c
        FROM chat_messages m
        WHERE m.group_id IS NULL
          AND m.recipient_id = ${viewer}
          AND NOT (
            COALESCE(m.is_read, false)
            OR EXISTS (
              SELECT 1
              FROM chat_message_reads r
              WHERE r.message_id = m.id AND r.user_id = ${viewer}
            )
          )
      `,
      sql`
        SELECT COUNT(*)::int AS c
        FROM chat_messages m
        INNER JOIN chat_group_members gm ON gm.group_id = m.group_id AND gm.user_id = ${viewer}
        WHERE m.group_id IS NOT NULL
          AND m.sender_id <> ${viewer}
          AND NOT (
            COALESCE(m.is_read, false)
            OR EXISTS (
              SELECT 1
              FROM chat_message_reads r
              WHERE r.message_id = m.id AND r.user_id = ${viewer}
            )
          )
      `,
      sql`
        SELECT sender, content, ts, image_url FROM (
          SELECT
            m.sender_id AS sender,
            m.content,
            m.created_at AS ts,
            m.image_url AS image_url
          FROM chat_messages m
          WHERE m.group_id IS NULL
            AND m.recipient_id = ${viewer}
            AND NOT (
              COALESCE(m.is_read, false)
              OR EXISTS (
                SELECT 1
                FROM chat_message_reads r
                WHERE r.message_id = m.id AND r.user_id = ${viewer}
              )
            )
          UNION ALL
          SELECT
            m.sender_id,
            m.content,
            m.created_at,
            m.image_url
          FROM chat_messages m
          INNER JOIN chat_group_members gm ON gm.group_id = m.group_id AND gm.user_id = ${viewer}
          WHERE m.group_id IS NOT NULL
            AND m.sender_id <> ${viewer}
            AND NOT (
              COALESCE(m.is_read, false)
              OR EXISTS (
                SELECT 1
                FROM chat_message_reads r
                WHERE r.message_id = m.id AND r.user_id = ${viewer}
              )
            )
        ) unread_messages
        ORDER BY ts DESC
        LIMIT 1
      `,
    ])

    const directUnread = Number((directRow?.[0] as { c: number })?.c ?? 0)
    const groupUnread = Number((groupRow?.[0] as { c: number })?.c ?? 0)
    const unreadCount = directUnread + groupUnread

    const latestRaw = latestRows?.[0] as
      | {
          sender: string
          content: string
          ts: string | Date
          image_url: string | null
        }
      | undefined

    const latestMessage =
      unreadCount > 0 && latestRaw
        ? {
            sender: latestRaw.sender,
            content: latestRaw.image_url ? '📷 Bild' : latestRaw.content || 'Nachricht',
            timestamp:
              typeof latestRaw.ts === 'string'
                ? latestRaw.ts
                : new Date(latestRaw.ts).toISOString(),
            isImage: !!latestRaw.image_url,
          }
        : null

    return NextResponse.json(
      { unreadCount, latestMessage },
      { headers: { 'Cache-Control': NO_STORE_PRIVATE } },
    )
  } catch (error) {
    console.error('Failed to fetch unread summary:', error)
    return NextResponse.json({ error: 'Failed to fetch unread summary' }, { status: 500 })
  }
}
