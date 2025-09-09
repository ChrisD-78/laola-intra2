'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface Task {
  id: string
  title: string
  description: string
  priority: string
  status: string
  dueDate: string
  assignedTo: string
  createdAt: string
}

interface TaskContextType {
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'status' | 'createdAt'>) => void
  updateTaskStatus: (taskId: string, newStatus: string) => void
  deleteTask: (taskId: string) => void
  getTasksByStatus: (status: string) => Task[]
  getTaskStats: () => {
    total: number
    open: number
    inProgress: number
    completed: number
  }
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const useTasks = () => {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider')
  }
  return context
}

interface TaskProviderProps {
  children: ReactNode
}

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Poolreinigung Hauptbecken',
      description: 'Vollständige Reinigung des Hauptbeckens und Überprüfung der Filteranlage',
      priority: 'Hoch',
      status: 'Offen',
      dueDate: '2024-01-20',
      assignedTo: 'Max Mustermann',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Wartung Sauna',
      description: 'Regelmäßige Wartung der Saunaanlage und Temperaturkontrolle',
      priority: 'Mittel',
      status: 'In Bearbeitung',
      dueDate: '2024-01-18',
      assignedTo: 'Anna Schmidt',
      createdAt: '2024-01-14'
    },
    {
      id: '3',
      title: 'Inventur Badeutensilien',
      description: 'Vollständige Inventur aller Badeutensilien und Bestellung fehlender Artikel',
      priority: 'Niedrig',
      status: 'Abgeschlossen',
      dueDate: '2024-01-16',
      assignedTo: 'Tom Weber',
      createdAt: '2024-01-12'
    },
    {
      id: '4',
      title: 'Sicherheitscheck Rettungsausrüstung',
      description: 'Überprüfung aller Rettungsringe, Rettungsbojen und Erste-Hilfe-Ausrüstung',
      priority: 'Kritisch',
      status: 'Offen',
      dueDate: '2024-01-19',
      assignedTo: 'Lisa Müller',
      createdAt: '2024-01-13'
    },
    {
      id: '5',
      title: 'Reinigung Umkleidekabinen',
      description: 'Tiefenreinigung aller Umkleidekabinen und Desinfektion',
      priority: 'Mittel',
      status: 'In Bearbeitung',
      dueDate: '2024-01-17',
      assignedTo: 'Peter Klein',
      createdAt: '2024-01-11'
    }
  ])

  const addTask = (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData,
      status: 'Offen',
      createdAt: new Date().toISOString().split('T')[0]
    }
    setTasks(prevTasks => [newTask, ...prevTasks])
  }

  const updateTaskStatus = (taskId: string, newStatus: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    )
  }

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
  }

  const getTaskStats = () => {
    return {
      total: tasks.length,
      open: tasks.filter(task => task.status === 'Offen').length,
      inProgress: tasks.filter(task => task.status === 'In Bearbeitung').length,
      completed: tasks.filter(task => task.status === 'Abgeschlossen').length
    }
  }

  const value: TaskContextType = {
    tasks,
    addTask,
    updateTaskStatus,
    deleteTask,
    getTasksByStatus,
    getTaskStats
  }

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  )
}
