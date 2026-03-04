'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { createFormSubmission, getFormSubmissions, FormSubmissionRecord, uploadTechnikPdf } from '@/lib/db'

export default function Brandschutz() {
  const { isAdmin, userRole, isLoggedIn, currentUser } = useAuth()
  const router = useRouter()

  // Zugriffskontrolle wie bei Technik/Gefahrstoffe
  useEffect(() => {
    if (isLoggedIn && !isAdmin && userRole !== 'Technik' && userRole !== 'Teamleiter') {
      router.push('/')
    }
  }, [isLoggedIn, isAdmin, userRole, router])

  if (!isLoggedIn || (!isAdmin && userRole !== 'Technik' && userRole !== 'Teamleiter')) {
    return null
  }

  // Formular für einzelne Karten (ab Aufgabenbereich 02)
  const [activeCardForm, setActiveCardForm] = useState<null | {
    sectionNum: string
    sectionTitle: string
    cardText: string
  }>(null)
  const [cardDate, setCardDate] = useState(() => new Date().toISOString().split('T')[0])
  const [cardResponsible, setCardResponsible] = useState('')
  const [cardDetails, setCardDetails] = useState('')
  const [cardStatus, setCardStatus] = useState<'offen' | 'in Bearbeitung' | 'erledigt'>('offen')
  const [cardNotes, setCardNotes] = useState('')
  const [cardSending, setCardSending] = useState(false)
  const [cardLocation, setCardLocation] = useState<'Freizeitbad LA OLA' | 'Freibad Landau'>(
    'Freizeitbad LA OLA'
  )
  const [cardFile, setCardFile] = useState<File | null>(null)

  // Aktueller Status je Kachel (aus gespeicherten Formularen)
  const [cardStatuses, setCardStatuses] = useState<
    Record<string, 'offen' | 'in Bearbeitung' | 'erledigt'>
  >({})

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const submissions = await getFormSubmissions()
        const relevant = submissions.filter(
          (s: FormSubmissionRecord) => s.type === 'technik-brandschutz'
        )
        const map: Record<
          string,
          { status: 'offen' | 'in Bearbeitung' | 'erledigt'; submitted_at: string }
        > = {}

        for (const s of relevant) {
          const data = (s.form_data || {}) as any
          const key = `${data.sectionNum ?? ''}|${data.cardText ?? s.title ?? ''}`
          const statusValue =
            (data.status as string) || (s.status as string) || 'offen'
          const status =
            statusValue === 'in Bearbeitung'
              ? 'in Bearbeitung'
              : statusValue === 'erledigt'
              ? 'erledigt'
              : 'offen'
          const ts = s.submitted_at || s.created_at || ''
          const prev = map[key]
          if (!prev || ts > prev.submitted_at) {
            map[key] = { status, submitted_at: ts }
          }
        }

        const finalStatuses: Record<string, 'offen' | 'in Bearbeitung' | 'erledigt'> = {}
        Object.entries(map).forEach(([key, value]) => {
          finalStatuses[key] = value.status
        })
        setCardStatuses(finalStatuses)
      } catch (error) {
        console.warn('Brandschutz: Kachel-Status konnte nicht geladen werden', error)
      }
    }

    loadStatuses()
  }, [])

  const sections = [
    {
      num: '01',
      label: 'Aufgabenbereich',
      title: 'Beratung der Unternehmensleitung',
      cards: [
        'Beratung in allen Fragen des vorbeugenden, organisatorischen und abwehrenden Brandschutzes.',
        'Mitwirkung bei Gefährdungsbeurteilungen – insbesondere zu Brandgefährdungen nach ArbSchG.',
        'Unterstützung bei Investitionsentscheidungen mit Brandschutzrelevanz.',
        'Bewertung von Umbauten, Nutzungsänderungen sowie neuen Verfahren oder Stoffen.'
      ],
      icons: ['🛡️', '📋', '💡', '🔍']
    },
    {
      num: '02',
      label: 'Aufgabenbereich',
      title: 'Organisation des betrieblichen Brandschutzes',
      cards: [
        'Erstellung und Fortschreibung der Brandschutzordnung (Teil A, B, C nach DIN 14096).',
        'Aufbau und Pflege einer betrieblichen Brandschutzorganisation.',
        'Benennung und Koordination von Brandschutzhelfern im Betrieb.',
        'Planung von Räumungs- und Evakuierungskonzepten.'
      ],
      icons: ['📄', '🏗️', '👷', '🚪']
    },
    {
      num: '03',
      label: 'Aufgabenbereich',
      title: 'Überwachung von Brandschutzeinrichtungen',
      intro:
        'Regelmäßige Kontrolle der Funktionsfähigkeit aller relevanten Einrichtungen, z.B. Feuerlöscher, Wandhydranten, Brandmeldeanlagen, RWA und Sprinkleranlagen.',
      cards: [
        'Überwachung von Wartungsintervallen und gesetzlichen Prüffristen.',
        'Lückenlose Dokumentation aller Prüfungen und Ergebnisse.'
      ],
      icons: ['⏱️', '🗂️']
    },
    {
      num: '04',
      label: 'Aufgabenbereich',
      title: 'Schulung und Unterweisung',
      cards: [
        'Durchführung oder Organisation von Brandschutzunterweisungen für alle Mitarbeitenden.',
        'Praktische Löschübungen zur Vorbereitung auf den Ernstfall.',
        'Evakuierungsübungen zur Sicherstellung reibungsloser Abläufe.',
        'Sensibilisierung der Belegschaft für Brandgefahren im täglichen Arbeitsalltag.'
      ],
      icons: ['🎓', '🔥', '🏃', '👁️']
    },
    {
      num: '05',
      label: 'Aufgabenbereich',
      title: 'Kontrolle der Einhaltung von Brandschutzvorschriften',
      cards: [
        'Regelmäßige Begehungen aller Betriebsbereiche mit Fokus auf Flucht- und Rettungswege, Lagerung brennbarer Stoffe und Heißarbeitsrichtlinien.',
        'Dokumentation festgestellter Mängel und konsequente Verfolgung eingeleiteter Maßnahmen.'
      ],
      icons: ['🚶', '📝']
    },
    {
      num: '06',
      label: 'Aufgabenbereich',
      title: 'Zusammenarbeit mit Behörden und Feuerwehr',
      cards: [
        'Zentraler Ansprechpartner für Feuerwehr, Bauaufsichtsbehörden und Sachversicherer.',
        'Aktive Mitwirkung bei behördlichen Brandschauen und Begehungen.',
        'Unterstützung bei der Einsatzplanung der Feuerwehr (Feuerwehrpläne, Objektkunde).'
      ],
      icons: ['🚒', '🏛️', '🗺️']
    },
    {
      num: '07',
      label: 'Aufgabenbereich',
      title: 'Verhalten im Brandfall',
      cards: [
        'Unterstützung der Einsatzleitung und Koordination interner Sofortmaßnahmen.',
        'Nachbereitung von Brandereignissen: Ursachenanalyse und Ableitung von Schutzmaßnahmen.'
      ],
      icons: ['🆘', '🔬']
    },
    {
      num: '08',
      label: 'Aufgabenbereich',
      title: 'Dokumentation und Berichtswesen',
      cards: [
        'Führen und Aktualisieren eines vollständigen Brandschutzhandbuchs.',
        'Lückenlose Protokollierung aller Begehungen, Übungen und Unterweisungen.',
        'Regelmäßiger Bericht an die Geschäftsführung über den aktuellen Brandschutzstatus.'
      ],
      icons: ['📚', '📊', '📈']
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 rounded-2xl p-6 lg:p-8 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80 mb-2">
              Leistungsbereich · Freizeitbad LA OLA & Freibad Landau
            </p>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <span className="text-4xl">🔥</span>
              <span>Brandschutz</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm lg:text-base text-white/90">
              Der betriebliche Brandschutz bei Freizeitbad LA OLA & Freibad Landau wird zentral durch den
              Brandschutzbeauftragten <span className="font-semibold">Walther Hochdörfer</span> verantwortet.
              Er unterstützt den Betrieb umfassend – von der Beratung über die Organisation bis zur Dokumentation
              aller Brandschutzmaßnahmen.
            </p>
          </div>
        </div>
      </div>

      {/* Einleitung */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 lg:p-6">
        <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
          Der <strong>Brandschutzbeauftragte</strong> ist eine zentrale Stabsfunktion im Unternehmen
          Freizeitbad LA OLA & Freibad Landau. In dieser Funktion ist aktuell{' '}
          <strong>Walther Hochdörfer</strong> benannt. Er berät die Unternehmensleitung,
          koordiniert die betriebliche Brandschutzorganisation und stellt sicher, dass gesetzliche Anforderungen
          nach <strong>ArbSchG</strong>, <strong>ASR A2.2</strong> und <strong>DIN 14096</strong> dauerhaft erfüllt
          werden.
        </p>
      </div>

      {/* Aufgabenbereiche */}
      <div className="space-y-6">
        {sections.map((section) => (
          <section
            key={section.num}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 lg:p-6 space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <div className="text-red-500 font-extrabold text-3xl leading-none">{section.num}</div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.24em] uppercase text-red-500">
                    {section.label}
                  </div>
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                    {section.title}
                  </h2>
                </div>
              </div>
            </div>
            {section.intro && (
              <p className="text-sm text-gray-700 max-w-2xl">
                {section.intro}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {section.cards.map((text, idx) => (
                (() => {
                  const cardKey = `${section.num}|${text}`
                  const status = cardStatuses[cardKey]
                  const baseBg =
                    status === 'erledigt'
                      ? 'bg-green-50 border-green-200'
                      : status === 'in Bearbeitung'
                      ? 'bg-yellow-50 border-yellow-200'
                      : status === 'offen'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  return (
                    <button
                      key={text}
                      type="button"
                      onClick={() => {
                        setActiveCardForm({
                          sectionNum: section.num,
                          sectionTitle: section.title,
                          cardText: text
                        })
                        setCardDate(new Date().toISOString().split('T')[0])
                        setCardResponsible('')
                        setCardDetails('')
                        setCardStatus(status || 'offen')
                        setCardNotes('')
                      setCardLocation('Freizeitbad LA OLA')
                      setCardFile(null)
                      }}
                      className={`text-left rounded-xl p-4 flex flex-col gap-3 border shadow-sm hover:shadow-md transition ${baseBg}`}
                    >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-lg">
                      {section.icons[idx] || '🔥'}
                    </div>
                    <p className="text-sm text-gray-800">{text}</p>
                  </div>
                      {section.num !== '01' && (
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Status: {status || '–'}</span>
                          <span className="inline-flex items-center gap-1 text-red-600">
                            📝 <span>Eintrag bearbeiten</span>
                          </span>
                        </div>
                      )}
                    </button>
                  )
                })()
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Abgrenzung */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 lg:p-6 space-y-3">
        <h2 className="text-base lg:text-lg font-semibold text-amber-900">
          Abgrenzung der Funktion
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-amber-900">
          <li>
            Der Brandschutzbeauftragte <strong>ersetzt nicht</strong> die Fachkraft für Arbeitssicherheit – beide
            Funktionen ergänzen sich.
          </li>
          <li>
            Er trägt in der Regel <strong>keine persönliche Haftung</strong> für technische Mängel, sofern er
            ordnungsgemäß beraten und dokumentiert hat.
          </li>
          <li>
            Die Funktion ist meist als <strong>Stabsfunktion</strong> ohne direkte Weisungsbefugnis gegenüber anderen
            Mitarbeitenden ausgestaltet.
          </li>
        </ul>
      </div>

      {/* Formular-Popup für einzelne Kacheln (ab Aufgabenbereich 02) */}
      {activeCardForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !cardSending && setActiveCardForm(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[85vw] h-[85vh] max-w-5xl max-h-[90vh] p-6 flex flex-col space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
                  Aufgabenbereich {activeCardForm.sectionNum}
                </p>
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeCardForm.sectionTitle}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Kachel: <span className="font-medium">{activeCardForm.cardText}</span>
                  <br />
                  Die Daten werden als Formular-Eintrag zentral in der Datenbank gespeichert.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !cardSending && setActiveCardForm(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form
              className="space-y-3 flex-1 flex flex-col min-h-0"
              onSubmit={async (e) => {
                e.preventDefault()
                if (!activeCardForm) return
                try {
                  setCardSending(true)
                  let pdfUrl: string | undefined
                  let pdfName: string | undefined

                  if (cardFile) {
                    const uploaded = await uploadTechnikPdf(cardFile)
                    pdfUrl = uploaded.publicUrl
                    pdfName = cardFile.name
                  }

                  await createFormSubmission({
                    type: 'technik-brandschutz',
                    title: `${activeCardForm.sectionNum} ${activeCardForm.sectionTitle}`,
                    description: cardDetails || activeCardForm.cardText,
                      status: cardStatus,
                    form_data: {
                      sectionNum: activeCardForm.sectionNum,
                      sectionTitle: activeCardForm.sectionTitle,
                      cardText: activeCardForm.cardText,
                      datum: cardDate,
                      verantwortliche_person: cardResponsible,
                      standort: cardLocation,
                      details: cardDetails,
                      status: cardStatus,
                      notizen: cardNotes,
                      pdf_name: pdfName,
                      pdf_url: pdfUrl
                    },
                    submitted_by: currentUser || 'Unbekannt'
                  })
                  alert('Eintrag wurde erfolgreich gespeichert.')
                  const key = `${activeCardForm.sectionNum}|${activeCardForm.cardText}`
                  setCardStatuses((prev) => ({
                    ...prev,
                    [key]: cardStatus
                  }))
                  setActiveCardForm(null)
                } catch (error) {
                  console.error('Fehler beim Speichern des Brandschutz-Eintrags', error)
                  alert('Der Eintrag konnte nicht gespeichert werden. Bitte später erneut versuchen.')
                } finally {
                  setCardSending(false)
                }
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Datum
                  </label>
                  <input
                    type="date"
                    value={cardDate}
                    onChange={(e) => setCardDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Verantwortliche Person
                  </label>
                  <input
                    type="text"
                    value={cardResponsible}
                    onChange={(e) => setCardResponsible(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="z.B. Walther Hochdörfer"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Bereich / Standort
                  </label>
                  <select
                    value={cardLocation}
                    onChange={(e) =>
                      setCardLocation(
                        e.target.value as 'Freizeitbad LA OLA' | 'Freibad Landau'
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Freizeitbad LA OLA">Freizeitbad LA OLA</option>
                    <option value="Freibad Landau">Freibad Landau</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    PDF-Anhang (optional)
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setCardFile(file)
                    }}
                    className="block w-full text-xs text-gray-700 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-gray-300 file:bg-gray-50 file:text-xs file:font-medium hover:file:bg-gray-100"
                  />
                  {cardFile && (
                    <p className="mt-1 text-[11px] text-gray-500">Ausgewählt: {cardFile.name}</p>
                  )}
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ergänzende Details / Anlass
                </label>
                <textarea
                  value={cardDetails}
                  onChange={(e) => setCardDetails(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Zusätzliche Details zur ausgewählten Kachel (Maßnahmen, Vereinbarungen, Fristen)..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={cardStatus}
                    onChange={(e) =>
                      setCardStatus(e.target.value as 'offen' | 'in Bearbeitung' | 'erledigt')
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="offen">offen</option>
                    <option value="in Bearbeitung">in Bearbeitung</option>
                    <option value="erledigt">erledigt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Notizen (optional)
                  </label>
                  <textarea
                    value={cardNotes}
                    onChange={(e) => setCardNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !cardSending && setActiveCardForm(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={cardSending}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-70"
                  disabled={cardSending}
                >
                  {cardSending ? 'Wird gespeichert...' : 'Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

