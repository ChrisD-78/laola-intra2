'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

interface KassenabrechnungFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: KassenabrechnungData) => void
}

interface KassenabrechnungData {
  datum: string
  kassenbestand: string
  tagesumsatz: string
  bargeld: string
  kartenzahlung: string
  differenz: string
  bemerkungen: string
  durchgefuehrtVon: string
}

const KassenabrechnungForm = ({ isOpen, onClose, onSubmit }: KassenabrechnungFormProps) => {
  const { currentUser } = useAuth()
  const [formData, setFormData] = useState<KassenabrechnungData>({
    datum: new Date().toISOString().split('T')[0],
    kassenbestand: '',
    tagesumsatz: '',
    bargeld: '',
    kartenzahlung: '',
    differenz: '',
    bemerkungen: '',
    durchgefuehrtVon: currentUser || 'Unbekannt'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
    // Reset form
    setFormData({
      datum: new Date().toISOString().split('T')[0],
      kassenbestand: '',
      tagesumsatz: '',
      bargeld: '',
      kartenzahlung: '',
      differenz: '',
      bemerkungen: '',
      durchgefuehrtVon: currentUser || 'Unbekannt'
    })
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setFormData({
      datum: new Date().toISOString().split('T')[0],
      kassenbestand: '',
      tagesumsatz: '',
      bargeld: '',
      kartenzahlung: '',
      differenz: '',
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
                <span className="text-3xl">💰</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Kassenabrechnung
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
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Kassenbestand</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="kassenbestand" className="block text-sm font-medium text-gray-900 mb-2">
                    Tatsächlicher Kassenbestand (€) *
                  </label>
                  <input
                    type="number"
                    id="kassenbestand"
                    step="0.01"
                    min="0"
                    value={formData.kassenbestand}
                    onChange={(e) => setFormData({...formData, kassenbestand: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="z.B. 1250.50"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="tagesumsatz" className="block text-sm font-medium text-gray-900 mb-2">
                    Erwarteter Tagesumsatz (€) *
                  </label>
                  <input
                    type="number"
                    id="tagesumsatz"
                    step="0.01"
                    min="0"
                    value={formData.tagesumsatz}
                    onChange={(e) => setFormData({...formData, tagesumsatz: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="z.B. 2450.00"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Zahlungsarten</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bargeld" className="block text-sm font-medium text-gray-900 mb-2">
                    Bargeld (€) *
                  </label>
                  <input
                    type="number"
                    id="bargeld"
                    step="0.01"
                    min="0"
                    value={formData.bargeld}
                    onChange={(e) => setFormData({...formData, bargeld: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="z.B. 1800.00"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="kartenzahlung" className="block text-sm font-medium text-gray-900 mb-2">
                    Kartenzahlung (€) *
                  </label>
                  <input
                    type="number"
                    id="kartenzahlung"
                    step="0.01"
                    min="0"
                    value={formData.kartenzahlung}
                    onChange={(e) => setFormData({...formData, kartenzahlung: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="z.B. 650.00"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="differenz" className="block text-sm font-medium text-gray-900 mb-2">
                Differenz (€)
              </label>
              <input
                type="number"
                id="differenz"
                step="0.01"
                value={formData.differenz}
                onChange={(e) => setFormData({...formData, differenz: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="z.B. -5.50 (negativ = Fehlbetrag, positiv = Überschuss)"
              />
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
                placeholder="Besondere Vorkommnisse, Fehlbeträge, Überschüsse oder andere relevante Informationen..."
              />
            </div>
            
            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Abrechnung speichern
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

export default KassenabrechnungForm
