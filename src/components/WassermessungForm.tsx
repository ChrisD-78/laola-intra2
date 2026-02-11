'use client'

import { useMemo, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

interface WassermessungFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: WassermessungData) => void
  submissions: Array<{
    id: string
    submittedAt: string
    formData: Partial<WassermessungData>
  }>
}

interface WassermessungData {
  becken: string
  phWert: string
  chlorWert: string
  chlorWertGesamt: string
  chlorWertGebunden: string
  redox: string
  temperatur: string
  datum: string
  zeit: string
  bemerkungen: string
  durchgefuehrtVon: string
}

type HistoryRange = '7' | '30' | '90' | '365' | 'all'

const isHwpBecken = (becken: string) => {
  const normalized = becken.toLowerCase().replace(/\s|-/g, '')
  return normalized.includes('hwphalle') || normalized.includes('hwpsauna')
}

const isFreeChlorInRange = (becken: string, value: number) => {
  if (!Number.isFinite(value)) return false
  if (isHwpBecken(becken)) {
    return value >= 0.7 && value <= 1.0
  }
  return value >= 0.3 && value <= 0.6
}

const clamp = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

const Gauge = ({
  label,
  value,
  unit,
  min,
  max,
  color
}: {
  label: string
  value: number | null
  unit: string
  min: number
  max: number
  color: string
}) => {
  const safeValue = Number.isFinite(value) ? (value as number) : null
  const normalized = safeValue === null ? 0 : clamp((safeValue - min) / (max - min), 0, 1)
  const radius = 46
  const cx = 60
  const cy = 60
  const circumference = Math.PI * radius
  const dashOffset = circumference * (1 - normalized)
  const angle = Math.PI * (1 - normalized)
  const needleX = cx + radius * Math.cos(angle)
  const needleY = cy - radius * Math.sin(angle)

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[120px] h-[60px]">
        <svg width="120" height="60" viewBox="0 0 120 60">
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
          />
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="4" fill="#111827" />
        </svg>
      </div>
      <div className="mt-2 text-sm font-semibold text-gray-900">
        {safeValue === null ? '-' : safeValue.toFixed(2)} {unit}
      </div>
      <div className="text-xs text-gray-500 text-center">{label}</div>
    </div>
  )
}

const WassermessungForm = ({ isOpen, onClose, onSubmit, submissions }: WassermessungFormProps) => {
  const { currentUser } = useAuth()
  const [formData, setFormData] = useState<WassermessungData>({
    becken: '',
    phWert: '',
    chlorWert: '',
    chlorWertGesamt: '',
    chlorWertGebunden: '',
    redox: '',
    temperatur: '',
    datum: new Date().toISOString().split('T')[0],
    zeit: new Date().toTimeString().slice(0, 5),
    bemerkungen: '',
    durchgefuehrtVon: currentUser || 'Unbekannt'
  })
  const [showHistory, setShowHistory] = useState(false)
  const [historyRange, setHistoryRange] = useState<HistoryRange>('30')
  const [historyBecken, setHistoryBecken] = useState('')

  const freeChlorValue = Number.parseFloat(formData.chlorWert)
  const boundChlorValue = Number.parseFloat(formData.chlorWertGebunden)
  const isFreeChlorGreen = isFreeChlorInRange(formData.becken, freeChlorValue)
  const isBoundChlorHigh = Number.isFinite(boundChlorValue) && boundChlorValue > 0.2

  const computeBoundChlor = (totalRaw: string, freeRaw: string) => {
    const total = Number.parseFloat(totalRaw)
    const free = Number.parseFloat(freeRaw)
    if (!Number.isFinite(total) || !Number.isFinite(free)) return ''
    const result = total - free
    return Number.isFinite(result) ? result.toFixed(2) : ''
  }

  const historyRows = useMemo(() => {
    return submissions
      .map((submission) => {
        const data = submission.formData || {}
        const datum = data.datum || ''
        const zeit = data.zeit || '00:00'
        const timestamp = datum ? new Date(`${datum}T${zeit}`).getTime() : new Date(submission.submittedAt).getTime()
        return {
          id: submission.id,
          timestamp,
          label: datum ? `${datum} ${zeit}` : submission.submittedAt,
          becken: data.becken || '',
          phWert: Number.parseFloat(String(data.phWert ?? '')),
          chlorWert: Number.parseFloat(String(data.chlorWert ?? '')),
          chlorWertGesamt: Number.parseFloat(String(data.chlorWertGesamt ?? '')),
          chlorWertGebunden: Number.parseFloat(String(data.chlorWertGebunden ?? '')),
          redox: Number.parseFloat(String(data.redox ?? '')),
          temperatur: Number.parseFloat(String(data.temperatur ?? ''))
        }
      })
      .filter((row) => Number.isFinite(row.timestamp))
      .sort((a, b) => a.timestamp - b.timestamp)
  }, [submissions])

  const filteredHistoryRows = useMemo(() => {
    const now = Date.now()
    const rangeDays = historyRange === 'all' ? null : Number.parseInt(historyRange, 10)
    const minTimestamp = rangeDays ? now - rangeDays * 24 * 60 * 60 * 1000 : null
    return historyRows.filter((row) => {
      if (historyBecken && row.becken !== historyBecken) return false
      if (minTimestamp && row.timestamp < minTimestamp) return false
      return true
    })
  }, [historyRows, historyRange, historyBecken])

  const chartData = useMemo(() => {
    return filteredHistoryRows.map((row) => ({
      ...row,
      phWert: Number.isFinite(row.phWert) ? row.phWert : null,
      chlorWert: Number.isFinite(row.chlorWert) ? row.chlorWert : null,
      chlorWertGesamt: Number.isFinite(row.chlorWertGesamt) ? row.chlorWertGesamt : null,
      chlorWertGebunden: Number.isFinite(row.chlorWertGebunden) ? row.chlorWertGebunden : null,
      redox: Number.isFinite(row.redox) ? row.redox : null,
      temperatur: Number.isFinite(row.temperatur) ? row.temperatur : null,
      label: new Date(row.timestamp).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
    }))
  }, [filteredHistoryRows])

  const latestRow = useMemo(() => {
    if (filteredHistoryRows.length > 0) {
      return filteredHistoryRows[filteredHistoryRows.length - 1]
    }
    if (historyRows.length > 0) {
      return historyRows[historyRows.length - 1]
    }
    return null
  }, [filteredHistoryRows, historyRows])

  const historyBeckenOptions = useMemo(() => {
    const unique = new Set(historyRows.map((row) => row.becken).filter(Boolean))
    return Array.from(unique)
  }, [historyRows])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
    // Reset form
    setFormData({
      becken: '',
      phWert: '',
      chlorWert: '',
      chlorWertGesamt: '',
      chlorWertGebunden: '',
      redox: '',
      temperatur: '',
      datum: new Date().toISOString().split('T')[0],
      zeit: new Date().toTimeString().slice(0, 5),
      bemerkungen: '',
      durchgefuehrtVon: currentUser || 'Unbekannt'
    })
  }

  const handleClose = () => {
    onClose()
    setShowHistory(false)
    // Reset form
    setFormData({
      becken: '',
      phWert: '',
      chlorWert: '',
      chlorWertGesamt: '',
      chlorWertGebunden: '',
      redox: '',
      temperatur: '',
      datum: new Date().toISOString().split('T')[0],
      zeit: new Date().toTimeString().slice(0, 5),
      bemerkungen: '',
      durchgefuehrtVon: currentUser || 'Unbekannt'
    })
  }

  const handleToggleHistory = () => {
    setShowHistory((prev) => {
      const next = !prev
      if (next && formData.becken && !historyBecken) {
        setHistoryBecken(formData.becken)
      }
      return next
    })
  }

  const renderChlorTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (!active || !payload || payload.length === 0) return null
    const data = payload[0]?.payload
    const becken = data?.becken || '-'
    const freeValue = data?.chlorWert
    const boundValue = data?.chlorWertGebunden
    const freeOk = isFreeChlorInRange(becken, freeValue)
    const boundHigh = Number.isFinite(boundValue) && boundValue > 0.2
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 text-sm">
        <div className="font-semibold text-gray-900">{label}</div>
        <div className="text-xs text-gray-500 mb-1">{becken}</div>
        <div className={freeOk ? 'text-green-600' : 'text-gray-800'}>
          Cl-frei: {Number.isFinite(freeValue) ? freeValue.toFixed(2) : '-'} mg/l
        </div>
        <div className={boundHigh ? 'text-red-600' : 'text-gray-800'}>
          Cl-gebunden: {Number.isFinite(boundValue) ? boundValue.toFixed(2) : '-'} mg/l
        </div>
        <div className="text-gray-800">
          Cl-gesamt: {Number.isFinite(data?.chlorWertGesamt) ? data.chlorWertGesamt.toFixed(2) : '-'} mg/l
        </div>
      </div>
    )
  }

  const freeChlorDot = (props: { cx?: number; cy?: number; payload?: any }) => {
    const { cx, cy, payload } = props
    if (!payload || !Number.isFinite(payload.chlorWert)) return null
    const ok = isFreeChlorInRange(payload.becken || '', payload.chlorWert)
    const color = ok ? '#16a34a' : '#9ca3af'
    return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#ffffff" strokeWidth={1} />
  }

  const boundChlorDot = (props: { cx?: number; cy?: number; payload?: any }) => {
    const { cx, cy, payload } = props
    if (!payload || !Number.isFinite(payload.chlorWertGebunden)) return null
    const high = payload.chlorWertGebunden > 0.2
    const color = high ? '#dc2626' : '#16a34a'
    return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#ffffff" strokeWidth={1} />
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
                <span className="text-3xl">💧</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Wassermessung
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
                <label htmlFor="becken" className="block text-sm font-medium text-gray-900 mb-2">
                  Becken *
                </label>
                <select
                  id="becken"
                  value={formData.becken}
                  onChange={(e) => setFormData({...formData, becken: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Becken auswählen</option>
                  <option value="Schwimmerbecken">Schwimmerbecken</option>
                  <option value="Lehrschwimmbecken">Lehrschwimmbecken</option>
                  <option value="Wellenbecken">Wellenbecken</option>
                  <option value="Rutschenbecken">Rutschenbecken</option>
                  <option value="Kinderbecken 1">Kinderbecken 1</option>
                  <option value="Kinderbecken 2">Kinderbecken 2</option>
                  <option value="Thermalbecken">Thermalbecken</option>
                  <option value="HWP Halle">HWP Halle</option>
                  <option value="Sauna Außenbecken">Sauna Außenbecken</option>
                  <option value="Sauna Außenbecken warm">Sauna Außenbecken warm</option>
                  <option value="Sauna Außenbecken kalt">Sauna Außenbecken kalt</option>
                  <option value="HWP Sauna">HWP Sauna</option>
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="zeit" className="block text-sm font-medium text-gray-900 mb-2">
                  Zeit *
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
              
              <div>
                <label htmlFor="phWert" className="block text-sm font-medium text-gray-900 mb-2">
                  pH-Wert *
                </label>
                <input
                  type="number"
                  id="phWert"
                  step="0.01"
                  min="6.0"
                  max="8.5"
                  value={formData.phWert}
                  onChange={(e) => setFormData({...formData, phWert: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. 7.2"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="chlorWert" className="block text-sm font-medium text-gray-900 mb-2">
                  Chlor-Wert (mg/l) *
                </label>
                <input
                  type="number"
                  id="chlorWert"
                  step="0.01"
                  min="0.0"
                  max="3.0"
                  value={formData.chlorWert}
                  onChange={(e) => {
                    const nextFree = e.target.value
                    setFormData({
                      ...formData,
                      chlorWert: nextFree,
                      chlorWertGebunden: computeBoundChlor(formData.chlorWertGesamt, nextFree)
                    })
                  }}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${Number.isFinite(freeChlorValue) ? (isFreeChlorGreen ? 'text-green-600' : 'text-gray-900') : 'text-gray-900'}`}
                  placeholder="z.B. 0.8"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="chlorWertGesamt" className="block text-sm font-medium text-gray-900 mb-2">
                  Chlor-Wert-Gesamt (mg/l) *
                </label>
                <input
                  type="number"
                  id="chlorWertGesamt"
                  step="0.01"
                  min="0.0"
                  max="5.0"
                  value={formData.chlorWertGesamt}
                  onChange={(e) => {
                    const nextTotal = e.target.value
                    setFormData({
                      ...formData,
                      chlorWertGesamt: nextTotal,
                      chlorWertGebunden: computeBoundChlor(nextTotal, formData.chlorWert)
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. 1.2"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="chlorWertGebunden" className="block text-sm font-medium text-gray-900 mb-2">
                  Chlor-Wert-Gebunden (mg/l) *
                </label>
                <input
                  type="number"
                  id="chlorWertGebunden"
                  step="0.01"
                  min="0.0"
                  max="2.0"
                  value={formData.chlorWertGebunden}
                  readOnly
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isBoundChlorHigh ? 'text-red-600' : 'text-gray-900'}`}
                  placeholder="z.B. 0.4"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="redox" className="block text-sm font-medium text-gray-900 mb-2">
                  Redox (mV) *
                </label>
                <input
                  type="number"
                  id="redox"
                  step="1"
                  min="0"
                  max="1000"
                  value={formData.redox}
                  onChange={(e) => setFormData({...formData, redox: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. 650"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="temperatur" className="block text-sm font-medium text-gray-900 mb-2">
                  Wassertemperatur (°C) *
                </label>
                <input
                  type="number"
                  id="temperatur"
                  step="0.1"
                  min="9"
                  max="40"
                  value={formData.temperatur}
                  onChange={(e) => setFormData({...formData, temperatur: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. 28.5"
                  required
                />
              </div>
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
                placeholder="Besondere Beobachtungen, Auffälligkeiten oder Maßnahmen..."
              />
            </div>
            
            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Messung speichern
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Abbrechen
              </button>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleToggleHistory}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Historie
              </button>
            </div>
          </form>
        </div>
      </div>
      {showHistory && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
            onClick={() => setShowHistory(false)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-center relative">
                <h3 className="text-xl font-bold text-gray-900 text-center">Wassermessungen Historie</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 absolute right-6 top-6"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="text-sm font-semibold text-gray-900 mb-3">
                    Aktuelle Messwerte
                    {latestRow?.becken ? ` – ${latestRow.becken}` : ''}
                  </div>
                  {latestRow ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <Gauge
                        label="Cl-frei"
                        value={Number.isFinite(latestRow.chlorWert) ? latestRow.chlorWert : null}
                        unit="mg/l"
                        min={0}
                        max={1.5}
                        color={isFreeChlorInRange(latestRow.becken || '', latestRow.chlorWert) ? '#16a34a' : '#9ca3af'}
                      />
                      <Gauge
                        label="Cl-gesamt"
                        value={Number.isFinite(latestRow.chlorWertGesamt) ? latestRow.chlorWertGesamt : null}
                        unit="mg/l"
                        min={0}
                        max={2}
                        color="#7c3aed"
                      />
                      <Gauge
                        label="Cl-gebunden"
                        value={Number.isFinite(latestRow.chlorWertGebunden) ? latestRow.chlorWertGebunden : null}
                        unit="mg/l"
                        min={0}
                        max={0.6}
                        color={latestRow.chlorWertGebunden > 0.2 ? '#dc2626' : '#16a34a'}
                      />
                      <Gauge
                        label="pH"
                        value={Number.isFinite(latestRow.phWert) ? latestRow.phWert : null}
                        unit=""
                        min={6}
                        max={8}
                        color="#0ea5e9"
                      />
                      <Gauge
                        label="Redox"
                        value={Number.isFinite(latestRow.redox) ? latestRow.redox : null}
                        unit="mV"
                        min={500}
                        max={900}
                        color="#22c55e"
                      />
                      <Gauge
                        label="Temperatur"
                        value={Number.isFinite(latestRow.temperatur) ? latestRow.temperatur : null}
                        unit="°C"
                        min={20}
                        max={30}
                        color="#f59e0b"
                      />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">Keine Messwerte vorhanden.</div>
                  )}
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div />
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">Becken</div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setHistoryBecken('')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            historyBecken === '' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Alle Becken
                        </button>
                        {historyBeckenOptions.map((becken) => (
                          <button
                            key={becken}
                            type="button"
                            onClick={() => setHistoryBecken(becken)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                              historyBecken === becken ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {becken}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="sm:self-end">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Zeitraum</label>
                      <select
                        value={historyRange}
                        onChange={(e) => setHistoryRange(e.target.value as HistoryRange)}
                        className="w-full sm:w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="7">Letzte 7 Tage</option>
                        <option value="30">Letzte 30 Tage</option>
                        <option value="90">Letzte 90 Tage</option>
                        <option value="365">Letzte 12 Monate</option>
                        <option value="all">Alle</option>
                      </select>
                    </div>
                  </div>
                </div>

                {chartData.length === 0 ? (
                  <div className="text-sm text-gray-600 bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4">
                    Keine Messwerte für die gewählte Auswahl vorhanden.
                  </div>
                ) : (
                  <>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">Chlor-Werte (mg/l)</h5>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip content={renderChlorTooltip} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="chlorWert"
                              name="Cl-frei"
                              stroke="#2563eb"
                              dot={freeChlorDot}
                              isAnimationActive
                              animationDuration={800}
                            />
                            <Line
                              type="monotone"
                              dataKey="chlorWertGesamt"
                              name="Cl-gesamt"
                              stroke="#7c3aed"
                              isAnimationActive
                              animationDuration={800}
                            />
                            <Line
                              type="monotone"
                              dataKey="chlorWertGebunden"
                              name="Cl-gebunden"
                              stroke="#f97316"
                              dot={boundChlorDot}
                              isAnimationActive
                              animationDuration={800}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">pH-Wert</h5>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis domain={[6, 8.5]} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="phWert"
                              name="pH"
                              stroke="#0ea5e9"
                              isAnimationActive
                              animationDuration={800}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">Redox (mV)</h5>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="redox"
                              name="Redox"
                              stroke="#22c55e"
                              isAnimationActive
                              animationDuration={800}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">Temperatur (°C)</h5>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="temperatur"
                              name="Temperatur"
                              stroke="#f59e0b"
                              isAnimationActive
                              animationDuration={800}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default WassermessungForm
