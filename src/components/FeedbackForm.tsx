'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { sendEmail, createFeedbackEmail } from '../lib/emailService'

interface FeedbackFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FeedbackData) => void
}

interface FeedbackData {
  kategorie: string
  prioritaet: string
  titel: string
  beschreibung: string
  vorschlag: string
  meldendePerson: string
  kontakt: string
}

const FeedbackForm = ({ isOpen, onClose, onSubmit }: FeedbackFormProps) => {
  const { currentUser } = useAuth()
  const [formData, setFormData] = useState<FeedbackData>({
    kategorie: '',
    prioritaet: '',
    titel: '',
    beschreibung: '',
    vorschlag: '',
    meldendePerson: currentUser || 'Unbekannt',
    kontakt: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setEmailStatus('sending')
    
    try {
      // E-Mail erstellen und versenden
      const emailData = createFeedbackEmail(formData)
      const result = await sendEmail(emailData)
      
      if (result.success) {
        setEmailStatus('success')
        setErrorMessage('')
        // Kurz warten, damit der Benutzer die Erfolgsmeldung sieht
        setTimeout(() => {
          onSubmit(formData)
          onClose()
          resetForm()
        }, 1500)
      } else {
        setEmailStatus('error')
        setErrorMessage(result.error || 'Unbekannter Fehler')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Fehler beim Senden der E-Mail:', error)
      setEmailStatus('error')
      setErrorMessage('Netzwerkfehler - Bitte versuchen Sie es erneut')
      setIsSubmitting(false)
    }
  }
  
  const resetForm = () => {
    setFormData({
      kategorie: '',
      prioritaet: '',
      titel: '',
      beschreibung: '',
      vorschlag: '',
      meldendePerson: currentUser || 'Unbekannt',
      kontakt: ''
    })
    setIsSubmitting(false)
    setEmailStatus('idle')
    setErrorMessage('')
  }

  const handleClose = () => {
    onClose()
    resetForm()
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
          
          {/* Status Messages */}
          {emailStatus === 'sending' && (
            <div className="mx-6 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-800 font-medium">E-Mail wird gesendet...</span>
              </div>
            </div>
          )}
          
          {emailStatus === 'success' && (
            <div className="mx-6 mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-green-600 text-xl">✅</span>
                <span className="text-green-800 font-medium">E-Mail erfolgreich gesendet! Feedback wird verarbeitet...</span>
              </div>
            </div>
          )}
          
          {emailStatus === 'error' && (
            <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <span className="text-red-600 text-xl">❌</span>
                <div className="flex-1">
                  <div className="text-red-800 font-medium mb-2">Fehler beim Senden der E-Mail</div>
                  <div className="text-red-700 text-sm">{errorMessage}</div>
                  <div className="text-red-600 text-xs mt-2">
                    💡 <strong>Tipp:</strong> Überprüfen Sie die Netlify-Logs für detaillierte Fehlerinformationen.
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="kategorie" className="block text-sm font-medium text-gray-900 mb-2">
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
                <label htmlFor="prioritaet" className="block text-sm font-medium text-gray-900 mb-2">
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
                <label htmlFor="meldendePerson" className="block text-sm font-medium text-gray-900 mb-2">
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
              <label htmlFor="titel" className="block text-sm font-medium text-gray-900 mb-2">
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
              <label htmlFor="beschreibung" className="block text-sm font-medium text-gray-900 mb-2">
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
              <label htmlFor="vorschlag" className="block text-sm font-medium text-gray-900 mb-2">
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
              <label htmlFor="kontakt" className="block text-sm font-medium text-gray-900 mb-2">
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
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2 ${
                  isSubmitting 
                    ? 'bg-purple-400 text-white cursor-not-allowed' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Wird gesendet...</span>
                  </>
                ) : (
                  <>
                    <span>📧</span>
                    <span>Feedback senden</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
                  isSubmitting 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
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
