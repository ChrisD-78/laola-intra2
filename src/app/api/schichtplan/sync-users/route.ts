import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// POST - Synchronisiere Benutzer aus users Tabelle zu schichtplan_employees
export async function POST(request: NextRequest) {
  try {
    // Hole alle aktiven Benutzer aus users Tabelle
    const users = await sql`
      SELECT 
        id,
        username,
        display_name,
        role,
        is_admin
      FROM users
      WHERE is_active = true
      ORDER BY display_name
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Keine aktiven Benutzer gefunden' },
        { status: 404 }
      )
    }

    const syncedEmployees = []
    const errors = []

    // Für jeden Benutzer einen Schichtplan-Mitarbeiter erstellen oder aktualisieren
    for (const user of users) {
      try {
        // Extrahiere Vor- und Nachname aus display_name
        const nameParts = user.display_name.trim().split(' ')
        const firstName = nameParts[0] || user.username
        const lastName = nameParts.slice(1).join(' ') || user.username

        // Verwende user.id als employee.id (als String)
        const employeeId = user.id.toString()

        // Prüfe ob Mitarbeiter bereits existiert
        const existing = await sql`
          SELECT id FROM schichtplan_employees WHERE user_id = ${user.id}
        `

        if (existing.length > 0) {
          // Aktualisiere bestehenden Mitarbeiter
          await sql`
            UPDATE schichtplan_employees
            SET 
              first_name = ${firstName},
              last_name = ${lastName},
              role = ${user.role || 'Benutzer'},
              updated_at = NOW()
            WHERE user_id = ${user.id}
          `
        } else {
          // Erstelle neuen Mitarbeiter mit Standard-Bereich
          await sql`
            INSERT INTO schichtplan_employees (
              id,
              user_id,
              first_name,
              last_name,
              areas,
              role
            ) VALUES (
              ${employeeId},
              ${user.id},
              ${firstName},
              ${lastName},
              ARRAY['Halle']::TEXT[],
              ${user.role || 'Benutzer'}
            )
          `
        }

        syncedEmployees.push({
          id: employeeId,
          firstName,
          lastName,
          role: user.role || 'Benutzer',
          username: user.username
        })
      } catch (error) {
        console.error(`Fehler beim Synchronisieren von ${user.display_name}:`, error)
        errors.push({
          username: user.username,
          error: error instanceof Error ? error.message : 'Unbekannter Fehler'
        })
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedEmployees.length,
      employees: syncedEmployees,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Failed to sync users:', error)
    return NextResponse.json(
      { error: 'Failed to sync users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET - Prüfe Synchronisationsstatus
export async function GET() {
  try {
    // Zähle Benutzer in users Tabelle
    const usersCount = await sql`
      SELECT COUNT(*) as count FROM users WHERE is_active = true
    `

    // Zähle Mitarbeiter in schichtplan_employees mit user_id
    const employeesCount = await sql`
      SELECT COUNT(*) as count FROM schichtplan_employees WHERE user_id IS NOT NULL
    `

    // Finde Benutzer ohne Schichtplan-Mitarbeiter
    const missingEmployees = await sql`
      SELECT 
        u.id,
        u.username,
        u.display_name,
        u.role
      FROM users u
      LEFT JOIN schichtplan_employees se ON se.user_id = u.id
      WHERE u.is_active = true AND se.id IS NULL
      ORDER BY u.display_name
    `

    return NextResponse.json({
      usersCount: usersCount[0].count,
      employeesCount: employeesCount[0].count,
      missingEmployees: missingEmployees,
      needsSync: missingEmployees.length > 0
    })
  } catch (error) {
    console.error('Failed to check sync status:', error)
    return NextResponse.json(
      { error: 'Failed to check sync status' },
      { status: 500 }
    )
  }
}

