'use client'

import { useState } from 'react'

interface FeedbackFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FeedbackData) => void
}

interface FeedbackData {
  kategorie: string
  betroffenerBereich: string
  prioritaet: string
  titel: string
  beschreibung: string
  vorschlag: string
  meldendePerson: string
  kontakt: string
}

const FeedbackForm = ({ isOpen, onClose, onSubmit }: FeedbackFormProps) => {
  const [formData, setFormData] = useState<FeedbackData>({
    kategorie: '',
    betroffenerBereich: '',
    prioritaet: '',
    titel: '',
    beschreibung: '',
    vorschlag: '',
    meldendePerson: 'Christof Drost',
    kontakt: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
    // Reset form
    setFormData({
      kategorie: '',
      betroffenerBereich: '',
      prioritaet: '',
      titel: '',
      beschreibung: '',
      vorschlag: '',
      meldendePerson: 'Christof Drost',
      kontakt: ''
    })
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setFormData({
      kategorie: '',
      betroffenerBereich: '',
      prioritaet: '',
      titel: '',
      beschreibung: '',
      vorschlag: '',
      meldendePerson: 'Christof Drost',
      kontakt: ''
    })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">📝</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Feedback geben
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="kategorie" className="block text-sm font-medium text-gray-700 mb-2">
                  Kategorie *
                </label>
                <select
                  id="kategorie"
                  value={formData.kategorie}
                  onChange={(e) => setFormData({...formData, kategorie: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Kategorie auswählen</option>
                  <option value="Verbesserungsvorschlag">Verbesserungsvorschlag</option>
                  <option value="Problem melden">Problem melden</option>
                  <option value="Lob">Lob</option>
                  <option value="Beschwerde">Beschwerde</option>
                  <option value="Ideen">Ideen</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="betroffenerBereich" className="block text-sm font-medium text-gray-700 mb-2">
                  Betroffener Bereich
                </label>
                <select
                  id="betroffenerBereich"
                  value={formData.betroffenerBereich}
                  onChange={(e) => setFormData({...formData, betroffenerBereich: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Bereich auswählen (optional)</option>
                  <option value="Schwimmerbecken">Schwimmerbecken</option>
                  <option value="Lehrschwimmbecken">Lehrschwimmbecken</option>
                  <option value="Wellenbecken">Wellenbecken</option>
                  <option value="Rutschenbecken">Rutschenbecken</option>
                  <option value="Kinderbecken">Kinderbecken</option>
                  <option value="Thermalbecken">Thermalbecken</option>
                  <option value="Sauna">Sauna</option>
                  <option value="Umkleidekabinen">Umkleidekabinen</option>
                  <option value="Duschen">Duschen</option>
                  <option value="Gastronomie">Gastronomie</option>
                  <option value="Kasse">Kasse</option>
                  <option value="Parkplatz">Parkplatz</option>
                  <option value="Personal">Personal</option>
                  <option value="Technik">Technik</option>
                  <option value="Sicherheit">Sicherheit</option>
                  <option value="Allgemein">Allgemein</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="prioritaet" className="block text-sm font-medium text-gray-700 mb-2">
                  Priorität
                </label>
                <select
                  id="prioritaet"
                  value={formData.prioritaet}
                  onChange={(e) => setFormData({...formData, prioritaet: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Priorität auswählen</option>
                  <option value="Niedrig">Niedrig</option>
                  <option value="Mittel">Mittel</option>
                  <option value="Hoch">Hoch</option>
                  <option value="Kritisch">Kritisch</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="meldendePerson" className="block text-sm font-medium text-gray-700 mb-2">
                  Ihr Name *
                </label>
                <input
                  type="text"
                  id="meldendePerson"
                  value={formData.meldendePerson}
                  onChange={(e) => setFormData({...formData, meldendePerson: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="titel" className="block text-sm font-medium text-gray-700 mb-2">
                Titel *
              </label>
              <input
                type="text"
                id="titel"
                value={formData.titel}
                onChange={(e) => setFormData({...formData, titel: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Kurze Zusammenfassung Ihres Feedbacks"
                required
              />
            </div>
            
            <div>
              <label htmlFor="beschreibung" className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung *
              </label>
              <textarea
                id="beschreibung"
                value={formData.beschreibung}
                onChange={(e) => setFormData({...formData, beschreibung: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Beschreiben Sie Ihr Feedback detailliert..."
                required
              />
            </div>
            
            <div>
              <label htmlFor="vorschlag" className="block text-sm font-medium text-gray-700 mb-2">
                Lösungsvorschlag / Verbesserungsvorschlag
              </label>
              <textarea
                id="vorschlag"
                value={formData.vorschlag}
                onChange={(e) => setFormData({...formData, vorschlag: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Haben Sie einen Vorschlag zur Lösung oder Verbesserung?"
              />
            </div>
            
            <div>
              <label htmlFor="kontakt" className="block text-sm font-medium text-gray-700 mb-2">
                Kontakt (optional)
              </label>
              <input
                type="text"
                id="kontakt"
                value={formData.kontakt}
                onChange={(e) => setFormData({...formData, kontakt: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Telefonnummer oder E-Mail für Rückfragen"
              />
            </div>
            
            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Feedback senden
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default FeedbackForm
