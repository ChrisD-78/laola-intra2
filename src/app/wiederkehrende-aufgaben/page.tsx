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
                      <span className={`text-xs ${getFrequencyColor()} px-2 py-1 rounded-full`}>
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
