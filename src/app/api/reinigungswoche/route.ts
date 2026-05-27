import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { NO_STORE_PRIVATE } from '@/lib/apiCache'
import type { ReinigungswocheStore } from '@/lib/reinigungswoche'
import { normalizeStoreFromStorage } from '@/lib/reinigungswoche'

const sql = neon(process.env.DATABASE_URL!)

function parseStore(raw: string | null | undefined): ReinigungswocheStore {
  if (!raw || raw.trim() === '') {
    return { weeks: {} }
  }
  try {
    const parsed = JSON.parse(raw) as ReinigungswocheStore
    if (parsed && typeof parsed === 'object' && parsed.weeks && typeof parsed.weeks === 'object') {
      return normalizeStoreFromStorage(parsed)
    }
  } catch {
    /* ignore */
  }
  return { weeks: {} }
}

export async function GET() {
  try {
    const rows = await sql`
      SELECT data_json FROM reinigungswoche_board WHERE id = 'singleton' LIMIT 1
    `
    const row = rows[0] as { data_json: string } | undefined
    const store = parseStore(row?.data_json)
    return NextResponse.json(store, {
      headers: { 'Cache-Control': NO_STORE_PRIVATE },
    })
  } catch (error) {
    console.error('GET /api/reinigungswoche:', error)
    return NextResponse.json(
      { error: 'Failed to load reinigungswoche', weeks: {} },
      { status: 500, headers: { 'Cache-Control': NO_STORE_PRIVATE } },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as ReinigungswocheStore
    if (!body || typeof body !== 'object' || !body.weeks || typeof body.weeks !== 'object') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const normalized = normalizeStoreFromStorage(body)
    const json = JSON.stringify(normalized)
    await sql`
      INSERT INTO reinigungswoche_board (id, data_json, updated_at)
      VALUES ('singleton', ${json}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        data_json = EXCLUDED.data_json,
        updated_at = NOW()
    `
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': NO_STORE_PRIVATE } })
  } catch (error) {
    console.error('PUT /api/reinigungswoche:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
