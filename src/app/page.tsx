'use client'

import { useEffect, useState } from 'react'
import { getDashboardInfos, createDashboardInfo, deleteDashboardInfo, uploadInfoPdf, DashboardInfoRecord } from '@/lib/db'
import Link from 'next/link'
import DailyMotivation from "@/components/DailyMotivation"
import InfoForm from "@/components/InfoForm"
import { useTasks } from "@/contexts/TaskContext"
import DashboardInfoPopup from "@/components/DashboardInfoPopup"
import { useAuth } from "@/components/AuthProvider"

interface InfoItem {
  id: string
  title: string
  content: string
  timestamp: string
  pdfFile?: File
  pdfFileName?: string
  pdfUrl?: string
  isPopup?: boolean
}

export default function Dashboard() {
  const { getTaskStats, getTasksByStatus } = useTasks()
  const { isAdmin } = useAuth()
  const taskStats = getTaskStats()
  const recentTasks = getTasksByStatus('Offen').slice(0, 3)
  
  const [currentInfos, setCurrentInfos] = useState<InfoItem[]>([])
  const [popupInfo, setPopupInfo] = useState<InfoItem | null>(null)
  const [editingInfo, setEditingInfo] = useState<InfoItem | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const formatDate = (dateString: string): string => {
    // Konvertiere das Datum in das Format: TT.MM.JJJJ (ohne Uhrzeit)
    if (!dateString) return ''
    
    // Spezielle Werte direkt zurückgeben
    if (dateString === 'gerade eben' || dateString === 'Heute' || dateString === 'Gestern') {
      return dateString
    }
    
    try {
      // Wenn das Datum bereits im deutschen Format ist (z.B. "08.11.2025, 14:30:45")
      if (dateString.includes(',')) {
        // Extrahiere nur den Datumsteil vor dem Komma
        return dateString.split(',')[0].trim()
      }
      
      // Wenn es bereits im Format TT.MM.JJJJ ist (ohne Komma)
      if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
        return dateString
      }
      
      // Ansonsten versuche es zu parsen
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        // Falls das Parsen fehlschlägt, gebe den Original-String zurück
        return dateString
      }
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}.${month}.${year}`
    } catch (e) {
      return dateString
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDashboardInfos()
        const mapped: InfoItem[] = data.map((r: DashboardInfoRecord) => ({
          id: r.id as string,
          title: r.title,
          content: r.content,
          timestamp: r.timestamp,
          pdfFileName: r.pdf_name || undefined,
          pdfUrl: r.pdf_url || undefined,
          isPopup: r.is_popup || false
        }))
        setCurrentInfos(mapped)

        // Prüfe auf Popup-Informationen
        const popupInfos = mapped.filter(info => info.isPopup)
        if (popupInfos.length > 0) {
          // Zeige die neueste Popup-Info, die noch nicht dismissed wurde
          const dismissedPopups = JSON.parse(localStorage.getItem('dismissedPopups') || '[]')
          const unDismissedPopup = popupInfos.find(info => !dismissedPopups.includes(info.id))
          if (unDismissedPopup) {
            setPopupInfo(unDismissedPopup)
          }
        }
      } catch (e) {
        console.error('Load dashboard infos failed', e)
      }
    }
    load()
  }, [])

  const addNewInfo = async (title: string, content: string, pdfFile?: File, isPopup?: boolean) => {
    const optimistic: InfoItem = {
      id: `tmp_${Date.now()}`,
      title,
      content,
      timestamp: 'gerade eben',
      pdfFile,
      pdfFileName: pdfFile?.name
    }
    setCurrentInfos(prev => [optimistic, ...prev])
    try {
      let publicUrl: string | undefined
      if (pdfFile) {
        const up = await uploadInfoPdf(pdfFile)
        publicUrl = up.publicUrl
      }
      await createDashboardInfo({
        title,
        content,
        timestamp: new Date().toLocaleString('de-DE'),
        pdf_name: pdfFile?.name,
        pdf_url: publicUrl,
        is_popup: isPopup || false
      })
      const fresh = await getDashboardInfos()
      const mapped: InfoItem[] = fresh.map((r: DashboardInfoRecord) => ({
        id: r.id as string,
        title: r.title,
        content: r.content,
        timestamp: r.timestamp,
        pdfFileName: r.pdf_name || undefined,
        pdfUrl: r.pdf_url || undefined
      }))
      setCurrentInfos(mapped)
    } catch (e) {
      console.error('Create dashboard info failed', e)
      setCurrentInfos(prev => prev.filter(i => i.id !== optimistic.id))
      alert('Information konnte nicht gespeichert werden.')
    }
  }

  const removeInfo = async (id: string) => {
    const prev = currentInfos
    setCurrentInfos(prev.filter(info => info.id !== id))
    try {
      await deleteDashboardInfo(id)
    } catch (e) {
      console.error('Delete dashboard info failed', e)
      setCurrentInfos(prev)
      alert('Information konnte nicht gelöscht werden.')
    }
  }

  const handleEditClick = (info: InfoItem) => {
    setEditingInfo(info)
    setShowEditModal(true)
  }

  const updateInfo = async (id: string, title: string, content: string, isPopup?: boolean) => {
    const prev = currentInfos
    // Optimistic update
    setCurrentInfos(prevInfos => 
      prevInfos.map(info => 
        info.id === id 
          ? { ...info, title, content, isPopup: isPopup || false }
          : info
      )
    )
    try {
      const response = await fetch(`/api/dashboard-infos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, is_popup: isPopup || false })
      })
      
      if (!response.ok) {
        throw new Error('Update failed')
      }
      
      // Reload fresh data
      const fresh = await getDashboardInfos()
      const mapped: InfoItem[] = fresh.map((r: DashboardInfoRecord) => ({
        id: r.id as string,
        title: r.title,
        content: r.content,
        timestamp: r.timestamp,
        pdfFileName: r.pdf_name || undefined,
        pdfUrl: r.pdf_url || undefined,
        isPopup: r.is_popup || false
      }))
      setCurrentInfos(mapped)
      setShowEditModal(false)
      setEditingInfo(null)
    } catch (e) {
      console.error('Update dashboard info failed', e)
      setCurrentInfos(prev)
      alert('Information konnte nicht aktualisiert werden.')
    }
  }

  const downloadPdf = (info: InfoItem) => {
    // If PDF URL is available (from database), open it
    if (info.pdfUrl) {
      window.open(info.pdfUrl, '_blank')
      return
    }
    
    // Otherwise, if it's a newly uploaded file in memory
    if (info.pdfFile) {
      const url = window.URL.createObjectURL(info.pdfFile)
      const link = document.createElement('a')
      link.href = url
      link.download = info.pdfFileName || 'dokument.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
  }
  
  const viewPdf = (info: InfoItem) => {
    // Open PDF in new tab for viewing
    if (info.pdfUrl) {
      window.open(info.pdfUrl, '_blank')
    } else if (info.pdfFile) {
      const url = window.URL.createObjectURL(info.pdfFile)
      window.open(url, '_blank')
    }
  }

  return (
    <div className="space-y-4 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-4 lg:p-8 text-white">
        <h1 className="text-2xl lg:text-4xl font-bold mb-4 text-center">
          Willkommen im LA OLA Intranet
        </h1>
        <DailyMotivation />
      </div>

      {/* Aktionen unterhalb des Headers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link
          href="https://stadtholding-landau-pep.dejoris.de/de/login//#%257B%2522main%2522%253A%2522de%252Fadmin%252Femployees%2522%252C%2522column%2522%253A%2522de%252Fadmin%252Findex%252Fhome_column%2522%252C%2522icon%2522%253A%2522fas%2520fa-users%2522%257D"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-lg font-semibold text-gray-900">Schichtplaner</p>
              <p className="text-sm text-gray-600">Dienstpläne ansehen und verwalten</p>
            </div>
          </div>
        </Link>

        <a
          href="https://kurse.la-ola.de/de/customers/login/aHR0cHM6Ly9rdXJzZS5sYS1vbGEuZGUvZGUvYWRtaW4vZGFzaGJvYXJkcy9tb2R1bGVzLw%3D%3D/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <span className="text-2xl">🏊‍♂️</span>
            </div>
            <div className="ml-4">
              <p className="text-lg font-semibold text-gray-900">Kursmanager</p>
              <p className="text-sm text-gray-600">Kurse planen und Teilnehmer verwalten</p>
            </div>
          </div>
        </a>

        <a
          href="https://pretix.eu/stadtholding/WFeier2025/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <span className="text-2xl">🎉</span>
            </div>
            <div className="ml-4">
              <p className="text-lg font-semibold text-gray-900">Events</p>
              <p className="text-sm text-gray-600">Veranstaltungen und Events ansehen</p>
            </div>
          </div>
        </a>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Link 
          href="/aufgaben?status=Offen"
          className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">Offene Aufgaben</p>
              <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{taskStats.open}</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/aufgaben?status=In Bearbeitung"
          className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">🔄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 group-hover:text-green-600 transition-colors">In Bearbeitung</p>
              <p className="text-3xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">{taskStats.inProgress}</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/aufgaben?status=Abgeschlossen"
          className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">📄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 group-hover:text-yellow-600 transition-colors">Abgeschlossen</p>
              <p className="text-3xl font-bold text-gray-900 group-hover:text-yellow-700 transition-colors">{taskStats.completed}</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/aufgaben"
          className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 group-hover:text-purple-600 transition-colors">Gesamt Aufgaben</p>
              <p className="text-3xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{taskStats.total}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Aktuelle Informationen */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1"></div>
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              Aktuelle Informationen
            </h2>
            <div className="flex-1 flex justify-end">
              <InfoForm onAddInfo={addNewInfo} />
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          
          {/* Bestehende Informationen */}
          {currentInfos.map((info) => (
            <div key={info.id} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-blue-900">
                    {info.title}
                  </h3>
                  {info.isPopup && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      📢 Popup
                    </span>
                  )}
                </div>
                <p className="text-sm text-blue-800 mb-2">
                  {info.content}
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-blue-600 font-medium">
                    {formatDate(info.timestamp)}
                  </span>
                  {info.pdfFileName && (
                    <span className="text-xs text-blue-600 font-medium">
                      📄 {info.pdfFileName}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {info.pdfFileName && (
                  <button
                    onClick={() => viewPdf(info)}
                    className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                    title="PDF ansehen"
                  >
                    📄
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleEditClick(info)}
                    className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                    title="Information bearbeiten"
                  >
                    ✏️
                  </button>
                )}
                <button
                  onClick={() => removeInfo(info.id)}
                  className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                  title="Information entfernen"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            Letzte Aktivitäten
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-blue-800">
                    Offene Aufgabe: &quot;{task.title}&quot;
                  </span>
                  <p className="text-xs text-blue-600 mt-1">
                    Zugewiesen an: {task.assignedTo} • Fällig: {new Date(task.dueDate).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <span className="text-xs text-blue-600 font-medium">
                  {task.priority}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl">✅</span>
              <p className="mt-2">Keine offenen Aufgaben</p>
            </div>
          )}
        </div>
      </div>

      {/* Popup für wichtige Informationen */}
      {popupInfo && (
        <DashboardInfoPopup
          info={popupInfo}
          onClose={() => setPopupInfo(null)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Information bearbeiten</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                    👑 Admin
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingInfo(null)
                  }}
                  className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <EditForm
              info={editingInfo}
              onSave={updateInfo}
              onCancel={() => {
                setShowEditModal(false)
                setEditingInfo(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Edit Form Component
function EditForm({ 
  info, 
  onSave, 
  onCancel 
}: { 
  info: InfoItem
  onSave: (id: string, title: string, content: string, isPopup?: boolean) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(info.title)
  const [content, setContent] = useState(info.content)
  const [isPopup, setIsPopup] = useState(info.isPopup || false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('Bitte alle Felder ausfüllen')
      return
    }
    onSave(info.id, title, content, isPopup)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {/* Titel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titel
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="Titel der Information"
          required
        />
      </div>

      {/* Inhalt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Inhalt
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          rows={4}
          placeholder="Beschreibung der Information"
          required
        />
      </div>

      {/* Popup Checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="edit-is-popup"
          checked={isPopup}
          onChange={(e) => setIsPopup(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="edit-is-popup" className="text-sm text-gray-700">
          Als Popup anzeigen (wird beim nächsten Login als Hinweis angezeigt)
        </label>
      </div>

      {/* PDF Info (nicht editierbar) */}
      {info.pdfFileName && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Angehängte PDF:</p>
          <span className="text-sm text-gray-900 font-medium">
            📄 {info.pdfFileName}
          </span>
          <p className="text-xs text-gray-500 mt-1">
            Hinweis: PDF kann nicht bearbeitet werden
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          💾 Speichern
        </button>
      </div>
    </form>
  )
}
