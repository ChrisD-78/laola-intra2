'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Employee, DaySchedule, VacationRequest, Notification, VacationRequestType } from '@/types/schichtplan'
import AdminView from '@/components/schichtplan/AdminView'
import EmployeeView from '@/components/schichtplan/EmployeeView'
import '@/styles/schichtplan.css'

type ViewMode = 'admin' | 'employee'

// Helper function to get Monday of a given week
const getMondayOfWeek = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  return new Date(d.setDate(diff))
}

export default function SchichtplanPage() {
  const { currentUser, isAdmin, userRole } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>(isAdmin ? 'admin' : 'employee')
  const [schedule, setSchedule] = useState<DaySchedule[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('')
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(() => {
    return getMondayOfWeek(new Date()).toISOString().split('T')[0]
  })
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [showSyncButton, setShowSyncButton] = useState(false)

  // Load data from API
  useEffect(() => {
    if (currentUser) {
      loadData()
      checkSyncStatus()
    }
  }, [currentUser])

  const checkSyncStatus = async () => {
    try {
      const res = await fetch('/api/schichtplan/sync-users')
      const data = await res.json()
      setShowSyncButton(data.needsSync && isAdmin)
    } catch (error) {
      console.error('Failed to check sync status:', error)
    }
  }

  const syncUsers = async () => {
    try {
      const res = await fetch('/api/schichtplan/sync-users', {
        method: 'POST'
      })
      const data = await res.json()
      
      if (data.success) {
        alert(`✅ ${data.synced} Benutzer erfolgreich synchronisiert!`)
        await loadData()
        await checkSyncStatus()
      } else {
        alert('Fehler beim Synchronisieren: ' + (data.error || 'Unbekannter Fehler'))
      }
    } catch (error) {
      console.error('Failed to sync users:', error)
      alert('Fehler beim Synchronisieren der Benutzer')
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load employees
      const employeesRes = await fetch('/api/schichtplan/employees')
      const employeesData = await employeesRes.json()
      setEmployees(employeesData)
      
      // Finde aktuellen Benutzer in der Liste
      if (currentUser && employeesData.length > 0) {
        const currentUserEmployee = employeesData.find((emp: any) => 
          emp.userDisplayName === currentUser || emp.username === currentUser
        )
        if (currentUserEmployee) {
          setCurrentEmployeeId(currentUserEmployee.id)
        } else if (!currentEmployeeId && employeesData.length > 0) {
          setCurrentEmployeeId(employeesData[0].id)
        }
      } else if (employeesData.length > 0 && !currentEmployeeId) {
        setCurrentEmployeeId(employeesData[0].id)
      }

      // Load schedules for current month
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString().split('T')[0]
      
      const schedulesRes = await fetch(`/api/schichtplan/schedules?startDate=${startDate}&endDate=${endDate}`)
      const schedulesData = await schedulesRes.json()
      setSchedule(schedulesData)

      // Load vacation requests
      const vacationRes = await fetch('/api/schichtplan/vacation-requests?status=pending')
      const vacationData = await vacationRes.json()
      setVacationRequests(vacationData)

      // Load notifications for current employee
      if (currentEmployeeId) {
        const notifRes = await fetch(`/api/schichtplan/notifications?employeeId=${currentEmployeeId}`)
        const notifData = await notifRes.json()
        setNotifications(notifData)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleUpdate = async (newSchedule: DaySchedule[]) => {
    setSchedule(newSchedule)
    
    // Save to database
    for (const daySchedule of newSchedule) {
      try {
        await fetch('/api/schichtplan/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(daySchedule)
        })
      } catch (error) {
        console.error('Failed to save schedule:', error)
      }
    }
  }

  const handleEmployeesUpdate = async (newEmployees: Employee[]) => {
    setEmployees(newEmployees)
    
    // Save to database
    for (const employee of newEmployees) {
      try {
        const existing = employees.find(e => e.id === employee.id)
        if (existing) {
          await fetch('/api/schichtplan/employees', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employee)
          })
        } else {
          await fetch('/api/schichtplan/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employee)
          })
        }
      } catch (error) {
        console.error('Failed to save employee:', error)
      }
    }
  }

  const handleVacationRequest = async (employeeId: string, startDate: string, endDate: string, type: VacationRequestType) => {
    const employee = employees.find(e => e.id === employeeId)
    if (!employee) return

    const request: VacationRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      startDate,
      endDate,
      type,
      status: 'pending',
      requestedAt: new Date().toISOString()
    }

    try {
      await fetch('/api/schichtplan/vacation-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })
      
      setVacationRequests(prev => [...prev, request])
      await loadData() // Reload to get updated schedule
    } catch (error) {
      console.error('Failed to create vacation request:', error)
    }
  }

  const handleVacationDecision = async (requestId: string, approved: boolean, reviewedBy: string = 'Admin') => {
    try {
      await fetch('/api/schichtplan/vacation-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: requestId,
          status: approved ? 'approved' : 'rejected',
          reviewedBy
        })
      })

      const updatedRequests = vacationRequests.map(r => 
        r.id === requestId 
          ? { ...r, status: approved ? 'approved' as const : 'rejected' as const, reviewedAt: new Date().toISOString(), reviewedBy }
          : r
      )
      setVacationRequests(updatedRequests)
      await loadData() // Reload to get updated schedule
    } catch (error) {
      console.error('Failed to update vacation request:', error)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/schichtplan/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notificationId })
      })
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const getCurrentWeekSchedule = (): DaySchedule[] => {
    const weekStart = new Date(currentWeekStart)
    const weekSchedule: DaySchedule[] = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      
      let daySchedule = schedule.find(s => s.date === dateStr)
      if (!daySchedule) {
        daySchedule = {
          date: dateStr,
          shifts: {
            'Halle': {},
            'Kasse': {},
            'Sauna': {},
            'Reinigung': {},
            'Gastro': {}
          }
        }
      }
      weekSchedule.push(daySchedule)
    }
    
    return weekSchedule
  }

  const changeWeek = (direction: 'prev' | 'next') => {
    const current = new Date(currentWeekStart)
    const newDate = new Date(current)
    newDate.setDate(current.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeekStart(newDate.toISOString().split('T')[0])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Lade Schichtplan...</div>
      </div>
    )
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-buttons">
          {isAdmin && (
            <button
              className={`nav-btn ${viewMode === 'admin' ? 'active' : ''}`}
              onClick={() => setViewMode('admin')}
            >
              👨‍💼 Admin
            </button>
          )}
          <button
            className={`nav-btn ${viewMode === 'employee' ? 'active' : ''}`}
            onClick={() => setViewMode('employee')}
          >
            👤 Mitarbeiter
          </button>
          {isAdmin && showSyncButton && (
            <button
              className="nav-btn"
              onClick={syncUsers}
              style={{ background: '#10b981', color: 'white' }}
              title="Benutzer aus Benutzerverwaltung synchronisieren"
            >
              🔄 Benutzer synchronisieren
            </button>
          )}
        </div>
        
        {viewMode === 'employee' && (
          <div className="employee-selector">
            <select
              value={currentEmployeeId}
              onChange={(e) => setCurrentEmployeeId(e.target.value)}
              className="employee-dropdown"
            >
              {employees.map(emp => {
                // Zeige aktuellen Benutzer bevorzugt
                const isCurrentUser = (emp as any).userDisplayName === currentUser
                return (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} {isCurrentUser ? '(Sie)' : ''}
                  </option>
                )
              })}
            </select>
          </div>
        )}
      </nav>

      <main className="main-content">
        {viewMode === 'admin' ? (
          <AdminView
            schedule={schedule}
            weekSchedule={getCurrentWeekSchedule()}
            employees={employees}
            currentWeekStart={currentWeekStart}
            onScheduleUpdate={handleScheduleUpdate}
            onEmployeesUpdate={handleEmployeesUpdate}
            onWeekChange={changeWeek}
            vacationRequests={vacationRequests}
            onVacationDecision={handleVacationDecision}
          />
        ) : (
          <EmployeeView
            schedule={schedule}
            weekSchedule={getCurrentWeekSchedule()}
            employees={employees}
            currentEmployeeId={currentEmployeeId}
            currentWeekStart={currentWeekStart}
            onWeekChange={changeWeek}
            onVacationRequest={handleVacationRequest}
            notifications={notifications.filter(n => n.employeeId === currentEmployeeId)}
            onMarkNotificationRead={markNotificationAsRead}
          />
        )}
      </main>
    </div>
  )
}

