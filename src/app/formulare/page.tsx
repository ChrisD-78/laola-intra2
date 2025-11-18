'use client'

import { useState, useEffect } from 'react'
import WassermessungForm from '@/components/WassermessungForm'
import RutschenkontrolleForm from '@/components/RutschenkontrolleForm'
import StoermeldungForm from '@/components/StoermeldungForm'
import KassenabrechnungForm from '@/components/KassenabrechnungForm'
import ArbeitsunfallForm from '@/components/ArbeitsunfallForm'
import FeedbackForm from '@/components/FeedbackForm'
import StundenkorrekturForm from '@/components/StundenkorrekturForm'
import { insertAccident, getFormSubmissions, insertFormSubmission, deleteFormSubmissionById } from '@/lib/db'
import { useAuth } from '@/components/AuthProvider'

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
  const { isAdmin } = useAuth()
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)

  const [openForm, setOpenForm] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<FormSubmission | null>(null)
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')

  // Load submissions from Supabase
  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const data = await getFormSubmissions()
        const mapped: FormSubmission[] = data.map((sub) => ({
          id: sub.id,
          type: sub.type,
          title: sub.title,
          description: sub.description,
          status: sub.status,
          submittedAt: sub.submitted_at,
          formData: sub.form_data,
          submittedBy: sub.submitted_by
        }))
        setSubmissions(mapped)
      } catch (error) {
        console.error('Error loading submissions:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSubmissions()
  }, [])

  const handleFormSubmit = async (type: string, data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      const submissionData = {
        type,
        title: `${type} - ${new Date().toLocaleDateString('de-DE')}`,
        description: generateDescription(type, data),
        status: 'Eingegangen',
        form_data: data,
        submitted_by: 'Aktueller Benutzer'
      }

      // Save to Supabase
      const savedSubmission = await insertFormSubmission(submissionData)
      
      const newSubmission: FormSubmission = {
        id: savedSubmission.id,
        type: savedSubmission.type,
        title: savedSubmission.title,
        description: savedSubmission.description,
        status: savedSubmission.status,
        submittedAt: savedSubmission.submitted_at,
        formData: savedSubmission.form_data,
        submittedBy: savedSubmission.submitted_by
      }
      
      setSubmissions([newSubmission, ...submissions])

      // Special handling for arbeitsunfall
      if (type === 'arbeitsunfall') {
        try {
          await insertAccident({
            unfalltyp: data.unfalltyp,
            datum: data.datum,
            zeit: data.zeit,
            verletzte_person: data.verletztePerson,
            unfallort: data.unfallort,
            unfallart: data.unfallart,
            verletzungsart: data.verletzungsart,
            schweregrad: data.schweregrad,
            erste_hilfe: data.ersteHilfe,
            arzt_kontakt: data.arztKontakt,
            zeugen: data.zeugen || null,
            beschreibung: data.beschreibung,
            meldende_person: data.meldendePerson,
            unfallhergang: data.unfallhergang || null,
            gast_alter: data.gastAlter || null,
            gast_kontakt: data.gastKontakt || null,
          })
        } catch (e) {
          console.error('Supabase insertAccident error', e)
          alert('Fehler beim Speichern des Arbeitsunfalls in der Datenbank.')
        }
      }
    } catch (error) {
      console.error('Error saving form submission:', error)
      alert('Fehler beim Speichern des Formulars.')
    }
  }

  const generateDescription = (type: string, data: any): string => { // eslint-disable-line @typescript-eslint/no-explicit-any
    switch (type) {
      case 'wassermessung':
        return `Becken: ${data.becken}, pH: ${data.phWert}, Chlor: ${data.chlorWert} mg/l, Chlor-Gesamt: ${data.chlorWertGesamt} mg/l, Chlor-Gebunden: ${data.chlorWertGebunden} mg/l, Redox: ${data.redox} mV`
      case 'rutschenkontrolle':
        return `Sicherheit: ${data.sicherheitscheck}, Funktion: ${data.funktionspruefung}`
      case 'stoermeldung':
        return `Störungstyp: ${data.stoerungstyp}, Meldende Person: ${data.meldendePerson}`
      case 'kassenabrechnung':
        return `Umsatz: €${data.tagesumsatz}, Kassenbestand: €${data.kassenbestand}`
      case 'arbeitsunfall':
        return `Unfallort: ${data.unfallort}, Verletzte Person: ${data.verletztePerson}, Schweregrad: ${data.schweregrad}`
      case 'feedback':
        return `Kategorie: ${data.kategorie}, Bereich: ${data.betroffenerBereich}, Priorität: ${data.prioritaet}`
      case 'stundenkorrektur':
        return `Name: ${data.name}, Datum: ${data.datum}, Zeit: ${data.uhrzeitVon} - ${data.uhrzeitBis}, Grund: ${data.grund}`
      default:
        return 'Formular eingereicht'
    }
  }

  const formatDate = (dateString: string): string => {
    // Konvertiere das Datum in das Format: TT.MM.JJJJ (ohne Uhrzeit)
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
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
      <div class=\"meta\">Status: ${submission.status} • Eingereicht: ${formatDate(submission.submittedAt)} • Von: ${submission.submittedBy}</div>
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

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      // Admin-Benutzer überspringen die Passwort-Abfrage
      if (isAdmin) {
        try {
          await deleteFormSubmissionById(showDeleteConfirm.id)
          setSubmissions(submissions.filter(sub => sub.id !== showDeleteConfirm.id))
          setShowDeleteConfirm(null)
        } catch (error) {
          console.error('Error deleting submission:', error)
          alert('Fehler beim Löschen des Formulars.')
        }
      } else {
        // Nicht-Admins müssen Passwort eingeben
        const pass = prompt('Bitte Passwort eingeben:')
        if (pass === 'bl') {
          try {
            await deleteFormSubmissionById(showDeleteConfirm.id)
            setSubmissions(submissions.filter(sub => sub.id !== showDeleteConfirm.id))
            setShowDeleteConfirm(null)
          } catch (error) {
            console.error('Error deleting submission:', error)
            alert('Fehler beim Löschen des Formulars.')
          }
        } else if (pass !== null) {
          alert('Falsches Passwort')
        }
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
      case 'stoermeldung': return 'Störmeldung'
      case 'kassenabrechnung': return 'Kassenabrechnung'
      case 'arbeitsunfall': return 'Arbeitsunfall'
      case 'feedback': return 'Feedback'
      default: return type
    }
  }

  // Filter submissions based on selected filters
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesStatus = !filterStatus || submission.status === filterStatus
    const matchesType = !filterType || submission.type === filterType
    return matchesStatus && matchesType
  })
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-4 lg:p-8 text-white text-center">
        <h1 className="text-2xl lg:text-4xl font-bold mb-2">Formulare</h1>
        <p className="text-sm lg:text-base text-white/90">
          Füllen Sie wichtige Formulare aus und verwalten Sie Ihre Einreichungen
        </p>
      </div>

      {/* Available Forms */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Verfügbare Formulare</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 p-4 lg:p-6">
          <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">🏥</span>
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 text-center mb-2">
              Unfall melden
            </h3>
            <p className="text-sm text-gray-900 text-center mb-4">
              Melden Sie Unfälle und Vorfälle
            </p>
            <button 
              onClick={() => setOpenForm('arbeitsunfall')}
              className="w-full px-4 py-2.5 text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Formular öffnen
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">💧</span>
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 text-center mb-2">
              Wassermessung
            </h3>
            <p className="text-sm text-gray-900 text-center mb-4">
              Dokumentieren Sie Wasserwerte und Messungen
            </p>
            <button 
              onClick={() => setOpenForm('wassermessung')}
              className="w-full px-4 py-2.5 text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Formular öffnen
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">🎢</span>
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 text-center mb-2">
              Rutschenkontrolle
            </h3>
            <p className="text-sm text-gray-900 text-center mb-4">
              Kontrollieren Sie die Sicherheit der Rutsche
            </p>
            <button 
              onClick={() => setOpenForm('rutschenkontrolle')}
              className="w-full px-4 py-2.5 text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Formular öffnen
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">🚨</span>
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 text-center mb-2">
              Störmeldung Melden
            </h3>
            <p className="text-sm text-gray-900 text-center mb-4">
              Melden Sie technische Störungen und Defekte
            </p>
            <button 
              onClick={() => setOpenForm('stoermeldung')}
              className="w-full px-4 py-2.5 text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Formular öffnen
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 text-center mb-2">
              Feedback geben
            </h3>
            <p className="text-sm text-gray-900 text-center mb-4">
              Teilen Sie Ihr Feedback mit uns
            </p>
            <button 
              onClick={() => setOpenForm('feedback')}
              className="w-full px-4 py-2.5 text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Formular öffnen
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">⏰</span>
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 text-center mb-2">
              Stundenkorrektur
            </h3>
            <p className="text-sm text-gray-900 text-center mb-4">
              Korrektur von Arbeitszeiten beantragen
            </p>
            <button 
              onClick={() => setOpenForm('stundenkorrektur')}
              className="w-full px-4 py-2.5 text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Formular öffnen
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">💰</span>
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 text-center mb-2">
              Kassenabrechnung
            </h3>
            <p className="text-sm text-gray-900 text-center mb-4">
              Führen Sie die tägliche Kassenabrechnung durch
            </p>
            <button 
              onClick={() => setOpenForm('kassenabrechnung')}
              className="w-full px-4 py-2.5 text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Formular öffnen
            </button>
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <h2 className="text-base lg:text-lg font-semibold text-gray-900">Ihre letzten Einreichungen</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-4 lg:p-6 text-center">
              <div className="text-base text-gray-900">Lade Formulare...</div>
            </div>
          ) : submissions.slice(0, 3).map((submission) => (
            <div key={submission.id} className="p-4 lg:p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className={`w-10 h-12 rounded flex items-center justify-center flex-shrink-0 ${
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
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 break-words">{submission.title}</h3>
                    <p className="text-sm text-gray-900 mt-1 break-words">{submission.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        submission.status === 'Abgeschlossen' ? 'bg-green-100 text-green-900' :
                        submission.status === 'In Bearbeitung' ? 'bg-yellow-100 text-yellow-900' :
                        'bg-blue-100 text-blue-900'
                      }`}>
                        {submission.status}
                      </span>
                      <span className="text-xs text-gray-900">📅 {formatDate(submission.submittedAt)}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleViewSubmission(submission)}
                  className="self-start p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
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
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Alle Formulareinreichungen</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Alle Status</option>
                <option value="Eingegangen">Eingegangen</option>
                <option value="In Bearbeitung">In Bearbeitung</option>
                <option value="Abgeschlossen">Abgeschlossen</option>
              </select>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Alle Formulare</option>
                <option value="wassermessung">Wassermessung</option>
                <option value="rutschenkontrolle">Rutschenkontrolle</option>
                <option value="stoermeldung">Störmeldung</option>
                <option value="kassenabrechnung">Kassenabrechnung</option>
                <option value="arbeitsunfall">Arbeitsunfall</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Formular
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Titel
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden sm:table-cell px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Eingereicht von
                </th>
                <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 lg:px-6 py-4 text-center text-base text-gray-900">
                    Lade Formulare...
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 lg:px-6 py-4 text-center text-base text-gray-900">
                    Keine Formulare gefunden, die den Filterkriterien entsprechen.
                  </td>
                </tr>
              ) : filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded flex items-center justify-center mr-3 ${
                        submission.type === 'wassermessung' ? 'bg-blue-100' :
                        submission.type === 'rutschenkontrolle' ? 'bg-green-100' :
                        submission.type === 'stoermeldung' ? 'bg-orange-100' :
                        submission.type === 'kassenabrechnung' ? 'bg-indigo-100' :
                        submission.type === 'arbeitsunfall' ? 'bg-red-100' :
                        'bg-purple-100'
                      }`}>
                        <span className={`text-sm ${
                          submission.type === 'wassermessung' ? 'text-blue-600' :
                          submission.type === 'rutschenkontrolle' ? 'text-green-600' :
                          submission.type === 'stoermeldung' ? 'text-orange-600' :
                          submission.type === 'kassenabrechnung' ? 'text-indigo-600' :
                          submission.type === 'arbeitsunfall' ? 'text-red-600' :
                          'text-purple-600'
                        }`}>
                          {submission.type === 'wassermessung' ? '💧' :
                           submission.type === 'rutschenkontrolle' ? '🎢' :
                           submission.type === 'stoermeldung' ? '🚨' :
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
                  <td className="px-3 lg:px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900 break-words">{submission.title}</div>
                    <div className="text-xs text-gray-900 mt-1 break-words">{submission.description}</div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                      submission.status === 'Abgeschlossen' ? 'bg-green-100 text-green-900' :
                      submission.status === 'In Bearbeitung' ? 'bg-yellow-100 text-yellow-900' :
                      'bg-blue-100 text-blue-900'
                    }`}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {submission.submittedBy}
                  </td>
                  <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatDate(submission.submittedAt)}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <button 
                        onClick={() => handleViewSubmission(submission)}
                        className="text-blue-600 hover:text-blue-900 transition-colors text-xs sm:text-sm px-2 py-1 hover:bg-blue-50 rounded"
                        title="Formular anzeigen"
                      >
                        <span className="inline sm:hidden">👁️</span>
                        <span className="hidden sm:inline">👁️ Anzeigen</span>
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(submission)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors text-xs sm:text-sm px-2 py-1 hover:bg-indigo-50 rounded"
                        title="Als PDF herunterladen"
                      >
                        <span className="inline sm:hidden">⬇️</span>
                        <span className="hidden sm:inline">⬇️ PDF</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteSubmission(submission)}
                        className="text-red-600 hover:text-red-900 transition-colors text-xs sm:text-sm px-2 py-1 hover:bg-red-50 rounded"
                        title="Formular löschen"
                      >
                        <span className="inline sm:hidden">🗑️</span>
                        <span className="hidden sm:inline">🗑️ Löschen</span>
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
                    selectedSubmission.type === 'stoermeldung' ? 'bg-orange-100' :
                    selectedSubmission.type === 'kassenabrechnung' ? 'bg-indigo-100' :
                    selectedSubmission.type === 'arbeitsunfall' ? 'bg-red-100' :
                    'bg-purple-100'
                  }`}>
                    <span className={`text-lg ${
                      selectedSubmission.type === 'wassermessung' ? 'text-blue-600' :
                      selectedSubmission.type === 'rutschenkontrolle' ? 'text-green-600' :
                      selectedSubmission.type === 'stoermeldung' ? 'text-orange-600' :
                      selectedSubmission.type === 'kassenabrechnung' ? 'text-indigo-600' :
                      selectedSubmission.type === 'arbeitsunfall' ? 'text-red-600' :
                      'text-purple-600'
                    }`}>
                      {selectedSubmission.type === 'wassermessung' ? '💧' :
                       selectedSubmission.type === 'rutschenkontrolle' ? '🎢' :
                       selectedSubmission.type === 'stoermeldung' ? '🚨' :
                       selectedSubmission.type === 'kassenabrechnung' ? '💰' :
                       selectedSubmission.type === 'arbeitsunfall' ? '🏥' :
                       '📝'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedSubmission.title}</h3>
                    <p className="text-sm text-gray-800">{getFormTypeLabel(selectedSubmission.type)}</p>
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
                  <p className="text-sm text-gray-900 mt-1">{formatDate(selectedSubmission.submittedAt)}</p>
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
                <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
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
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">Formular löschen</h3>
                    {isAdmin && (
                      <span className="text-xs bg-purple-500/50 text-white px-2 py-0.5 rounded-full">Admin</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800">Diese Aktion kann nicht rückgängig gemacht werden</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-gray-900">{showDeleteConfirm.title}</p>
                <p className="text-sm text-gray-800 mt-1">{showDeleteConfirm.description}</p>
              </div>

              {!isAdmin && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Sie benötigen ein Passwort zum Löschen
                  </p>
                </div>
              )}

              {isAdmin && (
                <div className="bg-purple-50 border-l-4 border-purple-400 p-3 mb-4">
                  <p className="text-xs text-purple-800">
                    👑 Admin: Keine Passwort-Eingabe erforderlich
                  </p>
                </div>
              )}

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
      
      <StoermeldungForm
        isOpen={openForm === 'stoermeldung'}
        onClose={() => setOpenForm(null)}
        onSubmit={(data) => handleFormSubmit('stoermeldung', data)}
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
      
      <StundenkorrekturForm
        isOpen={openForm === 'stundenkorrektur'}
        onClose={() => setOpenForm(null)}
        onSubmit={(data) => handleFormSubmit('stundenkorrektur', data)}
      />
    </div>
  )
}
