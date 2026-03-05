'use client'

import { useState } from 'react'

interface ChecklisteEHFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
}

type EhNorm = 'DIN 13169' | 'DIN 13157'

const DIN_13169_ITEMS: string[] = [
  '2x Heftpflaster (5 m x 2,5 cm)',
  '24x Wundschnellverband (10 x 6 cm)',
  '12x Fingerkuppenverband (5 x 4 cm)',
  '12x Fingerverband (12 x 2 cm)',
  '12x Pflasterstrips (7,2 x 1,9 cm)',
  '24x Pflasterstrips (7,2 x 2,5 cm)',
  '2x Verbandpäckchen K',
  '6x Verbandpäckchen M',
  '2x Verbandpäckchen G',
  '2x Verbandtuch A',
  '12x Kompresse (10 x 10 cm)',
  '4x Augenkompresse',
  '4x Fixierbinde (4 m x 6 cm)',
  '4x Fixierbinde (4 m x 8 cm)',
  '4x Dreiecktuch (DIN 13168-D)',
  '2x Medizinische Gesichtsmasken (DIN EN 14683)',
  '8x Feuchttücher zur Reinigung unverletzter Haut',
  '2x Rettungsdecke (210 x 160 cm)',
  '2x Kälte-Sofortkompresse',
  '8 Paar Einmalhandschuhe (DIN EN 455)',
  '4x Folienbeutel',
  '10x Vliesstofftücher',
  '1x Verbandkastenschere',
  'Inhaltsverzeichnis vorhanden',
  'Erste-Hilfe-Broschüre / DGUV-Information vorhanden',
  'Alle sterilen Materialien im Verfallsdatum',
  'Verbandkasten gut erreichbar und deutlich gekennzeichnet'
]

const DIN_13157_ITEMS: string[] = [
  '12x Pflasterstrips (1,9 x 7,2 cm)',
  '12x Pflasterstrips (2,5 x 7,2 cm)',
  '6x Fingerkuppenverbände',
  '6x Fingerverbände (12 x 2 cm)',
  '12x Wundschnellverbände (10 x 6 cm)',
  '1x Heftpflasterspule (2,5 cm x 5 m)',
  '6x Wundkompressen (10 x 10 cm)',
  '2x Augenkompressen',
  '1x Verbandtuch (60 x 80 cm)',
  '3x Verbandpäckchen M',
  '1x Verbandpäckchen G',
  '1x Verbandpäckchen K',
  '2x Fixierbinden (6 cm)',
  '2x Fixierbinden (8 cm)',
  '2x Dreiecktücher',
  '1x Rettungsdecke (210 x 160 cm)',
  '1x Verbandschere',
  '4x Einmalhandschuhe',
  '1x Sofort-Kälte-Kompresse',
  '2x Folienbeutel',
  '4x Feuchttücher zur Hautreinigung',
  '2x Gesichtsmasken (Typ I)',
  'Inhaltsverzeichnis vorhanden',
  'Alle sterilen Materialien im Verfallsdatum',
  'Verbandkasten gut erreichbar und deutlich gekennzeichnet'
]

export default function ChecklisteEHForm({ isOpen, onClose, onSubmit }: ChecklisteEHFormProps) {
  const [datum, setDatum] = useState(() => new Date().toISOString().split('T')[0])
  const [prueferName, setPrueferName] = useState('')
  const [norm, setNorm] = useState<EhNorm>('DIN 13169')
  const [standort, setStandort] = useState('')

  const items = (norm === 'DIN 13169' ? DIN_13169_ITEMS : DIN_13157_ITEMS).map((label, index) => ({
    id: `${norm}-${index + 1}`,
    label
  }))

  const [zustand, setZustand] = useState<Record<string, { ok: boolean; bemerkung: string }>>({})

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = {
      datum,
      prueferName,
      norm,
      standort,
      positionen: items.map((item) => ({
        id: item.id,
        label: item.label,
        ok: zustand[item.id]?.ok ?? false,
        bemerkung: zustand[item.id]?.bemerkung ?? ''
      }))
    }
    onSubmit(formData)
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-5xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Checkliste EH</h2>
              <p className="text-xs text-gray-600">
                Prüfung der Erste-Hilfe-Ausstattung gemäß {norm}.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-4 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Datum
                  </label>
                  <input
                    type="date"
                    value={datum}
                    onChange={(e) => setDatum(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Name des Prüfers
                  </label>
                  <input
                    type="text"
                    value={prueferName}
                    onChange={(e) => setPrueferName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Norm
                  </label>
                  <select
                    value={norm}
                    onChange={(e) => setNorm(e.target.value as EhNorm)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="DIN 13169">DIN 13169</option>
                    <option value="DIN 13157">DIN 13157</option>
                  </select>
                </div>
              </div>

              <div className="text-sm">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Standort
                </label>
                <input
                  type="text"
                  value={standort}
                  onChange={(e) => setStandort(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="z.B. EH-Raum, Sauna, Kasse, Technikraum …"
                  required
                />
              </div>

              <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full text-xs md:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">
                        Position
                      </th>
                      <th className="px-3 py-2 text-center font-medium text-gray-500 w-24">
                        i.O.
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 w-64">
                        Bemerkung
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100">
                        <td className="px-3 py-2 align-top text-gray-800">
                          {item.label}
                        </td>
                        <td className="px-3 py-2 text-center align-top">
                          <input
                            type="checkbox"
                            checked={zustand[item.id]?.ok || false}
                            onChange={(e) =>
                              setZustand((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ok: e.target.checked,
                                  bemerkung: prev[item.id]?.bemerkung || ''
                                }
                              }))
                            }
                          />
                        </td>
                        <td className="px-3 py-2 align-top">
                          <input
                            type="text"
                            value={zustand[item.id]?.bemerkung || ''}
                            onChange={(e) =>
                              setZustand((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ok: prev[item.id]?.ok || false,
                                  bemerkung: e.target.value
                                }
                              }))
                            }
                            className="w-full px-2 py-1 border border-gray-200 rounded"
                            placeholder="Abweichungen, Austausch, Nachbestellung…"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Speichern
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

