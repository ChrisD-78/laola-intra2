'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { sendEmail, createAccidentEmail } from '../lib/emailService'

interface ArbeitsunfallFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ArbeitsunfallData) => void
}

interface ArbeitsunfallData {
  unfalltyp: 'mitarbeiter' | 'gast'
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
  // Zusätzliche Felder für Mitarbeiter
  unfallhergang?: string
  // Zusätzliche Felder für Gäste
  gastAlter?: string
  gastKontakt?: string
}

const ArbeitsunfallForm = ({ isOpen, onClose, onSubmit }: ArbeitsunfallFormProps) => {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'mitarbeiter' | 'gast'>('mitarbeiter')
  const [showCodesModal, setShowCodesModal] = useState<boolean>(false)
  const [copiedKey, setCopiedKey] = useState<'freibad' | 'laola' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  
  const [formData, setFormData] = useState<ArbeitsunfallData>({
    unfalltyp: 'mitarbeiter',
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
    meldendePerson: currentUser || 'Unbekannt',
    unfallhergang: '',
    gastAlter: '',
    gastKontakt: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setEmailStatus('sending')
    
    try {
      // E-Mail erstellen und versenden
      const emailData = createAccidentEmail(formData)
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
      console.error('Fehler beim Senden der Unfall-Meldung:', error)
      setEmailStatus('error')
      setErrorMessage('Netzwerkfehler - Bitte versuchen Sie es erneut')
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      unfalltyp: 'mitarbeiter',
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
      meldendePerson: currentUser || 'Unbekannt',
      unfallhergang: '',
      gastAlter: '',
      gastKontakt: ''
    })
    setActiveTab('mitarbeiter')
    setIsSubmitting(false)
    setEmailStatus('idle')
    setErrorMessage('')
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setFormData({
      unfalltyp: 'mitarbeiter',
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
      meldendePerson: currentUser || 'Unbekannt',
      gastAlter: '',
      gastKontakt: ''
    })
    setActiveTab('mitarbeiter')
  }

  const handleTabChange = (tab: 'mitarbeiter' | 'gast') => {
    setActiveTab(tab)
    setFormData({...formData, unfalltyp: tab})
  }

  const handleArztbesuchClick = () => {
    window.open('https://extranet.ukrlp.de/nutzungzugangscode/', '_blank', 'noopener,noreferrer')
    setShowCodesModal(true)
  }

  const handleCopy = async (key: 'freibad' | 'laola', value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1500)
    } catch (_) {
      // Fallback: Auswahl markieren
      alert('Kopieren nicht möglich. Bitte manuell kopieren.')
    }
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
            
            {/* Tabs */}
            <div className="mt-4 flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => handleTabChange('mitarbeiter')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'mitarbeiter'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👨‍💼 Unfallmeldung Mitarbeiter
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('gast')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'gast'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👥 Unfallmeldung Gäste
              </button>
            </div>
          </div>
          
          {/* Status Messages */}
          {emailStatus === 'sending' && (
            <div className="mx-6 mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-800 font-medium">🚨 Unfall-Meldung wird gesendet...</span>
              </div>
            </div>
          )}
          
          {emailStatus === 'success' && (
            <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-green-600 text-xl">✅</span>
                <span className="text-green-800 font-medium">E-Mail erfolgreich gesendet! Meldung wird verarbeitet...</span>
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
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="datum" className="block text-sm font-medium text-gray-900 mb-2">
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
                <label htmlFor="zeit" className="block text-sm font-medium text-gray-900 mb-2">
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
                <label htmlFor="verletztePerson" className="block text-sm font-medium text-gray-900 mb-2">
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

              {/* Mitarbeiter-spezifische Felder */}
              {activeTab === 'mitarbeiter' && (
                <>
                  <div className="md:col-span-2">
                    <label htmlFor="unfallhergang" className="block text-sm font-medium text-gray-900 mb-2">
                      Unfallhergang *
                    </label>
                    <textarea
                      id="unfallhergang"
                      value={formData.unfallhergang || ''}
                      onChange={(e) => setFormData({...formData, unfallhergang: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Beschreiben Sie den genauen Hergang des Unfalls"
                      required
                    />
                  </div>
                </>
              )}

              {/* Gast-spezifische Felder */}
              {activeTab === 'gast' && (
                <>
                  <div>
                    <label htmlFor="gastAlter" className="block text-sm font-medium text-gray-900 mb-2">
                      Alter des Gastes (optional)
                    </label>
                    <input
                      type="text"
                      id="gastAlter"
                      value={formData.gastAlter || ''}
                      onChange={(e) => setFormData({...formData, gastAlter: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="z.B. 8 Jahre"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="gastKontakt" className="block text-sm font-medium text-gray-900 mb-2">
                      Kontakt (Telefon/E-Mail)
                    </label>
                    <input
                      type="text"
                      id="gastKontakt"
                      value={formData.gastKontakt || ''}
                      onChange={(e) => setFormData({...formData, gastKontakt: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Telefonnummer oder E-Mail-Adresse"
                    />
                  </div>
                </>
              )}
              
              {activeTab === 'mitarbeiter' && (
                <div>
                  <label htmlFor="unfallort" className="block text-sm font-medium text-gray-900 mb-2">
                    Unfallort *
                  </label>
                  <input
                    type="text"
                    id="unfallort"
                    value={formData.unfallort}
                    onChange={(e) => setFormData({...formData, unfallort: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ort des Unfalls"
                    required
                  />
                </div>
              )}
              
              {activeTab === 'mitarbeiter' && (
                <div>
                  <label htmlFor="unfallart" className="block text-sm font-medium text-gray-900 mb-2">
                    Art des Unfalls *
                  </label>
                  <input
                    type="text"
                    id="unfallart"
                    value={formData.unfallart}
                    onChange={(e) => setFormData({...formData, unfallart: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="z.B. Sturz, Schnitt, Verbrennung"
                    required
                  />
                </div>
              )}
              
              {activeTab === 'mitarbeiter' && (
                <div>
                  <label htmlFor="verletzungsart" className="block text-sm font-medium text-gray-900 mb-2">
                    Art der Verletzung *
                  </label>
                  <input
                    type="text"
                    id="verletzungsart"
                    value={formData.verletzungsart}
                    onChange={(e) => setFormData({...formData, verletzungsart: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="z.B. Schnittwunde, Prellung"
                    required
                  />
                </div>
              )}
              
              {activeTab === 'mitarbeiter' && (
                <div>
                  <label htmlFor="schweregrad" className="block text-sm font-medium text-gray-900 mb-2">
                    Schweregrad *
                  </label>
                  <input
                    type="text"
                    id="schweregrad"
                    value={formData.schweregrad}
                    onChange={(e) => setFormData({...formData, schweregrad: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="z.B. Leicht, Mittel, Schwer"
                    required
                  />
                </div>
              )}
              
              {activeTab === 'mitarbeiter' && (
                <div>
                  <label htmlFor="ersteHilfe" className="block text-sm font-medium text-gray-900 mb-2">
                    Erste Hilfe geleistet *
                  </label>
                  <input
                    type="text"
                    id="ersteHilfe"
                    value={formData.ersteHilfe}
                    onChange={(e) => setFormData({...formData, ersteHilfe: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ja, Nein oder Details"
                    required
                  />
                </div>
              )}
              
              {activeTab === 'mitarbeiter' && (
                <div className="md:col-span-2">
                  <label htmlFor="arztKontakt" className="block text-sm font-medium text-gray-900 mb-2">
                    Arztkontakt *
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      id="arztKontakt"
                      value={formData.arztKontakt}
                      onChange={(e) => setFormData({...formData, arztKontakt: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="z.B. Hausarzt, Notarzt, Krankenhaus"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleArztbesuchClick}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Arztbesuch melden
                    </button>
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="zeugen" className="block text-sm font-medium text-gray-900 mb-2">
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
                <label htmlFor="meldendePerson" className="block text-sm font-medium text-gray-900 mb-2">
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
              <label htmlFor="beschreibung" className="block text-sm font-medium text-gray-900 mb-2">
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
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2 ${
                  isSubmitting 
                    ? 'bg-red-400 text-white cursor-not-allowed' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Wird gesendet...</span>
                  </>
                ) : (
                  <>
                    <span>🚨</span>
                    <span>Unfall melden</span>
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

      {/* Zugangscodes Modal */}
      {showCodesModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCodesModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Zugangscodes</h4>
              <button
                type="button"
                onClick={() => setShowCodesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Freibad</div>
                <div className="flex items-center gap-2">
                  <div className="font-mono text-sm break-all">HPNTXUSD8KUXUDM39H5BFT4RW</div>
                  <button
                    type="button"
                    onClick={() => handleCopy('freibad', 'HPNTXUSD8KUXUDM39H5BFT4RW')}
                    className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
                  >
                    {copiedKey === 'freibad' ? 'Kopiert' : 'Kopieren'}
                  </button>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">LA OLA</div>
                <div className="flex items-center gap-2">
                  <div className="font-mono text-sm break-all">KU6X2BE2DXRDTL3SZ6A5FSQXZ</div>
                  <button
                    type="button"
                    onClick={() => handleCopy('laola', 'KU6X2BE2DXRDTL3SZ6A5FSQXZ')}
                    className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
                  >
                    {copiedKey === 'laola' ? 'Kopiert' : 'Kopieren'}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCodesModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ArbeitsunfallForm
