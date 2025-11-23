'use client'

import { useState, useMemo } from 'react'

interface Holiday {
  date: string // Format: YYYY-MM-DD
  name: string
  type: 'feiertag' | 'ferien'
}

// Gesetzliche Feiertage für Rheinland-Pfalz
const getHolidays = (year: number): Holiday[] => {
  const holidays: Holiday[] = []

  // Feste Feiertage
  holidays.push(
    { date: `${year}-01-01`, name: 'Neujahr', type: 'feiertag' },
    { date: `${year}-05-01`, name: 'Tag der Arbeit', type: 'feiertag' },
    { date: `${year}-10-03`, name: 'Tag der Deutschen Einheit', type: 'feiertag' },
    { date: `${year}-11-01`, name: 'Allerheiligen', type: 'feiertag' }, // Feiertag in Rheinland-Pfalz
    { date: `${year}-12-25`, name: '1. Weihnachtsfeiertag', type: 'feiertag' },
    { date: `${year}-12-26`, name: '2. Weihnachtsfeiertag', type: 'feiertag' }
  )

  // Berechnung beweglicher Feiertage (Ostern-basiert)
  const easter = calculateEaster(year)
  const goodFriday = addDays(easter, -2)
  const easterMonday = addDays(easter, 1)
  const ascension = addDays(easter, 39)
  const whitMonday = addDays(easter, 50)
  const corpusChristi = addDays(easter, 60)

  holidays.push(
    { date: formatDate(goodFriday), name: 'Karfreitag', type: 'feiertag' },
    { date: formatDate(easterMonday), name: 'Ostermontag', type: 'feiertag' },
    { date: formatDate(ascension), name: 'Christi Himmelfahrt', type: 'feiertag' },
    { date: formatDate(whitMonday), name: 'Pfingstmontag', type: 'feiertag' },
    { date: formatDate(corpusChristi), name: 'Fronleichnam', type: 'feiertag' }
  )

  // Ferientage für Rheinland-Pfalz
  if (year === 2025) {
    // Osterferien 2025 (ca. 14.04 - 25.04)
    for (let day = 14; day <= 25; day++) {
      holidays.push({ date: `2025-04-${String(day).padStart(2, '0')}`, name: 'Osterferien', type: 'ferien' })
    }
    
    // Pfingstferien 2025 (30.05 - 02.06)
    holidays.push(
      { date: '2025-05-30', name: 'Pfingstferien', type: 'ferien' },
      { date: '2025-06-02', name: 'Pfingstferien', type: 'ferien' }
    )
    
    // Sommerferien 2025 (28.07 - 05.09)
    for (let month = 7; month <= 8; month++) {
      const startDay = month === 7 ? 28 : 1
      const endDay = month === 7 ? 31 : 5
      for (let day = startDay; day <= endDay; day++) {
        holidays.push({ date: `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, name: 'Sommerferien', type: 'ferien' })
      }
    }
    
    // Herbstferien 2025 (ca. 20.10 - 31.10)
    for (let day = 20; day <= 31; day++) {
      holidays.push({ date: `2025-10-${String(day).padStart(2, '0')}`, name: 'Herbstferien', type: 'ferien' })
    }
    
    // Weihnachtsferien 2025 (22.12 - 31.12)
    for (let day = 22; day <= 31; day++) {
      holidays.push({ date: `2025-12-${String(day).padStart(2, '0')}`, name: 'Weihnachtsferien', type: 'ferien' })
    }
  } else if (year === 2026) {
    // Osterferien 2026 (ca. 30.03 - 11.04)
    for (let day = 30; day <= 31; day++) {
      holidays.push({ date: `2026-03-${String(day).padStart(2, '0')}`, name: 'Osterferien', type: 'ferien' })
    }
    for (let day = 1; day <= 11; day++) {
      holidays.push({ date: `2026-04-${String(day).padStart(2, '0')}`, name: 'Osterferien', type: 'ferien' })
    }
    
    // Pfingstferien 2026 (22.05 - 25.05)
    for (let day = 22; day <= 25; day++) {
      holidays.push({ date: `2026-05-${String(day).padStart(2, '0')}`, name: 'Pfingstferien', type: 'ferien' })
    }
    
    // Sommerferien 2026 (27.07 - 04.09)
    for (let month = 7; month <= 8; month++) {
      const startDay = month === 7 ? 27 : 1
      const endDay = month === 7 ? 31 : 4
      for (let day = startDay; day <= endDay; day++) {
        holidays.push({ date: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, name: 'Sommerferien', type: 'ferien' })
      }
    }
    
    // Herbstferien 2026 (ca. 19.10 - 30.10)
    for (let day = 19; day <= 30; day++) {
      holidays.push({ date: `2026-10-${String(day).padStart(2, '0')}`, name: 'Herbstferien', type: 'ferien' })
    }
    
    // Weihnachtsferien 2026 (23.12 - 31.12)
    for (let day = 23; day <= 31; day++) {
      holidays.push({ date: `2026-12-${String(day).padStart(2, '0')}`, name: 'Weihnachtsferien', type: 'ferien' })
    }
  }

  return holidays
}

// Berechnet das Osterdatum (Gauß'sche Osterformel)
function calculateEaster(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const holidays = useMemo(() => getHolidays(year), [year])

  // Erste Tag des Monats
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() // 0 = Sonntag, 1 = Montag, etc.

  // Anpassung: Montag = 0, Sonntag = 6
  const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ]

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getDayInfo = (day: number): { isHoliday: boolean; isVacation: boolean; holidayName?: string } => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const holiday = holidays.find(h => h.date === dateStr)
    
    if (holiday) {
      return {
        isHoliday: holiday.type === 'feiertag',
        isVacation: holiday.type === 'ferien',
        holidayName: holiday.name
      }
    }
    
    return { isHoliday: false, isVacation: false }
  }

  const isToday = (day: number): boolean => {
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const isWeekend = (dayIndex: number): boolean => {
    const date = new Date(year, month, dayIndex + 1 - adjustedStartingDay)
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Vorheriger Monat"
        >
          <span className="text-xl text-gray-900">←</span>
        </button>
        
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900">
            {monthNames[month]} {year}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-100 text-gray-900 rounded-lg hover:bg-blue-200 transition-colors font-medium"
          >
            Heute
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Nächster Monat"
          >
            <span className="text-xl text-gray-900">→</span>
          </button>
        </div>
      </div>

      {/* Wochentage */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-900 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Kalendertage */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leere Zellen für Tage vor dem ersten Tag des Monats */}
        {Array.from({ length: adjustedStartingDay }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Tage des Monats */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const dayInfo = getDayInfo(day)
          const today = isToday(day)
          const weekend = isWeekend(adjustedStartingDay + index)

          return (
            <div
              key={day}
              className={`aspect-square flex flex-col items-center justify-center rounded-full transition-all duration-200 cursor-pointer relative group ${
                today
                  ? 'bg-blue-600 text-white font-bold shadow-lg ring-2 ring-blue-300'
                  : dayInfo.isHoliday
                  ? 'bg-red-100 text-red-700 font-semibold hover:bg-red-200'
                  : dayInfo.isVacation
                  ? 'bg-orange-100 text-orange-700 font-semibold hover:bg-orange-200'
                  : weekend
                  ? 'bg-gray-50 text-gray-400'
                  : 'bg-gray-50 text-gray-900 hover:bg-blue-50 hover:text-blue-700'
              }`}
              onClick={() => setSelectedDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
              title={dayInfo.holidayName || `${day}. ${monthNames[month]}`}
            >
              <span className="text-sm lg:text-base">{day}</span>
              {(dayInfo.isHoliday || dayInfo.isVacation) && (
                <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
              )}
            </div>
          )
        })}
      </div>

      {/* Legende */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-blue-600 ring-2 ring-blue-300"></div>
            <span className="text-gray-900">Heute</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-100"></div>
            <span className="text-gray-900">Feiertag</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-orange-100"></div>
            <span className="text-gray-900">Ferien</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gray-50"></div>
            <span className="text-gray-900">Wochenende</span>
          </div>
        </div>
      </div>

      {/* Feiertags-Info für ausgewählten Tag */}
      {selectedDate && (() => {
        const holiday = holidays.find(h => h.date === selectedDate)
        if (holiday) {
          return (
            <div className={`mt-4 p-3 rounded-lg ${
              holiday.type === 'feiertag' ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'
            }`}>
              <p className="text-sm font-semibold text-gray-900">
                {holiday.name}
              </p>
            </div>
          )
        }
        return null
      })()}
    </div>
  )
}

