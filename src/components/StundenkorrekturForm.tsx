'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { sendEmail, createHoursCorrectionEmail } from '../lib/emailService'

interface StundenkorrekturFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: StundenkorrekturData) => void
}

interface StundenkorrekturData {
  name: string
  datum: string
  uhrzeitVon: string
  uhrzeitBis: string
  grund: string
}

const StundenkorrekturForm = ({ isOpen, onClose, onSubmit }: StundenkorrekturFormProps) => {
  const { currentUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  
  const [formData, setFormData] = useState<StundenkorrekturData>({
    name: currentUser || '',
    datum: new Date().toISOString().split('T')[0],
    uhrzeitVon: '',
    uhrzeitBis: '',
    grund: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setEmailStatus('sending')
    
    try {
      // E-Mail erstellen und versenden
      const emailData = createHoursCorrectionEmail(formData)
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
        setErrorMessage(result.error || 'Unbekannter Fehler beim E-Mail-Versand')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Fehler beim Senden der Stundenkorrektur:', error)
      setEmailStatus('error')
      setErrorMessage('Netzwerkfehler - Bitte versuchen Sie es erneut')
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: currentUser || '',
      datum: new Date().toISOString().split('T')[0],
      uhrzeitVon: '',
      uhrzeitBis: '',
      grund: ''
    })
    setIsSubmitting(false)
    setEmailStatus('idle')
    setErrorMessage('')
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      resetForm()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleClose}></div>
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">⏰ Stundenkorrektur</h2>
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {emailStatus === 'sending' && (
            <div className="mx-6 mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-800 font-medium">⏰ Stundenkorrektur wird gesendet...</span>
              </div>
            </div>
          )}
          
          {emailStatus === 'success' && (
            <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-green-600 text-xl">✅</span>
                <span className="text-green-800 font-medium">E-Mail erfolgreich gesendet! Antrag wird bearbeitet...</span>
              </div>
            </div>
          )}
          
          {emailStatus === 'error' && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
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
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="datum" className="block text-sm font-medium text-gray-900 mb-2">
                  Datum *
                </label>
                <input
                  type="date"
                  id="datum"
                  value={formData.datum}
                  onChange={(e) => setFormData({...formData, datum: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="uhrzeitVon" className="block text-sm font-medium text-gray-900 mb-2">
                  Uhrzeit von *
                </label>
                <input
                  type="time"
                  id="uhrzeitVon"
                  value={formData.uhrzeitVon}
                  onChange={(e) => setFormData({...formData, uhrzeitVon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="uhrzeitBis" className="block text-sm font-medium text-gray-900 mb-2">
                  Uhrzeit bis *
                </label>
                <input
                  type="time"
                  id="uhrzeitBis"
                  value={formData.uhrzeitBis}
                  onChange={(e) => setFormData({...formData, uhrzeitBis: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="grund" className="block text-sm font-medium text-gray-900 mb-2">
                Grund der Stundenkorrektur *
              </label>
              <textarea
                id="grund"
                value={formData.grund}
                onChange={(e) => setFormData({...formData, grund: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Beschreiben Sie den Grund für die Stundenkorrektur..."
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 ${
                  isSubmitting 
                    ? 'bg-purple-400 text-white cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Wird gesendet...</span>
                  </>
                ) : (
                  <>
                    <span>⏰ Stundenkorrektur senden</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default StundenkorrekturForm
