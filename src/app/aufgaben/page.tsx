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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900">Aufgaben</h1>
        <p className="mt-2 text-gray-600">
          Verwalten Sie alle offenen und abgeschlossenen Aufgaben
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Aufgaben suchen..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Alle Status</option>
            <option>Offen</option>
            <option>In Bearbeitung</option>
            <option>Abgeschlossen</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Alle Prioritäten</option>
            <option>Niedrig</option>
            <option>Mittel</option>
            <option>Hoch</option>
            <option>Kritisch</option>
          </select>
          <AufgabenForm onAddTask={addNewTask} />
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Alle Aufgaben</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {tasks.map((task) => (
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
                      <span className={`text-xs ${getStatusColor(task.status)} px-2 py-1 rounded-full`}>
                        {task.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        Fällig: {new Date(task.dueDate).toLocaleDateString('de-DE')}
                      </span>
                      <span className="text-xs text-gray-500">
                        Zugewiesen: {task.assignedTo}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    className="p-2 text-gray-400 hover:text-gray-600"
                    onClick={() => updateTaskStatus(task.id, 'In Bearbeitung')}
                    title="Als 'In Bearbeitung' markieren"
                  >
                    🔄
                  </button>
                  <button 
                    className="p-2 text-gray-400 hover:text-gray-600"
                    onClick={() => updateTaskStatus(task.id, 'Abgeschlossen')}
                    title="Als 'Abgeschlossen' markieren"
                  >
                    ✅
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