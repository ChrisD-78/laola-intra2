import { createHash } from 'crypto'
import Imap from 'imap'
import type { ParsedMail } from 'mailparser'
import { simpleParser } from 'mailparser'

export type FetchedInboundMail = {
  rfcMessageId: string
  fromName: string
  fromEmail: string
  subject: string
  bodyText: string
  bodyHtml: string
  receivedAt: Date
  imapUid: number
}

function getImapConfig(): Imap.Config {
  const user = process.env.AGENT_IMAP_USER || process.env.EMAIL_USER
  const password = process.env.AGENT_IMAP_PASS || process.env.EMAIL_PASS
  const host = process.env.AGENT_IMAP_HOST || 'imap.gmail.com'

  if (!user || !password) {
    throw new Error(
      'IMAP nicht konfiguriert: Setzen Sie EMAIL_USER und EMAIL_PASS (Gmail App-Passwort) oder AGENT_IMAP_USER / AGENT_IMAP_PASS.',
    )
  }

  return {
    user,
    password,
    host,
    port: 993,
    tls: true,
    tlsOptions: { servername: host },
  }
}

function openInbox(imap: Imap): Promise<void> {
  return new Promise((resolve, reject) => {
    imap.openBox('INBOX', false, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

function searchUnseen(imap: Imap): Promise<number[]> {
  return new Promise((resolve, reject) => {
    imap.search(['UNSEEN'], (err, results) => {
      if (err) reject(err)
      else resolve(results && results.length ? results : [])
    })
  })
}

function fetchOneUid(imap: Imap, uid: number): Promise<ParsedMail> {
  return new Promise((resolve, reject) => {
    const f = imap.fetch([uid], { bodies: '' })
    let settled = false

    f.on('message', (msg) => {
      msg.on('body', (stream) => {
        void simpleParser(stream)
          .then((parsed) => {
            if (!settled) {
              settled = true
              resolve(parsed)
            }
          })
          .catch((e) => {
            if (!settled) {
              settled = true
              reject(e)
            }
          })
      })
    })

    f.once('error', (e) => {
      if (!settled) {
        settled = true
        reject(e)
      }
    })

    f.once('end', () => {
      setTimeout(() => {
        if (!settled) {
          settled = true
          reject(new Error(`IMAP: kein Inhalt für UID ${uid}`))
        }
      }, 8000)
    })
  })
}

function addSeen(imap: Imap, uids: number[]): Promise<void> {
  if (uids.length === 0) return Promise.resolve()
  return new Promise((resolve, reject) => {
    imap.addFlags(uids, ['\\Seen'], (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

function stableMessageId(parsed: ParsedMail, uid: number): string {
  const raw = parsed.messageId?.trim()
  if (raw) return raw
  const from = parsed.from?.value?.[0]?.address || ''
  const subj = parsed.subject || ''
  const d = parsed.date?.toISOString() || ''
  const h = createHash('sha256').update(`${from}|${subj}|${d}|${uid}`).digest('hex').slice(0, 40)
  return `generated-${h}`
}

function toInbound(parsed: ParsedMail, uid: number): FetchedInboundMail {
  const from = parsed.from?.value?.[0]
  const html = typeof parsed.html === 'string' ? parsed.html : ''

  return {
    rfcMessageId: stableMessageId(parsed, uid),
    fromName: (from?.name || from?.address || 'Unbekannt').trim(),
    fromEmail: (from?.address || '').trim(),
    subject: (parsed.subject || '(Ohne Betreff)').trim(),
    bodyText: (parsed.text || '').trim() || html.replace(/<[^>]+>/g, ' ').trim(),
    bodyHtml: html,
    receivedAt: parsed.date || new Date(),
    imapUid: uid,
  }
}

/**
 * Liest ungelesene Mails per IMAP (max. maxMessages), markiert sie als gelesen.
 * Nutzt dieselben Zugangsdaten wie der Formular-E-Mail-Versand (Gmail: EMAIL_USER + App-Passwort),
 * sofern keine separaten AGENT_IMAP_* Variablen gesetzt sind.
 */
export async function fetchUnseenInboundMails(maxMessages = 15): Promise<FetchedInboundMail[]> {
  const config = getImapConfig()
  const imap = new Imap(config)

  await new Promise<void>((resolve, reject) => {
    imap.once('ready', () => resolve())
    imap.once('error', reject)
    imap.connect()
  })

  try {
    await openInbox(imap)
    const uids = await searchUnseen(imap)
    if (uids.length === 0) {
      imap.end()
      return []
    }

    const slice = uids.slice(0, maxMessages)
    const out: FetchedInboundMail[] = []

    for (const uid of slice) {
      try {
        const parsed = await fetchOneUid(imap, uid)
        out.push(toInbound(parsed, uid))
      } catch (e) {
        console.error('agent IMAP fetch uid', uid, e)
      }
    }

    if (out.length > 0) {
      try {
        await addSeen(
          imap,
          out.map((o) => o.imapUid),
        )
      } catch (e) {
        console.error('agent IMAP addFlags', e)
      }
    }

    imap.end()
    return out
  } catch (e) {
    try {
      imap.end()
    } catch {
      /* ignore */
    }
    throw e
  }
}
