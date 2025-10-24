'use client'

import AufgabenForm from '@/components/AufgabenForm'
import { useTasks } from '@/contexts/TaskContext'

export default function Aufgaben() {
  const { tasks, addTask, updateTaskStatus, deleteTask } = useTasks()

  const addNewTask = (taskData: {
    title: string
    description: string
    priority: string
    dueDate: string
    assignedTo: string
  }) => {
    addTask(taskData)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Kritisch': return 'bg-red-500'
      case 'Hoch': return 'bg-orange-500'
      case 'Mittel': return 'bg-yellow-500'
      case 'Niedrig': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'Kritisch': return 'bg-red-100 text-red-800'
      case 'Hoch': return 'bg-orange-100 text-orange-800'
      case 'Mittel': return 'bg-yellow-100 text-yellow-800'
      case 'Niedrig': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Offen': return 'bg-blue-100 text-blue-800'
      case 'In Bearbeitung': return 'bg-yellow-100 text-yellow-800'
      case 'Abgeschlossen': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'Abgeschlossen') return false
    const due = new Date(dueDate)
    const now = new Date()
    return due < now
  }

  const getDueDateStatus = (dueDate: string, status: string) => {
    if (status === 'Abgeschlossen') return { status: 'completed', color: 'bg-green-100 text-green-800 border-green-200', icon: '✅' }
    
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { status: 'overdue', color: 'bg-red-100 text-red-800 border-red-200', icon: '🚨' }
    if (diffDays === 0) return { status: 'due-today', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '⚠️' }
    if (diffDays === 1) return { status: 'due-tomorrow', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏰' }
    if (diffDays <= 3) return { status: 'due-soon', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📅' }
    return { status: 'future', color: 'bg-green-100 text-green-800 border-green-200', icon: '✅' }
  }

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Heute'
    if (diffDays === 1) return 'Morgen'
    if (diffDays < 0) return 'Überfällig'
    
    return `in ${diffDays} Tagen`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-4 lg:p-8 text-white">
        <h1 className="text-2xl lg:text-4xl font-bold mb-4 text-center">
          Aufgaben
        </h1>
        <p className="text-center text-white/90 text-lg">
          Verwalten Sie alle offenen und abgeschlossenen Aufgaben
        </p>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-xl">🚨</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">Überfällig</p>
              <p className="text-2xl font-bold text-red-900">
                {tasks.filter(task => isOverdue(task.dueDate, task.status)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-800">Heute fällig</p>
              <p className="text-2xl font-bold text-orange-900">
                {tasks.filter(task => {
                  const due = new Date(task.dueDate)
                  const now = new Date()
                  const diffTime = due.getTime() - now.getTime()
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  return diffDays === 0 && task.status !== 'Abgeschlossen'
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-xl">📋</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">Offen</p>
              <p className="text-2xl font-bold text-blue-900">
                {tasks.filter(task => task.status === 'Offen').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Erledigt</p>
              <p className="text-2xl font-bold text-green-900">
                {tasks.filter(task => task.status === 'Abgeschlossen').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Neue Aufgabe erstellen</h2>
            <p className="text-gray-600 mt-1">Erstellen Sie eine neue Aufgabe mit Priorität und Fälligkeitsdatum</p>
          </div>
          <AufgabenForm onAddTask={addNewTask} />
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Alle Aufgaben</h2>
          <p className="text-gray-600 mt-1">Übersicht aller Aufgaben mit Fälligkeitsstatus</p>
        </div>
        <div className="divide-y divide-gray-100">
          {tasks.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Aufgaben</h3>
              <p className="text-gray-600">Erstellen Sie Ihre erste Aufgabe, um zu beginnen.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const dueStatus = getDueDateStatus(task.dueDate, task.status)
              const isTaskOverdue = isOverdue(task.dueDate, task.status)
              
              return (
                <div key={task.id} className={`p-6 hover:bg-gray-50 transition-all duration-200 ${isTaskOverdue ? 'bg-red-50 border-l-4 border-red-400' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Priority Indicator */}
                      <div className={`w-4 h-4 ${getPriorityColor(task.priority)} rounded-full mt-1 flex-shrink-0`}></div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                          <span className={`text-xs ${getPriorityBgColor(task.priority)} px-2 py-1 rounded-full`}>
                            {task.priority}
                          </span>
                          <span className={`text-xs ${getStatusColor(task.status)} px-2 py-1 rounded-full`}>
                            {task.status}
                          </span>
                          {isTaskOverdue && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full animate-pulse">
                              🚨 Überfällig
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{task.description}</p>
                        
                        <div className="flex items-center space-x-6">
                          {/* Due Date Status */}
                          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${dueStatus.color}`}>
                            <span className="text-sm">{dueStatus.icon}</span>
                            <div>
                              <p className="text-sm font-medium">
                                {formatDueDate(task.dueDate)}
                              </p>
                              <p className="text-xs opacity-75">
                                {formatDate(task.dueDate)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Assigned To */}
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="text-gray-400">👤</span>
                            <span>{task.assignedTo}</span>
                          </div>
                          
                          {/* Created Date */}
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span className="text-gray-400">📅</span>
                            <span>Erstellt: {new Date(task.createdAt).toLocaleDateString('de-DE')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      {task.status === 'Offen' && (
                        <button 
                          className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          onClick={() => updateTaskStatus(task.id, 'In Bearbeitung')}
                          title="Als 'In Bearbeitung' markieren"
                        >
                          🔄
                        </button>
                      )}
                      {task.status === 'In Bearbeitung' && (
                        <button 
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          onClick={() => updateTaskStatus(task.id, 'Abgeschlossen')}
                          title="Als 'Abgeschlossen' markieren"
                        >
                          ✅
                        </button>
                      )}
                      {task.status === 'Abgeschlossen' && (
                        <button 
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => updateTaskStatus(task.id, 'Offen')}
                          title="Wieder als 'Offen' markieren"
                        >
                          🔄
                        </button>
                      )}
                      <button 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => deleteTask(task.id)}
                        title="Aufgabe löschen"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}