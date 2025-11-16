'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
// Simple CSV parsing (no external deps)
function parseCsv(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length === 0) return { headers: [], rows: [] }
  const sep = lines[0].includes(';') ? ';' : ','
  const split = (line: string) => line.split(sep).map(c => c.trim().replace(/^"|"$/g, ''))
  const headers = split(lines[0]).map(h => h.toLowerCase())
  const rows = lines.slice(1).map(split)
  return { headers, rows }
}

function parseGermanDate(input: string): string {
  const v = (input || '').trim()
  if (!v) return ''
  // support dd.MM.yyyy or yyyy-MM-dd
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(v)) {
    const [d, m, y] = v.split('.')
    return new Date(Number(y), Number(m) - 1, Number(d)).toISOString()
  }
  const dt = new Date(v)
  return isNaN(dt.getTime()) ? '' : dt.toISOString()
}

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
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    rubrik: 'Messgeräte',
    id_nr: '',
    name: '',
    standort: '',
    bild_url: '',
    bild_name: '',
    letzte_pruefung: '',
    interval: 'Jährlich',
    naechste_pruefung: '',
    bericht_url: '',
    bericht_name: '',
    bemerkungen: '',
    in_betrieb: true,
    kontaktdaten: ''
  })

  const [bildFile, setBildFile] = useState<File | null>(null)
  const [berichtFile, setBerichtFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Filter state
  const [filters, setFilters] = useState({
    rubrik: 'Alle',
    status: 'Alle',
    searchText: ''
  })

  useEffect(() => {
    fetchInspections()
  }, [])

  // Fetch next available ID when rubrik changes
  useEffect(() => {
    const fetchNextId = async () => {
      if (formData.rubrik) {
        try {
          const response = await fetch(`/api/technik/next-id?rubrik=${encodeURIComponent(formData.rubrik)}`)
          if (response.ok) {
            const data = await response.json()
            setFormData(prev => ({ ...prev, id_nr: data.nextId }))
          }
        } catch (error) {
          console.error('Failed to fetch next ID:', error)
        }
      }
    }

    if (showAddForm) {
      fetchNextId()
    }
  }, [formData.rubrik, showAddForm])

  const importMessgeraeteCsv = async (file: File) => {
    try {
      setImporting(true)
      setImportProgress(null)
      const text = await file.text()
      const { headers, rows } = parseCsv(text)
      if (headers.length === 0 || rows.length === 0) {
        alert('Die CSV enthält keine Daten (Header/Zeilen).')
        return
      }
      const idx = (key: string) => headers.findIndex(h => h.includes(key))
      const idxInventar = idx('inventar') // Inventarnr
      const idxGeraet = idx('gerät') >= 0 ? idx('gerät') : idx('geraet')
      const idxStandort = idx('standort')
      const idxLetzte = idx('datum') >= 0 ? idx('datum') : idx('letzte')
      const idxInterval = idx('intervall')
      const idxNaechste = idx('nächste') >= 0 ? idx('nächste') : idx('naechste')
      const idxZustaendig = idx('zuständ') >= 0 ? idx('zuständ') : idx('zustaend')

      const total = rows.length
      let done = 0
      setImportProgress({ done, total })

      for (const r of rows) {
        const id_nr = idxInventar >= 0 ? (r[idxInventar] || '').toString() : ''
        const name = idxGeraet >= 0 ? r[idxGeraet] : ''
        const standort = idxStandort >= 0 ? r[idxStandort] : ''
        const letzte_pruefung = idxLetzte >= 0 ? parseGermanDate(r[idxLetzte]) : ''
        const interval = idxInterval >= 0 ? r[idxInterval] : 'Jährlich'
        const naechste_pruefung = idxNaechste >= 0 ? parseGermanDate(r[idxNaechste]) : ''
        const kontaktdaten = idxZustaendig >= 0 ? r[idxZustaendig] : ''

        // Skip empty rows
        if (!name && !id_nr) {
          done++
          setImportProgress({ done, total })
          continue
        }

        await fetch('/api/technik', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rubrik: 'Messgeräte',
            id_nr,
            name,
            standort,
            letzte_pruefung,
            interval,
            naechste_pruefung,
            bemerkungen: '',
            in_betrieb: true,
            kontaktdaten
          })
        })
        done++
        setImportProgress({ done, total })
      }

      await fetchInspections()
      alert('Import abgeschlossen: ' + done + ' Einträge erstellt.')
    } catch (e) {
      console.error('CSV Import failed', e)
      alert('Import fehlgeschlagen. Bitte CSV prüfen.')
    } finally {
      setImporting(false)
      setImportProgress(null)
    }
  }

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

  // Apply filters
  const filteredInspections = inspections.filter(inspection => {
    // Filter by rubrik
    if (filters.rubrik !== 'Alle' && inspection.rubrik !== filters.rubrik) {
      return false
    }

    // Filter by status
    const currentStatus = calculateStatus(inspection.naechste_pruefung, inspection.status)
    if (filters.status !== 'Alle') {
      if (filters.status === 'Überfällig' && currentStatus !== 'Überfällig') return false
      if (filters.status === 'Erledigt' && inspection.status !== 'Erledigt') return false
      if (filters.status === 'Offen' && (currentStatus === 'Überfällig' || inspection.status === 'Erledigt')) return false
    }

    // Filter by search text (ID-Nr, Name, Standort)
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase()
      const matchesSearch = 
        inspection.id_nr.toLowerCase().includes(searchLower) ||
        inspection.name.toLowerCase().includes(searchLower) ||
        inspection.standort.toLowerCase().includes(searchLower)
      
      if (!matchesSearch) return false
    }

    return true
  })

  const overdueCount = inspections.filter(i => calculateStatus(i.naechste_pruefung, i.status) === 'Überfällig').length
  const openCount = inspections.filter(i => {
    const status = calculateStatus(i.naechste_pruefung, i.status)
    return status !== 'Überfällig' && i.status !== 'Erledigt'
  }).length
  const completedCount = inspections.filter(i => i.status === 'Erledigt').length
  const totalCount = inspections.length

  const handleResetFilters = () => {
    setFilters({
      rubrik: 'Alle',
      status: 'Alle',
      searchText: ''
    })
  }

  const handleFilterByStatus = (status: string) => {
    // Toggle-Funktion: Wenn der gleiche Status nochmal geklickt wird, Filter zurücksetzen
    if (filters.status === status) {
      setFilters({
        rubrik: 'Alle',
        status: 'Alle',
        searchText: ''
      })
    } else {
      setFilters({
        rubrik: 'Alle',
        status: status,
        searchText: ''
      })
      // Scroll to table nur wenn Filter aktiviert wird
      setTimeout(() => {
        document.getElementById('inspections-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  const handleAddInspection = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    
    try {
      let bildUrl = ''
      let bildName = ''
      let berichtUrl = ''
      let berichtName = ''

      // Upload Bild PDF
      if (bildFile) {
        const bildFormData = new FormData()
        bildFormData.append('file', bildFile)
        
        const bildResponse = await fetch('/api/upload/pdf', {
          method: 'POST',
          body: bildFormData
        })
        
        if (bildResponse.ok) {
          const bildData = await bildResponse.json()
          bildUrl = bildData.publicUrl
          bildName = bildData.name
        }
      }

      // Upload Bericht PDF
      if (berichtFile) {
        const berichtFormData = new FormData()
        berichtFormData.append('file', berichtFile)
        
        const berichtResponse = await fetch('/api/upload/pdf', {
          method: 'POST',
          body: berichtFormData
        })
        
        if (berichtResponse.ok) {
          const berichtData = await berichtResponse.json()
          berichtUrl = berichtData.publicUrl
          berichtName = berichtData.name
        }
      }

      const response = await fetch('/api/technik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          bild_url: bildUrl || formData.bild_url,
          bild_name: bildName || formData.bild_name,
          bericht_url: berichtUrl || formData.bericht_url,
          bericht_name: berichtName || formData.bericht_name,
          status: 'Offen'
        })
      })

      if (response.ok) {
        await fetchInspections()
        setShowAddForm(false)
        // Reset form
        setFormData({
          rubrik: 'Messgeräte',
          id_nr: '',
          name: '',
          standort: '',
          bild_url: '',
          bild_name: '',
          letzte_pruefung: '',
          interval: 'Jährlich',
          naechste_pruefung: '',
          bericht_url: '',
          bericht_name: '',
          bemerkungen: '',
          in_betrieb: true,
          kontaktdaten: ''
        })
        setBildFile(null)
        setBerichtFile(null)
      } else if (response.status === 409) {
        const errorData = await response.json()
        alert(errorData.message || 'Diese ID-Nr. wird bereits verwendet. Bitte laden Sie die Seite neu.')
        // Fetch new ID
        const idResponse = await fetch(`/api/technik/next-id?rubrik=${encodeURIComponent(formData.rubrik)}`)
        if (idResponse.ok) {
          const idData = await idResponse.json()
          setFormData(prev => ({ ...prev, id_nr: idData.nextId }))
        }
      } else {
        alert('Fehler beim Erstellen der Prüfung. Bitte versuchen Sie es erneut.')
      }
    } catch (error) {
      console.error('Failed to add inspection:', error)
      alert('Fehler beim Erstellen der Prüfung. Bitte versuchen Sie es erneut.')
    } finally {
      setUploading(false)
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

      {/* Recurring Tasks List */}
      <div className="space-y-4">
        {/* Messgeräte CSV Import */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Messgeräte importieren (CSV)</h3>
              <p className="text-gray-600 text-sm">Bitte Numbers/Excel als CSV (UTF‑8) mit Kopfzeile exportieren. Erkannt werden u. a.: Inventarnr, Gerät, Standort, Datum letzter Wartung, Wartungsintervall, Nächste Prüfung, Zuständigkeit.</p>
            </div>
            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
              {importing ? 'Import läuft…' : 'CSV auswählen'}
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) importMessgeraeteCsv(file)
                  e.currentTarget.value = ''
                }}
                disabled={importing}
              />
            </label>
          </div>
          {importProgress && (
            <div className="mt-2 text-sm text-gray-600">{importProgress.done} / {importProgress.total} importiert…</div>
          )}
        </div>
        
        {/* Summary Cards - Clickable Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Überfällig */}
        <button
          onClick={() => handleFilterByStatus('Überfällig')}
          className={`bg-red-50 border rounded-xl p-4 transition-all duration-200 hover:shadow-lg text-left ${
            filters.status === 'Überfällig'
              ? 'border-red-500 ring-2 ring-red-300 shadow-lg'
              : 'border-red-200 hover:border-red-400'
          }`}
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-xl">🚨</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">Überfällig</p>
              <p className="text-2xl font-bold text-red-900">{overdueCount}</p>
            </div>
          </div>
          {filters.status === 'Überfällig' ? (
            <div className="mt-2 text-xs text-red-700 font-medium">✓ Aktiver Filter</div>
          ) : (
            <p className="text-xs text-red-600 mt-2">Klicken zum Filtern</p>
          )}
        </button>

        {/* Offen */}
        <button
          onClick={() => handleFilterByStatus('Offen')}
          className={`bg-yellow-50 border rounded-xl p-4 transition-all duration-200 hover:shadow-lg text-left ${
            filters.status === 'Offen'
              ? 'border-yellow-500 ring-2 ring-yellow-300 shadow-lg'
              : 'border-yellow-200 hover:border-yellow-400'
          }`}
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-xl">📋</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">Offen</p>
              <p className="text-2xl font-bold text-yellow-900">{openCount}</p>
            </div>
          </div>
          {filters.status === 'Offen' ? (
            <div className="mt-2 text-xs text-yellow-700 font-medium">✓ Aktiver Filter</div>
          ) : (
            <p className="text-xs text-yellow-600 mt-2">Klicken zum Filtern</p>
          )}
        </button>

        {/* Erledigt */}
        <button
          onClick={() => handleFilterByStatus('Erledigt')}
          className={`bg-green-50 border rounded-xl p-4 transition-all duration-200 hover:shadow-lg text-left ${
            filters.status === 'Erledigt'
              ? 'border-green-500 ring-2 ring-green-300 shadow-lg'
              : 'border-green-200 hover:border-green-400'
          }`}
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Erledigt</p>
              <p className="text-2xl font-bold text-green-900">{completedCount}</p>
            </div>
          </div>
          {filters.status === 'Erledigt' ? (
            <div className="mt-2 text-xs text-green-700 font-medium">✓ Aktiver Filter</div>
          ) : (
            <p className="text-xs text-green-600 mt-2">Klicken zum Filtern</p>
          )}
        </button>

        {/* Gesamtanzahl / Alle */}
        <button
          onClick={() => handleResetFilters()}
          className={`bg-blue-50 border rounded-xl p-4 transition-all duration-200 hover:shadow-lg text-left ${
            filters.status === 'Alle' && filters.rubrik === 'Alle'
              ? 'border-blue-500 ring-2 ring-blue-300 shadow-lg'
              : 'border-blue-200 hover:border-blue-400'
          }`}
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-xl">📊</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">Gesamtanzahl</p>
              <p className="text-2xl font-bold text-blue-900">{totalCount}</p>
            </div>
          </div>
          {filters.status === 'Alle' && filters.rubrik === 'Alle' ? (
            <div className="mt-2 text-xs text-blue-700 font-medium">✓ Alle angezeigt</div>
          ) : (
            <p className="text-xs text-blue-600 mt-2">Klicken für Alle</p>
          )}
        </button>
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
      <div id="inspections-table" className="bg-white rounded-2xl shadow-lg border border-gray-100 scroll-mt-4">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Prüfungsübersicht</h2>
          <p className="text-gray-600 mt-1">Alle technischen Prüfungen im Überblick</p>
          
          {/* Filters */}
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rubrik Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rubrik
                </label>
                <select
                  value={filters.rubrik}
                  onChange={(e) => setFilters({...filters, rubrik: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Alle">Alle Rubriken</option>
                  <option value="Messgeräte">Messgeräte</option>
                  <option value="Wartungen">Wartungen</option>
                  <option value="Prüfungen">Prüfungen</option>
                  <option value="Elektrische Prüfungen">Elektrische Prüfungen</option>
                  <option value="Lüftungen">Lüftungen</option>
                </select>
              </div>

              {/* Search Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suche (ID-Nr., Name, Standort)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.searchText}
                    onChange={(e) => setFilters({...filters, searchText: e.target.value})}
                    placeholder="Suchen..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  />
                  {filters.searchText && (
                    <button
                      onClick={() => setFilters({...filters, searchText: ''})}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Info & Reset */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {filteredInspections.length === inspections.length ? (
                  <span>Zeige alle {inspections.length} Prüfungen</span>
                ) : (
                  <span>
                    Zeige {filteredInspections.length} von {inspections.length} Prüfungen
                    {filters.rubrik !== 'Alle' && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">Rubrik: {filters.rubrik}</span>}
                    {filters.status !== 'Alle' && <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">Status: {filters.status}</span>}
                    {filters.searchText && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Suche: "{filters.searchText}"</span>}
                  </span>
                )}
              </div>
              {(filters.rubrik !== 'Alle' || filters.status !== 'Alle' || filters.searchText) && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Filter zurücksetzen
                </button>
              )}
            </div>
          </div>
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
              ) : filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {inspections.length === 0 ? 'Keine Prüfungen vorhanden' : 'Keine Prüfungen gefunden'}
                    </h3>
                    <p className="text-gray-600">
                      {inspections.length === 0 
                        ? 'Erstellen Sie Ihre erste technische Prüfung'
                        : 'Versuchen Sie es mit anderen Filtereinstellungen'}
                    </p>
                    {(filters.rubrik !== 'Alle' || filters.status !== 'Alle' || filters.searchText) && (
                      <button
                        onClick={handleResetFilters}
                        className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Filter zurücksetzen
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredInspections.map((inspection) => {
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
                  <select
                    required
                    value={formData.rubrik}
                    onChange={(e) => setFormData({...formData, rubrik: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Messgeräte">Messgeräte</option>
                    <option value="Wartungen">Wartungen</option>
                    <option value="Prüfungen">Prüfungen</option>
                    <option value="Elektrische Prüfungen">Elektrische Prüfungen</option>
                    <option value="Lüftungen">Lüftungen</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID-Nr.* (automatisch generiert)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.id_nr}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                    placeholder="Wird automatisch generiert..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: {formData.rubrik === 'Messgeräte' ? 'MES-XXX' : 
                             formData.rubrik === 'Wartungen' ? 'WAR-XXX' : 
                             formData.rubrik === 'Prüfungen' ? 'PRÜ-XXX' : 
                             formData.rubrik === 'Elektrische Prüfungen' ? 'ELE-XXX' : 
                             formData.rubrik === 'Lüftungen' ? 'LÜF-XXX' : 'XXX-XXX'}
                  </p>
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
                
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bild (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setBildFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {bildFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Ausgewählt: {bildFile.name}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bericht (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setBerichtFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {berichtFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Ausgewählt: {berichtFile.name}
                  </p>
                )}
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
                  disabled={uploading}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                  disabled={uploading}
                >
                  {uploading ? 'Wird hochgeladen...' : 'Prüfung anlegen'}
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
              {/* Bild PDF - Zentral oben mittig */}
              {selectedInspection.bild_url && (
                <div className="flex flex-col items-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Bild/Dokument</h4>
                  <div className="w-full max-w-lg border border-gray-300 rounded-lg overflow-hidden shadow-md bg-white">
                    <iframe
                      src={selectedInspection.bild_url}
                      className="w-full h-[175px]"
                      title="Bild PDF"
                    />
                  </div>
                  {selectedInspection.bild_name && (
                    <p className="text-sm text-gray-600 mt-2">
                      📄 {selectedInspection.bild_name}
                    </p>
                  )}
                  <a
                    href={selectedInspection.bild_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    PDF in neuem Tab öffnen →
                  </a>
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
              
              {selectedInspection.bericht_url && (
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">Bericht</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden shadow-md bg-white">
                    <iframe
                      src={selectedInspection.bericht_url}
                      className="w-full h-[300px]"
                      title="Bericht PDF"
                    />
                  </div>
                  {selectedInspection.bericht_name && (
                    <p className="text-sm text-gray-600 mt-2">
                      📄 {selectedInspection.bericht_name}
                    </p>
                  )}
                  <a
                    href={selectedInspection.bericht_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    PDF in neuem Tab öffnen →
                  </a>
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

