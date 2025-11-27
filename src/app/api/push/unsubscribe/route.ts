import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// POST - Subscription entfernen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint erforderlich' },
        { status: 400 }
      )
    }

    await sql`
      DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove subscription:', error)
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    )
  }
}

