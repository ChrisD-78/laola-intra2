'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

interface WassermessungFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: WassermessungData) => void
}

interface WassermessungData {
  becken: string
  phWert: string
  chlorWert: string
  chlorWertGesamt: string
  chlorWertGebunden: string
  redox: string
  temperatur: string
  datum: string
  zeit: string
  bemerkungen: string
  durchgefuehrtVon: string
}

const WassermessungForm = ({ isOpen, onClose, onSubmit }: WassermessungFormProps) => {
  const { currentUser } = useAuth()
  const [formData, setFormData] = useState<WassermessungData>({
    becken: '',
    phWert: '',
    chlorWert: '',
    chlorWertGesamt: '',
    chlorWertGebunden: '',
    redox: '',
    temperatur: '',
    datum: new Date().toISOString().split('T')[0],
    zeit: new Date().toTimeString().slice(0, 5),
    bemerkungen: '',
    durchgefuehrtVon: currentUser || 'Unbekannt'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
    // Reset form
    setFormData({
      becken: '',
      phWert: '',
      chlorWert: '',
      chlorWertGesamt: '',
      chlorWertGebunden: '',
      redox: '',
      temperatur: '',
      datum: new Date().toISOString().split('T')[0],
      zeit: new Date().toTimeString().slice(0, 5),
      bemerkungen: '',
      durchgefuehrtVon: currentUser || 'Unbekannt'
    })
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setFormData({
      becken: '',
      phWert: '',
      chlorWert: '',
      chlorWertGesamt: '',
      chlorWertGebunden: '',
      redox: '',
      temperatur: '',
      datum: new Date().toISOString().split('T')[0],
      zeit: new Date().toTimeString().slice(0, 5),
      bemerkungen: '',
      durchgefuehrtVon: currentUser || 'Unbekannt'
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
                <span className="text-3xl">💧</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Wassermessung
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
                <label htmlFor="becken" className="block text-sm font-medium text-gray-900 mb-2">
                  Becken *
                </label>
                <select
                  id="becken"
                  value={formData.becken}
                  onChange={(e) => setFormData({...formData, becken: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Becken auswählen</option>
                  <option value="Schwimmerbecken">Schwimmerbecken</option>
                  <option value="Lehrschwimmbecken">Lehrschwimmbecken</option>
                  <option value="Wellenbecken">Wellenbecken</option>
                  <option value="Rutschenbecken">Rutschenbecken</option>
                  <option value="Kinderbecken 1">Kinderbecken 1</option>
                  <option value="Kinderbecken 2">Kinderbecken 2</option>
                  <option value="Thermalbecken">Thermalbecken</option>
                  <option value="HWP Halle">HWP Halle</option>
                  <option value="Sauna Außenbecken">Sauna Außenbecken</option>
                  <option value="Sauna Außenbecken warm">Sauna Außenbecken warm</option>
                  <option value="Sauna Außenbecken kalt">Sauna Außenbecken kalt</option>
                  <option value="HWP Sauna">HWP Sauna</option>
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="zeit" className="block text-sm font-medium text-gray-900 mb-2">
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
                <label htmlFor="durchgefuehrtVon" className="block text-sm font-medium text-gray-900 mb-2">
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
              
              <div>
                <label htmlFor="phWert" className="block text-sm font-medium text-gray-900 mb-2">
                  pH-Wert *
                </label>
                <input
                  type="number"
                  id="phWert"
                  step="0.1"
                  min="6.0"
                  max="8.5"
                  value={formData.phWert}
                  onChange={(e) => setFormData({...formData, phWert: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. 7.2"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="chlorWert" className="block text-sm font-medium text-gray-900 mb-2">
                  Chlor-Wert (mg/l) *
                </label>
                <input
                  type="number"
                  id="chlorWert"
                  step="0.1"
                  min="0.0"
                  max="3.0"
                  value={formData.chlorWert}
                  onChange={(e) => setFormData({...formData, chlorWert: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. 0.8"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="chlorWertGesamt" className="block text-sm font-medium text-gray-900 mb-2">
                  Chlor-Wert-Gesamt (mg/l) *
                </label>
                <input
                  type="number"
                  id="chlorWertGesamt"
                  step="0.1"
                  min="0.0"
                  max="5.0"
                  value={formData.chlorWertGesamt}
                  onChange={(e) => setFormData({...formData, chlorWertGesamt: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. 1.2"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="chlorWertGebunden" className="block text-sm font-medium text-gray-900 mb-2">
                  Chlor-Wert-Gebunden (mg/l) *
                </label>
                <input
                  type="number"
                  id="chlorWertGebunden"
                  step="0.1"
                  min="0.0"
                  max="2.0"
                  value={formData.chlorWertGebunden}
                  onChange={(e) => setFormData({...formData, chlorWertGebunden: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. 0.4"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="redox" className="block text-sm font-medium text-gray-900 mb-2">
                  Redox (mV) *
                </label>
                <input
                  type="number"
                  id="redox"
                  step="1"
                  min="400"
                  max="800"
                  value={formData.redox}
                  onChange={(e) => setFormData({...formData, redox: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. 650"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="temperatur" className="block text-sm font-medium text-gray-900 mb-2">
                  Wassertemperatur (°C) *
                </label>
                <input
                  type="number"
                  id="temperatur"
                  step="0.1"
                  min="20"
                  max="40"
                  value={formData.temperatur}
                  onChange={(e) => setFormData({...formData, temperatur: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. 28.5"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="bemerkungen" className="block text-sm font-medium text-gray-900 mb-2">
                Bemerkungen
              </label>
              <textarea
                id="bemerkungen"
                value={formData.bemerkungen}
                onChange={(e) => setFormData({...formData, bemerkungen: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Besondere Beobachtungen, Auffälligkeiten oder Maßnahmen..."
              />
            </div>
            
            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Messung speichern
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

export default WassermessungForm
