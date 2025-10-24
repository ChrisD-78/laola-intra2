'use client'

import { useEffect, useState } from 'react'
import WiederkehrendeAufgabenForm from '@/components/WiederkehrendeAufgabenForm'
import { getRecurringTasks, createRecurringTask, updateRecurringTask, deleteRecurringTask, RecurringTaskRecord } from '@/lib/db'

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
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRecurringTasks()
        const mapped: RecurringTask[] = data.map((t: RecurringTaskRecord) => ({
          id: t.id as string,
          title: t.title,
          description: t.description,
          frequency: t.frequency,
          priority: t.priority,
          startTime: t.start_time,
          assignedTo: t.assigned_to,
          isActive: t.is_active,
          nextDue: t.next_due,
          createdAt: (t.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0]
        }))
        setRecurringTasks(mapped)
      } catch (e) {
        console.error('Load recurring tasks failed', e)
      }
    }
    load()
  }, [])

  const addNewRecurringTask = async (taskData: {
    title: string
    description: string
    frequency: string
    priority: string
    startTime: string
    assignedTo: string
    isActive: boolean
  }) => {
    const optimistic: RecurringTask = {
      id: `tmp_${Date.now()}`,
      ...taskData,
      nextDue: new Date().toISOString().split('T')[0] + ' ' + taskData.startTime,
      createdAt: new Date().toISOString().split('T')[0]
    }
    setRecurringTasks(prev => [optimistic, ...prev])
    try {
      await createRecurringTask({
        title: taskData.title,
        description: taskData.description,
        frequency: taskData.frequency,
        priority: taskData.priority,
        start_time: taskData.startTime,
        assigned_to: taskData.assignedTo,
        is_active: taskData.isActive,
        next_due: optimistic.nextDue,
      })
      const data = await getRecurringTasks()
      const mapped: RecurringTask[] = data.map((t: RecurringTaskRecord) => ({
        id: t.id as string,
        title: t.title,
        description: t.description,
        frequency: t.frequency,
        priority: t.priority,
        startTime: t.start_time,
        assignedTo: t.assigned_to,
        isActive: t.is_active,
        nextDue: t.next_due,
        createdAt: (t.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0]
      }))
      setRecurringTasks(mapped)
    } catch (e) {
      console.error('Create recurring task failed', e)
      setRecurringTasks(prev => prev.filter(t => t.id !== optimistic.id))
      alert('Wiederkehrende Aufgabe konnte nicht gespeichert werden.')
    }
  }

  const toggleTaskStatus = async (taskId: string) => {
    const prev = recurringTasks
    const target = prev.find(t => t.id === taskId)
    if (!target) return
    const newVal = !target.isActive
    setRecurringTasks(prev => prev.map(task => task.id === taskId ? { ...task, isActive: newVal } : task))
    try {
      await updateRecurringTask(taskId, { is_active: newVal })
    } catch (e) {
      console.error('Toggle recurring task failed', e)
      setRecurringTasks(prev)
      alert('Statuswechsel fehlgeschlagen.')
    }
  }

  const deleteTask = async (taskId: string) => {
    const prev = recurringTasks
    setRecurringTasks(prev.filter(task => task.id !== taskId))
    try {
      await deleteRecurringTask(taskId)
    } catch (e) {
      console.error('Delete recurring task failed', e)
      setRecurringTasks(prev)
      alert('Aufgabe konnte nicht gelöscht werden.')
    }
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

  const getFrequencyColor = () => {
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

  const getDueDateStatus = (nextDue: string) => {
    const date = new Date(nextDue)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { status: 'overdue', color: 'bg-red-100 text-red-800 border-red-200', icon: '🚨' }
    if (diffDays === 0) return { status: 'due-today', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '⚠️' }
    if (diffDays === 1) return { status: 'due-tomorrow', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏰' }
    if (diffDays <= 3) return { status: 'due-soon', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📅' }
    return { status: 'future', color: 'bg-green-100 text-green-800 border-green-200', icon: '✅' }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-4 lg:p-8 text-white">
        <h1 className="text-2xl lg:text-4xl font-bold mb-4 text-center">
          Wiederkehrende Aufgaben
        </h1>
        <p className="text-center text-white/90 text-lg">
          Verwalten Sie Aufgaben, die regelmäßig anfallen
        </p>
      </div>

      {/* Add New Recurring Task */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Neue wiederkehrende Aufgabe erstellen</h2>
            <p className="text-gray-600 mt-1">Erstellen Sie eine neue Aufgabe, die in regelmäßigen Abständen wiederholt wird</p>
          </div>
          <WiederkehrendeAufgabenForm onAddRecurringTask={addNewRecurringTask} />
        </div>
      </div>

      {/* Recurring Tasks List */}
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-xl">🚨</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">Überfällig</p>
                <p className="text-2xl font-bold text-red-900">
                  {recurringTasks.filter(task => {
                    const date = new Date(task.nextDue)
                    const now = new Date()
                    const diffTime = date.getTime() - now.getTime()
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    return diffDays < 0 && task.isActive
                  }).length}
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
                  {recurringTasks.filter(task => {
                    const date = new Date(task.nextDue)
                    const now = new Date()
                    const diffTime = date.getTime() - now.getTime()
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    return diffDays === 0 && task.isActive
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-xl">📅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">Diese Woche</p>
                <p className="text-2xl font-bold text-blue-900">
                  {recurringTasks.filter(task => {
                    const date = new Date(task.nextDue)
                    const now = new Date()
                    const diffTime = date.getTime() - now.getTime()
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    return diffDays > 0 && diffDays <= 7 && task.isActive
                  }).length}
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
                <p className="text-sm font-medium text-green-800">Aktiv</p>
                <p className="text-2xl font-bold text-green-900">
                  {recurringTasks.filter(task => task.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Wiederkehrende Aufgaben</h2>
            <p className="text-gray-600 mt-1">Übersicht aller wiederkehrenden Aufgaben mit Fälligkeitsstatus</p>
          </div>
          <div className="divide-y divide-gray-100">
            {recurringTasks.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine wiederkehrenden Aufgaben</h3>
                <p className="text-gray-600">Erstellen Sie Ihre erste wiederkehrende Aufgabe, um zu beginnen.</p>
              </div>
            ) : (
              recurringTasks.map((task) => {
                const dueStatus = getDueDateStatus(task.nextDue)
                return (
                  <div key={task.id} className="p-6 hover:bg-gray-50 transition-all duration-200">
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
                            <span className={`text-xs ${getFrequencyColor()} px-2 py-1 rounded-full`}>
                              {task.frequency}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full border ${
                              task.isActive 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {task.isActive ? 'Aktiv' : 'Pausiert'}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{task.description}</p>
                          
                          <div className="flex items-center space-x-6">
                            {/* Due Date Status */}
                            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${dueStatus.color}`}>
                              <span className="text-sm">{dueStatus.icon}</span>
                              <div>
                                <p className="text-sm font-medium">
                                  {formatNextDue(task.nextDue)}
                                </p>
                                <p className="text-xs opacity-75">
                                  {formatDate(task.nextDue)}
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
                        <button 
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => toggleTaskStatus(task.id)}
                          title={task.isActive ? 'Pausieren' : 'Aktivieren'}
                        >
                          {task.isActive ? '⏸️' : '▶️'}
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Bearbeiten"
                        >
                          ✏️
                        </button>
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
    </div>
  )
}
