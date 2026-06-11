'use client'

import { useState } from 'react'

type Channel = 'press' | 'instagram' | 'linkedin'

const CHANNELS: { id: Channel; icon: string; label: string; desc: string }[] = [
  {
    id: 'press',
    icon: '📰',
    label: 'Pressemitteilung',
    desc: 'Formelle Mitteilung mit Schlagzeile, Lead, Zitat und Boilerplate',
  },
  {
    id: 'instagram',
    icon: '📸',
    label: 'Instagram-Beitrag',
    desc: 'Hook, Caption, Hashtags und Bildidee im LA OLA Look',
  },
  {
    id: 'linkedin',
    icon: '💼',
    label: 'LinkedIn-Beitrag',
    desc: 'Professioneller Beitrag für die Unternehmensseite',
  },
]

const TONES = ['Standard (LA OLA Markenstimme)', 'Locker & verspielt', 'Sachlich & informativ', 'Festlich & feierlich', 'Dringend (z. B. kurzfristige Info)']

/** Hashtags im Text blau hervorheben (für Instagram/LinkedIn-Vorschau). */
function renderWithHashtags(text: string) {
  return text.split(/(#[\wäöüÄÖÜß]+)/g).map((part, i) =>
    part.startsWith('#') ? (
      <span key={i} className="text-sky-700 font-medium">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

/** Instagram-Caption in Hook (1. Zeile), Rest und Bildidee zerlegen. */
function splitInstagramText(text: string) {
  const bildIdeeMatch = text.match(/\n\s*Bildidee:\s*([\s\S]*)$/i)
  const withoutIdea = bildIdeeMatch ? text.slice(0, bildIdeeMatch.index) : text
  const lines = withoutIdea.trim().split('\n')
  const hook = (lines[0] || '').trim()
  const rest = lines.slice(1).join('\n').trim()
  return { hook, rest, imageIdea: bildIdeeMatch ? bildIdeeMatch[1].trim() : '' }
}

export default function MarketingTab({ onToast }: { onToast: (msg: string) => void }) {
  const [channel, setChannel] = useState<Channel>('instagram')
  const [topic, setTopic] = useState('')
  const [details, setDetails] = useState('')
  const [date, setDate] = useState('')
  const [audience, setAudience] = useState('')
  const [tone, setTone] = useState(TONES[0])
  const [cta, setCta] = useState('')
  const [contact, setContact] = useState('')
  const [feedback, setFeedback] = useState('')
  const [result, setResult] = useState('')
  const [resultChannel, setResultChannel] = useState<Channel>('instagram')
  const [loading, setLoading] = useState(false)

  const generate = async (withFeedback: boolean) => {
    if (!topic.trim()) {
      onToast('Bitte Thema/Anlass eintragen.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/agent/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          topic,
          details,
          date,
          audience,
          tone: tone === TONES[0] ? '' : tone,
          cta,
          contact,
          previousText: withFeedback ? result : '',
          feedback: withFeedback ? feedback : '',
        }),
      })
      const raw = await res.text()
      let data: { text?: string; error?: string }
      try {
        data = JSON.parse(raw)
      } catch {
        throw new Error(res.ok ? 'Ungültige Server-Antwort.' : `Serverfehler (${res.status})`)
      }
      if (!res.ok) throw new Error(data.error || 'Anfrage fehlgeschlagen')
      setResult(data.text || '')
      setResultChannel(channel)
      setFeedback('')
      onToast(withFeedback ? 'Beitrag überarbeitet' : 'Beitrag erstellt')
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'Fehler bei der KI-Anfrage')
    }
    setLoading(false)
  }

  const copyResult = () => {
    void navigator.clipboard.writeText(result)
    onToast('Text in Zwischenablage kopiert')
  }

  const downloadResult = () => {
    const names: Record<Channel, string> = {
      press: 'Pressemitteilung',
      instagram: 'Instagram-Beitrag',
      linkedin: 'LinkedIn-Beitrag',
    }
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `LA_OLA_${names[resultChannel]}_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(a.href)
    onToast('Download gestartet')
  }

  const instagram = resultChannel === 'instagram' ? splitInstagramText(result) : null

  return (
    <div className="space-y-4">
      {/* Kanalauswahl */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {CHANNELS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setChannel(c.id)}
            className={`text-left rounded-xl border p-4 transition-all ${
              channel === c.id
                ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-200'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="font-semibold text-gray-900 text-sm">{c.label}</div>
            <div className="text-xs text-gray-600 mt-0.5">{c.desc}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Eingaben */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">📣 Angaben zur Maßnahme</h3>
            <p className="text-xs text-gray-600">
              Je konkreter die Angaben, desto besser der Entwurf. Fehlende Infos markiert die KI als Platzhalter.
            </p>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Thema / Anlass *</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="z. B. Mitternachtssauna im Juli, neue Rutsche, Ferienprogramm"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Wichtige Infos / Stichpunkte</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={5}
                placeholder={'z. B.\n– Termin: Sa. 18.07., 20–24 Uhr\n– 5 Aufgüsse, Eintritt 19 €\n– Anmeldung an der Kasse'}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 resize-y"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Datum / Zeitraum</label>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="z. B. 18. Juli 2026"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Zielgruppe</label>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="z. B. Familien, Saunagäste"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Tonalität</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                >
                  {TONES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Handlungsaufforderung</label>
                <input
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="z. B. Tickets online sichern"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                />
              </div>
            </div>
            {channel === 'press' && (
              <div>
                <label className="text-xs font-medium text-gray-600">Pressekontakt</label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Name, Funktion, Telefon, E-Mail"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                />
              </div>
            )}
            <button
              type="button"
              disabled={loading}
              onClick={() => void generate(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-sky-500 text-white font-medium hover:from-blue-800 hover:to-sky-600 disabled:opacity-50 shadow-md"
            >
              {loading ? '… wird erstellt' : `✨ ${CHANNELS.find((c) => c.id === channel)?.label} erstellen`}
            </button>
            {result && (
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <label className="text-xs font-medium text-gray-600">Überarbeiten (Feedback an die KI)</label>
                <div className="flex gap-2">
                  <input
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="z. B. kürzer, mehr Emojis, Preis betonen"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                  />
                  <button
                    type="button"
                    disabled={loading || !feedback.trim() || channel !== resultChannel}
                    onClick={() => void generate(true)}
                    className="px-4 py-2 rounded-lg border border-blue-300 text-blue-700 text-sm hover:bg-blue-50 disabled:opacity-50"
                  >
                    Überarbeiten
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vorschau */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[420px]">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">👀 Vorschau</h3>
            {result && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-800 hover:bg-blue-50"
                >
                  Kopieren
                </button>
                <button
                  type="button"
                  onClick={downloadResult}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-800 hover:bg-blue-50"
                >
                  Download (.txt)
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 p-5 overflow-y-auto bg-gray-50/60">
            {loading && (
              <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600 animate-pulse rounded mb-4" />
            )}
            {!result && !loading && (
              <p className="text-sm text-gray-500 text-center py-16">
                Noch kein Entwurf – Kanal wählen, Angaben eintragen und erstellen.
              </p>
            )}

            {result && resultChannel === 'instagram' && instagram && (
              <div className="max-w-sm mx-auto rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/la-ola-logo.png"
                    alt="LA OLA"
                    className="w-9 h-9 rounded-full border border-gray-200 object-contain bg-white p-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">laola_freizeitbad</p>
                    <p className="text-[11px] text-gray-500">Landau in der Pfalz</p>
                  </div>
                  <span className="text-gray-400 text-lg leading-none">⋯</span>
                </div>
                <div className="aspect-square bg-gradient-to-br from-blue-900 via-blue-700 to-sky-500 relative flex items-center justify-center p-6">
                  <span className="absolute top-4 left-4 text-3xl opacity-80">🌊</span>
                  <span className="absolute bottom-4 right-4 text-3xl opacity-80">💦</span>
                  <p className="text-white text-xl font-bold text-center leading-snug drop-shadow-md">
                    {instagram.hook}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/la-ola-logo.png"
                    alt=""
                    className="absolute bottom-3 left-3 h-7 bg-white/90 rounded-md px-1.5 py-0.5 object-contain"
                  />
                </div>
                <div className="px-4 py-2 text-xl flex gap-3 text-gray-800">
                  <span>❤️</span>
                  <span>💬</span>
                  <span>📤</span>
                </div>
                <div className="px-4 pb-4 text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                  <span className="font-semibold">laola_freizeitbad</span>{' '}
                  {renderWithHashtags(`${instagram.hook}\n\n${instagram.rest}`)}
                </div>
                {instagram.imageIdea && (
                  <div className="mx-4 mb-4 rounded-lg bg-sky-50 border border-sky-100 px-3 py-2 text-xs text-sky-900">
                    💡 <strong>Bildidee:</strong> {instagram.imageIdea}
                  </div>
                )}
              </div>
            )}

            {result && resultChannel === 'linkedin' && (
              <div className="max-w-lg mx-auto rounded-xl border border-gray-200 bg-white shadow-md overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/la-ola-logo.png"
                    alt="LA OLA"
                    className="w-11 h-11 rounded-md border border-gray-200 object-contain bg-white p-0.5"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">LA OLA – Das Freizeitbad</p>
                    <p className="text-[11px] text-gray-500">
                      Stadtholding Landau in der Pfalz GmbH · Jetzt
                    </p>
                  </div>
                </div>
                <div className="px-4 py-4 text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {renderWithHashtags(result)}
                </div>
                <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-500 flex gap-4">
                  <span>👍 Gefällt mir</span>
                  <span>💬 Kommentieren</span>
                  <span>↗️ Teilen</span>
                </div>
              </div>
            )}

            {result && resultChannel === 'press' && (
              <div className="max-w-2xl mx-auto rounded-xl border border-gray-200 bg-white shadow-md p-6 lg:p-8">
                <div className="flex items-center justify-between border-b-2 border-blue-900 pb-4 mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/la-ola-logo.png" alt="LA OLA" className="h-10 object-contain" />
                  <div className="text-right text-[11px] text-gray-600 leading-tight">
                    <p className="font-semibold text-blue-900">Stadtholding Landau in der Pfalz GmbH</p>
                    <p>Freizeitbad LA OLA</p>
                  </div>
                </div>
                <div className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed font-serif">
                  {result}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
