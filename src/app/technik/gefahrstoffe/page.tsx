'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { getGefahrstoffe, createGefahrstoff, updateGefahrstoff, deleteGefahrstoff, uploadTechnikPdf, GefahrstoffRecord } from '@/lib/db'
import Link from 'next/link'

interface Gefahrstoff {
  id: string
  name: string
  gefahrstoffsymbole?: string
  info?: string
  bemerkung?: string
  sicherheitsdatenblatt_url?: string
  sicherheitsdatenblatt_name?: string
  betriebsanweisung_laola_url?: string
  betriebsanweisung_laola_name?: string
  betriebsanweisung_freibad_url?: string
  betriebsanweisung_freibad_name?: string
  wassergefaehrdungsklasse?: string
  verbrauch_jahresmenge?: string
  substitution_geprueft_ergebnis?: string
}

export default function Gefahrstoffe() {
  const { isAdmin } = useAuth()
  const [gefahrstoffe, setGefahrstoffe] = useState<Gefahrstoff[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGefahrstoff, setSelectedGefahrstoff] = useState<Gefahrstoff | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [gefahrstoffToDelete, setGefahrstoffToDelete] = useState<Gefahrstoff | null>(null)
  const [sortColumn, setSortColumn] = useState<'name' | 'wassergefaehrdungsklasse' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    gefahrstoffsymbole: '',
    info: '',
    bemerkung: '',
    sicherheitsdatenblattFile: null as File | null,
    existingSicherheitsdatenblattUrl: '',
    existingSicherheitsdatenblattName: '',
    betriebsanweisungLaolaFile: null as File | null,
    existingBetriebsanweisungLaolaUrl: '',
    existingBetriebsanweisungLaolaName: '',
    betriebsanweisungFreibadFile: null as File | null,
    existingBetriebsanweisungFreibadUrl: '',
    existingBetriebsanweisungFreibadName: '',
    wassergefaehrdungsklasse: '',
    verbrauch_jahresmenge: '',
    substitution_geprueft_ergebnis: ''
  })
  const [editFormLoading, setEditFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    gefahrstoffsymbole: '',
    info: '',
    bemerkung: '',
    sicherheitsdatenblattFile: null as File | null,
    betriebsanweisungLaolaFile: null as File | null,
    betriebsanweisungFreibadFile: null as File | null,
    wassergefaehrdungsklasse: '',
    verbrauch_jahresmenge: '',
    substitution_geprueft_ergebnis: ''
  })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const loadGefahrstoffe = async () => {
      try {
        const data = await getGefahrstoffe()
        setGefahrstoffe(data as Gefahrstoff[])
      } catch (e) {
        console.error('Load gefahrstoffe failed', e)
      } finally {
        setLoading(false)
      }
    }
    loadGefahrstoffe()
  }, [])

  const handleShowDetails = (gefahrstoff: Gefahrstoff) => {
    setSelectedGefahrstoff(gefahrstoff)
    setShowDetailsModal(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditFormLoading(true)

    try {
      let sicherheitsdatenblattUrl = editFormData.existingSicherheitsdatenblattUrl
      let sicherheitsdatenblattName = editFormData.existingSicherheitsdatenblattName
      let betriebsanweisungLaolaUrl = editFormData.existingBetriebsanweisungLaolaUrl
      let betriebsanweisungLaolaName = editFormData.existingBetriebsanweisungLaolaName
      let betriebsanweisungFreibadUrl = editFormData.existingBetriebsanweisungFreibadUrl
      let betriebsanweisungFreibadName = editFormData.existingBetriebsanweisungFreibadName

      // Upload new PDFs if provided
      if (editFormData.sicherheitsdatenblattFile) {
        const result = await uploadTechnikPdf(editFormData.sicherheitsdatenblattFile)
        sicherheitsdatenblattUrl = result.publicUrl
        sicherheitsdatenblattName = editFormData.sicherheitsdatenblattFile.name
      }

      if (editFormData.betriebsanweisungLaolaFile) {
        const result = await uploadTechnikPdf(editFormData.betriebsanweisungLaolaFile)
        betriebsanweisungLaolaUrl = result.publicUrl
        betriebsanweisungLaolaName = editFormData.betriebsanweisungLaolaFile.name
      }

      if (editFormData.betriebsanweisungFreibadFile) {
        const result = await uploadTechnikPdf(editFormData.betriebsanweisungFreibadFile)
        betriebsanweisungFreibadUrl = result.publicUrl
        betriebsanweisungFreibadName = editFormData.betriebsanweisungFreibadFile.name
      }

      // Update gefahrstoff
      await updateGefahrstoff(editFormData.id, {
        name: editFormData.name,
        gefahrstoffsymbole: editFormData.gefahrstoffsymbole || undefined,
        info: editFormData.info || undefined,
        bemerkung: editFormData.bemerkung || undefined,
        sicherheitsdatenblatt_url: sicherheitsdatenblattUrl || undefined,
        sicherheitsdatenblatt_name: sicherheitsdatenblattName || undefined,
        betriebsanweisung_laola_url: betriebsanweisungLaolaUrl || undefined,
        betriebsanweisung_laola_name: betriebsanweisungLaolaName || undefined,
        betriebsanweisung_freibad_url: betriebsanweisungFreibadUrl || undefined,
        betriebsanweisung_freibad_name: betriebsanweisungFreibadName || undefined,
        wassergefaehrdungsklasse: editFormData.wassergefaehrdungsklasse || undefined,
        verbrauch_jahresmenge: editFormData.verbrauch_jahresmenge || undefined,
        substitution_geprueft_ergebnis: editFormData.substitution_geprueft_ergebnis || undefined
      })

      // Reload gefahrstoffe
      const data = await getGefahrstoffe()
      setGefahrstoffe(data as Gefahrstoff[])

      // Close modal
      setShowEditModal(false)
    } catch (error) {
      console.error('Failed to update gefahrstoff:', error)
      alert('Fehler beim Aktualisieren des Gefahrstoffs. Bitte versuchen Sie es erneut.')
    } finally {
      setEditFormLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!gefahrstoffToDelete) return

    try {
      await deleteGefahrstoff(gefahrstoffToDelete.id)
      
      // Reload gefahrstoffe
      const data = await getGefahrstoffe()
      setGefahrstoffe(data as Gefahrstoff[])

      setShowDeleteModal(false)
      setGefahrstoffToDelete(null)
    } catch (error) {
      console.error('Failed to delete gefahrstoff:', error)
      alert('Fehler beim Löschen des Gefahrstoffs. Bitte versuchen Sie es erneut.')
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      let sicherheitsdatenblattUrl: string | undefined
      let sicherheitsdatenblattName: string | undefined
      let betriebsanweisungLaolaUrl: string | undefined
      let betriebsanweisungLaolaName: string | undefined
      let betriebsanweisungFreibadUrl: string | undefined
      let betriebsanweisungFreibadName: string | undefined

      // Upload PDFs if provided
      if (formData.sicherheitsdatenblattFile) {
        const result = await uploadTechnikPdf(formData.sicherheitsdatenblattFile)
        sicherheitsdatenblattUrl = result.publicUrl
        sicherheitsdatenblattName = formData.sicherheitsdatenblattFile.name
      }

      if (formData.betriebsanweisungLaolaFile) {
        const result = await uploadTechnikPdf(formData.betriebsanweisungLaolaFile)
        betriebsanweisungLaolaUrl = result.publicUrl
        betriebsanweisungLaolaName = formData.betriebsanweisungLaolaFile.name
      }

      if (formData.betriebsanweisungFreibadFile) {
        const result = await uploadTechnikPdf(formData.betriebsanweisungFreibadFile)
        betriebsanweisungFreibadUrl = result.publicUrl
        betriebsanweisungFreibadName = formData.betriebsanweisungFreibadFile.name
      }

      // Create gefahrstoff
      await createGefahrstoff({
        name: formData.name,
        gefahrstoffsymbole: formData.gefahrstoffsymbole || undefined,
        info: formData.info || undefined,
        bemerkung: formData.bemerkung || undefined,
        sicherheitsdatenblatt_url: sicherheitsdatenblattUrl,
        sicherheitsdatenblatt_name: sicherheitsdatenblattName,
        betriebsanweisung_laola_url: betriebsanweisungLaolaUrl,
        betriebsanweisung_laola_name: betriebsanweisungLaolaName,
        betriebsanweisung_freibad_url: betriebsanweisungFreibadUrl,
        betriebsanweisung_freibad_name: betriebsanweisungFreibadName,
        wassergefaehrdungsklasse: formData.wassergefaehrdungsklasse || undefined,
        verbrauch_jahresmenge: formData.verbrauch_jahresmenge || undefined,
        substitution_geprueft_ergebnis: formData.substitution_geprueft_ergebnis || undefined
      })

      // Reload gefahrstoffe
      const data = await getGefahrstoffe()
      setGefahrstoffe(data as Gefahrstoff[])

      // Reset form and close modal
      setFormData({
        name: '',
        gefahrstoffsymbole: '',
        info: '',
        bemerkung: '',
        sicherheitsdatenblattFile: null,
        betriebsanweisungLaolaFile: null,
        betriebsanweisungFreibadFile: null,
        wassergefaehrdungsklasse: '',
        verbrauch_jahresmenge: '',
        substitution_geprueft_ergebnis: ''
      })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create gefahrstoff:', error)
      alert('Fehler beim Erstellen des Gefahrstoffs. Bitte versuchen Sie es erneut.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleSort = (column: 'name' | 'wassergefaehrdungsklasse') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const getSortedGefahrstoffe = () => {
    if (!sortColumn) return gefahrstoffe

    return [...gefahrstoffe].sort((a, b) => {
      let aValue = a[sortColumn] || ''
      let bValue = b[sortColumn] || ''

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  const getSortIcon = (column: 'name' | 'wassergefaehrdungsklasse') => {
    if (sortColumn !== column) {
      return <span className="text-gray-400 ml-1">⇅</span>
    }
    return sortDirection === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>
  }

  // GHS-Piktogramme Definition - Verwendung der offiziellen SVG-Dateien
  const ghsPiktogramme = [
    { code: 'GHS01', name: 'Explodierende Bombe', imagePath: '/ghs-piktogramme/ghs01.svg' },
    { code: 'GHS02', name: 'Flamme', imagePath: '/ghs-piktogramme/ghs02.svg' },
    { code: 'GHS03', name: 'Flamme über Kreis', imagePath: '/ghs-piktogramme/ghs03.svg' },
    { code: 'GHS04', name: 'Gasflasche', imagePath: '/ghs-piktogramme/ghs04.svg' },
    { code: 'GHS05', name: 'Ätzwirkung', imagePath: '/ghs-piktogramme/ghs05.svg' },
    { code: 'GHS06', name: 'Totenkopf mit gekreuzten Knochen', imagePath: '/ghs-piktogramme/ghs06.svg' },
    { code: 'GHS07', name: 'Ausrufezeichen', imagePath: '/ghs-piktogramme/ghs07.svg' },
    { code: 'GHS08', name: 'Gesundheitsgefahr', imagePath: '/ghs-piktogramme/ghs08.svg' },
    { code: 'GHS09', name: 'Umwelt', imagePath: '/ghs-piktogramme/ghs09.svg' }
  ]

  const getGhsPiktogramm = (code: string) => {
    return ghsPiktogramme.find(p => p.code === code.trim())
  }

  const renderGefahrstoffsymbole = (symbole?: string) => {
    if (!symbole) return <span className="text-gray-400">—</span>
    const codes = symbole.split(',').map(s => s.trim()).filter(s => s)
    return (
      <div className="flex flex-wrap gap-2">
        {codes.map((code, i) => {
          const piktogramm = getGhsPiktogramm(code)
          if (piktogramm) {
            return (
              <div
                key={i}
                className="relative flex flex-col items-center justify-center"
                style={{
                  width: '64px',
                  height: '64px'
                }}
                title={`${piktogramm.code}: ${piktogramm.name}`}
              >
                <img 
                  src={piktogramm.imagePath} 
                  alt={piktogramm.name}
                  className="w-full h-full object-contain"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
                <span className="absolute bottom-0 text-[7px] font-bold text-gray-700 bg-white px-1 rounded">{piktogramm.code}</span>
              </div>
            )
          }
          // Fallback für unbekannte Codes
          return (
            <div
              key={i}
              className="flex flex-col items-center justify-center w-16 h-16 bg-gray-400 border-4 border-gray-500 shadow-md"
              style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
              }}
              title={code}
            >
              <span className="text-xs font-bold text-white">{code}</span>
            </div>
          )
        })}
      </div>
    )
  }

  const toggleGhsSymbol = (code: string, currentSelection: string, setSelection: (value: string) => void) => {
    const selected = currentSelection ? currentSelection.split(',').map(s => s.trim()) : []
    const index = selected.indexOf(code)
    
    if (index > -1) {
      // Entfernen
      selected.splice(index, 1)
    } else {
      // Hinzufügen
      selected.push(code)
    }
    
    setSelection(selected.join(', '))
  }

  const isGhsSelected = (code: string, currentSelection: string) => {
    if (!currentSelection) return false
    return currentSelection.split(',').map(s => s.trim()).includes(code)
  }

  return (
    <div className="space-y-4 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl shadow-xl p-4 lg:p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold mb-2">
              Gefahrstoffe
            </h1>
            <p className="text-sm lg:text-base text-white/90">
              Verwaltung aller Gefahrstoffe im Freizeitbad LA OLA und Freibad Landau
            </p>
          </div>
          <Link
            href="/technik"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
          >
            ← Zurück zur Technik
          </Link>
        </div>
      </div>

      {/* Create Button */}
      {isAdmin && (
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <span>➕</span>
            <span>Neuen Gefahrstoff anlegen</span>
          </button>
        </div>
      )}

      {/* Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Gefahrstoffe-Übersicht</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-2 text-gray-500">Lade Daten...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name {getSortIcon('name')}
                    </div>
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Gefahrstoffsymbole
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Info
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Bemerkung
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Sicherheitsdatenblatt
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Betriebsanweisung LA OLA
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Betriebsanweisung Freibad
                  </th>
                  <th 
                    className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('wassergefaehrdungsklasse')}
                  >
                    <div className="flex items-center">
                      Wassergefährdungsklasse {getSortIcon('wassergefaehrdungsklasse')}
                    </div>
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Verbrauch Jahresmenge
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Substitution geprüft
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getSortedGefahrstoffe().length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-8 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center">
                        <span className="text-4xl mb-2">⚠️</span>
                        <p className="font-medium">Keine Gefahrstoffe vorhanden</p>
                        {isAdmin && (
                          <p className="text-xs mt-1">Klicken Sie auf "Neuen Gefahrstoff anlegen" um einen Gefahrstoff zu erstellen</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  getSortedGefahrstoffe().map((gefahrstoff) => (
                    <tr key={gefahrstoff.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {gefahrstoff.name}
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                        {renderGefahrstoffsymbole(gefahrstoff.gefahrstoffsymbole)}
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={gefahrstoff.info}>
                          {gefahrstoff.info || <span className="text-gray-400">—</span>}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={gefahrstoff.bemerkung}>
                          {gefahrstoff.bemerkung || <span className="text-gray-400">—</span>}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm">
                        {gefahrstoff.sicherheitsdatenblatt_url ? (
                          <a
                            href={gefahrstoff.sicherheitsdatenblatt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            📄 {gefahrstoff.sicherheitsdatenblatt_name || 'PDF'}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm">
                        {gefahrstoff.betriebsanweisung_laola_url ? (
                          <a
                            href={gefahrstoff.betriebsanweisung_laola_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            📄 {gefahrstoff.betriebsanweisung_laola_name || 'PDF'}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm">
                        {gefahrstoff.betriebsanweisung_freibad_url ? (
                          <a
                            href={gefahrstoff.betriebsanweisung_freibad_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            📄 {gefahrstoff.betriebsanweisung_freibad_name || 'PDF'}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {gefahrstoff.wassergefaehrdungsklasse || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {gefahrstoff.verbrauch_jahresmenge || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={gefahrstoff.substitution_geprueft_ergebnis}>
                          {gefahrstoff.substitution_geprueft_ergebnis || <span className="text-gray-400">—</span>}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleShowDetails(gefahrstoff)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                          >
                            Details
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => {
                                  setEditFormData({
                                    id: gefahrstoff.id,
                                    name: gefahrstoff.name,
                                    gefahrstoffsymbole: gefahrstoff.gefahrstoffsymbole || '',
                                    info: gefahrstoff.info || '',
                                    bemerkung: gefahrstoff.bemerkung || '',
                                    sicherheitsdatenblattFile: null,
                                    existingSicherheitsdatenblattUrl: gefahrstoff.sicherheitsdatenblatt_url || '',
                                    existingSicherheitsdatenblattName: gefahrstoff.sicherheitsdatenblatt_name || '',
                                    betriebsanweisungLaolaFile: null,
                                    existingBetriebsanweisungLaolaUrl: gefahrstoff.betriebsanweisung_laola_url || '',
                                    existingBetriebsanweisungLaolaName: gefahrstoff.betriebsanweisung_laola_name || '',
                                    betriebsanweisungFreibadFile: null,
                                    existingBetriebsanweisungFreibadUrl: gefahrstoff.betriebsanweisung_freibad_url || '',
                                    existingBetriebsanweisungFreibadName: gefahrstoff.betriebsanweisung_freibad_name || '',
                                    wassergefaehrdungsklasse: gefahrstoff.wassergefaehrdungsklasse || '',
                                    verbrauch_jahresmenge: gefahrstoff.verbrauch_jahresmenge || '',
                                    substitution_geprueft_ergebnis: gefahrstoff.substitution_geprueft_ergebnis || ''
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
                                  setGefahrstoffToDelete(gefahrstoff)
                                  setShowDeleteModal(true)
                                }}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
                                title="Löschen"
                              >
                                🗑️
                              </button>
                            </>
                          )}
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

      {/* Details Modal */}
      {showDetailsModal && selectedGefahrstoff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Gefahrstoff-Details</h3>
                  <p className="text-sm text-white/90 mt-1">{selectedGefahrstoff.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedGefahrstoff(null)
                  }}
                  className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg">{selectedGefahrstoff.name}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gefahrstoffsymbole</label>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    {renderGefahrstoffsymbole(selectedGefahrstoff.gefahrstoffsymbole)}
                  </div>
                </div>
                {selectedGefahrstoff.info && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Info</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg whitespace-pre-line">
                      {selectedGefahrstoff.info}
                    </p>
                  </div>
                )}
                {selectedGefahrstoff.bemerkung && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bemerkung</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg whitespace-pre-line">
                      {selectedGefahrstoff.bemerkung}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wassergefährdungsklasse</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg">
                    {selectedGefahrstoff.wassergefaehrdungsklasse || 'Nicht angegeben'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verbrauch Jahresmenge</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg">
                    {selectedGefahrstoff.verbrauch_jahresmenge || 'Nicht angegeben'}
                  </p>
                </div>
                {selectedGefahrstoff.substitution_geprueft_ergebnis && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Substitution geprüft Ergebnis</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg whitespace-pre-line">
                      {selectedGefahrstoff.substitution_geprueft_ergebnis}
                    </p>
                  </div>
                )}
                {selectedGefahrstoff.sicherheitsdatenblatt_url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sicherheitsdatenblatt</label>
                    <a
                      href={selectedGefahrstoff.sicherheitsdatenblatt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      📄 {selectedGefahrstoff.sicherheitsdatenblatt_name || 'PDF anzeigen'}
                    </a>
                  </div>
                )}
                {selectedGefahrstoff.betriebsanweisung_laola_url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Betriebsanweisung LA OLA</label>
                    <a
                      href={selectedGefahrstoff.betriebsanweisung_laola_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      📄 {selectedGefahrstoff.betriebsanweisung_laola_name || 'PDF anzeigen'}
                    </a>
                  </div>
                )}
                {selectedGefahrstoff.betriebsanweisung_freibad_url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Betriebsanweisung Freibad</label>
                    <a
                      href={selectedGefahrstoff.betriebsanweisung_freibad_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      📄 {selectedGefahrstoff.betriebsanweisung_freibad_name || 'PDF anzeigen'}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Neuen Gefahrstoff anlegen</h3>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({
                      name: '',
                      gefahrstoffsymbole: '',
                      info: '',
                      bemerkung: '',
                      sicherheitsdatenblattFile: null,
                      betriebsanweisungLaolaFile: null,
                      betriebsanweisungFreibadFile: null,
                      wassergefaehrdungsklasse: '',
                      verbrauch_jahresmenge: '',
                      substitution_geprueft_ergebnis: ''
                    })
                  }}
                  className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  placeholder="Name des Gefahrstoffs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gefahrstoffsymbole (GHS-Piktogramme)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-3">
                  {ghsPiktogramme.map((piktogramm) => {
                    const isSelected = isGhsSelected(piktogramm.code, formData.gefahrstoffsymbole)
                    return (
                      <button
                        key={piktogramm.code}
                        type="button"
                        onClick={() => toggleGhsSymbol(piktogramm.code, formData.gefahrstoffsymbole, (value) => setFormData({ ...formData, gefahrstoffsymbole: value }))}
                        className={`relative flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'shadow-lg scale-105'
                            : 'opacity-75 hover:opacity-100'
                        }`}
                        style={{
                          width: '80px',
                          height: '80px'
                        }}
                        title={piktogramm.name}
                      >
                        <img 
                          src={piktogramm.imagePath} 
                          alt={piktogramm.name}
                          className="w-full h-full object-contain"
                          style={{ maxWidth: '100%', maxHeight: '100%' }}
                        />
                        <span className={`absolute bottom-0 text-[8px] font-bold bg-white px-1 rounded ${isSelected ? 'text-gray-700' : 'text-gray-600'}`}>
                          {piktogramm.code}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {formData.gefahrstoffsymbole && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Ausgewählt:</p>
                    <p className="text-sm font-medium text-gray-900">{formData.gefahrstoffsymbole}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Info
                </label>
                <textarea
                  value={formData.info}
                  onChange={(e) => setFormData({ ...formData, info: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  rows={3}
                  placeholder="Zusätzliche Informationen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bemerkung
                </label>
                <textarea
                  value={formData.bemerkung}
                  onChange={(e) => setFormData({ ...formData, bemerkung: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  rows={3}
                  placeholder="Bemerkungen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sicherheitsdatenblatt (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFormData({ ...formData, sicherheitsdatenblattFile: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                />
                {formData.sicherheitsdatenblattFile && (
                  <p className="mt-1 text-sm text-gray-600">Ausgewählt: {formData.sicherheitsdatenblattFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Betriebsanweisung LA OLA (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFormData({ ...formData, betriebsanweisungLaolaFile: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                />
                {formData.betriebsanweisungLaolaFile && (
                  <p className="mt-1 text-sm text-gray-600">Ausgewählt: {formData.betriebsanweisungLaolaFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Betriebsanweisung Freibad (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFormData({ ...formData, betriebsanweisungFreibadFile: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                />
                {formData.betriebsanweisungFreibadFile && (
                  <p className="mt-1 text-sm text-gray-600">Ausgewählt: {formData.betriebsanweisungFreibadFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wassergefährdungsklasse
                </label>
                <input
                  type="text"
                  value={formData.wassergefaehrdungsklasse}
                  onChange={(e) => setFormData({ ...formData, wassergefaehrdungsklasse: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  placeholder="z.B. WGK 1, WGK 2, WGK 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verbrauch Jahresmenge
                </label>
                <input
                  type="text"
                  value={formData.verbrauch_jahresmenge}
                  onChange={(e) => setFormData({ ...formData, verbrauch_jahresmenge: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  placeholder="z.B. 50 Liter, 100 kg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Substitution geprüft Ergebnis
                </label>
                <textarea
                  value={formData.substitution_geprueft_ergebnis}
                  onChange={(e) => setFormData({ ...formData, substitution_geprueft_ergebnis: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  rows={3}
                  placeholder="Ergebnis der Substitutionsprüfung"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({
                      name: '',
                      gefahrstoffsymbole: '',
                      info: '',
                      bemerkung: '',
                      sicherheitsdatenblattFile: null,
                      betriebsanweisungLaolaFile: null,
                      betriebsanweisungFreibadFile: null,
                      wassergefaehrdungsklasse: '',
                      verbrauch_jahresmenge: '',
                      substitution_geprueft_ergebnis: ''
                    })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-wait"
                >
                  {formLoading ? 'Speichern...' : '💾 Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Gefahrstoff bearbeiten</h3>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  placeholder="Name des Gefahrstoffs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gefahrstoffsymbole (GHS-Piktogramme)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-3">
                  {ghsPiktogramme.map((piktogramm) => {
                    const isSelected = isGhsSelected(piktogramm.code, editFormData.gefahrstoffsymbole)
                    return (
                      <button
                        key={piktogramm.code}
                        type="button"
                        onClick={() => toggleGhsSymbol(piktogramm.code, editFormData.gefahrstoffsymbole, (value) => setEditFormData({ ...editFormData, gefahrstoffsymbole: value }))}
                        className={`relative flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'shadow-lg scale-105'
                            : 'opacity-75 hover:opacity-100'
                        }`}
                        style={{
                          width: '80px',
                          height: '80px'
                        }}
                        title={piktogramm.name}
                      >
                        <img 
                          src={piktogramm.imagePath} 
                          alt={piktogramm.name}
                          className="w-full h-full object-contain"
                          style={{ maxWidth: '100%', maxHeight: '100%' }}
                        />
                        <span className={`absolute bottom-0 text-[8px] font-bold bg-white px-1 rounded ${isSelected ? 'text-gray-700' : 'text-gray-600'}`}>
                          {piktogramm.code}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {editFormData.gefahrstoffsymbole && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Ausgewählt:</p>
                    <p className="text-sm font-medium text-gray-900">{editFormData.gefahrstoffsymbole}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Info
                </label>
                <textarea
                  value={editFormData.info}
                  onChange={(e) => setEditFormData({ ...editFormData, info: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  rows={3}
                  placeholder="Zusätzliche Informationen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bemerkung
                </label>
                <textarea
                  value={editFormData.bemerkung}
                  onChange={(e) => setEditFormData({ ...editFormData, bemerkung: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  rows={3}
                  placeholder="Bemerkungen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sicherheitsdatenblatt (PDF)
                </label>
                {editFormData.existingSicherheitsdatenblattUrl && (
                  <p className="text-xs text-gray-600 mb-2">
                    Aktuelles PDF: {editFormData.existingSicherheitsdatenblattName || 'Vorhanden'}
                  </p>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setEditFormData({ ...editFormData, sicherheitsdatenblattFile: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                />
                {editFormData.sicherheitsdatenblattFile && (
                  <p className="mt-1 text-sm text-gray-600">Neues PDF ausgewählt: {editFormData.sicherheitsdatenblattFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Betriebsanweisung LA OLA (PDF)
                </label>
                {editFormData.existingBetriebsanweisungLaolaUrl && (
                  <p className="text-xs text-gray-600 mb-2">
                    Aktuelles PDF: {editFormData.existingBetriebsanweisungLaolaName || 'Vorhanden'}
                  </p>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setEditFormData({ ...editFormData, betriebsanweisungLaolaFile: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                />
                {editFormData.betriebsanweisungLaolaFile && (
                  <p className="mt-1 text-sm text-gray-600">Neues PDF ausgewählt: {editFormData.betriebsanweisungLaolaFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Betriebsanweisung Freibad (PDF)
                </label>
                {editFormData.existingBetriebsanweisungFreibadUrl && (
                  <p className="text-xs text-gray-600 mb-2">
                    Aktuelles PDF: {editFormData.existingBetriebsanweisungFreibadName || 'Vorhanden'}
                  </p>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setEditFormData({ ...editFormData, betriebsanweisungFreibadFile: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                />
                {editFormData.betriebsanweisungFreibadFile && (
                  <p className="mt-1 text-sm text-gray-600">Neues PDF ausgewählt: {editFormData.betriebsanweisungFreibadFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wassergefährdungsklasse
                </label>
                <input
                  type="text"
                  value={editFormData.wassergefaehrdungsklasse}
                  onChange={(e) => setEditFormData({ ...editFormData, wassergefaehrdungsklasse: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  placeholder="z.B. WGK 1, WGK 2, WGK 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verbrauch Jahresmenge
                </label>
                <input
                  type="text"
                  value={editFormData.verbrauch_jahresmenge}
                  onChange={(e) => setEditFormData({ ...editFormData, verbrauch_jahresmenge: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  placeholder="z.B. 50 Liter, 100 kg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Substitution geprüft Ergebnis
                </label>
                <textarea
                  value={editFormData.substitution_geprueft_ergebnis}
                  onChange={(e) => setEditFormData({ ...editFormData, substitution_geprueft_ergebnis: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  rows={3}
                  placeholder="Ergebnis der Substitutionsprüfung"
                />
              </div>

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
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-wait"
                >
                  {editFormLoading ? 'Speichern...' : '💾 Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && gefahrstoffToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-red-600 mb-4">
                ⚠️ Gefahrstoff löschen
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Möchten Sie den Gefahrstoff <strong>{gefahrstoffToDelete.name}</strong> wirklich löschen?
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
                    setGefahrstoffToDelete(null)
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
    </div>
  )
}

