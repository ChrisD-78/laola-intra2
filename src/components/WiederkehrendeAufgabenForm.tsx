'use client'

import { useState, useEffect } from 'react'

interface WiederkehrendeAufgabenFormProps {
  onAddRecurringTask: (task: {
    title: string
    description: string
    frequency: string
    priority: string
    startTime: string
    assignedTo: string
    isActive: boolean
  }) => void
  initialData?: {
    title: string
    description: string
    frequency: string
    priority: string
    startTime: string
    assignedTo: string
    isActive: boolean
  }
  isEditing?: boolean
}

const WiederkehrendeAufgabenForm = ({ onAddRecurringTask, initialData, isEditing = false }: WiederkehrendeAufgabenFormProps) => {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [frequency, setFrequency] = useState(initialData?.frequency || 'Täglich')
  const [priority, setPriority] = useState(initialData?.priority || 'Mittel')
  const [startTime, setStartTime] = useState(initialData?.startTime || '')
  const [assignedTo, setAssignedTo] = useState(initialData?.assignedTo || '')
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isEditing && initialData) {
      setIsOpen(true)
    }
  }, [isEditing, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && description.trim() && startTime && assignedTo) {
      onAddRecurringTask({
        title: title.trim(),
        description: description.trim(),
        frequency,
        priority,
        startTime,
        assignedTo: assignedTo.trim(),
        isActive
      })
      setTitle('')
      setDescription('')
      setFrequency('Täglich')
      setPriority('Mittel')
      setStartTime('')
      setAssignedTo('')
      setIsOpen(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setFrequency('Täglich')
    setPriority('Mittel')
    setStartTime('')
    setAssignedTo('')
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Erstellen
      </button>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Neue wiederkehrende Aufgabe erstellen
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Aufgabenname *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. Poolreinigung Hauptbecken"
                  required
                  autoFocus
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detaillierte Beschreibung der wiederkehrenden Aufgabe..."
                  required
                />
              </div>
              
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Häufigkeit
                </label>
                <select
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Täglich">Täglich</option>
                  <option value="Wöchentlich">Wöchentlich</option>
                  <option value="Monatlich">Monatlich</option>
                  <option value="Jährlich">Jährlich</option>
                  <option value="Alle 2 Wochen">Alle 2 Wochen</option>
                  <option value="Alle 3 Monate">Alle 3 Monate</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priorität
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Niedrig">Niedrig</option>
                  <option value="Mittel">Mittel</option>
                  <option value="Hoch">Hoch</option>
                  <option value="Kritisch">Kritisch</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Startzeit *
                </label>
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  min="05:00"
                  max="23:59"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
                  Zugewiesen an *
                </label>
                <input
                  type="text"
                  id="assignedTo"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Name des Mitarbeiters"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Aufgabe ist aktiv
                  </span>
                </label>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {isEditing ? 'Änderungen speichern' : 'Wiederkehrende Aufgabe erstellen'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default WiederkehrendeAufgabenForm
