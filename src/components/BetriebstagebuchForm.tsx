'use client'

import { useMemo, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

type Shift = 'frueh' | 'spaet'
type TimeSlot = 'betriebsbeginn' | 'betriebsmitte' | 'betriebsende'
type WaterFieldKey = 'temp' | 'ph' | 'clFrei' | 'clGes' | 'clGeb' | 'redox'

type WaterRow = Record<WaterFieldKey, string>
type WaterSection = Record<TimeSlot, WaterRow>

type WaterPoolKey =
  | 'schwimmer'
  | 'lehrschwimm'
  | 'wellen'
  | 'rutschen'
  | 'kinder1'
  | 'kinder2'
  | 'whirlpool'
  | 'thermal'

type SaunaPoolKey = 'whirlpool' | 'aussen' | 'aussenWarm' | 'aussenKalt'

const HALLEN_POOLS: Array<{ key: WaterPoolKey; label: string }> = [
  { key: 'schwimmer', label: 'Schwimmerbecken (x)' },
  { key: 'lehrschwimm', label: 'Lehrschwimmbecken (o)' },
  { key: 'wellen', label: 'Wellenbecken (x)' },
  { key: 'rutschen', label: 'Rutschenbecken (x)' },
  { key: 'kinder1', label: 'Kinderbecken 1 (o)' },
  { key: 'kinder2', label: 'Kinderbecken 2 (o)' },
  { key: 'whirlpool', label: 'Whirlpool (+)' },
  { key: 'thermal', label: 'Thermalbecken (o)' },
]

const SAUNA_POOLS: Array<{ key: SaunaPoolKey; label: string }> = [
  { key: 'whirlpool', label: 'Whirlpool (+)' },
  { key: 'aussen', label: 'Außenbecken (x)' },
  { key: 'aussenWarm', label: 'Außenbecken warm (o)' },
  { key: 'aussenKalt', label: 'Außenbecken kalt' },
]

const timeSlotLabel: Record<TimeSlot, string> = {
  betriebsbeginn: 'Betriebsbeginn',
  betriebsmitte: 'Betriebsmitte',
  betriebsende: 'Betriebsende',
}

const waterFieldLabel: Record<WaterFieldKey, string> = {
  temp: 'Temp',
  ph: 'pH-Wert',
  clFrei: 'Cl frei',
  clGes: 'Cl ges.',
  clGeb: 'Cl geb.',
  redox: 'Redox',
}

const emptyWaterRow = (): WaterRow => ({
  temp: '',
  ph: '',
  clFrei: '',
  clGes: '',
  clGeb: '',
  redox: '',
})

const emptySection = (): WaterSection => ({
  betriebsbeginn: emptyWaterRow(),
  betriebsmitte: emptyWaterRow(),
  betriebsende: emptyWaterRow(),
})

const makePoolMap = <TKey extends string>(
  pools: Array<{ key: TKey; label: string }>
): Record<TKey, WaterSection> => {
  return pools.reduce((acc, p) => {
    acc[p.key] = emptySection()
    return acc
  }, {} as Record<TKey, WaterSection>)
}

export interface BetriebstagebuchData {
  datum: string
  wochentag: string

  personal: {
    frueh: {
      schichtfuehrung: string
      aufsicht2: string
      aufsicht3: string
      sauna: string
      umkleide: string
      kasse: string
    }
    spaet: {
      schichtfuehrung: string
      aufsicht2: string
      aufsicht3: string
      sauna: string
      umkleide: string
      kasse: string
    }
  }

  wasserwerteHalle: Record<WaterPoolKey, WaterSection>
  wasserwerteSauna: Record<SaunaPoolKey, WaterSection>

  montag: {
    saeurekapazitaet: string
    messwasserentnahmestellenReinigen: boolean
    kuvetteAustauschen: boolean
  }

  lufttemperatur: {
    innen: string
    aussen: string
  }

  reinigung: {
    halleFrueh: string
    halleSpaet: string
    saunaFrueh: string
    saunaSpaet: string
    umkleideFrueh: string
    umkleideSpaet: string
    kasseFrueh: string
    kasseSpaet: string
  }

  kontrollgang: {
    uhrzeit: string
    handzeichen: string
  }

  betriebsstoerungVorkommnisse: string
  behobenVon: string
  behobenUm: string

  druckUF: {
    '1.1': string
    '1.2': string
    '2.1': string
    '2.2': string
    '2.3': string
    '2.4': string
  }

  sonstiges: string

  unterschrift: {
    verantwortlicherFrueh: string
    verantwortlicherSpaet: string
  }
}

interface BetriebstagebuchFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: BetriebstagebuchData) => void
  submissions: Array<{
    id: string
    submittedAt: string
    formData: Partial<BetriebstagebuchData>
    submittedBy?: string
  }>
}

export default function BetriebstagebuchForm({
  isOpen,
  onClose,
  onSubmit,
  submissions,
}: BetriebstagebuchFormProps) {
  const { currentUser } = useAuth()

  const [showHistory, setShowHistory] = useState(false)
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)

  const today = new Date()
  const defaultDate = today.toISOString().split('T')[0]
  const defaultWeekday = today.toLocaleDateString('de-DE', { weekday: 'long' })

  const [datum, setDatum] = useState(defaultDate)
  const [wochentag, setWochentag] = useState(defaultWeekday)

  const [personal, setPersonal] = useState<BetriebstagebuchData['personal']>({
    frueh: {
      schichtfuehrung: '',
      aufsicht2: '',
      aufsicht3: '',
      sauna: '',
      umkleide: '',
      kasse: '',
    },
    spaet: {
      schichtfuehrung: '',
      aufsicht2: '',
      aufsicht3: '',
      sauna: '',
      umkleide: '',
      kasse: '',
    },
  })

  const [wasserwerteHalle, setWasserwerteHalle] =
    useState<Record<WaterPoolKey, WaterSection>>(() => makePoolMap(HALLEN_POOLS))
  const [wasserwerteSauna, setWasserwerteSauna] =
    useState<Record<SaunaPoolKey, WaterSection>>(() => makePoolMap(SAUNA_POOLS))
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>('betriebsbeginn')

  const [saeurekapazitaet, setSaeurekapazitaet] = useState('')
  const [messwasserentnahmestellenReinigen, setMesswasserentnahmestellenReinigen] = useState(false)
  const [kuvetteAustauschen, setKuvetteAustauschen] = useState(false)
  const [luftInnen, setLuftInnen] = useState('')
  const [luftAussen, setLuftAussen] = useState('')

  const [reinigung, setReinigung] = useState<BetriebstagebuchData['reinigung']>({
    halleFrueh: '',
    halleSpaet: '',
    saunaFrueh: '',
    saunaSpaet: '',
    umkleideFrueh: '',
    umkleideSpaet: '',
    kasseFrueh: '',
    kasseSpaet: '',
  })

  const [kontrollgang, setKontrollgang] = useState<BetriebstagebuchData['kontrollgang']>({
    uhrzeit: '',
    handzeichen: '',
  })

  const [betriebsstoerungVorkommnisse, setBetriebsstoerungVorkommnisse] = useState('')
  const [behobenVon, setBehobenVon] = useState('')
  const [behobenUm, setBehobenUm] = useState('')

  const [druckUF, setDruckUF] = useState<BetriebstagebuchData['druckUF']>({
    '1.1': '',
    '1.2': '',
    '2.1': '',
    '2.2': '',
    '2.3': '',
    '2.4': '',
  })

  const [sonstiges, setSonstiges] = useState('')

  const [unterschrift, setUnterschrift] = useState<BetriebstagebuchData['unterschrift']>({
    verantwortlicherFrueh: currentUser || '',
    verantwortlicherSpaet: '',
  })

  const resetForm = () => {
    setDatum(defaultDate)
    setWochentag(defaultWeekday)
    setPersonal({
      frueh: { schichtfuehrung: '', aufsicht2: '', aufsicht3: '', sauna: '', umkleide: '', kasse: '' },
      spaet: { schichtfuehrung: '', aufsicht2: '', aufsicht3: '', sauna: '', umkleide: '', kasse: '' },
    })
    setWasserwerteHalle(makePoolMap(HALLEN_POOLS))
    setWasserwerteSauna(makePoolMap(SAUNA_POOLS))
    setSaeurekapazitaet('')
    setMesswasserentnahmestellenReinigen(false)
    setKuvetteAustauschen(false)
    setLuftInnen('')
    setLuftAussen('')
    setReinigung({
      halleFrueh: '',
      halleSpaet: '',
      saunaFrueh: '',
      saunaSpaet: '',
      umkleideFrueh: '',
      umkleideSpaet: '',
      kasseFrueh: '',
      kasseSpaet: '',
    })
    setKontrollgang({ uhrzeit: '', handzeichen: '' })
    setBetriebsstoerungVorkommnisse('')
    setBehobenVon('')
    setBehobenUm('')
    setDruckUF({ '1.1': '', '1.2': '', '2.1': '', '2.2': '', '2.3': '', '2.4': '' })
    setSonstiges('')
    setUnterschrift({ verantwortlicherFrueh: currentUser || '', verantwortlicherSpaet: '' })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const updatePersonal = (shift: Shift, key: keyof BetriebstagebuchData['personal']['frueh'], value: string) => {
    setPersonal((prev) => ({
      ...prev,
      [shift]: { ...prev[shift], [key]: value },
    }))
  }

  const updateWater = <TKey extends string>(
    sectionSetter: React.Dispatch<React.SetStateAction<Record<TKey, WaterSection>>>,
    poolKey: TKey,
    timeSlot: TimeSlot,
    field: WaterFieldKey,
    value: string
  ) => {
    sectionSetter((prev) => ({
      ...prev,
      [poolKey]: {
        ...prev[poolKey],
        [timeSlot]: {
          ...prev[poolKey][timeSlot],
          [field]: value,
        },
      },
    }))
  }

  const historyRows = useMemo(() => {
    return submissions
      .map((s) => {
        const data = s.formData || {}
        const timestamp = data.datum ? new Date(`${data.datum}T00:00`).getTime() : new Date(s.submittedAt).getTime()
        return {
          id: s.id,
          timestamp,
          submittedAt: s.submittedAt,
          datum: String(data.datum ?? ''),
          wochentag: String(data.wochentag ?? ''),
          fruehSF: String(data.personal?.frueh?.schichtfuehrung ?? ''),
          spaetSF: String(data.personal?.spaet?.schichtfuehrung ?? ''),
          submittedBy: s.submittedBy || '',
          data,
        }
      })
      .sort((a, b) => b.timestamp - a.timestamp)
  }, [submissions])

  const selectedHistory = useMemo(() => {
    if (!selectedHistoryId) return null
    return historyRows.find((r) => r.id === selectedHistoryId) || null
  }, [selectedHistoryId, historyRows])

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'boolean') return value ? 'Ja' : 'Nein'
    const str = String(value).trim()
    return str === '' ? '—' : str
  }

  const hasAnyWaterValue = (section: any) => {
    const slots: TimeSlot[] = ['betriebsbeginn', 'betriebsmitte', 'betriebsende']
    const fields: WaterFieldKey[] = ['temp', 'ph', 'clFrei', 'clGes', 'clGeb', 'redox']
    return slots.some((slot) => fields.some((f) => (section?.[slot]?.[f] || '').toString().trim() !== ''))
  }

  const renderWaterTable = (section: any) => {
    const slots: TimeSlot[] = ['betriebsbeginn', 'betriebsmitte', 'betriebsende']
    const fields: WaterFieldKey[] = ['temp', 'ph', 'clFrei', 'clGes', 'clGeb', 'redox']
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="py-2 pr-4 font-semibold text-gray-700">Zeitpunkt</th>
              {fields.map((f) => (
                <th key={f} className="py-2 pr-4 font-semibold text-gray-700 whitespace-nowrap">
                  {waterFieldLabel[f]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot} className="border-b border-gray-100">
                <td className="py-2 pr-4 text-gray-900 whitespace-nowrap">{timeSlotLabel[slot]}</td>
                {fields.map((f) => (
                  <td key={f} className="py-2 pr-4 text-gray-700">
                    {formatValue(section?.[slot]?.[f])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderKeyValueTable = (rows: Array<{ label: string; value: unknown }>) => (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b border-gray-200">
            <th className="py-2 pr-6 font-semibold text-gray-700">Feld</th>
            <th className="py-2 font-semibold text-gray-700">Wert</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-gray-100 align-top">
              <td className="py-2 pr-6 text-gray-800">{r.label}</td>
              <td className="py-2 text-gray-900 whitespace-pre-wrap">{formatValue(r.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload: BetriebstagebuchData = {
      datum,
      wochentag,
      personal,
      wasserwerteHalle,
      wasserwerteSauna,
      montag: {
        saeurekapazitaet,
        messwasserentnahmestellenReinigen,
        kuvetteAustauschen,
      },
      lufttemperatur: { innen: luftInnen, aussen: luftAussen },
      reinigung,
      kontrollgang,
      betriebsstoerungVorkommnisse,
      behobenVon,
      behobenUm,
      druckUF,
      sonstiges,
      unterschrift,
    }

    onSubmit(payload)
    handleClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-none sm:rounded-2xl shadow-xl w-screen sm:w-[95vw] max-w-none max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Betriebstagebuch</h2>
            <p className="text-sm text-gray-600">Digitales Formular nach FZB-AF-7.2.1.2-1</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Historie
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              title="Schließen"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Kopf */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
              <input
                type="date"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wochentag</label>
              <input
                type="text"
                value={wochentag}
                onChange={(e) => setWochentag(e.target.value)}
                placeholder="z.B. Montag"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs text-blue-800 font-semibold uppercase tracking-wide">Hinweis</p>
              <p className="text-sm text-blue-900 mt-1">
                Bei Abweichungen bitte Grund in „Betriebsstörung/Vorkommnisse“ oder „Sonstiges“ angeben.
              </p>
            </div>
          </div>

          {/* Personal */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal / Einteilung</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(['frueh', 'spaet'] as Shift[]).map((shift) => (
                <div key={shift} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    {shift === 'frueh' ? 'Frühschicht' : 'Spätschicht'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Schichtführung</label>
                      <input
                        value={personal[shift].schichtfuehrung}
                        onChange={(e) => updatePersonal(shift, 'schichtfuehrung', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">2. Aufsicht</label>
                      <input
                        value={personal[shift].aufsicht2}
                        onChange={(e) => updatePersonal(shift, 'aufsicht2', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">3. Aufsicht</label>
                      <input
                        value={personal[shift].aufsicht3}
                        onChange={(e) => updatePersonal(shift, 'aufsicht3', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Sauna</label>
                      <input
                        value={personal[shift].sauna}
                        onChange={(e) => updatePersonal(shift, 'sauna', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Umkleide</label>
                      <input
                        value={personal[shift].umkleide}
                        onChange={(e) => updatePersonal(shift, 'umkleide', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Kasse</label>
                      <input
                        value={personal[shift].kasse}
                        onChange={(e) => updatePersonal(shift, 'kasse', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wasserwerte Halle & Sauna */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Wasserwerte</h3>
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex rounded-full bg-gray-100 p-1">
                  {(['betriebsbeginn', 'betriebsmitte', 'betriebsende'] as TimeSlot[]).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`px-3 py-0.5 text-xs font-medium rounded-full transition-colors ${
                        selectedTimeSlot === slot
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-transparent text-gray-700 hover:bg-white'
                      }`}
                    >
                      {timeSlotLabel[slot]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Halle */}
            <div className="space-y-4">
              {HALLEN_POOLS.map((pool) => (
                <div key={pool.key} className="space-y-2">
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{pool.label}</p>
                      <p className="text-xs text-gray-600">{timeSlotLabel[selectedTimeSlot]}</p>
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                        {(['temp', 'ph', 'clFrei', 'clGes', 'clGeb', 'redox'] as WaterFieldKey[]).map((field) => (
                          <div key={field}>
                            <label className="block text-[11px] font-medium text-gray-600 mb-0.5">
                              {waterFieldLabel[field]}
                            </label>
                            <input
                              value={wasserwerteHalle[pool.key][selectedTimeSlot][field]}
                              onChange={(e) =>
                                updateWater(
                                  setWasserwerteHalle,
                                  pool.key,
                                  selectedTimeSlot,
                                  field,
                                  e.target.value
                                )
                              }
                              className="w-full max-w-[5rem] px-2 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {pool.key === 'thermal' && (
                    <div className="mt-2 border-t-4 border-gray-400 pt-2">
                      <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Sauna</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sauna */}
            <div className="space-y-4">
              {SAUNA_POOLS.map((pool) => (
                <div key={pool.key} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{pool.label}</p>
                    <p className="text-xs text-gray-600">{timeSlotLabel[selectedTimeSlot]}</p>
                  </div>
                  <div className="p-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                      {(['temp', 'ph', 'clFrei', 'clGes', 'clGeb', 'redox'] as WaterFieldKey[]).map((field) => (
                        <div key={field}>
                          <label className="block text-[11px] font-medium text-gray-600 mb-0.5">
                            {waterFieldLabel[field]}
                          </label>
                          <input
                            value={wasserwerteSauna[pool.key][selectedTimeSlot][field]}
                            onChange={(e) =>
                              updateWater(
                                setWasserwerteSauna,
                                pool.key,
                                selectedTimeSlot,
                                field,
                                e.target.value
                              )
                            }
                            className="w-full max-w-[5rem] px-2 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Montag + Lufttemperatur */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Montag / Zusatz</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Säurekapazität (mmol/l)</label>
                  <input
                    value={saeurekapazitaet}
                    onChange={(e) => setSaeurekapazitaet(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">Jeden Montag ist die Säurekapazität zu messen.</p>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={messwasserentnahmestellenReinigen}
                      onChange={(e) => setMesswasserentnahmestellenReinigen(e.target.checked)}
                    />
                    Messwasserentnahmestellen reinigen
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={kuvetteAustauschen}
                      onChange={(e) => setKuvetteAustauschen(e.target.checked)}
                    />
                    Küvetten austauschen (montags)
                  </label>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lufttemperatur</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Innen (°C)</label>
                  <input
                    value={luftInnen}
                    onChange={(e) => setLuftInnen(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Außen (°C)</label>
                  <input
                    value={luftAussen}
                    onChange={(e) => setLuftAussen(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reinigung */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reinigung</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {([
                { label: 'Halle', fruehKey: 'halleFrueh', spaetKey: 'halleSpaet' },
                { label: 'Sauna', fruehKey: 'saunaFrueh', spaetKey: 'saunaSpaet' },
                { label: 'Umkleide', fruehKey: 'umkleideFrueh', spaetKey: 'umkleideSpaet' },
                { label: 'Kasse', fruehKey: 'kasseFrueh', spaetKey: 'kasseSpaet' },
              ] as Array<{ label: string; fruehKey: keyof BetriebstagebuchData['reinigung']; spaetKey: keyof BetriebstagebuchData['reinigung'] }>).map((row) => (
                <div key={row.label} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">{row.label}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Früh</label>
                      <input
                        value={reinigung[row.fruehKey]}
                        onChange={(e) => setReinigung((prev) => ({ ...prev, [row.fruehKey]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Spät</label>
                      <input
                        value={reinigung[row.spaetKey]}
                        onChange={(e) => setReinigung((prev) => ({ ...prev, [row.spaetKey]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    *) siehe FZB-A-7.2.1.1 Reinigung der Bad-, Sanitär- und Saunaeinrichtungen
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Kontrollgang + Störungen */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontrollgang</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uhrzeit</label>
                  <input
                    value={kontrollgang.uhrzeit}
                    onChange={(e) => setKontrollgang((prev) => ({ ...prev, uhrzeit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="z.B. 10:15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Handzeichen</label>
                  <input
                    value={kontrollgang.handzeichen}
                    onChange={(e) => setKontrollgang((prev) => ({ ...prev, handzeichen: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vorkommnisse</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Betriebsstörung / Vorkommnisse</label>
                  <textarea
                    value={betriebsstoerungVorkommnisse}
                    onChange={(e) => setBetriebsstoerungVorkommnisse(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Behoben von</label>
                    <input
                      value={behobenVon}
                      onChange={(e) => setBehobenVon(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">um</label>
                    <input
                      value={behobenUm}
                      onChange={(e) => setBehobenUm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="z.B. 14:30"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Druck UF */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Druck UF (zum Schichtwechsel eintragen)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {(['1.1', '1.2', '2.1', '2.2', '2.3', '2.4'] as Array<keyof BetriebstagebuchData['druckUF']>).map((k) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{k}</label>
                  <input
                    value={druckUF[k]}
                    onChange={(e) => setDruckUF((prev) => ({ ...prev, [k]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sonstiges */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sonstiges</h3>
            <textarea
              value={sonstiges}
              onChange={(e) => setSonstiges(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>

          {/* Name */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Name</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verantwortlicher Frühschicht</label>
                <input
                  value={unterschrift.verantwortlicherFrueh}
                  onChange={(e) => setUnterschrift((prev) => ({ ...prev, verantwortlicherFrueh: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verantwortlicher Spätschicht</label>
                <input
                  value={unterschrift.verantwortlicherSpaet}
                  onChange={(e) => setUnterschrift((prev) => ({ ...prev, verantwortlicherSpaet: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>

      {/* Historie */}
      {showHistory && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60]" onClick={() => setShowHistory(false)} />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-4">
            <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-screen sm:w-[95vw] max-w-none max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Betriebstagebuch – Historie</h3>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900">Alle Einträge</p>
                    <p className="text-xs text-gray-600">{historyRows.length} Einträge</p>
                  </div>
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left border-b border-gray-200">
                          <th className="py-2 pr-4 font-semibold text-gray-700">Datum</th>
                          <th className="py-2 pr-4 font-semibold text-gray-700">Wochentag</th>
                          <th className="py-2 pr-4 font-semibold text-gray-700">Schichtführung (Früh)</th>
                          <th className="py-2 pr-4 font-semibold text-gray-700">Schichtführung (Spät)</th>
                          <th className="py-2 pr-4 font-semibold text-gray-700">Erstellt am</th>
                          <th className="py-2 font-semibold text-gray-700">Aktion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyRows.map((r) => (
                          <tr key={r.id} className="border-b border-gray-100">
                            <td className="py-2 pr-4 text-gray-900">{r.datum || '—'}</td>
                            <td className="py-2 pr-4 text-gray-700">{r.wochentag || '—'}</td>
                            <td className="py-2 pr-4 text-gray-700">{r.fruehSF || '—'}</td>
                            <td className="py-2 pr-4 text-gray-700">{r.spaetSF || '—'}</td>
                            <td className="py-2 pr-4 text-gray-600">
                              {new Date(r.submittedAt).toLocaleString('de-DE')}
                            </td>
                            <td className="py-2">
                              <button
                                type="button"
                                onClick={() => setSelectedHistoryId(r.id)}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-500 text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        ))}
                        {historyRows.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-gray-500">
                              Noch keine Einträge vorhanden.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedHistory && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Details (gruppiert)</h4>
                        <p className="text-xs text-gray-600">
                          Eintrag ID: {selectedHistory.id}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedHistoryId(null)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Details schließen
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Kopf */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Kopf</h5>
                        {renderKeyValueTable([
                          { label: 'Datum', value: selectedHistory.data?.datum },
                          { label: 'Wochentag', value: selectedHistory.data?.wochentag },
                        ])}
                      </div>

                      {/* Personal */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Personal / Einteilung</h5>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="border border-gray-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-700 mb-2">Frühschicht</p>
                            {renderKeyValueTable([
                              { label: 'Schichtführung', value: selectedHistory.data?.personal?.frueh?.schichtfuehrung },
                              { label: '2. Aufsicht', value: selectedHistory.data?.personal?.frueh?.aufsicht2 },
                              { label: '3. Aufsicht', value: selectedHistory.data?.personal?.frueh?.aufsicht3 },
                              { label: 'Sauna', value: selectedHistory.data?.personal?.frueh?.sauna },
                              { label: 'Umkleide', value: selectedHistory.data?.personal?.frueh?.umkleide },
                              { label: 'Kasse', value: selectedHistory.data?.personal?.frueh?.kasse },
                            ])}
                          </div>
                          <div className="border border-gray-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-700 mb-2">Spätschicht</p>
                            {renderKeyValueTable([
                              { label: 'Schichtführung', value: selectedHistory.data?.personal?.spaet?.schichtfuehrung },
                              { label: '2. Aufsicht', value: selectedHistory.data?.personal?.spaet?.aufsicht2 },
                              { label: '3. Aufsicht', value: selectedHistory.data?.personal?.spaet?.aufsicht3 },
                              { label: 'Sauna', value: selectedHistory.data?.personal?.spaet?.sauna },
                              { label: 'Umkleide', value: selectedHistory.data?.personal?.spaet?.umkleide },
                              { label: 'Kasse', value: selectedHistory.data?.personal?.spaet?.kasse },
                            ])}
                          </div>
                        </div>
                      </div>

                      {/* Wasserwerte Halle */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Wasserwerte – Halle</h5>
                        <div className="space-y-4">
                          {HALLEN_POOLS.map((p) => {
                            const sec = selectedHistory.data?.wasserwerteHalle?.[p.key]
                            if (!hasAnyWaterValue(sec)) return null
                            return (
                              <div key={p.key} className="border border-gray-200 rounded-lg p-3">
                                <p className="text-xs font-semibold text-gray-700 mb-2">{p.label}</p>
                                {renderWaterTable(sec)}
                              </div>
                            )
                          })}
                          {HALLEN_POOLS.every((p) => !hasAnyWaterValue(selectedHistory.data?.wasserwerteHalle?.[p.key])) && (
                            <p className="text-sm text-gray-600">Keine Wasserwerte erfasst.</p>
                          )}
                        </div>
                      </div>

                      {/* Wasserwerte Sauna */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Wasserwerte – Sauna</h5>
                        <div className="space-y-4">
                          {SAUNA_POOLS.map((p) => {
                            const sec = selectedHistory.data?.wasserwerteSauna?.[p.key]
                            if (!hasAnyWaterValue(sec)) return null
                            return (
                              <div key={p.key} className="border border-gray-200 rounded-lg p-3">
                                <p className="text-xs font-semibold text-gray-700 mb-2">{p.label}</p>
                                {renderWaterTable(sec)}
                              </div>
                            )
                          })}
                          {SAUNA_POOLS.every((p) => !hasAnyWaterValue(selectedHistory.data?.wasserwerteSauna?.[p.key])) && (
                            <p className="text-sm text-gray-600">Keine Wasserwerte erfasst.</p>
                          )}
                        </div>
                      </div>

                      {/* Montag / Zusatz + Lufttemperatur */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Montag / Zusatz &amp; Lufttemperatur</h5>
                        {renderKeyValueTable([
                          { label: 'Säurekapazität (mmol/l)', value: selectedHistory.data?.montag?.saeurekapazitaet },
                          { label: 'Messwasserentnahmestellen reinigen', value: selectedHistory.data?.montag?.messwasserentnahmestellenReinigen },
                          { label: 'Küvetten austauschen', value: selectedHistory.data?.montag?.kuvetteAustauschen },
                          { label: 'Lufttemperatur innen (°C)', value: selectedHistory.data?.lufttemperatur?.innen },
                          { label: 'Lufttemperatur außen (°C)', value: selectedHistory.data?.lufttemperatur?.aussen },
                        ])}
                      </div>

                      {/* Reinigung */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Reinigung</h5>
                        {renderKeyValueTable([
                          { label: 'Halle Früh', value: selectedHistory.data?.reinigung?.halleFrueh },
                          { label: 'Halle Spät', value: selectedHistory.data?.reinigung?.halleSpaet },
                          { label: 'Sauna Früh', value: selectedHistory.data?.reinigung?.saunaFrueh },
                          { label: 'Sauna Spät', value: selectedHistory.data?.reinigung?.saunaSpaet },
                          { label: 'Umkleide Früh', value: selectedHistory.data?.reinigung?.umkleideFrueh },
                          { label: 'Umkleide Spät', value: selectedHistory.data?.reinigung?.umkleideSpaet },
                          { label: 'Kasse Früh', value: selectedHistory.data?.reinigung?.kasseFrueh },
                          { label: 'Kasse Spät', value: selectedHistory.data?.reinigung?.kasseSpaet },
                        ])}
                      </div>

                      {/* Kontrollgang */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Kontrollgang</h5>
                        {renderKeyValueTable([
                          { label: 'Uhrzeit', value: selectedHistory.data?.kontrollgang?.uhrzeit },
                          { label: 'Handzeichen', value: selectedHistory.data?.kontrollgang?.handzeichen },
                        ])}
                      </div>

                      {/* Vorkommnisse */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Vorkommnisse</h5>
                        {renderKeyValueTable([
                          { label: 'Betriebsstörung / Vorkommnisse', value: selectedHistory.data?.betriebsstoerungVorkommnisse },
                          { label: 'Behoben von', value: selectedHistory.data?.behobenVon },
                          { label: 'Behoben um', value: selectedHistory.data?.behobenUm },
                        ])}
                      </div>

                      {/* Druck UF */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Druck UF</h5>
                        {renderKeyValueTable([
                          { label: '1.1', value: selectedHistory.data?.druckUF?.['1.1'] },
                          { label: '1.2', value: selectedHistory.data?.druckUF?.['1.2'] },
                          { label: '2.1', value: selectedHistory.data?.druckUF?.['2.1'] },
                          { label: '2.2', value: selectedHistory.data?.druckUF?.['2.2'] },
                          { label: '2.3', value: selectedHistory.data?.druckUF?.['2.3'] },
                          { label: '2.4', value: selectedHistory.data?.druckUF?.['2.4'] },
                        ])}
                      </div>

                      {/* Sonstiges */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Sonstiges</h5>
                        {renderKeyValueTable([{ label: 'Sonstiges', value: selectedHistory.data?.sonstiges }])}
                      </div>

                      {/* Name */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Name</h5>
                        {renderKeyValueTable([
                          { label: 'Verantwortlicher Frühschicht', value: selectedHistory.data?.unterschrift?.verantwortlicherFrueh },
                          { label: 'Verantwortlicher Spätschicht', value: selectedHistory.data?.unterschrift?.verantwortlicherSpaet },
                        ])}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

