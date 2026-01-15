'use client'

import { useState } from 'react'

interface RettungsuebungFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RettungsuebungData) => void
}

interface RettungsuebungData {
  anrede: 'Herr' | 'Frau'
  vorname: string
  nachname: string
  beschaeftigtBei: string
  einrichtung: string
  abnahmesituation: string
  nameDesBades: string
  beckentyp: string
  beckenLaenge: string
  beckenBreite: string
  wassertiefe: string
  leistungHilfeHerbeirufen: string
  leistungNotrufAbsetzen: string
  leistungSprungInsWasser: string
  leistungAnschwimmenAbtauchen: string
  leistungRettungspuppeHeraufholen: string
  leistungRettungspuppeLoslassen: string
  fortsetzungUmklammerungVermeiden: string
  fortsetzungBefreiungsgriff: string
  fortsetzungFesselschleppgriff: string
  fortsetzungSichernBeckenrand: string
  fortsetzungAusDemWasser: string
  nachfrageNotruf: string
  hlwDurchgefuehrt: string
  ersteHilfeKurs: 'ja' | 'nein'
  ersteHilfeOrganisation: string
  ersteHilfeDatum: string
  abnehmendeName: string
  abnehmendeOrt: string
  abnehmendeDatum: string
  abnehmendeUnterschrift: string
  kenntnisName: string
  kenntnisMassnahme1: string
  kenntnisMassnahme2: string
  kenntnisZuErledigenBis: string
  kenntnisOrt: string
  kenntnisDatum: string
  kenntnisUnterschrift: string
}

const RettungsuebungForm = ({ isOpen, onClose, onSubmit }: RettungsuebungFormProps) => {
  const [formData, setFormData] = useState<RettungsuebungData>({
    anrede: 'Herr',
    vorname: '',
    nachname: '',
    beschaeftigtBei: '',
    einrichtung: '',
    abnahmesituation: '',
    nameDesBades: '',
    beckentyp: '',
    beckenLaenge: '',
    beckenBreite: '',
    wassertiefe: '',
    leistungHilfeHerbeirufen: '',
    leistungNotrufAbsetzen: '',
    leistungSprungInsWasser: '',
    leistungAnschwimmenAbtauchen: '',
    leistungRettungspuppeHeraufholen: '',
    leistungRettungspuppeLoslassen: '',
    fortsetzungUmklammerungVermeiden: '',
    fortsetzungBefreiungsgriff: '',
    fortsetzungFesselschleppgriff: '',
    fortsetzungSichernBeckenrand: '',
    fortsetzungAusDemWasser: '',
    nachfrageNotruf: '',
    hlwDurchgefuehrt: '',
    ersteHilfeKurs: 'nein',
    ersteHilfeOrganisation: '',
    ersteHilfeDatum: '',
    abnehmendeName: '',
    abnehmendeOrt: '',
    abnehmendeDatum: '',
    abnehmendeUnterschrift: '',
    kenntnisName: '',
    kenntnisMassnahme1: '',
    kenntnisMassnahme2: '',
    kenntnisZuErledigenBis: '',
    kenntnisOrt: '',
    kenntnisDatum: '',
    kenntnisUnterschrift: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      anrede: 'Herr',
      vorname: '',
      nachname: '',
      beschaeftigtBei: '',
      einrichtung: '',
      abnahmesituation: '',
      nameDesBades: '',
      beckentyp: '',
      beckenLaenge: '',
      beckenBreite: '',
      wassertiefe: '',
      leistungHilfeHerbeirufen: '',
      leistungNotrufAbsetzen: '',
      leistungSprungInsWasser: '',
      leistungAnschwimmenAbtauchen: '',
      leistungRettungspuppeHeraufholen: '',
      leistungRettungspuppeLoslassen: '',
      fortsetzungUmklammerungVermeiden: '',
      fortsetzungBefreiungsgriff: '',
      fortsetzungFesselschleppgriff: '',
      fortsetzungSichernBeckenrand: '',
      fortsetzungAusDemWasser: '',
      nachfrageNotruf: '',
      hlwDurchgefuehrt: '',
      ersteHilfeKurs: 'nein',
      ersteHilfeOrganisation: '',
      ersteHilfeDatum: '',
      abnehmendeName: '',
      abnehmendeOrt: '',
      abnehmendeDatum: '',
      abnehmendeUnterschrift: '',
      kenntnisName: '',
      kenntnisMassnahme1: '',
      kenntnisMassnahme2: '',
      kenntnisZuErledigenBis: '',
      kenntnisOrt: '',
      kenntnisDatum: '',
      kenntnisUnterschrift: ''
    })
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  if (!isOpen) return null

  const leistungsnachweise = [
    { key: 'leistungHilfeHerbeirufen', label: 'Hilfe herbeirufen' },
    { key: 'leistungNotrufAbsetzen', label: 'Absetzen des Notrufs veranlassen' },
    { key: 'leistungSprungInsWasser', label: 'Sprung ins Wasser' },
    { key: 'leistungAnschwimmenAbtauchen', label: 'Anschwimmen/Abtauchen zur auf dem Beckenboden liegenden Rettungspuppe' },
    { key: 'leistungRettungspuppeHeraufholen', label: 'Heraufholen der Rettungspuppe' },
    { key: 'leistungRettungspuppeLoslassen', label: 'Loslassen der Puppe' }
  ] as const

  const fortsetzung = [
    { key: 'fortsetzungUmklammerungVermeiden', label: 'Vermeidung einer Umklammerung' },
    { key: 'fortsetzungBefreiungsgriff', label: 'Lösen aus einer Umklammerung durch einen Befreiungsgriff (Befreiung aus Halsumklammerung von hinten oder Halswürgegriff von hinten)' },
    { key: 'fortsetzungFesselschleppgriff', label: 'Schleppen der Person zum Beckenrand im Fesselschleppgriff' },
    { key: 'fortsetzungSichernBeckenrand', label: 'Sichern der Person am Beckenrand' },
    { key: 'fortsetzungAusDemWasser', label: 'Verbringen der Person aus dem Wasser und Ablegen auf dem Beckenumgang (nur andeuten)' }
  ] as const

  const handleCheckboxChange = (key: typeof leistungsnachweise[number]['key'] | typeof fortsetzung[number]['key'], checked: boolean) => {
    setFormData(prev => ({ ...prev, [key]: checked ? 'Ja' : '' }))
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-sky-600 to-blue-600 text-white p-6 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">🛟 Rettungsübung</h2>
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Teilnehmer/in</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Anrede</label>
                  <select
                    value={formData.anrede}
                    onChange={(e) => setFormData({ ...formData, anrede: e.target.value as 'Herr' | 'Frau' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Herr">Herr</option>
                    <option value="Frau">Frau</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Vorname</label>
                  <input
                    type="text"
                    value={formData.vorname}
                    onChange={(e) => setFormData({ ...formData, vorname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Nachname</label>
                  <input
                    type="text"
                    value={formData.nachname}
                    onChange={(e) => setFormData({ ...formData, nachname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Beschäftigt in/bei</label>
                  <input
                    type="text"
                    value={formData.beschaeftigtBei}
                    onChange={(e) => setFormData({ ...formData, beschaeftigtBei: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Einrichtung/Schule/Verein</label>
                  <input
                    type="text"
                    value={formData.einrichtung}
                    onChange={(e) => setFormData({ ...formData, einrichtung: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Abnahmesituation</label>
                  <input
                    type="text"
                    value={formData.abnahmesituation}
                    onChange={(e) => setFormData({ ...formData, abnahmesituation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bad/Becken</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Name des Bades</label>
                  <input
                    type="text"
                    value={formData.nameDesBades}
                    onChange={(e) => setFormData({ ...formData, nameDesBades: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Beckentyp</label>
                  <input
                    type="text"
                    value={formData.beckentyp}
                    onChange={(e) => setFormData({ ...formData, beckentyp: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Beckenlänge (m)</label>
                  <input
                    type="text"
                    value={formData.beckenLaenge}
                    onChange={(e) => setFormData({ ...formData, beckenLaenge: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Beckenbreite (m)</label>
                  <input
                    type="text"
                    value={formData.beckenBreite}
                    onChange={(e) => setFormData({ ...formData, beckenBreite: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Wassertiefe (m)</label>
                  <input
                    type="text"
                    value={formData.wassertiefe}
                    onChange={(e) => setFormData({ ...formData, wassertiefe: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nachweis der Leistungen</h3>
              <div className="space-y-2">
                {leistungsnachweise.map(item => (
                  <label key={item.key} className="flex items-start space-x-3 text-sm text-gray-900">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={formData[item.key] === 'Ja'}
                      onChange={(e) => handleCheckboxChange(item.key, e.target.checked)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fortsetzung der Übung</h3>
              <div className="space-y-2">
                {fortsetzung.map(item => (
                  <label key={item.key} className="flex items-start space-x-3 text-sm text-gray-900">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={formData[item.key] === 'Ja'}
                      onChange={(e) => handleCheckboxChange(item.key, e.target.checked)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Zusätzliche Punkte</h3>
              <div className="space-y-2">
                <label className="flex items-start space-x-3 text-sm text-gray-900">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={formData.nachfrageNotruf === 'Ja'}
                    onChange={(e) => setFormData({ ...formData, nachfrageNotruf: e.target.checked ? 'Ja' : '' })}
                  />
                  <span>Nachfrage, ob der Notruf abgesetzt wurde</span>
                </label>
                <label className="flex items-start space-x-3 text-sm text-gray-900">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={formData.hlwDurchgefuehrt === 'Ja'}
                    onChange={(e) => setFormData({ ...formData, hlwDurchgefuehrt: e.target.checked ? 'Ja' : '' })}
                  />
                  <span>Herz-Lungen-Wiederbelebung über mindestens drei Minuten inkl. fünf Initialbeatmungen</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Erste-Hilfe-Kurs</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Bescheinigung liegt vor</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-sm text-gray-900">
                      <input
                        type="radio"
                        name="ersteHilfeKurs"
                        checked={formData.ersteHilfeKurs === 'ja'}
                        onChange={() => setFormData({ ...formData, ersteHilfeKurs: 'ja' })}
                      />
                      <span>Ja</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm text-gray-900">
                      <input
                        type="radio"
                        name="ersteHilfeKurs"
                        checked={formData.ersteHilfeKurs === 'nein'}
                        onChange={() => setFormData({ ...formData, ersteHilfeKurs: 'nein' })}
                      />
                      <span>Nein</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Ausbildende Organisation</label>
                  <input
                    type="text"
                    value={formData.ersteHilfeOrganisation}
                    onChange={(e) => setFormData({ ...formData, ersteHilfeOrganisation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Datum</label>
                  <input
                    type="date"
                    value={formData.ersteHilfeDatum}
                    onChange={(e) => setFormData({ ...formData, ersteHilfeDatum: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Abnehmende/r</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Name, Vorname</label>
                  <input
                    type="text"
                    value={formData.abnehmendeName}
                    onChange={(e) => setFormData({ ...formData, abnehmendeName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Ort</label>
                  <input
                    type="text"
                    value={formData.abnehmendeOrt}
                    onChange={(e) => setFormData({ ...formData, abnehmendeOrt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Datum</label>
                  <input
                    type="date"
                    value={formData.abnehmendeDatum}
                    onChange={(e) => setFormData({ ...formData, abnehmendeDatum: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Stempel/Unterschrift</label>
                  <input
                    type="text"
                    value={formData.abnehmendeUnterschrift}
                    onChange={(e) => setFormData({ ...formData, abnehmendeUnterschrift: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Zur Kenntnis genommen</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.kenntnisName}
                    onChange={(e) => setFormData({ ...formData, kenntnisName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Erforderliche Maßnahmen 1</label>
                  <input
                    type="text"
                    value={formData.kenntnisMassnahme1}
                    onChange={(e) => setFormData({ ...formData, kenntnisMassnahme1: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Erforderliche Maßnahmen 2</label>
                  <input
                    type="text"
                    value={formData.kenntnisMassnahme2}
                    onChange={(e) => setFormData({ ...formData, kenntnisMassnahme2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Zu erledigen bis</label>
                  <input
                    type="date"
                    value={formData.kenntnisZuErledigenBis}
                    onChange={(e) => setFormData({ ...formData, kenntnisZuErledigenBis: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Ort</label>
                  <input
                    type="text"
                    value={formData.kenntnisOrt}
                    onChange={(e) => setFormData({ ...formData, kenntnisOrt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Datum</label>
                  <input
                    type="date"
                    value={formData.kenntnisDatum}
                    onChange={(e) => setFormData({ ...formData, kenntnisDatum: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Stempel/Unterschrift (Betriebsleiter:in)</label>
                  <input
                    type="text"
                    value={formData.kenntnisUnterschrift}
                    onChange={(e) => setFormData({ ...formData, kenntnisUnterschrift: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

export default RettungsuebungForm
