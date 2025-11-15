import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

// PUT - Passwort für einen Benutzer zurücksetzen (nur für Admins)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { newPassword, adminUser } = await request.json()

    // Validierung
    if (!newPassword) {
      return NextResponse.json(
        { success: false, error: 'Neues Passwort ist erforderlich' },
        { status: 400 }
      )
    }

    if (newPassword.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Passwort muss mindestens 5 Zeichen lang sein' },
        { status: 400 }
      )
    }

    // Neon Datenbank-Verbindung
    const sql = neon(process.env.DATABASE_URL!)

    // Prüfe ob Benutzer existiert
    const userResult = await sql`
      SELECT id, username, display_name FROM users WHERE id = ${id}
    `

    if (userResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Benutzer nicht gefunden' },
        { status: 404 }
      )
    }

    const user = userResult[0]

    // Passwort aktualisieren
    await sql`
      UPDATE users
      SET password = ${newPassword},
          updated_at = NOW()
      WHERE id = ${id}
    `

    console.log(`✅ Passwort für Benutzer ${user.username} wurde von ${adminUser || 'Admin'} zurückgesetzt`)

    return NextResponse.json({
      success: true,
      message: `Passwort für ${user.display_name} wurde erfolgreich zurückgesetzt`
    })

  } catch (error) {
    console.error('Failed to reset password:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Zurücksetzen des Passworts' },
      { status: 500 }
    )
  }
}

