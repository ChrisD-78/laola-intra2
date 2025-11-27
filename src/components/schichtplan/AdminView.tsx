'use client'

import React, { useState } from 'react'
import { ShiftType, AreaType, DaySchedule, Employee, VacationRequest } from '@/types/schichtplan'

interface AdminViewProps {
  schedule: DaySchedule[]
  weekSchedule: DaySchedule[]
  employees: Employee[]
  currentWeekStart: string
  onScheduleUpdate: (schedule: DaySchedule[]) => void
  onEmployeesUpdate: (employees: Employee[]) => void
  onWeekChange: (direction: 'prev' | 'next') => void
  vacationRequests: VacationRequest[]
  onVacationDecision: (requestId: string, approved: boolean, reviewedBy?: string) => void
}

const SHIFT_TYPES: ShiftType[] = ['Frühschicht', 'Mittelschicht', 'Spätschicht']
const AREAS: AreaType[] = ['Halle', 'Kasse', 'Sauna', 'Reinigung', 'Gastro']
const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']

const MIN_STAFFING: Record<AreaType, Record<ShiftType, number>> = {
  'Halle': { 'Frühschicht': 2, 'Mittelschicht': 0, 'Spätschicht': 2 },
  'Kasse': { 'Frühschicht': 1, 'Mittelschicht': 0, 'Spätschicht': 1 },
  'Sauna': { 'Frühschicht': 1, 'Mittelschicht': 0, 'Spätschicht': 1 },
  'Reinigung': { 'Frühschicht': 1, 'Mittelschicht': 0, 'Spätschicht': 1 },
  'Gastro': { 'Frühschicht': 1, 'Mittelschicht': 0, 'Spätschicht': 1 }
}

export default function AdminView({
  schedule,
  weekSchedule,
  employees,
  currentWeekStart,
  onScheduleUpdate,
  onEmployeesUpdate,
  onWeekChange,
  vacationRequests,
  onVacationDecision
}: AdminViewProps) {
  const [newEmployeeFirstName, setNewEmployeeFirstName] = useState('')
  const [newEmployeeLastName, setNewEmployeeLastName] = useState('')
  const [newEmployeeAreas, setNewEmployeeAreas] = useState<AreaType[]>([])
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)

  const getWeekRange = () => {
    const start = new Date(currentWeekStart)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return `${start.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
  }

  const isUnderStaffed = (area: AreaType, shift: ShiftType, assignmentCount: number): boolean => {
    return assignmentCount < MIN_STAFFING[area][shift]
  }

  const assignEmployee = (dateStr: string, area: AreaType, shift: ShiftType, employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId)
    if (!employee || !employee.areas.includes(area)) return

    const updatedSchedule = [...schedule]
    let daySchedule = updatedSchedule.find(s => s.date === dateStr)

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
      updatedSchedule.push(daySchedule)
    }

    if (!daySchedule.shifts[area][shift]) {
      daySchedule.shifts[area][shift] = []
    }

    const assignments = daySchedule.shifts[area][shift]!
    if (!assignments.some(a => a.employeeId === employeeId)) {
      assignments.push({
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`
      })
      onScheduleUpdate(updatedSchedule)
    }
  }

  const removeAssignment = (dateStr: string, area: AreaType, shift: ShiftType, employeeId: string) => {
    const updatedSchedule = [...schedule]
    const daySchedule = updatedSchedule.find(s => s.date === dateStr)

    if (daySchedule?.shifts[area]?.[shift]) {
      daySchedule.shifts[area][shift] = daySchedule.shifts[area][shift]!.filter(
        a => a.employeeId !== employeeId
      )
      onScheduleUpdate(updatedSchedule)
    }
  }

  const addEmployee = () => {
    if (!newEmployeeFirstName.trim() || !newEmployeeLastName.trim() || newEmployeeAreas.length === 0) {
      alert('Bitte alle Felder ausfüllen')
      return
    }

    const newEmployee: Employee = {
      id: Date.now().toString(),
      firstName: newEmployeeFirstName.trim(),
      lastName: newEmployeeLastName.trim(),
      areas: [...newEmployeeAreas]
    }

    onEmployeesUpdate([...employees, newEmployee])
    setNewEmployeeFirstName('')
    setNewEmployeeLastName('')
    setNewEmployeeAreas([])
    setShowEmployeeForm(false)
  }

  const toggleAreaSelection = (area: AreaType) => {
    setNewEmployeeAreas(prev => {
      if (prev.includes(area)) {
        return prev.filter(a => a !== area)
      } else if (prev.length < 4) {
        return [...prev, area]
      }
      return prev
    })
  }

  return (
    <div className="admin-view">
      <div className="admin-header">
        <h1>👨‍💼 Admin Ansicht - Schichtplan</h1>
      </div>

      <div className="week-navigation">
        <button onClick={() => onWeekChange('prev')} className="btn-week-nav">
          ← Vorherige Woche
        </button>
        <div className="week-display">
          <strong>Woche:</strong> {getWeekRange()}
        </div>
        <button onClick={() => onWeekChange('next')} className="btn-week-nav">
          Nächste Woche →
        </button>
      </div>

      <div className="employee-section">
        <button
          className="btn-toggle-form"
          onClick={() => setShowEmployeeForm(!showEmployeeForm)}
        >
          {showEmployeeForm ? '✕ Formular schließen' : '+ Mitarbeiter hinzufügen'}
        </button>
      </div>

      {showEmployeeForm && (
        <div className="employee-form-extended">
          <h4>Neuer Mitarbeiter</h4>
          <div className="name-inputs">
            <input
              type="text"
              placeholder="Vorname"
              value={newEmployeeFirstName}
              onChange={(e) => setNewEmployeeFirstName(e.target.value)}
              className="input-employee"
            />
            <input
              type="text"
              placeholder="Nachname"
              value={newEmployeeLastName}
              onChange={(e) => setNewEmployeeLastName(e.target.value)}
              className="input-employee"
            />
          </div>
          <div className="area-assignment">
            <label>Bereiche (max. 4):</label>
            <div className="area-selector">
              {AREAS.map(area => (
                <button
                  key={area}
                  className={`area-btn ${newEmployeeAreas.includes(area) ? 'selected' : ''}`}
                  onClick={() => toggleAreaSelection(area)}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-add-employee" onClick={addEmployee}>
            Mitarbeiter hinzufügen
          </button>
        </div>
      )}

      {vacationRequests.filter(r => r.status === 'pending').length > 0 && (
        <div className="vacation-requests-section">
          <h2>Offene Urlaubsanträge</h2>
          <div className="vacation-requests-list">
            {vacationRequests.filter(r => r.status === 'pending').map(request => (
              <div key={request.id} className="vacation-request-item">
                <div className="vacation-request-info">
                  <strong>{request.employeeName}</strong>
                  <span className="vacation-date">
                    {new Date(request.startDate).toLocaleDateString('de-DE')} - {new Date(request.endDate).toLocaleDateString('de-DE')}
                  </span>
                  <span className="vacation-type-badge">{request.type}</span>
                </div>
                <div className="vacation-request-actions">
                  <button
                    className="btn-approve"
                    onClick={() => onVacationDecision(request.id, true)}
                  >
                    Genehmigen
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => onVacationDecision(request.id, false)}
                  >
                    Ablehnen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="week-view-container">
        {AREAS.map(area => (
          <div key={area} className="area-section">
            <h3 className="area-title">{area}</h3>
            <div className="area-table-wrapper">
              <table className="week-table">
                <thead>
                  <tr>
                    <th className="shift-header">Schicht</th>
                    {weekSchedule.map((day, index) => (
                      <th key={day.date} className="day-header">
                        <div className="day-name">{WEEKDAYS[index]}</div>
                        <div className="day-date">
                          {new Date(day.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SHIFT_TYPES.map(shift => (
                    <tr key={shift}>
                      <td className="shift-name">{shift}</td>
                      {weekSchedule.map(day => {
                        const assignments = day.shifts[area]?.[shift] || []
                        const underStaffed = isUnderStaffed(area, shift, assignments.length)
                        
                        return (
                          <td key={day.date} className={`shift-cell ${underStaffed ? 'understaffed' : ''}`}>
                            {assignments.length > 0 ? (
                              <div className="shift-content">
                                {assignments.map(assignment => (
                                  <div key={assignment.employeeId} className="assignment-tag">
                                    {assignment.employeeName}
                                    <button
                                      className="btn-remove"
                                      onClick={() => removeAssignment(day.date, area, shift, assignment.employeeId)}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <select
                                className="employee-select"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    assignEmployee(day.date, area, shift, e.target.value)
                                    e.target.value = ''
                                  }
                                }}
                              >
                                <option value="">+ Hinzufügen</option>
                                {employees
                                  .filter(emp => emp.areas.includes(area))
                                  .map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                      {emp.firstName} {emp.lastName}
                                    </option>
                                  ))}
                              </select>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

