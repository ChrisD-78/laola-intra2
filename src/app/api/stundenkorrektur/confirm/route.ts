import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

const getUserEmailByName = async (name: string) => {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return null

  const exact = await sql`
    SELECT email, display_name, username
    FROM users
    WHERE lower(display_name) = ${normalized} OR lower(username) = ${normalized}
    LIMIT 1
  `
  if (exact.length > 0 && exact[0].email) return exact[0].email as string

  const fuzzy = await sql`
    SELECT email, display_name, username
    FROM users
    WHERE display_name ILIKE ${'%' + normalized + '%'}
       OR username ILIKE ${'%' + normalized + '%'}
    LIMIT 1
  `
  if (fuzzy.length > 0 && fuzzy[0].email) return fuzzy[0].email as string

  return null
}

const sendMail = async (to: string, subject: string, html: string, text: string) => {
  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS

  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER oder EMAIL_PASS nicht gesetzt')
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  })

  await transporter.verify()

  await transporter.sendMail({
    from: emailUser,
    to,
    subject,
    html,
    text
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name') || ''
    const datum = searchParams.get('datum') || ''
    const uhrzeitVon = searchParams.get('uhrzeitVon') || ''
    const uhrzeitBis = searchParams.get('uhrzeitBis') || ''
    const grund = searchParams.get('grund') || ''

    if (!name) {
      return NextResponse.json({ error: 'Name fehlt' }, { status: 400 })
    }

    const recipient = await getUserEmailByName(name)
    if (!recipient) {
      return new NextResponse(
        `<!doctype html><html lang="de"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Keine E-Mail gefunden</title>
        <style>body{font-family:Arial,sans-serif;background:#f8fafc;color:#111827;padding:40px;text-align:center}</style>
        </head><body><h2>❌ Keine E-Mail gefunden</h2><p>Für den Namen "${name}" wurde keine E-Mail-Adresse in der Benutzerverwaltung gefunden.</p></body></html>`,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      )
    }

    const subject = `✅ Stundenkorrektur durchgeführt – ${datum || 'ohne Datum'}`
    const html = `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Stundenkorrektur durchgeführt</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
          .container { max-width: 640px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 26px; text-align: center; }
          .content { padding: 24px; }
          .field { margin-bottom: 16px; }
          .field-label { font-weight: bold; color: #374151; margin-bottom: 5px; display: block; }
          .field-value { background: #f9fafb; padding: 10px; border-radius: 6px; border-left: 4px solid #10B981; }
          .footer { background: #f8fafc; padding: 16px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Stundenkorrektur durchgeführt</h1>
          </div>
          <div class="content">
            <div class="field">
              <span class="field-label">Name</span>
              <div class="field-value">${name}</div>
            </div>
            ${datum ? `
            <div class="field">
              <span class="field-label">Datum</span>
              <div class="field-value">${datum}</div>
            </div>
            ` : ''}
            ${uhrzeitVon || uhrzeitBis ? `
            <div class="field">
              <span class="field-label">Uhrzeit</span>
              <div class="field-value">${uhrzeitVon || '-'} – ${uhrzeitBis || '-'}</div>
            </div>
            ` : ''}
            ${grund ? `
            <div class="field">
              <span class="field-label">Grund</span>
              <div class="field-value">${grund.replace(/\n/g, '<br>')}</div>
            </div>
            ` : ''}
          </div>
          <div class="footer">
            Diese E-Mail wurde automatisch erzeugt.
          </div>
        </div>
      </body>
      </html>
    `

    const text = `Stundenkorrektur durchgeführt
Name: ${name}
Datum: ${datum || '-'}
Uhrzeit: ${uhrzeitVon || '-'} – ${uhrzeitBis || '-'}
Grund: ${grund || '-'}
`

    await sendMail(recipient, subject, html, text)

    return new NextResponse(
      `<!doctype html><html lang="de"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title>Bestätigung gesendet</title>
      <style>body{font-family:Arial,sans-serif;background:#f8fafc;color:#111827;padding:40px;text-align:center}</style>
      </head><body><h2>✅ Bestätigung gesendet</h2><p>Die Bestätigung wurde an ${recipient} geschickt.</p></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  } catch (error) {
    console.error('Failed to confirm stundenkorrektur:', error)
    return new NextResponse(
      `<!doctype html><html lang="de"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title>Fehler</title>
      <style>body{font-family:Arial,sans-serif;background:#f8fafc;color:#111827;padding:40px;text-align:center}</style>
      </head><body><h2>❌ Fehler</h2><p>Die Bestätigung konnte nicht versendet werden.</p></body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    )
  }
}
