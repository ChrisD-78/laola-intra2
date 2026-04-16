import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

function agentSmtpConfig() {
  const host = process.env.AGENT_SMTP_HOST || process.env.SMTP_HOST || 'smtp.ionos.de'
  const port = parseInt(process.env.AGENT_SMTP_PORT || process.env.SMTP_PORT || '465', 10)
  const user =
    process.env.AGENT_SMTP_USER || process.env.SMTP_USER || process.env.EMAIL_USER || ''
  const password =
    process.env.AGENT_SMTP_PASSWORD ||
    process.env.SMTP_PASSWORD ||
    process.env.EMAIL_PASS ||
    ''
  const fromEmail =
    process.env.AGENT_SMTP_FROM_EMAIL ||
    process.env.SMTP_FROM_EMAIL ||
    user ||
    ''
  const fromName = process.env.AGENT_SMTP_FROM_NAME || process.env.SMTP_FROM_NAME || 'LA OLA KI-Assistent'
  return { host, port, secure: port === 465, user, password, fromEmail, fromName }
}

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

export async function POST(request: NextRequest) {
  let body: {
    to?: string
    replyTo?: string
    subject?: string
    text?: string
    html?: string
    timestamp?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Ungültiges JSON' }, { status: 400 })
  }

  const { to, replyTo, subject, text, html, timestamp } = body
  const textPart = typeof text === 'string' ? text : ''
  const htmlPart = typeof html === 'string' ? html : ''
  if (!textPart.trim() && !htmlPart.trim()) {
    return NextResponse.json({ message: 'Kein E-Mail-Text vorhanden' }, { status: 400 })
  }

  const toAddr = typeof to === 'string' ? to.trim() : ''
  if (!toAddr || !isValidEmail(toAddr)) {
    return NextResponse.json({ message: 'Ungültige oder fehlende Empfänger-Adresse' }, { status: 400 })
  }

  const cfg = agentSmtpConfig()
  if (!cfg.user || !cfg.password || !cfg.fromEmail) {
    return NextResponse.json(
      {
        message:
          'SMTP nicht konfiguriert (AGENT_SMTP_USER + AGENT_SMTP_PASSWORD bzw. SMTP_PASSWORD / AGENT_SMTP_FROM_EMAIL)',
      },
      { status: 503 },
    )
  }

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.password },
  })

  const footer = `\n\n---\nAutomatisch generiert am: ${
    typeof timestamp === 'string' && timestamp
      ? timestamp
      : new Date().toLocaleString('de-DE')
  }`

  const replyToAddr =
    typeof replyTo === 'string' && replyTo.trim() && isValidEmail(replyTo) ? replyTo.trim() : cfg.fromEmail

  try {
    await transporter.sendMail({
      from: `"${cfg.fromName}" <${cfg.fromEmail}>`,
      to: toAddr,
      replyTo: replyToAddr,
      subject: typeof subject === 'string' && subject.trim() ? subject.trim() : 'KI-Antwort (kein Betreff)',
      text: textPart ? textPart + footer : undefined,
      html: htmlPart
        ? `${htmlPart}<pre style="font-family:system-ui,sans-serif;font-size:12px;color:#555">${footer.replace(/\n/g, '<br/>')}</pre>`
        : undefined,
    })

    return NextResponse.json({ success: true, message: 'E-Mail erfolgreich gesendet' })
  } catch (err) {
    console.error('Agent SMTP Fehler:', err)
    const msg = err instanceof Error ? err.message : 'Unbekannter Fehler'
    return NextResponse.json({ message: `SMTP Fehler: ${msg}` }, { status: 500 })
  }
}
