import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Benutzername und Passwort erforderlich' },
        { status: 400 }
      )
    }

    // Neon Datenbank-Verbindung
    const sql = neon(process.env.DATABASE_URL!)

    // Benutzer aus Datenbank abrufen
    const result = await sql`
      SELECT 
        id,
        username,
        password,
        display_name,
        is_admin,
        role,
        is_active
      FROM users
      WHERE username = ${username}
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      )
    }

    const user = result[0]

    // Prüfe ob Benutzer aktiv ist
    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: 'Benutzerkonto ist deaktiviert' },
        { status: 403 }
      )
    }

    // Passwort prüfen (direkt vergleichen - in Produktion sollte dies gehasht sein)
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      )
    }

    // Login erfolgreich - Aktualisiere last_login
    await sql`
      UPDATE users
      SET last_login = NOW()
      WHERE id = ${user.id}
    `

    // Sende Benutzerdaten zurück (ohne Passwort!)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        isAdmin: user.is_admin,
        role: user.role || 'Benutzer'
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Serverfehler beim Login' },
      { status: 500 }
    )
  }
}

