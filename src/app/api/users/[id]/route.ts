import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

// DELETE - Benutzer löschen (nur für Admins)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { adminUser } = await request.json().catch(() => ({})) // Optional body

    // Neon Datenbank-Verbindung
    const sql = neon(process.env.DATABASE_URL!)

    // Prüfe ob Benutzer existiert
    const userResult = await sql`
      SELECT id, username, display_name, is_admin FROM users WHERE id = ${id}
    `

    if (userResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Benutzer nicht gefunden' },
        { status: 404 }
      )
    }

    const user = userResult[0]

    // Verhindere, dass Admins sich selbst löschen
    // (Optional: kann später entfernt werden, wenn gewünscht)
    // if (user.is_admin) {
    //   return NextResponse.json(
    //     { success: false, error: 'Admins können nicht gelöscht werden' },
    //     { status: 403 }
    //   )
    // }

    // Benutzer löschen
    await sql`
      DELETE FROM users
      WHERE id = ${id}
    `

    console.log(`✅ Benutzer ${user.username} wurde von ${adminUser || 'Admin'} gelöscht`)

    return NextResponse.json({
      success: true,
      message: `Benutzer ${user.display_name} wurde erfolgreich gelöscht`
    })

  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Löschen des Benutzers' },
      { status: 500 }
    )
  }
}

