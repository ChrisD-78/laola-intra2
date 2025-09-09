'use client'

import { useState } from 'react'
import WiederkehrendeAufgabenForm from '@/components/WiederkehrendeAufgabenForm'

interface RecurringTask {
  id: string
  title: string
  description: string
  frequency: string
  priority: string
  startTime: string
  assignedTo: string
  isActive: boolean
  nextDue: string
  createdAt: string
}

export default function WiederkehrendeAufgaben() {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([
    {
      id: '1',
      title: 'Poolreinigung Hauptbecken',
      description: 'Tägliche Reinigung des Hauptbeckens und der Umgebung',
      frequency: 'Täglich',
      priority: 'Hoch',
      startTime: '08:00',
      assignedTo: 'Max Mustermann',
      isActive: true,
      nextDue: '2024-01-16 08:00',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      title: 'Wasserqualität prüfen',
      description: 'pH-Wert und Chlorgehalt aller Becken messen',
      frequency: 'Wöchentlich',
      priority: 'Mittel',
      startTime: '09:00',
      assignedTo: 'Anna Schmidt',
      isActive: true,
      nextDue: '2024-01-22 09:00',
      createdAt: '2024-01-01'
    },
    {
      id: '3',
      title: 'Umkleideräume aufräumen',
      description: 'Reinigung und Aufräumen der Umkleideräume',
      frequency: 'Täglich',
      priority: 'Niedrig',
      startTime: '18:00',
      assignedTo: 'Tom Weber',
      isActive: true,
      nextDue: '2024-01-15 18:00',
      createdAt: '2024-01-01'
    },
    {
      id: '4',
      title: 'Sicherheitscheck',
      description: 'Überprüfung aller Sicherheitseinrichtungen',
      frequency: 'Monatlich',
      priority: 'Mittel',
      startTime: '10:00',
      assignedTo: 'Lisa Müller',
      isActive: true,
      nextDue: '2024-02-15 10:00',
      createdAt: '2024-01-01'
    }
  ])

  const addNewRecurringTask = (taskData: {
    title: string
    description: string
    frequency: string
    priority: string
    startTime: string
    assignedTo: string
    isActive: boolean
  }) => {
    const newTask: RecurringTask = {
      id: Date.now().toString(),
      ...taskData,
      nextDue: new Date().toISOString().split('T')[0] + ' ' + taskData.startTime,
      createdAt: new Date().toISOString().split('T')[0]
    }
    setRecurringTasks([newTask, ...recurringTasks])
  }

  const toggleTaskStatus = (taskId: string) => {
    setRecurringTasks(recurringTasks.map(task => 
      task.id === taskId ? { ...task, isActive: !task.isActive } : task
    ))
  }

  const deleteTask = (taskId: string) => {
    setRecurringTasks(recurringTasks.filter(task => task.id !== taskId))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch': return 'bg-red-500'
      case 'Mittel': return 'bg-yellow-500'
      case 'Niedrig': return 'bg-green-500'
      case 'Kritisch': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'Hoch': return 'bg-red-100 text-red-800'
      case 'Mittel': return 'bg-yellow-100 text-yellow-800'
      case 'Niedrig': return 'bg-green-100 text-green-800'
      case 'Kritisch': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFrequencyColor = (frequency: string) => {
    return 'bg-purple-100 text-purple-800'
  }

  const formatNextDue = (nextDue: string) => {
    const date = new Date(nextDue)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Heute ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return 'Morgen ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    if (diffDays < 0) return 'Überfällig'
    
    return `in ${diffDays} Tagen ${date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900">Wiederkehrende Aufgaben</h1>
        <p className="mt-2 text-gray-600">
          Verwalten Sie Aufgaben, die regelmäßig anfallen
        </p>
      </div>

      {/* Add New Recurring Task */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Neue wiederkehrende Aufgabe erstellen</h2>
        <div className="flex justify-end">
          <WiederkehrendeAufgabenForm onAddRecurringTask={addNewRecurringTask} />
        </div>
      </div>

      {/* Recurring Tasks List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Aktive wiederkehrende Aufgaben</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recurringTasks.map((task) => (
            <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 ${getPriorityColor(task.priority)} rounded-full`}></div>
                  <div>
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`text-xs ${getPriorityBgColor(task.priority)} px-2 py-1 rounded-full`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs ${getFrequencyColor(task.frequency)} px-2 py-1 rounded-full`}>
                        {task.frequency}
                      </span>
                      <span className="text-xs text-gray-500">
                        Nächste: {formatNextDue(task.nextDue)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Zugewiesen: {task.assignedTo}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.isActive ? 'Aktiv' : 'Pausiert'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    className="p-2 text-gray-400 hover:text-gray-600"
                    onClick={() => toggleTaskStatus(task.id)}
                    title={task.isActive ? 'Pausieren' : 'Aktivieren'}
                  >
                    {task.isActive ? '⏸️' : '▶️'}
                  </button>
                  <button 
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Bearbeiten"
                  >
                    ✏️
                  </button>
                  <button 
                    className="p-2 text-gray-400 hover:text-gray-600"
                    onClick={() => deleteTask(task.id)}
                    title="Aufgabe löschen"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
