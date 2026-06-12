'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  buildProtocolHtmlFile,
  embedProtocolLogos,
  wrapProtocolDocument,
} from '@/lib/agentProtocolDocument'
import {
  getBrowserSpeechRecognition,
  readSpeechResults,
  type BrowserSpeechRecognition,
} from '@/lib/agentSpeechRecognition'
import MarketingTab from '@/components/agent/MarketingTab'

type TabId = 'dashboard' | 'chat' | 'protocol' | 'marketing'

type KnowledgeDoc = {
  id: string
  title: string
  category: string
  fileName: string
}

type KnowledgeSource = {
  title: string
  pages: number[]
  url?: string
}

type AgentStats = {
  chatToday: number
  protocolsTotal: number
  marketingTotal: number
  pdfsIndexed: number
  pdfsTotal: number
}

type ChatUiMessage = {
  role: 'user' | 'bot'
  text: string
  typing?: boolean
  sources?: KnowledgeSource[]
}

function initials(name: string | null) {
  if (!name) return '?'
  const p = name.split(/\s+/).filter(Boolean)
  if (p.length >= 2) return (p[0][0] + p[p.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

async function parseAgentJson<T>(res: Response): Promise<T> {
  const raw = await res.text()
  try {
    return JSON.parse(raw) as T
  } catch {
    const preview = raw.trim().slice(0, 80).replace(/\s+/g, ' ')
    throw new Error(
      res.ok
        ? 'Ungültige Server-Antwort (kein JSON).'
        : `Serverfehler (${res.status})${preview ? `: ${preview}` : ''}`,
    )
  }
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
  const data = await parseAgentJson<{ error?: string; text?: string }>(res)
  if (!res.ok) throw new Error(data.error || 'Anfrage fehlgeschlagen')
  return data.text as string
}

/** Bestes vom Browser unterstütztes Aufnahmeformat wählen (iOS Safari: audio/mp4). */
function pickRecorderMimeType(): string {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return ''
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ]
  for (const type of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(type)) return type
    } catch {
      /* weiter probieren */
    }
  }
  return ''
}

function fileExtensionForMime(mime: string): string {
  if (mime.includes('mp4')) return 'mp4'
  if (mime.includes('ogg')) return 'ogg'
  if (mime.includes('mpeg')) return 'mp3'
  return 'webm'
}

export default function AgentPageClient({ currentUser }: { currentUser: string | null }) {
  const [tab, setTab] = useState<TabId>('dashboard')
  const [toast, setToast] = useState<string | null>(null)
  const [claudeConfigured, setClaudeConfigured] = useState<boolean | null>(null)
  const [stats, setStats] = useState<AgentStats | null>(null)

  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>([])
  const [knowledgeDocsLoading, setKnowledgeDocsLoading] = useState(false)
  const [indexStatus, setIndexStatus] = useState<{ indexed: number; total: number } | null>(null)
  const warmupRunningRef = useRef(false)
  const [activeDocIndex, setActiveDocIndex] = useState(0)
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const firstName = (currentUser || '').split(/\s+/)[0] || ''
  const [chatUi, setChatUi] = useState<ChatUiMessage[]>([
    {
      role: 'bot',
      text: `Hallo${firstName ? ` ${firstName}` : ''}! Ich bin dein Wissens-Assistent. Ich durchsuche die PDF-Dokumente aus dem Bereich „Dokumente“ und nenne dir die Quelle mit Seitenangabe. Wenn mir eine Angabe fehlt, frage ich gezielt nach.`,
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
  const [audioFileName, setAudioFileName] = useState<string | null>(null)
  const [audioTranscribing, setAudioTranscribing] = useState(false)
  const [meetingTranscript, setMeetingTranscript] = useState('')
  const [transcriptInterim, setTranscriptInterim] = useState('')
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const isRecordingRef = useRef(false)
  const gotSpeechTextRef = useRef(false)
  const audioChunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [recordStatus, setRecordStatus] = useState('Klicken zum Aufnehmen')

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    setSpeechSupported(Boolean(getBrowserSpeechRecognition()))
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/agent/status')
        const data = (await res.json()) as { configured?: boolean }
        setClaudeConfigured(Boolean(data.configured))
      } catch {
        setClaudeConfigured(false)
      }
    })()
  }, [])

  // Echte Dashboard-Kennzahlen laden (bei jedem Wechsel zurück aufs Dashboard aktualisieren)
  useEffect(() => {
    if (tab !== 'dashboard') return
    void (async () => {
      try {
        const res = await fetch('/api/agent/stats', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as AgentStats
        setStats(data)
      } catch {
        /* Kennzahlen sind optional */
      }
    })()
  }, [tab])

  /** PDF-Index im Hintergrund aufwärmen, damit die erste Frage schnell ist. */
  const warmKnowledgeIndex = useCallback(async () => {
    if (warmupRunningRef.current) return
    warmupRunningRef.current = true
    try {
      for (let round = 0; round < 10; round++) {
        const res = await fetch('/api/agent/knowledge?warm=1', { cache: 'no-store' })
        if (!res.ok) break
        const data = (await res.json()) as { total?: number; indexed?: number; remaining?: number }
        const total = data.total ?? 0
        const indexed = data.indexed ?? 0
        setIndexStatus({ indexed, total })
        if (!data.remaining) break
      }
    } catch {
      /* Warm-up ist optional */
    } finally {
      warmupRunningRef.current = false
    }
  }, [])

  useEffect(() => {
    if (tab !== 'chat') return
    setKnowledgeDocsLoading(true)
    void (async () => {
      try {
        const res = await fetch('/api/agent/knowledge', { cache: 'no-store' })
        const data = await parseAgentJson<{
          documents?: KnowledgeDoc[]
          count?: number
          error?: string
        }>(res)
        if (!res.ok) throw new Error(data.error || 'Dokumente konnten nicht geladen werden')
        const docs = Array.isArray(data.documents) ? data.documents : []
        setKnowledgeDocs(docs)
        setActiveDocIndex(0)
        if (docs.length > 0) {
          setChatUi((ui) => {
            if (ui.length !== 1 || ui[0]?.role !== 'bot') return ui
            return [
              {
                role: 'bot',
                text: `Hallo${firstName ? ` ${firstName}` : ''}! Ich bin dein Wissens-Assistent. Ich habe Zugriff auf ${docs.length} PDF-Dokument(e) aus „Dokumente“. Stell mir deine Frage – ich antworte mit Quellenangabe (Titel + Seite) oder frage nach, wenn mir eine Angabe fehlt.`,
              },
            ]
          })
          void warmKnowledgeIndex()
        }
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Dokumente konnten nicht geladen werden')
      } finally {
        setKnowledgeDocsLoading(false)
      }
    })()
  }, [tab, showToast, warmKnowledgeIndex])

  const sendChat = async () => {
    const msg = chatInput.trim()
    if (!msg || sendBusy) return
    setChatInput('')
    setSendBusy(true)
    setChatUi((u) => [...u, { role: 'user', text: msg }, { role: 'bot', text: '', typing: true }])

    try {
      const res = await fetch('/api/agent/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ message: msg, history: chatHistory, userName: currentUser || '' }),
      })
      const data = await parseAgentJson<{
        text?: string
        error?: string
        sources?: KnowledgeSource[]
      }>(res)
      if (!res.ok) throw new Error(data.error || 'Anfrage fehlgeschlagen')
      const reply = data.text || ''
      const sources = Array.isArray(data.sources) ? data.sources : []
      setChatHistory((h) => [...h, { role: 'user', content: msg }, { role: 'assistant', content: reply }])
      setChatUi((u) => {
        const next = [...u]
        const i = next.length - 1
        if (next[i]?.typing) next[i] = { role: 'bot', text: reply, sources }
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

  const generateProtocol = async () => {
    const title = meetingTitle.trim() || 'Besprechung'
    const transcript = meetingTranscript.trim()

    if (!transcript) {
      showToast('Bitte zuerst eine Sprachaufnahme machen oder das Transkript eintragen.')
      return
    }

    setProtocolLoading(true)
    setProtocolHtml('')
    const systemPrompt = `Du bist ein professioneller Protokollschreiber für die Stadtholding Landau / Bäderbook GmbH.
Erstelle ein formelles Besprechungsprotokoll auf Deutsch in HTML-Format.
Verwende diese HTML-Tags: h4 für Abschnitte, p für Text, ul/li für Aufzählungen.
Kein eigenes Logo oder Briefkopf – der wird automatisch ergänzt.

Wichtig:
- Leite den Inhalt ausschließlich aus der Transkription ab.
- Erfinde keine Themen, Beschlüsse oder Aufgaben, die nicht in der Transkription vorkommen.
- Strukturiere das Protokoll mit: Kopfdaten, Tagesordnung, Besprochene Inhalte, Beschlüsse, Aufgaben mit Verantwortlichen, nächste Sitzung (falls erwähnt).`

    const userMsg = `Erstelle ein Besprechungsprotokoll aus folgender Transkription.

Metadaten:
- Titel: ${title}
- Datum: ${meetingDate}
- Abteilung: ${meetingDept}
- Teilnehmer: ${meetingParticipants || 'Nicht angegeben'}

Transkription (gesprochener Inhalt):
---
${transcript}
---`

    try {
      const html = await callAgentAPI(systemPrompt, [{ role: 'user', content: userMsg }], 1600)
      setProtocolHtml(wrapProtocolDocument(html, { department: meetingDept }))
      showToast('Protokoll erzeugt')
    } catch (e) {
      setProtocolHtml(
        wrapProtocolDocument(`<p>${e instanceof Error ? e.message : 'Fehler'}</p>`, {
          department: meetingDept,
        }),
      )
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

  const downloadProtocol = async () => {
    const title = meetingTitle.trim() || 'Protokoll'
    try {
      const withEmbeddedLogos = await embedProtocolLogos(protocolHtml)
      const blob = new Blob([buildProtocolHtmlFile(withEmbeddedLogos)], {
        type: 'text/html;charset=utf-8',
      })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `Protokoll_${title.replace(/\s/g, '_')}.html`
      a.click()
      URL.revokeObjectURL(a.href)
      showToast('Download gestartet')
    } catch {
      showToast('Download fehlgeschlagen')
    }
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
      const htmlForMail = buildProtocolHtmlFile(await embedProtocolLogos(protocolHtml))
      await sendAgentSmtpMail({
        to,
        subject: title,
        text: plain,
        html: htmlForMail,
      })
      showToast('Protokoll per E-Mail gesendet.')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Versand fehlgeschlagen')
    }
    setSendMailBusy(false)
  }

  const stopSpeechRecognition = useCallback(() => {
    speechRecognitionRef.current?.stop()
    speechRecognitionRef.current = null
  }, [])

  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognitionCtor = getBrowserSpeechRecognition()
    if (!SpeechRecognitionCtor) return

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'de-DE'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const { finalText, interimText } = readSpeechResults(event)
      if (finalText) {
        gotSpeechTextRef.current = true
        setMeetingTranscript((prev) => (prev ? `${prev} ${finalText}` : finalText).trim())
      }
      setTranscriptInterim(interimText)
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        showToast('Mikrofon für Spracherkennung nicht erlaubt')
      }
    }

    recognition.onend = () => {
      if (isRecordingRef.current) {
        try {
          recognition.start()
        } catch {
          /* bereits aktiv */
        }
      }
    }

    try {
      recognition.start()
      speechRecognitionRef.current = recognition
    } catch {
      /* Aufnahme läuft weiter – Whisper-Fallback übernimmt nach dem Stopp */
    }
  }, [showToast])

  /** Audio (Datei oder Aufnahme) an den Server schicken und per Whisper transkribieren. */
  const transcribeUpload = async (file: File, label: string) => {
    setAudioTranscribing(true)
    setRecordStatus(`Transkribiere ${label} …`)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/agent/transcribe', {
        method: 'POST',
        body: formData,
      })
      const data = await parseAgentJson<{ text?: string; error?: string }>(res)
      if (!res.ok) throw new Error(data.error || 'Transkription fehlgeschlagen')

      const text = (data.text || '').trim()
      if (!text) throw new Error('Kein Text erkannt.')

      setMeetingTranscript((prev) => (prev ? `${prev} ${text}`.trim() : text))
      setHasAudio(true)
      setRecordStatus(`${label} transkribiert – Transkript bereit`)
      showToast('Transkript erstellt')
    } catch (e) {
      setRecordStatus('Transkription fehlgeschlagen')
      showToast(e instanceof Error ? e.message : 'Transkription fehlgeschlagen')
    }
    setAudioTranscribing(false)
  }

  const transcribeAudioFile = async (file: File) => {
    if (isRecording) {
      showToast('Bitte zuerst die laufende Aufnahme beenden.')
      return
    }
    if (audioTranscribing) return
    setAudioFileName(file.name)
    await transcribeUpload(file, `„${file.name}“`)
  }

  /** Aufnahme abschließen: Chunks einsammeln und ggf. per Whisper transkribieren. */
  const finalizeRecording = useCallback(
    (mr: MediaRecorder | null, mimeType: string) => {
      setHasAudio(audioChunksRef.current.length > 0)

      // Handy/Safari: keine (oder leere) Live-Spracherkennung →
      // Aufnahme automatisch per Whisper transkribieren
      const needsServerTranscription = !gotSpeechTextRef.current
      if (needsServerTranscription && audioChunksRef.current.length > 0) {
        const type = mr?.mimeType || mimeType || 'audio/webm'
        const blob = new Blob(audioChunksRef.current, { type })
        const ext = fileExtensionForMime(type)
        const file = new File([blob], `aufnahme.${ext}`, { type })
        void transcribeUpload(file, 'Aufnahme')
      } else if (needsServerTranscription) {
        setRecordStatus('Keine Audiodaten aufgenommen – bitte erneut versuchen.')
        showToast('Keine Audiodaten aufgenommen')
      } else {
        setRecordStatus('Aufnahme gespeichert – Transkript bereit')
        showToast('Aufnahme beendet – Transkript wird für das Protokoll genutzt')
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showToast],
  )

  /**
   * Aufnahme stoppen – jeder Schritt einzeln abgesichert, damit die UI auch
   * dann zurückgesetzt wird, wenn das Handy (v. a. iOS Safari) beim Stoppen
   * eine Exception wirft oder das onstop-Event nie feuert.
   */
  const stopRecording = useCallback(() => {
    isRecordingRef.current = false
    setIsRecording(false)
    setTranscriptInterim('')
    setRecordStatus('Aufnahme wird gespeichert …')
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    try {
      stopSpeechRecognition()
    } catch {
      /* weiter – Aufnahme trotzdem beenden */
    }

    const mr = mediaRecorderRef.current
    mediaRecorderRef.current = null
    if (!mr) {
      setRecordStatus('Klicken zum Aufnehmen')
      return
    }
    const mimeType = mr.mimeType || ''

    // Abschluss nur einmal ausführen – egal ob über onstop oder Sicherheitsnetz
    let finalized = false
    const finalizeOnce = () => {
      if (finalized) return
      finalized = true
      finalizeRecording(mr, mimeType)
    }
    mr.onstop = finalizeOnce

    try {
      if (mr.state === 'recording' || mr.state === 'paused') {
        try {
          mr.requestData()
        } catch {
          /* optional – letzter Datenblock */
        }
        mr.stop()
      }
    } catch {
      /* stop() fehlgeschlagen – Sicherheitsnetz unten übernimmt */
    }

    try {
      mr.stream.getTracks().forEach((t) => t.stop())
    } catch {
      /* Mikrofon-Tracks ließen sich nicht stoppen */
    }

    // Sicherheitsnetz: falls onstop auf dem Gerät nicht feuert
    setTimeout(finalizeOnce, 1200)
  }, [finalizeRecording, stopSpeechRecognition])

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      showToast('Mikrofonaufnahme wird von diesem Browser nicht unterstützt (HTTPS erforderlich).')
      return
    }
    try {
      audioChunksRef.current = []
      gotSpeechTextRef.current = false
      setTranscriptInterim('')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = pickRecorderMimeType()
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      mr.start(1000)
      mediaRecorderRef.current = mr
      isRecordingRef.current = true
      setIsRecording(true)
      setSeconds(0)
      const speechAvailable = Boolean(getBrowserSpeechRecognition())
      setRecordStatus(
        speechAvailable
          ? 'Aufnahme läuft – bitte sprechen …'
          : 'Aufnahme läuft – Transkript wird nach dem Stopp automatisch erstellt …',
      )
      startSpeechRecognition()
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      showToast('Mikrofonzugriff verweigert')
    }
  }, [showToast, startSpeechRecognition])

  const lastToggleRef = useRef(0)
  const toggleRecording = async () => {
    // Schutz gegen doppelt ausgelöste Taps (Touch + Click auf Mobilgeräten)
    const now = Date.now()
    if (now - lastToggleRef.current < 500) return
    lastToggleRef.current = now

    if (isRecordingRef.current) {
      stopRecording()
    } else {
      await startRecording()
    }
  }

  const formatTimer = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const tabTitle: Record<TabId, string> = {
    dashboard: 'Dashboard',
    chat: 'Wissens-Chatbot',
    protocol: 'Protokoll-Generator',
    marketing: 'Marketing-Agent',
  }
  const tabSub: Record<TabId, string> = {
    dashboard: currentUser ? `Willkommen zurück, ${currentUser}` : 'Übersicht KI-Module',
    chat: 'Antworten aus PDF-Dokumenten im Bereich „Dokumente“ – mit Quellen und Seitenangabe',
    protocol: 'Live-Aufnahme oder Audio-Datei → Protokoll',
    marketing: 'Pressemitteilungen, Instagram- und LinkedIn-Beiträge im LA OLA Design',
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
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
            claudeConfigured === null
              ? 'bg-gray-50 border-gray-200 text-gray-600'
              : claudeConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              claudeConfigured === null
                ? 'bg-gray-400'
                : claudeConfigured
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-amber-500'
            }`}
          />
          {claudeConfigured === null
            ? 'Claude-Status wird geprüft…'
            : claudeConfigured
              ? 'Claude verbunden (Server)'
              : 'Claude API fehlt auf dem Server'}
        </div>
      </div>

      {claudeConfigured === false && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium mb-1">Claude API-Schlüssel in Netlify hinterlegen</p>
          <p className="text-amber-900/90">
            Netlify → <strong>Site configuration</strong> → <strong>Environment variables</strong> → Variable{' '}
            <code className="text-xs bg-amber-100/80 px-1 rounded">ANTHROPIC_API_KEY</code> mit Ihrem Schlüssel von{' '}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:underline"
            >
              console.anthropic.com
            </a>{' '}
            anlegen. Anschließend die Seite neu deployen – dann funktioniert die KI auf allen Geräten.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <NavBtn id="dashboard" label="Dashboard" icon="🏠" />
        <NavBtn id="chat" label="Wissens-Chatbot" icon="💬" />
        <NavBtn id="protocol" label="Protokoll-Generator" icon="🎙️" />
        <NavBtn id="marketing" label="Marketing-Agent" icon="📣" />
      </div>

      {tab === 'dashboard' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              [stats ? String(stats.chatToday) : '–', 'Chat-Anfragen heute'],
              [stats ? String(stats.protocolsTotal) : '–', 'Protokolle generiert'],
              [stats ? String(stats.marketingTotal) : '–', 'Marketing-Beiträge'],
              [
                stats
                  ? stats.pdfsTotal > 0 && stats.pdfsIndexed < stats.pdfsTotal
                    ? `${stats.pdfsIndexed}/${stats.pdfsTotal}`
                    : String(stats.pdfsIndexed)
                  : '–',
                'PDFs indexiert',
              ],
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
                Fragen zu internen PDFs aus „Dokumente“ – Antworten mit Quellenangabe und Seite.
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
              <p className="text-sm text-gray-600">Aufnahme oder Audio-Datei – KI erstellt ein Protokoll.</p>
              <span className="inline-flex mt-4 text-sm font-medium text-blue-600">Zum Generator →</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('marketing')}
              className="text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all border-t-4 border-t-blue-700"
            >
              <div className="text-3xl mb-3">📣</div>
              <h3 className="font-semibold text-gray-900 mb-1">Marketing-Agent</h3>
              <p className="text-sm text-gray-600">
                Pressemitteilungen, Instagram- und LinkedIn-Beiträge im LA OLA Design.
              </p>
              <span className="inline-flex mt-4 text-sm font-medium text-blue-600">Zum Marketing →</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Letzte Aktivitäten (Beispiel)</h3>
            <ul className="space-y-3 text-sm">
              {[
                ['#0ea5e9', 'Chatbot: Frage zu Öffnungszeiten LA OLA', 'Heute, 09:42'],
                ['#d97706', 'Protokoll: Schichtführer-Besprechung', 'Heute, 08:15'],
                ['#1d4ed8', 'Marketing: Instagram-Beitrag Mitternachtssauna', 'Gestern, 17:30'],
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
            <div className="px-4 py-3 border-b border-gray-200 font-semibold text-sm text-gray-800">
              Wissensdatenbank · Dokumente
            </div>
            <div className="flex-1 overflow-y-auto p-2 max-h-[420px] lg:max-h-none">
              {knowledgeDocsLoading && (
                <p className="text-sm text-gray-500 px-3 py-4">PDF-Dokumente werden geladen …</p>
              )}
              {!knowledgeDocsLoading && knowledgeDocs.length === 0 && (
                <p className="text-sm text-gray-500 px-3 py-4">
                  Noch keine PDFs in „Dokumente“. Bitte dort Dokumente hochladen.
                </p>
              )}
              {knowledgeDocs.map((d, i) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setActiveDocIndex(i)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm mb-1 ${
                    i === activeDocIndex ? 'bg-sky-50 font-medium text-gray-900' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>📄</span>
                  <span className="flex-1 min-w-0">
                    <span className="block truncate">{d.title}</span>
                    <span className="block text-xs text-gray-500 truncate">{d.category}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="m-3 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-900">
              {knowledgeDocs.length === 0 && 'Neue PDFs unter Dokumente hochladen, dann Tab neu öffnen.'}
              {knowledgeDocs.length > 0 &&
                (indexStatus && indexStatus.indexed < indexStatus.total
                  ? `Indexierung läuft: ${indexStatus.indexed}/${indexStatus.total} PDFs bereit …`
                  : `${knowledgeDocs.length} PDF(s) aus „Dokumente“ werden für Antworten genutzt.`)}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[480px]">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center text-lg">🤖</div>
              <div>
                <h3 className="font-semibold text-gray-900">Wissens-Assistent</h3>
                <p className="text-xs text-gray-600">
                  Antworten per Claude · Inhalte aus PDFs in „Dokumente“ · Quellen mit Seitenangabe
                </p>
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
                      <>
                        <div className="whitespace-pre-wrap">{m.text}</div>
                        {m.sources && m.sources.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-sky-100">
                            {m.sources.map((s) =>
                              s.url ? (
                                <a
                                  key={s.title}
                                  href={s.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full bg-white border border-sky-200 px-2 py-0.5 text-[11px] text-sky-900 hover:bg-sky-100 hover:border-sky-400 hover:underline cursor-pointer"
                                  title={`Dokument öffnen – Seiten: ${s.pages.join(', ')}`}
                                >
                                  📄 {s.title}
                                  {s.pages.length > 0 && (
                                    <span className="text-sky-600">S. {s.pages.slice(0, 4).join(', ')}{s.pages.length > 4 ? ' …' : ''}</span>
                                  )}
                                  <span className="text-sky-500">↗</span>
                                </a>
                              ) : (
                                <span
                                  key={s.title}
                                  className="inline-flex items-center gap-1 rounded-full bg-white border border-sky-200 px-2 py-0.5 text-[11px] text-sky-900"
                                  title={`Seiten: ${s.pages.join(', ')}`}
                                >
                                  📄 {s.title}
                                  {s.pages.length > 0 && (
                                    <span className="text-sky-600">S. {s.pages.slice(0, 4).join(', ')}{s.pages.length > 4 ? ' …' : ''}</span>
                                  )}
                                </span>
                              ),
                            )}
                          </div>
                        )}
                      </>
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
              <p className="text-xs text-gray-600">
                Live-Aufnahme oder Audio-Datei hochladen – der Text fließt ins Protokoll
              </p>
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
                  disabled={audioTranscribing}
                  onClick={() => void toggleRecording()}
                  className={`w-16 h-16 rounded-full text-2xl text-white shadow-lg transition-transform disabled:opacity-50 ${
                    isRecording ? 'bg-red-600 animate-pulse' : 'bg-orange-500 hover:scale-105'
                  }`}
                >
                  {isRecording ? '⏹️' : '🎙️'}
                </button>
                <p className="text-sm text-gray-600 mt-3">{recordStatus}</p>
                <p className="text-xs text-gray-500 mt-1">Live-Mikrofonaufnahme</p>
                {speechSupported === false && (
                  <p className="text-xs text-sky-800 mt-2">
                    📱 Auf diesem Gerät gibt es keine Live-Spracherkennung. Die Aufnahme wird nach dem
                    Stopp automatisch per KI transkribiert.
                  </p>
                )}
              </div>
              <label
                className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-medium cursor-pointer transition-colors ${
                  audioTranscribing
                    ? 'border-blue-200 bg-blue-50 text-blue-800 cursor-wait'
                    : 'border-gray-200 bg-gray-50 text-gray-800 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {audioTranscribing ? '⏳ Audio wird transkribiert …' : '📁 Audio-Datei wählen (MP3, M4A, WAV, WEBM)'}
                <input
                  type="file"
                  accept="audio/*,video/mp4,video/webm,.mp3,.m4a,.wav,.webm,.ogg,.mp4"
                  className="hidden"
                  disabled={audioTranscribing || isRecording}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void transcribeAudioFile(f)
                    e.target.value = ''
                  }}
                />
              </label>
              {audioFileName && !audioTranscribing && (
                <p className="text-xs text-gray-600 text-center">Letzte Datei: {audioFileName}</p>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Transkription {isRecording ? '(wird erkannt …)' : audioTranscribing ? '(wird erstellt …)' : '(bearbeitbar)'}
                </label>
                <textarea
                  value={
                    isRecording && transcriptInterim
                      ? `${meetingTranscript}${meetingTranscript ? ' ' : ''}${transcriptInterim}`
                      : meetingTranscript
                  }
                  onChange={(e) => {
                    if (!isRecording) setMeetingTranscript(e.target.value)
                  }}
                  readOnly={isRecording}
                  rows={6}
                  placeholder="Nach Aufnahme oder Audio-Datei erscheint hier der Text. Sie können ihn auch manuell eintragen oder korrigieren."
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 resize-y min-h-[120px]"
                />
              </div>
              <button
                type="button"
                disabled={protocolLoading || audioTranscribing || !meetingTranscript.trim()}
                onClick={() => void generateProtocol()}
                className="w-full py-3 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:bg-gray-300"
              >
                {protocolLoading ? '… wird generiert' : '✨ Protokoll aus Transkript generieren'}
              </button>
              {!meetingTranscript.trim() && !audioTranscribing && (
                <p className="text-xs text-gray-500 text-center">
                  Zuerst aufnehmen, Audio-Datei hochladen oder Transkript eintragen.
                </p>
              )}
              {hasAudio && meetingTranscript.trim() && (
                <p className="text-xs text-emerald-700 text-center">Aufnahme und Transkript bereit.</p>
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
                  className="protocol-output rounded-xl border border-gray-100 bg-gray-50/50 p-4 lg:p-6 text-sm text-gray-800 [&_.laola-protocol]:max-w-none [&_h4]:text-blue-800 [&_h4]:font-semibold [&_h4]:mt-5 [&_h4]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_p]:my-1.5"
                  dangerouslySetInnerHTML={{ __html: protocolHtml }}
                />
              )}
            </div>
            {protocolHtml && (
              <div className="p-4 border-t border-gray-200 space-y-2">
                <div>
                  <label className="text-xs font-medium text-gray-600">Empfänger (SMTP wie E-Mail-Versand)</label>
                  <input
                    type="email"
                    value={protocolMailTo}
                    onChange={(e) => setProtocolMailTo(e.target.value)}
                    placeholder="name@beispiel.de"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={copyProtocol} className="flex-1 min-w-[120px] py-2 rounded-lg border border-gray-200 hover:bg-blue-50 text-sm text-black">
                    Kopieren
                  </button>
                  <button type="button" onClick={downloadProtocol} className="flex-1 min-w-[120px] py-2 rounded-lg border border-gray-200 hover:bg-blue-50 text-sm text-black">
                    HTML-Export
                  </button>
                  <button
                    type="button"
                    disabled={sendMailBusy}
                    onClick={() => void sendProtocolByMail()}
                    className="flex-1 min-w-[120px] py-2 rounded-lg border border-gray-200 hover:bg-blue-50 text-sm text-black disabled:opacity-50"
                  >
                    {sendMailBusy ? '…' : 'Per Mail senden'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'marketing' && <MarketingTab onToast={showToast} />}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl bg-blue-900 text-white text-sm shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}
