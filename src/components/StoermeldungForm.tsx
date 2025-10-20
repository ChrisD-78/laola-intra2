'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

interface StoermeldungFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: StoermeldungData) => void
}

interface StoermeldungData {
  datum: string
  zeit: string
  stoerungstyp: string
  beschreibung: string
  meldendePerson: string
}

const StoermeldungForm = ({ isOpen, onClose, onSubmit }: StoermeldungFormProps) => {
  const { currentUser } = useAuth()
  const [formData, setFormData] = useState<StoermeldungData>({
    datum: new Date().toISOString().split('T')[0],
    zeit: new Date().toTimeString().slice(0, 5),
    stoerungstyp: '',
    beschreibung: '',
    meldendePerson: currentUser || 'Unbekannt'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
    // Reset form
    setFormData({
      datum: new Date().toISOString().split('T')[0],
      zeit: new Date().toTimeString().slice(0, 5),
      stoerungstyp: '',
      beschreibung: '',
      meldendePerson: currentUser || 'Unbekannt'
    })
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setFormData({
      datum: new Date().toISOString().split('T')[0],
      zeit: new Date().toTimeString().slice(0, 5),
      stoerungstyp: '',
      beschreibung: '',
      meldendePerson: currentUser || 'Unbekannt'
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
                <span className="text-3xl">🚨</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Störmeldung Melden
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
                <label htmlFor="datum" className="block text-sm font-medium text-gray-900 mb-2">
                  Datum *
                </label>
                <input
                  type="date"
                  id="datum"
                  value={formData.datum}
                  onChange={(e) => setFormData({...formData, datum: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="zeit" className="block text-sm font-medium text-gray-900 mb-2">
                  Uhrzeit der Störung *
                </label>
                <input
                  type="time"
                  id="zeit"
                  value={formData.zeit}
                  onChange={(e) => setFormData({...formData, zeit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="stoerungstyp" className="block text-sm font-medium text-gray-900 mb-2">
                  Störungstyp *
                </label>
                <select
                  id="stoerungstyp"
                  value={formData.stoerungstyp}
                  onChange={(e) => setFormData({...formData, stoerungstyp: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">Störungstyp auswählen</option>
                  <option value="Kompletter Ausfall">❌ Kompletter Ausfall</option>
                  <option value="Teilausfall">⚠️ Teilausfall</option>
                  <option value="Funktionsstörung">🔧 Funktionsstörung</option>
                  <option value="Ungewöhnliche Geräusche">🔊 Ungewöhnliche Geräusche</option>
                  <option value="Leistungsabfall">📉 Leistungsabfall</option>
                  <option value="Sicherheitsproblem">🚨 Sicherheitsproblem</option>
                  <option value="Sonstiges">❓ Sonstiges</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="meldendePerson" className="block text-sm font-medium text-gray-900 mb-2">
                  Meldende Person *
                </label>
                <input
                  type="text"
                  id="meldendePerson"
                  value={formData.meldendePerson}
                  onChange={(e) => setFormData({...formData, meldendePerson: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              
            </div>
            
            <div>
              <label htmlFor="beschreibung" className="block text-sm font-medium text-gray-900 mb-2">
                Detaillierte Beschreibung der Störung *
              </label>
              <textarea
                id="beschreibung"
                value={formData.beschreibung}
                onChange={(e) => setFormData({...formData, beschreibung: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Beschreiben Sie die Störung genau: Was funktioniert nicht? Wann ist die Störung aufgetreten? Haben Sie bereits Maßnahmen ergriffen? Gibt es Auswirkungen auf den Betrieb?"
                required
              />
            </div>
            
            {/* Info Box */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-red-600 text-xl">ℹ️</span>
                <div>
                  <h4 className="text-sm font-medium text-red-800">Wichtiger Hinweis</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Bei kritischen Störungen, die die Sicherheit gefährden könnten, kontaktieren Sie bitte 
                    zusätzlich umgehend die zuständige Technik oder den Betriebsleiter.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Störung melden
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

export default StoermeldungForm
