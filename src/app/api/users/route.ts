import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

// GET - Alle Benutzer abrufen (nur für Admins)
export async function GET() {
  try {
    // Neon Datenbank-Verbindung
    const sql = neon(process.env.DATABASE_URL!)
    
    const result = await sql`
      SELECT 
        id,
        username,
        display_name,
        is_admin,
        role,
        is_active,
        created_at,
        last_login,
        created_by,
        phone,
        email
      FROM users
      ORDER BY 
        CASE role
          WHEN 'Admin' THEN 1
          WHEN 'Teamleiter' THEN 2
          WHEN 'Technik' THEN 3
          WHEN 'Benutzer' THEN 4
          ELSE 5
        END,
        display_name ASC
    `

    /** Kein CDN-Teilen ( sensible Daten ); nur Browser spart Bandbreite */
    return NextResponse.json(
      { success: true, users: result },
      { headers: { 'Cache-Control': 'private, max-age=10, stale-while-revalidate=30' } },
    )

  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Abrufen der Benutzer' },
      { status: 500 }
    )
  }
}

