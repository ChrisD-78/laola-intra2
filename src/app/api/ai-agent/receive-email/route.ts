import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    const rawBody = await request.text()

    let from = 'Unbekannt'
    let subject = 'Kein Betreff'
    let text = ''
    let to = ''

    if (contentType.includes('application/json')) {
      const parsedBody = JSON.parse(rawBody || '{}')
      from = parsedBody.envelope?.from || parsedBody.headers?.from || 'Unbekannt'
      subject = parsedBody.headers?.subject || 'Kein Betreff'
      text = parsedBody.plain || parsedBody.html || ''
      to = parsedBody.envelope?.to || ''
    } else {
      const parsedBody = parseFormData(rawBody)
      from = parsedBody.from || 'Unbekannt'
      subject = parsedBody.subject || 'Kein Betreff'
      text = parsedBody.text || parsedBody.html || ''
      to = parsedBody.to || ''
    }

    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json({
        success: true,
        message: 'Email received but no OpenAI key configured'
      })
    }

    const response = await generateResponse(text, openaiKey)

    const sendgridKey = process.env.SENDGRID_API_KEY
    const notificationEmail = process.env.NOTIFICATION_EMAIL || 'christof.drost@landau.de'

    if (sendgridKey) {
      try {
        await sendNotificationEmail(
          from,
          subject,
          text,
          response,
          notificationEmail,
          sendgridKey
        )
      } catch (emailError) {
        // ignore notification errors
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email received and response generated',
      from,
      subject,
      to
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error processing email'
    return NextResponse.json({ error: 'Error processing email: ' + message }, { status: 500 })
  }
}

function parseFormData(body: string) {
  const params = new URLSearchParams(body)
  const result: Record<string, string> = {}

  for (const [key, value] of params.entries()) {
    result[key] = value
  }

  return result
}

async function sendNotificationEmail(
  originalFrom: string,
  originalSubject: string,
  originalText: string,
  generatedResponse: string,
  notificationEmail: string,
  sendgridKey: string
) {
  const emailBody = `
Neue E-Mail wurde automatisch verarbeitet!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EINGEHENDE E-MAIL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Von: ${originalFrom}
Betreff: ${originalSubject}

Nachricht:
${originalText.substring(0, 500)}${originalText.length > 500 ? '...\n[Gekürzt]' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERIERTER ANTWORTENTWURF:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${generatedResponse}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sie können diese Antwort kopieren und verwenden oder über die Web-App senden.

E-Mail-Assistent | Powered by OpenAI GPT-4
`

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
    .section { background: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .response-section { background: #f0f9ff; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .original-email { background: white; padding: 15px; border-radius: 5px; margin-top: 10px; border: 1px solid #e2e8f0; }
    .response-text { background: white; padding: 15px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap; border: 1px solid #e2e8f0; }
    .footer { text-align: center; color: #64748b; font-size: 0.9rem; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
    h2 { color: #1e293b; margin-top: 0; }
    .label { font-weight: 600; color: #475569; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">📧 Neue E-Mail verarbeitet</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Ihr E-Mail-Assistent hat eine Antwort generiert</p>
  </div>

  <div class="section">
    <h2>📨 Eingehende E-Mail</h2>
    <div class="original-email">
      <p><span class="label">Von:</span> ${originalFrom}</p>
      <p><span class="label">Betreff:</span> ${originalSubject}</p>
      <p><span class="label">Nachricht:</span></p>
      <p style="white-space: pre-wrap;">${originalText.substring(0, 500)}${originalText.length > 500 ? '...<br><em>[Gekürzt]</em>' : ''}</p>
    </div>
  </div>

  <div class="response-section">
    <h2>✉️ Generierter Antwortentwurf</h2>
    <div class="response-text">${generatedResponse}</div>
  </div>

  <div class="footer">
    <p>E-Mail-Assistent | Powered by OpenAI GPT-4 & CloudMailin</p>
    <p style="font-size: 0.8rem; margin-top: 10px;">Diese Benachrichtigung wurde automatisch generiert</p>
  </div>
</body>
</html>
`

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sendgridKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: notificationEmail }]
        }
      ],
      from: { email: 'laola@baederbook.de', name: 'E-Mail Assistent' },
      subject: `📧 Neue E-Mail von ${originalFrom}`,
      content: [
        { type: 'text/plain', value: emailBody },
        { type: 'text/html', value: htmlBody }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SendGrid Fehler: ${error}`)
  }
}

async function generateResponse(emailText: string, apiKey: string) {
  const systemPrompt = `Du bist ein professioneller E-Mail-Assistent für deutschsprachige Geschäftskommunikation.

Deine Hauptaufgabe ist es, eingehende E-Mails zu analysieren und einen passenden Antwortentwurf vorzubereiten.

Richtlinien:
1. Verwende immer korrekte Rechtschreibung und Grammatik.
2. Formuliere klar, höflich und professionell.
3. Passe den Ton an den Absender an:
   - Wenn der Absender formell schreibt → du antwortest formell.
   - Wenn der Absender locker schreibt → du bleibst freundlich und natürlich.
4. Antworte nur auf das, was inhaltlich relevant ist; vermeide Wiederholungen oder irrelevante Höflichkeiten.
5. Wenn eine Handlung erforderlich ist (z. B. Terminbestätigung, Rückfrage, Weiterleitung), schlage klar formulierte nächste Schritte vor.
6. Füge eine passende Grußformel am Ende hinzu.
7. Verwende kein Markdown, keine Listen, kein HTML — nur reinen Fließtext, sendefertig für eine E-Mail.

Wenn Informationen fehlen, schreibe eine höfliche Rückfrage, anstatt Annahmen zu treffen.`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Bitte erstelle einen Antwortentwurf für folgende E-Mail:\n\n${emailText}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'OpenAI API-Anfrage fehlgeschlagen')
  }

  const data = await response.json()
  return data.choices[0].message.content
}
