'use client'

import { useEffect, useState } from 'react'
import WiederkehrendeAufgabenForm from '@/components/WiederkehrendeAufgabenForm'
import { getRecurringTasks, createRecurringTask, updateRecurringTask, deleteRecurringTask, markRecurringTaskCompleted, getRecurringTaskCompletions, RecurringTaskRecord, RecurringTaskCompletionRecord, getLastRecurringTaskCompletion } from '@/lib/db'

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
  const [filteredTasks, setFilteredTasks] = useState<RecurringTask[]>([])
  const [activeFilter, setActiveFilter] = useState<'all' | 'overdue' | 'today' | 'week' | 'active'>('all')
  const [editingTask, setEditingTask] = useState<RecurringTask | null>(null)
  const [completingTask, setCompletingTask] = useState<RecurringTask | null>(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [taskCompletions, setTaskCompletions] = useState<Record<string, RecurringTaskCompletionRecord[]>>({})
  const [lastCompletions, setLastCompletions] = useState<Record<string, { completedAt: string; completedBy: string; notes?: string; nextDueDate?: string } | null>>({})

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

  // Load last completion info for each task (once tasks loaded)
  useEffect(() => {
    const loadLast = async () => {
      try {
        const ids = recurringTasks.map(t => t.id)
        // Avoid refetching already loaded
        const toFetch = ids.filter(id => !(id in lastCompletions))
        for (const id of toFetch) {
          try {
            const last = await getLastRecurringTaskCompletion(id)
            setLastCompletions(prev => ({ ...prev, [id]: last }))
          } catch (e) {
            console.error('Load last completion failed', id, e)
            setLastCompletions(prev => ({ ...prev, [id]: null }))
          }
        }
      } catch (e) {
        console.error('Load last completions failed', e)
      }
    }
    if (recurringTasks.length > 0) loadLast()
  }, [recurringTasks])

  // Filter tasks based on active filter
  useEffect(() => {
    let filtered = recurringTasks

    switch (activeFilter) {
      case 'overdue':
        filtered = recurringTasks.filter(task => {
          const date = new Date(task.nextDue)
          const now = new Date()
          const diffTime = date.getTime() - now.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          return diffDays < 0 && task.isActive
        })
        break
      case 'today':
        filtered = recurringTasks.filter(task => {
          const date = new Date(task.nextDue)
          const now = new Date()
          const diffTime = date.getTime() - now.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          return diffDays === 0 && task.isActive
        })
        break
      case 'week':
        filtered = recurringTasks.filter(task => {
          const date = new Date(task.nextDue)
          const now = new Date()
          const diffTime = date.getTime() - now.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          return diffDays > 0 && diffDays <= 7 && task.isActive
        })
        break
      case 'active':
        filtered = recurringTasks.filter(task => task.isActive)
        break
      default:
        filtered = recurringTasks
    }

    setFilteredTasks(filtered)
  }, [recurringTasks, activeFilter])

  const handleFilterClick = (filter: 'all' | 'overdue' | 'today' | 'week' | 'active') => {
    // Toggle-Funktion: Wenn der gleiche Filter nochmal geklickt wird, zurück zu 'all'
    if (activeFilter === filter && filter !== 'all') {
      setActiveFilter('all')
    } else {
      setActiveFilter(filter)
    }
  }

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

  const editTask = (task: RecurringTask) => {
    setEditingTask(task)
  }

  const saveEditedTask = async (taskData: {
    title: string
    description: string
    frequency: string
    priority: string
    startTime: string
    assignedTo: string
    isActive: boolean
  }) => {
    if (!editingTask) return

    const prev = recurringTasks
    setRecurringTasks(prev.map(task => 
      task.id === editingTask.id 
        ? { ...task, ...taskData }
        : task
    ))

    try {
      await updateRecurringTask(editingTask.id, {
        title: taskData.title,
        description: taskData.description,
        frequency: taskData.frequency,
        priority: taskData.priority,
        start_time: taskData.startTime,
        assigned_to: taskData.assignedTo,
        is_active: taskData.isActive
      })
      setEditingTask(null)
    } catch (e) {
      console.error('Update recurring task failed', e)
      setRecurringTasks(prev)
      alert('Aufgabe konnte nicht aktualisiert werden.')
    }
  }

  const markTaskCompleted = async (task: RecurringTask) => {
    try {
      await markRecurringTaskCompleted(task.id, 'Current User', completionNotes)
      
      // Reload tasks to get updated next_due date
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
      
      setCompletingTask(null)
      setCompletionNotes('')
      alert('Aufgabe wurde als erledigt markiert!')
    } catch (e) {
      console.error('Mark task completed failed', e)
      alert('Aufgabe konnte nicht als erledigt markiert werden.')
    }
  }

  const loadTaskCompletions = async (taskId: string) => {
    try {
      const completions = await getRecurringTaskCompletions(taskId)
      setTaskCompletions(prev => ({
        ...prev,
        [taskId]: completions
      }))
    } catch (e) {
      console.error('Load task completions failed', e)
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
        {/* Summary Cards - Clickable Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Überfällig */}
          <button
            onClick={() => handleFilterClick('overdue')}
            className={`bg-red-50 border rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${
              activeFilter === 'overdue' 
                ? 'border-red-500 ring-2 ring-red-300 shadow-lg' 
                : 'border-red-200 hover:border-red-400'
            }`}
          >
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-xl">🚨</span>
              </div>
              <div className="ml-3 text-left">
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
            {activeFilter === 'overdue' && (
              <div className="mt-2 text-xs text-red-700 font-medium">✓ Aktiver Filter</div>
            )}
          </button>

          {/* Heute fällig */}
          <button
            onClick={() => handleFilterClick('today')}
            className={`bg-orange-50 border rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${
              activeFilter === 'today' 
                ? 'border-orange-500 ring-2 ring-orange-300 shadow-lg' 
                : 'border-orange-200 hover:border-orange-400'
            }`}
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-xl">⚠️</span>
              </div>
              <div className="ml-3 text-left">
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
            {activeFilter === 'today' && (
              <div className="mt-2 text-xs text-orange-700 font-medium">✓ Aktiver Filter</div>
            )}
          </button>

          {/* Diese Woche */}
          <button
            onClick={() => handleFilterClick('week')}
            className={`bg-blue-50 border rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${
              activeFilter === 'week' 
                ? 'border-blue-500 ring-2 ring-blue-300 shadow-lg' 
                : 'border-blue-200 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-xl">📅</span>
              </div>
              <div className="ml-3 text-left">
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
            {activeFilter === 'week' && (
              <div className="mt-2 text-xs text-blue-700 font-medium">✓ Aktiver Filter</div>
            )}
          </button>

          {/* Aktiv */}
          <button
            onClick={() => handleFilterClick('active')}
            className={`bg-green-50 border rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${
              activeFilter === 'active' 
                ? 'border-green-500 ring-2 ring-green-300 shadow-lg' 
                : 'border-green-200 hover:border-green-400'
            }`}
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-xl">✅</span>
              </div>
              <div className="ml-3 text-left">
                <p className="text-sm font-medium text-green-800">Aktiv</p>
                <p className="text-2xl font-bold text-green-900">
                  {recurringTasks.filter(task => task.isActive).length}
                </p>
              </div>
            </div>
            {activeFilter === 'active' && (
              <div className="mt-2 text-xs text-green-700 font-medium">✓ Aktiver Filter</div>
            )}
          </button>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeFilter === 'overdue' && '🚨 Überfällige Aufgaben'}
                  {activeFilter === 'today' && '⚠️ Heute fällige Aufgaben'}
                  {activeFilter === 'week' && '📅 Diese Woche fällig'}
                  {activeFilter === 'active' && '✅ Aktive Aufgaben'}
                  {activeFilter === 'all' && 'Wiederkehrende Aufgaben'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'Aufgabe' : 'Aufgaben'} angezeigt
                </p>
              </div>
              {activeFilter !== 'all' && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Aktiver Filter:</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {activeFilter === 'overdue' && 'Überfällig'}
                    {activeFilter === 'today' && 'Heute fällig'}
                    {activeFilter === 'week' && 'Diese Woche'}
                    {activeFilter === 'active' && 'Aktiv'}
                  </span>
                  <button
                    onClick={() => handleFilterClick('all')}
                    className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    Alle anzeigen
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeFilter === 'all' ? 'Keine wiederkehrenden Aufgaben' : 'Keine Aufgaben in dieser Kategorie'}
                </h3>
                <p className="text-gray-600">
                  {activeFilter === 'all' 
                    ? 'Erstellen Sie Ihre erste wiederkehrende Aufgabe, um zu beginnen.' 
                    : 'Versuchen Sie einen anderen Filter oder zeigen Sie alle Aufgaben an.'}
                </p>
                {activeFilter !== 'all' && (
                  <button
                    onClick={() => handleFilterClick('all')}
                    className="mt-4 text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    Alle Aufgaben anzeigen
                  </button>
                )}
              </div>
            ) : (
              filteredTasks.map((task) => {
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
                      
                      {/* Right Side: Last completion + Action Buttons */}
                      <div className="flex items-center space-x-3 ml-4">
                        {/* Last completion (right aligned, compact) */}
                        <div className="hidden sm:block mr-2">
                          {lastCompletions[task.id] ? (
                            <div className="px-3 py-1.5 border border-blue-200 bg-blue-50 text-blue-800 rounded-lg shadow-sm text-xs whitespace-nowrap">
                              <span className="mr-1">🕒</span>
                              Zuletzt: {new Date(lastCompletions[task.id]!.completedAt).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          ) : (
                            <div className="px-3 py-1.5 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg shadow-sm text-xs whitespace-nowrap">
                              🕒 Noch nie erledigt
                            </div>
                          )}
                        </div>
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <button 
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => toggleTaskStatus(task.id)}
                            title={task.isActive ? 'Pausieren' : 'Aktivieren'}
                          >
                            {task.isActive ? '⏸️' : '▶️'}
                          </button>
                          <button 
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => editTask(task)}
                            title="Bearbeiten"
                          >
                            ✏️
                          </button>
                          <button 
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            onClick={() => setCompletingTask(task)}
                            title="Als erledigt markieren"
                          >
                            ✅
                          </button>
                          <button 
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            onClick={() => loadTaskCompletions(task.id)}
                            title="Erledigungshistorie anzeigen"
                          >
                            📊
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
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Aufgabe bearbeiten
                </h3>
                <button
                  onClick={() => setEditingTask(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <WiederkehrendeAufgabenForm 
                onAddRecurringTask={saveEditedTask}
                initialData={editingTask}
                isEditing={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Complete Task Modal */}
      {completingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Aufgabe als erledigt markieren
                </h3>
                <button
                  onClick={() => {
                    setCompletingTask(null)
                    setCompletionNotes('')
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{completingTask.title}</h4>
                <p className="text-gray-600 text-sm">{completingTask.description}</p>
              </div>
              
              <div>
                <label htmlFor="completionNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notizen (optional)
                </label>
                <textarea
                  id="completionNotes"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Zusätzliche Notizen zur Erledigung..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => markTaskCompleted(completingTask)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Als erledigt markieren
                </button>
                <button
                  onClick={() => {
                    setCompletingTask(null)
                    setCompletionNotes('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completions History Modal */}
      {Object.keys(taskCompletions).length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Erledigungshistorie
                </h3>
                <button
                  onClick={() => setTaskCompletions({})}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {Object.entries(taskCompletions).map(([taskId, completions]) => {
                const task = recurringTasks.find(t => t.id === taskId)
                return (
                  <div key={taskId} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">{task?.title}</h4>
                    {completions.length === 0 ? (
                      <p className="text-gray-500 text-sm">Noch keine Erledigungen</p>
                    ) : (
                      <div className="space-y-2">
                        {completions.map((completion) => (
                          <div key={completion.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Erledigt von: {completion.completed_by}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(completion.completed_at || '').toLocaleString('de-DE')}
                                </p>
                                {completion.notes && (
                                  <p className="text-sm text-gray-600 mt-1">{completion.notes}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
