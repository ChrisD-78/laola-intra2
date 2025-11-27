import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// POST - Synchronisiere Benutzer aus users Tabelle zu schichtplan_employees
export async function POST(request: NextRequest) {
  try {
    // Prüfe ob user_id Spalte existiert
    let hasUserIdColumn = false
    try {
      const checkColumn = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'schichtplan_employees' 
        AND column_name = 'user_id'
      `
      hasUserIdColumn = checkColumn.length > 0
    } catch (checkError) {
      console.log('Could not check for user_id column, assuming it does not exist')
      hasUserIdColumn = false
    }

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

        let existing: any[] = []
        
        if (hasUserIdColumn) {
          // Prüfe ob Mitarbeiter bereits existiert (mit user_id)
          existing = await sql`
            SELECT id FROM schichtplan_employees WHERE user_id = ${user.id}
          `
        } else {
          // Prüfe ob Mitarbeiter bereits existiert (ohne user_id, nur nach id)
          existing = await sql`
            SELECT id FROM schichtplan_employees WHERE id = ${employeeId}
          `
        }

        if (existing.length > 0) {
          // Aktualisiere bestehenden Mitarbeiter
          if (hasUserIdColumn) {
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
            await sql`
              UPDATE schichtplan_employees
              SET 
                first_name = ${firstName},
                last_name = ${lastName},
                updated_at = NOW()
              WHERE id = ${employeeId}
            `
          }
        } else {
          // Erstelle neuen Mitarbeiter mit Standard-Bereich
          if (hasUserIdColumn) {
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
          } else {
            await sql`
              INSERT INTO schichtplan_employees (
                id,
                first_name,
                last_name,
                areas
              ) VALUES (
                ${employeeId},
                ${firstName},
                ${lastName},
                ARRAY['Halle']::TEXT[]
              )
            `
          }
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
      SELECT COUNT(*)::int as count FROM users WHERE is_active = true
    `

    // Prüfe ob user_id Spalte existiert
    let employeesCount: any[] = []
    let missingEmployees: any[] = []
    
    try {
      // Versuche zu prüfen, ob user_id Spalte existiert
      const checkColumn = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'schichtplan_employees' 
        AND column_name = 'user_id'
      `
      
      if (checkColumn.length > 0) {
        // user_id Spalte existiert - verwende normale Abfrage
        employeesCount = await sql`
          SELECT COUNT(*)::int as count FROM schichtplan_employees WHERE user_id IS NOT NULL
        `

        missingEmployees = await sql`
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
      } else {
        // user_id Spalte existiert nicht - alle Benutzer müssen synchronisiert werden
        employeesCount = [{ count: 0 }]
        
        missingEmployees = await sql`
          SELECT 
            id,
            username,
            display_name,
            role
          FROM users
          WHERE is_active = true
          ORDER BY display_name
        `
      }
    } catch (columnError) {
      // Falls Fehler beim Prüfen der Spalte, nehme an, dass sie nicht existiert
      console.log('user_id column might not exist, assuming all users need sync')
      employeesCount = [{ count: 0 }]
      
      missingEmployees = await sql`
        SELECT 
          id,
          username,
          display_name,
          role
        FROM users
        WHERE is_active = true
        ORDER BY display_name
      `
    }

    return NextResponse.json({
      usersCount: usersCount[0]?.count || 0,
      employeesCount: employeesCount[0]?.count || 0,
      missingEmployees: missingEmployees,
      needsSync: missingEmployees.length > 0
    })
  } catch (error) {
    console.error('Failed to check sync status:', error)
    // Gib trotzdem eine Antwort zurück, damit die Seite nicht crasht
    return NextResponse.json({
      usersCount: 0,
      employeesCount: 0,
      missingEmployees: [],
      needsSync: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

