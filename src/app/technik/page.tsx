'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { getTechnikInspections, createTechnikInspection, updateTechnikInspection, deleteTechnikInspection, uploadTechnikPdf, TechnikInspectionRecord } from '@/lib/db'

interface TechnikInspection {
  id: string
  rubrik: string
  id_nr: string
  name: string
  standort: string
  bild_url?: string
  bild_name?: string
  letzte_pruefung: string
  interval: string
  naechste_pruefung: string
  bericht_url?: string
  bericht_name?: string
  bemerkungen?: string
  in_betrieb: boolean
  kontaktdaten?: string
  status: string
}

export default function Technik() {
  const { isAdmin } = useAuth()
  const [inspections, setInspections] = useState<TechnikInspection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInspection, setSelectedInspection] = useState<TechnikInspection | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [inspectionToDelete, setInspectionToDelete] = useState<TechnikInspection | null>(null)
  const [editFormData, setEditFormData] = useState({
    id: '',
    rubrik: '',
    id_nr: '',
    name: '',
    standort: '',
    bildFile: null as File | null,
    existingBildUrl: '',
    existingBildName: '',
    letzte_pruefung: '',
    interval: '',
    naechste_pruefung: '',
    berichtFile: null as File | null,
    existingBerichtUrl: '',
    existingBerichtName: '',
    in_betrieb: true,
    kontaktdaten: '',
    bemerkungen: ''
  })
  const [editFormLoading, setEditFormLoading] = useState(false)
  const [showCsvImportModal, setShowCsvImportModal] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvImportLoading, setCsvImportLoading] = useState(false)
  const [csvPreview, setCsvPreview] = useState<Array<Record<string, string>>>([])
  const [formData, setFormData] = useState({
    rubrik: '',
    id_nr: '',
    name: '',
    standort: '',
    bildFile: null as File | null,
    letzte_pruefung: '',
    interval: '',
    naechste_pruefung: '',
    berichtFile: null as File | null,
    in_betrieb: true,
    kontaktdaten: '',
    bemerkungen: ''
  })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const loadInspections = async () => {
      try {
        const data = await getTechnikInspections()
        const mapped: TechnikInspection[] = data.map((r: TechnikInspectionRecord) => ({
          id: r.id as string,
          rubrik: r.rubrik,
          id_nr: r.id_nr,
          name: r.name,
          standort: r.standort,
          bild_url: r.bild_url || undefined,
          bild_name: r.bild_name || undefined,
          letzte_pruefung: r.letzte_pruefung,
          interval: r.interval,
          naechste_pruefung: r.naechste_pruefung,
          bericht_url: r.bericht_url || undefined,
          bericht_name: r.bericht_name || undefined,
          bemerkungen: r.bemerkungen || undefined,
          in_betrieb: r.in_betrieb,
          kontaktdaten: r.kontaktdaten || undefined,
          status: r.status
        }))
        setInspections(mapped)
      } catch (e) {
        console.error('Load inspections failed', e)
      } finally {
        setLoading(false)
      }
    }
    loadInspections()
  }, [])

  const handleShowDetails = (inspection: TechnikInspection) => {
    setSelectedInspection(inspection)
    setShowDetailsModal(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditFormLoading(true)

    try {
      let bildUrl = editFormData.existingBildUrl
      let bildName = editFormData.existingBildName
      let berichtUrl = editFormData.existingBerichtUrl
      let berichtName = editFormData.existingBerichtName

      // Upload new Bild PDF if provided
      if (editFormData.bildFile) {
        const bildResult = await uploadTechnikPdf(editFormData.bildFile)
        bildUrl = bildResult.publicUrl
        bildName = editFormData.bildFile.name
      }

      // Upload new Bericht PDF if provided
      if (editFormData.berichtFile) {
        const berichtResult = await uploadTechnikPdf(editFormData.berichtFile)
        berichtUrl = berichtResult.publicUrl
        berichtName = editFormData.berichtFile.name
      }

      // Determine status based on in_betrieb
      const status = editFormData.in_betrieb ? 'In Betrieb' : 'Außer Betrieb'

      // Update inspection
      await updateTechnikInspection(editFormData.id, {
        rubrik: editFormData.rubrik,
        id_nr: editFormData.id_nr,
        name: editFormData.name,
        standort: editFormData.standort,
        bild_url: bildUrl || undefined,
        bild_name: bildName || undefined,
        letzte_pruefung: editFormData.letzte_pruefung,
        interval: editFormData.interval,
        naechste_pruefung: editFormData.naechste_pruefung,
        bericht_url: berichtUrl || undefined,
        bericht_name: berichtName || undefined,
        in_betrieb: editFormData.in_betrieb,
        kontaktdaten: editFormData.kontaktdaten || undefined,
        bemerkungen: editFormData.bemerkungen || undefined,
        status
      })

      // Reload inspections
      const data = await getTechnikInspections()
      const mapped: TechnikInspection[] = data.map((r: TechnikInspectionRecord) => ({
        id: r.id as string,
        rubrik: r.rubrik,
        id_nr: r.id_nr,
        name: r.name,
        standort: r.standort,
        bild_url: r.bild_url || undefined,
        bild_name: r.bild_name || undefined,
        letzte_pruefung: r.letzte_pruefung,
        interval: r.interval,
        naechste_pruefung: r.naechste_pruefung,
        bericht_url: r.bericht_url || undefined,
        bericht_name: r.bericht_name || undefined,
        bemerkungen: r.bemerkungen || undefined,
        in_betrieb: r.in_betrieb,
        kontaktdaten: r.kontaktdaten || undefined,
        status: r.status
      }))
      setInspections(mapped)

      // Close modal
      setShowEditModal(false)
    } catch (error) {
      console.error('Failed to update inspection:', error)
      alert('Fehler beim Aktualisieren der Prüfung. Bitte versuchen Sie es erneut.')
    } finally {
      setEditFormLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!inspectionToDelete) return

    try {
      await deleteTechnikInspection(inspectionToDelete.id)
      
      // Reload inspections
      const data = await getTechnikInspections()
      const mapped: TechnikInspection[] = data.map((r: TechnikInspectionRecord) => ({
        id: r.id as string,
        rubrik: r.rubrik,
        id_nr: r.id_nr,
        name: r.name,
        standort: r.standort,
        bild_url: r.bild_url || undefined,
        bild_name: r.bild_name || undefined,
        letzte_pruefung: r.letzte_pruefung,
        interval: r.interval,
        naechste_pruefung: r.naechste_pruefung,
        bericht_url: r.bericht_url || undefined,
        bericht_name: r.bericht_name || undefined,
        bemerkungen: r.bemerkungen || undefined,
        in_betrieb: r.in_betrieb,
        kontaktdaten: r.kontaktdaten || undefined,
        status: r.status
      }))
      setInspections(mapped)

      setShowDeleteModal(false)
      setInspectionToDelete(null)
    } catch (error) {
      console.error('Failed to delete inspection:', error)
      alert('Fehler beim Löschen der Prüfung. Bitte versuchen Sie es erneut.')
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      let bildUrl: string | undefined
      let bildName: string | undefined
      let berichtUrl: string | undefined
      let berichtName: string | undefined

      // Upload Bild PDF if provided
      if (formData.bildFile) {
        const bildResult = await uploadTechnikPdf(formData.bildFile)
        bildUrl = bildResult.publicUrl
        bildName = formData.bildFile.name
      }

      // Upload Bericht PDF if provided
      if (formData.berichtFile) {
        const berichtResult = await uploadTechnikPdf(formData.berichtFile)
        berichtUrl = berichtResult.publicUrl
        berichtName = formData.berichtFile.name
      }

      // Determine status based on in_betrieb
      const status = formData.in_betrieb ? 'In Betrieb' : 'Außer Betrieb'

      // Create inspection
      const newInspection = await createTechnikInspection({
        rubrik: formData.rubrik,
        id_nr: formData.id_nr,
        name: formData.name,
        standort: formData.standort,
        bild_url: bildUrl,
        bild_name: bildName,
        letzte_pruefung: formData.letzte_pruefung,
        interval: formData.interval,
        naechste_pruefung: formData.naechste_pruefung,
        bericht_url: berichtUrl,
        bericht_name: berichtName,
        in_betrieb: formData.in_betrieb,
        kontaktdaten: formData.kontaktdaten || undefined,
        bemerkungen: formData.bemerkungen || undefined,
        status
      })

      // Reload inspections
      const data = await getTechnikInspections()
      const mapped: TechnikInspection[] = data.map((r: TechnikInspectionRecord) => ({
        id: r.id as string,
        rubrik: r.rubrik,
        id_nr: r.id_nr,
        name: r.name,
        standort: r.standort,
        bild_url: r.bild_url || undefined,
        bild_name: r.bild_name || undefined,
        letzte_pruefung: r.letzte_pruefung,
        interval: r.interval,
        naechste_pruefung: r.naechste_pruefung,
        bericht_url: r.bericht_url || undefined,
        bericht_name: r.bericht_name || undefined,
        bemerkungen: r.bemerkungen || undefined,
        in_betrieb: r.in_betrieb,
        kontaktdaten: r.kontaktdaten || undefined,
        status: r.status
      }))
      setInspections(mapped)

      // Reset form and close modal
      setFormData({
        rubrik: '',
        id_nr: '',
        name: '',
        standort: '',
        bildFile: null,
        letzte_pruefung: '',
        interval: '',
        naechste_pruefung: '',
        berichtFile: null,
        in_betrieb: true,
        kontaktdaten: '',
        bemerkungen: ''
      })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create inspection:', error)
      alert('Fehler beim Erstellen der Prüfung. Bitte versuchen Sie es erneut.')
    } finally {
      setFormLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'offen' || statusLower === 'erledigt' || statusLower === 'in betrieb') {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          {status}
        </span>
      )
    } else if (statusLower === 'überfällig' || statusLower === 'außer betrieb') {
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-4 lg:p-8 text-white text-center">
        <h1 className="text-2xl lg:text-4xl font-bold mb-2">
          Technik - Prüfungsübersicht
        </h1>
        <p className="text-sm lg:text-base text-white/90">
          Verwaltung und Übersicht aller technischen Prüfungen
        </p>
      </div>

      {/* Create Button */}
      <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <span>➕</span>
            <span>Neues Prüfgerät anlegen</span>
          </button>
          <button
            onClick={() => setShowCsvImportModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <span>📥</span>
            <span>CSV Import</span>
          </button>
        </div>
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
                        <p className="text-xs mt-1">Klicken Sie auf "Neues Prüfgerät anlegen" um eine Prüfung zu erstellen</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  inspections.map((inspection) => (
                    <tr key={inspection.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inspection.rubrik || '-'}
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleShowDetails(inspection)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => {
                              setEditFormData({
                                id: inspection.id,
                                rubrik: inspection.rubrik,
                                id_nr: inspection.id_nr,
                                name: inspection.name,
                                standort: inspection.standort,
                                bildFile: null,
                                existingBildUrl: inspection.bild_url || '',
                                existingBildName: inspection.bild_name || '',
                                letzte_pruefung: inspection.letzte_pruefung,
                                interval: inspection.interval,
                                naechste_pruefung: inspection.naechste_pruefung,
                                berichtFile: null,
                                existingBerichtUrl: inspection.bericht_url || '',
                                existingBerichtName: inspection.bericht_name || '',
                                in_betrieb: inspection.in_betrieb,
                                kontaktdaten: inspection.kontaktdaten || '',
                                bemerkungen: inspection.bemerkungen || ''
                              })
                              setShowEditModal(true)
                            }}
                            className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-xs font-medium"
                            title="Bearbeiten"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              setInspectionToDelete(inspection)
                              setShowDeleteModal(true)
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
                            title="Löschen"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Neues Prüfgerät anlegen</h3>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({
                      rubrik: '',
                      id_nr: '',
                      name: '',
                      standort: '',
                      bildFile: null,
                      letzte_pruefung: '',
                      interval: '',
                      naechste_pruefung: '',
                      berichtFile: null,
                      in_betrieb: true,
                      kontaktdaten: '',
                      bemerkungen: ''
                    })
                  }}
                  className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {/* Bild PDF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bild (Als PDF) hinterlegen
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFormData({ ...formData, bildFile: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                {formData.bildFile && (
                  <p className="mt-1 text-sm text-gray-600">Ausgewählt: {formData.bildFile.name}</p>
                )}
              </div>

              {/* Rubrik */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rubrik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.rubrik}
                  onChange={(e) => setFormData({ ...formData, rubrik: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="z.B. Messgeräte, Wartungen, Prüfungen"
                />
              </div>

              {/* ID-Nr. */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID-Nr. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.id_nr}
                  onChange={(e) => setFormData({ ...formData, id_nr: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="z.B. M-001"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Name/Bezeichnung des Geräts"
                />
              </div>

              {/* Standort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standort <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.standort}
                  onChange={(e) => setFormData({ ...formData, standort: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Standort des Geräts"
                />
              </div>

              {/* Letzte Prüfung */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Letzte Prüfung <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.letzte_pruefung}
                  onChange={(e) => setFormData({ ...formData, letzte_pruefung: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="z.B. 01.01.2024"
                />
              </div>

              {/* Intervall */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intervall <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.interval}
                  onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Bitte wählen</option>
                  <option value="Täglich">Täglich</option>
                  <option value="Wöchentlich">Wöchentlich</option>
                  <option value="Monatlich">Monatlich</option>
                  <option value="Vierteljährlich">Vierteljährlich</option>
                  <option value="Halbjährlich">Halbjährlich</option>
                  <option value="Jährlich">Jährlich</option>
                </select>
              </div>

              {/* Nächste Prüfung */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nächste Prüfung <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.naechste_pruefung}
                  onChange={(e) => setFormData({ ...formData, naechste_pruefung: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="z.B. 01.01.2025"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.in_betrieb ? 'In Betrieb' : 'Außer Betrieb'}
                  onChange={(e) => setFormData({ ...formData, in_betrieb: e.target.value === 'In Betrieb' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="In Betrieb">In Betrieb</option>
                  <option value="Außer Betrieb">Außer Betrieb</option>
                </select>
              </div>

              {/* Kontaktdaten */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kontaktdaten
                </label>
                <textarea
                  value={formData.kontaktdaten}
                  onChange={(e) => setFormData({ ...formData, kontaktdaten: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  rows={3}
                  placeholder="Kontaktinformationen"
                />
              </div>

              {/* Bericht PDF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bericht (Als PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFormData({ ...formData, berichtFile: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                {formData.berichtFile && (
                  <p className="mt-1 text-sm text-gray-600">Ausgewählt: {formData.berichtFile.name}</p>
                )}
              </div>

              {/* Bemerkungen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bemerkungen
                </label>
                <textarea
                  value={formData.bemerkungen}
                  onChange={(e) => setFormData({ ...formData, bemerkungen: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  rows={3}
                  placeholder="Zusätzliche Bemerkungen"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({
                      rubrik: '',
                      id_nr: '',
                      name: '',
                      standort: '',
                      bildFile: null,
                      letzte_pruefung: '',
                      interval: '',
                      naechste_pruefung: '',
                      berichtFile: null,
                      in_betrieb: true,
                      kontaktdaten: '',
                      bemerkungen: ''
                    })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-wait"
                >
                  {formLoading ? 'Speichern...' : '💾 Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              {/* Bild direkt anzeigen */}
              {selectedInspection.bild_url && (
                <div className="w-full mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bild</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    <iframe
                      src={selectedInspection.bild_url}
                      className="w-full h-96"
                      title="Bild PDF"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    {selectedInspection.bild_name || 'Bild PDF'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rubrik</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg">
                    {selectedInspection.rubrik || 'Nicht angegeben'}
                  </p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Standort</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg">{selectedInspection.standort}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Letzte Prüfung</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg">{selectedInspection.letzte_pruefung}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Intervall</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg">{selectedInspection.interval}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nächste Prüfung</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg">{selectedInspection.naechste_pruefung}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedInspection.status)}</div>
                </div>
                {selectedInspection.kontaktdaten && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kontaktdaten</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg whitespace-pre-line">
                      {selectedInspection.kontaktdaten}
                    </p>
                  </div>
                )}
                {selectedInspection.bemerkungen && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bemerkungen</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg whitespace-pre-line">
                      {selectedInspection.bemerkungen}
                    </p>
                  </div>
                )}
                {selectedInspection.bericht_url && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bericht (PDF)</label>
                    <a
                      href={selectedInspection.bericht_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      📄 {selectedInspection.bericht_name || 'Bericht anzeigen'}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Prüfgerät bearbeiten</h3>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {/* Bild PDF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bild (Als PDF) hinterlegen
                </label>
                {editFormData.existingBildUrl && (
                  <p className="text-xs text-gray-600 mb-2">
                    Aktuelles Bild: {editFormData.existingBildName || 'Vorhanden'}
                  </p>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setEditFormData({ ...editFormData, bildFile: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                {editFormData.bildFile && (
                  <p className="mt-1 text-sm text-gray-600">Neues Bild ausgewählt: {editFormData.bildFile.name}</p>
                )}
              </div>

              {/* Rubrik */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rubrik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.rubrik}
                  onChange={(e) => setEditFormData({ ...editFormData, rubrik: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="z.B. Messgeräte, Wartungen, Prüfungen"
                />
              </div>

              {/* ID-Nr. */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID-Nr. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.id_nr}
                  onChange={(e) => setEditFormData({ ...editFormData, id_nr: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="z.B. M-001"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Name/Bezeichnung des Geräts"
                />
              </div>

              {/* Standort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standort <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.standort}
                  onChange={(e) => setEditFormData({ ...editFormData, standort: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Standort des Geräts"
                />
              </div>

              {/* Letzte Prüfung */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Letzte Prüfung <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.letzte_pruefung}
                  onChange={(e) => setEditFormData({ ...editFormData, letzte_pruefung: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="z.B. 01.01.2024"
                />
              </div>

              {/* Intervall */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intervall <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={editFormData.interval}
                  onChange={(e) => setEditFormData({ ...editFormData, interval: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Bitte wählen</option>
                  <option value="Täglich">Täglich</option>
                  <option value="Wöchentlich">Wöchentlich</option>
                  <option value="Monatlich">Monatlich</option>
                  <option value="Vierteljährlich">Vierteljährlich</option>
                  <option value="Halbjährlich">Halbjährlich</option>
                  <option value="Jährlich">Jährlich</option>
                </select>
              </div>

              {/* Nächste Prüfung */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nächste Prüfung <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.naechste_pruefung}
                  onChange={(e) => setEditFormData({ ...editFormData, naechste_pruefung: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="z.B. 01.01.2025"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={editFormData.in_betrieb ? 'In Betrieb' : 'Außer Betrieb'}
                  onChange={(e) => setEditFormData({ ...editFormData, in_betrieb: e.target.value === 'In Betrieb' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="In Betrieb">In Betrieb</option>
                  <option value="Außer Betrieb">Außer Betrieb</option>
                </select>
              </div>

              {/* Kontaktdaten */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kontaktdaten
                </label>
                <textarea
                  value={editFormData.kontaktdaten}
                  onChange={(e) => setEditFormData({ ...editFormData, kontaktdaten: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  rows={3}
                  placeholder="Kontaktinformationen"
                />
              </div>

              {/* Bericht PDF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bericht (Als PDF)
                </label>
                {editFormData.existingBerichtUrl && (
                  <p className="text-xs text-gray-600 mb-2">
                    Aktueller Bericht: {editFormData.existingBerichtName || 'Vorhanden'}
                  </p>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setEditFormData({ ...editFormData, berichtFile: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                {editFormData.berichtFile && (
                  <p className="mt-1 text-sm text-gray-600">Neuer Bericht ausgewählt: {editFormData.berichtFile.name}</p>
                )}
              </div>

              {/* Bemerkungen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bemerkungen
                </label>
                <textarea
                  value={editFormData.bemerkungen}
                  onChange={(e) => setEditFormData({ ...editFormData, bemerkungen: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  rows={3}
                  placeholder="Zusätzliche Bemerkungen"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={editFormLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-wait"
                >
                  {editFormLoading ? 'Speichern...' : '💾 Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && inspectionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-red-600 mb-4">
                ⚠️ Prüfgerät löschen
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Möchten Sie das Prüfgerät <strong>{inspectionToDelete.name}</strong> (ID: {inspectionToDelete.id_nr}) wirklich löschen?
              </p>
              <p className="text-xs text-red-600 mb-6">
                Diese Aktion kann nicht rückgängig gemacht werden!
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Ja, löschen
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setInspectionToDelete(null)
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCsvImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">CSV Import</h3>
                  <p className="text-sm text-white/90 mt-1">Importieren Sie mehrere Prüfgeräte auf einmal</p>
                </div>
                <button
                  onClick={() => {
                    setShowCsvImportModal(false)
                    setCsvFile(null)
                    setCsvPreview([])
                  }}
                  className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* CSV File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSV-Datei auswählen
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setCsvFile(file)
                      // Parse CSV and show preview
                      const text = await file.text()
                      const lines = text.split('\n').filter(line => line.trim())
                      if (lines.length > 0) {
                        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
                        const rows = lines.slice(1).map(line => {
                          const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
                          const row: Record<string, string> = {}
                          headers.forEach((header, index) => {
                            row[header] = values[index] || ''
                          })
                          return row
                        })
                        setCsvPreview(rows.slice(0, 10)) // Show first 10 rows as preview
                      }
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                />
                {csvFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Ausgewählt: {csvFile.name}
                  </p>
                )}
              </div>

              {/* CSV Format Info */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-700 font-medium mb-2">Erwartetes CSV-Format:</p>
                <p className="text-xs text-blue-600 mb-2">
                  Die CSV-Datei sollte folgende Spalten enthalten (Trennzeichen: Komma):
                </p>
                <ul className="text-xs text-blue-600 list-disc list-inside space-y-1">
                  <li><strong>rubrik</strong> (Optional) - z.B. "Messgeräte" (Standard: "Messgeräte")</li>
                  <li><strong>id_nr</strong> (Optional) - z.B. "M-001" (wird automatisch generiert falls leer)</li>
                  <li><strong>name</strong> (Optional) - Name des Geräts (Standard: "Unbenanntes Gerät")</li>
                  <li><strong>standort</strong> (Optional) - Standort (Standard: "Nicht angegeben")</li>
                  <li><strong>letzte_pruefung</strong> (Optional) - z.B. "01.01.2024" (Standard: heutiges Datum)</li>
                  <li><strong>interval</strong> (Optional) - z.B. "Jährlich", "Monatlich" (Standard: "Jährlich")</li>
                  <li><strong>naechste_pruefung</strong> (Optional) - z.B. "01.01.2025" (Standard: in 1 Jahr)</li>
                  <li><strong>in_betrieb</strong> (Optional) - "true" oder "false" (Standard: "true")</li>
                  <li><strong>kontaktdaten</strong> (Optional) - Kontaktinformationen</li>
                  <li><strong>bemerkungen</strong> (Optional) - Zusätzliche Bemerkungen</li>
                  <li><strong>status</strong> (Optional) - "Offen", "Überfällig", "Erledigt" (Standard: "Offen")</li>
                </ul>
                <p className="text-xs text-blue-600 mt-2 font-medium">
                  Alle Felder sind optional. Fehlende Felder werden mit Standardwerten befüllt.
                </p>
              </div>

              {/* Preview */}
              {csvPreview.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vorschau (erste {csvPreview.length} Zeilen)
                  </label>
                  <div className="overflow-x-auto border border-gray-300 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(csvPreview[0] || {}).map((header) => (
                            <th key={header} className="px-2 py-2 text-left font-medium text-gray-700">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {csvPreview.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, cellIndex) => (
                              <td key={cellIndex} className="px-2 py-2 text-gray-900">
                                {value || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import Button */}
              {csvFile && csvPreview.length > 0 && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCsvImportModal(false)
                      setCsvFile(null)
                      setCsvPreview([])
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={async () => {
                      if (!csvFile) return
                      setCsvImportLoading(true)
                      
                      try {
                        const text = await csvFile.text()
                        const lines = text.split('\n').filter(line => line.trim())
                        if (lines.length < 2) {
                          alert('CSV-Datei ist leer oder enthält keine Daten.')
                          setCsvImportLoading(false)
                          return
                        }

                        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
                        const rows = lines.slice(1).map(line => {
                          const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
                          const row: Record<string, string> = {}
                          headers.forEach((header, index) => {
                            row[header] = values[index] || ''
                          })
                          return row
                        })

                        let successCount = 0
                        let errorCount = 0
                        const errors: string[] = []

                        for (const row of rows) {
                          try {
                            // Set default values for missing fields
                            const rubrik = row.rubrik || 'Messgeräte'
                            const id_nr = row.id_nr || `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                            const name = row.name || 'Unbenanntes Gerät'
                            const standort = row.standort || 'Nicht angegeben'
                            const letzte_pruefung = row.letzte_pruefung || new Date().toLocaleDateString('de-DE')
                            const interval = row.interval || 'Jährlich'
                            const naechste_pruefung = row.naechste_pruefung || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE')

                            // Parse in_betrieb
                            const inBetrieb = row.in_betrieb === 'false' ? false : true

                            // Determine status
                            const status = row.status || 'Offen'

                            // Create inspection
                            await createTechnikInspection({
                              rubrik: rubrik,
                              id_nr: id_nr,
                              name: name,
                              standort: standort,
                              bild_url: undefined,
                              bild_name: undefined,
                              letzte_pruefung: letzte_pruefung,
                              interval: interval,
                              naechste_pruefung: naechste_pruefung,
                              bericht_url: undefined,
                              bericht_name: undefined,
                              in_betrieb: inBetrieb,
                              kontaktdaten: row.kontaktdaten || undefined,
                              bemerkungen: row.bemerkungen || undefined,
                              status
                            })

                            successCount++
                          } catch (error) {
                            console.error('Error importing row:', error)
                            errors.push(`Zeile mit ID ${row.id_nr || 'unbekannt'}: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`)
                            errorCount++
                          }
                        }

                        // Reload inspections
                        const data = await getTechnikInspections()
                        const mapped: TechnikInspection[] = data.map((r: TechnikInspectionRecord) => ({
                          id: r.id as string,
                          rubrik: r.rubrik,
                          id_nr: r.id_nr,
                          name: r.name,
                          standort: r.standort,
                          bild_url: r.bild_url || undefined,
                          bild_name: r.bild_name || undefined,
                          letzte_pruefung: r.letzte_pruefung,
                          interval: r.interval,
                          naechste_pruefung: r.naechste_pruefung,
                          bericht_url: r.bericht_url || undefined,
                          bericht_name: r.bericht_name || undefined,
                          bemerkungen: r.bemerkungen || undefined,
                          in_betrieb: r.in_betrieb,
                          kontaktdaten: r.kontaktdaten || undefined,
                          status: r.status
                        }))
                        setInspections(mapped)

                        // Show results
                        let message = `Import abgeschlossen!\n\nErfolgreich: ${successCount}\nFehler: ${errorCount}`
                        if (errors.length > 0 && errors.length <= 10) {
                          message += `\n\nFehlerdetails:\n${errors.join('\n')}`
                        } else if (errors.length > 10) {
                          message += `\n\nErste 10 Fehler:\n${errors.slice(0, 10).join('\n')}`
                        }
                        alert(message)

                        // Close modal
                        setShowCsvImportModal(false)
                        setCsvFile(null)
                        setCsvPreview([])
                      } catch (error) {
                        console.error('Failed to import CSV:', error)
                        alert('Fehler beim Importieren der CSV-Datei. Bitte überprüfen Sie das Format.')
                      } finally {
                        setCsvImportLoading(false)
                      }
                    }}
                    disabled={csvImportLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-wait"
                  >
                    {csvImportLoading ? 'Importiere...' : '📥 Importieren'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
