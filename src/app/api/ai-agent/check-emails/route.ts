import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Imap = require('imap')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { simpleParser } = require('mailparser')

type ParsedEmail = {
  id: number
  from: string
  subject: string
  date: Date
  text: string
}

export async function GET() {
  try {
    const emailConfig = {
      user: process.env.EMAIL_USER || 'laola@baederbook.de',
      password: process.env.EMAIL_PASSWORD,
      host: process.env.EMAIL_HOST || 'imap.united-domains.de',
      port: parseInt(process.env.EMAIL_PORT || '993', 10),
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    }

    if (!emailConfig.password) {
      return NextResponse.json(
        { error: 'E-Mail-Passwort nicht konfiguriert. Bitte EMAIL_PASSWORD Umgebungsvariable setzen.' },
        { status: 400 }
      )
    }

    const emails = await fetchEmails(emailConfig)

    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API-Schlüssel nicht konfiguriert. Bitte OPENAI_API_KEY Umgebungsvariable setzen.' },
        { status: 400 }
      )
    }

    const results = []
    for (const email of emails) {
      try {
        const response = await generateResponse(email.text, openaiKey)
        results.push({
          id: email.id,
          from: email.from,
          subject: email.subject,
          date: email.date,
          originalText: email.text,
          generatedResponse: response,
          status: 'success'
        })
      } catch (error) {
        results.push({
          id: email.id,
          from: email.from,
          subject: email.subject,
          date: email.date,
          originalText: email.text,
          error: error instanceof Error ? error.message : 'Unbekannter Fehler',
          status: 'error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      emails: results
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fehler beim E-Mail-Abruf'
    return NextResponse.json({ error: 'Fehler beim E-Mail-Abruf: ' + message }, { status: 500 })
  }
}

function fetchEmails(config: {
  user: string
  password: string
  host: string
  port: number
  tls: boolean
  tlsOptions: { rejectUnauthorized: boolean }
}) {
  return new Promise<ParsedEmail[]>((resolve, reject) => {
    const imap = new Imap({
      ...config,
      connTimeout: 30000,
      authTimeout: 30000,
      keepalive: false
    })

    const emails: ParsedEmail[] = []
    let connectionTimeout: NodeJS.Timeout
    let processingComplete = false

    const globalTimeout = setTimeout(() => {
      if (!processingComplete) {
        try {
          imap.end()
        } catch (e) {
          // ignore
        }
        reject(
          new Error(
            'IMAP-Verbindung: Zeitüberschreitung (45s). Möglicherweise blockiert Ihr Hosting-Provider IMAP-Verbindungen oder der Server ist langsam.'
          )
        )
      }
    }, 45000)

    imap.once('ready', () => {
      clearTimeout(connectionTimeout)

      imap.openBox('INBOX', true, (err: Error, box: { messages: { total: number } }) => {
        if (err) {
          clearTimeout(globalTimeout)
          processingComplete = true
          reject(err)
          return
        }

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const searchCriteria = ['UNSEEN', ['SINCE', sevenDaysAgo]]

        imap.search(searchCriteria, (searchErr: Error, results: number[]) => {
          if (searchErr) {
            clearTimeout(globalTimeout)
            processingComplete = true
            imap.end()
            reject(searchErr)
            return
          }

          if (results.length === 0) {
            clearTimeout(globalTimeout)
            processingComplete = true
            imap.end()
            resolve([])
            return
          }

          const limitedResults = results.slice(0, 5)
          const f = imap.fetch(limitedResults, {
            bodies: '',
            struct: true
          })

          let messagesProcessed = 0
          const totalMessages = limitedResults.length

          f.on('message', (msg: any, seqno: number) => {
            let buffer = ''

            msg.on('body', (stream: NodeJS.ReadableStream) => {
              stream.on('data', (chunk: Buffer) => {
                buffer += chunk.toString('utf8')
              })
            })

            msg.once('end', () => {
              simpleParser(buffer, (parseErr: Error, parsed: any) => {
                messagesProcessed++

                if (!parseErr) {
                  emails.push({
                    id: seqno,
                    from: parsed.from?.text || 'Unbekannt',
                    subject: parsed.subject || 'Kein Betreff',
                    date: parsed.date || new Date(),
                    text: parsed.text || parsed.html || ''
                  })
                }

                if (messagesProcessed === totalMessages) {
                  clearTimeout(globalTimeout)
                  processingComplete = true
                  imap.end()
                }
              })
            })
          })

          f.once('error', (fetchErr: Error) => {
            clearTimeout(globalTimeout)
            processingComplete = true
            imap.end()
            reject(fetchErr)
          })

          f.once('end', () => {
            setTimeout(() => {
              if (!processingComplete) {
                clearTimeout(globalTimeout)
                processingComplete = true
                imap.end()
              }
            }, 2000)
          })
        })
      })
    })

    imap.once('error', (err: Error) => {
      clearTimeout(connectionTimeout)
      clearTimeout(globalTimeout)
      processingComplete = true
      reject(
        new Error(
          `IMAP-Fehler: ${err.message}. Bitte prüfen Sie Ihre E-Mail-Zugangsdaten (EMAIL_USER, EMAIL_PASSWORD, EMAIL_HOST).`
        )
      )
    })

    imap.once('end', () => {
      clearTimeout(globalTimeout)
      processingComplete = true
      resolve(emails)
    })

    connectionTimeout = setTimeout(() => {
      if (!(imap as any)._box) {
        try {
          imap.end()
        } catch (e) {
          // ignore
        }
        reject(
          new Error(
            `IMAP-Verbindung konnte nicht hergestellt werden. Mögliche Ursachen: 1) Falscher Server/Port, 2) Firewall-Blockierung, 3) Falsche Zugangsdaten. Aktuelle Einstellungen: ${config.host}:${config.port}`
          )
        )
      }
    }, 10000)

    imap.connect()
  })
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
