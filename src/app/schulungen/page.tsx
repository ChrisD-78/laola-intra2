'use client'

import { useState } from 'react'

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
  schulungId: string
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
  const [activeTab, setActiveTab] = useState<'available' | 'overview'>('available')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedSchulung, setSelectedSchulung] = useState<Schulung | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Schulung | null>(null)
  const [showSchulungViewer, setShowSchulungViewer] = useState<Schulung | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
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

  // Beispiel-Schulungen
  const [schulungen, setSchulungen] = useState<Schulung[]>([
    {
      id: '1',
      title: 'Erste Hilfe - Auffrischung',
      description: 'Auffrischung der Erste-Hilfe-Kenntnisse für alle Mitarbeiter. Lernen Sie die wichtigsten Sofortmaßnahmen und Notfallverfahren.',
      category: 'Unterweisungen',
      duration: '8 Stunden',
      status: 'Verfügbar',
      date: '15. Dezember 2024',
      instructor: 'Dr. Maria Schmidt',
      pdfUrl: '/schulungen/erste-hilfe-handbuch.pdf',
      videoUrl: 'https://example.com/erste-hilfe-video',
      thumbnail: '🚨'
    },
    {
      id: '2',
      title: 'Datenschutz und DSGVO',
      description: 'Schulung zu Datenschutzrichtlinien und DSGVO-Compliance. Verstehen Sie Ihre Verantwortlichkeiten im Umgang mit personenbezogenen Daten.',
      category: 'Schulungen',
      duration: '2 Stunden',
      status: 'Verfügbar',
      date: '20. Dezember 2024',
      instructor: 'Rechtsanwalt Thomas Weber',
      pdfUrl: '/schulungen/dsgvo-leitfaden.pdf',
      videoUrl: 'https://example.com/dsgvo-video',
      thumbnail: '🔒'
    },
    {
      id: '3',
      title: 'Neue Pooltechnologien',
      description: 'Einführung in neue Pooltechnologien und Wartungsverfahren. Bleiben Sie auf dem neuesten Stand der Technik.',
      category: 'Schulungen',
      duration: '5 Stunden',
      status: 'Verfügbar',
      date: '10. Januar 2025',
      instructor: 'Ing. Peter Müller',
      pdfUrl: '/schulungen/pooltechnologie-handbuch.pdf',
      videoUrl: 'https://example.com/pooltech-video',
      thumbnail: '🏊‍♂️'
    },
    {
      id: '4',
      title: 'Kundenservice Excellence',
      description: 'Verbessern Sie Ihre Kommunikationsfähigkeiten und lernen Sie, wie Sie herausragenden Kundenservice bieten.',
      category: 'Gastronomie',
      duration: '3 Stunden',
      status: 'Verfügbar',
      date: '25. Januar 2025',
      instructor: 'Sarah Johnson',
      pdfUrl: '/schulungen/kundenservice-guide.pdf',
      videoUrl: 'https://example.com/kundenservice-video',
      thumbnail: '👥'
    }
  ])

  // Beispiel abgelegte Schulungen
  const [completedSchulungen, setCompletedSchulungen] = useState<CompletedSchulung[]>([
    {
      id: 'c1',
      schulungId: '1',
      schulungTitle: 'Erste Hilfe - Auffrischung',
      participantName: 'Max',
      participantSurname: 'Mustermann',
      completedDate: '2024-01-15',
      score: 95,
      category: 'Unterweisungen',
      instructor: 'Dr. Sarah Weber',
      duration: '2 Stunden'
    },
    {
      id: 'c2',
      schulungId: '2',
      schulungTitle: 'Hygiene und Lebensmittelsicherheit',
      participantName: 'Anna',
      participantSurname: 'Schmidt',
      completedDate: '2024-01-20',
      score: 88,
      category: 'Gastronomie',
      instructor: 'Chefkoch Michael Müller',
      duration: '3 Stunden'
    },
    {
      id: 'c3',
      schulungId: '1',
      schulungTitle: 'Erste Hilfe - Auffrischung',
      participantName: 'Thomas',
      participantSurname: 'Klein',
      completedDate: '2024-01-22',
      score: 92,
      category: 'Unterweisungen',
      instructor: 'Dr. Sarah Weber',
      duration: '2 Stunden'
    },
    {
      id: 'c4',
      schulungId: '3',
      schulungTitle: 'Kundenservice Excellence',
      participantName: 'Lisa',
      participantSurname: 'Wagner',
      completedDate: '2024-01-25',
      score: 96,
      category: 'Schulungen',
      instructor: 'Service Managerin Petra Fischer',
      duration: '4 Stunden'
    },
    {
      id: 'c5',
      schulungId: '4',
      schulungTitle: 'Arbeitsschutz und Sicherheit',
      participantName: 'Max',
      participantSurname: 'Mustermann',
      completedDate: '2024-01-28',
      score: 90,
      category: 'Unterweisungen',
      instructor: 'Sicherheitsbeauftragter Klaus Neumann',
      duration: '1.5 Stunden'
    },
    {
      id: 'c6',
      schulungId: '5',
      schulungTitle: 'Menüplanung und Kostenkontrolle',
      participantName: 'Anna',
      participantSurname: 'Schmidt',
      completedDate: '2024-02-01',
      score: 94,
      category: 'Gastronomie',
      instructor: 'Chefkoch Michael Müller',
      duration: '3 Stunden'
    }
  ])

  const categories = [
    { name: 'Unterweisungen', icon: '📋', color: 'bg-red-100 text-red-800', count: 3 },
    { name: 'Schulungen', icon: '🎓', color: 'bg-blue-100 text-blue-800', count: 2 },
    { name: 'Gastronomie', icon: '🍽️', color: 'bg-green-100 text-green-800', count: 5 },
    { name: 'Kursverlaufspläne', icon: '📅', color: 'bg-purple-100 text-purple-800', count: 2 }
  ]

  const handleDeleteSchulung = (schulungId: string) => {
    const pass = prompt('Bitte Passwort eingeben:')
    if (pass === 'bl') {
      setSchulungen(schulungen.filter(s => s.id !== schulungId))
      setShowDeleteConfirm(null)
    } else if (pass !== null) {
      alert('Falsches Passwort')
    }
  }

  const handleCategoryFilter = (categoryName: string) => {
    setSelectedCategory(categoryName)
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

  const getFilteredOverviewSchulungen = () => {
    const filtered = completedSchulungen.filter(completed => {
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
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="PDF anzeigen">
                  📄
                </button>
              )}
              {schulung.videoUrl && (
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Video ansehen">
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

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      const newSchulung: Schulung = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        duration: formData.duration,
        status: 'Verfügbar',
        date: formData.date,
        instructor: formData.instructor,
        pdfUrl: formData.pdfFile ? URL.createObjectURL(formData.pdfFile) : undefined,
        videoUrl: formData.videoFile ? URL.createObjectURL(formData.videoFile) : undefined,
        thumbnail: '📚'
      }
      setSchulungen([...schulungen, newSchulung])
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
        // Hier könnte man den Status der Schulung auf "Abgeschlossen" setzen
        setSchulungen(schulungen.map(s => 
          s.id === schulung.id ? { ...s, status: 'Abgeschlossen' as const } : s
        ))
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      {schulung.pdfUrl && (
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
                      )}

                      {schulung.videoUrl && (
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
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
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
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schulungen</h1>
            <p className="mt-2 text-gray-600">
              Verwalten Sie Ihre Schulungen und Weiterbildungen
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => {
                const pass = prompt('Bitte Passwort eingeben:')
                if (pass === 'bl') {
                  setShowCreateForm(true)
                } else if (pass !== null) {
                  alert('Falsches Passwort')
                }
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Neue Schulung</span>
            </button>
            <button 
              onClick={() => {
                const pass = prompt('Bitte Passwort eingeben:')
                if (pass === 'team') {
                  setActiveTab('overview')
                } else if (pass !== null) {
                  alert('Falsches Passwort')
                }
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
            >
              <span>📊</span>
              <span>Schulungsübersicht</span>
            </button>
          </div>
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
                  if (tab.id === 'overview') {
                    const pass = prompt('Bitte Passwort eingeben:')
                    if (pass === 'team') {
                      setActiveTab('overview')
                    } else if (pass !== null) {
                      alert('Falsches Passwort')
                    }
                  } else {
                    setActiveTab(tab.id as 'available' | 'overview')
                  }
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <div key={category.name} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <span className="text-3xl mb-2 block">{category.icon}</span>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{category.count} Schulungen</p>
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
                {filteredSchulungen.length > 0 ? (
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
                      {getFilteredOverviewSchulungen().length} von {completedSchulungen.length} abgelegte Schulungen
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

              {/* Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                              {categories.map(category => (
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
            </div>
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

      {/* Modals */}
      {showCreateForm && <CreateSchulungForm />}
      {selectedSchulung && <SchulungDetail schulung={selectedSchulung} />}
      {showSchulungViewer && <SchulungViewer schulung={showSchulungViewer} />}
    </div>
  )
}