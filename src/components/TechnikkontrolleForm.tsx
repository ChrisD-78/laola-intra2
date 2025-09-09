'use client'

import { useState } from 'react'

interface TechnikkontrolleFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TechnikkontrolleData) => void
}

interface TechnikkontrolleData {
  anlage: string
  datum: string
  zeit: string
  funktionspruefung: string
  sicherheitscheck: string
  wartungsbedarf: string
  bemerkungen: string
  durchgefuehrtVon: string
}

const TechnikkontrolleForm = ({ isOpen, onClose, onSubmit }: TechnikkontrolleFormProps) => {
  const [formData, setFormData] = useState<TechnikkontrolleData>({
    anlage: '',
    datum: new Date().toISOString().split('T')[0],
    zeit: new Date().toTimeString().slice(0, 5),
    funktionspruefung: '',
    sicherheitscheck: '',
    wartungsbedarf: '',
    bemerkungen: '',
    durchgefuehrtVon: 'Christof Drost'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
    // Reset form
    setFormData({
      anlage: '',
      datum: new Date().toISOString().split('T')[0],
      zeit: new Date().toTimeString().slice(0, 5),
      funktionspruefung: '',
      sicherheitscheck: '',
      wartungsbedarf: '',
      bemerkungen: '',
      durchgefuehrtVon: 'Christof Drost'
    })
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setFormData({
      anlage: '',
      datum: new Date().toISOString().split('T')[0],
      zeit: new Date().toTimeString().slice(0, 5),
      funktionspruefung: '',
      sicherheitscheck: '',
      wartungsbedarf: '',
      bemerkungen: '',
      durchgefuehrtVon: 'Christof Drost'
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
                <span className="text-3xl">⚙️</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Technikkontrolle
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
                <label htmlFor="anlage" className="block text-sm font-medium text-gray-700 mb-2">
                  Technische Anlage *
                </label>
                <select
                  id="anlage"
                  value={formData.anlage}
                  onChange={(e) => setFormData({...formData, anlage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Anlage auswählen</option>
                  <option value="Filteranlage Hauptbecken">Filteranlage Hauptbecken</option>
                  <option value="Filteranlage Kinderbecken">Filteranlage Kinderbecken</option>
                  <option value="Heizungsanlage">Heizungsanlage</option>
                  <option value="Lüftungsanlage">Lüftungsanlage</option>
                  <option value="Pumpenanlage">Pumpenanlage</option>
                  <option value="Beleuchtungsanlage">Beleuchtungsanlage</option>
                  <option value="Alarmanlage">Alarmanlage</option>
                  <option value="Brandschutzanlage">Brandschutzanlage</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="datum" className="block text-sm font-medium text-gray-700 mb-2">
                  Datum *
                </label>
                <input
                  type="date"
                  id="datum"
                  value={formData.datum}
                  onChange={(e) => setFormData({...formData, datum: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="zeit" className="block text-sm font-medium text-gray-700 mb-2">
                  Zeit *
                </label>
                <input
                  type="time"
                  id="zeit"
                  value={formData.zeit}
                  onChange={(e) => setFormData({...formData, zeit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="durchgefuehrtVon" className="block text-sm font-medium text-gray-700 mb-2">
                  Durchgeführt von *
                </label>
                <input
                  type="text"
                  id="durchgefuehrtVon"
                  value={formData.durchgefuehrtVon}
                  onChange={(e) => setFormData({...formData, durchgefuehrtVon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="funktionspruefung" className="block text-sm font-medium text-gray-700 mb-2">
                  Funktionsprüfung *
                </label>
                <select
                  id="funktionspruefung"
                  value={formData.funktionspruefung}
                  onChange={(e) => setFormData({...formData, funktionspruefung: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Status wählen</option>
                  <option value="OK">✅ OK</option>
                  <option value="Mängel">⚠️ Mängel</option>
                  <option value="Defekt">❌ Defekt</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="sicherheitscheck" className="block text-sm font-medium text-gray-700 mb-2">
                  Sicherheitscheck *
                </label>
                <select
                  id="sicherheitscheck"
                  value={formData.sicherheitscheck}
                  onChange={(e) => setFormData({...formData, sicherheitscheck: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Status wählen</option>
                  <option value="OK">✅ OK</option>
                  <option value="Mängel">⚠️ Mängel</option>
                  <option value="Nicht OK">❌ Nicht OK</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="wartungsbedarf" className="block text-sm font-medium text-gray-700 mb-2">
                  Wartungsbedarf *
                </label>
                <select
                  id="wartungsbedarf"
                  value={formData.wartungsbedarf}
                  onChange={(e) => setFormData({...formData, wartungsbedarf: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Status wählen</option>
                  <option value="Kein Bedarf">✅ Kein Bedarf</option>
                  <option value="Wartung empfohlen">⚠️ Wartung empfohlen</option>
                  <option value="Sofortige Wartung">❌ Sofortige Wartung</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="bemerkungen" className="block text-sm font-medium text-gray-700 mb-2">
                Bemerkungen
              </label>
              <textarea
                id="bemerkungen"
                value={formData.bemerkungen}
                onChange={(e) => setFormData({...formData, bemerkungen: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detaillierte Beschreibung der Kontrolle, gemessene Werte, durchgeführte Reparaturen oder Wartungsmaßnahmen..."
              />
            </div>
            
            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Kontrolle speichern
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

export default TechnikkontrolleForm
