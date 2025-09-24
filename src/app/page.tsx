'use client'

import { useEffect, useState } from 'react'
import { getDashboardInfos, createDashboardInfo, deleteDashboardInfo, uploadInfoPdf, DashboardInfoRecord } from '@/lib/db'
import Link from 'next/link'
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
  
  const [currentInfos, setCurrentInfos] = useState<InfoItem[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDashboardInfos()
        const mapped: InfoItem[] = data.map((r: DashboardInfoRecord) => ({
          id: r.id as string,
          title: r.title,
          content: r.content,
          timestamp: r.timestamp,
          pdfFileName: r.pdf_name || undefined
        }))
        setCurrentInfos(mapped)
      } catch (e) {
        console.error('Load dashboard infos failed', e)
      }
    }
    load()
  }, [])

  const addNewInfo = async (title: string, content: string, pdfFile?: File) => {
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
        pdf_url: publicUrl
      })
      const fresh = await getDashboardInfos()
      const mapped: InfoItem[] = fresh.map((r: DashboardInfoRecord) => ({
        id: r.id as string,
        title: r.title,
        content: r.content,
        timestamp: r.timestamp,
        pdfFileName: r.pdf_name || undefined
      }))
      setCurrentInfos(mapped)
    } catch (e) {
      console.error('Create dashboard info failed', e)
      setCurrentInfos(prev => prev.filter(i => i.id !== optimistic.id))
      alert('Information konnte nicht gespeichert werden.')
    }
  }

  const removeInfo = async (id: string) => {
    const pass = prompt('Bitte Passwort eingeben:')
    if (pass === 'bl') {
      const prev = currentInfos
      setCurrentInfos(prev.filter(info => info.id !== id))
      try {
        await deleteDashboardInfo(id)
      } catch (e) {
        console.error('Delete dashboard info failed', e)
        setCurrentInfos(prev)
        alert('Information konnte nicht gelöscht werden.')
      }
    } else if (pass !== null) {
      alert('Falsches Passwort')
    }
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
    <div className="space-y-4 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-4 lg:p-8 text-white">
        <h1 className="text-2xl lg:text-4xl font-bold mb-4 text-center">
          Willkommen im LA OLA Intranet
        </h1>
        <DailyMotivation />
      </div>

      {/* Aktionen unterhalb des Headers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Offene Aufgaben</p>
              <p className="text-3xl font-bold text-gray-900">{taskStats.open}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <span className="text-2xl">🔄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Bearbeitung</p>
              <p className="text-3xl font-bold text-gray-900">{taskStats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
              <span className="text-2xl">📄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Abgeschlossen</p>
              <p className="text-3xl font-bold text-gray-900">{taskStats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gesamt Aufgaben</p>
              <p className="text-3xl font-bold text-gray-900">{taskStats.total}</p>
            </div>
          </div>
        </div>
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
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  {info.title}
                </h3>
                <p className="text-sm text-blue-800 mb-2">
                  {info.content}
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-blue-600 font-medium">
                    {info.timestamp}
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
                    onClick={() => downloadPdf(info)}
                    className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                    title="PDF herunterladen"
                  >
                    📥
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
    </div>
  )
}
