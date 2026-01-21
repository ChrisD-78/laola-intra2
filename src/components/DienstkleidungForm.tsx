'use client'

import { useMemo, useState } from 'react'

interface DienstkleidungFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DienstkleidungFormData) => void
  submissions: Array<{
    id: string
    submittedAt: string
    formData: DienstkleidungFormData
  }>
  isAdmin: boolean
}

interface DienstkleidungItem {
  artikel: string
  anzahl: string
  groesse: string
}

interface DienstkleidungFormData {
  mitarbeiter: string
  datum: string
  items: DienstkleidungItem[]
  unterschriftMitarbeiter: string
  unterschriftLeitung: string
}

const emptyItem: DienstkleidungItem = { artikel: '', anzahl: '', groesse: '' }

const DienstkleidungForm = ({ isOpen, onClose, onSubmit, submissions, isAdmin }: DienstkleidungFormProps) => {
  const [formData, setFormData] = useState<DienstkleidungFormData>({
    mitarbeiter: '',
    datum: new Date().toISOString().split('T')[0],
    items: [{ ...emptyItem }],
    unterschriftMitarbeiter: '',
    unterschriftLeitung: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const tableRows = useMemo(() => submissions || [], [submissions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      onSubmit(formData)
      setFormData({
        mitarbeiter: '',
        datum: new Date().toISOString().split('T')[0],
        items: [{ ...emptyItem }],
        unterschriftMitarbeiter: '',
        unterschriftLeitung: ''
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateItem = (index: number, update: Partial<DienstkleidungItem>) => {
    const next = [...formData.items]
    next[index] = { ...next[index], ...update }
    setFormData({ ...formData, items: next })
  }

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { ...emptyItem }] })

  const removeItem = (index: number) => {
    const next = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: next.length ? next : [{ ...emptyItem }] })
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">👕</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Ausgabe Dienstkleidung
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Empfangsbestätigung für Dienstkleidung im Freizeitbad LA OLA
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Mitarbeiter/in *
                </label>
                <input
                  type="text"
                  value={formData.mitarbeiter}
                  onChange={(e) => setFormData({ ...formData, mitarbeiter: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Datum *
                </label>
                <input
                  type="date"
                  value={formData.datum}
                  onChange={(e) => setFormData({ ...formData, datum: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  Erhaltene Dienstkleidung
                </h4>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Position
                </button>
              </div>
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Art der Dienstkleidung</label>
                      <input
                        type="text"
                        value={item.artikel}
                        onChange={(e) => updateItem(index, { artikel: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="z.B. Poloshirt, kurze Hose"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Anzahl</label>
                      <input
                        type="number"
                        min="0"
                        value={item.anzahl}
                        onChange={(e) => updateItem(index, { anzahl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Größe</label>
                      <input
                        type="text"
                        value={item.groesse}
                        onChange={(e) => updateItem(index, { groesse: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="z.B. M, L"
                      />
                    </div>
                    <div className="md:col-span-4 flex justify-end">
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Position entfernen
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-600 space-y-2">
              <p>
                Abgenutzte bzw. beschädigte Dienstkleidung wird unverzüglich ausgetauscht.
              </p>
              <p>
                Dienstkleidung ist bei Ausscheiden zurückzugeben. Bei Verlust oder vorsätzlicher
                Beschädigung kann Schadenersatz bis 100 € entstehen (nach Wiederbeschaffungskosten).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Unterschrift Mitarbeiter/in
                </label>
                <input
                  type="text"
                  value={formData.unterschriftMitarbeiter}
                  onChange={(e) => setFormData({ ...formData, unterschriftMitarbeiter: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Unterschrift BU/stellv. BL
                </label>
                <input
                  type="text"
                  value={formData.unterschriftLeitung}
                  onChange={(e) => setFormData({ ...formData, unterschriftLeitung: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Name"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {isSubmitting ? 'Speichert...' : 'Ausgabe speichern'}
              </button>
            </div>
          </form>

          {isAdmin && (
            <div className="px-6 pb-6">
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-base font-semibold text-gray-900 mb-3">
                  Dokumentation
                </h4>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">Datum</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">Mitarbeiter/in</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">Dienstkleidung</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tableRows.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                            Noch keine Einträge vorhanden.
                          </td>
                        </tr>
                      ) : (
                        tableRows.map(submission => {
                          const data = submission.formData
                          const items = (data.items || [])
                            .filter(item => item.artikel || item.anzahl || item.groesse)
                            .map(item => {
                              const parts = [item.artikel, item.groesse].filter(Boolean).join(' ')
                              const qty = item.anzahl ? `x${item.anzahl}` : ''
                              return [parts || 'Unbekannt', qty].filter(Boolean).join(' ')
                            })
                            .join(', ')
                          return (
                            <tr key={submission.id}>
                              <td className="px-4 py-2 text-gray-900">
                                {data.datum || submission.submittedAt?.split('T')[0]}
                              </td>
                              <td className="px-4 py-2 text-gray-900">{data.mitarbeiter || '—'}</td>
                              <td className="px-4 py-2 text-gray-900">{items || '—'}</td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default DienstkleidungForm
