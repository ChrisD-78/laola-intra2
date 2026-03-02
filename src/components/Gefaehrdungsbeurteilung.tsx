'use client'

import { useState } from 'react'

interface GefaehrdungsbeurteilungProps {
  onBack?: () => void
}

const processSteps = [
  {
    num: 1,
    title: 'Arbeitsbereiche & Tätigkeiten festlegen',
    text: 'Definieren Sie klar, welche Arbeitsplätze und Tätigkeiten in die Beurteilung einbezogen werden. Grundlage ist eine vollständige Arbeitsplatzliste.',
    tag: 'Planung'
  },
  {
    num: 2,
    title: 'Gefährdungen ermitteln',
    text: 'Systematische Begehung des Arbeitsplatzes. Alle möglichen Gefährdungsquellen werden dokumentiert – von mechanischen Risiken bis hin zu psychischer Belastung.',
    tag: 'Analyse'
  },
  {
    num: 3,
    title: 'Risiken bewerten',
    text: 'Jede ermittelte Gefährdung wird anhand von Eintrittswahrscheinlichkeit und Schadensausmaß bewertet. Das Ergebnis ist eine Risikoklasse (gering / mittel / hoch).',
    tag: 'Bewertung'
  },
  {
    num: 4,
    title: 'Maßnahmen festlegen',
    text: 'Nach dem STOP-Prinzip (Substitution → Technisch → Organisatorisch → Persönlich) werden geeignete Schutzmaßnahmen definiert und Verantwortliche benannt.',
    tag: 'Maßnahmen'
  },
  {
    num: 5,
    title: 'Maßnahmen umsetzen & prüfen',
    text: 'Die festgelegten Maßnahmen werden termingerecht umgesetzt. Ihre Wirksamkeit wird anschließend durch eine Überprüfung kontrolliert und dokumentiert.',
    tag: 'Umsetzung'
  },
  {
    num: 6,
    title: 'Fortschreiben & aktualisieren',
    text: 'Die Gefährdungsbeurteilung ist kein einmaliges Dokument. Bei Änderungen von Arbeitsabläufen, neuen Arbeitsmitteln oder nach Unfällen muss sie aktualisiert werden.',
    tag: 'Kontinuität'
  }
]

const riskRows = [
  {
    type: '⚙️ Mechanisch',
    examples: 'Stolperfallen, bewegte Maschinenteile, scharfe Kanten',
    risk: 'Hoch',
    badge: 'high',
    measure: 'Schutzvorrichtungen, PSA'
  },
  {
    type: '🔥 Thermisch',
    examples: 'Heiße Oberflächen, Kälteschutz, offene Flammen',
    risk: 'Mittel',
    badge: 'medium',
    measure: 'Hitzebeständige Handschuhe, Kennzeichnung'
  },
  {
    type: '⚡ Elektrisch',
    examples: 'Spannungsführende Teile, defekte Kabel',
    risk: 'Hoch',
    badge: 'high',
    measure: 'DGUV V3-Prüfung, Qualifikationsnachweis'
  },
  {
    type: '🧪 Gefahrstoffe',
    examples: 'Reinigungsmittel, Lacke, Lösemittel',
    risk: 'Mittel',
    badge: 'medium',
    measure: 'Sicherheitsdatenblatt, Atemschutz'
  },
  {
    type: '📢 Lärm / Vibration',
    examples: 'Maschinen über 80 dB(A), Hand-Arm-Vibration',
    risk: 'Mittel',
    badge: 'medium',
    measure: 'Gehörschutz, Lärmkataster'
  },
  {
    type: '💻 Bildschirmarbeit',
    examples: 'Ergonomie, Beleuchtung, Fehlhaltungen',
    risk: 'Gering',
    badge: 'low',
    measure: 'Bildschirmarbeitsplatzprüfung, Pausen'
  },
  {
    type: '🧠 Psychische Belastung',
    examples: 'Zeitdruck, Über-/Unterforderung, Konflikte',
    risk: 'Mittel',
    badge: 'medium',
    measure: 'Gefährdungsbeurteilung psych. Belastung'
  },
  {
    type: '🦠 Biologisch',
    examples: 'Infektionsrisiken, Schimmel, Tiere',
    risk: 'Gering',
    badge: 'low',
    measure: 'Hygienepläne, Impfempfehlungen'
  }
]

const docs = [
  { icon: '📋', title: 'Vorlage GBU – Allgemein', meta: 'PDF · Aktualisiert Jan 2025' },
  { icon: '✅', title: 'Checkliste Arbeitsplatzbegehung Freibad', meta: 'PDF · Aktualisiert Okt 2025' },
  { icon: '🧠', title: 'GBU Psychische Belastung', meta: 'PDF · Aktualisiert Dez 2024' },
  {
    icon: '📚',
    title: 'Rechtliche Grundlagen (ArbSchG)',
    meta: 'PDF · Externe Quelle',
    href: '/LA_OLA_Rechtliche_Grundlagen_ArbSchG.pdf'
  }
] as const

const contacts = [
  {
    initials: 'JJ',
    name: 'Jonas Jooss',
    role: 'Sicherheitsbeauftragter',
    phone: '+49 6341139205',
    email: 'jonas.jooss@Landau.de'
  },
  {
    initials: 'TZ',
    name: 'Timo Ziegler',
    role: 'Fachkraft für Arbeitssicherheit',
    phone: '+49 63213998000',
    email: 'info@diemer-ing.de'
  },
  {
    initials: 'MN',
    name: 'Melanie Nenninger',
    role: 'Betriebsarzt',
    phone: '+49 63419299602',
    email: 'info@medico-landau.de'
  }
]

export default function Gefaehrdungsbeurteilung({ onBack }: GefaehrdungsbeurteilungProps) {
  const [showReportModal, setShowReportModal] = useState(false)
  const [reporter, setReporter] = useState('')
  const [area, setArea] = useState('')
  const [info, setInfo] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const resetForm = () => {
    setReporter('')
    setArea('')
    setInfo('')
    setMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      alert('Bitte eine kurze Beschreibung der Gefährdung eingeben.')
      return
    }

    try {
      setSending(true)
      const subject = 'Neue Gefährdungsmeldung aus dem Intranet'
      const plainText = [
        `Meldung: ${message}`,
        reporter ? `Meldende Person: ${reporter}` : '',
        area ? `Bereich: ${area}` : '',
        info ? `Zusätzliche Info: ${info}` : ''
      ]
        .filter(Boolean)
        .join('\n')

      const html = `
        <h2>Neue Gefährdungsmeldung</h2>
        <p><strong>Meldung:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
        ${reporter ? `<p><strong>Meldende Person:</strong><br/>${reporter}</p>` : ''}
        ${area ? `<p><strong>Bereich:</strong><br/>${area}</p>` : ''}
        ${info ? `<p><strong>Zusätzliche Info:</strong><br/>${info.replace(/\n/g, '<br/>')}</p>` : ''}
      `

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'christof.drost@landau.de',
          subject,
          text: plainText,
          html
        })
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok || result?.success === false) {
        console.error('Gefährdungsmeldung E-Mail fehlgeschlagen', result)
        alert('Die Meldung konnte nicht per E-Mail versendet werden. Bitte informieren Sie die verantwortliche Person direkt.')
        return
      }

      alert('Vielen Dank. Die Meldung wurde erfolgreich versendet.')
      resetForm()
      setShowReportModal(false)
    } catch (error) {
      console.error('Fehler beim Senden der Gefährdungsmeldung', error)
      alert('Die Meldung konnte nicht per E-Mail versendet werden. Bitte informieren Sie die verantwortliche Person direkt.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white relative overflow-hidden">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg transition-colors font-medium text-white flex items-center gap-2"
          >
            ← Zurück
          </button>
        )}
        <div className={onBack ? 'ml-32' : ''}>
          <h2 className="text-3xl font-bold mb-2">⚠️ Gefährdungsbeurteilung</h2>
          <p className="text-white/90 max-w-2xl">
            Die Gefährdungsbeurteilung ist das zentrale Instrument des betrieblichen Arbeitsschutzes. Sie ist
            gesetzlich vorgeschrieben und schützt alle Beschäftigten.
          </p>
        </div>
      </div>

      {/* Übersicht-Kacheln */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl mb-3">🔄</div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Der Prozess</h3>
            <p className="text-sm text-gray-600">
              In 6 systematischen Schritten werden Gefährdungen identifiziert, bewertet und dauerhaft beseitigt.
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl mb-3">⚠️</div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Gefährdungsarten</h3>
            <p className="text-sm text-gray-600">
              Mechanische, chemische, physikalische und psychische Belastungen – ein Überblick mit Risikobewertung.
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl mb-3">📁</div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Dokumente & Formulare</h3>
            <p className="text-sm text-gray-600">
              Vorlagen, Checklisten und ausgefüllte Beurteilungen zum Download und Nachschlagen.
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-2xl mb-3">👥</div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Ansprechpartner</h3>
            <p className="text-sm text-gray-600">
              Fragen? Sicherheitsbeauftragter, Fachkraft für Arbeitssicherheit und HR helfen direkt weiter.
            </p>
          </div>
        </div>
      </div>

      {/* Hinweisbox */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl">🚨</div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Gefährdung entdeckt?</h3>
            <p className="text-sm text-gray-700">
              Bitte melden Sie jede neu entdeckte Gefährdung oder einen Beinahe-Unfall unverzüglich an Ihren
              Vorgesetzten oder direkt an den Sicherheitsbeauftragten. Jede Meldung zählt.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowReportModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
        >
          Meldung abgeben
        </button>
      </div>

      {/* Prozess in 6 Schritten */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Der Prozess in 6 Schritten</h3>
          <p className="text-sm text-gray-600">
            Die Gefährdungsbeurteilung folgt einem klar definierten Ablauf nach TRBS und DGUV-Vorschriften.
          </p>
        </div>
        <div className="divide-y divide-gray-200 bg-white border border-gray-200 rounded-xl">
          {processSteps.map((step) => (
            <div key={step.num} className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-5">
              <div className="flex-shrink-0">
                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-semibold">
                  {step.num}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-700 mb-2">{step.text}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700">
                  {step.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gefährdungsarten / Risikomatrix */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Gefährdungsarten im Überblick</h3>
          <p className="text-sm text-gray-600">
            Die folgende Tabelle gibt einen Überblick über typische Gefährdungsarten, Beispiele und deren
            Risikoeinstufung in unserem Betrieb.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5">
          <h4 className="text-base font-semibold text-gray-900 mb-3">Risikomatrix & Beispiele</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                  <th className="px-3 py-2 text-left">Gefährdungsart</th>
                  <th className="px-3 py-2 text-left">Beispiele</th>
                  <th className="px-3 py-2 text-left">Risiko</th>
                  <th className="px-3 py-2 text-left">Maßnahme</th>
                </tr>
              </thead>
              <tbody>
                {riskRows.map((row) => (
                  <tr key={row.type} className="border-b border-gray-100 last:border-0">
                    <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">{row.type}</td>
                    <td className="px-3 py-2 text-gray-700">{row.examples}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          row.badge === 'high'
                            ? 'bg-red-100 text-red-800'
                            : row.badge === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <span className="text-xs">●</span>
                        {row.risk}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{row.measure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Dokumente & Formulare */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Dokumente & Formulare</h3>
          <p className="text-sm text-gray-600">
            Alle Vorlagen und ausgefüllten Beurteilungen stehen hier zum Download bereit. Bei Fragen wenden Sie sich
            an den Sicherheitsbeauftragten.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {docs.map((doc) => (
            <button
              key={doc.title}
              type="button"
              onClick={() => {
                if ((doc as any).href) {
                  window.open((doc as any).href, '_blank')
                }
              }}
              className="bg-white border border-gray-200 rounded-xl p-4 flex gap-3 items-start shadow-sm text-left hover:shadow-md hover:border-blue-300 transition"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg">
                {doc.icon}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-0.5">{doc.title}</h4>
                <p className="text-xs text-gray-500">{doc.meta}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Ansprechpartner */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Ihre Ansprechpartner</h3>
          <p className="text-sm text-gray-600">
            Bei Fragen zur Gefährdungsbeurteilung, bei Beinahe-Unfällen oder akuten Sicherheitsproblemen stehen Ihnen
            folgende Personen zur Verfügung.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {contacts.map((c) => (
            <div
              key={c.name}
              className="bg-white border border-gray-200 rounded-xl p-4 flex gap-3 items-start shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                {c.initials}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-gray-900">{c.name}</h4>
                <div className="text-xs text-gray-500">{c.role}</div>
                <div className="text-xs text-gray-700">
                  📞 <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a>
                </div>
                <div className="text-xs text-gray-700">
                  ✉{' '}
                  <a href={`mailto:${c.email}`} className="hover:underline">
                    {c.email}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">📅</div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Regelmäßige Begehungen</h4>
            <p className="text-sm text-gray-700">
              Arbeitsplatzbegehungen finden quartalsweise statt. Der nächste Termin ist im{' '}
              <span className="font-semibold text-blue-700">August 2026</span>. Alle Mitarbeiter werden per E-Mail
              informiert.
            </p>
          </div>
        </div>
      </section>

      {/* Meldung-Popup */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowReportModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Gefährdung / Beinahe-Unfall melden</h3>
                <p className="text-sm text-gray-600">
                  Die Meldung wird per E-Mail an <span className="font-medium">christof.drost@landau.de</span> gesendet.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Meldung abgeben *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  placeholder="Kurze Beschreibung der Gefährdung oder des Beinahe-Unfalls..."
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Meldende Person
                  </label>
                  <input
                    type="text"
                    value={reporter}
                    onChange={(e) => setReporter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    placeholder="Name (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Bereich
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    placeholder="z.B. Schwimmhalle, Technik, Sauna..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Info
                </label>
                <textarea
                  value={info}
                  onChange={(e) => setInfo(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  placeholder="Zusätzliche Hinweise (optional)..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setShowReportModal(false)
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={sending}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70"
                  disabled={sending}
                >
                  {sending ? 'Wird gesendet...' : 'Senden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
