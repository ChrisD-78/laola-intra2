'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Employee, DaySchedule, VacationRequest, Notification, VacationRequestType } from '@/types/schichtplan'
import AdminView, { AdminViewRef } from '@/components/schichtplan/AdminView'
import EmployeeView from '@/components/schichtplan/EmployeeView'
import { PushNotificationService } from '@/lib/pushNotifications'
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
  const [viewMode, setViewMode] = useState<ViewMode>('employee')
  
  // Update viewMode when isAdmin or Teamleiter changes
  useEffect(() => {
    if (isAdmin || userRole === 'Teamleiter') {
      setViewMode('admin')
    } else {
      setViewMode('employee')
    }
  }, [isAdmin, userRole])
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
  const [error, setError] = useState<string | null>(null)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushService, setPushService] = useState<PushNotificationService | null>(null)
  const [pushInitializing, setPushInitializing] = useState(true)
  const adminViewRef = useRef<AdminViewRef>(null)
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [showEmployeeManagement, setShowEmployeeManagement] = useState(false)
  
  // Sync states from AdminView ref
  useEffect(() => {
    if (viewMode !== 'admin') {
      setShowEmployeeForm(false)
      setShowEmployeeManagement(false)
      return
    }
    
    const interval = setInterval(() => {
      if (adminViewRef.current) {
        setShowEmployeeForm(adminViewRef.current.showEmployeeForm)
        setShowEmployeeManagement(adminViewRef.current.showEmployeeManagement)
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [viewMode])

  const checkSyncStatus = async () => {
    try {
      const res = await fetch('/api/schichtplan/sync-users')
      if (!res.ok) {
        throw new Error('Failed to check sync status')
      }
      const data = await res.json()
      setShowSyncButton(data.needsSync && isAdmin)
    } catch (error) {
      console.error('Failed to check sync status:', error)
      // Nicht kritisch, einfach ignorieren
    }
  }

  const syncUsers = async () => {
    try {
      const res = await fetch('/api/schichtplan/sync-users', {
        method: 'POST'
      })
      if (!res.ok) {
        throw new Error('Failed to sync users')
      }
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
      setError(null)
      
      // Load employees
      const employeesRes = await fetch('/api/schichtplan/employees')
      if (!employeesRes.ok) {
        throw new Error('Failed to load employees')
      }
      const employeesData = await employeesRes.json()
      
      // Debug: Log birthDate values from API
      console.log('Loaded employees from API:', employeesData.map((emp: any) => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        birthDate: emp.birthDate,
        birthDateType: typeof emp.birthDate
      })))
      
      setEmployees(Array.isArray(employeesData) ? employeesData : [])
      
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
      if (!schedulesRes.ok) {
        throw new Error('Failed to load schedules')
      }
      const schedulesData = await schedulesRes.json()
      setSchedule(Array.isArray(schedulesData) ? schedulesData : [])

      // Load vacation requests
      try {
        const vacationRes = await fetch('/api/schichtplan/vacation-requests?status=pending')
        if (vacationRes.ok) {
          const vacationData = await vacationRes.json()
          setVacationRequests(Array.isArray(vacationData) ? vacationData : [])
        }
      } catch (err) {
        console.error('Failed to load vacation requests:', err)
        setVacationRequests([])
      }

      // Load notifications for current employee
      if (currentEmployeeId) {
        try {
          const notifRes = await fetch(`/api/schichtplan/notifications?employeeId=${currentEmployeeId}`)
          if (notifRes.ok) {
            const notifData = await notifRes.json()
            setNotifications(Array.isArray(notifData) ? notifData : [])
          }
        } catch (err) {
          console.error('Failed to load notifications:', err)
          setNotifications([])
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      setError(error instanceof Error ? error.message : 'Fehler beim Laden der Daten')
    } finally {
      setLoading(false)
    }
  }

  // Initialize Push Notifications
  useEffect(() => {
    const initPush = async () => {
      try {
        setPushInitializing(true)
        const service = PushNotificationService.getInstance()
        const initialized = await service.initialize()
        
        if (initialized) {
          setPushService(service)
          const isSubscribed = await service.isSubscribed()
          console.log('Push Notification Status:', isSubscribed ? 'aktiviert' : 'deaktiviert')
          setPushEnabled(isSubscribed)
        } else {
          console.log('Push Notifications nicht verfügbar (Service Worker oder Push Manager nicht unterstützt)')
          // Setze Service trotzdem, damit der Button angezeigt wird
          setPushService(service)
        }
      } catch (error) {
        console.error('Fehler bei Push Notification Initialisierung:', error)
        // Setze Service trotzdem, damit der Button angezeigt wird
        const service = PushNotificationService.getInstance()
        setPushService(service)
      } finally {
        setPushInitializing(false)
      }
    }
    
    initPush()
  }, [])

  // Load data from API
  useEffect(() => {
    if (currentUser) {
      loadData()
      checkSyncStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, isAdmin])

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
    // Normalize birthDate values for API (empty string, undefined, null all become null)
    const normalizeBirthDateForAPI = (bd: string | undefined | null): string | null => {
      if (bd === undefined || bd === null) return null
      const trimmed = typeof bd === 'string' ? bd.trim() : ''
      return trimmed === '' ? null : trimmed
    }
    
    // Compare birthDate values
    // Important: undefined means "no value provided" (should be treated as null for comparison)
    // null means "explicitly set to null" (existing null value in database)
    // We need to compare the normalized values (both become null)
    const birthDateEquals = (bd1: string | undefined | null, bd2: string | undefined | null): boolean => {
      const norm1 = normalizeBirthDateForAPI(bd1)
      const norm2 = normalizeBirthDateForAPI(bd2)
      return norm1 === norm2
    }
    
    // Save to database first
    for (const employee of newEmployees) {
      try {
        const existing = employees.find(e => e.id === employee.id)
        if (existing) {
          // Check if something changed - use birthDateEquals for birthDate comparison
          const hasChanges = 
            existing.firstName !== employee.firstName ||
            existing.lastName !== employee.lastName ||
            JSON.stringify(existing.areas) !== JSON.stringify(employee.areas) ||
            existing.phone !== employee.phone ||
            existing.email !== employee.email ||
            existing.weeklyHours !== employee.weeklyHours ||
            existing.monthlyHours !== employee.monthlyHours ||
            existing.employmentType !== employee.employmentType ||
            existing.color !== employee.color ||
            !birthDateEquals(existing.birthDate, employee.birthDate) ||
            existing.userId !== employee.userId ||
            existing.role !== employee.role ||
            existing.active !== employee.active
          
          if (hasChanges) {
            // Normalize birthDate before sending to API
            const normalizedBirthDate = normalizeBirthDateForAPI(employee.birthDate)
            const employeeToSave = {
              ...employee,
              birthDate: normalizedBirthDate
            }
            
            console.log('Updating employee:', employeeToSave.id, {
              firstName: employeeToSave.firstName,
              lastName: employeeToSave.lastName,
              originalBirthDate: employee.birthDate,
              normalizedBirthDate: normalizedBirthDate,
              oldBirthDate: existing.birthDate,
              oldBirthDateType: typeof existing.birthDate,
              newBirthDateType: typeof employee.birthDate,
              hasChanges,
              birthDateChanged: !birthDateEquals(existing.birthDate, employee.birthDate)
            })
            
            const response = await fetch('/api/schichtplan/employees', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(employeeToSave)
            })
            
            if (!response.ok) {
              let errorData
              try {
                errorData = await response.json()
              } catch (e) {
                errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
              }
              console.error('Failed to update employee:', {
                status: response.status,
                statusText: response.statusText,
                errorData,
                employeeId: employeeToSave.id,
                employeeData: employeeToSave
              })
              throw new Error(`Failed to update employee: ${errorData.error || errorData.details || 'Unknown error'}`)
            }
            
            const updatedEmployee = await response.json()
            console.log('Employee updated successfully:', updatedEmployee.id, {
              birthDate: updatedEmployee.birthDate,
              returnedBirthDate: updatedEmployee.birthDate,
              fullEmployee: updatedEmployee
            })
          } else {
            console.log('No changes detected for employee:', employee.id, {
              existingBirthDate: existing.birthDate,
              newBirthDate: employee.birthDate
            })
          }
        } else {
          // Normalize birthDate before sending to API
          const employeeToSave = {
            ...employee,
            birthDate: normalizeBirthDateForAPI(employee.birthDate)
          }
          
          console.log('Creating employee:', employeeToSave.id, 'birthDate:', employeeToSave.birthDate)
          
          const response = await fetch('/api/schichtplan/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeToSave)
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            console.error('Failed to create employee:', errorData)
            throw new Error(`Failed to create employee: ${errorData.error || 'Unknown error'}`)
          }
        }
      } catch (error) {
        console.error('Failed to save employee:', error)
        // Reload data to ensure consistency
        await loadData()
        return
      }
    }
    
    // Reload data from database to ensure state is synchronized
    await loadData()
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

  const togglePushNotifications = async () => {
    if (pushInitializing) {
      alert('Push-Benachrichtigungen werden noch initialisiert. Bitte warten Sie einen Moment.')
      return
    }

    // Initialisiere Service falls noch nicht geschehen
    let service = pushService
    if (!service) {
      try {
        service = PushNotificationService.getInstance()
        const initialized = await service.initialize()
        if (!initialized) {
          // Prüfe spezifische Probleme
          const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
          const hasServiceWorker = 'serviceWorker' in navigator
          const hasPushManager = 'PushManager' in window
          
          let errorMsg = 'Push-Benachrichtigungen sind auf diesem Gerät/Browser nicht verfügbar.\n\n'
          
          if (!isHttps) {
            errorMsg += '❌ Seite läuft nicht über HTTPS (erforderlich für Push Notifications)\n'
          }
          if (!hasServiceWorker) {
            errorMsg += '❌ Browser unterstützt keine Service Workers\n'
          }
          if (!hasPushManager) {
            errorMsg += '❌ Browser unterstützt keine Push Notifications\n'
          }
          if (isHttps && hasServiceWorker && hasPushManager) {
            errorMsg += '❌ Service Worker konnte nicht registriert werden\n'
            errorMsg += '\nBitte:\n- Öffnen Sie die Browser-Konsole (F12) für Details\n- Prüfen Sie ob /sw.js erreichbar ist\n- Versuchen Sie die Seite neu zu laden'
          }
          
          alert(errorMsg)
          return
        }
        setPushService(service)
      } catch (error) {
        console.error('Fehler bei Service Initialisierung:', error)
        alert('Fehler bei der Initialisierung der Push-Benachrichtigungen: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'))
        return
      }
    }

    try {
      if (pushEnabled) {
        // Deaktivieren
        console.log('Deaktiviere Push-Benachrichtigungen...')
        const success = await service.unsubscribe()
        if (success) {
          setPushEnabled(false)
          console.log('Push-Benachrichtigungen deaktiviert')
        } else {
          console.error('Fehler beim Deaktivieren')
          alert('Fehler beim Deaktivieren der Push-Benachrichtigungen.')
        }
      } else {
        // Aktivieren
        console.log('Aktiviere Push-Benachrichtigungen...')
        
        // Hole userId für Subscription
        const userId = currentUser ? employees.find((emp: any) => 
          emp.userDisplayName === currentUser || emp.username === currentUser
        )?.userId : undefined
        
        const success = await service.subscribe(userId)
        if (success) {
          setPushEnabled(true)
          console.log('✅ Push-Benachrichtigungen aktiviert')
        } else {
          console.error('❌ Fehler beim Aktivieren')
          // Prüfe ob VAPID Keys konfiguriert sind
          try {
            const vapidResponse = await fetch('/api/push/vapid-public-key')
            if (!vapidResponse.ok) {
              alert('Push-Benachrichtigungen konnten nicht aktiviert werden.\n\nFehler: VAPID Keys sind nicht konfiguriert.\n\nBitte konfigurieren Sie die VAPID Keys in den Netlify Environment Variables.')
              return
            }
            const vapidData = await vapidResponse.json()
            if (!vapidData.publicKey) {
              alert('Push-Benachrichtigungen konnten nicht aktiviert werden.\n\nFehler: VAPID Public Key nicht gefunden.\n\nBitte konfigurieren Sie NEXT_PUBLIC_VAPID_PUBLIC_KEY in den Netlify Environment Variables.')
              return
            }
          } catch (vapidError) {
            console.error('Fehler beim Abrufen der VAPID Keys:', vapidError)
          }
          
          // Safari-spezifische Fehlermeldung
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
          
          let errorMsg = 'Push-Benachrichtigungen konnten nicht aktiviert werden.\n\n'
          
          if (isSafari || isIOS) {
            errorMsg += 'Safari/iOS-spezifische Hinweise:\n'
            errorMsg += '- Benötigt iOS 16.4+ oder macOS 16.4+\n'
            errorMsg += '- Stellen Sie sicher, dass Benachrichtigungen in den Safari-Einstellungen erlaubt sind\n'
            errorMsg += '- Prüfen Sie: Safari → Einstellungen → Websites → Benachrichtigungen\n\n'
          }
          
          errorMsg += 'Mögliche Ursachen:\n'
          errorMsg += '1. Browser-Berechtigung wurde nicht erteilt\n'
          errorMsg += '2. Seite läuft nicht über HTTPS (erforderlich)\n'
          errorMsg += '3. Service Worker konnte nicht initialisiert werden\n\n'
          errorMsg += 'Bitte:\n'
          errorMsg += '- Öffnen Sie die Browser-Konsole (F12) für weitere Details\n'
          errorMsg += '- Prüfen Sie die Browser-Einstellungen für Benachrichtigungen\n'
          errorMsg += '- Stellen Sie sicher, dass die Seite über HTTPS läuft'
          
          alert(errorMsg)
        }
      }
    } catch (error) {
      console.error('Fehler beim Toggle Push Notifications:', error)
      alert('Fehler beim Ändern der Push-Benachrichtigungseinstellungen: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Lade Schichtplan...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">Fehler beim Laden</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => {
              setError(null)
              loadData()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Erneut versuchen
          </button>
        </div>
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
          <button
            className="nav-btn"
            onClick={togglePushNotifications}
            disabled={pushInitializing}
            style={{ 
              background: pushEnabled ? '#10b981' : '#6b7280', 
              color: 'white',
              opacity: pushInitializing ? 0.6 : 1,
              cursor: pushInitializing ? 'wait' : 'pointer'
            }}
            title={pushInitializing 
              ? 'Push-Benachrichtigungen werden initialisiert...' 
              : pushEnabled 
                ? 'Push-Benachrichtigungen deaktivieren' 
                : 'Push-Benachrichtigungen aktivieren'}
          >
            {pushInitializing 
              ? '⏳ Initialisiere...' 
              : pushEnabled 
                ? '🔔 Benachrichtigungen an' 
                : '🔕 Benachrichtigungen aus'}
          </button>
          {viewMode === 'admin' && (
            <>
              <button
                className="nav-btn"
                onClick={() => {
                  adminViewRef.current?.toggleEmployeeForm()
                }}
                style={{ background: '#667eea', color: 'white' }}
                title="Mitarbeiter hinzufügen"
              >
                {showEmployeeForm ? '✕ Abbrechen' : '+ Mitarbeiter'}
              </button>
              <button
                className="nav-btn"
                onClick={() => {
                  adminViewRef.current?.toggleEmployeeManagement()
                }}
                style={{ background: '#667eea', color: 'white' }}
                title="Mitarbeiter verwalten"
              >
                {showEmployeeManagement ? '✕ Schließen' : '👥 Mitarbeiter verwalten'}
              </button>
            </>
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
            ref={adminViewRef}
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
          currentEmployeeId ? (
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
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-xl text-gray-600 mb-4">Keine Mitarbeiter gefunden</div>
                <div className="text-sm text-gray-500">
                  {isAdmin && 'Bitte synchronisieren Sie die Benutzer aus der Benutzerverwaltung.'}
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  )
}

