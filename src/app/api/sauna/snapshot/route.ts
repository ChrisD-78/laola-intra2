import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) return null
  return neon(url)
}

export async function GET() {
  const sql = getSql()
  if (!sql) {
    return NextResponse.json({ payload: null, updated_at: null })
  }

  try {
    const rows = await sql`
      SELECT payload, updated_at
      FROM sauna_aufguss_snapshot
      WHERE id = 1
    `
    if (!rows?.length) {
      return NextResponse.json({ payload: null, updated_at: null })
    }
    const row = rows[0] as { payload: unknown; updated_at: Date | string }
    return NextResponse.json({
      payload: row.payload,
      updated_at:
        typeof row.updated_at === 'string' ? row.updated_at : row.updated_at?.toISOString?.() ?? null,
    })
  } catch (e) {
    console.error('[sauna/snapshot GET]', e)
    return NextResponse.json({
      payload: null,
      updated_at: null,
      error: 'table_or_query_failed',
      hint: 'sql/create_sauna_aufguss_snapshot.sql in Neon ausführen',
    })
  }
}

export async function PUT(request: NextRequest) {
  const sql = getSql()
  if (!sql) {
    return NextResponse.json({ error: 'DATABASE_URL ist nicht gesetzt' }, { status: 503 })
  }

  let body: { adminUser?: string; payload?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültiger JSON-Body' }, { status: 400 })
  }

  const adminUser = typeof body.adminUser === 'string' ? body.adminUser.trim() : ''
  if (!adminUser) {
    return NextResponse.json({ error: 'adminUser erforderlich' }, { status: 400 })
  }

  const { payload } = body
  if (payload === undefined || typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return NextResponse.json({ error: 'payload muss ein Objekt sein' }, { status: 400 })
  }

  try {
    const adminResult = await sql`
      SELECT is_admin
      FROM users
      WHERE display_name = ${adminUser} OR username = ${adminUser}
      LIMIT 1
    `
    const row = adminResult[0] as { is_admin: boolean } | undefined
    if (!row?.is_admin) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
    }

    const jsonStr = JSON.stringify(payload)

    await sql`
      INSERT INTO sauna_aufguss_snapshot (id, payload, updated_at)
      VALUES (1, ${jsonStr}::jsonb, now())
      ON CONFLICT (id) DO UPDATE SET
        payload = EXCLUDED.payload,
        updated_at = now()
    `

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[sauna/snapshot PUT]', e)
    return NextResponse.json(
      {
        error: 'Speichern fehlgeschlagen',
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    )
  }
}
