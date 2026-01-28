'use client'

import { useMemo, useState } from 'react'
import { createSchulungUnterweisungEmail, sendEmailToMultiple } from '@/lib/emailService'

interface SchulungUnterweisungFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: SchulungUnterweisungFormData) => void
  submissions: Array<{
    id: string
    submittedAt: string
    formData: SchulungUnterweisungFormData
  }>
  isAdmin: boolean
}

interface SchulungUnterweisungFormData {
  durchgefuehrtVon: string
  datum: string
  schulungsinhalte: string
  teilnehmer: Array<{
    vorname: string
    nachname: string
    bestaetigungTeilnahme: boolean
  }>
}

const createPdfBlob = async (data: SchulungUnterweisungFormData): Promise<Blob> => {
  const jsPDFModule = await import('jspdf')
  const jsPDF = jsPDFModule.default || jsPDFModule
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 40
  const lineHeight = 16
  let y = 50

  const addHeading = (text: string) => {
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.text(text, marginX, y)
    y += 22
    doc.setFont(undefined, 'normal')
    doc.setFontSize(11)
  }

  const addLine = (label: string, value: string) => {
    const content = `${label}: ${value || '-'}`
    const lines = doc.splitTextToSize(content, pageWidth - marginX * 2)
    lines.forEach((line: string) => {
      if (y > 780) {
        doc.addPage()
        y = 50
      }
      doc.text(line, marginX, y)
      y += lineHeight
    })
  }

  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('Schulung / Unterweisung', marginX, y)
  y += 28
  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')

  addHeading('Allgemeine Angaben')
  addLine('Durchgeführt von', data.durchgefuehrtVon)
  addLine('Datum', data.datum)

  addHeading('Schulungsinhalte')
  addLine('Inhalte', data.schulungsinhalte || '-')

  addHeading('Teilnehmer/in')
  if (data.teilnehmer.length === 0) {
    addLine('Teilnehmer', '-')
  } else {
    data.teilnehmer.forEach((participant, index) => {
      const name = `${participant.vorname} ${participant.nachname}`.trim()
      addLine(`Teilnehmer ${index + 1}`, name || '-')
      addLine(`Bestätigung ${index + 1}`, participant.bestaetigungTeilnahme ? 'Teilnahme bestätigt' : 'Nicht bestätigt')
    })
  }

  return doc.output('blob')
}

const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onloadend = () => {
    const result = reader.result as string
    const base64 = result.includes(',') ? result.split(',')[1] : result
    resolve(base64 || '')
  }
  reader.onerror = () => reject(new Error('PDF konnte nicht gelesen werden'))
  reader.readAsDataURL(blob)
})

const SchulungUnterweisungForm = ({
  isOpen,
  onClose,
  onSubmit,
  submissions,
  isAdmin
}: SchulungUnterweisungFormProps) => {
  const [formData, setFormData] = useState<SchulungUnterweisungFormData>({
    durchgefuehrtVon: '',
    datum: new Date().toISOString().split('T')[0],
    schulungsinhalte: '',
    teilnehmer: [{
      vorname: '',
      nachname: '',
      bestaetigungTeilnahme: false
    }]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const tableRows = useMemo(() => submissions || [], [submissions])

  const updateTeilnehmer = (index: number, update: Partial<SchulungUnterweisungFormData['teilnehmer'][number]>) => {
    setFormData((prev) => {
      const next = [...prev.teilnehmer]
      next[index] = { ...next[index], ...update }
      return { ...prev, teilnehmer: next }
    })
  }

  const addTeilnehmer = () => {
    setFormData((prev) => ({
      ...prev,
      teilnehmer: [...prev.teilnehmer, { vorname: '', nachname: '', bestaetigungTeilnahme: false }]
    }))
  }

  const removeTeilnehmer = (index: number) => {
    setFormData((prev) => {
      const next = prev.teilnehmer.filter((_, i) => i !== index)
      return { ...prev, teilnehmer: next.length ? next : [{ vorname: '', nachname: '', bestaetigungTeilnahme: false }] }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const hasMissingName = formData.teilnehmer.some((participant) => !participant.vorname.trim() || !participant.nachname.trim())
    if (hasMissingName) {
      alert('Bitte Vor- und Nachnamen für alle Teilnehmer ausfüllen.')
      return
    }
    const hasMissingConfirmation = formData.teilnehmer.some((participant) => !participant.bestaetigungTeilnahme)
    if (hasMissingConfirmation) {
      alert('Bitte die Teilnahme für alle Teilnehmer bestätigen.')
      return
    }
    setIsSubmitting(true)
    try {
      await Promise.resolve(onSubmit(formData))
      const pdfBlob = await createPdfBlob(formData)
      const pdfBase64 = await blobToBase64(pdfBlob)
      const firstParticipant = formData.teilnehmer[0] || { vorname: '', nachname: '' }
      const safeName = `${firstParticipant.nachname || 'Teilnehmer'}_${firstParticipant.vorname || ''}`
        .trim()
        .replace(/\s+/g, '_')
      const fileName = `Schulung_Unterweisung_${formData.datum}_${safeName || 'Unbekannt'}.pdf`

      const emailData = createSchulungUnterweisungEmail(formData)
      const emailResult = await sendEmailToMultiple({
        ...emailData,
        attachments: [
          {
            filename: fileName,
            content: pdfBase64,
            contentType: 'application/pdf',
            encoding: 'base64'
          }
        ]
      })

      if (!emailResult.success) {
        alert('E-Mail konnte nicht gesendet werden. Bitte prüfen Sie die Logs.')
      }

      setFormData({
        durchgefuehrtVon: '',
        datum: new Date().toISOString().split('T')[0],
        schulungsinhalte: '',
        teilnehmer: [{
          vorname: '',
          nachname: '',
          bestaetigungTeilnahme: false
        }]
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
                <span className="text-3xl">📚</span>
                <h3 className="text-xl font-bold text-gray-900">
                  Schulung / Unterweisung
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
              Dokumentation der Schulungen und Unterweisungen im Freizeitbad LA OLA
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Durchgeführt von *</label>
                <input
                  type="text"
                  value={formData.durchgefuehrtVon}
                  onChange={(e) => setFormData({ ...formData, durchgefuehrtVon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
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

            <div className="border border-gray-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Schulungsinhalte
              </h4>
              <textarea
                value={formData.schulungsinhalte}
                onChange={(e) => setFormData({ ...formData, schulungsinhalte: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                placeholder="Inhalte der Schulung / Unterweisung"
                required
              />
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Teilnehmer/in
              </h4>
              <div className="space-y-4">
                {formData.teilnehmer.map((participant, index) => (
                  <div key={`${participant.nachname}-${index}`} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-900">Teilnehmer {index + 1}</span>
                      {formData.teilnehmer.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTeilnehmer(index)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Entfernen
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Vorname *</label>
                        <input
                          type="text"
                          value={participant.vorname}
                          onChange={(e) => updateTeilnehmer(index, { vorname: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Nachname *</label>
                        <input
                          type="text"
                          value={participant.nachname}
                          onChange={(e) => updateTeilnehmer(index, { nachname: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-900 mt-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={participant.bestaetigungTeilnahme}
                        onChange={(e) => updateTeilnehmer(index, { bestaetigungTeilnahme: e.target.checked })}
                        required
                      />
                      Bestätigung des Teilnehmers, an der Schulung teilgenommen zu haben und die Inhalte verstanden zu haben
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={addTeilnehmer}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Teilnehmer hinzufügen
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {isSubmitting ? 'Speichert...' : 'Schulung speichern'}
              </button>
            </div>
          </form>

          {isAdmin && (
            <div className="px-6 pb-6">
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-base font-semibold text-gray-900 mb-3">
                  Nachweise
                </h4>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">Datum</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">Teilnehmer/in</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">Thema</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">Schulungen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tableRows.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-600">
                            Keine Nachweise vorhanden.
                          </td>
                        </tr>
                      ) : (
                        tableRows.map((row) => (
                          <tr key={row.id}>
                            <td className="px-4 py-2 text-gray-900">{row.formData.datum}</td>
                            <td className="px-4 py-2 text-gray-900">
                              {row.formData.teilnehmer.length > 0
                                ? row.formData.teilnehmer.map((participant) => `${participant.vorname} ${participant.nachname}`.trim()).join(', ')
                                : '-'}
                            </td>
                            <td className="px-4 py-2 text-gray-900">{row.formData.thema}</td>
                            <td className="px-4 py-2 text-gray-900 whitespace-pre-wrap">
                              {row.formData.schulungsinhalte || '-'}
                            </td>
                          </tr>
                        ))
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

export default SchulungUnterweisungForm
