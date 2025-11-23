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
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL ist nicht gesetzt!')
      return NextResponse.json(
        { success: false, error: 'Datenbankverbindung nicht konfiguriert' },
        { status: 500 }
      )
    }
    
    const sql = neon(process.env.DATABASE_URL)

    // Benutzer aus Datenbank abrufen
    console.log('Login attempt for username:', username)
    
    // Case-insensitive Suche für Benutzername
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
      WHERE LOWER(username) = LOWER(${username})
      LIMIT 1
    `

    console.log('Database query result:', {
      found: result.length > 0,
      username: result.length > 0 ? result[0].username : null,
      isActive: result.length > 0 ? result[0].is_active : null
    })

    if (result.length === 0) {
      console.log('User not found in database')
      return NextResponse.json(
        { success: false, error: 'Benutzer nicht gefunden. Bitte überprüfen Sie den Benutzernamen.' },
        { status: 401 }
      )
    }

    const user = result[0]

    // Prüfe ob Benutzer aktiv ist
    if (!user.is_active) {
      console.log('User account is deactivated:', user.username)
      return NextResponse.json(
        { success: false, error: 'Benutzerkonto ist deaktiviert' },
        { status: 403 }
      )
    }

    // Passwort prüfen (direkt vergleichen - in Produktion sollte dies gehasht sein)
    const passwordMatch = user.password === password
    console.log('Password check:', {
      providedLength: password.length,
      storedLength: user.password?.length || 0,
      match: passwordMatch
    })
    
    if (!passwordMatch) {
      console.log('Password mismatch for user:', user.username)
      return NextResponse.json(
        { success: false, error: 'Falsches Passwort. Bitte versuchen Sie es erneut.' },
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
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
    return NextResponse.json(
      { success: false, error: `Serverfehler beim Login: ${errorMessage}` },
      { status: 500 }
    )
  }
}

