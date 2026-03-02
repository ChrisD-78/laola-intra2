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

const GEFAEHRDUNGS_BEREICHE = [
  'Rutsch-/Sturzgefahr (Nassbereich)',
  'Elektrische Anlagen',
  'Chemikalien (Chlor, pH-Mittel)',
  'Maschinenanlage/Technik',
  'Beleuchtung / Sichtverhältnisse',
  'Brand-/Explosionsgefahr',
  'Ergonomie / Heben + Tragen',
  'Biologische Gefahrstoffe',
  'Psychische Belastung',
  'Aufsicht / Ertrinkensgefahr',
  'Lärm / Vibration',
  'Sonstiges'
] as const

/** Prüfpunkte der Checkliste Arbeitsplatzbegehung Freibad (Formular CL-BEG-001) */
const CHECKLISTE_FREIBAD_PRUEFPUNKTE: { nr: number; text: string; norm?: string }[] = [
  { nr: 1, text: 'Fluchtwege und Notausgänge frei und gekennzeichnet', norm: 'ASR A2.3' },
  { nr: 2, text: 'Feuerlöscher vorhanden, geprüft und zugänglich', norm: 'ASR A2.2 / BetrSichV' },
  { nr: 3, text: 'Erste-Hilfe-Material vollständig und im Verfallsdatum', norm: 'DGUV-V1 §25' },
  { nr: 4, text: 'Verkehrswege ausreichend breit und beleuchtet', norm: 'ASR A1.8' },
  { nr: 5, text: 'Böden sauber, trocken, rutschsicher (innen)', norm: 'ASR A1.5' },
  { nr: 6, text: 'Beschilderung (Verbote, Gebote, Hinweise) vollständig', norm: 'ASR A1.3' },
  { nr: 7, text: 'Lagerordnung eingehalten, keine Stolperstellen', norm: 'ASR A1.5' },
  { nr: 8, text: 'Beleuchtungsstärke ausreichend (Messung dokumentieren)', norm: 'ASR A3.4' },
  { nr: 9, text: 'Bodenbelag rutschhemmend (Bewertungsgruppe B/C)', norm: 'DIN 51130 / BGR 181' },
  { nr: 10, text: 'Beckenrandgestaltung sicher (keine scharfen Kanten)', norm: 'DIN EN 15288-1' },
  { nr: 11, text: 'Einstiegleitern und Haltestangen fest und korrosionsfrei', norm: 'DIN EN 15288-1' },
  { nr: 12, text: 'Wassertiefenmarkierungen gut lesbar und korrekt', norm: 'DIN EN 15288-2' },
  { nr: 13, text: 'Baderegeln und Aufsichtsposition sichtbar ausgehängt', norm: 'DLRG / GUV-R 1/194' },
  { nr: 14, text: 'Rettungsring/-leine griffbereit am Becken', norm: 'GUV-R 1/194' },
  { nr: 15, text: 'AED-Gerät vorhanden, geprüft, Standort gekennzeichnet', norm: 'DIN EN 60601' },
  { nr: 16, text: 'Duschen und Umkleiden hygienisch, Abflüsse frei', norm: 'VDI 6023' },
  { nr: 17, text: 'Chlor- und pH-Dosieranlage dicht, Leckagen ausgeschlossen', norm: 'GefStoffV / TRGS 200' },
  { nr: 18, text: 'Lüftung im Chemikalienlager ausreichend und funktionsfähig', norm: 'TRGS 510' },
  { nr: 19, text: 'Sicherheitsdatenblätter aktuell und zugänglich', norm: 'GefStoffV §16' },
  { nr: 20, text: 'PSA (Schutzbrille, Handschuhe) vorhanden und nutzbar', norm: 'PSA-BV / DGUV-R 112' },
  { nr: 21, text: 'Notdusche / Augenspülstation in < 10 s erreichbar', norm: 'DGUV-I 213-056' },
  { nr: 22, text: 'Elektroanlagen: Schaltschränke geschlossen, kein Defekt', norm: 'DGUV-V3 / BetrSichV' },
  { nr: 23, text: 'Pumpen und Filter: Betrieb störungsfrei, Prüfprotokoll aktuell', norm: 'BetrSichV §14' },
  { nr: 24, text: 'Druckbehälter geprüft (Prüfplakette sichtbar)', norm: 'BetrSichV Anhang 2' },
  { nr: 25, text: 'Bildschirmarbeitsplatz ergonomisch eingerichtet', norm: 'ArbStättV / ASR A6.0' },
  { nr: 26, text: 'Beleuchtung blend- und reflexionsfrei (≥ 500 lx)', norm: 'ASR A3.4' },
  { nr: 27, text: 'Kassentresor gesichert, Überfall-/Notrufsystem geprüft', norm: 'DGUV-I 215-410' },
  { nr: 28, text: 'Elektrische Geräte (Kabel, Stecker) ohne sichtbare Schäden', norm: 'DGUV-V3' },
  { nr: 29, text: 'Lärmpegel im Kassenbetrieb gemessen / dokumentiert', norm: 'LärmVibrations-ArbSchV' },
  { nr: 30, text: 'Zaunanlage vollständig, keine Beschädigungen / Untergrabungen', norm: 'DIN EN 15288-1' },
  { nr: 31, text: 'Liegewiese frei von Glasscherben, Fremdkörpern', norm: 'Verkehrssicherungspflicht' },
  { nr: 32, text: 'Außenbeleuchtung (Dämmerung / Abend) funktionsfähig', norm: 'ASR A3.4' },
  { nr: 33, text: 'Sprungturm / Wasserrutschen: Sperrung oder Freigabe dokumentiert', norm: 'DIN EN 15288-2' },
  { nr: 34, text: 'Sanitäranlagen (Außen): Wasseranschlüsse winterfest / dicht', norm: 'VDI 6023' },
  { nr: 35, text: 'Saisonale Absperrungen und Hinweisschilder vollständig', norm: 'Verkehrssicherungspflicht' }
]

const docs: Array<{ icon: string; title: string; meta: string; href?: string; formId?: string }> = [
  { icon: '📋', title: 'Vorlage GBU – Allgemein', meta: 'PDF · Aktualisiert Jan 2025', formId: 'gbu-allgemein' },
  { icon: '✅', title: 'Checkliste Arbeitsplatzbegehung', meta: 'PDF · Aktualisiert Okt 2025', formId: 'checkliste-freibad' },
  { icon: '🧠', title: 'GBU Psychische Belastung', meta: 'PDF · Aktualisiert Dez 2024' },
  { icon: '📚', title: 'Rechtliche Grundlagen (ArbSchG)', meta: 'PDF · Externe Quelle', href: '/LA_OLA_Rechtliche_Grundlagen_ArbSchG.pdf' }
]

const contacts = [
  {
    initials: 'JJ',
    name: 'Jonas Jooss',
    role: 'Sicherheitsbeauftragter',
    phone: '+49 6341139205',
    email: 'jonas.jooss@Landau.de'
  },
  {
    initials: 'DW',
    name: 'Dennis Wilkens',
    role: 'Sicherheitsbeauftragter',
    phone: '+49 6341139205',
    email: 'dennis.wilkens@landau.de'
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

type ChecklistStatus = '' | 'io' | 'nio' | 'nz'

const initialChecklistPunkte = (): Record<number, { status: ChecklistStatus; maengel: string; frist: string }> => {
  const o: Record<number, { status: ChecklistStatus; maengel: string; frist: string }> = {}
  CHECKLISTE_FREIBAD_PRUEFPUNKTE.forEach((p) => {
    o[p.nr] = { status: '', maengel: '', frist: '' }
  })
  return o
}

export default function Gefaehrdungsbeurteilung({ onBack }: GefaehrdungsbeurteilungProps) {
  const [showReportModal, setShowReportModal] = useState(false)
  const [reporter, setReporter] = useState('')
  const [area, setArea] = useState('')
  const [info, setInfo] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const [showChecklisteFreibadModal, setShowChecklisteFreibadModal] = useState(false)
  const [checklistStammdaten, setChecklistStammdaten] = useState({
    bereich: '',
    datumBegehung: new Date().toISOString().split('T')[0],
    uhrzeit: new Date().toTimeString().slice(0, 5),
    begehungsteilnehmer: '',
    fachkraft: '',
    betriebsrat: ''
  })
  const [checklistPunkte, setChecklistPunkte] = useState(() => initialChecklistPunkte())
  const [offeneMaengelSummary, setOffeneMaengelSummary] = useState('')
  const [checklistSending, setChecklistSending] = useState(false)

  const [showGbuAllgemeinModal, setShowGbuAllgemeinModal] = useState(false)
  const [gbuStammdaten, setGbuStammdaten] = useState({
    betrieb: 'Freizeitbad LA OLA & Freibad Landau',
    bereich: '',
    taetigkeit: '',
    erstelltVon: '',
    funktion: '',
    datumErstellung: new Date().toISOString().split('T')[0],
    naechsteUeberpruefung: ''
  })
  const [gbuBereiche, setGbuBereiche] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {}
    GEFAEHRDUNGS_BEREICHE.forEach((b) => {
      o[b] = false
    })
    return o
  })
  const [gbuSonstigesText, setGbuSonstigesText] = useState('')
  const [gbuRisikoRows, setGbuRisikoRows] = useState<
    Array<{
      nr: number
      gefaehrdung: string
      personen: string
      rVor: string
      verantwortlich: string
      termin: string
      rNach: string
      status: string
    }>
  >(() =>
    Array.from({ length: 7 }).map((_, idx) => ({
      nr: idx + 1,
      gefaehrdung: '',
      personen: '',
      rVor: '',
      verantwortlich: '',
      termin: '',
      rNach: '',
      status: ''
    }))
  )
  const [gbuUnterweisung, setGbuUnterweisung] = useState('')
  const [gbuPruefung, setGbuPruefung] = useState('')
  const [gbuSending, setGbuSending] = useState(false)

  const resetForm = () => {
    setReporter('')
    setArea('')
    setInfo('')
    setMessage('')
  }

  const resetChecklistForm = () => {
    setChecklistStammdaten({
      bereich: '',
      datumBegehung: new Date().toISOString().split('T')[0],
      uhrzeit: new Date().toTimeString().slice(0, 5),
      begehungsteilnehmer: '',
      fachkraft: '',
      betriebsrat: ''
    })
    setChecklistPunkte(initialChecklistPunkte())
    setOffeneMaengelSummary('')
  }

  const resetGbuForm = () => {
    setGbuStammdaten({
      betrieb: 'Freizeitbad LA OLA & Freibad Landau',
      bereich: '',
      taetigkeit: '',
      erstelltVon: '',
      funktion: '',
      datumErstellung: new Date().toISOString().split('T')[0],
      naechsteUeberpruefung: ''
    })
    setGbuBereiche(() => {
      const o: Record<string, boolean> = {}
      GEFAEHRDUNGS_BEREICHE.forEach((b) => {
        o[b] = false
      })
      return o
    })
    setGbuSonstigesText('')
    setGbuRisikoRows(
      Array.from({ length: 7 }).map((_, idx) => ({
        nr: idx + 1,
        gefaehrdung: '',
        personen: '',
        rVor: '',
        verantwortlich: '',
        termin: '',
        rNach: '',
        status: ''
      }))
    )
    setGbuUnterweisung('')
    setGbuPruefung('')
  }

  const handleGbuSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setGbuSending(true)
      const selectedBereiche = GEFAEHRDUNGS_BEREICHE.filter((b) => gbuBereiche[b])
      const lines: string[] = [
        '=== Gefährdungsbeurteilung Allgemein – LA OLA Freibad Landau ===',
        '',
        '1 Stammdaten',
        `Betrieb/Einrichtung: ${gbuStammdaten.betrieb}`,
        `Abteilung/Bereich: ${gbuStammdaten.bereich || '-'}`,
        `Tätigkeit/Arbeitsplatz: ${gbuStammdaten.taetigkeit || '-'}`,
        `Erstellt von: ${gbuStammdaten.erstelltVon || '-'} (${gbuStammdaten.funktion || '-'})`,
        `Datum der Erstellung: ${gbuStammdaten.datumErstellung || '-'}`,
        `Nächste Überprüfung: ${gbuStammdaten.naechsteUeberpruefung || '-'}`,
        '',
        'Relevante Gefährdungsbereiche:',
        selectedBereiche.length ? `- ${selectedBereiche.join(', ')}` : '- keine Auswahl',
        gbuSonstigesText.trim() ? `Sonstiges: ${gbuSonstigesText.trim()}` : '',
        '',
        '4 Gefährdungsermittlung und Maßnahmen'
      ]

      gbuRisikoRows.forEach((row) => {
        if (
          row.gefaehrdung.trim() ||
          row.personen.trim() ||
          row.rVor.trim() ||
          row.verantwortlich.trim() ||
          row.termin.trim() ||
          row.rNach.trim() ||
          row.status.trim()
        ) {
          lines.push(
            `Nr. ${row.nr}: Gefährdung/Tatbestand: ${row.gefaehrdung || '-'}, Betroffene Personen: ${
              row.personen || '-'
            }, R vor Maßnahmen: ${row.rVor || '-'}, Verantwortlich: ${row.verantwortlich || '-'}, Termin: ${
              row.termin || '-'
            }, R nach: ${row.rNach || '-'}, Status: ${row.status || '-'}`
          )
        }
      })

      if (gbuUnterweisung.trim()) {
        lines.push('')
        lines.push('5 Unterweisung & Wirksamkeitskontrolle:')
        lines.push(gbuUnterweisung.trim())
      }

      if (gbuPruefung.trim()) {
        lines.push('')
        lines.push('6 Prüfung, Freigabe & Fortschreibung:')
        lines.push(gbuPruefung.trim())
      }

      const text = lines.filter(Boolean).join('\n')

      const html = `
        <h2>Gefährdungsbeurteilung Allgemein – Freizeitbad LA OLA & Freibad Landau</h2>
        <p>
          <strong>Abteilung/Bereich:</strong> ${gbuStammdaten.bereich || '-'}<br/>
          <strong>Tätigkeit/Arbeitsplatz:</strong> ${gbuStammdaten.taetigkeit || '-'}<br/>
          <strong>Erstellt von:</strong> ${gbuStammdaten.erstelltVon || '-'} (${gbuStammdaten.funktion || '-'})<br/>
          <strong>Datum der Erstellung:</strong> ${gbuStammdaten.datumErstellung || '-'}<br/>
          <strong>Nächste Überprüfung:</strong> ${gbuStammdaten.naechsteUeberpruefung || '-'}
        </p>
        <p><strong>Relevante Gefährdungsbereiche:</strong> ${
          selectedBereiche.length ? selectedBereiche.join(', ') : 'keine Auswahl'
        }</p>
        ${gbuSonstigesText.trim() ? `<p><strong>Sonstiges:</strong> ${gbuSonstigesText.trim()}</p>` : ''}
        <h3>Gefährdungen, Bewertung und Maßnahmen</h3>
        <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse; width:100%; font-size:12px;">
          <thead>
            <tr>
              <th>Nr.</th>
              <th>Gefährdung / Tatbestand</th>
              <th>Betroffene Personen</th>
              <th>R vor Maßnahmen</th>
              <th>Verantwortlich</th>
              <th>Termin</th>
              <th>R nach</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${gbuRisikoRows
              .filter((row) => row.gefaehrdung.trim() || row.personen.trim() || row.rVor.trim() || row.verantwortlich.trim())
              .map((row) => {
                return `<tr>
                  <td>${row.nr}</td>
                  <td>${row.gefaehrdung || '-'}</td>
                  <td>${row.personen || '-'}</td>
                  <td>${row.rVor || '-'}</td>
                  <td>${row.verantwortlich || '-'}</td>
                  <td>${row.termin || '-'}</td>
                  <td>${row.rNach || '-'}</td>
                  <td>${row.status || '-'}</td>
                </tr>`
              })
              .join('')}
          </tbody>
        </table>
        ${
          gbuUnterweisung.trim()
            ? `<p><strong>Unterweisung & Wirksamkeitskontrolle:</strong><br/>${gbuUnterweisung
                .trim()
                .replace(/\n/g, '<br/>')}</p>`
            : ''
        }
        ${
          gbuPruefung.trim()
            ? `<p><strong>Prüfung, Freigabe & Fortschreibung:</strong><br/>${gbuPruefung
                .trim()
                .replace(/\n/g, '<br/>')}</p>`
            : ''
        }
      `

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'christof.drost@landau.de',
          subject: `Gefährdungsbeurteilung Allgemein – ${gbuStammdaten.bereich || gbuStammdaten.taetigkeit || 'ohne Bereich'}`,
          text,
          html
        })
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok || result?.success === false) {
        alert('Die Gefährdungsbeurteilung konnte nicht versendet werden. Bitte versuchen Sie es später erneut.')
        return
      }
      alert('Die Gefährdungsbeurteilung wurde erfolgreich an christof.drost@landau.de gesendet.')
      resetGbuForm()
      setShowGbuAllgemeinModal(false)
    } catch (err) {
      console.error(err)
      alert('Die Gefährdungsbeurteilung konnte nicht versendet werden.')
    } finally {
      setGbuSending(false)
    }
  }

  const handleChecklisteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setChecklistSending(true)
      const lines: string[] = [
        '=== Checkliste Arbeitsplatzbegehung LA OLA Freibad Landau ===',
        '',
        '1 Stammdaten',
        `Bereich/Abteilung: ${checklistStammdaten.bereich || '-'}`,
        `Datum: ${checklistStammdaten.datumBegehung || '-'}`,
        `Uhrzeit: ${checklistStammdaten.uhrzeit || '-'}`,
        `Begehungsteilnehmer: ${checklistStammdaten.begehungsteilnehmer || '-'}`,
        `Fachkraft f. Arbeitssicherheit: ${checklistStammdaten.fachkraft || '-'}`,
        `Betriebsrat/Personalrat: ${checklistStammdaten.betriebsrat || '-'}`,
        '',
        '2 Prüfpunkte (i.O. = in Ordnung, n.i.O. = nicht in Ordnung, n.z. = nicht zutreffend)',
        ''
      ]
      CHECKLISTE_FREIBAD_PRUEFPUNKTE.forEach((p) => {
        const row = checklistPunkte[p.nr]
        const status = row?.status === 'io' ? 'i.O.' : row?.status === 'nio' ? 'n.i.O.' : row?.status === 'nz' ? 'n.z.' : '-'
        lines.push(`${p.nr}. ${p.text} [${status}]`)
        if (row?.maengel?.trim()) lines.push(`   Mängel/Maßnahme: ${row.maengel}`)
        if (row?.frist?.trim()) lines.push(`   Frist: ${row.frist}`)
      })
      if (offeneMaengelSummary.trim()) {
        lines.push('')
        lines.push('Offene Mängel (Zusammenfassung):')
        lines.push(offeneMaengelSummary.trim())
      }
      const text = lines.join('\n')
      const html = `
        <h2>Checkliste Arbeitsplatzbegehung – Freizeitbad LA OLA & Freibad Landau</h2>
        <p><strong>Datum:</strong> ${checklistStammdaten.datumBegehung || '-'} | <strong>Uhrzeit:</strong> ${checklistStammdaten.uhrzeit || '-'}<br/>
        <strong>Bereich:</strong> ${checklistStammdaten.bereich || '-'}<br/>
        <strong>Begehungsteilnehmer:</strong> ${checklistStammdaten.begehungsteilnehmer || '-'}<br/>
        <strong>Fachkraft f. Arbeitssicherheit:</strong> ${checklistStammdaten.fachkraft || '-'}<br/>
        <strong>Betriebsrat/Personalrat:</strong> ${checklistStammdaten.betriebsrat || '-'}</p>
        <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse; width:100%; font-size:12px;">
          <thead><tr><th>Nr</th><th>Prüfpunkt</th><th>i.O. / n.i.O. / n.z.</th><th>Mängel / Frist</th></tr></thead>
          <tbody>
            ${CHECKLISTE_FREIBAD_PRUEFPUNKTE.map((p) => {
              const row = checklistPunkte[p.nr]
              const status = row?.status === 'io' ? 'i.O.' : row?.status === 'nio' ? 'n.i.O.' : row?.status === 'nz' ? 'n.z.' : '-'
              const detail = [row?.maengel?.trim(), row?.frist?.trim()].filter(Boolean).join(' | ')
              return `<tr><td>${p.nr}</td><td>${p.text}</td><td>${status}</td><td>${detail || '-'}</td></tr>`
            }).join('')}
          </tbody>
        </table>
        ${offeneMaengelSummary.trim() ? `<p><strong>Offene Mängel (Zusammenfassung):</strong><br/>${offeneMaengelSummary.trim().replace(/\n/g, '<br/>')}</p>` : ''}
      `
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'christof.drost@landau.de',
          subject: `Checkliste Arbeitsplatzbegehung Freibad – ${checklistStammdaten.datumBegehung || 'ohne Datum'}`,
          text,
          html
        })
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok || result?.success === false) {
        alert('Das Formular konnte nicht versendet werden. Bitte versuchen Sie es später erneut oder senden Sie die Daten manuell.')
        return
      }
      alert('Die Checkliste wurde erfolgreich an christof.drost@landau.de gesendet.')
      resetChecklistForm()
      setShowChecklisteFreibadModal(false)
    } catch (err) {
      console.error(err)
      alert('Das Formular konnte nicht versendet werden.')
    } finally {
      setChecklistSending(false)
    }
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
                if (doc.formId === 'checkliste-freibad') {
                  setShowChecklisteFreibadModal(true)
                } else if (doc.formId === 'gbu-allgemein') {
                  setShowGbuAllgemeinModal(true)
                } else if (doc.href) {
                  window.open(doc.href, '_blank')
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

      {/* GBU Allgemein – Popup */}
      {showGbuAllgemeinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowGbuAllgemeinModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Gefährdungsbeurteilung – Allgemein</h3>
              <button
                type="button"
                onClick={() => setShowGbuAllgemeinModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleGbuSubmit} className="flex flex-col min-h-0 overflow-hidden">
              <div className="p-4 overflow-y-auto space-y-4 flex-1 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Betrieb / Einrichtung</label>
                    <input
                      type="text"
                      value={gbuStammdaten.betrieb}
                      onChange={(e) => setGbuStammdaten((s) => ({ ...s, betrieb: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Abteilung / Bereich *</label>
                    <input
                      type="text"
                      value={gbuStammdaten.bereich}
                      onChange={(e) => setGbuStammdaten((s) => ({ ...s, bereich: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Tätigkeit / Arbeitsplatz *</label>
                    <input
                      type="text"
                      value={gbuStammdaten.taetigkeit}
                      onChange={(e) => setGbuStammdaten((s) => ({ ...s, taetigkeit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Erstellt von (Name) *</label>
                    <input
                      type="text"
                      value={gbuStammdaten.erstelltVon}
                      onChange={(e) => setGbuStammdaten((s) => ({ ...s, erstelltVon: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Funktion</label>
                    <input
                      type="text"
                      value={gbuStammdaten.funktion}
                      onChange={(e) => setGbuStammdaten((s) => ({ ...s, funktion: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Datum der Erstellung *</label>
                    <input
                      type="date"
                      value={gbuStammdaten.datumErstellung}
                      onChange={(e) => setGbuStammdaten((s) => ({ ...s, datumErstellung: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Nächste Überprüfung</label>
                    <input
                      type="date"
                      value={gbuStammdaten.naechsteUeberpruefung}
                      onChange={(e) => setGbuStammdaten((s) => ({ ...s, naechsteUeberpruefung: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Relevante Gefährdungsbereiche</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {GEFAEHRDUNGS_BEREICHE.map((b) => (
                      <label key={b} className="inline-flex items-center gap-2 text-sm text-gray-800">
                        <input
                          type="checkbox"
                          checked={gbuBereiche[b] || false}
                          onChange={(e) =>
                            setGbuBereiche((prev) => ({
                              ...prev,
                              [b]: e.target.checked
                            }))
                          }
                          className="rounded border-gray-300"
                        />
                        <span>{b}</span>
                      </label>
                    ))}
                  </div>
                  <textarea
                    value={gbuSonstigesText}
                    onChange={(e) => setGbuSonstigesText(e.target.value)}
                    rows={2}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Beschreibung bei 'Sonstiges' (optional)..."
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Gefährdungsermittlung und Maßnahmen</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs md:text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 w-8">Nr.</th>
                          <th className="px-2 py-2">Gefährdung / Tatbestand</th>
                          <th className="px-2 py-2">Betroffene Personen</th>
                          <th className="px-2 py-2 w-20">R vor</th>
                          <th className="px-2 py-2">Verantwortlich</th>
                          <th className="px-2 py-2 w-24">Termin</th>
                          <th className="px-2 py-2 w-20">R nach</th>
                          <th className="px-2 py-2 w-24">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gbuRisikoRows.map((row, idx) => (
                          <tr key={row.nr} className="border-t border-gray-100">
                            <td className="px-2 py-1.5 font-medium text-gray-700 align-top">{row.nr}</td>
                            <td className="px-2 py-1.5">
                              <textarea
                                value={row.gefaehrdung}
                                onChange={(e) =>
                                  setGbuRisikoRows((prev) =>
                                    prev.map((r, i) =>
                                      i === idx ? { ...r, gefaehrdung: e.target.value } : r
                                    )
                                  )
                                }
                                rows={2}
                                className="w-full px-2 py-1 border border-gray-200 rounded"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                value={row.personen}
                                onChange={(e) =>
                                  setGbuRisikoRows((prev) =>
                                    prev.map((r, i) =>
                                      i === idx ? { ...r, personen: e.target.value } : r
                                    )
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                min={1}
                                max={9}
                                value={row.rVor}
                                onChange={(e) =>
                                  setGbuRisikoRows((prev) =>
                                    prev.map((r, i) =>
                                      i === idx ? { ...r, rVor: e.target.value } : r
                                    )
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                value={row.verantwortlich}
                                onChange={(e) =>
                                  setGbuRisikoRows((prev) =>
                                    prev.map((r, i) =>
                                      i === idx ? { ...r, verantwortlich: e.target.value } : r
                                    )
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="date"
                                value={row.termin}
                                onChange={(e) =>
                                  setGbuRisikoRows((prev) =>
                                    prev.map((r, i) =>
                                      i === idx ? { ...r, termin: e.target.value } : r
                                    )
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                min={1}
                                max={9}
                                value={row.rNach}
                                onChange={(e) =>
                                  setGbuRisikoRows((prev) =>
                                    prev.map((r, i) =>
                                      i === idx ? { ...r, rNach: e.target.value } : r
                                    )
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                placeholder="offen / in Bearbeitung / erledigt"
                                value={row.status}
                                onChange={(e) =>
                                  setGbuRisikoRows((prev) =>
                                    prev.map((r, i) =>
                                      i === idx ? { ...r, status: e.target.value } : r
                                    )
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Hinweis: R (Risikozahl) gemäß Matrix 1–9. Status z.B. „offen“, „in Bearbeitung“, „erledigt“.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Unterweisung &amp; Wirksamkeitskontrolle (optional)
                    </label>
                    <textarea
                      value={gbuUnterweisung}
                      onChange={(e) => setGbuUnterweisung(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="z.B. unterwiesene Personen, Datum, Ergebnis der Wirksamkeitskontrolle..."
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Prüfung, Freigabe &amp; Fortschreibung (optional)
                    </label>
                    <textarea
                      value={gbuPruefung}
                      onChange={(e) => setGbuPruefung(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="z.B. Namen und Daten von Prüfung/Freigabe, Hinweise zur Fortschreibung..."
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    resetGbuForm()
                    setShowGbuAllgemeinModal(false)
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={gbuSending}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70"
                  disabled={gbuSending}
                >
                  {gbuSending ? 'Wird gesendet...' : 'Senden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkliste Arbeitsplatzbegehung Freibad – Popup */}
      {showChecklisteFreibadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowChecklisteFreibadModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Checkliste Arbeitsplatzbegehung – Freibad Landau</h3>
              <button type="button" onClick={() => setShowChecklisteFreibadModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleChecklisteSubmit} className="flex flex-col min-h-0 overflow-hidden">
              <div className="p-4 overflow-y-auto space-y-4 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Bereich / Abteilung *</label>
                    <input type="text" value={checklistStammdaten.bereich} onChange={(e) => setChecklistStammdaten((s) => ({ ...s, bereich: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="z.B. Freibad Landau" required />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Datum der Begehung *</label>
                    <input type="date" value={checklistStammdaten.datumBegehung} onChange={(e) => setChecklistStammdaten((s) => ({ ...s, datumBegehung: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Uhrzeit</label>
                    <input type="time" value={checklistStammdaten.uhrzeit} onChange={(e) => setChecklistStammdaten((s) => ({ ...s, uhrzeit: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Begehungsteilnehmer</label>
                    <input type="text" value={checklistStammdaten.begehungsteilnehmer} onChange={(e) => setChecklistStammdaten((s) => ({ ...s, begehungsteilnehmer: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Namen" />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Fachkraft f. Arbeitssicherheit</label>
                    <input type="text" value={checklistStammdaten.fachkraft} onChange={(e) => setChecklistStammdaten((s) => ({ ...s, fachkraft: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Betriebsrat / Personalrat</label>
                    <input type="text" value={checklistStammdaten.betriebsrat} onChange={(e) => setChecklistStammdaten((s) => ({ ...s, betriebsrat: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Legende: i.O. = in Ordnung · n.i.O. = nicht in Ordnung (Mangel + Frist) · n.z. = nicht zutreffend</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-2 py-2 w-10">Nr</th>
                        <th className="px-2 py-2">Prüfpunkt</th>
                        <th className="px-2 py-2 w-28">i.O. / n.i.O. / n.z.</th>
                        <th className="px-2 py-2">Mängel / Maßnahme / Frist</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CHECKLISTE_FREIBAD_PRUEFPUNKTE.map((p) => (
                        <tr key={p.nr} className="border-t border-gray-100">
                          <td className="px-2 py-1.5 font-medium text-gray-700">{p.nr}</td>
                          <td className="px-2 py-1.5 text-gray-900">{p.text}{p.norm ? <span className="text-gray-400 text-xs block">{p.norm}</span> : null}</td>
                          <td className="px-2 py-1.5">
                            <div className="flex gap-2 flex-wrap">
                              {(['io', 'nio', 'nz'] as const).map((s) => (
                                <label key={s} className="inline-flex items-center gap-1 cursor-pointer">
                                  <input type="radio" name={`pruef-${p.nr}`} checked={checklistPunkte[p.nr]?.status === s} onChange={() => setChecklistPunkte((prev) => ({ ...prev, [p.nr]: { ...prev[p.nr], status: s } }))} className="rounded" />
                                  <span>{s === 'io' ? 'i.O.' : s === 'nio' ? 'n.i.O.' : 'n.z.'}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <input type="text" value={checklistPunkte[p.nr]?.maengel ?? ''} onChange={(e) => setChecklistPunkte((prev) => ({ ...prev, [p.nr]: { ...prev[p.nr], maengel: e.target.value } }))} placeholder="Mängel / Maßnahme" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" />
                            <input type="text" value={checklistPunkte[p.nr]?.frist ?? ''} onChange={(e) => setChecklistPunkte((prev) => ({ ...prev, [p.nr]: { ...prev[p.nr], frist: e.target.value } }))} placeholder="Frist" className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-xs" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1 text-sm">Offene Mängel (Zusammenfassung, optional)</label>
                  <textarea value={offeneMaengelSummary} onChange={(e) => setOffeneMaengelSummary(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Lfd. Nr., Bereich, Mängelbeschreibung, Priorität, Maßnahme, Verantwortlich, Frist" />
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => { resetChecklistForm(); setShowChecklisteFreibadModal(false) }} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50" disabled={checklistSending}>Abbrechen</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70" disabled={checklistSending}>{checklistSending ? 'Wird gesendet...' : 'Senden'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
