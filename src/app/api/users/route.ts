import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

// GET - Alle Benutzer abrufen (nur für Admins)
export async function GET() {
  try {
    const result = await sql`
      SELECT 
        id,
        username,
        display_name,
        is_admin,
        is_active,
        created_at,
        last_login,
        created_by
      FROM users
      ORDER BY is_admin DESC, display_name ASC
    `

    return NextResponse.json({
      success: true,
      users: result.rows
    })

  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Abrufen der Benutzer' },
      { status: 500 }
    )
  }
}

