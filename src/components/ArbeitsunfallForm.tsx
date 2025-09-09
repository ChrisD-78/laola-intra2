'use client'

import { useState } from 'react'

interface ArbeitsunfallFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ArbeitsunfallData) => void
}

interface ArbeitsunfallData {
  datum: string
  zeit: string
  verletztePerson: string
  unfallort: string
  unfallart: string
  verletzungsart: string
  schweregrad: string
  ersteHilfe: string
  arztKontakt: string
  zeugen: string
  beschreibung: string
  meldendePerson: string
}

const ArbeitsunfallForm = ({ isOpen, onClose, onSubmit }: ArbeitsunfallFormProps) => {
  const [formData, setFormData] = useState<ArbeitsunfallData>({
    datum: new Date().toISOString().split('T')[0],
    zeit: new Date().toTimeString().slice(0, 5),
    verletztePerson: '',
    unfallort: '',
    unfallart: '',
    verletzungsart: '',
    schweregrad: '',
    ersteHilfe: '',
    arztKontakt: '',
    zeugen: '',
    beschreibung: '',
    meldendePerson: 'Christof Drost'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
    // Reset form
    setFormData({
      datum: new Date().toISOString().split('T')[0],
      zeit: new Date().toTimeString().slice(0, 5),
      verletztePerson: '',
      unfallort: '',
      unfallart: '',
      verletzungsart: '',
      schweregrad: '',
      ersteHilfe: '',
      arztKontakt: '',
      zeugen: '',
      beschreibung: '',
      meldendePerson: 'Christof Drost'
    })
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setFormData({
      datum: new Date().toISOString().split('T')[0],
      zeit: new Date().toTimeString().slice(0, 5),
      verletztePerson: '',
      unfallort: '',
      unfallart: '',
      verletzungsart: '',
      schweregrad: '',
      ersteHilfe: '',
      arztKontakt: '',
      zeugen: '',
      beschreibung: '',
      meldendePerson: 'Christof Drost'
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
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🏥</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Arbeitsunfall melden
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
                <label htmlFor="datum" className="block text-sm font-medium text-gray-700 mb-2">
                  Datum des Unfalls *
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
                  Uhrzeit des Unfalls *
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
                <label htmlFor="verletztePerson" className="block text-sm font-medium text-gray-700 mb-2">
                  Verletzte Person *
                </label>
                <input
                  type="text"
                  id="verletztePerson"
                  value={formData.verletztePerson}
                  onChange={(e) => setFormData({...formData, verletztePerson: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Name der verletzten Person"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="unfallort" className="block text-sm font-medium text-gray-700 mb-2">
                  Unfallort *
                </label>
                <select
                  id="unfallort"
                  value={formData.unfallort}
                  onChange={(e) => setFormData({...formData, unfallort: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Unfallort auswählen</option>
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
                  <option value="Umkleidekabinen">Umkleidekabinen</option>
                  <option value="Duschen">Duschen</option>
                  <option value="Gastronomie">Gastronomie</option>
                  <option value="Parkplatz">Parkplatz</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="unfallart" className="block text-sm font-medium text-gray-700 mb-2">
                  Art des Unfalls *
                </label>
                <select
                  id="unfallart"
                  value={formData.unfallart}
                  onChange={(e) => setFormData({...formData, unfallart: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Unfallart auswählen</option>
                  <option value="Sturz">Sturz</option>
                  <option value="Ausrutschen">Ausrutschen</option>
                  <option value="Schneiden/Verletzung">Schneiden/Verletzung</option>
                  <option value="Verbrennung">Verbrennung</option>
                  <option value="Ertrinken/Beinahe-Ertrinken">Ertrinken/Beinahe-Ertrinken</option>
                  <option value="Schlag/Stoß">Schlag/Stoß</option>
                  <option value="Heben/Tragen">Heben/Tragen</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="verletzungsart" className="block text-sm font-medium text-gray-700 mb-2">
                  Art der Verletzung *
                </label>
                <select
                  id="verletzungsart"
                  value={formData.verletzungsart}
                  onChange={(e) => setFormData({...formData, verletzungsart: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Verletzungsart auswählen</option>
                  <option value="Schürfwunde">Schürfwunde</option>
                  <option value="Schnittwunde">Schnittwunde</option>
                  <option value="Prellung">Prellung</option>
                  <option value="Verstauchung">Verstauchung</option>
                  <option value="Knochenbruch">Knochenbruch</option>
                  <option value="Verbrennung">Verbrennung</option>
                  <option value="Kopfverletzung">Kopfverletzung</option>
                  <option value="Rückenverletzung">Rückenverletzung</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="schweregrad" className="block text-sm font-medium text-gray-700 mb-2">
                  Schweregrad *
                </label>
                <select
                  id="schweregrad"
                  value={formData.schweregrad}
                  onChange={(e) => setFormData({...formData, schweregrad: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Schweregrad auswählen</option>
                  <option value="Leicht">Leicht (Erste Hilfe ausreichend)</option>
                  <option value="Mittel">Mittel (Arztbesuch erforderlich)</option>
                  <option value="Schwer">Schwer (Krankenhaus erforderlich)</option>
                  <option value="Kritisch">Kritisch (Notarzt erforderlich)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="ersteHilfe" className="block text-sm font-medium text-gray-700 mb-2">
                  Erste Hilfe geleistet *
                </label>
                <select
                  id="ersteHilfe"
                  value={formData.ersteHilfe}
                  onChange={(e) => setFormData({...formData, ersteHilfe: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Status auswählen</option>
                  <option value="Ja">Ja, Erste Hilfe wurde geleistet</option>
                  <option value="Nein">Nein, keine Erste Hilfe erforderlich</option>
                  <option value="Nicht möglich">Nicht möglich (Notarzt erforderlich)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="arztKontakt" className="block text-sm font-medium text-gray-700 mb-2">
                  Arztkontakt *
                </label>
                <select
                  id="arztKontakt"
                  value={formData.arztKontakt}
                  onChange={(e) => setFormData({...formData, arztKontakt: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Status auswählen</option>
                  <option value="Nicht erforderlich">Nicht erforderlich</option>
                  <option value="Hausarzt aufgesucht">Hausarzt aufgesucht</option>
                  <option value="Notarzt gerufen">Notarzt gerufen</option>
                  <option value="Krankenhaus">Krankenhaus aufgesucht</option>
                  <option value="Geplant">Arztbesuch geplant</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="zeugen" className="block text-sm font-medium text-gray-700 mb-2">
                  Zeugen
                </label>
                <input
                  type="text"
                  id="zeugen"
                  value={formData.zeugen}
                  onChange={(e) => setFormData({...formData, zeugen: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Namen der Zeugen (falls vorhanden)"
                />
              </div>
              
              <div>
                <label htmlFor="meldendePerson" className="block text-sm font-medium text-gray-700 mb-2">
                  Meldende Person *
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
              <label htmlFor="beschreibung" className="block text-sm font-medium text-gray-700 mb-2">
                Detaillierte Beschreibung des Unfalls *
              </label>
              <textarea
                id="beschreibung"
                value={formData.beschreibung}
                onChange={(e) => setFormData({...formData, beschreibung: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Beschreiben Sie den Unfallhergang detailliert..."
                required
              />
            </div>
            
            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Unfall melden
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

export default ArbeitsunfallForm
