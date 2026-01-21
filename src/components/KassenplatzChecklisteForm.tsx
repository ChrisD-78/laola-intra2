 'use client'
 
 import { useMemo, useState } from 'react'
 
 interface KassenplatzChecklisteFormProps {
   isOpen: boolean
   onClose: () => void
   onSubmit: (data: KassenplatzChecklisteData) => void
   submissions: Array<{
     id: string
     submittedAt: string
     formData: KassenplatzChecklisteData
   }>
 }
 
interface KassenplatzChecklisteData {
  datum: string
  taetigkeit: string
  schicht: string
  checks: Record<string, boolean>
}
 
 const checklistItems = [
   { id: 'reinigungen_pruefen', label: 'Reinigungen prüfen (zu jedem Schichtwechsel)', section: 'Schichtwechsel' },
   { id: 'kassette_einschliessen', label: 'Kassette einschließen (Schichtwechsel)', section: 'Schichtwechsel' },
   { id: 'wechselgeld_fuellen', label: 'Wechselgeld füllen', section: 'Schichtwechsel' },
   { id: 'wechselgeld_ins_buero', label: 'Wechselgeld ins Büro', section: 'Schichtwechsel' },
   { id: 'kasse_anmelden', label: 'Kasse anmelden (Kasse und Automat!)', section: 'Frühschicht' },
   { id: 'prospekte_auffuellen', label: 'Prospekte auffüllen', section: 'Frühschicht' },
   { id: 'beleuchtung_einschalten', label: 'Beleuchtung einschalten', section: 'Frühschicht' },
   { id: 'aschenbecher_leeren', label: 'Aschenbecher leeren', section: 'Frühschicht' },
   { id: 'kassenraum_reinigen', label: 'Kassenraum reinigen', section: 'Frühschicht' },
   { id: 'eingangsbereich_innen', label: 'Eingangsbereich innen', section: 'Frühschicht' },
   { id: 'eingangsbereich_aussen', label: 'Eingangsbereich außen', section: 'Frühschicht' },
   { id: 'kassenautomaten', label: 'Kassenautomaten', section: 'Frühschicht' },
   { id: 'wc_anlage_mitarbeiter', label: 'WC-Anlage Mitarbeiter', section: 'Frühschicht' },
   { id: 'drehkreuze_ticketsaeule', label: 'Drehkreuze, Ticketsäule', section: 'Frühschicht' },
   { id: 'glastuere', label: 'Glastüre', section: 'Frühschicht' },
   { id: 'fenster', label: 'Fenster', section: 'Frühschicht' },
   { id: 'teppich_saugen', label: 'Teppich saugen', section: 'Frühschicht' },
   { id: 'tische_abwischen', label: 'Tische abwischen (Früh + ständig)', section: 'Frühschicht' },
   { id: 'kassentresen_abwischen', label: 'Kassentresen abwischen (Früh + ständig)', section: 'Frühschicht' },
   { id: 'korb_wechseln', label: 'Korb wechseln', section: 'Spätschicht' },
   { id: 'muelleimer_leeren', label: 'Mülleimer leeren', section: 'Spätschicht' },
   { id: 'boden_wischen', label: 'Boden wischen', section: 'Spätschicht' },
   { id: 'kasse_abmelden', label: 'Kasse abmelden', section: 'Spätschicht' },
   { id: 'kassenabrechnung', label: 'Kassenabrechnung machen', section: 'Spätschicht' },
   { id: 'eingaenge_schliessen', label: 'Eingänge schließen', section: 'Spätschicht' },
   { id: 'lichter_fernseher_aus', label: 'Lichter + Fernseher aus', section: 'Spätschicht' },
   { id: 'kueche_abschliessen', label: 'Küche abschließen', section: 'Spätschicht' },
   { id: 'barcodescanner_reinigen', label: 'Barcodescanner reinigen (Früh montags)', section: 'Zusatz' },
   { id: 'kuehltruhe_eis', label: 'Kühltruhe Eis', section: 'Zusatz' },
 ]
 
 const buildDefaultChecks = () =>
   checklistItems.reduce<Record<string, boolean>>((acc, item) => {
     acc[item.id] = false
     return acc
   }, {})
 
 const KassenplatzChecklisteForm = ({ isOpen, onClose, onSubmit, submissions }: KassenplatzChecklisteFormProps) => {
   const [formData, setFormData] = useState<KassenplatzChecklisteData>({
     datum: new Date().toISOString().split('T')[0],
     taetigkeit: '',
     schicht: '',
     checks: buildDefaultChecks()
   })
   const [isSubmitting, setIsSubmitting] = useState(false)
 
   const sections = useMemo(() => {
     const map = new Map<string, typeof checklistItems>()
     checklistItems.forEach(item => {
       const existing = map.get(item.section) || []
       existing.push(item)
       map.set(item.section, existing)
     })
     return Array.from(map.entries())
   }, [])
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     setIsSubmitting(true)
     try {
       onSubmit(formData)
       setFormData({
         datum: new Date().toISOString().split('T')[0],
         taetigkeit: '',
         schicht: '',
         checks: buildDefaultChecks()
       })
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
         <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
           <div className="p-6 border-b border-gray-200">
             <div className="flex items-center justify-between">
               <div className="flex items-center space-x-3">
                 <span className="text-3xl">✅</span>
                 <h3 className="text-xl font-bold text-gray-900">
                   Checkliste der Kassenplätze
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
 
           <form onSubmit={handleSubmit} className="p-6 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
               <div>
                 <label className="block text-sm font-medium text-gray-900 mb-2">
                   Tätigkeit
                 </label>
                 <input
                   type="text"
                   value={formData.taetigkeit}
                   onChange={(e) => setFormData({ ...formData, taetigkeit: e.target.value })}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   placeholder="z.B. Frühdienst"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-900 mb-2">
                   Schicht
                 </label>
                 <select
                   value={formData.schicht}
                   onChange={(e) => setFormData({ ...formData, schicht: e.target.value })}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 >
                   <option value="">Schicht auswählen</option>
                   <option value="Früh">Früh</option>
                   <option value="Spät">Spät</option>
                   <option value="Früh/Spät">Früh/Spät</option>
                 </select>
               </div>
             </div>
 
             <div className="space-y-6">
               {sections.map(([sectionName, items]) => (
                 <div key={sectionName} className="border border-gray-200 rounded-xl p-4">
                   <h4 className="text-sm font-semibold text-gray-900 mb-3">{sectionName}</h4>
                   <div className="flex flex-col gap-2">
                     {items.map(item => (
                       <label key={item.id} className="flex items-center space-x-3 text-base text-gray-900">
                         <input
                           type="checkbox"
                           checked={formData.checks[item.id]}
                           onChange={() =>
                             setFormData({
                               ...formData,
                               checks: {
                                 ...formData.checks,
                                 [item.id]: !formData.checks[item.id]
                               }
                             })
                           }
                           className="h-[25px] w-[25px] text-blue-600 border-gray-300 rounded"
                         />
                         <span>{item.label}</span>
                       </label>
                     ))}
                   </div>
                 </div>
               ))}
             </div>
 
             <div className="flex justify-end">
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
               >
                 {isSubmitting ? 'Speichert...' : 'Checkliste speichern'}
               </button>
             </div>
           </form>
 
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
                       <th className="px-4 py-2 text-left font-semibold text-gray-900">Schicht</th>
                       <th className="px-4 py-2 text-left font-semibold text-gray-900">Tätigkeit</th>
                       <th className="px-4 py-2 text-left font-semibold text-gray-900">Erledigt</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-200">
                     {submissions.length === 0 ? (
                       <tr>
                         <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                           Noch keine Einträge vorhanden.
                         </td>
                       </tr>
                     ) : (
                       submissions.map(submission => {
                         const data = submission.formData || ({} as KassenplatzChecklisteData)
                         const completed = data.checks
                           ? Object.values(data.checks).filter(Boolean).length
                           : 0
                         const total = data.checks ? Object.keys(data.checks).length : 0
                         return (
                           <tr key={submission.id}>
                             <td className="px-4 py-2 text-gray-900">
                               {data.datum || submission.submittedAt?.split('T')[0]}
                             </td>
                             <td className="px-4 py-2 text-gray-900">{data.schicht || '—'}</td>
                             <td className="px-4 py-2 text-gray-900">{data.taetigkeit || '—'}</td>
                             <td className="px-4 py-2 text-gray-900">
                               {total ? `${completed}/${total}` : '—'}
                             </td>
                           </tr>
                         )
                       })
                     )}
                   </tbody>
                 </table>
               </div>
             </div>
           </div>
         </div>
       </div>
     </>
   )
 }
 
 export default KassenplatzChecklisteForm
