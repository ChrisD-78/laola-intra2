'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

interface TechnikInspection {
  id: string
  rubrik: string
  id_nr: string
  name: string
  standort: string
  bild_url?: string
  letzte_pruefung: string
  interval: string
  naechste_pruefung: string
  bericht?: string
  bemerkungen?: string
  in_betrieb: boolean
  kontaktdaten?: string
  status: string
  created_at?: string
  updated_at?: string
}

export default function TechnikPage() {
  const { currentUser } = useAuth()
  const [inspections, setInspections] = useState<TechnikInspection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInspection, setSelectedInspection] = useState<TechnikInspection | null>(null)
  const [showDetailsPopup, setShowDetailsPopup] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    rubrik: '',
    id_nr: '',
    name: '',
    standort: '',
    bild_url: '',
    letzte_pruefung: '',
    interval: 'Jährlich',
    naechste_pruefung: '',
    bericht: '',
    bemerkungen: '',
    in_betrieb: true,
    kontaktdaten: ''
  })

  useEffect(() => {
    fetchInspections()
  }, [])

  const fetchInspections = async () => {
    try {
      const response = await fetch('/api/technik')
      if (response.ok) {
        const data = await response.json()
        setInspections(data)
      }
    } catch (error) {
      console.error('Failed to fetch inspections:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStatus = (naechstePruefung: string, status: string): string => {
    if (status === 'Erledigt') return 'Erledigt'
    
    const nextDate = new Date(naechstePruefung)
    const now = new Date()
    
    if (nextDate < now) return 'Überfällig'
    return 'Offen'
  }

  const isOverdue = (naechstePruefung: string): boolean => {
    const nextDate = new Date(naechstePruefung)
    const now = new Date()
    return nextDate < now
  }

  const overdueCount = inspections.filter(i => calculateStatus(i.naechste_pruefung, i.status) === 'Überfällig').length
  const completedCount = inspections.filter(i => i.status === 'Erledigt').length
  const totalCount = inspections.length

  const handleAddInspection = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/technik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'Offen'
        })
      })

      if (response.ok) {
        await fetchInspections()
        setShowAddForm(false)
        // Reset form
        setFormData({
          rubrik: '',
          id_nr: '',
          name: '',
          standort: '',
          bild_url: '',
          letzte_pruefung: '',
          interval: 'Jährlich',
          naechste_pruefung: '',
          bericht: '',
          bemerkungen: '',
          in_betrieb: true,
          kontaktdaten: ''
        })
      }
    } catch (error) {
      console.error('Failed to add inspection:', error)
    }
  }

  const handleMarkAsCompleted = async (id: string) => {
    try {
      const response = await fetch(`/api/technik`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Erledigt' })
      })

      if (response.ok) {
        await fetchInspections()
        setShowDetailsPopup(false)
      }
    } catch (error) {
      console.error('Failed to update inspection:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diese Prüfung wirklich löschen?')) return

    try {
      const response = await fetch(`/api/technik?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchInspections()
        setShowDetailsPopup(false)
      }
    } catch (error) {
      console.error('Failed to delete inspection:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-4 lg:p-8 text-white">
        <h1 className="text-2xl lg:text-4xl font-bold mb-4 text-center">
          🔧 Technik-Prüfungen
        </h1>
        <p className="text-center text-white/90 text-lg">
          Dokumentation und Verwaltung technischer Prüfungen
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-xl">🚨</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">Überfällig</p>
              <p className="text-2xl font-bold text-red-900">{overdueCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Erledigt</p>
              <p className="text-2xl font-bold text-green-900">{completedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-xl">📊</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">Gesamtanzahl</p>
              <p className="text-2xl font-bold text-blue-900">{totalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Neue Prüfung anlegen</h2>
            <p className="text-gray-600 mt-1">Erstellen Sie eine neue technische Prüfung</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Neue Prüfung
          </button>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Prüfungsübersicht</h2>
          <p className="text-gray-600 mt-1">Alle technischen Prüfungen im Überblick</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rubrik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID-Nr.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nächste Prüfung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Lade Prüfungen...
                  </td>
                </tr>
              ) : inspections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="text-4xl mb-4">🔧</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Keine Prüfungen vorhanden
                    </h3>
                    <p className="text-gray-600">
                      Erstellen Sie Ihre erste technische Prüfung
                    </p>
                  </td>
                </tr>
              ) : (
                inspections.map((inspection) => {
                  const status = calculateStatus(inspection.naechste_pruefung, inspection.status)
                  const overdue = isOverdue(inspection.naechste_pruefung) && status !== 'Erledigt'
                  
                  return (
                    <tr key={inspection.id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {inspection.rubrik}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {inspection.id_nr}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inspection.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          {overdue && <span className="text-red-500">🚨</span>}
                          <span>{formatDate(inspection.naechste_pruefung)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          status === 'Überfällig' ? 'bg-red-100 text-red-800' :
                          status === 'Erledigt' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedInspection(inspection)
                            setShowDetailsPopup(true)
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Neue Prüfung anlegen</h3>
            </div>
            
            <form onSubmit={handleAddInspection} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rubrik*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rubrik}
                    onChange={(e) => setFormData({...formData, rubrik: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. Rutsche, Technikraum"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID-Nr.*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.id_nr}
                    onChange={(e) => setFormData({...formData, id_nr: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. R-001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Bezeichnung des Geräts"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Standort*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.standort}
                    onChange={(e) => setFormData({...formData, standort: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Standort des Geräts"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Letzte Prüfung*
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.letzte_pruefung}
                    onChange={(e) => setFormData({...formData, letzte_pruefung: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intervall*
                  </label>
                  <select
                    required
                    value={formData.interval}
                    onChange={(e) => setFormData({...formData, interval: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Täglich">Täglich</option>
                    <option value="Wöchentlich">Wöchentlich</option>
                    <option value="Monatlich">Monatlich</option>
                    <option value="Vierteljährlich">Vierteljährlich</option>
                    <option value="Halbjährlich">Halbjährlich</option>
                    <option value="Jährlich">Jährlich</option>
                    <option value="2 Jahre">2 Jahre</option>
                    <option value="3 Jahre">3 Jahre</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nächste Prüfung*
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.naechste_pruefung}
                    onChange={(e) => setFormData({...formData, naechste_pruefung: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bild-URL
                  </label>
                  <input
                    type="text"
                    value={formData.bild_url}
                    onChange={(e) => setFormData({...formData, bild_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="URL zum Bild"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kontaktdaten
                </label>
                <input
                  type="text"
                  value={formData.kontaktdaten}
                  onChange={(e) => setFormData({...formData, kontaktdaten: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Kontaktdaten für Rückfragen"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bericht
                </label>
                <textarea
                  value={formData.bericht}
                  onChange={(e) => setFormData({...formData, bericht: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Prüfungsbericht"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bemerkungen
                </label>
                <textarea
                  value={formData.bemerkungen}
                  onChange={(e) => setFormData({...formData, bemerkungen: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Zusätzliche Bemerkungen"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.in_betrieb}
                  onChange={(e) => setFormData({...formData, in_betrieb: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  In Betrieb
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Prüfung anlegen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Popup */}
      {showDetailsPopup && selectedInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Prüfungsdetails</h3>
                <button
                  onClick={() => setShowDetailsPopup(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Image */}
              {selectedInspection.bild_url && (
                <div className="flex justify-center">
                  <img
                    src={selectedInspection.bild_url}
                    alt={selectedInspection.name}
                    className="max-h-64 rounded-lg shadow-md object-cover"
                  />
                </div>
              )}
              
              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Rubrik</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{selectedInspection.rubrik}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">ID-Nr.</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{selectedInspection.id_nr}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{selectedInspection.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Standort</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{selectedInspection.standort}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Letzte Prüfung</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {formatDate(selectedInspection.letzte_pruefung)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Intervall</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{selectedInspection.interval}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Nächste Prüfung</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {formatDate(selectedInspection.naechste_pruefung)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      selectedInspection.in_betrieb ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedInspection.in_betrieb ? 'In Betrieb' : 'Außer Betrieb'}
                    </span>
                  </p>
                </div>
              </div>
              
              {selectedInspection.kontaktdaten && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Kontaktdaten</label>
                  <p className="mt-1 text-gray-900">{selectedInspection.kontaktdaten}</p>
                </div>
              )}
              
              {selectedInspection.bericht && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Bericht</label>
                  <p className="mt-1 text-gray-900 bg-gray-50 p-4 rounded-lg">
                    {selectedInspection.bericht}
                  </p>
                </div>
              )}
              
              {selectedInspection.bemerkungen && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Bemerkungen</label>
                  <p className="mt-1 text-gray-900 bg-gray-50 p-4 rounded-lg">
                    {selectedInspection.bemerkungen}
                  </p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDelete(selectedInspection.id)}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Löschen
                </button>
                {selectedInspection.status !== 'Erledigt' && (
                  <button
                    onClick={() => handleMarkAsCompleted(selectedInspection.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Als erledigt markieren
                  </button>
                )}
                <button
                  onClick={() => setShowDetailsPopup(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

