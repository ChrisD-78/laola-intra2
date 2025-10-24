'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

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
  const [formData, setFormData] = useState<StundenkorrekturData>({
    name: currentUser || '',
    datum: new Date().toISOString().split('T')[0],
    uhrzeitVon: '',
    uhrzeitBis: '',
    grund: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
    // Reset form
    setFormData({
      name: currentUser || '',
      datum: new Date().toISOString().split('T')[0],
      uhrzeitVon: '',
      uhrzeitBis: '',
      grund: ''
    })
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setFormData({
      name: currentUser || '',
      datum: new Date().toISOString().split('T')[0],
      uhrzeitVon: '',
      uhrzeitBis: '',
      grund: ''
    })
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
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"
              >
                ⏰ Stundenkorrektur senden
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default StundenkorrekturForm
