'use client'

import { useEffect, useMemo, useState } from 'react'

type StaffRow = { display_name: string; username: string; is_active?: boolean; orphan?: boolean }

interface StaffSelectProps {
  id?: string
  value: string
  onChange: (displayName: string) => void
  required?: boolean
  disabled?: boolean
  className?: string
}

const baseSelectClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

/**
 * Auswahl „Zugewiesen an“ aus der Benutzerverwaltung (aktive Nutzer mit Anzeigename).
 * Fallback: Freitextfeld, wenn die API nicht erreichbar ist.
 */
export default function StaffSelect({
  id = 'assignedTo',
  value,
  onChange,
  required = false,
  disabled = false,
  className,
}: StaffSelectProps) {
  const [staff, setStaff] = useState<StaffRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch('/api/users')
        const data = await response.json()
        if (cancelled) return
        if (data.success && Array.isArray(data.users)) {
          const rows: StaffRow[] = data.users
            .map((u: StaffRow & { is_active?: boolean }) => ({
              display_name: (u.display_name || u.username || '').trim(),
              username: (u.username || '').trim(),
              is_active: u.is_active !== false,
            }))
            .filter((u) => u.display_name.length > 0)
            .sort((a, b) => {
              if (a.is_active !== b.is_active) return a.is_active ? -1 : 1
              return a.display_name.localeCompare(b.display_name, 'de')
            })
          setStaff(rows)
          setLoadError(false)
        } else {
          setLoadError(true)
        }
      } catch {
        if (!cancelled) setLoadError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const selectOptions = useMemo(() => {
    const trimmed = value.trim()
    const inList = staff.some((s) => s.display_name === trimmed)
    const head: StaffRow[] = []
    if (trimmed && !inList) {
      head.push({ display_name: trimmed, username: '', orphan: true })
    }
    return [...head, ...staff]
  }, [staff, value])

  if (loadError) {
    return (
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={className ?? baseSelectClass}
        placeholder="Name des Mitarbeiters (Liste nicht geladen)"
        required={required}
        autoComplete="name"
      />
    )
  }

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || loading}
      className={className ?? baseSelectClass}
      required={required}
    >
      <option value="">{loading ? 'Mitarbeitende werden geladen…' : 'Bitte Mitarbeitenden wählen…'}</option>
      {selectOptions.map((row) => {
        const base = row.username
          ? `${row.display_name} (${row.username})`
          : row.display_name
        let label = base
        if (row.orphan) label = `${base} (gespeicherter Eintrag)`
        else if (row.is_active === false) label = `${base} (inaktiv)`
        return (
          <option
            key={row.orphan ? `orphan-${row.display_name}` : `${row.display_name}-${row.username}`}
            value={row.display_name}
          >
            {label}
          </option>
        )
      })}
    </select>
  )
}
