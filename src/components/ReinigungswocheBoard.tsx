'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  type DayKey,
  type ReinigungEntry,
  type ReinigungswocheStore,
  type ReinigungswocheWeekData,
  DAY_ORDER,
  DAY_LABELS,
  DAY_LABELS_SHORT,
  getMonday,
  formatIsoLocal,
  parseIsoLocal,
  newEntry,
  normalizeWeekFromStorage,
  normalizeStoreFromStorage,
  defaultReinigungWeekMondayIso,
  clampReinigungWeekMondayIso,
  getReinigungMinWeekMondayIso,
  getReinigungMaxWeekMondayIso,
  REINIGUNGSZEITRAUM_INTRO,
  getIsoWeek,
  formatReinigungWeekRangeDe,
  areIsoWeekMondaysEqual,
} from '@/lib/reinigungswoche'

const LS_FALLBACK_KEY = 'laola-reinigungswoche-v1'

function cloneStore(s: ReinigungswocheStore): ReinigungswocheStore {
  return JSON.parse(JSON.stringify(s)) as ReinigungswocheStore
}

export default function ReinigungswocheBoard() {
  const [weekMondayIso, setWeekMondayIso] = useState(() => defaultReinigungWeekMondayIso())
  const [store, setStore] = useState<ReinigungswocheStore>({ weeks: {} })
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const hydrateRef = useRef(true)
  /** Nur ein Wochentag sichtbar; null = alle Tage */
  const [soloDayKey, setSoloDayKey] = useState<DayKey | null>(null)

  const weekDates = DAY_ORDER.map((_, i) => {
    const start = parseIsoLocal(weekMondayIso)
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })

  const weekData = normalizeWeekFromStorage(store.weeks[weekMondayIso])
  const entriesForWeek = weekData.aufgaben
  const anwesendeProTag = weekData.anwesendeMitarbeiterProTag
  const fachfirmenAmTag = weekData.fachfirmenProTag

  const minWeekMonday = getReinigungMinWeekMondayIso()
  const maxWeekMonday = getReinigungMaxWeekMondayIso()
  const atMinWeek = areIsoWeekMondaysEqual(weekMondayIso, minWeekMonday)
  const atMaxWeek = areIsoWeekMondaysEqual(weekMondayIso, maxWeekMonday)
  const weekRangeLabel = formatReinigungWeekRangeDe(weekMondayIso)
  const { week: kwNum } = getIsoWeek(parseIsoLocal(weekMondayIso))

  const fetchStore = useCallback(async () => {
    setLoadError(null)
    try {
      const res = await fetch('/api/reinigungswoche', { cache: 'no-store' })
      if (!res.ok) throw new Error('Server')
      const data = (await res.json()) as ReinigungswocheStore
      if (data.weeks && typeof data.weeks === 'object') {
        setStore(normalizeStoreFromStorage(data))
        hydrateRef.current = true
      } else {
        setStore({ weeks: {} })
      }
    } catch {
      try {
        const ls = localStorage.getItem(LS_FALLBACK_KEY)
        if (ls) {
          const parsed = JSON.parse(ls) as ReinigungswocheStore
          if (parsed?.weeks) setStore(normalizeStoreFromStorage(parsed))
          setLoadError('Server nicht erreichbar – lokale Entwurfskopie wird genutzt (nur dieses Gerät).')
        } else {
          setLoadError(
            'Daten konnten nicht geladen werden. Bitte Tabelle aus sql/create_reinigungswoche_board.sql anlegen.',
          )
          setStore({ weeks: {} })
        }
      } catch {
        setStore({ weeks: {} })
      }
      hydrateRef.current = true
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    fetchStore()
  }, [fetchStore])

  /** Nach Mount ISO-Montag normalisieren (Hydration/TZ, alte lokale Daten) */
  useEffect(() => {
    setWeekMondayIso((iso) => clampReinigungWeekMondayIso(iso))
  }, [])

  /** Debounced Persist */
  useEffect(() => {
    if (!loaded) return
    if (hydrateRef.current) {
      hydrateRef.current = false
      return
    }

    let cancelled = false
    let savedTimer: ReturnType<typeof setTimeout> | undefined
    const t = setTimeout(async () => {
      setSaveState('saving')
      try {
        const body = normalizeStoreFromStorage(cloneStore(store))
        const res = await fetch('/api/reinigungswoche', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error('save')
        if (!cancelled) {
          localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(body))
          setSaveState('saved')
          savedTimer = setTimeout(() => {
            if (!cancelled) setSaveState('idle')
          }, 2000)
        }
      } catch {
        if (!cancelled) {
          setSaveState('error')
          localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(normalizeStoreFromStorage(store)))
        }
      }
    }, 1000)

    return () => {
      cancelled = true
      clearTimeout(t)
      if (savedTimer) clearTimeout(savedTimer)
    }
  }, [store, loaded])

  const mutateWeek = useCallback(
    (updater: (w: ReinigungswocheWeekData) => void) => {
      setStore((prev) => {
        const next = cloneStore(prev)
        const w = normalizeWeekFromStorage(next.weeks[weekMondayIso])
        updater(w)
        next.weeks[weekMondayIso] = w
        return next
      })
    },
    [weekMondayIso],
  )

  const addRow = useCallback(
    (day: DayKey) => {
      mutateWeek((w) => {
        w.aufgaben[day] = [...w.aufgaben[day], newEntry()]
      })
    },
    [mutateWeek],
  )

  const removeRow = useCallback(
    (day: DayKey, id: string) => {
      mutateWeek((w) => {
        w.aufgaben[day] = w.aufgaben[day].filter((r) => r.id !== id)
      })
    },
    [mutateWeek],
  )

  const updateRow = useCallback(
    (day: DayKey, id: string, patch: Partial<ReinigungEntry>) => {
      mutateWeek((w) => {
        w.aufgaben[day] = w.aufgaben[day].map((r) => (r.id === id ? { ...r, ...patch } : r))
      })
    },
    [mutateWeek],
  )

  const setAnwesendeProTag = useCallback(
    (day: DayKey, text: string) => {
      mutateWeek((w) => {
        w.anwesendeMitarbeiterProTag[day] = text
      })
    },
    [mutateWeek],
  )

  const setFachfirmenProTag = useCallback(
    (day: DayKey, text: string) => {
      mutateWeek((w) => {
        w.fachfirmenProTag[day] = text
      })
    },
    [mutateWeek],
  )

  const shiftWeek = useCallback(
    (delta: number) => {
      const cur = parseIsoLocal(weekMondayIso)
      cur.setDate(cur.getDate() + delta * 7)
      const nextMonday = formatIsoLocal(getMonday(cur))
      setWeekMondayIso(clampReinigungWeekMondayIso(nextMonday))
    },
    [weekMondayIso],
  )

  const goCurrentWeek = useCallback(() => {
    setWeekMondayIso(defaultReinigungWeekMondayIso())
  }, [])

  return (
    <div className="min-h-[calc(100vh-6rem)] space-y-4 pb-28">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between xl:gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm touch-manipulation active:scale-[0.98]"
            >
              ← Dashboard
            </Link>
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Reinigung – Wochenplan
          </h1>
          <p className="mt-2 text-base text-gray-800 max-w-2xl leading-relaxed">{REINIGUNGSZEITRAUM_INTRO}</p>
          {loadError && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
              {loadError}
            </div>
          )}
        </div>

        <aside className="relative z-30 w-full shrink-0 xl:max-w-sm xl:sticky xl:top-20">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md space-y-3 pointer-events-auto">
            <div className="text-center px-1">
              <p className="text-sm font-semibold text-gray-900">KW {kwNum}</p>
              <p className="mt-1 text-xs text-gray-600 leading-snug tabular-nums">{weekRangeLabel}</p>
            </div>
            <div className="flex flex-nowrap items-stretch justify-center gap-2">
              <button
                type="button"
                disabled={atMinWeek}
                onClick={() => shiftWeek(-1)}
                className="flex h-14 min-h-[52px] w-14 shrink-0 items-center justify-center rounded-xl border border-gray-300 bg-gray-50 text-2xl font-semibold shadow-sm hover:bg-gray-100 active:bg-gray-200 touch-manipulation disabled:pointer-events-none disabled:opacity-35"
                aria-label="Vorherige Woche"
                title={atMinWeek ? 'Erste Reinigungswoche im Zeitraum' : 'Eine Woche zurück'}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={goCurrentWeek}
                className="min-h-[52px] flex-1 min-w-[10rem] max-w-[16rem] rounded-xl bg-emerald-600 px-4 text-[15px] font-semibold text-white shadow-md hover:bg-emerald-700 active:bg-emerald-800 touch-manipulation"
                title="Springt zur Kalender­woche mit heutigem Datum (begrenzt auf den Reinigungszeitraum 22.6.–9.8.2026)"
              >
                Diese Woche
              </button>
              <button
                type="button"
                disabled={atMaxWeek}
                onClick={() => shiftWeek(1)}
                className="flex h-14 min-h-[52px] w-14 shrink-0 items-center justify-center rounded-xl border border-gray-300 bg-gray-50 text-2xl font-semibold shadow-sm hover:bg-gray-100 active:bg-gray-200 touch-manipulation disabled:pointer-events-none disabled:opacity-35"
                aria-label="Nächste Woche"
                title={atMaxWeek ? 'Letzte Reinigungswoche im Zeitraum' : 'Eine Woche vor'}
              >
                ›
              </button>
            </div>
            <div
              className={`rounded-xl px-3 py-3 text-center text-sm font-medium shadow-inner pointer-events-none ${
                saveState === 'saving'
                  ? 'bg-blue-50 text-blue-800'
                  : saveState === 'saved'
                    ? 'bg-green-50 text-green-800'
                    : saveState === 'error'
                      ? 'bg-red-50 text-red-800'
                      : 'bg-gray-50 text-gray-600'
              }`}
              aria-live="polite"
            >
              {saveState === 'saving' && 'Speichern…'}
              {saveState === 'saved' && 'Gespeichert'}
              {saveState === 'error' &&
                'Speichern am Server fehlgeschlagen – Entwurf lokal zwischengespeichert.'}
              {saveState === 'idle' && 'Änderungen werden automatisch gespeichert'}
            </div>
          </div>
        </aside>
      </div>

      {soloDayKey !== null && (
        <div className="flex flex-wrap items-center justify-center gap-2 pb-1">
          <button
            type="button"
            onClick={() => setSoloDayKey(null)}
            className="min-h-[46px] rounded-xl border-2 border-gray-300 bg-white px-5 text-[15px] font-semibold text-gray-900 shadow-sm hover:bg-gray-50 touch-manipulation"
          >
            Alle Tage
          </button>
          <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Wochentag wählen">
            {DAY_ORDER.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSoloDayKey(d)}
                className={`min-h-[44px] min-w-[44px] rounded-xl px-2 text-[13px] font-bold shadow-sm transition-colors touch-manipulation ${
                  soloDayKey === d
                    ? 'bg-teal-600 text-white ring-2 ring-teal-400 ring-offset-1'
                    : 'border border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100'
                }`}
              >
                {DAY_LABELS_SHORT[d]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mehr-Tage-Ansicht: horizontal scroll; Tagesansicht: nur Breite des Hauptinhalts (kein vw-Breakout – sonst Überlapp mit Sidebar) */}
      <div
        className={
          soloDayKey === null
            ? '-mx-2 px-2 overflow-x-auto touch-pan-x pb-4'
            : 'w-full min-w-0 pb-4'
        }
      >
        <div
          className={
            soloDayKey !== null
              ? 'flex w-full min-w-0 flex-col gap-4'
              : 'grid grid-flow-col auto-cols-[minmax(18rem,1fr)] sm:auto-cols-[minmax(20rem,1fr)] gap-4 min-w-fit xl:grid-flow-dense xl:grid-cols-7 xl:auto-cols-auto xl:min-w-0'
          }
        >
          {(soloDayKey !== null ? [soloDayKey] : DAY_ORDER).map((dayKey) => {
            const idx = DAY_ORDER.indexOf(dayKey)
            const rows = entriesForWeek[dayKey]
            const dateCell = weekDates[idx]
            const dow = DAY_LABELS[dayKey]
            const dowShort = DAY_LABELS_SHORT[dayKey]
            const anwesendeText = anwesendeProTag[dayKey] ?? ''
            const fachfirmenText = fachfirmenAmTag[dayKey] ?? ''

            const doneRatio =
              rows.length === 0 ? 0 : Math.round((rows.filter((r) => r.erledigt).length / rows.length) * 100)

            return (
              <section
                key={dayKey}
                className="flex flex-col rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 shadow-lg shadow-slate-200/50 overflow-hidden ring-1 ring-black/5"
              >
                <header className="sticky top-0 z-10 border-b border-slate-100 bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
                  <button
                    type="button"
                    onClick={() =>
                      setSoloDayKey((prev) => (prev === dayKey ? null : dayKey))
                    }
                    title={
                      soloDayKey === dayKey
                        ? 'Erneut tippen: alle Wochentage anzeigen'
                        : `Nur ${dow} anzeigen`
                    }
                    aria-pressed={soloDayKey === dayKey}
                    className="flex w-full min-h-[52px] items-start justify-between gap-2 px-3 py-3 text-left transition-colors hover:bg-white/10 active:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white touch-manipulation"
                  >
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest opacity-90">{dowShort}</p>
                      <p className="text-lg font-bold leading-tight">{dow}</p>
                      <p className="text-xs opacity-95">
                        {dateCell.toLocaleDateString('de-DE', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                    </div>
                    {rows.length > 0 ? (
                      <div
                        className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-bold tabular-nums"
                        title="Anteil erledigt (Aufgaben)"
                      >
                        {doneRatio}% ✓
                      </div>
                    ) : (
                      <span className="shrink-0 text-xs opacity-80">frei</span>
                    )}
                  </button>
                </header>

                <div className="flex flex-1 flex-col gap-3 p-3">
                  {/* Eigene Spalte/Feld pro Tag: alle Anwesenden */}
                  <div className="rounded-xl border-2 border-amber-200/90 bg-amber-50/90 p-3 shadow-inner">
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wide text-amber-900">
                        Alle an diesem Tag anwesend
                      </span>
                      <textarea
                        value={anwesendeText}
                        onChange={(e) => setAnwesendeProTag(dayKey, e.target.value)}
                        rows={5}
                        placeholder={'z.\u202fB.\u202fMaria M.\nKai K.\n…'}
                        className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-3 text-[16px] text-gray-900 placeholder:text-amber-400/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/40 touch-manipulation"
                      />
                    </label>
                  </div>

                  <div className="rounded-xl border-2 border-violet-200/90 bg-violet-50/90 p-3 shadow-inner">
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wide text-violet-900">
                        Fachfirmen
                      </span>
                      <textarea
                        value={fachfirmenText}
                        onChange={(e) => setFachfirmenProTag(dayKey, e.target.value)}
                        rows={5}
                        placeholder={'Firmen, Ansprechpartner …'}
                        className="mt-1 w-full rounded-xl border border-violet-200 bg-white px-3 py-3 text-[16px] text-gray-900 placeholder:text-violet-400/80 focus:border-violet-500 focus:ring-2 focus:ring-violet-400/40 touch-manipulation"
                      />
                    </label>
                  </div>

                  {rows.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4 px-1">
                      Noch keine Aufgaben – unten einen Eintrag hinzufügen
                    </p>
                  ) : (
                    rows.map((row) => (
                      <article
                        key={row.id}
                        className={`rounded-2xl border-2 bg-white p-3 shadow-sm transition-all ${
                          row.erledigt
                            ? 'border-green-400/70 bg-green-50/40 opacity-95'
                            : 'border-slate-200 hover:border-teal-200'
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-3">
                          <label className="flex flex-shrink-0 items-center gap-2 cursor-pointer mt-1">
                            <input
                              type="checkbox"
                              checked={row.erledigt}
                              onChange={(e) => updateRow(dayKey, row.id, { erledigt: e.target.checked })}
                              className="h-11 w-11 rounded-lg border-2 border-slate-300 text-teal-600 focus:ring-2 focus:ring-teal-500 touch-manipulation"
                            />
                            <span className="text-xs font-semibold uppercase text-slate-500 max-w-[4.5rem] leading-snug">
                              Erledigt
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => removeRow(dayKey, row.id)}
                            className="ml-auto text-sm text-red-600 font-medium px-3 py-2 rounded-lg hover:bg-red-50 min-h-[44px] touch-manipulation"
                          >
                            Löschen
                          </button>
                        </div>
                        <div className="space-y-3">
                          <label className="block">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Tätigkeit
                            </span>
                            <textarea
                              value={row.taetigkeit}
                              onChange={(e) => updateRow(dayKey, row.id, { taetigkeit: e.target.value })}
                              rows={3}
                              placeholder="z. B. Fliesenbereich säubern, Chlor messen …"
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-[16px] text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-400/40 touch-manipulation"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Verantwortlicher Mitarbeiter
                            </span>
                            <textarea
                              value={row.verantwortlicherMitarbeiter}
                              onChange={(e) =>
                                updateRow(dayKey, row.id, { verantwortlicherMitarbeiter: e.target.value })
                              }
                              rows={2}
                              placeholder="Zuständig für diese Aufgabe"
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-[16px] text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-400/40 touch-manipulation"
                            />
                          </label>
                        </div>
                      </article>
                    ))
                  )}

                  <button
                    type="button"
                    onClick={() => addRow(dayKey)}
                    className="mt-auto flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/70 text-teal-800 font-semibold text-[15px] hover:bg-teal-100 hover:border-teal-400 transition-colors touch-manipulation active:scale-[0.99]"
                  >
                    <span className="text-xl leading-none">+</span>
                    Aufgaben-Eintrag hinzufügen
                  </button>
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
