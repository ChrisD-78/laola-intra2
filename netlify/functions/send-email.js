const nodemailer = require('nodemailer')

function envTrim(...keys) {
  for (const key of keys) {
    const value = (process.env[key] || '').trim()
    if (value) return value
  }
  return ''
}

function smtpConfig() {
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
      pass: agentPass,
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
      pass: emailPass,
      fromEmail: envTrim('AGENT_SMTP_FROM_EMAIL', 'SMTP_FROM_EMAIL') || emailUser,
      fromName,
    }
  }

  return null
}

function createTransporter(cfg) {
  if (cfg.mode === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: cfg.user, pass: cfg.pass },
    })
  }
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  })
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
  if (!cfg || !cfg.fromEmail) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      body: JSON.stringify({
        message:
          'SMTP nicht konfiguriert. Setzen Sie EMAIL_USER + EMAIL_PASS (Gmail) oder AGENT_SMTP_USER + AGENT_SMTP_PASSWORD.',
      }),
    }
  }

  const transporter = createTransporter(cfg)

  try {
    await transporter.verify()
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
    const msg = err && err.message ? err.message : String(err)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      body: JSON.stringify({ message: 'SMTP Fehler: ' + msg }),
    }
  }
}
