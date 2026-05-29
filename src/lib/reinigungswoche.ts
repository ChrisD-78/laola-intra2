export type DayKey = 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa' | 'so'

export const DAY_ORDER: DayKey[] = ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so']

export const DAY_LABELS: Record<DayKey, string> = {
  mo: 'Montag',
  di: 'Dienstag',
  mi: 'Mittwoch',
  do: 'Donnerstag',
  fr: 'Freitag',
  sa: 'Samstag',
  so: 'Sonntag',
}

export const DAY_LABELS_SHORT: Record<DayKey, string> = {
  mo: 'Mo',
  di: 'Di',
  mi: 'Mi',
  do: 'Do',
  fr: 'Fr',
  sa: 'Sa',
  so: 'So',
}

export interface ReinigungEntry {
  id: string
  taetigkeit: string
  /** Zuständigkeit für diese konkrete Aufgabe */
  verantwortlicherMitarbeiter: string
  erledigt: boolean
}

/** Eintrag in den Wochenlisten Bestellungen / Aufgaben (oben) */
export interface ReinigungListenEintrag {
  id: string
  inhalt: string
  mitarbeiter: string
}

/** Eine Kalenderwoche (Schlüssel in store.weeks = ISO-Montag) */
export interface ReinigungswocheWeekData {
  aufgaben: Record<DayKey, ReinigungEntry[]>
  /** Fachfirmen pro Tag */
  fachfirmenProTag: Record<DayKey, string>
  /** Wochenliste: Bestellungen */
  bestellungen: ReinigungListenEintrag[]
  /** Wochenliste: allgemeine Aufgaben (nicht die Tages-Aufgaben im Plan) */
  wochenAufgaben: ReinigungListenEintrag[]
  /** @deprecated Nicht mehr in der UI – bleibt für alte gespeicherte Daten */
  anwesendeMitarbeiterProTag?: Record<DayKey, string>
}

export interface ReinigungswocheStore {
  weeks: Record<string, ReinigungswocheWeekData>
}

export function emptyDayMap(): Record<DayKey, ReinigungEntry[]> {
  return {
    mo: [],
    di: [],
    mi: [],
    do: [],
    fr: [],
    sa: [],
    so: [],
  }
}

export function emptyAnwesendeProTag(): Record<DayKey, string> {
  return emptyStringsPerDay()
}

export function emptyFachfirmenProTag(): Record<DayKey, string> {
  return emptyStringsPerDay()
}

function emptyStringsPerDay(): Record<DayKey, string> {
  return {
    mo: '',
    di: '',
    mi: '',
    do: '',
    fr: '',
    sa: '',
    so: '',
  }
}

export function newEntry(): ReinigungEntry {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  return {
    id,
    taetigkeit: '',
    verantwortlicherMitarbeiter: '',
    erledigt: false,
  }
}

export function newListenEintrag(mitarbeiter = ''): ReinigungListenEintrag {
  return {
    id: newEntry().id,
    inhalt: '',
    mitarbeiter,
  }
}

function ensureListenEintragShape(e: unknown): ReinigungListenEintrag {
  const o = (e || {}) as Record<string, unknown>
  return {
    id: String(o.id ?? newEntry().id),
    inhalt: String(o.inhalt ?? o.text ?? o.beschreibung ?? ''),
    mitarbeiter: String(o.mitarbeiter ?? o.eingetragenVon ?? ''),
  }
}

function ensureListenArray(src: unknown): ReinigungListenEintrag[] {
  if (!Array.isArray(src)) return []
  return src.map((row) => ensureListenEintragShape(row))
}

function ensureEntryShape(e: unknown): ReinigungEntry {
  const o = (e || {}) as Record<string, unknown>
  const vm = String(o.verantwortlicherMitarbeiter ?? o.mitarbeiter ?? '')
  return {
    id: String(o.id ?? newEntry().id),
    taetigkeit: String(o.taetigkeit ?? ''),
    verantwortlicherMitarbeiter: vm,
    erledigt: !!o.erledigt,
  }
}

/** Vor der Normalisierung: Fachfirmen aus alten Aufgabenzeilen übernehmen */
function migrateFachfirmenFromRawDayRows(dayRowsUnknown: unknown): string {
  if (!Array.isArray(dayRowsUnknown)) return ''
  const lines = new Set<string>()
  for (const row of dayRowsUnknown) {
    const f = String((row as Record<string, unknown>)?.fachfirmen ?? '').trim()
    if (f) lines.add(f)
  }
  return [...lines].join('\n')
}

function ensureAufgabenShape(src: unknown): Record<DayKey, ReinigungEntry[]> {
  const base = emptyDayMap()
  if (!src || typeof src !== 'object') return base
  const o = src as Record<string, unknown>
  for (const d of DAY_ORDER) {
    if (Array.isArray(o[d])) {
      base[d] = o[d].map((row) => ensureEntryShape(row))
    }
  }
  return base
}

/** Akzeptiert neues Format { aufgaben, anwesende…, fachfirmen… } oder Legacy nur Aufgaben-Map */
export function normalizeWeekFromStorage(raw: unknown): ReinigungswocheWeekData {
  const emptyAufgaben = emptyDayMap()
  const emptyFf = emptyFachfirmenProTag()

  const buildResult = (
    aufgaben: Record<DayKey, ReinigungEntry[]>,
    aufgabenSource: Record<string, unknown>,
    ffFromFile: Record<DayKey, string>,
    bestellungen: ReinigungListenEintrag[],
    wochenAufgaben: ReinigungListenEintrag[],
  ): ReinigungswocheWeekData => {
    const ff = { ...emptyFf }
    for (const d of DAY_ORDER) {
      const saved = String(ffFromFile[d] ?? '').trim()
      if (saved) {
        ff[d] = ffFromFile[d]
      } else {
        const migrated = migrateFachfirmenFromRawDayRows(aufgabenSource[d])
        ff[d] = migrated
      }
    }
    return { aufgaben, fachfirmenProTag: ff, bestellungen, wochenAufgaben }
  }

  if (!raw || typeof raw !== 'object') {
    return buildResult(emptyAufgaben, {}, emptyFf, [], [])
  }

  const o = raw as Record<string, unknown>

  if (o.aufgaben && typeof o.aufgaben === 'object') {
    const aufgabenSource = o.aufgaben as Record<string, unknown>
    const aufgaben = ensureAufgabenShape(aufgabenSource)
    const ffFromFile = { ...emptyFf }
    const fp = o.fachfirmenProTag
    if (fp && typeof fp === 'object') {
      for (const d of DAY_ORDER) {
        ffFromFile[d] = String((fp as Record<string, unknown>)[d] ?? '')
      }
    }
    return buildResult(
      aufgaben,
      aufgabenSource,
      ffFromFile,
      ensureListenArray(o.bestellungen),
      ensureListenArray(o.wochenAufgaben),
    )
  }

  const hasLegacyArrays = DAY_ORDER.some((d) => Array.isArray(o[d]))
  if (hasLegacyArrays) {
    const aufgabenSource = o
    const aufgaben = ensureAufgabenShape(raw)
    return buildResult(aufgaben, aufgabenSource, emptyFf, [], [])
  }

  return buildResult(emptyAufgaben, {}, emptyFf, [], [])
}

export function normalizeStoreFromStorage(store: ReinigungswocheStore | null | undefined): ReinigungswocheStore {
  const weeks: Record<string, ReinigungswocheWeekData> = {}
  const src = store?.weeks
  if (src && typeof src === 'object') {
    for (const [k, v] of Object.entries(src)) {
      weeks[k] = normalizeWeekFromStorage(v)
    }
  }
  return { weeks }
}

/** Montag 00:00 lokal zurückgeben */
export function getMonday(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const day = x.getDay() // 0 So .. 6 Sa
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  return x
}

export function formatIsoLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseIsoLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setHours(0, 0, 0, 0)
  return dt
}

/** Gültiger Reinigungs-Kalender 2026: nur Wochen in diesem Zeitraum wählbar */
export const REINIGUNGSZEITRAUM_2026 = {
  vonIso: '2026-06-22',
  bisIso: '2026-08-09',
} as const

/** Hinweistext unter der Überschrift – ersetzt die frühere KW-/Hilfezeilen */
export const REINIGUNGSZEITRAUM_INTRO =
  'Reinigungswochen 2026 im Zeitraum 22.6. – 9.8.2026 im Kalender — die Kalender­wochen sollen auch nur in diesem Bereich Anwendung finden.'

function compareIsoDates(aIso: string, bIso: string): number {
  return parseIsoLocal(aIso).getTime() - parseIsoLocal(bIso).getTime()
}

export function areIsoWeekMondaysEqual(aIso: string, bIso: string): boolean {
  return compareIsoDates(aIso.trim(), bIso.trim()) === 0
}

export function formatReinigungWeekRangeDe(weekMondayIso: string): string {
  const start = parseIsoLocal(weekMondayIso.trim())
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
  return `${start.toLocaleDateString('de-DE', opts)} – ${end.toLocaleDateString('de-DE', opts)}`
}

/** Kleinster auswählbarer Montag (Woche der ersten Kalendertagen) */
export function getReinigungMinWeekMondayIso(): string {
  return formatIsoLocal(getMonday(parseIsoLocal(REINIGUNGSZEITRAUM_2026.vonIso)))
}

/** Größter auswählbarer Montag (Woche des letzten Kalendertags) */
export function getReinigungMaxWeekMondayIso(): string {
  return formatIsoLocal(getMonday(parseIsoLocal(REINIGUNGSZEITRAUM_2026.bisIso)))
}

export function clampReinigungWeekMondayIso(weekMondayIso: string): string {
  const iso = weekMondayIso.trim()
  const min = getReinigungMinWeekMondayIso()
  const max = getReinigungMaxWeekMondayIso()
  if (compareIsoDates(iso, min) < 0) return min
  if (compareIsoDates(iso, max) > 0) return max
  return iso
}

/** Startwoche: Kalender­woche mit heutigem Datum, begrenzt auf den Reinigungszeitraum */
export function defaultReinigungWeekMondayIso(): string {
  return clampReinigungWeekMondayIso(formatIsoLocal(getMonday(new Date())))
}

/** ISO-Kalenderwoche (KW) Deutschlands üblich ISO 8601 */
export function getIsoWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { week, year: d.getUTCFullYear() }
}
