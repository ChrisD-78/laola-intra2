import { NextRequest, NextResponse } from 'next/server'
import {
  createAgentTransporter,
  formatAgentSmtpError,
  getAgentSmtpConfig,
} from '@/lib/agentSmtp'

export const runtime = 'nodejs'

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

  const cfg = getAgentSmtpConfig()
  if (!cfg) {
    return NextResponse.json(
      {
        message:
          'SMTP nicht konfiguriert. Setzen Sie EMAIL_USER + EMAIL_PASS (Gmail) oder AGENT_SMTP_USER + AGENT_SMTP_PASSWORD (IONOS).',
      },
      { status: 503 },
    )
  }

  const transporter = createAgentTransporter(cfg)

  const footer = `\n\n---\nAutomatisch generiert am: ${
    typeof timestamp === 'string' && timestamp
      ? timestamp
      : new Date().toLocaleString('de-DE')
  }`

  const replyToAddr =
    typeof replyTo === 'string' && replyTo.trim() && isValidEmail(replyTo) ? replyTo.trim() : cfg.fromEmail

  try {
    await transporter.verify()
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
    return NextResponse.json({ message: formatAgentSmtpError(err) }, { status: 500 })
  }
}
