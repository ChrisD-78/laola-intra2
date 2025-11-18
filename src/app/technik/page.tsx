'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { getTechnikInspections, createTechnikInspection, uploadTechnikPdf, TechnikInspectionRecord } from '@/lib/db'

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
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Neues Prüfgerät anlegen</span>
        </button>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                {selectedInspection.bild_url && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bild (PDF)</label>
                    <a
                      href={selectedInspection.bild_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      📄 {selectedInspection.bild_name || 'Bild anzeigen'}
                    </a>
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
    </div>
  )
}
