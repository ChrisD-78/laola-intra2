const nodemailer = require('nodemailer')

function smtpConfig() {
  const host = process.env.AGENT_SMTP_HOST || process.env.SMTP_HOST || 'smtp.ionos.de'
  const port = parseInt(process.env.AGENT_SMTP_PORT || process.env.SMTP_PORT || '465', 10)
  const user =
    process.env.AGENT_SMTP_USER || process.env.SMTP_USER || process.env.EMAIL_USER || ''
  const pass =
    process.env.AGENT_SMTP_PASSWORD ||
    process.env.SMTP_PASSWORD ||
    process.env.EMAIL_PASS ||
    ''
  const fromEmail =
    process.env.AGENT_SMTP_FROM_EMAIL || process.env.SMTP_FROM_EMAIL || user || ''
  const fromName = process.env.AGENT_SMTP_FROM_NAME || process.env.SMTP_FROM_NAME || 'LA OLA KI-Assistent'
  return { host, port, secure: port === 465, user, pass, fromEmail, fromName }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      body: JSON.stringify({ message: 'Ungültiges JSON' }),
    }
  }

  const { to, replyTo, subject, text, timestamp } = body
  if (!text) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      body: JSON.stringify({ message: 'Kein E-Mail-Text vorhanden' }),
    }
  }

  const cfg = smtpConfig()
  if (!cfg.user || !cfg.pass || !cfg.fromEmail) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      body: JSON.stringify({
        message:
          'SMTP nicht konfiguriert (AGENT_SMTP_USER, AGENT_SMTP_PASSWORD oder SMTP_PASSWORD, AGENT_SMTP_FROM_EMAIL)',
      }),
    }
  }

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  })

  try {
    await transporter.sendMail({
      from: `"${cfg.fromName}" <${cfg.fromEmail}>`,
      to: to || cfg.fromEmail,
      replyTo: replyTo || cfg.fromEmail,
      subject: subject || 'KI-Antwort (kein Betreff)',
      text:
        text +
        `\n\n---\nAutomatisch generiert am: ${timestamp || new Date().toLocaleString('de-DE')}`,
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      body: JSON.stringify({ success: true, message: 'E-Mail erfolgreich gesendet' }),
    }
  } catch (err) {
    console.error('SMTP Fehler:', err)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      body: JSON.stringify({ message: 'SMTP Fehler: ' + (err && err.message ? err.message : String(err)) }),
    }
  }
}
