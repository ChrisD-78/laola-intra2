import nodemailer from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'

function envTrim(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim()
    if (value) return value
  }
  return ''
}

export type AgentSmtpConfig =
  | {
      mode: 'gmail'
      user: string
      password: string
      fromEmail: string
      fromName: string
    }
  | {
      mode: 'custom'
      host: string
      port: number
      secure: boolean
      user: string
      password: string
      fromEmail: string
      fromName: string
    }

/**
 * Agent-E-Mail (Protokoll, KI-Antworten):
 * - Explizit AGENT_SMTP_* / SMTP_* → eigener Server (z. B. IONOS)
 * - Sonst EMAIL_USER + EMAIL_PASS → Gmail (wie Formular-Versand)
 */
export function getAgentSmtpConfig(): AgentSmtpConfig | null {
  const fromName = envTrim('AGENT_SMTP_FROM_NAME', 'SMTP_FROM_NAME') || 'LA OLA KI-Assistent'

  const agentUser = envTrim('AGENT_SMTP_USER', 'SMTP_USER')
  const agentPass = envTrim('AGENT_SMTP_PASSWORD', 'SMTP_PASSWORD')

  if (agentUser && agentPass) {
    const port = parseInt(envTrim('AGENT_SMTP_PORT', 'SMTP_PORT') || '465', 10)
    return {
      mode: 'custom',
      host: envTrim('AGENT_SMTP_HOST', 'SMTP_HOST') || 'smtp.ionos.de',
      port,
      secure: port === 465,
      user: agentUser,
      password: agentPass,
      fromEmail: envTrim('AGENT_SMTP_FROM_EMAIL', 'SMTP_FROM_EMAIL') || agentUser,
      fromName,
    }
  }

  const emailUser = envTrim('EMAIL_USER')
  const emailPass = envTrim('EMAIL_PASS')
  if (emailUser && emailPass) {
    return {
      mode: 'gmail',
      user: emailUser,
      password: emailPass,
      fromEmail: envTrim('AGENT_SMTP_FROM_EMAIL', 'SMTP_FROM_EMAIL') || emailUser,
      fromName,
    }
  }

  return null
}

export function createAgentTransporter(cfg: AgentSmtpConfig) {
  if (cfg.mode === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: cfg.user, pass: cfg.password },
    } satisfies SMTPTransport.Options)
  }

  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.password },
  })
}

export function formatAgentSmtpError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (/invalid login|535|authentication credentials invalid/i.test(msg)) {
    return (
      'SMTP-Anmeldung fehlgeschlagen. ' +
      'Bei Gmail: EMAIL_USER + App-Passwort (16 Zeichen) in Netlify prüfen. ' +
      'Bei IONOS: AGENT_SMTP_USER, AGENT_SMTP_PASSWORD und AGENT_SMTP_FROM_EMAIL setzen.'
    )
  }
  return `SMTP Fehler: ${msg}`
}
