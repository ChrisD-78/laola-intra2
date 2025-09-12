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
        return `Becken: ${data.becken}, pH: ${data.phWert}, Chlor: ${data.chlorWert} mg/l`
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
                <button className="p-2 text-gray-400 hover:text-gray-600">
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
                      <button className="text-blue-600 hover:text-blue-900">
                        👁️ Anzeigen
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        📄 Details
                      </button>
                      <button className="text-red-600 hover:text-red-900">
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
