import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

// POST - Neuen Benutzer erstellen (nur für Admins)
export async function POST(request: NextRequest) {
  try {
    const { username, password, displayName, role, createdBy } = await request.json()

    // Validierung
    if (!username || !password || !displayName) {
      return NextResponse.json(
        { success: false, error: 'Benutzername, Passwort und Anzeigename sind erforderlich' },
        { status: 400 }
      )
    }

    if (password.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Passwort muss mindestens 5 Zeichen lang sein' },
        { status: 400 }
      )
    }

    // Neon Datenbank-Verbindung
    const sql = neon(process.env.DATABASE_URL!)

    // Prüfe ob Benutzername bereits existiert
    const existingUser = await sql`
      SELECT id FROM users WHERE username = ${username}
    `

    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Benutzername existiert bereits' },
        { status: 409 }
      )
    }

    // Validiere Rolle
    const validRoles = ['Admin', 'Verwaltung', 'Technik', 'Benutzer']
    const userRole = role && validRoles.includes(role) ? role : 'Benutzer'
    const isAdmin = userRole === 'Admin'

    // Benutzer erstellen
    const result = await sql`
      INSERT INTO users (
        username,
        password,
        display_name,
        role,
        is_admin,
        is_active,
        created_by
      ) VALUES (
        ${username},
        ${password},
        ${displayName},
        ${userRole},
        ${isAdmin},
        true,
        ${createdBy || null}
      )
      RETURNING id, username, display_name, role, is_admin, is_active, created_at
    `

    const newUser = result[0]

    console.log('✅ Neuer Benutzer erstellt:', newUser.username)

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.display_name,
        role: newUser.role,
        isAdmin: newUser.is_admin,
        isActive: newUser.is_active,
        createdAt: newUser.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Erstellen des Benutzers' },
      { status: 500 }
    )
  }
}

