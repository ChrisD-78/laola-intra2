import { NextResponse } from 'next/server'
import { getAgentStats } from '@/lib/agentUsage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Echte Kennzahlen für das Agent-Dashboard. */
export async function GET() {
  try {
    const stats = await getAgentStats()
    return NextResponse.json(stats)
  } catch (e) {
    console.error('GET /api/agent/stats', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Statistik nicht verfügbar' },
      { status: 500 },
    )
  }
}
