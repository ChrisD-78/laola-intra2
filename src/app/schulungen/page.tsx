'use client'

import { useState, useEffect } from 'react'
import { insertExternalProof, uploadProofPdf, getTrainings, insertTraining, deleteTrainingById, getCompletedTrainings, insertCompletedTraining, uploadTrainingFile, getProofs, deleteCompletedTraining, deleteProof } from '@/lib/db'
import { useAuth } from '@/components/AuthProvider'
import QuizOverview from '@/components/QuizOverview'

interface Schulung {
  id: string
  title: string
  description: string
  category: string
  duration: string
  status: 'Verfügbar' | 'In Bearbeitung' | 'Abgeschlossen'
  date: string
  instructor: string
  pdfUrl?: string
  videoUrl?: string
  thumbnail?: string
}

interface CompletedSchulung {
  id: string
  schulungId: string | null
  schulungTitle: string
  participantName: string
  participantSurname: string
  completedDate: string
  score?: number
  category: string
  instructor: string
  duration: string
}

export default function Schulungen() {
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<'available' | 'overview' | 'quiz'>('available')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedSchulung, setSelectedSchulung] = useState<Schulung | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Schulung | null>(null)
  const [showSchulungViewer, setShowSchulungViewer] = useState<Schulung | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showProofForm, setShowProofForm] = useState(false)
  const [showDeleteCompletedConfirm, setShowDeleteCompletedConfirm] = useState<CompletedSchulung | null>(null)
  const [showDeleteProofConfirm, setShowDeleteProofConfirm] = useState<{ id: string; bezeichnung: string } | null>(null)
  const [schulungsnachweise, setSchulungsnachweise] = useState<Array<{
    id: string
    bezeichnung: string
    vorname: string
    nachname: string
    datum: string
    pdfName?: string
    pdfUrl?: string
  }>>([])
  const [proofFilters, setProofFilters] = useState({
    bezeichnung: '',
    vorname: '',
    nachname: '',
    dateFrom: '',
    dateTo: ''
  })
  const [proofSortBy, setProofSortBy] = useState<'bezeichnung'|'vorname'|'nachname'|'datum'>('datum')
  const [proofSortOrder, setProofSortOrder] = useState<'asc'|'desc'>('desc')
  const [overviewFilters, setOverviewFilters] = useState({
    category: '',
    dateFrom: '',
    dateTo: '',
    instructor: '',
    title: '',
    instructorName: ''
  })
  const [sortBy, setSortBy] = useState<'date' | 'participant' | 'title' | 'category'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(true)
  const [quizCount, setQuizCount] = useState(0)

  // Load trainings from Supabase
  const [schulungen, setSchulungen] = useState<Schulung[]>([])

  useEffect(() => {
    const loadTrainings = async () => {
      try {
        const data = await getTrainings()
        const mapped: Schulung[] = data.map((training) => ({
          id: training.id,
          title: training.title,
          description: training.description,
          category: training.category,
          duration: training.duration,
          status: training.status,
          date: training.date,
          instructor: training.instructor,
          pdfUrl: training.pdf_url,
          videoUrl: training.video_url,
          thumbnail: training.thumbnail || '📚'
        }))
        setSchulungen(mapped)
      } catch (error) {
        console.error('Error loading trainings:', error)
      } finally {
        setLoading(false)
      }
    }
    loadTrainings()
  }, [])

  // Load completed trainings from Supabase
  const [completedSchulungen, setCompletedSchulungen] = useState<CompletedSchulung[]>([])

  useEffect(() => {
    const loadCompletedTrainings = async () => {
      try {
        const data = await getCompletedTrainings()
        const mapped: CompletedSchulung[] = data.map((training) => ({
          id: training.id,
          schulungId: training.training_id ?? null,
          schulungTitle: training.training_title,
          participantName: training.participant_name,
          participantSurname: training.participant_surname,
          completedDate: training.completed_date,
          score: training.score,
          category: training.category,
          instructor: training.instructor,
          duration: training.duration
        }))
        setCompletedSchulungen(mapped)
      } catch (error) {
        console.error('Error loading completed trainings:', error)
      }
    }
    loadCompletedTrainings()
  }, [])

  // Load external proofs from Supabase
  useEffect(() => {
    const loadProofs = async () => {
      try {
        const data = await getProofs()
        const mapped = data.map((proof) => ({
          id: proof.id,
          bezeichnung: proof.bezeichnung,
          vorname: proof.vorname,
          nachname: proof.nachname,
          datum: proof.datum,
          pdfName: proof.pdf_name,
          pdfUrl: proof.pdf_url
        }))
        setSchulungsnachweise(mapped)
      } catch (error) {
        console.error('Error loading proofs:', error)
      }
    }
    loadProofs()
  }, [])

  // Load quiz count from API
  useEffect(() => {
    const loadQuizCount = async () => {
      try {
        const response = await fetch('/api/quiz')
        if (response.ok) {
          const quizzes = await response.json()
          setQuizCount(quizzes.length)
        }
      } catch (error) {
        console.error('Error loading quiz count:', error)
      }
    }
    loadQuizCount()
  }, [])

  // Dynamische Berechnung der Anzahl pro Kategorie
  const getCategoryCount = (categoryName: string) => {
    return schulungen.filter(s => s.category === categoryName).length
  }

  const categories = [
    { name: 'Unterweisungen', icon: '📋', color: 'bg-red-100 text-red-800', count: getCategoryCount('Unterweisungen') },
    { name: 'Schulungen', icon: '🎓', color: 'bg-blue-100 text-blue-800', count: getCategoryCount('Schulungen') },
    { name: 'Gastronomie', icon: '🍽️', color: 'bg-green-100 text-green-800', count: getCategoryCount('Gastronomie') },
    { name: 'Kursverlaufspläne', icon: '📅', color: 'bg-purple-100 text-purple-800', count: getCategoryCount('Kursverlaufspläne') },
    { name: 'Quiz', icon: '🎯', color: 'bg-yellow-100 text-yellow-800', count: quizCount, isSpecial: true }
  ]

  const handleDeleteSchulung = async (schulungId: string) => {
    // Admin-Benutzer überspringen die Passwort-Abfrage
    if (isAdmin) {
      try {
        await deleteTrainingById(schulungId)
        setSchulungen(schulungen.filter(s => s.id !== schulungId))
        setShowDeleteConfirm(null)
      } catch (error) {
        console.error('Error deleting training:', error)
        alert('Fehler beim Löschen der Schulung.')
      }
    } else {
      // Nicht-Admins müssen Passwort eingeben
      const pass = prompt('Bitte Passwort eingeben:')
      if (pass === 'bl') {
        try {
          await deleteTrainingById(schulungId)
          setSchulungen(schulungen.filter(s => s.id !== schulungId))
          setShowDeleteConfirm(null)
        } catch (error) {
          console.error('Error deleting training:', error)
          alert('Fehler beim Löschen der Schulung.')
        }
      } else if (pass !== null) {
        alert('Falsches Passwort')
      }
    }
  }

  const handleDeleteCompletedTraining = async (completedId: string) => {
    // Admin-Benutzer überspringen die Passwort-Abfrage
    if (isAdmin) {
      try {
        await deleteCompletedTraining(completedId)
        setCompletedSchulungen(prev => prev.filter(c => c.id !== completedId))
        setShowDeleteCompletedConfirm(null)
      } catch (error) {
        console.error('Error deleting completed training:', error)
        alert('Fehler beim Löschen der abgeschlossenen Schulung.')
      }
    } else {
      // Nicht-Admins müssen Passwort eingeben
      const pass = prompt('Bitte Passwort eingeben:')
      if (pass === 'bl') {
        try {
          await deleteCompletedTraining(completedId)
          setCompletedSchulungen(prev => prev.filter(c => c.id !== completedId))
          setShowDeleteCompletedConfirm(null)
        } catch (error) {
          console.error('Error deleting completed training:', error)
          alert('Fehler beim Löschen der abgeschlossenen Schulung.')
        }
      } else if (pass !== null) {
        alert('Falsches Passwort')
      }
    }
  }

  const handleDeleteProof = async (proofId: string) => {
    // Admin-Benutzer überspringen die Passwort-Abfrage
    if (isAdmin) {
      try {
        await deleteProof(proofId)
        setSchulungsnachweise(prev => prev.filter(p => p.id !== proofId))
        setShowDeleteProofConfirm(null)
      } catch (error) {
        console.error('Error deleting proof:', error)
        alert('Fehler beim Löschen des externen Nachweises.')
      }
    } else {
      // Nicht-Admins müssen Passwort eingeben
      const pass = prompt('Bitte Passwort eingeben:')
      if (pass === 'bl') {
        try {
          await deleteProof(proofId)
          setSchulungsnachweise(prev => prev.filter(p => p.id !== proofId))
          setShowDeleteProofConfirm(null)
        } catch (error) {
          console.error('Error deleting proof:', error)
          alert('Fehler beim Löschen des externen Nachweises.')
        }
      } else if (pass !== null) {
        alert('Falsches Passwort')
      }
    }
  }

  const handleCategoryFilter = (categoryName: string) => {
    // Spezialbehandlung für Quiz-Kachel
    if (categoryName === 'Quiz') {
      setActiveTab('quiz')
    } else {
      setSelectedCategory(categoryName)
    }
  }

  const handleClearFilter = () => {
    setSelectedCategory(null)
  }

  const filteredSchulungen = selectedCategory 
    ? schulungen.filter(schulung => schulung.category === selectedCategory)
    : schulungen

  const handleOverviewFilterChange = (filterType: string, value: string) => {
    setOverviewFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearOverviewFilters = () => {
    setOverviewFilters({
      category: '',
      dateFrom: '',
      dateTo: '',
      instructor: '',
      title: '',
      instructorName: ''
    })
    setSortBy('date')
    setSortOrder('desc')
  }

  const ProofForm = () => {
    const [bezeichnung, setBezeichnung] = useState('')
    const [vorname, setVorname] = useState('')
    const [nachname, setNachname] = useState('')
    const [datum, setDatum] = useState('')
    const [pdfFile, setPdfFile] = useState<File | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!bezeichnung.trim() || !vorname.trim() || !nachname.trim() || !datum.trim()) return
      let publicUrl: string | undefined
      try {
        if (pdfFile) {
          const uploaded = await uploadProofPdf(pdfFile)
          publicUrl = uploaded.publicUrl
        }
        await insertExternalProof({
          bezeichnung: bezeichnung.trim(),
          vorname: vorname.trim(),
          nachname: nachname.trim(),
          datum,
          pdf_name: pdfFile?.name,
          pdf_url: publicUrl
        })
      } catch (e) {
        console.error('Supabase proof insert error', e)
        alert('Fehler beim Speichern des Nachweises')
      }
      // Reload proofs from Supabase to get the saved entry
      const freshProofs = await getProofs()
      const mapped = freshProofs.map((proof) => ({
        id: proof.id,
        bezeichnung: proof.bezeichnung,
        vorname: proof.vorname,
        nachname: proof.nachname,
        datum: proof.datum,
        pdfName: proof.pdf_name,
        pdfUrl: proof.pdf_url
      }))
      setSchulungsnachweise(mapped)
      setShowProofForm(false)
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Neuen Nachweis hinzufügen</h2>
            <button onClick={() => setShowProofForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bezeichnung der Schulung *</label>
              <input type="text" value={bezeichnung} onChange={(e)=>setBezeichnung(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vorname *</label>
                <input type="text" value={vorname} onChange={(e)=>setVorname(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nachname *</label>
                <input type="text" value={nachname} onChange={(e)=>setNachname(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Datum *</label>
              <input type="date" value={datum} onChange={(e)=>setDatum(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Schulungsnachweis (PDF optional)</label>
              <input type="file" accept="application/pdf" onChange={(e)=>setPdfFile(e.target.files?.[0] || null)} className="w-full" />
              <p className="text-xs text-gray-500 mt-1">Optional: PDF anhängen</p>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={()=>setShowProofForm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Abbrechen</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Speichern</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const getFilteredProofs = () => {
    const filtered = schulungsnachweise.filter(item => {
      const matchesBez = !proofFilters.bezeichnung || item.bezeichnung.toLowerCase().includes(proofFilters.bezeichnung.toLowerCase())
      const matchesVor = !proofFilters.vorname || item.vorname.toLowerCase().includes(proofFilters.vorname.toLowerCase())
      const matchesNach = !proofFilters.nachname || item.nachname.toLowerCase().includes(proofFilters.nachname.toLowerCase())
      const matchesFrom = !proofFilters.dateFrom || item.datum >= proofFilters.dateFrom
      const matchesTo = !proofFilters.dateTo || item.datum <= proofFilters.dateTo
      return matchesBez && matchesVor && matchesNach && matchesFrom && matchesTo
    })

    const sorted = filtered.sort((a, b) => {
      let cmp = 0
      switch (proofSortBy) {
        case 'bezeichnung':
          cmp = a.bezeichnung.localeCompare(b.bezeichnung)
          break
        case 'vorname':
          cmp = a.vorname.localeCompare(b.vorname)
          break
        case 'nachname':
          cmp = a.nachname.localeCompare(b.nachname)
          break
        case 'datum':
          cmp = a.datum.localeCompare(b.datum)
          break
      }
      return proofSortOrder === 'asc' ? cmp : -cmp
    })

    return sorted
  }

  const toggleProofSort = (key: 'bezeichnung'|'vorname'|'nachname'|'datum') => {
    if (proofSortBy === key) {
      setProofSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setProofSortBy(key)
      setProofSortOrder('asc')
    }
  }

  const handleExportOverviewPdf = () => {
    const rows = getFilteredOverviewSchulungen().map(item => {
      const participant = `${item.participantName} ${item.participantSurname}`
      return `<tr>
        <td style=\"padding:8px;border:1px solid #e5e7eb;\">${item.schulungTitle}</td>
        <td style=\"padding:8px;border:1px solid #e5e7eb;\">${participant}</td>
        <td style=\"padding:8px;border:1px solid #e5e7eb;\">${item.category}</td>
        <td style=\"padding:8px;border:1px solid #e5e7eb;\">${item.instructor}</td>
        <td style=\"padding:8px;border:1px solid #e5e7eb;\">${item.completedDate}</td>
      </tr>`
    }).join('')

    const html = `<!doctype html><html lang=\"de\"><head><meta charset=\"utf-8\"/>
      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>
      <title>Schulungsübersicht – Export</title>
      <style>
        body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827;margin:24px}
        h1{font-size:20px;margin:0 0 16px 0}
        .meta{color:#6b7280;font-size:12px;margin-bottom:16px}
        table{border-collapse:collapse;width:100%;font-size:12px}
        thead td{background:#f9fafb;font-weight:700;border:1px solid #e5e7eb;padding:8px}
        tbody td{padding:8px;border:1px solid #e5e7eb}
      </style>
    </head><body>
      <h1>Schulungsübersicht – Export</h1>
      <div class=\"meta\">Generiert am ${new Date().toLocaleString('de-DE')}</div>
      <table>
        <thead>
          <tr>
            <td>Schulung</td>
            <td>Teilnehmer</td>
            <td>Kategorie</td>
            <td>Referent</td>
            <td>Abgeschlossen</td>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <script>window.addEventListener('load',()=>{setTimeout(()=>{window.print()},200)})</script>
    </body></html>`

    const w = window.open('', '_blank')
    if (w) {
      w.document.open()
      w.document.write(html)
      w.document.close()
    }
  }

  const getFilteredOverviewSchulungen = () => {
    // Nur interne Schulungen (mit Schulungs-ID) in der Übersicht anzeigen
    const internalCompletions = completedSchulungen.filter(completed => !!completed.schulungId)

    const filtered = internalCompletions.filter(completed => {
      const matchesCategory = !overviewFilters.category || completed.category === overviewFilters.category
      const matchesParticipant = !overviewFilters.instructor || 
        `${completed.participantName} ${completed.participantSurname}`.toLowerCase().includes(overviewFilters.instructor.toLowerCase())
      const matchesTitle = !overviewFilters.title || 
        completed.schulungTitle.toLowerCase().includes(overviewFilters.title.toLowerCase())
      const matchesInstructor = !overviewFilters.instructorName || 
        completed.instructor.toLowerCase().includes(overviewFilters.instructorName.toLowerCase())
      
      // Date filtering for completed date
      const matchesDateFrom = !overviewFilters.dateFrom || completed.completedDate >= overviewFilters.dateFrom
      const matchesDateTo = !overviewFilters.dateTo || completed.completedDate <= overviewFilters.dateTo
      
      return matchesCategory && matchesParticipant && matchesTitle && matchesInstructor && matchesDateFrom && matchesDateTo
    })

    // Sort the filtered results
    return filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = a.completedDate.localeCompare(b.completedDate)
          break
        case 'participant':
          const nameA = `${a.participantName} ${a.participantSurname}`
          const nameB = `${b.participantName} ${b.participantSurname}`
          comparison = nameA.localeCompare(nameB)
          break
        case 'title':
          comparison = a.schulungTitle.localeCompare(b.schulungTitle)
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verfügbar': return 'bg-green-100 text-green-800'
      case 'In Bearbeitung': return 'bg-yellow-100 text-yellow-800'
      case 'Abgeschlossen': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const SchulungCard = ({ schulung }: { schulung: Schulung }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
              {schulung.thumbnail}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{schulung.title}</h3>
              <p className="text-sm text-gray-600">{schulung.instructor}</p>
            </div>
          </div>
      </div>

        <p className="text-gray-700 mb-4 line-clamp-2">{schulung.description}</p>

        {/* Status in separate centered row */}
        <div className="flex justify-center mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(schulung.status)}`}>
            {schulung.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {schulung.duration}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {schulung.category}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">📅 {schulung.date}</span>
            <div className="flex space-x-2">
              {schulung.pdfUrl && (
                <button 
                  onClick={() => window.open(schulung.pdfUrl, '_blank')}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors" 
                  title="PDF anzeigen"
                >
                  📄
                </button>
              )}
              {schulung.videoUrl && (
                <button 
                  onClick={() => window.open(schulung.videoUrl, '_blank')}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors" 
                  title="Video ansehen"
                >
                  🎥
                </button>
              )}
              <button 
                onClick={() => setShowDeleteConfirm(schulung)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Schulung löschen"
              >
                🗑️
              </button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={() => setShowSchulungViewer(schulung)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Starten
            </button>
          </div>
        </div>
                </div>
              </div>
  )

  const CreateSchulungForm = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      category: 'Unterweisungen',
      duration: '',
      instructor: '',
      date: '',
      pdfFile: null as File | null,
      videoFile: null as File | null
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        let pdfUrl: string | undefined
        let videoUrl: string | undefined

        if (formData.pdfFile) {
          const pdfResult = await uploadTrainingFile(formData.pdfFile, 'pdf')
          pdfUrl = pdfResult.publicUrl
        }

        if (formData.videoFile) {
          const videoResult = await uploadTrainingFile(formData.videoFile, 'video')
          videoUrl = videoResult.publicUrl
        }

        const trainingData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        duration: formData.duration,
        status: 'Verfügbar',
        date: formData.date,
        instructor: formData.instructor,
          pdf_url: pdfUrl,
          video_url: videoUrl,
        thumbnail: '📚'
      }

        const savedTraining = await insertTraining(trainingData)
        
        const newSchulung: Schulung = {
          id: savedTraining.id,
          title: savedTraining.title,
          description: savedTraining.description,
          category: savedTraining.category,
          duration: savedTraining.duration,
          status: savedTraining.status,
          date: savedTraining.date,
          instructor: savedTraining.instructor,
          pdfUrl: savedTraining.pdf_url,
          videoUrl: savedTraining.video_url,
          thumbnail: savedTraining.thumbnail
        }
        
        setSchulungen([newSchulung, ...schulungen])
      setShowCreateForm(false)
      setFormData({
        title: '',
        description: '',
        category: 'Unterweisungen',
        duration: '',
        instructor: '',
        date: '',
        pdfFile: null,
        videoFile: null
      })
      } catch (error) {
        console.error('Error creating training:', error)
        alert('Fehler beim Erstellen der Schulung.')
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Neue Schulung erstellen</h2>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
                </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titel der Schulung
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. Erste Hilfe Grundkurs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Unterweisungen">Unterweisungen</option>
                  <option value="Schulungen">Schulungen</option>
                  <option value="Gastronomie">Gastronomie</option>
                  <option value="Kursverlaufspläne">Kursverlaufspläne</option>
                </select>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dauer
                </label>
                <input
                  type="text"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. 4 Stunden"
                />
                  </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referent/in
                </label>
                <input
                  type="text"
                  required
                  value={formData.instructor}
                  onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Name des Referenten"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datum
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detaillierte Beschreibung der Schulungsinhalte..."
              />
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF-Dokument hochladen
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFormData({...formData, pdfFile: e.target.files?.[0] || null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Unterlagen, Handouts, etc.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video hochladen
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFormData({...formData, videoFile: e.target.files?.[0] || null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Schulungsvideos, Tutorials, etc.</p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Schulung erstellen
              </button>
          </div>
          </form>
        </div>
      </div>
    )
  }

  const SchulungViewer = ({ schulung }: { schulung: Schulung }) => {
    const [currentStep, setCurrentStep] = useState(0)
    const [isCompleted, setIsCompleted] = useState(false)
    const [participantName, setParticipantName] = useState('')
    const [participantSurname, setParticipantSurname] = useState('')
    const [showNameForm, setShowNameForm] = useState(true)
    const [confirmationChecked, setConfirmationChecked] = useState(false)

    const steps = [
      { title: 'Einführung', content: `Willkommen zur Schulung: ${schulung.title}. Hallo ${participantName} ${participantSurname}!` },
      { title: 'Theorie', content: schulung.description },
      { title: 'Materialien', content: 'Hier finden Sie alle wichtigen Unterlagen und Videos.' },
      { title: 'Bestätigung', content: `Herzlichen Glückwunsch ${participantName}! Sie haben die Schulung erfolgreich abgeschlossen. Bitte bestätigen Sie, dass Sie die Schulungsinhalte verstanden haben.` }
    ]

    const handleNameSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (participantName.trim() && participantSurname.trim()) {
        setShowNameForm(false)
      }
    }

    const handleNext = () => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        setIsCompleted(true)
        // Save completed training to Supabase
        try {
          insertCompletedTraining({
            training_id: schulung.id,
            training_title: schulung.title,
            participant_name: participantName,
            participant_surname: participantSurname,
            completed_date: new Date().toISOString().split('T')[0],
            score: 100, // Default score for completion
            category: schulung.category,
            instructor: schulung.instructor,
            duration: schulung.duration,
            completed_by: `${participantName} ${participantSurname}`
          })
          
          // Update local state
          const newCompletedTraining: CompletedSchulung = {
            id: Date.now().toString(),
            schulungId: schulung.id,
            schulungTitle: schulung.title,
            participantName,
            participantSurname,
            completedDate: new Date().toISOString().split('T')[0],
            score: 100,
            category: schulung.category,
            instructor: schulung.instructor,
            duration: schulung.duration
          }
          setCompletedSchulungen(prev => [newCompletedTraining, ...prev])
        } catch (error) {
          console.error('Error saving completed training:', error)
        }
      }
    }

    const handlePrevious = () => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1)
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl">
                  {schulung.thumbnail}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{schulung.title}</h2>
                  <p className="text-gray-600">Referent: {schulung.instructor}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSchulungViewer(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6">
            {showNameForm ? (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Teilnehmerregistrierung</h3>
                  <p className="text-gray-600">Bitte geben Sie Ihren Namen ein, um mit der Schulung zu beginnen.</p>
                </div>
                
                <form onSubmit={handleNameSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vorname
                    </label>
                    <input
                      type="text"
                      required
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Ihr Vorname"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nachname
                    </label>
                    <input
                      type="text"
                      required
                      value={participantSurname}
                      onChange={(e) => setParticipantSurname(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Ihr Nachname"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Schulung starten
                  </button>
                </form>
              </div>
            ) : !isCompleted ? (
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>

                {/* Step Indicator */}
                <div className="flex justify-between">
                  {steps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index <= currentStep 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-xs text-gray-600 mt-1">{step.title}</span>
                    </div>
                  ))}
                </div>

                {/* Content */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {steps[currentStep].title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {steps[currentStep].content}
                  </p>

                  {/* Materialien anzeigen */}
                  {currentStep === 2 && (
                    <div className="mt-6 space-y-4">
                      {schulung.pdfUrl ? (
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">📄</span>
                            <div>
                              <p className="font-medium text-gray-900">PDF-Dokument</p>
                              <p className="text-sm text-gray-600">Schulungsunterlagen</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              if (schulung.pdfUrl) {
                                window.open(schulung.pdfUrl, '_blank')
                              }
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Öffnen
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600">Keine PDF-Unterlagen verfügbar</p>
                        </div>
                      )}

                      {schulung.videoUrl ? (
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">🎥</span>
                            <div>
                              <p className="font-medium text-gray-900">Schulungsvideo</p>
                              <p className="text-sm text-gray-600">Video-Tutorial</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              if (schulung.videoUrl) {
                                window.open(schulung.videoUrl, '_blank')
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Abspielen
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600">Kein Video verfügbar</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bestätigungskästchen im letzten Schritt */}
                  {currentStep === 3 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="confirmation"
                          checked={confirmationChecked}
                          onChange={(e) => setConfirmationChecked(e.target.checked)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="confirmation" className="text-sm text-gray-700">
                          <span className="font-medium">Hiermit bestätige ich, die Schulungsinhalte verstanden zu haben.</span>
                          <br />
                          <span className="text-gray-500">Diese Bestätigung ist erforderlich, um die Schulung abzuschließen.</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      currentStep === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    Zurück
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentStep === steps.length - 1 && !confirmationChecked}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      currentStep === steps.length - 1 && !confirmationChecked
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {currentStep === steps.length - 1 ? 'Abschließen' : 'Weiter'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🎉</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Schulung abgeschlossen!</h3>
                <p className="text-gray-600 mb-8">
                  Herzlichen Glückwunsch! Sie haben die Schulung &quot;{schulung.title}&quot; erfolgreich abgeschlossen.
                </p>
                <div className="space-y-4">
                  <button
                    onClick={() => setShowSchulungViewer(null)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Zurück zu den Schulungen
                  </button>
                  <div className="text-sm text-gray-500">
                    Ihr Fortschritt wurde gespeichert.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const SchulungDetail = ({ schulung }: { schulung: Schulung }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl">
                {schulung.thumbnail}
          </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{schulung.title}</h2>
                <p className="text-gray-600">Referent: {schulung.instructor}</p>
          </div>
        </div>
            <button 
              onClick={() => setSelectedSchulung(null)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Beschreibung</h3>
                <p className="text-gray-700 leading-relaxed">{schulung.description}</p>
      </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Schulungsdetails</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Dauer</p>
                    <p className="font-semibold text-gray-900">{schulung.duration}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Kategorie</p>
                    <p className="font-semibold text-gray-900">{schulung.category}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Datum</p>
                    <p className="font-semibold text-gray-900">{schulung.date}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Schulung starten</h3>
                <button 
                  onClick={() => {
                    setSelectedSchulung(null)
                    setShowSchulungViewer(schulung)
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  🎯 Schulung beginnen
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Materialien</h3>
                
                {schulung.pdfUrl && (
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="font-medium text-gray-900">PDF-Dokument</p>
                        <p className="text-sm text-gray-600">Schulungsunterlagen</p>
            </div>
          </div>
                    <button 
                      onClick={() => window.open(schulung.pdfUrl, '_blank')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Öffnen
                    </button>
                  </div>
                )}

                {schulung.videoUrl && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🎥</span>
                      <div>
                        <p className="font-medium text-gray-900">Schulungsvideo</p>
                        <p className="text-sm text-gray-600">Video-Tutorial</p>
                </div>
              </div>
                    <button 
                      onClick={() => window.open(schulung.videoUrl, '_blank')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Abspielen
                </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-4 lg:p-8 text-white text-center">
        <h1 className="text-2xl lg:text-4xl font-bold mb-2">Schulungen</h1>
        <p className="text-sm lg:text-base text-white/90">
          Verwalten Sie Ihre Schulungen und Weiterbildungen
        </p>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button 
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <span>➕</span>
            <span>Neue Schulung</span>
          </button>
          <button 
            onClick={() => setActiveTab('overview')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <span>📊</span>
            <span>Schulungsübersicht</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'available', label: 'Verfügbare Schulungen', count: schulungen.length },
              { id: 'overview', label: 'Schulungsübersicht', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as 'available' | 'overview' | 'quiz')
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'available' && (
            <div className="space-y-6">
              {/* Kategorien */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {categories.map((category) => (
                  <div key={category.name} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <span className="text-3xl mb-2 block">{category.icon}</span>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {category.name === 'Quiz' ? `${category.count} Quizze` : `${category.count} Schulungen`}
                      </p>
                      <button 
                        onClick={() => handleCategoryFilter(category.name)}
                        className={`mt-3 px-3 py-1 rounded-full text-xs font-medium ${category.color} hover:opacity-80 transition-opacity`}
                      >
                        Anzeigen
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Filter Header */}
              {selectedCategory && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {categories.find(c => c.name === selectedCategory)?.icon}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedCategory} ({filteredSchulungen.length} Schulungen)
                        </h3>
                        <p className="text-sm text-gray-600">
                          Gefilterte Ergebnisse für {selectedCategory}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleClearFilter}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      Alle anzeigen
                    </button>
                  </div>
                </div>
              )}

              {/* Schulungs-Kacheln */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-500">Lade Schulungen...</div>
                  </div>
                ) : filteredSchulungen.length > 0 ? (
                  filteredSchulungen.map((schulung) => (
                    <SchulungCard key={schulung.id} schulung={schulung} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <span className="text-6xl mb-4 block">🔍</span>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Keine Schulungen gefunden
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {selectedCategory 
                        ? `Keine Schulungen in der Kategorie "${selectedCategory}" verfügbar.`
                        : 'Keine Schulungen verfügbar.'
                      }
                    </p>
                    {selectedCategory && (
                      <button
                        onClick={handleClearFilter}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Alle Schulungen anzeigen
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Results Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getFilteredOverviewSchulungen().length} von {completedSchulungen.filter(c => !!c.schulungId).length} abgelegte Schulungen
                    </h3>
                    <p className="text-sm text-gray-600">
                      {overviewFilters.category || overviewFilters.instructor || overviewFilters.title || overviewFilters.instructorName || overviewFilters.dateFrom || overviewFilters.dateTo ? 'Gefilterte Ergebnisse' : 'Alle abgelegten Schulungen'}
                    </p>
                  </div>
                  <button
                    onClick={clearOverviewFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                  >
                    Filter zurücksetzen
                  </button>
                </div>
              </div>

              {/* Table: Abgelegte Schulungen */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="text-sm text-gray-600">Gefilterte Ergebnisse exportieren</div>
                  <button
                    onClick={handleExportOverviewPdf}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    ⬇️ Übersicht als PDF
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="space-y-2">
                            <div>Schulung</div>
                            <input
                              type="text"
                              placeholder="Schulung suchen..."
                              value={overviewFilters.title}
                              onChange={(e) => handleOverviewFilterChange('title', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="space-y-2">
                            <div>Teilnehmer</div>
                            <input
                              type="text"
                              placeholder="Name suchen..."
                              value={overviewFilters.instructor}
                              onChange={(e) => handleOverviewFilterChange('instructor', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="space-y-2">
                            <div>Kategorie</div>
                            <select
                              value={overviewFilters.category}
                              onChange={(e) => handleOverviewFilterChange('category', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Alle</option>
                              {categories.filter(c => c.name !== 'Quiz').map(category => (
                                <option key={category.name} value={category.name}>{category.name}</option>
                              ))}
                            </select>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="space-y-2">
                            <div>Referent</div>
                            <input
                              type="text"
                              placeholder="Referent suchen..."
                              value={overviewFilters.instructorName}
                              onChange={(e) => handleOverviewFilterChange('instructorName', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="space-y-2">
                            <div>Abgeschlossen</div>
                            <div className="flex space-x-1">
                              <input
                                type="date"
                                placeholder="Von"
                                value={overviewFilters.dateFrom}
                                onChange={(e) => handleOverviewFilterChange('dateFrom', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              />
                              <input
                                type="date"
                                placeholder="Bis"
                                value={overviewFilters.dateTo}
                                onChange={(e) => handleOverviewFilterChange('dateTo', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </th>
                        {isAdmin && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aktionen
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredOverviewSchulungen().map((completed) => (
                        <tr key={completed.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-lg mr-3">
                                ✅
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{completed.schulungTitle}</div>
                                <div className="text-sm text-gray-500">Abgeschlossen</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {completed.participantName} {completed.participantSurname}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              categories.find(c => c.name === completed.category)?.color || 'bg-gray-100 text-gray-800'
                            }`}>
                              {completed.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {completed.instructor}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {completed.completedDate}
                          </td>
                          {isAdmin && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => setShowDeleteCompletedConfirm(completed)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Schulung löschen"
                              >
                                🗑️
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {getFilteredOverviewSchulungen().length === 0 && (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">🔍</span>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Keine Schulungen gefunden</h3>
                    <p className="text-gray-600 mb-6">
                      Keine Schulungen entsprechen den aktuellen Filterkriterien.
                    </p>
                    <button
                      onClick={clearOverviewFilters}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Filter zurücksetzen
                    </button>
                  </div>
                )}
              </div>

              {/* Externe Schulungsnachweise Zusatz-Tabelle */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Externe Schulungsnachweise</h3>
                  <button
                    onClick={() => setShowProofForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    ➕ Nachweis hinzufügen
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button onClick={()=>toggleProofSort('bezeichnung')} className="flex items-center gap-1 hover:text-gray-700">
                            Bezeichnung der Schulung {proofSortBy==='bezeichnung' ? (proofSortOrder==='asc'?'▲':'▼') : ''}
                          </button>
                          <input
                            type="text"
                            placeholder="Bezeichnung filtern..."
                            value={proofFilters.bezeichnung}
                            onChange={(e)=>setProofFilters({...proofFilters, bezeichnung: e.target.value})}
                            className="mt-2 w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button onClick={()=>toggleProofSort('nachname')} className="flex items-center gap-1 hover:text-gray-700">
                            Name {proofSortBy==='nachname' ? (proofSortOrder==='asc'?'▲':'▼') : ''}
                          </button>
                          <input
                            type="text"
                            placeholder="Name filtern..."
                            value={proofFilters.nachname}
                            onChange={(e)=>setProofFilters({...proofFilters, nachname: e.target.value})}
                            className="mt-2 w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button onClick={()=>toggleProofSort('vorname')} className="flex items-center gap-1 hover:text-gray-700">
                            Vorname {proofSortBy==='vorname' ? (proofSortOrder==='asc'?'▲':'▼') : ''}
                          </button>
                          <input
                            type="text"
                            placeholder="Vorname filtern..."
                            value={proofFilters.vorname}
                            onChange={(e)=>setProofFilters({...proofFilters, vorname: e.target.value})}
                            className="mt-2 w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button onClick={()=>toggleProofSort('datum')} className="flex items-center gap-1 hover:text-gray-700">
                            Datum {proofSortBy==='datum' ? (proofSortOrder==='asc'?'▲':'▼') : ''}
                          </button>
                          <div className="mt-2 flex gap-1">
                            <input
                              type="date"
                              value={proofFilters.dateFrom}
                              onChange={(e)=>setProofFilters({...proofFilters, dateFrom: e.target.value})}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                              type="date"
                              value={proofFilters.dateTo}
                              onChange={(e)=>setProofFilters({...proofFilters, dateTo: e.target.value})}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schulungsnachweis (PDF)</th>
                        {isAdmin && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredProofs().length === 0 ? (
                        <tr>
                          <td colSpan={isAdmin ? 6 : 5} className="px-6 py-6 text-center text-sm text-gray-500">Keine Nachweise vorhanden</td>
                        </tr>
                      ) : (
                        getFilteredProofs().map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.bezeichnung}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nachname}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.vorname}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.datum}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.pdfUrl ? (
                                <button
                                  onClick={() => window.open(item.pdfUrl, '_blank')}
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                                >
                                  📄 {item.pdfName || 'Anzeigen'}
                                </button>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                            {isAdmin && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => setShowDeleteProofConfirm({ id: item.id, bezeichnung: item.bezeichnung })}
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                  title="Nachweis löschen"
                                >
                                  🗑️
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quiz' && (
            <QuizOverview onBack={() => setActiveTab('available')} />
          )}

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-2xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Schulung löschen</h3>
                  <p className="text-sm text-gray-600">Diese Aktion kann nicht rückgängig gemacht werden</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">
                  Möchten Sie die Schulung <strong>&quot;{showDeleteConfirm.title}&quot;</strong> wirklich löschen?
                </p>
                {isAdmin && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Admin
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => handleDeleteSchulung(showDeleteConfirm.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Completed Training Confirmation Modal */}
      {showDeleteCompletedConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-2xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Abgeschlossene Schulung löschen</h3>
                  <p className="text-sm text-gray-600">Diese Aktion kann nicht rückgängig gemacht werden</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">
                  Möchten Sie die abgeschlossene Schulung <strong>&quot;{showDeleteCompletedConfirm.schulungTitle}&quot;</strong> für <strong>{showDeleteCompletedConfirm.participantName} {showDeleteCompletedConfirm.participantSurname}</strong> wirklich löschen?
                </p>
                {isAdmin && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Admin
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteCompletedConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => handleDeleteCompletedTraining(showDeleteCompletedConfirm.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Proof Confirmation Modal */}
      {showDeleteProofConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-2xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Externen Nachweis löschen</h3>
                  <p className="text-sm text-gray-600">Diese Aktion kann nicht rückgängig gemacht werden</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">
                  Möchten Sie den externen Nachweis <strong>&quot;{showDeleteProofConfirm.bezeichnung}&quot;</strong> wirklich löschen?
                </p>
                {isAdmin && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Admin
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteProofConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => handleDeleteProof(showDeleteProofConfirm.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateForm && <CreateSchulungForm />}
      {selectedSchulung && <SchulungDetail schulung={selectedSchulung} />}
      {showSchulungViewer && <SchulungViewer schulung={showSchulungViewer} />}
      {showProofForm && <ProofForm />}
    </div>
  )
}