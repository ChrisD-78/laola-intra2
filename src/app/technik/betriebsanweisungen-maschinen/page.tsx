'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import {
  getMaschinenBetriebsanweisungen,
  createMaschinenBetriebsanweisung,
  updateMaschinenBetriebsanweisung,
  deleteMaschinenBetriebsanweisung,
  uploadTechnikPdf,
  MaschinenBetriebsanweisungRecord
} from '@/lib/db'

interface MaschinenBA {
  id: string
  name: string
  hersteller?: string
  standort?: string
  anlage?: string
  naechste_pruefung?: string
  bemerkung?: string
  pdf_url?: string
  pdf_name?: string
}

export default function BetriebsanweisungenMaschinen() {
  const { isAdmin, userRole, isLoggedIn } = useAuth()
  const router = useRouter()
  const [eintraege, setEintraege] = useState<MaschinenBA[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoggedIn && !isAdmin && userRole !== 'Technik' && userRole !== 'Teamleiter') {
      router.push('/')
    }
  }, [isLoggedIn, isAdmin, userRole, router])

  if (!isLoggedIn || (!isAdmin && userRole !== 'Technik' && userRole !== 'Teamleiter')) {
    return null
  }

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<MaschinenBA | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const [formData, setFormData] = useState<{
    name: string
    hersteller: string
    standort: string
    anlage: string
    naechste_pruefung: string
    bemerkung: string
    pdfFile: File | null
  }>({
    name: '',
    hersteller: '',
    standort: '',
    anlage: '',
    naechste_pruefung: '',
    bemerkung: '',
    pdfFile: null
  })

  const [editFormData, setEditFormData] = useState<{
    id: string
    name: string
    hersteller: string
    standort: string
    anlage: string
    naechste_pruefung: string
    bemerkung: string
    existingPdfUrl: string
    existingPdfName: string
    pdfFile: File | null
  }>({
    id: '',
    name: '',
    hersteller: '',
    standort: '',
    anlage: '',
    naechste_pruefung: '',
    bemerkung: '',
    existingPdfUrl: '',
    existingPdfName: '',
    pdfFile: null
  })

  const getDueStatusClass = (dueDateString?: string) => {
    if (!dueDateString) return ''
    const dueDate = new Date(dueDateString)
    if (Number.isNaN(dueDate.getTime())) return ''
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffMs = dueDate.getTime() - today.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    if (diffDays < 0) {
      // überfällig
      return 'bg-red-50'
    }
    if (diffDays <= 30) {
      // innerhalb 30 Tage vor Fälligkeit
      return 'bg-yellow-50'
    }
    return ''
  }

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMaschinenBetriebsanweisungen()
        setEintraege(
          data.map((r: MaschinenBetriebsanweisungRecord) => ({
            id: r.id as string,
            name: r.name,
            hersteller: r.hersteller || '',
            standort: r.standort || '',
            anlage: r.anlage || '',
            naechste_pruefung: r.naechste_pruefung || '',
            bemerkung: r.bemerkung || '',
            pdf_url: r.pdf_url || undefined,
            pdf_name: r.pdf_name || undefined
          }))
        )
      } catch (e) {
        console.error('Load maschinen-betriebsanweisungen failed', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      let pdfUrl: string | undefined
      let pdfName: string | undefined
      if (formData.pdfFile) {
        const uploaded = await uploadTechnikPdf(formData.pdfFile)
        pdfUrl = uploaded.publicUrl
        pdfName = formData.pdfFile.name
      }
      await createMaschinenBetriebsanweisung({
        name: formData.name,
        hersteller: formData.hersteller || undefined,
        standort: formData.standort || undefined,
        anlage: formData.anlage || undefined,
        naechste_pruefung: formData.naechste_pruefung || undefined,
        bemerkung: formData.bemerkung || undefined,
        pdf_url: pdfUrl,
        pdf_name: pdfName
      })
      const fresh = await getMaschinenBetriebsanweisungen()
      setEintraege(
        fresh.map((r: MaschinenBetriebsanweisungRecord) => ({
          id: r.id as string,
          name: r.name,
          hersteller: r.hersteller || '',
          standort: r.standort || '',
          anlage: r.anlage || '',
          naechste_pruefung: r.naechste_pruefung || '',
          bemerkung: r.bemerkung || '',
          pdf_url: r.pdf_url || undefined,
          pdf_name: r.pdf_name || undefined
        }))
      )
      setShowCreateModal(false)
      setFormData({
        name: '',
        hersteller: '',
        standort: '',
        anlage: '',
        naechste_pruefung: '',
        bemerkung: '',
        pdfFile: null
      })
    } catch (error) {
      console.error('Failed to create maschinen-betriebsanweisung', error)
      alert('Fehler beim Speichern. Bitte später erneut versuchen.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      let pdfUrl = editFormData.existingPdfUrl
      let pdfName = editFormData.existingPdfName
      if (editFormData.pdfFile) {
        const uploaded = await uploadTechnikPdf(editFormData.pdfFile)
        pdfUrl = uploaded.publicUrl
        pdfName = editFormData.pdfFile.name
      }
      await updateMaschinenBetriebsanweisung(editFormData.id, {
        name: editFormData.name,
        hersteller: editFormData.hersteller || undefined,
        standort: editFormData.standort || undefined,
        anlage: editFormData.anlage || undefined,
        naechste_pruefung: editFormData.naechste_pruefung || undefined,
        bemerkung: editFormData.bemerkung || undefined,
        pdf_url: pdfUrl || undefined,
        pdf_name: pdfName || undefined
      })
      const fresh = await getMaschinenBetriebsanweisungen()
      setEintraege(
        fresh.map((r: MaschinenBetriebsanweisungRecord) => ({
          id: r.id as string,
          name: r.name,
          hersteller: r.hersteller || '',
          standort: r.standort || '',
          anlage: r.anlage || '',
          naechste_pruefung: r.naechste_pruefung || '',
          bemerkung: r.bemerkung || '',
          pdf_url: r.pdf_url || undefined,
          pdf_name: r.pdf_name || undefined
        }))
      )
      setShowEditModal(false)
    } catch (error) {
      console.error('Failed to update maschinen-betriebsanweisung', error)
      alert('Fehler beim Aktualisieren. Bitte später erneut versuchen.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedEntry) return
    try {
      await deleteMaschinenBetriebsanweisung(selectedEntry.id)
      const fresh = await getMaschinenBetriebsanweisungen()
      setEintraege(
        fresh.map((r: MaschinenBetriebsanweisungRecord) => ({
          id: r.id as string,
          name: r.name,
          hersteller: r.hersteller || '',
          standort: r.standort || '',
          anlage: r.anlage || '',
          bemerkung: r.bemerkung || '',
          pdf_url: r.pdf_url || undefined,
          pdf_name: r.pdf_name || undefined
        }))
      )
      setShowDeleteModal(false)
      setSelectedEntry(null)
    } catch (error) {
      console.error('Failed to delete maschinen-betriebsanweisung', error)
      alert('Fehler beim Löschen. Bitte später erneut versuchen.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Betriebsanweisungen Maschinen</h1>
          <p className="text-sm text-gray-600 mt-1">
            Übersicht der Betriebsanweisungen für Maschinen mit hinterlegten PDF-Dokumenten.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          Neue Betriebsanweisung anlegen
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Einträge</h2>
          {loading && <span className="text-xs text-gray-500">Lade Daten…</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Hersteller
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Standort
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Anlage
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Nächste Prüfung
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Bemerkung
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Anlage (PDF)
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {eintraege.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-sm text-gray-500"
                  >
                    Keine Einträge vorhanden.
                  </td>
                </tr>
              ) : (
                eintraege.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`hover:bg-gray-50 ${getDueStatusClass(entry.naechste_pruefung)}`}
                  >
                    <td className="px-4 py-2 text-gray-900">{entry.name}</td>
                    <td className="px-4 py-2 text-gray-900">{entry.hersteller || '-'}</td>
                    <td className="px-4 py-2 text-gray-900">{entry.standort || '-'}</td>
                    <td className="px-4 py-2 text-gray-900">{entry.anlage || '-'}</td>
                    <td className="px-4 py-2 text-gray-900">
                      {entry.naechste_pruefung || '-'}
                    </td>
                    <td className="px-4 py-2 text-gray-900">{entry.bemerkung || '-'}</td>
                    <td className="px-4 py-2">
                      {entry.pdf_url ? (
                        <button
                          onClick={() => window.open(entry.pdf_url, '_blank')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          📄 {entry.pdf_name || 'Anzeigen'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Keine PDF</span>
                      )}
                    </td>
                    <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedEntry(entry)
                          setShowDetailsModal(true)
                        }}
                        className="text-xs text-gray-700 hover:text-gray-900 underline"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEntry(entry)
                          setEditFormData({
                            id: entry.id,
                            name: entry.name,
                            hersteller: entry.hersteller || '',
                            standort: entry.standort || '',
                            anlage: entry.anlage || '',
                            bemerkung: entry.bemerkung || '',
                            existingPdfUrl: entry.pdf_url || '',
                            existingPdfName: entry.pdf_name || '',
                            pdfFile: null
                          })
                          setShowEditModal(true)
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEntry(entry)
                          setShowDeleteModal(true)
                        }}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !formLoading && setShowCreateModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Neue Betriebsanweisung Maschine anlegen
            </h2>
            <form onSubmit={handleCreateSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Hersteller</label>
                  <input
                    type="text"
                    value={formData.hersteller}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, hersteller: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Standort</label>
                  <input
                    type="text"
                    value={formData.standort}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, standort: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Anlage</label>
                <input
                  type="text"
                  value={formData.anlage}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, anlage: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Nächste Prüfung fällig am
                </label>
                <input
                  type="date"
                  value={formData.naechste_pruefung}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      naechste_pruefung: e.target.value
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Bemerkung</label>
                <textarea
                  value={formData.bemerkung}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bemerkung: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Anlage (PDF)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pdfFile: e.target.files?.[0] || null
                    }))
                  }
                  className="block w-full text-xs text-gray-700 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-gray-300 file:bg-gray-50 file:text-xs file:font-medium hover:file:bg-gray-100"
                />
                {formData.pdfFile && (
                  <p className="mt-1 text-[11px] text-gray-500">
                    Ausgewählt: {formData.pdfFile.name}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !formLoading && setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={formLoading}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70"
                  disabled={formLoading}
                >
                  {formLoading ? 'Speichern…' : 'Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !formLoading && setShowEditModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Betriebsanweisung Maschine bearbeiten
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Hersteller</label>
                  <input
                    type="text"
                    value={editFormData.hersteller}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, hersteller: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Standort</label>
                  <input
                    type="text"
                    value={editFormData.standort}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, standort: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Anlage</label>
                <input
                  type="text"
                  value={editFormData.anlage}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, anlage: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Nächste Prüfung fällig am
                </label>
                <input
                  type="date"
                  value={editFormData.naechste_pruefung}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      naechste_pruefung: e.target.value
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Bemerkung</label>
                <textarea
                  value={editFormData.bemerkung}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, bemerkung: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Anlage (PDF)</label>
                {editFormData.existingPdfUrl && (
                  <div className="mb-1 text-xs">
                    Aktuell:&nbsp;
                    <button
                      type="button"
                      onClick={() => window.open(editFormData.existingPdfUrl, '_blank')}
                      className="text-red-600 hover:underline"
                    >
                      📄 {editFormData.existingPdfName || 'Anzeigen'}
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      pdfFile: e.target.files?.[0] || null
                    }))
                  }
                  className="block w-full text-xs text-gray-700 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-gray-300 file:bg-gray-50 file:text-xs file:font-medium hover:file:bg-gray-100"
                />
                {editFormData.pdfFile && (
                  <p className="mt-1 text-[11px] text-gray-500">
                    Neu ausgewählt: {editFormData.pdfFile.name}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !formLoading && setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={formLoading}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70"
                  disabled={formLoading}
                >
                  {formLoading ? 'Speichern…' : 'Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Eintrag löschen
            </h2>
            <p className="text-sm text-gray-700">
              Möchten Sie die Betriebsanweisung{' '}
              <span className="font-semibold">{selectedEntry.name}</span> wirklich löschen?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Details Modal */}
      {showDetailsModal && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowDetailsModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Details – {selectedEntry.name}
            </h2>
            <div className="space-y-2 text-sm text-gray-800">
              <p>
                <span className="font-medium">Hersteller:</span>{' '}
                {selectedEntry.hersteller || '-'}
              </p>
              <p>
                <span className="font-medium">Standort:</span>{' '}
                {selectedEntry.standort || '-'}
              </p>
              <p>
                <span className="font-medium">Anlage:</span>{' '}
                {selectedEntry.anlage || '-'}
              </p>
              <p>
                <span className="font-medium">Bemerkung:</span>{' '}
                {selectedEntry.bemerkung || '-'}
              </p>
              <p>
                <span className="font-medium">Anlage (PDF):</span>{' '}
                {selectedEntry.pdf_url ? (
                  <button
                    type="button"
                    onClick={() => window.open(selectedEntry.pdf_url!, '_blank')}
                    className="text-red-600 hover:underline"
                  >
                    📄 {selectedEntry.pdf_name || 'Anzeigen'}
                  </button>
                ) : (
                  <span>-</span>
                )}
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

