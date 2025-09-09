'use client'

import { useState } from 'react'
import DailyMotivation from "@/components/DailyMotivation"
import InfoForm from "@/components/InfoForm"
import { useTasks } from "@/contexts/TaskContext"

interface InfoItem {
  id: string
  title: string
  content: string
  timestamp: string
  pdfFile?: File
  pdfFileName?: string
}

export default function Dashboard() {
  const { getTaskStats, getTasksByStatus } = useTasks()
  const taskStats = getTaskStats()
  const recentTasks = getTasksByStatus('Offen').slice(0, 3)
  
  const [currentInfos, setCurrentInfos] = useState<InfoItem[]>([
    {
      id: '1',
      title: 'Neue Sicherheitsrichtlinien',
      content: 'Neue Sicherheitsrichtlinien sind verfügbar und müssen von allen Mitarbeitern gelesen werden.',
      timestamp: 'vor 1 Stunde'
    },
    {
      id: '2',
      title: 'Pool-Öffnungszeiten angepasst',
      content: 'Die Pool-Öffnungszeiten wurden aufgrund der Saison angepasst. Neue Zeiten sind im Schichtplan verfügbar.',
      timestamp: 'vor 3 Stunden'
    },
    {
      id: '3',
      title: 'Neue Mitarbeiter-App verfügbar',
      content: 'Die neue LA OLA Mitarbeiter-App ist jetzt verfügbar. Alle wichtigen Informationen sind dort abrufbar.',
      timestamp: 'vor 5 Stunden'
    }
  ])

  const addNewInfo = (title: string, content: string, pdfFile?: File) => {
    const newInfo: InfoItem = {
      id: Date.now().toString(),
      title,
      content,
      timestamp: 'gerade eben',
      pdfFile,
      pdfFileName: pdfFile?.name
    }
    setCurrentInfos([newInfo, ...currentInfos])
  }

  const removeInfo = (id: string) => {
    setCurrentInfos(currentInfos.filter(info => info.id !== id))
  }

  const downloadPdf = (info: InfoItem) => {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="gradient-bg rounded-2xl card-shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-4 text-center">
          Willkommen im LA OLA Intranet
        </h1>
        <DailyMotivation />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-shadow rounded-2xl p-6 hover:card-shadow-lg transition-all duration-300" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: 'var(--primary-blue)' }}>
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Offene Aufgaben</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{taskStats.open}</p>
            </div>
          </div>
        </div>

        <div className="card-shadow rounded-2xl p-6 hover:card-shadow-lg transition-all duration-300" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: 'var(--success-green)' }}>
              <span className="text-2xl">🔄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>In Bearbeitung</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{taskStats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="card-shadow rounded-2xl p-6 hover:card-shadow-lg transition-all duration-300" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: 'var(--warning-orange)' }}>
              <span className="text-2xl">📄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Abgeschlossen</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{taskStats.completed}</p>
            </div>
          </div>
        </div>

        <div className="card-shadow rounded-2xl p-6 hover:card-shadow-lg transition-all duration-300" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: 'var(--accent-blue)' }}>
              <span className="text-2xl">🎓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Gesamt Aufgaben</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{taskStats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Aktuelle Informationen */}
      <div className="card-shadow rounded-2xl" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1"></div>
            <h2 className="text-2xl font-bold text-center" style={{ color: 'var(--foreground)' }}>
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
            <div key={info.id} className="flex items-start space-x-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--secondary-blue)', borderColor: 'var(--border-color)' }}>
              <div className="w-3 h-3 rounded-full shadow-lg mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--primary-blue)' }}></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--primary-blue)' }}>
                  {info.title}
                </h3>
                <p className="text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                  {info.content}
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    {info.timestamp}
                  </span>
                  {info.pdfFileName && (
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      📄 {info.pdfFileName}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {info.pdfFile && (
                  <button
                    onClick={() => downloadPdf(info)}
                    className="transition-colors p-1"
                    style={{ color: 'var(--primary-blue)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-blue-dark)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary-blue)'}
                    title="PDF herunterladen"
                  >
                    📥
                  </button>
                )}
                <button
                  onClick={() => removeInfo(info.id)}
                  className="transition-colors p-1"
                  style={{ color: 'var(--error-red)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-blue-dark)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--error-red)'}
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
      <div className="card-shadow rounded-2xl" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            Letzte Aktivitäten
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--secondary-blue)', borderColor: 'var(--border-color)' }}>
                <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: 'var(--primary-blue)' }}></div>
                <div className="flex-1">
                  <span className="text-sm font-medium" style={{ color: 'var(--primary-blue)' }}>
                    Offene Aufgabe: &quot;{task.title}&quot;
                  </span>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Zugewiesen an: {task.assignedTo} • Fällig: {new Date(task.dueDate).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {task.priority}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <span className="text-4xl">✅</span>
              <p className="mt-2">Keine offenen Aufgaben</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
