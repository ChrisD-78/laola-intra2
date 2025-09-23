'use client'

import { useState } from 'react'
import WassermessungForm from '@/components/WassermessungForm'
import RutschenkontrolleForm from '@/components/RutschenkontrolleForm'
import TechnikkontrolleForm from '@/components/TechnikkontrolleForm'
import KassenabrechnungForm from '@/components/KassenabrechnungForm'
import ArbeitsunfallForm from '@/components/ArbeitsunfallForm'
import FeedbackForm from '@/components/FeedbackForm'

interface FormSubmission {
  id: string
  type: string
  title: string
  description: string
  status: string
  submittedAt: string
  formData: any // eslint-disable-line @typescript-eslint/no-explicit-any
  submittedBy: string
}

export default function Formulare() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([
    {
      id: '1',
      type: 'wassermessung',
      title: 'Wassermessung - Hauptbecken',
      description: 'pH-Wert: 7.2, Chlor: 0.8 mg/l',
      status: 'Abgeschlossen',
      submittedAt: 'vor 2 Tagen',
      formData: {
        becken: 'Hauptbecken',
        phWert: '7.2',
        chlorWert: '0.8',
        chlorWertGesamt: '1.2',
        chlorWertGebunden: '0.4',
        redox: '650',
        temperatur: '24°C',
        datum: '2024-01-15',
        uhrzeit: '14:30'
      },
      submittedBy: 'Max Mustermann'
    },
    {
      id: '2',
      type: 'rutschenkontrolle',
      title: 'Rutschenkontrolle - Wasserrutsche',
      description: 'Sicherheitscheck und Funktionsprüfung',
      status: 'In Bearbeitung',
      submittedAt: 'vor 1 Woche',
      formData: {
        rutschenname: 'Wasserrutsche',
        sicherheitscheck: 'Bestanden',
        funktionspruefung: 'Funktioniert',
        bemerkungen: 'Keine Mängel festgestellt',
        datum: '2024-01-08',
        uhrzeit: '09:15'
      },
      submittedBy: 'Anna Schmidt'
    },
    {
      id: '3',
      type: 'kassenabrechnung',
      title: 'Kassenabrechnung - Tagesabschluss',
      description: 'Tagesumsatz: €2,450.00, Kassenbestand korrekt',
      status: 'Eingegangen',
      submittedAt: 'vor 2 Wochen',
      formData: {
        tagesumsatz: '2450.00',
        kassenbestand: '150.00',
        differenz: '0.00',
        zahlungsarten: 'Bar: €1800, Karte: €650',
        datum: '2024-01-01',
        uhrzeit: '22:00'
      },
      submittedBy: 'Tom Weber'
    },
    {
      id: '4',
      type: 'arbeitsunfall',
      title: 'Arbeitsunfall - Sturz im Technikraum',
      description: 'Unfallort: Technikraum, Verletzte Person: Maria Müller, Schweregrad: Leicht',
      status: 'Abgeschlossen',
      submittedAt: 'vor 3 Tagen',
      formData: {
        unfallort: 'Technikraum',
        verletztePerson: 'Maria Müller',
        schweregrad: 'Leicht',
        unfallzeit: '2024-01-12 16:30',
        beschreibung: 'Sturz auf nassem Boden',
        ersteHilfe: 'Ja, Pflaster aufgeklebt'
      },
      submittedBy: 'Maria Müller'
    },
    {
      id: '5',
      type: 'feedback',
      title: 'Feedback - Verbesserungsvorschlag',
      description: 'Kategorie: Service, Bereich: Kasse, Priorität: Hoch',
      status: 'Eingegangen',
      submittedAt: 'vor 1 Tag',
      formData: {
        kategorie: 'Service',
        betroffenerBereich: 'Kasse',
        prioritaet: 'Hoch',
        beschreibung: 'Wartezeiten an der Kasse zu lang',
        vorschlag: 'Zusätzliche Kasse installieren'
      },
      submittedBy: 'Gast 123'
    }
  ])

  const [openForm, setOpenForm] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<FormSubmission | null>(null)

  const handleFormSubmit = (type: string, data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const newSubmission: FormSubmission = {
      id: Date.now().toString(),
      type,
      title: `${type} - ${new Date().toLocaleDateString('de-DE')}`,
      description: generateDescription(type, data),
      status: 'Eingegangen',
      submittedAt: 'gerade eben',
      formData: data,
      submittedBy: 'Aktueller Benutzer'
    }
    setSubmissions([newSubmission, ...submissions])
  }

  const generateDescription = (type: string, data: any): string => { // eslint-disable-line @typescript-eslint/no-explicit-any
    switch (type) {
      case 'wassermessung':
        return `Becken: ${data.becken}, pH: ${data.phWert}, Chlor: ${data.chlorWert} mg/l, Chlor-Gesamt: ${data.chlorWertGesamt} mg/l, Chlor-Gebunden: ${data.chlorWertGebunden} mg/l, Redox: ${data.redox} mV`
      case 'rutschenkontrolle':
        return `Sicherheit: ${data.sicherheitscheck}, Funktion: ${data.funktionspruefung}`
      case 'technikkontrolle':
        return `Anlage: ${data.anlage}, Funktion: ${data.funktionspruefung}`
      case 'kassenabrechnung':
        return `Umsatz: €${data.tagesumsatz}, Kassenbestand: €${data.kassenbestand}`
      case 'arbeitsunfall':
        return `Unfallort: ${data.unfallort}, Verletzte Person: ${data.verletztePerson}, Schweregrad: ${data.schweregrad}`
      case 'feedback':
        return `Kategorie: ${data.kategorie}, Bereich: ${data.betroffenerBereich}, Priorität: ${data.prioritaet}`
      default:
        return 'Formular eingereicht'
    }
  }

  const handleViewSubmission = (submission: FormSubmission) => {
    setSelectedSubmission(submission)
    setShowSubmissionModal(true)
  }

  const handleDeleteSubmission = (submission: FormSubmission) => {
    setShowDeleteConfirm(submission)
  }

  const handleDownloadPdf = (submission: FormSubmission) => {
    const title = `${getFormTypeLabel(submission.type)} – ${submission.title}`
    const htmlRows = Object.entries(submission.formData).map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').trim()
      return `<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">${label}</td><td style=\"padding:8px;border:1px solid #e5e7eb;\">${String(value)}</td></tr>`
    }).join('')

    const html = `<!doctype html><html lang=\"de\"><head><meta charset=\"utf-8\"/>
      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>
      <title>${title}</title>
      <style>
        body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827;margin:24px}
        h1{font-size:20px;margin:0 0 16px 0}
        .meta{color:#6b7280;font-size:12px;margin-bottom:16px}
        table{border-collapse:collapse;width:100%;font-size:14px}
        thead td{background:#f9fafb;font-weight:700}
      </style>
    </head><body>
      <h1>${title}</h1>
      <div class=\"meta\">Status: ${submission.status} • Eingereicht: ${submission.submittedAt} • Von: ${submission.submittedBy}</div>
      <div style=\"margin:12px 0 20px 0;color:#374151;\">${submission.description}</div>
      <table>
        <thead><tr><td style=\"padding:8px;border:1px solid #e5e7eb;\">Feld</td><td style=\"padding:8px;border:1px solid #e5e7eb;\">Wert</td></tr></thead>
        <tbody>${htmlRows}</tbody>
      </table>
      <script>window.addEventListener('load',()=>{setTimeout(()=>{window.print()},200)})</script>
    </body></html>`

    const w = window.open('', '_blank')
    if (w) {
      w.document.open()
      w.document.write(html)
      w.document.close()
    }
  }

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      const pass = prompt('Bitte Passwort eingeben:')
      if (pass === 'bl') {
        setSubmissions(submissions.filter(sub => sub.id !== showDeleteConfirm.id))
        setShowDeleteConfirm(null)
      } else if (pass !== null) {
        alert('Falsches Passwort')
      }
    }
  }

  const closeSubmissionModal = () => {
    setShowSubmissionModal(false)
    setSelectedSubmission(null)
  }

  const getFormTypeLabel = (type: string) => {
    switch (type) {
      case 'wassermessung': return 'Wassermessung'
      case 'rutschenkontrolle': return 'Rutschenkontrolle'
      case 'technikkontrolle': return 'Technikkontrolle'
      case 'kassenabrechnung': return 'Kassenabrechnung'
      case 'arbeitsunfall': return 'Arbeitsunfall'
      case 'feedback': return 'Feedback'
      default: return type
    }
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900">Formulare</h1>
        <p className="mt-2 text-gray-600">
          Füllen Sie wichtige Formulare aus und verwalten Sie Ihre Einreichungen
        </p>
      </div>

      {/* Available Forms */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Verfügbare Formulare</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">🏥</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Arbeitsunfall melden
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Melden Sie Arbeitsunfälle und Vorfälle
            </p>
            <button 
              onClick={() => setOpenForm('arbeitsunfall')}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Formular öffnen
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">💧</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Wassermessung
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Dokumentieren Sie Wasserwerte und Messungen
            </p>
            <button 
              onClick={() => setOpenForm('wassermessung')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Formular öffnen
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">🎢</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Rutschenkontrolle
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Kontrollieren Sie die Sicherheit der Rutsche
            </p>
            <button 
              onClick={() => setOpenForm('rutschenkontrolle')}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Formular öffnen
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">⚙️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Technikkontrolle
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Überprüfen Sie technische Anlagen und Geräte
            </p>
            <button 
              onClick={() => setOpenForm('technikkontrolle')}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Formular öffnen
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Feedback geben
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Teilen Sie Ihr Feedback mit uns
            </p>
            <button 
              onClick={() => setOpenForm('feedback')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Formular öffnen
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Kassenabrechnung
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Führen Sie die tägliche Kassenabrechnung durch
            </p>
            <button 
              onClick={() => setOpenForm('kassenabrechnung')}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Formular öffnen
            </button>
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ihre letzten Einreichungen</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {submissions.slice(0, 3).map((submission) => (
            <div key={submission.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-12 rounded flex items-center justify-center ${
                    submission.status === 'Abgeschlossen' ? 'bg-green-100' :
                    submission.status === 'In Bearbeitung' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    <span className={`text-lg ${
                      submission.status === 'Abgeschlossen' ? 'text-green-600' :
                      submission.status === 'In Bearbeitung' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      {submission.status === 'Abgeschlossen' ? '✅' :
                       submission.status === 'In Bearbeitung' ? '⏳' : '📝'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{submission.title}</h3>
                    <p className="text-sm text-gray-600">{submission.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        submission.status === 'Abgeschlossen' ? 'bg-green-100 text-green-800' :
                        submission.status === 'In Bearbeitung' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {submission.status}
                      </span>
                      <span className="text-xs text-gray-500">Eingereicht: {submission.submittedAt}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleViewSubmission(submission)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Formular anzeigen"
                >
                  👁️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table View */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Alle Formulareinreichungen</h2>
            <div className="flex space-x-2">
              <select className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Alle Status</option>
                <option value="Eingegangen">Eingegangen</option>
                <option value="In Bearbeitung">In Bearbeitung</option>
                <option value="Abgeschlossen">Abgeschlossen</option>
              </select>
              <select className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Alle Formulare</option>
                <option value="wassermessung">Wassermessung</option>
                <option value="rutschenkontrolle">Rutschenkontrolle</option>
                <option value="technikkontrolle">Technikkontrolle</option>
                <option value="kassenabrechnung">Kassenabrechnung</option>
                <option value="arbeitsunfall">Arbeitsunfall</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formular
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Eingereicht von
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded flex items-center justify-center mr-3 ${
                        submission.type === 'wassermessung' ? 'bg-blue-100' :
                        submission.type === 'rutschenkontrolle' ? 'bg-green-100' :
                        submission.type === 'technikkontrolle' ? 'bg-orange-100' :
                        submission.type === 'kassenabrechnung' ? 'bg-indigo-100' :
                        submission.type === 'arbeitsunfall' ? 'bg-red-100' :
                        'bg-purple-100'
                      }`}>
                        <span className={`text-sm ${
                          submission.type === 'wassermessung' ? 'text-blue-600' :
                          submission.type === 'rutschenkontrolle' ? 'text-green-600' :
                          submission.type === 'technikkontrolle' ? 'text-orange-600' :
                          submission.type === 'kassenabrechnung' ? 'text-indigo-600' :
                          submission.type === 'arbeitsunfall' ? 'text-red-600' :
                          'text-purple-600'
                        }`}>
                          {submission.type === 'wassermessung' ? '💧' :
                           submission.type === 'rutschenkontrolle' ? '🎢' :
                           submission.type === 'technikkontrolle' ? '⚙️' :
                           submission.type === 'kassenabrechnung' ? '💰' :
                           submission.type === 'arbeitsunfall' ? '🏥' :
                           '📝'}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {submission.type.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{submission.title}</div>
                    <div className="text-sm text-gray-500">{submission.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      submission.status === 'Abgeschlossen' ? 'bg-green-100 text-green-800' :
                      submission.status === 'In Bearbeitung' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.submittedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {submission.submittedAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewSubmission(submission)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Formular anzeigen"
                      >
                        👁️ Anzeigen
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(submission)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        title="Als PDF herunterladen"
                      >
                        ⬇️ PDF
                      </button>
                      <button 
                        onClick={() => handleViewSubmission(submission)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Detaillierte Ansicht"
                      >
                        📄 Details
                      </button>
                      <button 
                        onClick={() => handleDeleteSubmission(submission)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Formular löschen"
                      >
                        🗑️ Löschen
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Details Modal */}
      {showSubmissionModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded flex items-center justify-center ${
                    selectedSubmission.type === 'wassermessung' ? 'bg-blue-100' :
                    selectedSubmission.type === 'rutschenkontrolle' ? 'bg-green-100' :
                    selectedSubmission.type === 'technikkontrolle' ? 'bg-orange-100' :
                    selectedSubmission.type === 'kassenabrechnung' ? 'bg-indigo-100' :
                    selectedSubmission.type === 'arbeitsunfall' ? 'bg-red-100' :
                    'bg-purple-100'
                  }`}>
                    <span className={`text-lg ${
                      selectedSubmission.type === 'wassermessung' ? 'text-blue-600' :
                      selectedSubmission.type === 'rutschenkontrolle' ? 'text-green-600' :
                      selectedSubmission.type === 'technikkontrolle' ? 'text-orange-600' :
                      selectedSubmission.type === 'kassenabrechnung' ? 'text-indigo-600' :
                      selectedSubmission.type === 'arbeitsunfall' ? 'text-red-600' :
                      'text-purple-600'
                    }`}>
                      {selectedSubmission.type === 'wassermessung' ? '💧' :
                       selectedSubmission.type === 'rutschenkontrolle' ? '🎢' :
                       selectedSubmission.type === 'technikkontrolle' ? '⚙️' :
                       selectedSubmission.type === 'kassenabrechnung' ? '💰' :
                       selectedSubmission.type === 'arbeitsunfall' ? '🏥' :
                       '📝'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedSubmission.title}</h3>
                    <p className="text-sm text-gray-600">{getFormTypeLabel(selectedSubmission.type)}</p>
                  </div>
                </div>
                <button
                  onClick={closeSubmissionModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Status and Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                    selectedSubmission.status === 'Abgeschlossen' ? 'bg-green-100 text-green-800' :
                    selectedSubmission.status === 'In Bearbeitung' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedSubmission.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Eingereicht von</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedSubmission.submittedBy}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Datum</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedSubmission.submittedAt}</p>
                </div>
              </div>

              {/* Form Data */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Formulardaten</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedSubmission.formData).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-sm text-gray-900 mt-1">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Beschreibung</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {selectedSubmission.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">⚠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Formular löschen</h3>
                  <p className="text-sm text-gray-600">Diese Aktion kann nicht rückgängig gemacht werden</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm font-medium text-gray-900">{showDeleteConfirm.title}</p>
                <p className="text-sm text-gray-600 mt-1">{showDeleteConfirm.description}</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Löschen
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup Forms */}
      <WassermessungForm
        isOpen={openForm === 'wassermessung'}
        onClose={() => setOpenForm(null)}
        onSubmit={(data) => handleFormSubmit('wassermessung', data)}
      />
      
      <RutschenkontrolleForm
        isOpen={openForm === 'rutschenkontrolle'}
        onClose={() => setOpenForm(null)}
        onSubmit={(data) => handleFormSubmit('rutschenkontrolle', data)}
      />
      
      <TechnikkontrolleForm
        isOpen={openForm === 'technikkontrolle'}
        onClose={() => setOpenForm(null)}
        onSubmit={(data) => handleFormSubmit('technikkontrolle', data)}
      />
      
      <KassenabrechnungForm
        isOpen={openForm === 'kassenabrechnung'}
        onClose={() => setOpenForm(null)}
        onSubmit={(data) => handleFormSubmit('kassenabrechnung', data)}
      />
      
      <ArbeitsunfallForm
        isOpen={openForm === 'arbeitsunfall'}
        onClose={() => setOpenForm(null)}
        onSubmit={(data) => handleFormSubmit('arbeitsunfall', data)}
      />
      
      <FeedbackForm
        isOpen={openForm === 'feedback'}
        onClose={() => setOpenForm(null)}
        onSubmit={(data) => handleFormSubmit('feedback', data)}
      />
    </div>
  )
}
