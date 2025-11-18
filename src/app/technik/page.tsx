'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'

interface TechnikInspection {
  id: string
  rubrik: string
  id_nr: string
  name: string
  naechste_pruefung: string
  status: string
}

export default function Technik() {
  const { isAdmin } = useAuth()
  const [inspections, setInspections] = useState<TechnikInspection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInspection, setSelectedInspection] = useState<TechnikInspection | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    // TODO: Daten aus der Datenbank laden, wenn diese erstellt wurde
    // const loadInspections = async () => {
    //   try {
    //     const data = await getTechnikInspections()
    //     setInspections(data)
    //   } catch (e) {
    //     console.error('Load inspections failed', e)
    //   } finally {
    //     setLoading(false)
    //   }
    // }
    // loadInspections()
    
    // Temporär: Leere Liste setzen
    setLoading(false)
  }, [])

  const handleShowDetails = (inspection: TechnikInspection) => {
    setSelectedInspection(inspection)
    setShowDetailsModal(true)
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'offen' || statusLower === 'erledigt') {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          {status}
        </span>
      )
    } else if (statusLower === 'überfällig') {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          {status}
        </span>
      )
    } else {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          {status}
        </span>
      )
    }
  }

  return (
    <div className="space-y-4 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-4 lg:p-8 text-white">
        <h1 className="text-2xl lg:text-4xl font-bold mb-2">
          Technik - Prüfungsübersicht
        </h1>
        <p className="text-sm lg:text-base text-white/90">
          Verwaltung und Übersicht aller technischen Prüfungen
        </p>
      </div>

      {/* Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Prüfungsübersicht</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Lade Daten...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Rubrik
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    ID-NR.
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Nächste Prüfung
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inspections.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center">
                        <span className="text-4xl mb-2">🔧</span>
                        <p className="font-medium">Keine Prüfungen vorhanden</p>
                        <p className="text-xs mt-1">Die Datenbank wird noch erstellt</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  inspections.map((inspection) => (
                    <tr key={inspection.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inspection.rubrik}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {inspection.id_nr}
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                        {inspection.name}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inspection.naechste_pruefung}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(inspection.status)}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleShowDetails(inspection)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Prüfungsdetails</h3>
                  <p className="text-sm text-white/90 mt-1">{selectedInspection.id_nr}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedInspection(null)
                  }}
                  className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rubrik</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg">{selectedInspection.rubrik}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID-NR.</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg">{selectedInspection.id_nr}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg">{selectedInspection.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nächste Prüfung</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg">{selectedInspection.naechste_pruefung}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedInspection.status)}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Weitere Details werden nach Erstellung der Datenbank angezeigt.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

