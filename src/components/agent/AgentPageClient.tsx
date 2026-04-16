'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type TabId = 'dashboard' | 'chat' | 'protocol' | 'mail'

type MailItem = {
  id: string
  unread: boolean
  priority: 'high' | 'mid' | 'low'
  from: string
  email: string
  subject: string
  preview: string
  time: string
  body: string
  source: 'demo' | 'paste' | 'imap'
  /** Aus Server (IMAP-Sync), falls schon erzeugt */
  aiReplyDraft?: string | null
}

const DOCS_CONTEXT = `Du bist der interne Wissens-Assistent der Stadtholding Landau / Freizeitbad LA OLA.
Du hast Zugriff auf folgende interne Dokumente:
1. Hausordnung LA OLA 2026 – enthält Regeln für Besucher, Aufsichtspflichten, Verbote, Öffnungszeiten (Mo-Fr 8-21h, Sa-So 9-20h)
2. Führungsstile Training – LA OLA hat den kooperativen Führungsstil als Standard. Bei Notfällen sofortiger Wechsel zum autoritären Stil. Schichtwechselwünsche 14 Tage vorher einreichen (spätestens 5 Tage vor Schicht).
3. Notfallprotokoll Wasser – Erste Hilfe Maßnahmen, Alarmierungskette
4. Tarifordnung – Erwachsene 5,50€, Kinder (bis 14) 3,00€, Familienkarte 15,00€, Saisonkarte 89,00€
5. Hygienekonzept 2025/26 – Duschen vor dem Einstieg, Badekappen in Schwimmerbecken

Antworte auf Deutsch. Nenne am Ende der Antwort immer die Quelle in eckigen Klammern [Dokumentname].
Wenn die Frage nicht aus den Dokumenten beantwortet werden kann, sage das ehrlich.`

const INITIAL_DOCS = [
  { name: 'Hausordnung LA OLA 2026', size: '245 KB' },
  { name: 'Führungsstile Training', size: '189 KB' },
  { name: 'Notfallprotokoll Wasser', size: '98 KB' },
  { name: 'Tarifordnung Eintrittspreise', size: '56 KB' },
  { name: 'Hygienekonzept 2025/26', size: '312 KB' },
]

const MAILS: MailItem[] = [
  {
    id: 'd1',
    source: 'demo',
    unread: true,
    priority: 'high',
    from: 'Thorsten Hartmann',
    email: 'th@stadtholding-landau.de',
    subject: 'Angebot Bäderbook Platform – Rückfragen',
    preview: 'Danke für das detaillierte Angebot. Wir haben einige Fragen zur...',
    time: '09:15',
    body: `Sehr geehrter Herr Hergesell,\n\nvielen Dank für Ihr detailliertes Angebot zur Bäderbook-Plattform vom 25. März 2026.\n\nWir haben das Dokument geprüft und haben folgende Rückfragen:\n\n1. Ist es möglich, die Anzahl der Online-Formulare im ersten Monat auf 8 statt der geplanten 6 zu erhöhen?\n2. Wie verhält sich die Datentransfer-Pauschale bei Spitzenzeiten (z.B. Sommersaison)?\n3. Gibt es einen SLA (Service Level Agreement) für Ausfallzeiten der Plattform?\n\nBitte teilen Sie uns auch mit, wann ein persönliches Gespräch möglich wäre.\n\nMit freundlichen Grüßen\nThorsten Hartmann\nStadtholding Landau`,
  },
  {
    id: 'd2',
    source: 'demo',
    unread: true,
    priority: 'mid',
    from: 'Sarah Müller',
    email: 's.mueller@la-ola.de',
    subject: 'Dienstplan KW 15 – Änderungsantrag',
    preview: 'Ich möchte meinen Schichtdienst am Freitag, 11. April tauschen...',
    time: 'Gestern',
    body: `Guten Tag,\n\nich möchte hiermit beantragen, meinen Schichtdienst am Freitag, den 11. April 2026 (Spätschicht 14:00–22:00 Uhr) zu tauschen.\n\nKollegin Anna Becker hat sich bereit erklärt, die Schicht zu übernehmen.\n\nKönnen Sie den Tausch genehmigen?\n\nMit freundlichen Grüßen\nSarah Müller\nRettungsschwimmerin LA OLA`,
  },
  {
    id: 'd3',
    source: 'demo',
    unread: true,
    priority: 'low',
    from: 'Vintia Support',
    email: 'support@vintia.de',
    subject: 'Update: Kassensystem Version 4.2.1',
    preview: 'Das Kassensystem wird am 02. April 2026 um 03:00 Uhr...',
    time: 'Gestern',
    body: `Sehr geehrte Damen und Herren,\n\nwir informieren Sie über das bevorstehende Update des Vintia Kassensystems auf Version 4.2.1.\n\nDas Update findet statt am:\nDienstag, 02. April 2026, 03:00–04:30 Uhr\n\nWährend dieser Zeit ist das System nicht verfügbar. Bitte planen Sie keine frühen Schichten ohne Kassenzugang.\n\nNeuerungen in Version 4.2.1:\n– Verbesserter Online-Ticketverkauf\n– Bugfixes Tagesabschluss\n– Neue Exportfunktionen\n\nMit freundlichen Grüßen\nVintia Support-Team`,
  },
  {
    id: 'd4',
    source: 'demo',
    unread: false,
    priority: 'mid',
    from: 'Nicole Weber',
    email: 'n.weber@stadtholding-landau.de',
    subject: 'Termin Stadtholding Jour Fixe April',
    preview: 'Der nächste Jour Fixe findet am 8. April um 10:00 Uhr statt...',
    time: 'Mo, 25.3.',
    body: `Hallo zusammen,\n\nder nächste Jour Fixe der Stadtholding findet statt am:\nDienstag, 8. April 2026, 10:00–11:30 Uhr, Raum 2.14\n\nTagesordnung:\n1. Saisonvorbereitung Freibad Landau\n2. Digitalisierungsprojekte Q2\n3. Sonstiges\n\nBitte Rückmeldung bis 3. April.\n\nViele Grüße\nNicole`,
  },
]

const PRIORITY_LABELS: Record<string, string> = { high: 'Hoch', mid: 'Mittel', low: 'Niedrig' }

function initials(name: string | null) {
  if (!name) return '?'
  const p = name.split(/\s+/).filter(Boolean)
  if (p.length >= 2) return (p[0][0] + p[p.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

async function callAgentAPI(
  system: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  max_tokens: number,
) {
  const res = await fetch('/api/agent/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, messages, max_tokens }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Anfrage fehlgeschlagen')
  return data.text as string
}

export default function AgentPageClient({ currentUser }: { currentUser: string | null }) {
  const [tab, setTab] = useState<TabId>('dashboard')
  const [toast, setToast] = useState<string | null>(null)

  const [docs, setDocs] = useState(INITIAL_DOCS)
  const [activeDocIndex, setActiveDocIndex] = useState(0)
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [chatUi, setChatUi] = useState<{ role: 'user' | 'bot'; text: string; typing?: boolean }[]>([
    {
      role: 'bot',
      text: `Hallo! Ich bin Ihr Wissens-Assistent. Ich habe Zugriff auf **${INITIAL_DOCS.length} Dokumente** in Ihrer Datenbank. Fragen Sie mich zu Hausordnungen, Tarifen, Führungsrichtlinien oder anderen Unternehmensthemen!`,
    },
  ])
  const [sendBusy, setSendBusy] = useState(false)

  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingDate, setMeetingDate] = useState(() => new Date().toISOString().split('T')[0])
  const [meetingParticipants, setMeetingParticipants] = useState('')
  const [meetingDept, setMeetingDept] = useState('LA OLA – Betrieb')
  const [protocolHtml, setProtocolHtml] = useState('')
  const [protocolLoading, setProtocolLoading] = useState(false)
  const [protocolMailTo, setProtocolMailTo] = useState('')
  const [sendMailBusy, setSendMailBusy] = useState(false)
  const [hasAudio, setHasAudio] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [recordStatus, setRecordStatus] = useState('Klicken zum Aufnehmen')

  const [mailList, setMailList] = useState<MailItem[]>(MAILS)
  const [selectedMailId, setSelectedMailId] = useState<string | null>(null)
  const [aiReply, setAiReply] = useState('')
  const [mailReplyLoading, setMailReplyLoading] = useState(false)
  const [replyReadonly, setReplyReadonly] = useState(true)

  /** E-Mail manuell einfügen (ohne Outlook-Regel). */
  const [pasteFrom, setPasteFrom] = useState('')
  const [pasteEmail, setPasteEmail] = useState('')
  const [pasteSubject, setPasteSubject] = useState('')
  const [pasteBody, setPasteBody] = useState('')

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    if (tab !== 'mail') return
    void (async () => {
      try {
        const res = await fetch('/api/agent/inbox/messages')
        const data = (await res.json()) as {
          messages?: {
            id: string
            from_name: string | null
            from_email: string | null
            subject: string | null
            body_text: string | null
            received_at: string
            ai_reply_draft: string | null
          }[]
        }
        if (!Array.isArray(data.messages)) return
        const mapped: MailItem[] = data.messages.map((row) => {
          const body = row.body_text || ''
          return {
            id: row.id,
            source: 'imap',
            unread: false,
            priority: 'mid',
            from: row.from_name || 'Unbekannt',
            email: row.from_email || '—',
            subject: row.subject || '(Ohne Betreff)',
            preview: body.length > 90 ? `${body.slice(0, 90).replace(/\s+/g, ' ')}…` : body.replace(/\s+/g, ' '),
            time: new Date(row.received_at).toLocaleString('de-DE', {
              dateStyle: 'short',
              timeStyle: 'short',
            }),
            body,
            aiReplyDraft: row.ai_reply_draft,
          }
        })
        setMailList((prev) => {
          const keep = prev.filter((m) => m.source === 'demo' || m.source === 'paste')
          return [...mapped, ...keep]
        })
      } catch {
        /* still show demos */
      }
    })()
  }, [tab])

  const sendChat = async () => {
    const msg = chatInput.trim()
    if (!msg || sendBusy) return
    setChatInput('')
    setSendBusy(true)
    setChatUi((u) => [...u, { role: 'user', text: msg }, { role: 'bot', text: '', typing: true }])

    const apiMessages = [...chatHistory, { role: 'user' as const, content: msg }]
    try {
      const reply = await callAgentAPI(DOCS_CONTEXT, apiMessages, 800)
      setChatHistory((h) => [...h, { role: 'user', content: msg }, { role: 'assistant', content: reply }])
      setChatUi((u) => {
        const next = [...u]
        const i = next.length - 1
        if (next[i]?.typing) next[i] = { role: 'bot', text: reply }
        return next
      })
    } catch (e) {
      const err = e instanceof Error ? e.message : 'Fehler bei der KI-Anfrage.'
      setChatUi((u) => {
        const next = [...u]
        const i = next.length - 1
        if (next[i]?.typing) next[i] = { role: 'bot', text: err }
        return next
      })
    }
    setSendBusy(false)
  }

  const addPdf = (f: File) => {
    setDocs((d) => [{ name: f.name.replace(/\.pdf$/i, ''), size: `${(f.size / 1024).toFixed(0)} KB` }, ...d])
    setActiveDocIndex(0)
    showToast(`„${f.name}“ zur Liste hinzugefügt (Demo – kein echter Index)`)
  }

  const generateProtocol = async () => {
    const title = meetingTitle.trim() || 'Besprechung'
    setProtocolLoading(true)
    setProtocolHtml('')
    const systemPrompt = `Du bist ein professioneller Protokollschreiber für die Stadtholding Landau / Bäderbook GmbH. 
Erstelle ein formelles Besprechungsprotokoll auf Deutsch in HTML-Format.
Verwende diese HTML-Tags: h4 für Abschnitte, p für Text, ul/li für Aufzählungen.
Das Protokoll soll enthalten: Kopfdaten, Tagesordnung (3-4 Punkte), Besprochene Inhalte, Beschlüsse, Aufgaben mit Verantwortlichen, nächste Sitzung.`

    const userMsg = `Erstelle ein realistisches Besprechungsprotokoll für:
- Titel: ${title}
- Datum: ${meetingDate}
- Abteilung: ${meetingDept}
- Teilnehmer: ${meetingParticipants || 'Nicht angegeben'}
- Hinweis: Da keine echte Transkription vorliegt, erstelle ein plausibles Musterprotokoll, das der Nutzer dann bearbeiten kann.`

    try {
      const html = await callAgentAPI(systemPrompt, [{ role: 'user', content: userMsg }], 1200)
      setProtocolHtml(html)
      showToast('Protokoll erzeugt')
    } catch (e) {
      setProtocolHtml(`<p>${e instanceof Error ? e.message : 'Fehler'}</p>`)
    }
    setProtocolLoading(false)
  }

  const copyProtocol = () => {
    const el = document.createElement('div')
    el.innerHTML = protocolHtml
    const text = el.innerText || ''
    void navigator.clipboard.writeText(text)
    showToast('Protokoll in Zwischenablage kopiert')
  }

  const downloadProtocol = () => {
    const title = meetingTitle.trim() || 'Protokoll'
    const blob = new Blob(
      [`<!DOCTYPE html><html><body style="font-family:system-ui;max-width:800px;margin:40px auto">${protocolHtml}</body></html>`],
      { type: 'text/html;charset=utf-8' },
    )
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `Protokoll_${title.replace(/\s/g, '_')}.html`
    a.click()
    URL.revokeObjectURL(a.href)
    showToast('Download gestartet')
  }

  const sendAgentSmtpMail = async (payload: {
    to: string
    subject: string
    text: string
    html?: string
  }) => {
    const res = await fetch('/api/agent/send-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    })
    const data = (await res.json()) as { message?: string; success?: boolean }
    if (!res.ok) throw new Error(data.message || 'Versand fehlgeschlagen')
  }

  const sendAgentReplyMail = async () => {
    if (!selectedMail || sendMailBusy) return
    const body = aiReply.trim()
    if (!body) {
      showToast('Bitte zuerst einen Antworttext erzeugen oder eintragen.')
      return
    }
    const to = selectedMail.email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      showToast('Keine gültige Absender-E-Mail – Versand nicht möglich.')
      return
    }
    setSendMailBusy(true)
    try {
      await sendAgentSmtpMail({
        to,
        subject: `Re: ${selectedMail.subject}`,
        text: body,
      })
      showToast('E-Mail wurde gesendet.')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Versand fehlgeschlagen')
    }
    setSendMailBusy(false)
  }

  const sendProtocolByMail = async () => {
    if (!protocolHtml.trim() || sendMailBusy) return
    const to = protocolMailTo.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      showToast('Bitte Empfänger-E-Mail unter dem Protokoll eintragen.')
      return
    }
    const title = meetingTitle.trim() || 'Besprechungsprotokoll'
    const el = document.createElement('div')
    el.innerHTML = protocolHtml
    const plain = (el.innerText || '').trim() || '(HTML-Protokoll, siehe E-Mail)'
    setSendMailBusy(true)
    try {
      await sendAgentSmtpMail({
        to,
        subject: title,
        text: plain,
        html: protocolHtml,
      })
      showToast('Protokoll per E-Mail gesendet.')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Versand fehlgeschlagen')
    }
    setSendMailBusy(false)
  }

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mr = new MediaRecorder(stream)
        const chunks: BlobPart[] = []
        mr.ondataavailable = (e) => chunks.push(e.data)
        mr.onstop = () => {
          setHasAudio(true)
          showToast('Aufnahme beendet (lokal gespeichert)')
        }
        mr.start()
        mediaRecorderRef.current = mr
        setIsRecording(true)
        setSeconds(0)
        setRecordStatus('Aufnahme läuft…')
        timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
      } catch {
        showToast('Mikrofonzugriff verweigert')
      }
    } else {
      mediaRecorderRef.current?.stop()
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop())
      setIsRecording(false)
      setRecordStatus('Aufnahme gespeichert')
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const formatTimer = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const selectedMail = mailList.find((m) => m.id === selectedMailId) || null

  const generateMailReply = useCallback(
    async (mail: MailItem) => {
      setMailReplyLoading(true)
      setAiReply('')
      const signer = currentUser || 'LA OLA Intranet'
      const systemPrompt = `Du bist der KI-E-Mail-Assistent von ${signer} (Bäderbook / LA OLA Landau).
Schreibe eine professionelle, freundliche Antwort auf Deutsch auf die eingegangene E-Mail.
Halte die Antwort konkret und praxistauglich. Signiere mit: "Mit freundlichen Grüßen\n${signer}\nLA OLA Landau"
Gib NUR den Antworttext zurück, keine Erklärungen davor oder danach.`

      const userMsg = `Eingehende E-Mail von ${mail.from} (${mail.email}):
Betreff: ${mail.subject}
Inhalt: ${mail.body}

Bitte schreibe eine passende Antwort.`

      try {
        const reply = await callAgentAPI(systemPrompt, [{ role: 'user', content: userMsg }], 600)
        setAiReply(reply)
        setMailList((list) =>
          list.map((m) =>
            m.id === mail.id && m.source === 'imap' ? { ...m, aiReplyDraft: reply } : m,
          ),
        )
      } catch (e) {
        setAiReply(e instanceof Error ? e.message : 'Fehler beim Generieren')
      }
      setMailReplyLoading(false)
    },
    [currentUser],
  )

  const openMail = (id: string) => {
    const mail = mailList.find((m) => m.id === id)
    if (mail) {
      setReplyReadonly(true)
      if (mail.source === 'imap' && mail.aiReplyDraft) {
        setAiReply(mail.aiReplyDraft)
        setMailReplyLoading(false)
      } else {
        void generateMailReply(mail)
      }
    }
    setMailList((list) => list.map((m) => (m.id === id ? { ...m, unread: false } : m)))
    setSelectedMailId(id)
  }

  const analyzePastedMail = () => {
    const subj = pasteSubject.trim()
    const body = pasteBody.trim()
    if (!subj || !body) {
      showToast('Bitte Betreff und Nachrichtentext ausfüllen.')
      return
    }
    const newId = `p-${Date.now()}`
    const item: MailItem = {
      id: newId,
      source: 'paste',
      unread: false,
      priority: 'mid',
      from: pasteFrom.trim() || 'Absender (nicht angegeben)',
      email: pasteEmail.trim() || '—',
      subject: subj,
      preview:
        body.length > 100 ? `${body.slice(0, 100).replace(/\s+/g, ' ')}…` : body.replace(/\s+/g, ' '),
      time: new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }),
      body,
    }
    setMailList((list) => [item, ...list])
    setSelectedMailId(newId)
    setReplyReadonly(true)
    setAiReply('')
    void generateMailReply(item)
    showToast('KI erstellt Antwortvorschlag …')
  }

  const tabTitle: Record<TabId, string> = {
    dashboard: 'Dashboard',
    chat: 'Wissens-Chatbot',
    protocol: 'Protokoll-Generator',
    mail: 'E-Mail-Assistent',
  }
  const tabSub: Record<TabId, string> = {
    dashboard: currentUser ? `Willkommen zurück, ${currentUser}` : 'Übersicht KI-Module',
    chat: 'Fragen zu Unternehmensdokumenten (Demo-Kontext)',
    protocol: 'Besprechungen – Protokoll per KI',
    mail: 'IMAP (Outlook→Gmail), Demo oder Mail einfügen',
  }

  const NavBtn = ({ id, label, icon }: { id: TabId; label: string; icon: string }) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        tab === id
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:border-blue-200'
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  )

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-4 lg:p-8 text-white text-center">
        <h1 className="text-2xl lg:text-4xl font-bold mb-2">Agent</h1>
        <p className="text-sm lg:text-base text-white/90">Bäderbook · Intranet KI-Assistent (nur Administratoren)</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{tabTitle[tab]}</h2>
          <p className="text-sm text-gray-600">{tabSub[tab]}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          KI-Agent (Server-API)
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <NavBtn id="dashboard" label="Dashboard" icon="🏠" />
        <NavBtn id="chat" label="Wissens-Chatbot" icon="💬" />
        <NavBtn id="protocol" label="Protokoll-Generator" icon="🎙️" />
        <NavBtn id="mail" label="E-Mail-Assistent" icon="✉️" />
      </div>

      {tab === 'dashboard' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ['47', 'Chat-Anfragen heute (Demo)'],
              ['8', 'Protokolle generiert (Demo)'],
              ['23', 'E-Mails verarbeitet (Demo)'],
              ['12', 'PDFs indexiert (Demo)'],
            ].map(([v, l]) => (
              <div key={l} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="text-3xl font-bold text-blue-800">{v}</div>
                <div className="text-xs text-gray-600 mt-1">{l}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setTab('chat')}
              className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all border-t-4 border-t-sky-500"
            >
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-semibold text-gray-900 mb-1">Wissens-Chatbot</h3>
              <p className="text-sm text-gray-600">
                Fragen zu internen Themen – Antworten mit Quellenhinweis (Demo-Dokumentenkontext).
              </p>
              <span className="inline-flex mt-4 text-sm font-medium text-blue-600">Zum Chatbot →</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('protocol')}
              className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all border-t-4 border-t-amber-500"
            >
              <div className="text-3xl mb-3">🎙️</div>
              <h3 className="font-semibold text-gray-900 mb-1">Protokoll-Generator</h3>
              <p className="text-sm text-gray-600">Aufnahme oder Metadaten – KI erstellt ein Protokollentwurf.</p>
              <span className="inline-flex mt-4 text-sm font-medium text-blue-600">Zum Generator →</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('mail')}
              className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all border-t-4 border-t-orange-500"
            >
              <div className="text-3xl mb-3">✉️</div>
              <h3 className="font-semibold text-gray-900 mb-1">E-Mail-Assistent</h3>
              <p className="text-sm text-gray-600">Beispiel-Eingänge mit KI-Antwortvorschlag.</p>
              <span className="inline-flex mt-4 text-sm font-medium text-blue-600">Zu den Mails →</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Letzte Aktivitäten (Beispiel)</h3>
            <ul className="space-y-3 text-sm">
              {[
                ['#0ea5e9', 'Chatbot: Frage zu Öffnungszeiten LA OLA', 'Heute, 09:42'],
                ['#d97706', 'Protokoll: Schichtführer-Besprechung', 'Heute, 08:15'],
                ['#ea580c', 'E-Mail von Thorsten Hartmann analysiert', 'Gestern, 17:30'],
              ].map(([c, t, time]) => (
                <li key={t} className="flex gap-3 items-start border-b border-gray-100 pb-3 last:border-0">
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: c as string }} />
                  <div>
                    <p className="text-gray-800">{t}</p>
                    <p className="text-xs text-gray-500">{time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {initials(currentUser)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{currentUser || 'Administrator'}</p>
              <p className="text-xs text-gray-600">Administrator · LA OLA Intranet</p>
            </div>
          </div>
        </>
      )}

      {tab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 min-h-[520px]">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 font-semibold text-sm text-gray-800">Wissensdatenbank (Demo)</div>
            <div className="flex-1 overflow-y-auto p-2 max-h-[420px] lg:max-h-none">
              {docs.map((d, i) => (
                <button
                  key={`${d.name}-${i}`}
                  type="button"
                  onClick={() => setActiveDocIndex(i)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm mb-1 ${
                    i === activeDocIndex ? 'bg-sky-50 font-medium text-gray-900' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>📄</span>
                  <span className="flex-1 truncate">{d.name}</span>
                  <span className="text-xs text-gray-500">{d.size}</span>
                </button>
              ))}
            </div>
            <label className="m-3 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium cursor-pointer hover:bg-blue-700">
              ＋ PDF hinzufügen (Demo)
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) addPdf(f)
                  e.target.value = ''
                }}
              />
            </label>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[480px]">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center text-lg">🤖</div>
              <div>
                <h3 className="font-semibold text-gray-900">Wissens-Assistent</h3>
                <p className="text-xs text-gray-600">Antworten per Claude (Server) · Demo-Dokumentenkontext</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[360px]">
              {chatUi.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                      m.role === 'user' ? 'bg-gray-200' : 'bg-blue-800 text-white'
                    }`}
                  >
                    {m.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-sky-50 text-gray-900 rounded-bl-sm border border-sky-100'
                    }`}
                  >
                    {m.typing ? (
                      <div className="flex gap-1 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.3s]" />
                      </div>
                    ) : m.role === 'bot' ? (
                      <div className="whitespace-pre-wrap">{m.text}</div>
                    ) : (
                      m.text
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-2">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void sendChat()
                  }
                }}
                rows={2}
                placeholder="Frage stellen …"
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                type="button"
                disabled={sendBusy}
                onClick={() => void sendChat()}
                className="px-5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'protocol' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">🎙️ Aufnahme / Metadaten</h3>
              <p className="text-xs text-gray-600">Mikrofon oder nur KI-Protokoll aus Stammdaten</p>
            </div>
            <div className="p-5 space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Besprechungstitel</label>
                  <input
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                    placeholder="z. B. Schichtführer-Meeting"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Datum</label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600">Teilnehmer</label>
                  <input
                    value={meetingParticipants}
                    onChange={(e) => setMeetingParticipants(e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                    placeholder="Namen, kommagetrennt"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600">Abteilung</label>
                  <select
                    value={meetingDept}
                    onChange={(e) => setMeetingDept(e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                  >
                    <option>LA OLA – Betrieb</option>
                    <option>LA OLA – Schichtführung</option>
                    <option>Bäderbook – Entwicklung</option>
                    <option>Stadtholding Landau</option>
                  </select>
                </div>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <div className="text-3xl font-serif text-blue-800 mb-2">{formatTimer(seconds)}</div>
                <button
                  type="button"
                  onClick={() => void toggleRecording()}
                  className={`w-16 h-16 rounded-full text-2xl text-white shadow-lg transition-transform ${
                    isRecording ? 'bg-red-600 animate-pulse' : 'bg-orange-500 hover:scale-105'
                  }`}
                >
                  {isRecording ? '⏹️' : '🎙️'}
                </button>
                <p className="text-sm text-gray-600 mt-3">{recordStatus}</p>
              </div>
              <label className="block text-center py-2 rounded-lg bg-blue-600 text-white text-sm font-medium cursor-pointer hover:bg-blue-700">
                Audio-Datei wählen
                <input
                  type="file"
                  accept="audio/*,video/*"
                  className="hidden"
                  onChange={() => {
                    setHasAudio(true)
                    showToast('Audio geladen (Demo – keine Transkription)')
                  }}
                />
              </label>
              <button
                type="button"
                disabled={protocolLoading}
                onClick={() => void generateProtocol()}
                className="w-full py-3 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:bg-gray-300"
              >
                {protocolLoading ? '… wird generiert' : '✨ Protokoll generieren'}
              </button>
              {!hasAudio && (
                <p className="text-xs text-gray-500 text-center">Protokoll-Button nutzt Stammdaten; Aufnahme ist optional.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[400px]">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">📋 Protokoll</h3>
            </div>
            <div className="flex-1 p-5 overflow-y-auto">
              {protocolLoading && <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600 animate-pulse rounded" />}
              {!protocolHtml && !protocolLoading && (
                <p className="text-sm text-gray-500 text-center py-12">Noch kein Protokoll – Metadaten eintragen und generieren.</p>
              )}
              {protocolHtml && (
                <div
                  className="protocol-output text-sm text-gray-800 [&_h4]:text-blue-800 [&_h4]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: protocolHtml }}
                />
              )}
            </div>
            {protocolHtml && (
              <div className="p-4 border-t border-gray-200 space-y-2">
                <div>
                  <label className="text-xs font-medium text-gray-600">Empfänger (SMTP wie E-Mail-Assistent)</label>
                  <input
                    type="email"
                    value={protocolMailTo}
                    onChange={(e) => setProtocolMailTo(e.target.value)}
                    placeholder="name@beispiel.de"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={copyProtocol} className="flex-1 min-w-[120px] py-2 rounded-lg border border-gray-200 hover:bg-blue-50 text-sm">
                    Kopieren
                  </button>
                  <button type="button" onClick={downloadProtocol} className="flex-1 min-w-[120px] py-2 rounded-lg border border-gray-200 hover:bg-blue-50 text-sm">
                    HTML-Export
                  </button>
                  <button
                    type="button"
                    disabled={sendMailBusy}
                    onClick={() => void sendProtocolByMail()}
                    className="flex-1 min-w-[120px] py-2 rounded-lg border border-gray-200 hover:bg-blue-50 text-sm disabled:opacity-50"
                  >
                    {sendMailBusy ? '…' : 'Per Mail senden'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'mail' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-sky-200 bg-sky-50/90 px-4 py-3 text-sm text-sky-950">
            <p className="font-semibold text-sky-900 mb-1">Echte Mails aus Outlook an den Agenten</p>
            <p className="text-sky-900/90 leading-relaxed">
              Der <strong>Formular-Versand</strong> nutzt <strong>SMTP (Gmail)</strong> via{' '}
              <code className="text-xs bg-white/80 px-1 rounded">EMAIL_USER</code> /{' '}
              <code className="text-xs bg-white/80 px-1 rounded">EMAIL_PASS</code>. Zum <strong>Empfang</strong> dient{' '}
              <strong>IMAP</strong> mit denselben Zugangsdaten. Für <strong>Antworten aus dem E-Mail-Assistenten</strong>{' '}
              (und optional Protokoll-Mail) können Sie <strong>IONOS SMTP</strong> wie in der Netlify-Vorlage einrichten:{' '}
              <code className="text-xs bg-white/80 px-1 rounded">AGENT_SMTP_USER</code>,{' '}
              <code className="text-xs bg-white/80 px-1 rounded">AGENT_SMTP_PASSWORD</code> (oder{' '}
              <code className="text-xs bg-white/80 px-1 rounded">SMTP_PASSWORD</code>), optional{' '}
              <code className="text-xs bg-white/80 px-1 rounded">AGENT_SMTP_FROM_EMAIL</code> /{' '}
              <code className="text-xs bg-white/80 px-1 rounded">AGENT_SMTP_HOST</code>. Legen Sie in <strong>Outlook</strong>{' '}
              eine Regel an: eingehende Mails <strong>weiterleiten an</strong> die IMAP-Gmail-Adresse. Cron:{' '}
              <code className="text-xs bg-white/80 px-1 rounded">POST/GET /api/agent/inbox/sync</code>. SQL:{' '}
              <code className="text-xs bg-white/80 px-1 rounded">sql/create_agent_inbound_mails.sql</code>.
            </p>
          </div>
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 min-h-[520px]">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center text-sm font-semibold">
              Eingang
              <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                {mailList.filter((m) => m.unread).length} neu
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {mailList.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => openMail(m.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-sky-50 ${
                    selectedMailId === m.id ? 'bg-sky-50' : ''
                  } ${m.unread ? 'font-medium' : ''}`}
                >
                  <div className="flex items-center gap-2 text-xs">
                    {m.unread && <span className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />}
                    <span className="truncate">{m.from}</span>
                    <span
                      className={`text-[10px] px-1.5 rounded ${
                        m.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : m.priority === 'mid'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {PRIORITY_LABELS[m.priority]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-900 mt-0.5 truncate">{m.subject}</div>
                  <div className="text-xs text-gray-500 truncate">{m.preview}</div>
                  <div className="text-[11px] text-gray-400 mt-1">{m.time}</div>
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200 p-3 bg-gray-50/90 space-y-2">
              <p className="text-xs font-semibold text-gray-700">Echte E-Mail hier einfügen</p>
              <p className="text-[11px] text-gray-500 leading-snug">
                Alternative ohne Weiterleitung: Inhalt aus Outlook/Webmail kopieren – die KI erzeugt den Antwortvorschlag.
              </p>
              <input
                type="text"
                value={pasteFrom}
                onChange={(e) => setPasteFrom(e.target.value)}
                placeholder="Absendername (optional)"
                className="w-full text-xs rounded-lg border border-gray-200 px-2 py-1.5"
              />
              <input
                type="text"
                value={pasteEmail}
                onChange={(e) => setPasteEmail(e.target.value)}
                placeholder="E-Mail-Adresse Absender (optional)"
                className="w-full text-xs rounded-lg border border-gray-200 px-2 py-1.5"
              />
              <input
                type="text"
                value={pasteSubject}
                onChange={(e) => setPasteSubject(e.target.value)}
                placeholder="Betreff *"
                className="w-full text-xs rounded-lg border border-gray-200 px-2 py-1.5"
              />
              <textarea
                value={pasteBody}
                onChange={(e) => setPasteBody(e.target.value)}
                placeholder="Nachrichtentext *"
                rows={4}
                className="w-full text-xs rounded-lg border border-gray-200 px-2 py-1.5 resize-y"
              />
              <button
                type="button"
                onClick={analyzePastedMail}
                disabled={mailReplyLoading}
                className="w-full py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Mit KI analysieren
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[400px]">
            {!selectedMail ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
                <span className="text-5xl mb-3 opacity-50">✉️</span>
                <p className="text-sm text-center max-w-sm">
                  Server-Mails (IMAP) erscheinen oben in der Liste, oder Demo / unten einfügen.
                </p>
              </div>
            ) : (
              <>
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-blue-900">{selectedMail.subject}</h3>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600 mt-2">
                    <span>
                      <strong className="text-gray-800">Von:</strong> {selectedMail.from} &lt;{selectedMail.email}&gt;
                    </span>
                    <span>
                      <strong className="text-gray-800">Eingang:</strong> {selectedMail.time}
                    </span>
                  </div>
                </div>
                <div className="px-6 py-4 text-sm text-gray-800 whitespace-pre-wrap border-b border-gray-100 max-h-48 overflow-y-auto">
                  {selectedMail.body}
                </div>
                <div className="flex-1 p-6 bg-sky-50/80 flex flex-col gap-3 min-h-[200px]">
                  <div className="text-xs font-semibold text-blue-800 uppercase tracking-wide flex items-center gap-2">
                    🤖 KI-Antwortvorschlag
                    <span className="flex-1 h-px bg-blue-200" />
                  </div>
                  {mailReplyLoading && (
                    <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600 rounded animate-pulse" />
                  )}
                  <textarea
                    value={aiReply}
                    onChange={(e) => setAiReply(e.target.value)}
                    readOnly={replyReadonly}
                    rows={8}
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Antwort wird generiert…"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={sendMailBusy}
                      onClick={() => void sendAgentReplyMail()}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {sendMailBusy ? 'Senden …' : 'Senden'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyReadonly(false)
                        showToast('Antwort bearbeitbar')
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-white"
                    >
                      Bearbeiten
                    </button>
                    <button
                      type="button"
                      onClick={() => void generateMailReply(selectedMail)}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-white"
                    >
                      Neu generieren
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl bg-blue-900 text-white text-sm shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}
