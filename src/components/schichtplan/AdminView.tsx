'use client'

import React, { useEffect, useRef, useState, useMemo, useImperativeHandle, forwardRef } from 'react';
import { ShiftType, AreaType, DaySchedule, Employee, SpecialStatus, EmployeeColor, VacationRequest, EmploymentType } from '@/types/schichtplan';

interface Holiday {
  date: string; // Format: YYYY-MM-DD
  name: string;
  type: 'feiertag' | 'ferien';
}

interface AdminViewProps {
  schedule: DaySchedule[];
  weekSchedule: DaySchedule[];
  employees: Employee[];
  currentWeekStart: string;
  onScheduleUpdate: (schedule: DaySchedule[]) => void;
  onEmployeesUpdate: (employees: Employee[]) => void;
  onWeekChange: (direction: 'prev' | 'next') => void;
  vacationRequests: VacationRequest[];
  onVacationDecision: (requestId: string, approved: boolean, reviewedBy?: string) => void;
}

export interface AdminViewRef {
  toggleEmployeeForm: () => void;
  toggleEmployeeManagement: () => void;
  showEmployeeForm: boolean;
  showEmployeeManagement: boolean;
}

const SHIFT_TYPES: ShiftType[] = ['Frühschicht', 'Mittelschicht', 'Spätschicht', 'Gastro Reinigung', 'Sauna Reinigung'];
const AREAS: AreaType[] = ['Halle', 'Kasse', 'Sauna', 'Reinigung', 'Gastro'];
const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

// Gesetzliche Feiertage für Rheinland-Pfalz
const getHolidays = (year: number): Holiday[] => {
  const holidays: Holiday[] = []

  // Feste Feiertage
  holidays.push(
    { date: `${year}-01-01`, name: 'Neujahr', type: 'feiertag' },
    { date: `${year}-05-01`, name: 'Tag der Arbeit', type: 'feiertag' },
    { date: `${year}-10-03`, name: 'Tag der Deutschen Einheit', type: 'feiertag' },
    { date: `${year}-11-01`, name: 'Allerheiligen', type: 'feiertag' },
    { date: `${year}-12-25`, name: '1. Weihnachtsfeiertag', type: 'feiertag' },
    { date: `${year}-12-26`, name: '2. Weihnachtsfeiertag', type: 'feiertag' }
  )

  // Berechnung beweglicher Feiertage (Ostern-basiert)
  const easter = calculateEaster(year)
  const goodFriday = addDaysToDate(easter, -2)
  const easterMonday = addDaysToDate(easter, 1)
  const ascension = addDaysToDate(easter, 39)
  const whitMonday = addDaysToDate(easter, 50)
  const corpusChristi = addDaysToDate(easter, 60)

  holidays.push(
    { date: formatDateToString(goodFriday), name: 'Karfreitag', type: 'feiertag' },
    { date: formatDateToString(easterMonday), name: 'Ostermontag', type: 'feiertag' },
    { date: formatDateToString(ascension), name: 'Christi Himmelfahrt', type: 'feiertag' },
    { date: formatDateToString(whitMonday), name: 'Pfingstmontag', type: 'feiertag' },
    { date: formatDateToString(corpusChristi), name: 'Fronleichnam', type: 'feiertag' }
  )

  // Ferientage für Rheinland-Pfalz
  if (year === 2025) {
    // Osterferien 2025
    for (let day = 14; day <= 25; day++) {
      holidays.push({ date: `2025-04-${String(day).padStart(2, '0')}`, name: 'Osterferien', type: 'ferien' })
    }
    // Pfingstferien 2025
    holidays.push(
      { date: '2025-05-30', name: 'Pfingstferien', type: 'ferien' },
      { date: '2025-06-02', name: 'Pfingstferien', type: 'ferien' }
    )
    // Sommerferien 2025
    for (let month = 7; month <= 8; month++) {
      const startDay = month === 7 ? 28 : 1
      const endDay = month === 7 ? 31 : 5
      for (let day = startDay; day <= endDay; day++) {
        holidays.push({ date: `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, name: 'Sommerferien', type: 'ferien' })
      }
    }
    // Herbstferien 2025
    for (let day = 20; day <= 31; day++) {
      holidays.push({ date: `2025-10-${String(day).padStart(2, '0')}`, name: 'Herbstferien', type: 'ferien' })
    }
    // Weihnachtsferien 2025
    for (let day = 22; day <= 31; day++) {
      holidays.push({ date: `2025-12-${String(day).padStart(2, '0')}`, name: 'Weihnachtsferien', type: 'ferien' })
    }
  } else if (year === 2026) {
    // Osterferien 2026
    for (let day = 30; day <= 31; day++) {
      holidays.push({ date: `2026-03-${String(day).padStart(2, '0')}`, name: 'Osterferien', type: 'ferien' })
    }
    for (let day = 1; day <= 11; day++) {
      holidays.push({ date: `2026-04-${String(day).padStart(2, '0')}`, name: 'Osterferien', type: 'ferien' })
    }
    // Pfingstferien 2026
    for (let day = 22; day <= 25; day++) {
      holidays.push({ date: `2026-05-${String(day).padStart(2, '0')}`, name: 'Pfingstferien', type: 'ferien' })
    }
    // Sommerferien 2026
    for (let month = 7; month <= 8; month++) {
      const startDay = month === 7 ? 27 : 1
      const endDay = month === 7 ? 31 : 4
      for (let day = startDay; day <= endDay; day++) {
        holidays.push({ date: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, name: 'Sommerferien', type: 'ferien' })
      }
    }
    // Herbstferien 2026
    for (let day = 19; day <= 30; day++) {
      holidays.push({ date: `2026-10-${String(day).padStart(2, '0')}`, name: 'Herbstferien', type: 'ferien' })
    }
    // Weihnachtsferien 2026
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

function addDaysToDate(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function formatDateToString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Color mapping function
const getColorValue = (color: EmployeeColor | undefined): string => {
  if (!color) return 'transparent';
  const colorMap: Record<EmployeeColor, string> = {
    'Rot': '#ef4444',
    'Braun': '#92400e',
    'Schwarz': '#1f2937',
    'Grün': '#10b981',
    'Violett': '#8b5cf6',
    'Blau': '#3b82f6',
    'Gelb': '#eab308'
  };
  return colorMap[color];
};

// Minimum staffing requirements per area and shift
const MIN_STAFFING: Record<AreaType, Record<ShiftType, number>> = {
  'Halle': {
    'Frühschicht': 2,
    'Mittelschicht': 0,
    'Spätschicht': 2,
    'Gastro Reinigung': 0,
    'Sauna Reinigung': 0
  },
  'Kasse': {
    'Frühschicht': 1,
    'Mittelschicht': 0,
    'Spätschicht': 1,
    'Gastro Reinigung': 0,
    'Sauna Reinigung': 0
  },
  'Sauna': {
    'Frühschicht': 1,
    'Mittelschicht': 0,
    'Spätschicht': 1,
    'Gastro Reinigung': 0,
    'Sauna Reinigung': 1
  },
  'Reinigung': {
    'Frühschicht': 1,
    'Mittelschicht': 0,
    'Spätschicht': 1,
    'Gastro Reinigung': 0,
    'Sauna Reinigung': 0
  },
  'Gastro': {
    'Frühschicht': 1,
    'Mittelschicht': 0,
    'Spätschicht': 1,
    'Gastro Reinigung': 1,
    'Sauna Reinigung': 0
  }
};

const AdminView = forwardRef<AdminViewRef, AdminViewProps>(({ 
  schedule, 
  weekSchedule,
  employees, 
  currentWeekStart,
  onScheduleUpdate,
  onEmployeesUpdate,
  onWeekChange,
  vacationRequests,
  onVacationDecision
}, ref) => {
  const [newEmployeeFirstName, setNewEmployeeFirstName] = useState('');
  const [newEmployeeLastName, setNewEmployeeLastName] = useState('');
  const [newEmployeePhone, setNewEmployeePhone] = useState('');
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [newEmployeeEmploymentType, setNewEmployeeEmploymentType] = useState<EmploymentType | ''>('');
  const [newEmployeeWeeklyHours, setNewEmployeeWeeklyHours] = useState<string>('');
  const [newEmployeeMonthlyHours, setNewEmployeeMonthlyHours] = useState<string>('');
  const [newEmployeeAreas, setNewEmployeeAreas] = useState<AreaType[]>([]);
  const [newEmployeeColor, setNewEmployeeColor] = useState<EmployeeColor | undefined>(undefined);
  const [newEmployeeBirthDate, setNewEmployeeBirthDate] = useState<string>('');
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [showEmployeeManagement, setShowEmployeeManagement] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    toggleEmployeeForm: () => {
      if (showEmployeeForm && editingEmployeeId) {
        cancelEdit();
      } else {
        setShowEmployeeForm(!showEmployeeForm);
        setShowEmployeeManagement(false);
      }
    },
    toggleEmployeeManagement: () => {
      setShowEmployeeManagement(!showEmployeeManagement);
      setShowEmployeeForm(false);
      setEditingEmployeeId(null);
    },
    showEmployeeForm,
    showEmployeeManagement
  }));
  
  // PDF Export states
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportType, setExportType] = useState<'area' | 'days' | 'employee'>('area');
  const [exportSelectedArea, setExportSelectedArea] = useState<AreaType>('Halle');
  const [exportSelectedEmployees, setExportSelectedEmployees] = useState<string[]>([]);
  const [exportStartDate, setExportStartDate] = useState<string>('');
  const [exportEndDate, setExportEndDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'area' | 'employee'>('area');
  const [employeeViewMode, setEmployeeViewMode] = useState<'week' | 'month'>('week');
  
  // SP Einstellung (Urlaubsplanung Voreinstellungen)
  const [showVacationLimitsModal, setShowVacationLimitsModal] = useState(false);
  const [vacationLimits, setVacationLimits] = useState<Array<{
    id: number;
    startDate: string;
    endDate: string;
    area: AreaType;
    maxEmployees: number;
  }>>([]);
  const [newLimit, setNewLimit] = useState({
    startDate: '',
    endDate: '',
    area: 'Halle' as AreaType,
    maxEmployees: 1
  });
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  // Bulk assignment state
  const [showBulkAssignment, setShowBulkAssignment] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [bulkStartDate, setBulkStartDate] = useState<string>(currentWeekStart);
  const [bulkEndDate, setBulkEndDate] = useState<string>(() => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    return end.toISOString().split('T')[0];
  });
  const [bulkShift, setBulkShift] = useState<ShiftType>('Frühschicht');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]); // Mo-Fr default
  
  // Drag and Drop state
  const [draggedEmployee, setDraggedEmployee] = useState<{
    employeeId: string;
    employeeName: string;
    sourceDate: string;
    sourceArea: AreaType;
    sourceShift: ShiftType;
  } | null>(null);

  // Drag state for employee view
  const [draggedShiftType, setDraggedShiftType] = useState<ShiftType | SpecialStatus | null>(null);
  const [hoveredDropCell, setHoveredDropCell] = useState<{employeeId: string, dateStr: string} | null>(null);
  const [draggedShiftFromCell, setDraggedShiftFromCell] = useState<{employeeId: string, dateStr: string, shiftType: ShiftType | SpecialStatus} | null>(null);
  
  // Multi-day assignment state
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [lastSelectedCell, setLastSelectedCell] = useState<{ employeeId: string; dateStr: string } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'add' | 'remove'>('add');
  const selectionDragRef = useRef(false);
  const skipClickRef = useRef(false);
  
  // Week copy dialog state
  // Sort state for employee view
  const [sortBy, setSortBy] = useState<'name' | 'area' | 'color'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [showWeekCopyDialog, setShowWeekCopyDialog] = useState(false);
  const [copySourceWeek, setCopySourceWeek] = useState<string>(currentWeekStart);
  const [copyTargetWeek, setCopyTargetWeek] = useState<string>(() => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  });
  const [copySourceMonth, setCopySourceMonth] = useState<string>(() => {
    const now = new Date(currentWeekStart);
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [copyTargetMonth, setCopyTargetMonth] = useState<string>(() => {
    const nextMonth = new Date(currentWeekStart);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
  });

  // Geburtstagsanzeige - Berechne anstehende Geburtstage
  const getUpcomingBirthdays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);
    in30Days.setHours(0, 0, 0, 0); // Stelle sicher, dass auch in30Days auf Mitternacht gesetzt ist

    const upcomingBirthdays: Array<{
      employee: Employee;
      birthday: Date;
      daysUntil: number;
      age: number;
    }> = [];

    console.log('🎂 Calculating upcoming birthdays. Total employees:', employees.length);
    console.log('📅 Today:', today.toISOString().split('T')[0], '(', today.toLocaleDateString('de-DE'), ')');
    console.log('📅 In 30 days:', in30Days.toISOString().split('T')[0]);

    employees.forEach(employee => {
      // Check if employee is active (default to true if undefined)
      const isActive = employee.active !== false;
      
      if (!employee.birthDate || !isActive) {
        // Debug logs für bessere Fehlerdiagnose
        if (!employee.birthDate) {
          console.log(`⏭️ Skipping ${employee.firstName} ${employee.lastName}: no birthDate`);
        } else if (!isActive) {
          console.log(`⏭️ Skipping ${employee.firstName} ${employee.lastName}: not active`);
        }
        return;
      }

      // Parse birthDate safely - nur Monat und Tag verwenden, nicht das Jahr
      try {
        console.log(`🔍 Processing ${employee.firstName} ${employee.lastName} - birthDate: "${employee.birthDate}" (type: ${typeof employee.birthDate}, length: ${employee.birthDate?.length})`);
        
        // Trim und normalisiere das Datum
        const normalizedBirthDate = employee.birthDate.trim();
        
        // Versuche verschiedene Datumsformate zu parsen
        let birthYear: number, month: number, day: number;
        
        // Format 1: YYYY-MM-DD (Standard)
        if (normalizedBirthDate.includes('-')) {
          const birthDateParts = normalizedBirthDate.split('-').map(part => part.trim());
          console.log(`📋 Split parts: [${birthDateParts.join(', ')}]`);
          
          if (birthDateParts.length !== 3) {
            console.error(`❌ Invalid birthDate format for ${employee.firstName} ${employee.lastName}: "${normalizedBirthDate}" (expected YYYY-MM-DD, got ${birthDateParts.length} parts)`);
            return;
          }

          birthYear = parseInt(birthDateParts[0], 10);
          month = parseInt(birthDateParts[1], 10);
          day = parseInt(birthDateParts[2], 10);
          
          console.log(`📋 Parsed values: year=${birthYear}, month=${month}, day=${day} (raw: "${birthDateParts[0]}", "${birthDateParts[1]}", "${birthDateParts[2]}")`);
        } 
        // Format 2: DD.MM.YYYY (deutsches Format)
        else if (normalizedBirthDate.includes('.')) {
          const birthDateParts = normalizedBirthDate.split('.').map(part => part.trim());
          console.log(`📋 Split parts (DD.MM.YYYY): [${birthDateParts.join(', ')}]`);
          
          if (birthDateParts.length !== 3) {
            console.error(`❌ Invalid birthDate format for ${employee.firstName} ${employee.lastName}: "${normalizedBirthDate}" (expected DD.MM.YYYY, got ${birthDateParts.length} parts)`);
            return;
          }

          day = parseInt(birthDateParts[0], 10);
          month = parseInt(birthDateParts[1], 10);
          birthYear = parseInt(birthDateParts[2], 10);
          
          console.log(`📋 Parsed values (DD.MM.YYYY): year=${birthYear}, month=${month}, day=${day}`);
        } 
        else {
          console.error(`❌ Unknown birthDate format for ${employee.firstName} ${employee.lastName}: "${normalizedBirthDate}" (expected YYYY-MM-DD or DD.MM.YYYY)`);
          return;
        }
        
        // Validate parsed values
        if (isNaN(birthYear) || isNaN(month) || isNaN(day)) {
          console.error(`❌ Invalid birthDate values for ${employee.firstName} ${employee.lastName}: year=${birthYear}, month=${month}, day=${day} (one or more is NaN)`);
          return;
        }
        
        if (month < 1 || month > 12 || day < 1 || day > 31) {
          console.error(`❌ Invalid birthDate range for ${employee.firstName} ${employee.lastName}: year=${birthYear}, month=${month}, day=${day} (month must be 1-12, day must be 1-31)`);
          return;
        }
        
        console.log(`✅ Parsed birthDate for ${employee.firstName} ${employee.lastName}: year=${birthYear}, month=${month}, day=${day}`);

        // Berechne den nächsten Geburtstag - nur mit Monat und Tag, nicht mit Jahr
        const currentYear = today.getFullYear();
        
        // Erstelle Datum für dieses Jahr
        const thisYearBirthday = new Date(currentYear, month - 1, day);
        if (isNaN(thisYearBirthday.getTime())) {
          console.error(`❌ Invalid date created for ${employee.firstName} ${employee.lastName}: month=${month}, day=${day}`);
          return;
        }
        thisYearBirthday.setHours(0, 0, 0, 0);
        
        // Erstelle Datum für nächstes Jahr
        const nextYearBirthday = new Date(currentYear + 1, month - 1, day);
        if (isNaN(nextYearBirthday.getTime())) {
          console.error(`❌ Invalid date created for ${employee.firstName} ${employee.lastName}: month=${month}, day=${day} (next year)`);
          return;
        }
        nextYearBirthday.setHours(0, 0, 0, 0);

        // Bestimme den nächsten Geburtstag (dieses Jahr oder nächstes Jahr)
        let birthday: Date;
        const todayTime = today.getTime();
        const thisYearTime = thisYearBirthday.getTime();
        const nextYearTime = nextYearBirthday.getTime();
        
        if (thisYearTime >= todayTime) {
          // Geburtstag ist noch in diesem Jahr (heute oder in der Zukunft)
          birthday = thisYearBirthday;
          console.log(`📅 ${employee.firstName} ${employee.lastName}: Using this year's birthday (${thisYearBirthday.toISOString().split('T')[0]})`);
        } else {
          // Geburtstag war bereits in diesem Jahr, nimm nächstes Jahr
          birthday = nextYearBirthday;
          console.log(`📅 ${employee.firstName} ${employee.lastName}: Using next year's birthday (${nextYearBirthday.toISOString().split('T')[0]})`);
        }

        // Prüfe ob birthday ein gültiges Datum ist
        if (isNaN(birthday.getTime())) {
          console.error(`❌ Invalid birthday date for ${employee.firstName} ${employee.lastName}:`, birthday);
          return;
        }

        // Berechne daysUntil für Anzeige
        const daysUntil = Math.floor((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Prüfe ob der Geburtstag in den nächsten 30 Tagen liegt
        // Verwende Tage-Berechnung (0-30 Tage) für zuverlässige Ergebnisse
        // daysUntil kann negativ sein, wenn der Geburtstag in der Vergangenheit liegt
        const isInRange = daysUntil >= 0 && daysUntil <= 30;
        
        // Sicherstellen, dass alle Daten gültig sind bevor toISOString() aufgerufen wird
        const thisYearBirthdayStr = isNaN(thisYearBirthday.getTime()) ? 'Invalid Date' : thisYearBirthday.toISOString().split('T')[0];
        const nextYearBirthdayStr = isNaN(nextYearBirthday.getTime()) ? 'Invalid Date' : nextYearBirthday.toISOString().split('T')[0];
        const birthdayStr = isNaN(birthday.getTime()) ? 'Invalid Date' : birthday.toISOString().split('T')[0];
        
        console.log(`🔍 Checking ${employee.firstName} ${employee.lastName}:`, {
          birthDate: employee.birthDate,
          birthYear,
          month,
          day,
          thisYearBirthday: thisYearBirthdayStr,
          nextYearBirthday: nextYearBirthdayStr,
          selectedBirthday: birthdayStr,
          today: today.toISOString().split('T')[0],
          in30Days: in30Days.toISOString().split('T')[0],
          daysUntil,
          isInRange
        });
        
        if (isInRange) {
          // Berechne das Alter basierend auf dem Geburtsjahr
          const age = birthday.getFullYear() - birthYear;
          
          const birthdayStr = isNaN(birthday.getTime()) ? 'Invalid Date' : birthday.toISOString().split('T')[0];
          console.log(`✅ Found birthday: ${employee.firstName} ${employee.lastName}, birthday: ${birthdayStr}, daysUntil: ${daysUntil}, age: ${age}`);
          
          upcomingBirthdays.push({
            employee,
            birthday,
            daysUntil,
            age
          });
        } else {
          const birthdayStr = isNaN(birthday.getTime()) ? 'Invalid Date' : birthday.toISOString().split('T')[0];
          console.log(`⏭️ Skipping birthday: ${employee.firstName} ${employee.lastName}, birthday: ${birthdayStr}, daysUntil: ${daysUntil} (not in 0-30 range)`);
        }
      } catch (error) {
        console.error(`❌ Error processing birthday for ${employee.firstName} ${employee.lastName}:`, error);
        console.error(`birthDate value: ${employee.birthDate}`);
      }
    });

    console.log(`📊 Total upcoming birthdays found: ${upcomingBirthdays.length}`);
    const sorted = upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);
    console.log('📋 Sorted birthdays:', sorted.map(b => `${b.employee.firstName} ${b.employee.lastName} (${b.daysUntil} days)`));
    return sorted;
  }, [employees]);

  // Get holidays for current year
  const currentYear = new Date(currentWeekStart).getFullYear();
  const holidays = useMemo(() => {
    // Get holidays for current year and next year (for year transitions)
    return [...getHolidays(currentYear), ...getHolidays(currentYear + 1)];
  }, [currentYear]);

  // Helper function to get holiday info for a date
  const getHolidayInfo = (dateStr: string): { isHoliday: boolean; isVacation: boolean; name?: string } => {
    const holiday = holidays.find(h => h.date === dateStr);
    if (holiday) {
      return {
        isHoliday: holiday.type === 'feiertag',
        isVacation: holiday.type === 'ferien',
        name: holiday.name
      };
    }
    return { isHoliday: false, isVacation: false };
  };

  const toggleAreaSelection = (area: AreaType) => {
    setNewEmployeeAreas(prev => {
      if (prev.includes(area)) {
        return prev.filter(a => a !== area);
      } else if (prev.length < 4) {
        return [...prev, area];
      } else {
        setValidationMessage('⚠️ Ein Mitarbeiter kann maximal 4 Bereiche haben!');
        setTimeout(() => setValidationMessage(null), 3000);
        return prev;
      }
    });
  };

  const addEmployee = () => {
    if (!newEmployeeFirstName.trim() || !newEmployeeLastName.trim()) {
      setValidationMessage('⚠️ Bitte geben Sie Vor- und Nachname ein!');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (newEmployeeAreas.length === 0) {
      setValidationMessage('⚠️ Bitte wählen Sie mindestens einen Bereich aus!');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    
    // Normalize birthDate: empty string becomes undefined (which will be converted to null in API)
    const normalizedBirthDate = (newEmployeeBirthDate && newEmployeeBirthDate.trim() !== '') 
      ? newEmployeeBirthDate.trim() 
      : undefined;
    
    const newEmployee: Employee = {
      id: Date.now().toString(),
      firstName: newEmployeeFirstName.trim(),
      lastName: newEmployeeLastName.trim(),
      areas: [...newEmployeeAreas],
      phone: newEmployeePhone.trim() || undefined,
      email: newEmployeeEmail.trim() || undefined,
      employmentType: newEmployeeEmploymentType || undefined,
      weeklyHours: (newEmployeeEmploymentType === 'Vollzeit' || newEmployeeEmploymentType === 'Teilzeit') && newEmployeeWeeklyHours 
        ? parseFloat(newEmployeeWeeklyHours) 
        : undefined,
      monthlyHours: newEmployeeEmploymentType === 'Aushilfe' && newEmployeeMonthlyHours 
        ? parseFloat(newEmployeeMonthlyHours) 
        : undefined,
      color: newEmployeeColor,
      birthDate: normalizedBirthDate
    };
    
    const updatedEmployees = [...employees, newEmployee];
    onEmployeesUpdate(updatedEmployees);
    
    // Mark birthday in schedule if birthDate is set
    if (normalizedBirthDate) {
      markBirthdayInSchedule(newEmployee.id, normalizedBirthDate);
    }
    
    setNewEmployeeFirstName('');
    setNewEmployeeLastName('');
    setNewEmployeePhone('');
    setNewEmployeeEmail('');
    setNewEmployeeEmploymentType('');
    setNewEmployeeWeeklyHours('');
    setNewEmployeeMonthlyHours('');
    setNewEmployeeAreas([]);
    setNewEmployeeColor(undefined);
    setNewEmployeeBirthDate('');
    setShowEmployeeForm(false);
    setEditingEmployeeId(null);
    setValidationMessage(`✅ ${newEmployee.firstName} ${newEmployee.lastName} wurde hinzugefügt (${newEmployee.areas.join(', ')})!`);
    setTimeout(() => setValidationMessage(null), 3000);
  };

  const startEditEmployee = (employee: Employee) => {
    setEditingEmployeeId(employee.id);
    setNewEmployeeFirstName(employee.firstName);
    setNewEmployeeLastName(employee.lastName);
    setNewEmployeePhone(employee.phone || '');
    setNewEmployeeEmail(employee.email || '');
    setNewEmployeeEmploymentType(employee.employmentType || '');
    setNewEmployeeWeeklyHours(employee.weeklyHours?.toString() || '');
    setNewEmployeeMonthlyHours(employee.monthlyHours?.toString() || '');
    setNewEmployeeAreas([...employee.areas]);
    setNewEmployeeColor(employee.color);
    setNewEmployeeBirthDate(employee.birthDate || '');
    setShowEmployeeForm(true);
  };

  // Function to open employee management and edit dialog from table
  const openEmployeeEditFromTable = (employee: Employee) => {
    setShowEmployeeManagement(true);
    startEditEmployee(employee);
  };

  // PDF Export function
  const exportToPDF = async () => {
    console.log('PDF Export gestartet...');
    console.log('Export Type:', exportType);
    console.log('Current Month:', currentMonth);
    
    try {
      // Check if packages are available
      console.log('Versuche jspdf zu laden...');
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default || jsPDFModule;
      console.log('jsPDF geladen:', typeof jsPDF);
      
      console.log('Versuche jspdf-autotable zu laden...');
      await import('jspdf-autotable');
      console.log('jspdf-autotable geladen');
      
      // Create PDF document
      console.log('Erstelle PDF Dokument...');
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      console.log('PDF Dokument erstellt');
      
      const monthDates = getMonthDates(currentMonth);
      const [year, month] = currentMonth.split('-');
      const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
      
      // Filter data based on export type
      let filteredEmployees = [...employees];
      let filteredDates = [...monthDates];
      let title = `Schichtplan ${monthName}`;
      
      console.log('Filtere Daten...');
      if (exportType === 'area') {
        filteredEmployees = employees.filter(emp => emp.areas.includes(exportSelectedArea));
        title += ` - Bereich: ${exportSelectedArea}`;
        console.log(`Gefiltert nach Bereich ${exportSelectedArea}: ${filteredEmployees.length} Mitarbeiter`);
      } else if (exportType === 'employee') {
        filteredEmployees = employees.filter(emp => exportSelectedEmployees.includes(emp.id));
        title += ` - Ausgewählte Mitarbeiter`;
        console.log(`Gefiltert nach Mitarbeitern: ${filteredEmployees.length} Mitarbeiter`);
      } else if (exportType === 'days') {
        if (exportStartDate && exportEndDate) {
          filteredDates = monthDates.filter(date => date >= exportStartDate && date <= exportEndDate);
          title += ` - ${new Date(exportStartDate).toLocaleDateString('de-DE')} bis ${new Date(exportEndDate).toLocaleDateString('de-DE')}`;
          console.log(`Gefiltert nach Tagen: ${filteredDates.length} Tage`);
        }
      }
      
      if (filteredEmployees.length === 0) {
        alert('Keine Mitarbeiter zum Exportieren vorhanden!');
        return;
      }
      
      if (filteredDates.length === 0) {
        alert('Keine Tage zum Exportieren vorhanden!');
        return;
      }
      
      // Add title
      console.log('Füge Titel hinzu...');
      doc.setFontSize(16);
      doc.text(title, 14, 15);
      
      // Prepare table data
      console.log('Bereite Tabellendaten vor...');
      const headers = ['Mitarbeiter', ...filteredDates.map(date => {
        const d = new Date(date);
        return `${d.getDate()}.${d.getMonth() + 1}`;
      })];
      
      const rows = filteredEmployees.map(emp => {
        const row = [`${emp.firstName} ${emp.lastName}`];
        filteredDates.forEach(date => {
          const shifts = getEmployeeShiftsForDate(emp.id, date);
          row.push(shifts.join(', ') || '-');
        });
        return row;
      });
      
      console.log(`Tabelle: ${headers.length} Spalten, ${rows.length} Zeilen`);
      
      // Generate table
      console.log('Generiere Tabelle...');
      (doc as any).autoTable({
        head: [headers],
        body: rows,
        startY: 25,
        styles: { 
          fontSize: 8, 
          cellPadding: 2,
          overflow: 'linebreak'
        },
        headStyles: { 
          fillColor: [102, 126, 234], 
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: { 
          fillColor: [248, 249, 255] 
        },
        margin: { top: 25, left: 10, right: 10 },
        didDrawPage: function(data: any) {
          // Footer
          doc.setFontSize(8);
          doc.text(
            `Seite ${data.pageNumber}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
        }
      });
      
      console.log('Tabelle generiert');
      
      // Save PDF
      const filename = `Schichtplan_${monthName.replace(/ /g, '_')}_${exportType}.pdf`;
      console.log('Speichere PDF:', filename);
      doc.save(filename);
      
      console.log('PDF erfolgreich gespeichert!');
      setShowExportDialog(false);
      setValidationMessage('✅ PDF wurde erfolgreich exportiert!');
      setTimeout(() => setValidationMessage(null), 3000);
    } catch (error: any) {
      console.error('PDF Export Fehler:', error);
      console.error('Error Stack:', error?.stack);
      console.error('Error Message:', error?.message);
      
      let errorMessage = '❌ Fehler beim PDF-Export.';
      
      if (error?.message?.includes('Cannot find module') || error?.code === 'MODULE_NOT_FOUND') {
        errorMessage += ' Pakete fehlen! Bitte führen Sie aus: npm install jspdf jspdf-autotable';
      } else {
        errorMessage += ` Details: ${error?.message || 'Unbekannter Fehler'}`;
      }
      
      alert(errorMessage);
      setValidationMessage(errorMessage);
      setTimeout(() => setValidationMessage(null), 8000);
    }
  };

  const cancelEdit = () => {
    setEditingEmployeeId(null);
    setNewEmployeeFirstName('');
    setNewEmployeeLastName('');
    setNewEmployeePhone('');
    setNewEmployeeEmail('');
    setNewEmployeeEmploymentType('');
    setNewEmployeeWeeklyHours('');
    setNewEmployeeMonthlyHours('');
    setNewEmployeeAreas([]);
    setNewEmployeeColor(undefined);
    setNewEmployeeBirthDate('');
    setShowEmployeeForm(false);
  };

  const updateEmployee = () => {
    if (!editingEmployeeId) return;
    
    if (!newEmployeeFirstName.trim() || !newEmployeeLastName.trim()) {
      setValidationMessage('⚠️ Bitte geben Sie Vor- und Nachname ein!');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (newEmployeeAreas.length === 0) {
      setValidationMessage('⚠️ Bitte wählen Sie mindestens einen Bereich aus!');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    
    const employee = employees.find(e => e.id === editingEmployeeId);
    if (!employee) return;
    
    const oldBirthDate = employee.birthDate;
    // Normalize birthDate: empty string becomes undefined (which will be converted to null in API)
    // Keep as string if provided, otherwise undefined (not null, to distinguish from existing null values)
    const newBirthDate = (newEmployeeBirthDate && newEmployeeBirthDate.trim() !== '') 
      ? newEmployeeBirthDate.trim() 
      : undefined;
    
    console.log('Updating employee birthDate:', {
      employeeId: editingEmployeeId,
      oldBirthDate: oldBirthDate,
      newEmployeeBirthDate: newEmployeeBirthDate,
      normalizedNewBirthDate: newBirthDate,
      willChange: oldBirthDate !== newBirthDate
    });
    
    const updatedEmployee: Employee = {
      ...employee,
      firstName: newEmployeeFirstName.trim(),
      lastName: newEmployeeLastName.trim(),
      areas: [...newEmployeeAreas],
      phone: newEmployeePhone.trim() || undefined,
      email: newEmployeeEmail.trim() || undefined,
      employmentType: newEmployeeEmploymentType || undefined,
      weeklyHours: (newEmployeeEmploymentType === 'Vollzeit' || newEmployeeEmploymentType === 'Teilzeit') && newEmployeeWeeklyHours 
        ? parseFloat(newEmployeeWeeklyHours) 
        : undefined,
      monthlyHours: newEmployeeEmploymentType === 'Aushilfe' && newEmployeeMonthlyHours 
        ? parseFloat(newEmployeeMonthlyHours) 
        : undefined,
      color: newEmployeeColor,
      birthDate: newBirthDate
    };
    
    const updatedEmployees = employees.map(e => 
      e.id === editingEmployeeId ? updatedEmployee : e
    );
    onEmployeesUpdate(updatedEmployees);
    
    // Update birthday in schedule if birthDate changed
    if (oldBirthDate !== newBirthDate) {
      // Remove old birthday marks
      if (oldBirthDate) {
        removeBirthdayFromSchedule(editingEmployeeId, oldBirthDate);
      }
      // Add new birthday marks
      if (newBirthDate) {
        markBirthdayInSchedule(editingEmployeeId, newBirthDate);
      }
    }
    
    cancelEdit();
    setValidationMessage(`✅ ${updatedEmployee.firstName} ${updatedEmployee.lastName} wurde aktualisiert!`);
    setTimeout(() => setValidationMessage(null), 3000);
  };

  // Toggle employee active/inactive status
  const toggleEmployeeActive = async (employee: Employee) => {
    const newActiveStatus = !employee.active;
    const action = newActiveStatus ? 'aktiviert' : 'deaktiviert';
    
    if (!confirm(`Möchten Sie ${employee.firstName} ${employee.lastName} wirklich ${action}?\n\n${!newActiveStatus ? 'Deaktivierte Mitarbeiter können keine neuen Dienste mehr zugewiesen bekommen. Bisherige Dienste bleiben erhalten.' : 'Der Mitarbeiter kann wieder Dienste zugewiesen bekommen.'}`)) {
      return;
    }

    const updatedEmployee: Employee = {
      ...employee,
      active: newActiveStatus
    };

    const updatedEmployees = employees.map(e => 
      e.id === employee.id ? updatedEmployee : e
    );
    onEmployeesUpdate(updatedEmployees);

    setValidationMessage(`✅ ${employee.firstName} ${employee.lastName} wurde ${action}!`);
    setTimeout(() => setValidationMessage(null), 3000);
  };

  // Delete employee (schedules remain intact)
  const deleteEmployee = async (employee: Employee) => {
    if (!confirm(`Möchten Sie ${employee.firstName} ${employee.lastName} wirklich löschen?\n\nDer Mitarbeiter wird entfernt, aber alle bisherigen Schicht-Zuweisungen bleiben erhalten.\n\nDieser Vorgang kann nicht rückgängig gemacht werden!`)) {
      return;
    }

    try {
      const response = await fetch(`/api/schichtplan/employees?id=${employee.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }

      const updatedEmployees = employees.filter(e => e.id !== employee.id);
      onEmployeesUpdate(updatedEmployees);

      setValidationMessage(`✅ ${employee.firstName} ${employee.lastName} wurde gelöscht!`);
      setTimeout(() => setValidationMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting employee:', error);
      setValidationMessage(`❌ Fehler beim Löschen von ${employee.firstName} ${employee.lastName}`);
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  // Mark birthday in schedule for current year and future years
  const markBirthdayInSchedule = (employeeId: string, birthDate: string) => {
    const updatedSchedule = [...schedule];
    const [, month, day] = birthDate.split('-').map(Number);
    const currentYear = new Date().getFullYear();
    
    // Mark birthdays for current year and next 2 years
    for (let yearOffset = 0; yearOffset < 3; yearOffset++) {
      const birthdayDate = new Date(currentYear + yearOffset, month - 1, day);
      const dateStr = birthdayDate.toISOString().split('T')[0];
      
      let daySchedule = updatedSchedule.find(s => s.date === dateStr);
      if (!daySchedule) {
        daySchedule = {
          date: dateStr,
          shifts: {
            'Halle': {},
            'Kasse': {},
            'Sauna': {},
            'Reinigung': {},
            'Gastro': {}
          },
          specialStatus: {}
        };
        updatedSchedule.push(daySchedule);
      }
      
      if (!daySchedule.specialStatus) {
        daySchedule.specialStatus = {};
      }
      
      // Mark as birthday (using 'Urlaub' status for now, or we could add a new status)
      daySchedule.specialStatus[employeeId] = 'Urlaub';
    }
    
    onScheduleUpdate(updatedSchedule);
  };

  // Remove birthday marks from schedule
  const removeBirthdayFromSchedule = (employeeId: string, birthDate: string) => {
    const updatedSchedule = [...schedule];
    const [, month, day] = birthDate.split('-').map(Number);
    const currentYear = new Date().getFullYear();
    
    // Remove birthday marks for current year and next 2 years
    for (let yearOffset = 0; yearOffset < 3; yearOffset++) {
      const birthdayDate = new Date(currentYear + yearOffset, month - 1, day);
      const dateStr = birthdayDate.toISOString().split('T')[0];
      
      const daySchedule = updatedSchedule.find(s => s.date === dateStr);
      if (daySchedule && daySchedule.specialStatus && daySchedule.specialStatus[employeeId] === 'Urlaub') {
        // Only remove if it's actually a birthday (not a regular vacation)
        // We'll need a better way to track this, but for now we'll just remove it
        delete daySchedule.specialStatus[employeeId];
        if (Object.keys(daySchedule.specialStatus).length === 0) {
          delete daySchedule.specialStatus;
        }
      }
    }
    
    onScheduleUpdate(updatedSchedule);
  };

  // Check if an employee is already assigned to any shift on a given date
  const isEmployeeAssignedOnDate = (dateStr: string, employeeId: string, excludeArea?: AreaType, excludeShift?: ShiftType): boolean => {
    const daySchedule = schedule.find(s => s.date === dateStr);
    if (!daySchedule) return false;

    for (const area of AREAS) {
      for (const shift of SHIFT_TYPES) {
        // Skip the current area/shift combination if specified
        if (area === excludeArea && shift === excludeShift) continue;
        
        const assignments = daySchedule.shifts[area]?.[shift];
        if (assignments?.some(a => a.employeeId === employeeId)) {
          return true;
        }
      }
    }
    return false;
  };

  // Get the shift where an employee is assigned on a given date
  const getEmployeeAssignment = (dateStr: string, employeeId: string): { area: AreaType; shift: ShiftType } | null => {
    const daySchedule = schedule.find(s => s.date === dateStr);
    if (!daySchedule) return null;

    for (const area of AREAS) {
      for (const shift of SHIFT_TYPES) {
        const assignments = daySchedule.shifts[area]?.[shift];
        if (assignments?.some(a => a.employeeId === employeeId)) {
          return { area, shift };
        }
      }
    }
    return null;
  };

  const assignEmployee = (dateStr: string, area: AreaType, shift: ShiftType, employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    // Check if employee is assigned to this area
    if (!employee.areas.includes(area)) {
      setValidationMessage(
        `⚠️ ${employee.firstName} ${employee.lastName} ist nicht dem Bereich "${area}" zugewiesen! (Bereiche: ${employee.areas.join(', ')})`
      );
      setTimeout(() => setValidationMessage(null), 5000);
      return;
    }

    // Check if employee is already assigned to another shift on this date
    if (isEmployeeAssignedOnDate(dateStr, employeeId, area, shift)) {
      const existingAssignment = getEmployeeAssignment(dateStr, employeeId);
      if (existingAssignment) {
        setValidationMessage(
          `⚠️ ${employee.firstName} ${employee.lastName} ist bereits am ${new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} in der ${existingAssignment.shift} (${existingAssignment.area}) eingeteilt!`
        );
        setTimeout(() => setValidationMessage(null), 5000);
      }
      return;
    }

    const updatedSchedule = [...schedule];
    let daySchedule = updatedSchedule.find(s => s.date === dateStr);

    if (!daySchedule) {
      daySchedule = {
        date: dateStr,
        shifts: Object.fromEntries(AREAS.map(a => [a, {}])) as any
      };
      updatedSchedule.push(daySchedule);
    }

    if (!daySchedule.shifts[area]) {
      daySchedule.shifts[area] = {};
    }

    if (!daySchedule.shifts[area][shift]) {
      daySchedule.shifts[area][shift] = [];
    }

    const assignments = daySchedule.shifts[area][shift]!;
    const existingIndex = assignments.findIndex(a => a.employeeId === employeeId);

    if (existingIndex === -1) {
      assignments.push({
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`
      });
      setValidationMessage(`✅ ${employee.firstName} ${employee.lastName} wurde erfolgreich zugewiesen!`);
      setTimeout(() => setValidationMessage(null), 3000);
    }

    onScheduleUpdate(updatedSchedule);
  };

  const removeAssignment = (dateStr: string, area: AreaType, shift: ShiftType, employeeId: string) => {
    const updatedSchedule = [...schedule];
    const daySchedule = updatedSchedule.find(s => s.date === dateStr);

    if (daySchedule?.shifts[area]?.[shift]) {
      daySchedule.shifts[area][shift] = daySchedule.shifts[area][shift]!.filter(
        a => a.employeeId !== employeeId
      );
    }

    onScheduleUpdate(updatedSchedule);
  };

  const getWeekRange = () => {
    const start = new Date(currentWeekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  };

  const isUnderStaffed = (area: AreaType, shift: ShiftType, assignmentCount: number): boolean => {
    const minRequired = MIN_STAFFING[area][shift];
    return assignmentCount < minRequired;
  };

  const applyShiftToSchedule = (
    baseSchedule: DaySchedule[],
    employeeId: string,
    dateStr: string,
    shiftType: ShiftType | SpecialStatus
  ): DaySchedule[] => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return baseSchedule;

    const updatedSchedule = [...baseSchedule];
    let daySchedule = updatedSchedule.find(s => s.date === dateStr);

    if (!daySchedule) {
      daySchedule = {
        date: dateStr,
        shifts: Object.fromEntries(AREAS.map(a => [a, {}])) as any,
        specialStatus: {}
      };
      updatedSchedule.push(daySchedule);
    }

    // Initialize specialStatus if it doesn't exist
    if (!daySchedule.specialStatus) {
      daySchedule.specialStatus = {};
    }

    // If assigning Urlaub, Krank, or any vacation/overhours status, remove all regular shifts and set special status
    if (shiftType === 'Urlaub' || shiftType === 'Krank' || 
        shiftType === 'Urlaub_beantragt' || shiftType === 'Urlaub_genehmigt' || shiftType === 'Urlaub_abgelehnt' ||
        shiftType === 'Überstunden_beantragt' || shiftType === 'Überstunden_genehmigt' || shiftType === 'Überstunden_abgelehnt') {
      // Remove employee from all regular shifts on this date
      AREAS.forEach(area => {
        SHIFT_TYPES.forEach(shift => {
          if (daySchedule.shifts[area]?.[shift]) {
            daySchedule.shifts[area][shift] = daySchedule.shifts[area][shift]!.filter(
              (a: any) => a.employeeId !== employeeId
            );
          }
        });
      });
      // Set special status
      daySchedule.specialStatus[employeeId] = shiftType;
    } else {
      // Remove special status if assigning regular shift
      delete daySchedule.specialStatus[employeeId];

      // Remove employee from all other shifts on this date
      AREAS.forEach(area => {
        SHIFT_TYPES.forEach(shift => {
          if (daySchedule.shifts[area]?.[shift]) {
            daySchedule.shifts[area][shift] = daySchedule.shifts[area][shift]!.filter(
              a => a.employeeId !== employeeId
            );
          }
        });
      });

      // Assign to first available area that employee can work in
      const availableArea = employee.areas.find(area => employee.areas.includes(area));
      if (availableArea) {
        if (!daySchedule.shifts[availableArea]) {
          daySchedule.shifts[availableArea] = {};
        }
        if (!daySchedule.shifts[availableArea][shiftType]) {
          daySchedule.shifts[availableArea][shiftType] = [];
        }
        const assignments = daySchedule.shifts[availableArea][shiftType]!;
        const existingIndex = assignments.findIndex(a => a.employeeId === employeeId);
        if (existingIndex === -1) {
          assignments.push({
            employeeId: employee.id,
            employeeName: `${employee.firstName} ${employee.lastName}`
          });
        }
      }
    }

    return updatedSchedule;
  };

  // Assign shift or special status to employee in employee view
  const assignShiftToEmployee = (employeeId: string, dateStr: string, shiftType: ShiftType | SpecialStatus) => {
    const updatedSchedule = applyShiftToSchedule(schedule, employeeId, dateStr, shiftType);
    onScheduleUpdate(updatedSchedule);
  };


  // Copy entire week schedule
  const copyWeekSchedule = (sourceWeekStart: string, targetWeekStart: string) => {
    const sourceStart = new Date(sourceWeekStart);
    const targetStart = new Date(targetWeekStart);
    
    const updatedSchedule = [...schedule];
    
    // Copy each day of the week
    for (let i = 0; i < 7; i++) {
      const sourceDate = new Date(sourceStart);
      sourceDate.setDate(sourceStart.getDate() + i);
      const sourceDateStr = sourceDate.toISOString().split('T')[0];
      
      const targetDate = new Date(targetStart);
      targetDate.setDate(targetStart.getDate() + i);
      const targetDateStr = targetDate.toISOString().split('T')[0];
      
      // Find source day schedule
      const sourceDaySchedule = schedule.find(s => s.date === sourceDateStr);
      if (!sourceDaySchedule) continue;
      
      // Find or create target day schedule
      let targetDaySchedule = updatedSchedule.find(s => s.date === targetDateStr);
      if (!targetDaySchedule) {
        targetDaySchedule = {
          date: targetDateStr,
          shifts: Object.fromEntries(AREAS.map(a => [a, {}])) as any,
          specialStatus: {}
        };
        updatedSchedule.push(targetDaySchedule);
      }
      
      // Copy all shifts
      AREAS.forEach(area => {
        SHIFT_TYPES.forEach(shift => {
          const sourceAssignments = sourceDaySchedule.shifts[area]?.[shift];
          if (sourceAssignments && sourceAssignments.length > 0) {
            if (!targetDaySchedule.shifts[area]) {
              targetDaySchedule.shifts[area] = {};
            }
            if (!targetDaySchedule.shifts[area][shift]) {
              targetDaySchedule.shifts[area][shift] = [];
            }
            // Copy assignments (create new array to avoid reference issues)
            targetDaySchedule.shifts[area][shift] = sourceAssignments.map(a => ({ ...a }));
          }
        });
      });
      
      // Copy special status
      if (sourceDaySchedule.specialStatus) {
        if (!targetDaySchedule.specialStatus) {
          targetDaySchedule.specialStatus = {};
        }
        Object.keys(sourceDaySchedule.specialStatus).forEach(employeeId => {
          targetDaySchedule.specialStatus![employeeId] = sourceDaySchedule.specialStatus![employeeId];
        });
      }
    }
    
    onScheduleUpdate(updatedSchedule);
    setValidationMessage(`✅ Woche vom ${new Date(sourceWeekStart).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} wurde nach ${new Date(targetWeekStart).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} kopiert!`);
    setTimeout(() => setValidationMessage(null), 5000);
  };

  // Remove shift or special status from employee
  const removeShiftFromEmployee = (employeeId: string, dateStr: string) => {
    const updatedSchedule = [...schedule];
    const daySchedule = updatedSchedule.find(s => s.date === dateStr);

    if (!daySchedule) return;

    // Remove from special status
    if (daySchedule.specialStatus) {
      delete daySchedule.specialStatus[employeeId];
    }

    // Remove from all regular shifts
    AREAS.forEach(area => {
      SHIFT_TYPES.forEach(shift => {
        if (daySchedule.shifts[area]?.[shift]) {
          daySchedule.shifts[area][shift] = daySchedule.shifts[area][shift]!.filter(
            a => a.employeeId !== employeeId
          );
        }
      });
    });

    onScheduleUpdate(updatedSchedule);
  };

  // Get all dates in a month
  const getMonthDates = (yearMonth: string): string[] => {
    const [year, month] = yearMonth.split('-').map(Number);
    // month is 1-12, but Date() uses 0-11
    // Get the last day of the month by using next month with day 0
    const lastDayOfMonth = new Date(year, month, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const dates: string[] = [];
    
    // Construct date strings manually to avoid timezone issues with toISOString()
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dates.push(dateStr);
    }
    
    return dates;
  };

  // Change month navigation
  const changeMonth = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonth.split('-').map(Number);
    const newDate = new Date(year, month - 1 + (direction === 'next' ? 1 : -1), 1);
    const newMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonth);
  };

  // Get month range display
  const getMonthRange = (): string => {
    const [year, month] = currentMonth.split('-').map(Number);
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                       'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    return `${monthNames[month - 1]} ${year}`;
  };

  // Get day name for a date
  const getDayName = (dateStr: string): string => {
    const date = new Date(dateStr);
    const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    return dayNames[date.getDay()];
  };

  // Convert shift abbreviation to ShiftType or SpecialStatus
  const getShiftTypeFromAbbreviation = (abbrev: string): ShiftType | SpecialStatus | null => {
    if (abbrev === 'F') return 'Frühschicht';
    if (abbrev === 'M') return 'Mittelschicht';
    if (abbrev === 'S') return 'Spätschicht';
    if (abbrev === 'U') return 'Urlaub';
    if (abbrev === 'K') return 'Krank';
    return null;
  };

  // Get Monday of a week from any date in that week
  const getMondayOfWeek = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  // Get week range display for a week start date
  const getWeekRangeForDate = (weekStart: string): string => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  };

  const getCellKey = (employeeId: string, dateStr: string) => `${employeeId}|${dateStr}`;

  const getDateRange = (startDateStr: string, endDateStr: string): string[] => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const range: string[] = [];
    const step = startDate <= endDate ? 1 : -1;

    for (let date = new Date(startDate); step === 1 ? date <= endDate : date >= endDate; date.setDate(date.getDate() + step)) {
      range.push(date.toISOString().split('T')[0]);
    }

    return range;
  };

  const getSelectedDatesForEmployee = (employeeId: string): string[] => {
    return Array.from(selectedCells)
      .filter(key => key.startsWith(`${employeeId}|`))
      .map(key => key.split('|')[1]);
  };

  // Sort employees based on sort criteria
  const getSortedEmployees = () => {
    const sorted = [...employees];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          comparison = nameA.localeCompare(nameB, 'de');
          break;
          
        case 'area':
          // Sort by first area (primary area)
          const areaA = a.areas[0] || '';
          const areaB = b.areas[0] || '';
          comparison = areaA.localeCompare(areaB, 'de');
          // If same area, sort by name
          if (comparison === 0) {
            const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
            const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
            comparison = nameA.localeCompare(nameB, 'de');
          }
          break;
          
        case 'color':
          // Sort by color, then by name
          const colorA = a.color || '';
          const colorB = b.color || '';
          comparison = colorA.localeCompare(colorB, 'de');
          // If same color, sort by name
          if (comparison === 0) {
            const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
            const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
            comparison = nameA.localeCompare(nameB, 'de');
          }
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  };

  const multiSelectTooltip = "Klick: Feld wählen/entfernen | Strg/Cmd optional | Shift+Klick (gleicher Mitarbeiter): Bereich | Gedrückt halten & ziehen zum Markieren";

  // Get all dates for a month calendar
  const getMonthDatesForCalendar = (yearMonth: string): Array<{ date: string; day: number; isCurrentMonth: boolean }> => {
    const [year, month] = yearMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get first day of week (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    // Convert to Monday = 0 format
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const dates: Array<{ date: string; day: number; isCurrentMonth: boolean }> = [];
    
    // Add days from previous month
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, prevMonth, 0).getDate();
    
    for (let i = startOffset - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(prevYear, prevMonth - 1, day);
      dates.push({
        date: date.toISOString().split('T')[0],
        day,
        isCurrentMonth: false
      });
    }
    
    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      dates.push({
        date: date.toISOString().split('T')[0],
        day,
        isCurrentMonth: true
      });
    }
    
    // Add days from next month to fill the week
    const totalCells = dates.length;
    const remainingCells = 42 - totalCells; // 6 weeks * 7 days
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const date = new Date(nextYear, nextMonth - 1, day);
      dates.push({
        date: date.toISOString().split('T')[0],
        day,
        isCurrentMonth: false
      });
    }
    
    return dates;
  };

  // Get week dates for calendar
  const getWeekDatesForCalendar = (weekStart: string): Array<{ date: string; day: number; dayName: string }> => {
    const start = new Date(weekStart);
    const dates: Array<{ date: string; day: number; dayName: string }> = [];
    const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        day: date.getDate(),
        dayName: dayNames[i]
      });
    }
    
    return dates;
  };

  // Change month in calendar
  const changeCopyMonth = (direction: 'prev' | 'next', type: 'source' | 'target') => {
    const currentMonth = type === 'source' ? copySourceMonth : copyTargetMonth;
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    
    if (direction === 'prev') {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (type === 'source') {
      setCopySourceMonth(newMonth);
    } else {
      setCopyTargetMonth(newMonth);
    }
  };

  // Change week in calendar
  const changeCopyWeek = (direction: 'prev' | 'next', type: 'source' | 'target') => {
    const currentWeek = type === 'source' ? copySourceWeek : copyTargetWeek;
    const date = new Date(currentWeek);
    
    if (direction === 'prev') {
      date.setDate(date.getDate() - 7);
    } else {
      date.setDate(date.getDate() + 7);
    }
    
    const newWeek = date.toISOString().split('T')[0];
    
    if (type === 'source') {
      setCopySourceWeek(newWeek);
      // Update month to match
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      setCopySourceMonth(month);
    } else {
      setCopyTargetWeek(newWeek);
      // Update month to match
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      setCopyTargetMonth(month);
    }
  };

  // Handle week copy with dialog
  const handleWeekCopy = () => {
    const sourceMonday = getMondayOfWeek(copySourceWeek);
    const targetMonday = getMondayOfWeek(copyTargetWeek);
    
    if (sourceMonday === targetMonday) {
      setValidationMessage('⚠️ Quell- und Zielwoche dürfen nicht identisch sein!');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    
    copyWeekSchedule(sourceMonday, targetMonday);
    setShowWeekCopyDialog(false);
  };

  // Get shifts for an employee on a specific date
  const getEmployeeShiftsForDate = (employeeId: string, dateStr: string): string[] => {
    // Use full schedule instead of weekSchedule to support month view
    const daySchedule = schedule.find(s => s.date === dateStr);
    if (!daySchedule) return [];

    const shifts: string[] = [];

    // Check for special status (Urlaub/Krank/Überstunden) first
    if (daySchedule.specialStatus?.[employeeId]) {
      const status = daySchedule.specialStatus[employeeId];
      if (status === 'Urlaub' || status === 'Urlaub_genehmigt') shifts.push('U');
      else if (status === 'Urlaub_beantragt') shifts.push('U_beantragt');
      else if (status === 'Urlaub_abgelehnt') shifts.push('U_abgelehnt');
      else if (status === 'Überstunden_beantragt') shifts.push('Ü_beantragt');
      else if (status === 'Überstunden_genehmigt') shifts.push('Ü_genehmigt');
      else if (status === 'Überstunden_abgelehnt') shifts.push('Ü_abgelehnt');
      else if (status === 'Krank') shifts.push('K');
      return shifts; // If special status, don't show regular shifts
    }
    
    AREAS.forEach(area => {
      SHIFT_TYPES.forEach(shift => {
        const assignments = daySchedule.shifts[area]?.[shift];
        if (assignments?.some(a => a.employeeId === employeeId)) {
          // F for Frühschicht, M for Mittelschicht, S for Spätschicht, GR for Gastro Reinigung, SR for Sauna Reinigung
          if (shift === 'Frühschicht') shifts.push('F');
          else if (shift === 'Mittelschicht') shifts.push('M');
          else if (shift === 'Spätschicht') shifts.push('S');
          else if (shift === 'Gastro Reinigung') shifts.push('GR');
          else if (shift === 'Sauna Reinigung') shifts.push('SR');
        }
      });
    });

    return shifts;
  };

  // Calculate worked hours for an employee in the current week
  const calculateWeeklyHours = (employeeId: string): number => {
    let totalHours = 0;
    const HOURS_PER_SHIFT = 8;

    weekSchedule.forEach(day => {
      AREAS.forEach(area => {
        SHIFT_TYPES.forEach(shift => {
          const assignments = day.shifts[area]?.[shift];
          if (assignments?.some(a => a.employeeId === employeeId)) {
            totalHours += HOURS_PER_SHIFT;
          }
        });
      });
    });

    return totalHours;
  };

  // Determine if employee has met their weekly hours requirement
  const getHoursStatus = (employeeId: string, targetHours?: number): 'fulfilled' | 'under' | 'over' | 'no-target' => {
    if (!targetHours) return 'no-target';
    
    const workedHours = calculateWeeklyHours(employeeId);
    
    if (workedHours >= targetHours) return 'fulfilled';
    if (workedHours < targetHours) return 'under';
    return 'no-target';
  };

  // Drag and Drop handlers
  const handleDragStart = (
    e: React.DragEvent,
    employeeId: string,
    employeeName: string,
    date: string,
    area: AreaType,
    shift: ShiftType
  ) => {
    setDraggedEmployee({
      employeeId,
      employeeName,
      sourceDate: date,
      sourceArea: area,
      sourceShift: shift
    });
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', employeeId);
    
    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setDraggedEmployee(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (
    e: React.DragEvent,
    targetDate: string,
    targetArea: AreaType,
    targetShift: ShiftType
  ) => {
    e.preventDefault();
    
    if (!draggedEmployee) return;

    const { employeeId, employeeName } = draggedEmployee;
    const employee = employees.find(emp => emp.id === employeeId);
    
    if (!employee) return;

    // Check if employee is assigned to target area
    if (!employee.areas.includes(targetArea)) {
      setValidationMessage(
        `⚠️ ${employee.firstName} ${employee.lastName} ist nicht dem Bereich "${targetArea}" zugewiesen!`
      );
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Check if employee is already assigned on target date
    if (isEmployeeAssignedOnDate(targetDate, employeeId)) {
      setValidationMessage(
        `⚠️ ${employee.firstName} ${employee.lastName} ist bereits am ${new Date(targetDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} eingeteilt!`
      );
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    // Copy employee to target
    const updatedSchedule = [...schedule];
    let daySchedule = updatedSchedule.find(s => s.date === targetDate);

    if (!daySchedule) {
      daySchedule = {
        date: targetDate,
        shifts: Object.fromEntries(AREAS.map(a => [a, {}])) as any
      };
      updatedSchedule.push(daySchedule);
    }

    if (!daySchedule.shifts[targetArea]) {
      daySchedule.shifts[targetArea] = {};
    }

    if (!daySchedule.shifts[targetArea][targetShift]) {
      daySchedule.shifts[targetArea][targetShift] = [];
    }

    const assignments = daySchedule.shifts[targetArea][targetShift]!;
    const existingIndex = assignments.findIndex(a => a.employeeId === employeeId);

    if (existingIndex === -1) {
      assignments.push({
        employeeId,
        employeeName
      });
      
      setValidationMessage(
        `✅ ${employee.firstName} ${employee.lastName} wurde nach ${new Date(targetDate).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })} kopiert!`
      );
      setTimeout(() => setValidationMessage(null), 3000);
    }

    onScheduleUpdate(updatedSchedule);
    setDraggedEmployee(null);
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const toggleWeekday = (day: number) => {
    setSelectedWeekdays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  // Drag & Drop handlers for employee view (from palette)
  const handleEmployeeViewDragStart = (e: React.DragEvent, shiftType: ShiftType | SpecialStatus) => {
    setDraggedShiftType(shiftType);
    setDraggedShiftFromCell(null); // Clear shift-from-cell when dragging from palette
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', shiftType);
    
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleEmployeeViewDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setDraggedShiftType(null);
    setDraggedShiftFromCell(null);
    setHoveredDropCell(null);
  };

  // Drag handler for shifts from table cells
  const handleShiftDragStart = (e: React.DragEvent, employeeId: string, dateStr: string, shiftType: ShiftType | SpecialStatus) => {
    setDraggedShiftFromCell({ employeeId, dateStr, shiftType });
    setDraggedShiftType(shiftType);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', `shift:${employeeId}:${dateStr}:${shiftType}`);
    
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleShiftDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    // Don't clear state here - let the drop handler clear it on success
    // If drop didn't happen, state will be cleared on next drag or component update
    // Use a small delay to ensure drop handler runs first
    setTimeout(() => {
      if (draggedShiftFromCell) {
        setDraggedShiftType(null);
        setDraggedShiftFromCell(null);
        setHoveredDropCell(null);
      }
    }, 100);
  };

  const applyShiftToSelection = (shiftType: ShiftType | SpecialStatus) => {
    if (selectedCells.size === 0) return;

    const grouped = new Map<string, string[]>();
    selectedCells.forEach(key => {
      const [employeeId, dateStr] = key.split('|');
      if (!grouped.has(employeeId)) grouped.set(employeeId, []);
      grouped.get(employeeId)!.push(dateStr);
    });

    let updatedSchedule = schedule;
    grouped.forEach((dates, employeeId) => {
      dates.forEach(dateStr => {
        updatedSchedule = applyShiftToSchedule(updatedSchedule, employeeId, dateStr, shiftType);
      });
    });
    onScheduleUpdate(updatedSchedule);

    setValidationMessage(`✅ ${shiftType} wurde ${selectedCells.size} Feld(er) zugewiesen!`);
    setTimeout(() => setValidationMessage(null), 3000);

    setSelectedCells(new Set());
    setLastSelectedCell(null);
  };

  const handlePaletteClick = (shiftType: ShiftType | SpecialStatus) => {
    if (selectedCells.size > 0) {
      applyShiftToSelection(shiftType);
    }
  };

  const handleEmployeeViewDragOver = (e: React.DragEvent, employeeId: string, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setHoveredDropCell({ employeeId, dateStr });
  };

  const handleEmployeeViewDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the cell (not just moving to a child element)
    const target = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!target.contains(relatedTarget)) {
      setHoveredDropCell(null);
    }
  };

  const handleEmployeeViewDrop = (e: React.DragEvent, employeeId: string, dateStr: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Important: Save current drag state before clearing it
    const currentDraggedShiftFromCell = draggedShiftFromCell;
    const currentDraggedShiftType = draggedShiftType;
    
    // Check if we have either a shift type from palette or from table cell
    if (!currentDraggedShiftType && !currentDraggedShiftFromCell) {
      return;
    }

    // Determine selected dates for the current employee
    const selectedDatesForEmployee = getSelectedDatesForEmployee(employeeId);

    // Clear drag state immediately to prevent handleShiftDragEnd from interfering
    setDraggedShiftType(null);
    setDraggedShiftFromCell(null);
    setHoveredDropCell(null);

    // If dragging a shift from a table cell (copying)
    if (currentDraggedShiftFromCell) {
      const { employeeId: sourceEmployeeId, dateStr: sourceDateStr, shiftType } = currentDraggedShiftFromCell;
      
      // Don't copy to the same cell
      if (sourceEmployeeId === employeeId && sourceDateStr === dateStr) {
        return;
      }
      
      // If multi-day mode is active and days are selected, copy to all selected days
      if (selectedDatesForEmployee.length > 0) {
        const daysToAssign = selectedDatesForEmployee.filter(dayDate => 
          !(sourceEmployeeId === employeeId && dayDate === sourceDateStr)
        );
        
        if (daysToAssign.length === 0) {
          return;
        }
        
        let updatedSchedule = schedule;
        daysToAssign.forEach(dayDate => {
          updatedSchedule = applyShiftToSchedule(updatedSchedule, employeeId, dayDate, shiftType);
        });
        onScheduleUpdate(updatedSchedule);
        
        setValidationMessage(`✅ ${shiftType} wurde von ${new Date(sourceDateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} auf ${daysToAssign.length} Tag(e) kopiert!`);
        setTimeout(() => setValidationMessage(null), 3000);
        
        setSelectedCells(new Set());
        setLastSelectedCell(null);
      } else {
        // Copy to single day
        assignShiftToEmployee(employeeId, dateStr, shiftType);
        setValidationMessage(`✅ ${shiftType} wurde von ${new Date(sourceDateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} nach ${new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} kopiert!`);
        setTimeout(() => setValidationMessage(null), 3000);
      }
    } else {
      // Dragging from palette (new assignment)
      // If multi-day mode is active and days are selected, assign to all selected days
      if (selectedDatesForEmployee.length > 0) {
        const daysToAssign = selectedDatesForEmployee.includes(dateStr)
          ? selectedDatesForEmployee
          : [...selectedDatesForEmployee, dateStr];
        
        // Assign to all selected days for this employee
        if (currentDraggedShiftType) {
          let updatedSchedule = schedule;
          daysToAssign.forEach(dayDate => {
            updatedSchedule = applyShiftToSchedule(updatedSchedule, employeeId, dayDate, currentDraggedShiftType);
          });
          onScheduleUpdate(updatedSchedule);
          
          setValidationMessage(`✅ ${currentDraggedShiftType} wurde ${daysToAssign.length} Tag(en) zugewiesen!`);
          setTimeout(() => setValidationMessage(null), 3000);
        }
        
        setSelectedCells(new Set());
        setLastSelectedCell(null);
      } else {
        // Check if dropping on existing shift (remove it)
        if (currentDraggedShiftType) {
          const currentShifts = getEmployeeShiftsForDate(employeeId, dateStr);
          if (currentShifts.length > 0) {
            // If dropping same type, remove it; otherwise replace
            const shiftTypeStr = currentDraggedShiftType === 'Frühschicht' ? 'F' :
                                currentDraggedShiftType === 'Mittelschicht' ? 'M' :
                                currentDraggedShiftType === 'Spätschicht' ? 'S' :
                                currentDraggedShiftType === 'Urlaub' ? 'U' : 'K';
            
            if (currentShifts.includes(shiftTypeStr)) {
              removeShiftFromEmployee(employeeId, dateStr);
            } else {
              assignShiftToEmployee(employeeId, dateStr, currentDraggedShiftType);
            }
          } else {
            assignShiftToEmployee(employeeId, dateStr, currentDraggedShiftType);
          }
        }
      }
    }

    setDraggedShiftType(null);
    setDraggedShiftFromCell(null);
    setHoveredDropCell(null);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isSelecting) return;
      
      // For touch devices, prevent default scrolling
      if (e.pointerType === 'touch') {
        e.preventDefault();
      }
      
      // Find the cell under the pointer
      const element = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!element) return;
      
      const cell = element.closest('td[data-employee-id][data-date-str]') as HTMLElement | null;
      if (!cell) return;
      
      const employeeId = cell.getAttribute('data-employee-id');
      const dateStr = cell.getAttribute('data-date-str');
      
      if (!employeeId || !dateStr) return;
      
      selectionDragRef.current = true;
      const key = getCellKey(employeeId, dateStr);
      
      setSelectedCells(prev => {
        const newSet = new Set(prev);
        if (selectionMode === 'remove') {
          newSet.delete(key);
        } else {
          newSet.add(key);
        }
        return newSet;
      });
    };

    const handlePointerUpGlobal = () => {
      if (isSelecting) {
        setIsSelecting(false);
        setSelectionMode('add');
        if (selectionDragRef.current) {
          skipClickRef.current = true;
        }
        selectionDragRef.current = false;
      }
    };

    const handlePointerCancel = () => {
      if (isSelecting) {
        setIsSelecting(false);
        setSelectionMode('add');
        selectionDragRef.current = false;
      }
    };

    if (isSelecting) {
      window.addEventListener('pointermove', handlePointerMove, { passive: false });
    }
    window.addEventListener('pointerup', handlePointerUpGlobal);
    window.addEventListener('pointercancel', handlePointerCancel);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUpGlobal);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [isSelecting, selectionMode]);

  // Handle cell click for multi-day selection
  const handleCellClick = (e: React.MouseEvent, employeeId: string, dateStr: string) => {
    if (skipClickRef.current) {
      skipClickRef.current = false;
      return;
    }

    const key = getCellKey(employeeId, dateStr);

    if (e.shiftKey && lastSelectedCell && lastSelectedCell.employeeId === employeeId) {
      const rangeDates = getDateRange(lastSelectedCell.dateStr, dateStr);
      setSelectedCells(prev => {
        const newSet = new Set(prev);
        rangeDates.forEach(rangeDate => newSet.add(getCellKey(employeeId, rangeDate)));
        return newSet;
      });
    } else {
      setSelectedCells(prev => {
        const newSet = new Set(prev);
        if (newSet.has(key)) {
          newSet.delete(key);
        } else {
          newSet.add(key);
        }
        return newSet;
      });
    }

    setLastSelectedCell({ employeeId, dateStr });
  };

  const handleCellPointerDown = (e: React.PointerEvent, employeeId: string, dateStr: string) => {
    // Only handle primary button (left mouse button or touch)
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    
    // For touch devices, prevent default scrolling immediately
    if (e.pointerType === 'touch') {
      e.preventDefault();
      e.stopPropagation();
    }
    
    selectionDragRef.current = false;
    skipClickRef.current = false;
    
    const key = getCellKey(employeeId, dateStr);
    const shouldRemove = selectedCells.has(key);
    setSelectionMode(shouldRemove ? 'remove' : 'add');
    
    // Immediately mark the cell and start selection mode
    setSelectedCells(prev => {
      const newSet = new Set(prev);
      if (shouldRemove) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
    
    setIsSelecting(true);
    setLastSelectedCell({ employeeId, dateStr });
    
    // Capture pointer for better touch support
    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {
        // setPointerCapture might fail, ignore
      }
    }
  };

  const handleCellPointerEnter = (e: React.PointerEvent, employeeId: string, dateStr: string) => {
    if (!isSelecting) return;
    
    // Only process if the pointer is still down (for touch, check if we have an active pointer)
    if (e.pointerType === 'mouse' && e.buttons === 0) return;
    
    selectionDragRef.current = true;

    const key = getCellKey(employeeId, dateStr);
    setSelectedCells(prev => {
      const newSet = new Set(prev);
      if (selectionMode === 'remove') {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const bulkAssignEmployees = () => {
    if (selectedEmployees.length === 0) {
      setValidationMessage('⚠️ Bitte wählen Sie mindestens einen Mitarbeiter aus!');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (selectedWeekdays.length === 0) {
      setValidationMessage('⚠️ Bitte wählen Sie mindestens einen Wochentag aus!');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const updatedSchedule = [...schedule];
    const start = new Date(bulkStartDate);
    const end = new Date(bulkEndDate);
    let assignmentCount = 0;
    let conflictCount = 0;

    // Iterate through all dates in range
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Sunday = 7
      
      // Check if this weekday is selected
      if (!selectedWeekdays.includes(adjustedDay)) continue;

      const dateStr = date.toISOString().split('T')[0];

      // Try to assign each selected employee to their areas
      for (const employeeId of selectedEmployees) {
        const employee = employees.find(e => e.id === employeeId);
        if (!employee) continue;

        // Check if employee is already assigned on this date
        if (isEmployeeAssignedOnDate(dateStr, employeeId)) {
          conflictCount++;
          continue;
        }

        // Assign to FIRST area of the employee (primary area)
        const primaryArea = employee.areas[0];

        // Find or create day schedule
        let daySchedule = updatedSchedule.find(s => s.date === dateStr);
        if (!daySchedule) {
          daySchedule = {
            date: dateStr,
            shifts: Object.fromEntries(AREAS.map(a => [a, {}])) as any
          };
          updatedSchedule.push(daySchedule);
        }

        // Ensure area and shift exist
        if (!daySchedule.shifts[primaryArea]) {
          daySchedule.shifts[primaryArea] = {};
        }
        if (!daySchedule.shifts[primaryArea][bulkShift]) {
          daySchedule.shifts[primaryArea][bulkShift] = [];
        }

        // Add assignment
        const assignments = daySchedule.shifts[primaryArea][bulkShift]!;
        const existingIndex = assignments.findIndex(a => a.employeeId === employeeId);
        
        if (existingIndex === -1) {
          assignments.push({
            employeeId: employee.id,
            employeeName: `${employee.firstName} ${employee.lastName}`
          });
          assignmentCount++;
        }
      }
    }

    onScheduleUpdate(updatedSchedule);

    // Show result message
    let message = `✅ ${assignmentCount} Schicht(en) erfolgreich zugewiesen!`;
    if (conflictCount > 0) {
      message += ` ${conflictCount} Konflikt(e) übersprungen.`;
    }
    setValidationMessage(message);
    setTimeout(() => setValidationMessage(null), 5000);

    // Reset form
    setShowBulkAssignment(false);
    setSelectedEmployees([]);
    setSelectedWeekdays([1, 2, 3, 4, 5]);
  };

  // SP Einstellung Funktionen
  const loadVacationLimits = async () => {
    try {
      const response = await fetch('/api/schichtplan/vacation-limits');
      if (response.ok) {
        const data = await response.json();
        setVacationLimits(data);
      }
    } catch (error) {
      console.error('Failed to load vacation limits:', error);
    }
  };

  const createVacationLimit = async () => {
    if (!newLimit.startDate || !newLimit.endDate || !newLimit.area || newLimit.maxEmployees < 1) {
      setValidationMessage('⚠️ Bitte füllen Sie alle Felder aus!');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    try {
      const response = await fetch('/api/schichtplan/vacation-limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLimit)
      });

      if (response.ok) {
        await loadVacationLimits();
        setNewLimit({ startDate: '', endDate: '', area: 'Halle', maxEmployees: 1 });
        setValidationMessage('✅ Voreinstellung erfolgreich erstellt!');
        setTimeout(() => setValidationMessage(null), 3000);
      } else {
        const error = await response.json();
        setValidationMessage(`⚠️ ${error.error || 'Fehler beim Erstellen'}`);
        setTimeout(() => setValidationMessage(null), 3000);
      }
    } catch (error) {
      console.error('Failed to create vacation limit:', error);
      setValidationMessage('⚠️ Fehler beim Erstellen der Voreinstellung');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  const deleteVacationLimit = async (id: number) => {
    if (!confirm('Möchten Sie diese Voreinstellung wirklich löschen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/schichtplan/vacation-limits?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadVacationLimits();
        setValidationMessage('✅ Voreinstellung erfolgreich gelöscht!');
        setTimeout(() => setValidationMessage(null), 3000);
      } else {
        setValidationMessage('⚠️ Fehler beim Löschen');
        setTimeout(() => setValidationMessage(null), 3000);
      }
    } catch (error) {
      console.error('Failed to delete vacation limit:', error);
      setValidationMessage('⚠️ Fehler beim Löschen');
      setTimeout(() => setValidationMessage(null), 3000);
    }
  };

  return (
    <div className="admin-view">
      <div className="admin-header">
        <h1>👨‍💼 Admin Schichtplanung</h1>
        
        {validationMessage && (
          <div className={`validation-message ${validationMessage.startsWith('✅') ? 'success' : 'warning'}`}>
            {validationMessage}
          </div>
        )}
        
        {viewMode === 'area' && (
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
        )}

        <div className="view-mode-toggle">
          <button 
            onClick={() => setViewMode('area')} 
            className={`view-mode-btn ${viewMode === 'area' ? 'active' : ''}`}
          >
            📊 Bereichsansicht
          </button>
          <button 
            onClick={() => setViewMode('employee')} 
            className={`view-mode-btn ${viewMode === 'employee' ? 'active' : ''}`}
          >
            👥 Mitarbeiteransicht
          </button>
          <button 
            onClick={() => {
              setShowVacationLimitsModal(true);
              loadVacationLimits();
            }}
            className="view-mode-btn"
            style={{ marginLeft: '10px', backgroundColor: '#8b5cf6', color: 'white' }}
          >
            ⚙️ SP Einstellung
          </button>
        </div>

        {/* Geburtstagsanzeige für Admins */}
        <div className="birthday-display" style={{
          background: 'rgba(37, 99, 235, 0.15)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(37, 99, 235, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          marginTop: '20px',
          boxShadow: '0 8px 32px 0 rgba(37, 99, 235, 0.15)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            🎂 Anstehende Geburtstage (nächste 30 Tage)
          </h3>
          {getUpcomingBirthdays.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {getUpcomingBirthdays.map(({ employee, birthday, daysUntil, age }) => {
                const isToday = daysUntil === 0;
                const isTomorrow = daysUntil === 1;
                
                return (
                  <div
                    key={employee.id}
                    style={{
                      background: isToday 
                        ? 'rgba(34, 197, 94, 0.2)' 
                        : 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: `1px solid ${isToday ? 'rgba(34, 197, 94, 0.4)' : 'rgba(37, 99, 235, 0.3)'}`,
                      borderRadius: '8px',
                      padding: '12px 16px',
                      minWidth: '200px',
                      boxShadow: isToday 
                        ? '0 4px 16px 0 rgba(34, 197, 94, 0.2)' 
                        : '0 4px 16px 0 rgba(37, 99, 235, 0.1)'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '6px', color: '#1e3a8a' }}>
                      {employee.firstName} {employee.lastName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      {isToday ? (
                        <span style={{ color: '#16a34a', fontWeight: 'bold' }}>🎉 Heute!</span>
                      ) : isTomorrow ? (
                        <span style={{ color: '#2563eb', fontWeight: 'bold' }}>Morgen</span>
                      ) : (
                        <span style={{ color: '#2563eb' }}>{daysUntil} Tage</span>
                      )}
                      {' • '}
                      {birthday.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      {' • '}
                      {age} Jahre
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>
              Keine anstehenden Geburtstage in den nächsten 30 Tagen
            </div>
          )}
        </div>

        {vacationRequests.length > 0 && (
          <div className="vacation-requests-section">
            <h2>🏖️ Urlaubsanträge ({vacationRequests.filter(r => r.status === 'pending').length} offen)</h2>
            <div className="vacation-requests-list">
              {vacationRequests
                .filter(r => r.status === 'pending')
                .map(request => {
                  const startDate = new Date(request.startDate);
                  const endDate = new Date(request.endDate);
                  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  
                  return (
                    <div key={request.id} className="vacation-request-item">
                      <div className="vacation-request-info">
                        <strong>{request.employeeName}</strong>
                        <span className="vacation-type-badge">{request.type === 'Urlaub' ? '🏖️ Urlaub' : '⏰ Überstunden'}</span>
                        <span className="vacation-date">
                          {startDate.toLocaleDateString('de-DE', { 
                            weekday: 'short',
                            day: '2-digit', 
                            month: '2-digit'
                          })} - {endDate.toLocaleDateString('de-DE', { 
                            weekday: 'short',
                            day: '2-digit', 
                            month: '2-digit',
                            year: 'numeric'
                          })} ({daysDiff} Tag{daysDiff > 1 ? 'e' : ''})
                        </span>
                        <span className="vacation-requested-at">
                          Beantragt: {new Date(request.requestedAt).toLocaleDateString('de-DE', { 
                            day: '2-digit', 
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="vacation-request-actions">
                        <button 
                          className="btn-approve"
                          onClick={() => onVacationDecision(request.id, true)}
                        >
                          ✅ Genehmigen
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={() => onVacationDecision(request.id, false)}
                        >
                          ❌ Ablehnen
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      <div className="employee-section">
          <button 
            onClick={() => setShowBulkAssignment(!showBulkAssignment)} 
            className="btn-bulk-assignment"
          >
            {showBulkAssignment ? '✕ Schließen' : '📅 Wochenplan erstellen'}
          </button>
          
          {showEmployeeForm && (
            <div className="employee-form-extended">
              <h4>{editingEmployeeId ? 'Mitarbeiter bearbeiten' : 'Neuen Mitarbeiter hinzufügen'}</h4>
              
              <div className="form-section">
                <label>Persönliche Daten:</label>
                <div className="name-inputs">
                  <input
                    type="text"
                    value={newEmployeeFirstName}
                    onChange={(e) => setNewEmployeeFirstName(e.target.value)}
                    placeholder="Vorname *"
                    className="input-employee"
                    required
                  />
                  <input
                    type="text"
                    value={newEmployeeLastName}
                    onChange={(e) => setNewEmployeeLastName(e.target.value)}
                    placeholder="Nachname *"
                    className="input-employee"
                    required
                  />
                  <input
                    type="date"
                    value={newEmployeeBirthDate}
                    onChange={(e) => setNewEmployeeBirthDate(e.target.value)}
                    placeholder="Geburtsdatum"
                    className="input-employee"
                    title="Geburtsdatum (wird automatisch im Schichtplan markiert)"
                  />
                </div>
              </div>

              <div className="form-section">
                <label>Kontaktdaten:</label>
                <div className="contact-inputs">
                  <input
                    type="tel"
                    value={newEmployeePhone}
                    onChange={(e) => setNewEmployeePhone(e.target.value)}
                    placeholder="Telefonnummer"
                    className="input-employee"
                  />
                  <input
                    type="email"
                    value={newEmployeeEmail}
                    onChange={(e) => setNewEmployeeEmail(e.target.value)}
                    placeholder="E-Mail"
                    className="input-employee"
                  />
                  <select
                    value={newEmployeeEmploymentType}
                    onChange={(e) => {
                      setNewEmployeeEmploymentType(e.target.value as EmploymentType | '');
                      // Reset hours when changing type
                      setNewEmployeeWeeklyHours('');
                      setNewEmployeeMonthlyHours('');
                    }}
                    className="input-employee"
                  >
                    <option value="">Beschäftigungstyp wählen</option>
                    <option value="Vollzeit">Vollzeit</option>
                    <option value="Teilzeit">Teilzeit</option>
                    <option value="Aushilfe">Aushilfe</option>
                  </select>
                  {(newEmployeeEmploymentType === 'Vollzeit' || newEmployeeEmploymentType === 'Teilzeit') && (
                    <input
                      type="number"
                      value={newEmployeeWeeklyHours}
                      onChange={(e) => setNewEmployeeWeeklyHours(e.target.value)}
                      placeholder="Wochenarbeitsstunden"
                      className="input-employee"
                      min="0"
                      max="60"
                      step="0.5"
                    />
                  )}
                  {newEmployeeEmploymentType === 'Aushilfe' && (
                    <input
                      type="number"
                      value={newEmployeeMonthlyHours}
                      onChange={(e) => setNewEmployeeMonthlyHours(e.target.value)}
                      placeholder="Monatsarbeitsstunden"
                      className="input-employee"
                      min="0"
                      max="200"
                      step="0.5"
                    />
                  )}
                </div>
              </div>
              
              <div className="area-assignment">
                <label>Einsatzbereiche (max. 4) *:</label>
                <div className="area-selector">
                  {AREAS.map(area => (
                    <button
                      key={area}
                      onClick={() => toggleAreaSelection(area)}
                      className={`area-btn ${newEmployeeAreas.includes(area) ? 'selected' : ''}`}
                    >
                      {newEmployeeAreas.includes(area) && '✓ '}
                      {area}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="color-assignment">
                <label>Farbe:</label>
                <div className="color-selector">
                  {(['Rot', 'Braun', 'Schwarz', 'Grün', 'Violett', 'Blau', 'Gelb'] as EmployeeColor[]).map(color => (
                    <button
                      key={color}
                      onClick={() => setNewEmployeeColor(newEmployeeColor === color ? undefined : color)}
                      className={`color-btn color-${color.toLowerCase()} ${newEmployeeColor === color ? 'selected' : ''}`}
                      title={color}
                    >
                      {newEmployeeColor === color && '✓ '}
                      <span className="color-preview" style={{ backgroundColor: getColorValue(color) }}></span>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-actions">
                {editingEmployeeId ? (
                  <>
                    <button onClick={updateEmployee} className="btn-add-employee">Aktualisieren</button>
                    <button onClick={cancelEdit} className="btn-cancel-employee">Abbrechen</button>
                  </>
                ) : (
                  <button onClick={addEmployee} className="btn-add-employee">Mitarbeiter hinzufügen</button>
                )}
              </div>
            </div>
          )}
      </div>

      {showEmployeeManagement && (
        <div className="employee-management-panel">
          <h2>👥 Mitarbeiter verwalten</h2>
          <div className="employee-management-table-wrapper">
            <table className="employee-management-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Typ</th>
                  <th>Farbe</th>
                  <th>Bereiche</th>
                  <th>Telefon</th>
                  <th>E-Mail</th>
                  <th>Stunden</th>
                  <th>Geburtsdatum</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(employee => (
                  <tr key={employee.id} className={employee.active === false ? 'employee-inactive' : ''}>
                    <td>
                      {employee.firstName} {employee.lastName}
                      {employee.active === false && <span className="inactive-badge">Deaktiviert</span>}
                    </td>
                    <td>
                      {employee.active === false ? (
                        <span className="status-badge status-inactive">❌ Inaktiv</span>
                      ) : (
                        <span className="status-badge status-active">✅ Aktiv</span>
                      )}
                    </td>
                    <td>
                      {employee.employmentType || '—'}
                    </td>
                    <td>
                      {employee.color && (
                        <span 
                          className="employee-color-indicator" 
                          style={{ backgroundColor: getColorValue(employee.color) }}
                          title={employee.color}
                        ></span>
                      )}
                    </td>
                    <td>{employee.areas.join(', ')}</td>
                    <td>{employee.phone || '—'}</td>
                    <td>{employee.email || '—'}</td>
                    <td>
                      {employee.employmentType === 'Aushilfe' 
                        ? (employee.monthlyHours ? `${employee.monthlyHours}h/Monat` : '—')
                        : (employee.weeklyHours ? `${employee.weeklyHours}h/Woche` : '—')
                      }
                    </td>
                    <td>
                      {employee.birthDate 
                        ? (() => {
                            const date = new Date(employee.birthDate);
                            return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('de-DE');
                          })()
                        : '—'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => {
                            startEditEmployee(employee);
                            setShowEmployeeManagement(false);
                          }}
                          className="btn-edit-in-table"
                          title="Mitarbeiter bearbeiten"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => toggleEmployeeActive(employee)}
                          className={`btn-toggle-active ${employee.active === false ? 'btn-activate' : 'btn-deactivate'}`}
                          title={employee.active === false ? 'Mitarbeiter aktivieren' : 'Mitarbeiter deaktivieren'}
                        >
                          {employee.active === false ? '✓' : '⊗'}
                        </button>
                        <button
                          onClick={() => deleteEmployee(employee)}
                          className="btn-delete-employee"
                          title="Mitarbeiter löschen"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PDF Export Dialog */}
      {showExportDialog && (
        <div className="import-dialog-overlay" onClick={() => setShowExportDialog(false)}>
          <div className="import-dialog" onClick={(e) => e.stopPropagation()}>
            <h2>📄 PDF Export</h2>
            <p className="import-description">
              Wählen Sie die gewünschten Exportoptionen für den Schichtplan.
            </p>

            {/* Export Type Selection */}
            <div className="export-option-group">
              <label className="export-label">Export nach:</label>
              <div className="export-type-buttons">
                <button
                  className={`export-type-btn ${exportType === 'area' ? 'active' : ''}`}
                  onClick={() => setExportType('area')}
                >
                  📍 Bereich
                </button>
                <button
                  className={`export-type-btn ${exportType === 'days' ? 'active' : ''}`}
                  onClick={() => setExportType('days')}
                >
                  📅 Tage
                </button>
                <button
                  className={`export-type-btn ${exportType === 'employee' ? 'active' : ''}`}
                  onClick={() => setExportType('employee')}
                >
                  👤 Namen
                </button>
              </div>
            </div>

            {/* Area Selection */}
            {exportType === 'area' && (
              <div className="export-option-group">
                <label className="export-label">Bereich auswählen:</label>
                <select
                  value={exportSelectedArea}
                  onChange={(e) => setExportSelectedArea(e.target.value as AreaType)}
                  className="export-select"
                >
                  {AREAS.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range Selection */}
            {exportType === 'days' && (
              <div className="export-option-group">
                <label className="export-label">Zeitraum:</label>
                <div className="date-range-export">
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="export-date-input"
                  />
                  <span>bis</span>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="export-date-input"
                  />
                </div>
              </div>
            )}

            {/* Employee Selection */}
            {exportType === 'employee' && (
              <div className="export-option-group">
                <label className="export-label">Mitarbeiter auswählen:</label>
                <div className="employee-checkbox-list">
                  {employees.filter(emp => emp.active !== false).map(emp => (
                    <label key={emp.id} className="employee-checkbox-item">
                      <input
                        type="checkbox"
                        checked={exportSelectedEmployees.includes(emp.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExportSelectedEmployees([...exportSelectedEmployees, emp.id]);
                          } else {
                            setExportSelectedEmployees(exportSelectedEmployees.filter(id => id !== emp.id));
                          }
                        }}
                      />
                      <span>{emp.firstName} {emp.lastName}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="import-actions">
              <button
                onClick={exportToPDF}
                className="btn-import-confirm"
                disabled={
                  (exportType === 'days' && (!exportStartDate || !exportEndDate)) ||
                  (exportType === 'employee' && exportSelectedEmployees.length === 0)
                }
              >
                📥 PDF Exportieren
              </button>
              <button
                onClick={() => {
                  setShowExportDialog(false);
                  setExportStartDate('');
                  setExportEndDate('');
                  setExportSelectedEmployees([]);
                }}
                className="btn-import-cancel"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkAssignment && (
        <div className="bulk-assignment-panel">
          <h3>📅 Wochenplan erstellen</h3>
          <p className="bulk-description">Weisen Sie mehreren Mitarbeitern gleichzeitig Schichten zu. Jeder Mitarbeiter wird automatisch seinem Hauptbereich zugewiesen.</p>
          
          <div className="bulk-section">
            <label>Zeitraum:</label>
            <div className="date-range">
              <input
                type="date"
                value={bulkStartDate}
                onChange={(e) => setBulkStartDate(e.target.value)}
                className="date-input"
              />
              <span>bis</span>
              <input
                type="date"
                value={bulkEndDate}
                onChange={(e) => setBulkEndDate(e.target.value)}
                className="date-input"
              />
            </div>
          </div>

          <div className="bulk-section">
            <label>Wochentage:</label>
            <div className="weekday-selector">
              {WEEKDAYS.map((day, index) => {
                const dayNum = index + 1;
                return (
                  <button
                    key={day}
                    onClick={() => toggleWeekday(dayNum)}
                    className={`weekday-btn ${selectedWeekdays.includes(dayNum) ? 'selected' : ''}`}
                  >
                    {day.substring(0, 2)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bulk-section">
            <label>Schicht:</label>
            <select
              value={bulkShift}
              onChange={(e) => setBulkShift(e.target.value as ShiftType)}
              className="bulk-select-single"
            >
              {SHIFT_TYPES.map(shift => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>
          </div>

          <div className="bulk-section">
            <label>Mitarbeiter auswählen:</label>
            <div className="employee-multi-select">
              {employees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => toggleEmployeeSelection(emp.id)}
                  className={`employee-select-btn ${selectedEmployees.includes(emp.id) ? 'selected' : ''}`}
                >
                  <div className="employee-btn-content">
                    <span className="employee-name">
                      {selectedEmployees.includes(emp.id) && '✓ '}
                      {emp.firstName} {emp.lastName}
                    </span>
                    <span className="employee-areas">{emp.areas.join(', ')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bulk-actions">
            <button onClick={bulkAssignEmployees} className="btn-bulk-submit">
              ✓ Zuweisung durchführen
            </button>
            <button onClick={() => setShowBulkAssignment(false)} className="btn-bulk-cancel">
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {viewMode === 'employee' ? (
        <div className="employee-overview-container">
          <h2 className="employee-overview-title">Mitarbeiter-Übersicht</h2>
          
          <div className="time-view-toggle">
            <button 
              onClick={() => setEmployeeViewMode('week')} 
              className={`time-view-btn ${employeeViewMode === 'week' ? 'active' : ''}`}
            >
              📅 Wochenansicht
            </button>
            <button 
              onClick={() => setEmployeeViewMode('month')} 
              className={`time-view-btn ${employeeViewMode === 'month' ? 'active' : ''}`}
            >
              📆 Monatsansicht
            </button>
          </div>

          {employeeViewMode === 'week' ? (
            <>
              <div className="week-navigation-employee">
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
            </>
          ) : (
            <div className="month-navigation">
              <button onClick={() => changeMonth('prev')} className="btn-month-nav">
                ← Vorheriger Monat
              </button>
              <div className="month-display">
                <strong>Monat:</strong> {getMonthRange()}
              </div>
              <button onClick={() => changeMonth('next')} className="btn-month-nav">
                Nächster Monat →
              </button>
              <button 
                onClick={() => setShowExportDialog(true)} 
                className="btn-export-pdf"
                title="Schichtplan als PDF exportieren"
              >
                📄 PDF Export
              </button>
            </div>
          )}
          
          <div className="employee-view-controls">
            <div className="control-group">
              <button
                onClick={() => {
                  setCopySourceWeek(currentWeekStart);
                  const nextWeekStart = new Date(currentWeekStart);
                  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
                  setCopyTargetWeek(nextWeekStart.toISOString().split('T')[0]);
                  // Initialize months based on current week selections
                  const sourceMonth = `${new Date(currentWeekStart).getFullYear()}-${String(new Date(currentWeekStart).getMonth() + 1).padStart(2, '0')}`;
                  const targetMonth = `${nextWeekStart.getFullYear()}-${String(nextWeekStart.getMonth() + 1).padStart(2, '0')}`;
                  setCopySourceMonth(sourceMonth);
                  setCopyTargetMonth(targetMonth);
                  setShowWeekCopyDialog(true);
                }}
                className="btn-copy-week"
                title="Woche kopieren - Quell- und Zielwoche auswählen"
              >
                📋 Woche kopieren
              </button>
            </div>
            
            {selectedCells.size > 0 && (
              <div className="selection-info">
                {selectedCells.size} Feld(er) ausgewählt
                <button
                  onClick={() => {
                    setSelectedCells(new Set());
                    setLastSelectedCell(null);
                  }}
                  className="btn-clear-selection"
                >
                  Auswahl löschen
                </button>
              </div>
            )}

          </div>
          
          <div className="shift-palette">
            <div className="palette-title">Schichten zuweisen (ziehen & ablegen oder Klick für Auswahl):</div>
            <div className="palette-buttons">
              <div
                draggable
                onClick={() => handlePaletteClick('Frühschicht')}
                onDragStart={(e) => handleEmployeeViewDragStart(e, 'Frühschicht')}
                onDragEnd={handleEmployeeViewDragEnd}
                className={`palette-item palette-frueh ${draggedShiftType === 'Frühschicht' ? 'dragging' : ''}`}
                title="Frühschicht zuweisen"
              >
                F - Früh
              </div>
              <div
                draggable
                onClick={() => handlePaletteClick('Mittelschicht')}
                onDragStart={(e) => handleEmployeeViewDragStart(e, 'Mittelschicht')}
                onDragEnd={handleEmployeeViewDragEnd}
                className={`palette-item palette-mittel ${draggedShiftType === 'Mittelschicht' ? 'dragging' : ''}`}
                title="Mittelschicht zuweisen"
              >
                M - Mittel
              </div>
              <div
                draggable
                onClick={() => handlePaletteClick('Spätschicht')}
                onDragStart={(e) => handleEmployeeViewDragStart(e, 'Spätschicht')}
                onDragEnd={handleEmployeeViewDragEnd}
                className={`palette-item palette-spaet ${draggedShiftType === 'Spätschicht' ? 'dragging' : ''}`}
                title="Spätschicht zuweisen"
              >
                S - Spät
              </div>
              <div
                draggable
                onClick={() => handlePaletteClick('Urlaub')}
                onDragStart={(e) => handleEmployeeViewDragStart(e, 'Urlaub')}
                onDragEnd={handleEmployeeViewDragEnd}
                className={`palette-item palette-urlaub ${draggedShiftType === 'Urlaub' ? 'dragging' : ''}`}
                title="Urlaub zuweisen"
              >
                U - Urlaub
              </div>
              <div
                draggable
                onClick={() => handlePaletteClick('Krank')}
                onDragStart={(e) => handleEmployeeViewDragStart(e, 'Krank')}
                onDragEnd={handleEmployeeViewDragEnd}
                className={`palette-item palette-krank ${draggedShiftType === 'Krank' ? 'dragging' : ''}`}
                title="Krank zuweisen"
              >
                K - Krank
              </div>
            </div>
            <div className="palette-hint">
            </div>
          </div>

          {showWeekCopyDialog && (
            <div className="week-copy-dialog-overlay" onClick={() => setShowWeekCopyDialog(false)}>
              <div className="week-copy-dialog" onClick={(e) => e.stopPropagation()}>
                <h3>📋 Woche kopieren</h3>
                <p className="dialog-description">
                  Wählen Sie die Quellwoche (von) und die Zielwoche (nach) aus. Der Wochenplan wird von der Quellwoche zur Zielwoche kopiert.
                </p>
                
                <div className="dialog-section">
                  <label className="dialog-label">
                    <strong>Von Woche (Quelle):</strong>
                  </label>
                  <div className="calendar-week-view">
                    <div className="calendar-nav">
                      <button 
                        type="button"
                        onClick={() => changeCopyWeek('prev', 'source')}
                        className="calendar-nav-btn"
                      >
                        ←
                      </button>
                      <div className="calendar-week-range">
                        {getWeekRangeForDate(copySourceWeek)}
                      </div>
                      <button 
                        type="button"
                        onClick={() => changeCopyWeek('next', 'source')}
                        className="calendar-nav-btn"
                      >
                        →
                      </button>
                    </div>
                    <div className="calendar-week-grid">
                      {getWeekDatesForCalendar(getMondayOfWeek(copySourceWeek)).map(({ date, day, dayName }) => {
                        const isSelected = getMondayOfWeek(copySourceWeek) === getMondayOfWeek(date);
                        const isToday = date === new Date().toISOString().split('T')[0];
                        return (
                          <div
                            key={date}
                            className={`calendar-week-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                            onClick={() => {
                              const monday = getMondayOfWeek(date);
                              setCopySourceWeek(monday);
                              const month = `${new Date(monday).getFullYear()}-${String(new Date(monday).getMonth() + 1).padStart(2, '0')}`;
                              setCopySourceMonth(month);
                            }}
                            title={new Date(date).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          >
                            <div className="calendar-day-name">{dayName}</div>
                            <div className="calendar-day-number">{day}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="dialog-section">
                  <label className="dialog-label">
                    <strong>Nach Woche (Ziel):</strong>
                  </label>
                  <div className="calendar-month-view">
                    <div className="calendar-nav">
                      <button 
                        type="button"
                        onClick={() => changeCopyMonth('prev', 'target')}
                        className="calendar-nav-btn"
                      >
                        ←
                      </button>
                      <div className="calendar-month-name">
                        {new Date(copyTargetMonth + '-01').toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                      </div>
                      <button 
                        type="button"
                        onClick={() => changeCopyMonth('next', 'target')}
                        className="calendar-nav-btn"
                      >
                        →
                      </button>
                    </div>
                    <div className="calendar-month-grid">
                      <div className="calendar-weekday-header">
                        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                          <div key={day} className="calendar-weekday">{day}</div>
                        ))}
                      </div>
                      <div className="calendar-days-grid">
                        {getMonthDatesForCalendar(copyTargetMonth).map(({ date, day, isCurrentMonth }) => {
                          const targetMonday = getMondayOfWeek(copyTargetWeek);
                          const dateMonday = getMondayOfWeek(date);
                          const isSelected = targetMonday === dateMonday;
                          // Check if this date is part of the selected week
                          const selectedWeekStart = new Date(targetMonday);
                          const selectedWeekEnd = new Date(selectedWeekStart);
                          selectedWeekEnd.setDate(selectedWeekStart.getDate() + 6);
                          const currentDate = new Date(date);
                          const isInSelectedWeek = currentDate >= selectedWeekStart && currentDate <= selectedWeekEnd && targetMonday !== '';
                          const isToday = date === new Date().toISOString().split('T')[0];
                          return (
                            <div
                              key={date}
                              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isInSelectedWeek && !isSelected ? 'in-selected-week' : ''} ${isToday ? 'today' : ''}`}
                              onClick={() => {
                                const monday = getMondayOfWeek(date);
                                setCopyTargetWeek(monday);
                                const month = `${new Date(monday).getFullYear()}-${String(new Date(monday).getMonth() + 1).padStart(2, '0')}`;
                                setCopyTargetMonth(month);
                              }}
                              title={new Date(date).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="calendar-week-preview">
                      Zielwoche: {getWeekRangeForDate(copyTargetWeek)}
                    </div>
                  </div>
                </div>

                <div className="dialog-actions">
                  <button onClick={handleWeekCopy} className="btn-dialog-confirm">
                    ✓ Kopieren
                  </button>
                  <button onClick={() => setShowWeekCopyDialog(false)} className="btn-dialog-cancel">
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          )}

          {employeeViewMode === 'week' ? (
            <>
              <div className="employee-sort">
                <div className="sort-group">
                  <label>Sortieren nach:</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => {
                      const newSortBy = e.target.value as 'name' | 'area' | 'color';
                      // If clicking the same sort option, toggle order
                      if (newSortBy === sortBy) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy(newSortBy);
                        setSortOrder('asc');
                      }
                    }}
                    className="sort-select"
                  >
                    <option value="name">Name (alphabetisch)</option>
                    <option value="area">Einsatzbereich</option>
                    <option value="color">Farbe</option>
                  </select>
                </div>
                
                <button 
                  className="btn-sort-order"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  title={sortOrder === 'asc' ? 'Aufsteigend' : 'Absteigend'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
              <div className="employee-overview-wrapper">
                <table className="employee-overview-table">
                <thead>
                  <tr>
                    <th className="employee-name-header">Mitarbeiter</th>
                    {weekSchedule.map((day, index) => {
                      const holidayInfo = getHolidayInfo(day.date);
                      return (
                        <th 
                          key={day.date} 
                          className={`employee-day-header ${holidayInfo.isHoliday ? 'holiday-header' : ''} ${holidayInfo.isVacation ? 'vacation-header' : ''}`}
                          title={holidayInfo.name || ''}
                        >
                          <div className="day-name">{WEEKDAYS[index]}</div>
                          <div className="day-date">
                            {new Date(day.date).toLocaleDateString('de-DE', { 
                              day: '2-digit', 
                              month: '2-digit' 
                            })}
                          </div>
                          {holidayInfo.name && (
                            <div className="holiday-indicator" title={holidayInfo.name}>
                              {holidayInfo.isHoliday ? '🎉' : '🏖️'}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {getSortedEmployees().map(employee => (
                    <tr key={employee.id}>
                      <td className="employee-name-cell">
                        <div 
                          className="employee-name-with-color employee-name-clickable"
                          onClick={() => openEmployeeEditFromTable(employee)}
                          title="Klicken um Mitarbeiter zu bearbeiten"
                        >
                          {employee.color && (
                            <span 
                              className="employee-color-bar" 
                              style={{ backgroundColor: getColorValue(employee.color) }}
                              title={employee.color}
                            ></span>
                          )}
                          <span className="employee-name-text">
                            {employee.firstName} {employee.lastName}
                          </span>
                        </div>
                      </td>
                      {weekSchedule.map(day => {
                        const shifts = getEmployeeShiftsForDate(employee.id, day.date);
                        const hasShift = shifts.length > 0;
                        const isUrlaub = shifts.includes('U') || shifts.includes('U_beantragt') || shifts.includes('U_abgelehnt');
                        const isUrlaubBeantragt = shifts.includes('U_beantragt');
                        const isUrlaubAbgelehnt = shifts.includes('U_abgelehnt');
                        const isUeberstunden = shifts.includes('Ü_beantragt') || shifts.includes('Ü_genehmigt') || shifts.includes('Ü_abgelehnt');
                        const isUeberstundenBeantragt = shifts.includes('Ü_beantragt');
                        const isUeberstundenAbgelehnt = shifts.includes('Ü_abgelehnt');
                        const isKrank = shifts.includes('K');
                        const isSelected = selectedCells.has(getCellKey(employee.id, day.date));
                        const isHovered = hoveredDropCell?.employeeId === employee.id && hoveredDropCell?.dateStr === day.date;
                        const isInSelectedGroup = isSelected && selectedCells.size > 0 && (draggedShiftType || draggedShiftFromCell);
                        
                        const dateDisplay = new Date(day.date).toLocaleDateString('de-DE', { 
                          weekday: 'short', 
                          day: '2-digit', 
                          month: '2-digit' 
                        });
                        
                        let cellTitle = multiSelectTooltip;
                        const currentShiftType = draggedShiftFromCell?.shiftType || draggedShiftType;
                        if (isHovered && currentShiftType) {
                          if (draggedShiftFromCell) {
                            const sourceDate = new Date(draggedShiftFromCell.dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
                            cellTitle = `${currentShiftType} von ${sourceDate} nach ${dateDisplay} kopieren`;
                          } else {
                            cellTitle = `${currentShiftType} zuweisen: ${dateDisplay}`;
                          }
                        } else if (isInSelectedGroup && currentShiftType) {
                          if (draggedShiftFromCell) {
                            const sourceDate = new Date(draggedShiftFromCell.dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
                            cellTitle = `${currentShiftType} von ${sourceDate} wird auf ${selectedCells.size} ausgewählte Tage kopiert`;
                          } else {
                            cellTitle = `${currentShiftType} wird allen ${selectedCells.size} ausgewählten Tagen zugewiesen`;
                          }
                        }
                        
                        return (
                          <td 
                            key={day.date} 
                            data-employee-id={employee.id}
                            data-date-str={day.date}
                            className={`employee-shift-cell ${(draggedShiftType || draggedShiftFromCell) ? 'drop-zone-active' : ''} ${isHovered ? 'drop-zone-hovered' : ''} ${isInSelectedGroup ? 'drop-zone-selected-group' : ''} ${isUrlaub ? 'status-urlaub' : ''} ${isUrlaubBeantragt ? 'status-urlaub-beantragt' : ''} ${isUrlaubAbgelehnt ? 'status-urlaub-abgelehnt' : ''} ${isUeberstunden ? 'status-ueberstunden' : ''} ${isUeberstundenBeantragt ? 'status-ueberstunden-beantragt' : ''} ${isUeberstundenAbgelehnt ? 'status-ueberstunden-abgelehnt' : ''} ${isKrank ? 'status-krank' : ''} ${isSelected ? 'cell-selected' : ''}`}
                            onPointerDown={(e) => handleCellPointerDown(e, employee.id, day.date)}
                            onPointerEnter={(e) => handleCellPointerEnter(e, employee.id, day.date)}
                            onDragOver={(e) => handleEmployeeViewDragOver(e, employee.id, day.date)}
                            onDragLeave={handleEmployeeViewDragLeave}
                            onDrop={(e) => handleEmployeeViewDrop(e, employee.id, day.date)}
                            onClick={(e) => handleCellClick(e, employee.id, day.date)}
                            title={cellTitle}
                          >
                            {hasShift ? (
                              <div className="shift-abbreviations">
                                {shifts.map((shiftAbbrev, idx) => {
                                  const shiftType = getShiftTypeFromAbbreviation(shiftAbbrev);
                                  if (!shiftType) return <span key={idx}>{shiftAbbrev} </span>;
                                  
                                  return (
                                    <span
                                      key={idx}
                                      draggable
                                      onDragStart={(e) => {
                                        e.stopPropagation(); // Prevent event from bubbling to td
                                        handleShiftDragStart(e, employee.id, day.date, shiftType);
                                      }}
                                      onDragEnd={(e) => {
                                        e.stopPropagation(); // Prevent event from bubbling to td
                                        handleShiftDragEnd(e);
                                      }}
                                      className="shift-abbreviation-draggable"
                                      title={`${shiftType} ziehen zum Kopieren`}
                                    >
                                      {shiftAbbrev}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="no-shift">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          ) : (
            <>
              <div className="employee-sort">
                <div className="sort-group">
                  <label>Sortieren nach:</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => {
                      const newSortBy = e.target.value as 'name' | 'area' | 'color';
                      // If clicking the same sort option, toggle order
                      if (newSortBy === sortBy) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy(newSortBy);
                        setSortOrder('asc');
                      }
                    }}
                    className="sort-select"
                  >
                    <option value="name">Name (alphabetisch)</option>
                    <option value="area">Einsatzbereich</option>
                    <option value="color">Farbe</option>
                  </select>
                </div>
                
                <button 
                  className="btn-sort-order"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  title={sortOrder === 'asc' ? 'Aufsteigend' : 'Absteigend'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
              <div className="employee-month-wrapper">
                <table className="employee-month-table">
                <thead>
                  <tr>
                    <th className="employee-name-header">Mitarbeiter</th>
                    {(() => {
                      const monthDates = getMonthDates(currentMonth);
                      return monthDates.map(dateStr => {
                        const date = new Date(dateStr);
                        const dayOfWeek = date.getDay();
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                        const holidayInfo = getHolidayInfo(dateStr);
                        return (
                          <th 
                            key={dateStr} 
                            className={`employee-month-day-header ${isWeekend ? 'weekend' : ''} ${holidayInfo.isHoliday ? 'holiday-header' : ''} ${holidayInfo.isVacation ? 'vacation-header' : ''}`}
                            title={holidayInfo.name || ''}
                          >
                            <div className="day-name-small">{getDayName(dateStr)}</div>
                            <div className="day-date-small">
                              {date.getDate()}
                            </div>
                            {holidayInfo.name && (
                              <div className="holiday-indicator-small" title={holidayInfo.name}>
                                {holidayInfo.isHoliday ? '🎉' : '🏖️'}
                              </div>
                            )}
                          </th>
                        );
                      });
                    })()}
                  </tr>
                </thead>
                <tbody>
                  {getSortedEmployees().map(employee => (
                    <tr key={employee.id}>
                      <td className="employee-name-cell">
                        <div 
                          className="employee-name-with-color employee-name-clickable"
                          onClick={() => openEmployeeEditFromTable(employee)}
                          title="Klicken um Mitarbeiter zu bearbeiten"
                        >
                          {employee.color && (
                            <span 
                              className="employee-color-bar" 
                              style={{ backgroundColor: getColorValue(employee.color) }}
                              title={employee.color}
                            ></span>
                          )}
                          <span className="employee-name-text">
                            {employee.firstName} {employee.lastName}
                          </span>
                        </div>
                      </td>
                      {(() => {
                        const monthDates = getMonthDates(currentMonth);
                        return monthDates.map(dateStr => {
                          const shifts = getEmployeeShiftsForDate(employee.id, dateStr);
                          const hasShift = shifts.length > 0;
                          const isUrlaub = shifts.includes('U') || shifts.includes('U_beantragt') || shifts.includes('U_abgelehnt');
                          const isUrlaubBeantragt = shifts.includes('U_beantragt');
                          const isUrlaubAbgelehnt = shifts.includes('U_abgelehnt');
                          const isUeberstunden = shifts.includes('Ü_beantragt') || shifts.includes('Ü_genehmigt') || shifts.includes('Ü_abgelehnt');
                          const isUeberstundenBeantragt = shifts.includes('Ü_beantragt');
                          const isUeberstundenAbgelehnt = shifts.includes('Ü_abgelehnt');
                          const isKrank = shifts.includes('K');
                          const isSelected = selectedCells.has(getCellKey(employee.id, dateStr));
                          const date = new Date(dateStr);
                          const dayOfWeek = date.getDay();
                          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                          
                          const isHovered = hoveredDropCell?.employeeId === employee.id && hoveredDropCell?.dateStr === dateStr;
                          const isInSelectedGroup = isSelected && selectedCells.size > 0 && (draggedShiftType || draggedShiftFromCell);
                          const dateDisplay = new Date(dateStr).toLocaleDateString('de-DE', { 
                            weekday: 'short', 
                            day: '2-digit', 
                            month: '2-digit' 
                          });
                          
                          // Determine title based on state
                        let cellTitle = multiSelectTooltip;
                          const currentShiftType = draggedShiftFromCell?.shiftType || draggedShiftType;
                          if (isHovered && currentShiftType) {
                            if (draggedShiftFromCell) {
                              const sourceDate = new Date(draggedShiftFromCell.dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
                              cellTitle = `${currentShiftType} von ${sourceDate} nach ${dateDisplay} kopieren`;
                            } else {
                              cellTitle = `${currentShiftType} zuweisen: ${dateDisplay}`;
                            }
                          } else if (isInSelectedGroup && currentShiftType) {
                            if (draggedShiftFromCell) {
                              const sourceDate = new Date(draggedShiftFromCell.dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
                              cellTitle = `${currentShiftType} von ${sourceDate} wird auf ${selectedCells.size} ausgewählte Tage kopiert`;
                            } else {
                              cellTitle = `${currentShiftType} wird allen ${selectedCells.size} ausgewählten Tagen zugewiesen`;
                            }
                          }
                          
                          return (
                            <td 
                              key={dateStr} 
                              data-employee-id={employee.id}
                              data-date-str={dateStr}
                              className={`employee-shift-cell-month ${(draggedShiftType || draggedShiftFromCell) ? 'drop-zone-active' : ''} ${isHovered ? 'drop-zone-hovered' : ''} ${isInSelectedGroup ? 'drop-zone-selected-group' : ''} ${isUrlaub ? 'status-urlaub' : ''} ${isUrlaubBeantragt ? 'status-urlaub-beantragt' : ''} ${isUrlaubAbgelehnt ? 'status-urlaub-abgelehnt' : ''} ${isUeberstunden ? 'status-ueberstunden' : ''} ${isUeberstundenBeantragt ? 'status-ueberstunden-beantragt' : ''} ${isUeberstundenAbgelehnt ? 'status-ueberstunden-abgelehnt' : ''} ${isKrank ? 'status-krank' : ''} ${isSelected ? 'cell-selected' : ''} ${isWeekend ? 'weekend' : ''}`}
                              onPointerDown={(e) => handleCellPointerDown(e, employee.id, dateStr)}
                              onPointerEnter={(e) => handleCellPointerEnter(e, employee.id, dateStr)}
                              onDragOver={(e) => handleEmployeeViewDragOver(e, employee.id, dateStr)}
                              onDragLeave={handleEmployeeViewDragLeave}
                              onDrop={(e) => handleEmployeeViewDrop(e, employee.id, dateStr)}
                              onClick={(e) => handleCellClick(e, employee.id, dateStr)}
                              title={cellTitle}
                            >
                              {hasShift ? (
                                <div className="shift-abbreviations-small">
                                  {shifts.map((shiftAbbrev, idx) => {
                                    const shiftType = getShiftTypeFromAbbreviation(shiftAbbrev);
                                    if (!shiftType) return <span key={idx}>{shiftAbbrev} </span>;
                                    
                                    return (
                                      <span
                                        key={idx}
                                        draggable
                                        onDragStart={(e) => {
                                          e.stopPropagation(); // Prevent event from bubbling to td
                                          handleShiftDragStart(e, employee.id, dateStr, shiftType);
                                        }}
                                        onDragEnd={(e) => {
                                          e.stopPropagation(); // Prevent event from bubbling to td
                                          handleShiftDragEnd(e);
                                        }}
                                        className="shift-abbreviation-draggable-small"
                                        title={`${shiftType} ziehen zum Kopieren`}
                                      >
                                        {shiftAbbrev}
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="no-shift-small">—</span>
                              )}
                            </td>
                          );
                        });
                      })()}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
            </div>
          ) : (
        <div className="week-view-container">
          {AREAS.map(area => (
          <div key={area} className="area-section">
            <h2 className="area-title">{area}</h2>
            <div className="area-table-wrapper">
              <table className="week-table">
                <thead>
                  <tr>
                    <th className="shift-header">Schicht</th>
                    {weekSchedule.map((day, index) => (
                      <th key={day.date} className="day-header">
                        <div className="day-name">{WEEKDAYS[index]}</div>
                        <div className="day-date">
                          {new Date(day.date).toLocaleDateString('de-DE', { 
                            day: '2-digit', 
                            month: '2-digit' 
                          })}
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
                        const assignments = day.shifts[area]?.[shift] || [];
                        // Filter employees who can work in this area (and are active)
                        const availableEmployees = employees.filter(emp => emp.areas.includes(area) && emp.active !== false);
                        const underStaffed = isUnderStaffed(area, shift, assignments.length);
                        
                        return (
                          <td 
                            key={day.date} 
                            className={`shift-cell ${underStaffed ? 'understaffed' : ''} ${draggedEmployee ? 'drop-zone' : ''}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, day.date, area, shift)}
                          >
                            <div className="shift-content">
                              {assignments.map(assignment => {
                                const employee = employees.find(e => e.id === assignment.employeeId);
                                return (
                                  <div 
                                    key={assignment.employeeId} 
                                    className="assignment-tag draggable"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, assignment.employeeId, assignment.employeeName, day.date, area, shift)}
                                    onDragEnd={handleDragEnd}
                                    title="Zum Kopieren ziehen"
                                  >
                                    <span className="drag-handle">⋮⋮</span>
                                    {employee?.color && (
                                      <span 
                                        className="employee-color-bar-small" 
                                        style={{ backgroundColor: getColorValue(employee.color) }}
                                        title={employee.color}
                                      ></span>
                                    )}
                                    <span>{assignment.employeeName}</span>
                                    <button
                                      onClick={() => removeAssignment(day.date, area, shift, assignment.employeeId)}
                                      className="btn-remove"
                                      title="Entfernen"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                );
                              })}
                              
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    assignEmployee(day.date, area, shift, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="employee-select"
                                defaultValue=""
                              >
                                <option value="">+ Zuweisen</option>
                                {availableEmployees.map(emp => {
                                  const isAssigned = isEmployeeAssignedOnDate(day.date, emp.id);
                                  return (
                                    <option 
                                      key={emp.id} 
                                      value={emp.id}
                                      disabled={isAssigned}
                                      style={isAssigned ? { color: '#999', fontStyle: 'italic' } : {}}
                                    >
                                      {emp.firstName} {emp.lastName} {isAssigned ? '(bereits eingeteilt)' : ''}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* SP Einstellung Modal */}
      {showVacationLimitsModal && (
        <div className="modal-overlay" onClick={() => setShowVacationLimitsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>⚙️ SP Einstellung - Urlaubsplanung Voreinstellungen</h2>
              <button className="modal-close" onClick={() => setShowVacationLimitsModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Neue Voreinstellung hinzufügen</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Von Datum:</label>
                    <input
                      type="date"
                      value={newLimit.startDate}
                      onChange={(e) => setNewLimit({ ...newLimit, startDate: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Bis Datum:</label>
                    <input
                      type="date"
                      value={newLimit.endDate}
                      onChange={(e) => setNewLimit({ ...newLimit, endDate: e.target.value })}
                      min={newLimit.startDate}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Einsatzbereich:</label>
                    <select
                      value={newLimit.area}
                      onChange={(e) => setNewLimit({ ...newLimit, area: e.target.value as AreaType })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      {AREAS.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Max. Mitarbeiter gleichzeitig:</label>
                    <input
                      type="number"
                      min="1"
                      value={newLimit.maxEmployees}
                      onChange={(e) => setNewLimit({ ...newLimit, maxEmployees: parseInt(e.target.value) || 1 })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
                <button
                  onClick={createVacationLimit}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Voreinstellung hinzufügen
                </button>
              </div>

              <div style={{ marginTop: '30px' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Bestehende Voreinstellungen</h3>
                {vacationLimits.length === 0 ? (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>Keine Voreinstellungen vorhanden</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Von</th>
                          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Bis</th>
                          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Bereich</th>
                          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Max. Mitarbeiter</th>
                          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Aktion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vacationLimits.map((limit) => (
                          <tr key={limit.id}>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                              {new Date(limit.startDate).toLocaleDateString('de-DE')}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                              {new Date(limit.endDate).toLocaleDateString('de-DE')}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{limit.area}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{limit.maxEmployees}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                              <button
                                onClick={() => deleteVacationLimit(limit.id)}
                                style={{
                                  padding: '5px 10px',
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                Löschen
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

AdminView.displayName = 'AdminView';

export default AdminView;
