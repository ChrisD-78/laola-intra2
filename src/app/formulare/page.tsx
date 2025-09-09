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
}

export default function Formulare() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([
    {
      id: '1',
      type: 'wassermessung',
      title: 'Wassermessung - Hauptbecken',
      description: 'pH-Wert: 7.2, Chlor: 0.8 mg/l',
      status: 'Abgeschlossen',
      submittedAt: 'vor 2 Tagen'
    },
    {
      id: '2',
      type: 'rutschenkontrolle',
      title: 'Rutschenkontrolle - Wasserrutsche',
      description: 'Sicherheitscheck und Funktionsprüfung',
      status: 'In Bearbeitung',
      submittedAt: 'vor 1 Woche'
    },
    {
      id: '3',
      type: 'kassenabrechnung',
      title: 'Kassenabrechnung - Tagesabschluss',
      description: 'Tagesumsatz: €2,450.00, Kassenbestand korrekt',
      status: 'Eingegangen',
      submittedAt: 'vor 2 Wochen'
    }
  ])

  const [openForm, setOpenForm] = useState<string | null>(null)

  const handleFormSubmit = (type: string, data: any) => {
    const newSubmission: FormSubmission = {
      id: Date.now().toString(),
      type,
      title: `${type} - ${new Date().toLocaleDateString('de-DE')}`,
      description: generateDescription(type, data),
      status: 'Eingegangen',
      submittedAt: 'gerade eben'
    }
    setSubmissions([newSubmission, ...submissions])
  }

  const generateDescription = (type: string, data: any): string => {
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
          {submissions.map((submission) => (
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
