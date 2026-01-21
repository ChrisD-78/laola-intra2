'use client'

import { useState } from 'react'
import { createLeistungsnachweisEmail, sendEmailToMultiple } from '@/lib/emailService'

interface LeistungsnachweisAzubiFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: LeistungsnachweisAzubiData) => void
}

interface LeistungsnachweisAzubiData {
  datum: string
  auszubildende: string
  ausbilder: string
  schwimmen: {
    kraul50m: string
    brust50m: string
    freistil100m: string
    ruecken200m: string
    gesamtzeit: string
    bemerkungen: string
  }
  zusaetze: {
    kleiderschwimmen300m: string
    abschleppen50m: string
    streckentauchen35m: string
    zeitschwimmen100m: string
    kopfsprung3m: string
    wettkampftechnik50m: string
  }
}

const LeistungsnachweisAzubiForm = ({ isOpen, onClose, onSubmit }: LeistungsnachweisAzubiFormProps) => {
  const [formData, setFormData] = useState<LeistungsnachweisAzubiData>({
    datum: new Date().toISOString().split('T')[0],
    auszubildende: '',
    ausbilder: '',
    schwimmen: {
      kraul50m: '',
      brust50m: '',
      freistil100m: '',
      ruecken200m: '',
      gesamtzeit: '',
      bemerkungen: ''
    },
    zusaetze: {
      kleiderschwimmen300m: '',
      abschleppen50m: '',
      streckentauchen35m: '',
      zeitschwimmen100m: '',
      kopfsprung3m: '',
      wettkampftechnik50m: ''
    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await Promise.resolve(onSubmit(formData))
      const emailData = createLeistungsnachweisEmail(formData)
      const emailResult = await sendEmailToMultiple(emailData)
      if (!emailResult.success) {
        alert('E-Mail konnte nicht gesendet werden. Bitte prüfen Sie die Logs.')
      }
      setFormData({
        datum: new Date().toISOString().split('T')[0],
        auszubildende: '',
        ausbilder: '',
        schwimmen: {
          kraul50m: '',
          brust50m: '',
          freistil100m: '',
          ruecken200m: '',
          gesamtzeit: '',
          bemerkungen: ''
        },
        zusaetze: {
          kleiderschwimmen300m: '',
          abschleppen50m: '',
          streckentauchen35m: '',
          zeitschwimmen100m: '',
          kopfsprung3m: '',
          wettkampftechnik50m: ''
        },
      })
    } catch (error) {
      console.error('Fehler beim Speichern/Senden:', error)
      alert('Fehler beim Speichern oder E-Mail-Versand.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">📋</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Leistungsnachweis Azubi
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
              Leistungsnachweis im Ausbildungsberuf „Fachangestellte/r für Bäderbetriebe“ (wöchentlich).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Datum *</label>
                <input
                  type="date"
                  value={formData.datum}
                  onChange={(e) => setFormData({ ...formData, datum: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Auszubildende/r *</label>
                <input
                  type="text"
                  value={formData.auszubildende}
                  onChange={(e) => setFormData({ ...formData, auszubildende: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Ausbilder/in</label>
                <input
                  type="text"
                  value={formData.ausbilder}
                  onChange={(e) => setFormData({ ...formData, ausbilder: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                400 m Schwimmen in höchstens 12 Minuten
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-sm">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Kraul 50 m</label>
                  <input
                    type="text"
                    value={formData.schwimmen.kraul50m}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        schwimmen: { ...formData.schwimmen, kraul50m: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Zeit"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Brust 50 m</label>
                  <input
                    type="text"
                    value={formData.schwimmen.brust50m}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        schwimmen: { ...formData.schwimmen, brust50m: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Zeit"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Freistil 100 m</label>
                  <input
                    type="text"
                    value={formData.schwimmen.freistil100m}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        schwimmen: { ...formData.schwimmen, freistil100m: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Zeit"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Rücken 200 m</label>
                  <input
                    type="text"
                    value={formData.schwimmen.ruecken200m}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        schwimmen: { ...formData.schwimmen, ruecken200m: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Zeit"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Gesamtzeit</label>
                  <input
                    type="text"
                    value={formData.schwimmen.gesamtzeit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        schwimmen: { ...formData.schwimmen, gesamtzeit: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="z.B. 11:45"
                  />
                </div>
                <div className="md:col-span-6">
                  <label className="block text-xs text-gray-600 mb-1">Bemerkungen / Mängel</label>
                  <input
                    type="text"
                    value={formData.schwimmen.bemerkungen}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        schwimmen: { ...formData.schwimmen, bemerkungen: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Kleiderschwimmen 300 m (max. 8 Min.)</label>
                  <input
                    type="text"
                    value={formData.zusaetze.kleiderschwimmen300m}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        zusaetze: { ...formData.zusaetze, kleiderschwimmen300m: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Zeit / Ergebnis"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Abschleppen 50 m (max. 2 Min.)</label>
                  <input
                    type="text"
                    value={formData.zusaetze.abschleppen50m}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        zusaetze: { ...formData.zusaetze, abschleppen50m: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Zeit / Ergebnis"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Streckentauchen 35 m</label>
                  <input
                    type="text"
                    value={formData.zusaetze.streckentauchen35m}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        zusaetze: { ...formData.zusaetze, streckentauchen35m: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ergebnis"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Zeitschwimmen 100 m (max. 1:30)</label>
                  <input
                    type="text"
                    value={formData.zusaetze.zeitschwimmen100m}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        zusaetze: { ...formData.zusaetze, zeitschwimmen100m: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Zeit"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Kopfsprung aus 3 m Höhe</label>
                  <input
                    type="text"
                    value={formData.zusaetze.kopfsprung3m}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        zusaetze: { ...formData.zusaetze, kopfsprung3m: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ergebnis"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Wettkampftechnik Start und Wende über 50 m</label>
                  <input
                    type="text"
                    value={formData.zusaetze.wettkampftechnik50m}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        zusaetze: { ...formData.zusaetze, wettkampftechnik50m: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ergebnis"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {isSubmitting ? 'Speichert...' : 'Leistungsnachweis speichern'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default LeistungsnachweisAzubiForm
