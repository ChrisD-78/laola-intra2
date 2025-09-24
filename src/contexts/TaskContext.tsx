'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getTasks as dbGetTasks, createTask as dbCreateTask, updateTask as dbUpdateTask, deleteTaskById as dbDeleteTask, TaskRecord } from '@/lib/db'

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
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await dbGetTasks()
        const mapped: Task[] = data.map((t: TaskRecord) => ({
          id: t.id as string,
          title: t.title,
          description: t.description,
          priority: t.priority,
          status: t.status,
          dueDate: t.due_date,
          assignedTo: t.assigned_to,
          createdAt: (t.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0]
        }))
        setTasks(mapped)
      } catch (e) {
        console.error('Load tasks failed', e)
      }
    }
    load()
  }, [])

  const addTask = async (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    const optimistic: Task = {
      id: `tmp_${Date.now()}`,
      ...taskData,
      status: 'Offen',
      createdAt: new Date().toISOString().split('T')[0]
    }
    setTasks(prev => [optimistic, ...prev])
    try {
      await dbCreateTask({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        due_date: taskData.dueDate,
        assigned_to: taskData.assignedTo,
      })
      const refreshed = await dbGetTasks()
      const mapped: Task[] = refreshed.map((t: TaskRecord) => ({
        id: t.id as string,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        dueDate: t.due_date,
        assignedTo: t.assigned_to,
        createdAt: (t.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0]
      }))
      setTasks(mapped)
    } catch (e) {
      console.error('Create task failed', e)
      // rollback
      setTasks(prev => prev.filter(t => t.id !== optimistic.id))
      alert('Aufgabe konnte nicht gespeichert werden.')
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const prevState = tasks
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    try {
      await dbUpdateTask(taskId, { status: newStatus })
    } catch (e) {
      console.error('Update task failed', e)
      setTasks(prevState)
      alert('Status konnte nicht geändert werden.')
    }
  }

  const deleteTask = async (taskId: string) => {
    const prevState = tasks
    setTasks(prev => prev.filter(t => t.id !== taskId))
    try {
      await dbDeleteTask(taskId)
    } catch (e) {
      console.error('Delete task failed', e)
      setTasks(prevState)
      alert('Aufgabe konnte nicht gelöscht werden.')
    }
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
