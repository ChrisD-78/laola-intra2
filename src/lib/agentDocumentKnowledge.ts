import { neon } from '@neondatabase/serverless'

export type DocumentMeta = {
  id: string
  title: string
  description: string
  category: string
  fileName: string
  fileUrl: string
}

export type DocumentPage = {
  num: number
  text: string
}

export type DocumentChunk = {
  doc: DocumentMeta
  page: number
  text: string
  score: number
}

type DocumentRow = {
  id: string
  title: string
  description: string | null
  category: string
  file_name: string
  file_type: string
  file_url: string | null
}

type CacheRow = {
  document_id: string
  file_url: string
  pages: DocumentPage[]
}

const TEXT_CACHE_TTL_MS = 30 * 60 * 1000
const MAX_PAGE_TEXT_CHARS = 20_000
const CHUNK_CHARS = 1500
const memoryCache = new Map<string, { fileUrl: string; pages: DocumentPage[]; builtAt: number }>()
let cacheTableReady = false

export const KNOWLEDGE_SYSTEM_PROMPT = `Du bist der interne Wissens-Assistent der Stadtholding Landau / Freizeitbad LA OLA.
Du beantwortest Fragen ausschließlich auf Basis der bereitgestellten Auszüge aus PDF-Dokumenten des Intranet-Bereichs „Dokumente“.

Regeln:
- Antworte auf Deutsch, präzise und verständlich.
- Sprich die Mitarbeiterin / den Mitarbeiter immer in der Du-Form an – freundlich und kollegial, nie „Sie“.
- Nutze nur Informationen aus den Dokumentenauszügen. Erfinde nichts dazu.
- Nenne am Ende jeder Antwort die Quelle(n) in eckigen Klammern mit Dokumenttitel und Seite, exakt wie in der Kennzeichnung [Dokument: … | Seite …], z. B. [Hausordnung LA OLA, S. 4]. Bei mehreren Quellen nenne alle.
- Beantworten die Auszüge die Frage nur teilweise: Gib die Teilantwort mit Quellen und sage klar, welche Information fehlt.
- Ist die Frage unklar, zu allgemein oder in den Dokumenten nicht zu finden: Stelle eine konkrete Rückfrage, welche Angabe du brauchst (z. B. welcher Bereich, welches Dokument, welcher Zeitraum, welche Anlage), statt zu raten.
- Verweise nie auf Wissen außerhalb der Dokumente.`

function getSql() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error('DATABASE_URL fehlt')
  }
  return neon(dbUrl)
}

export function resolveDocumentFileUrl(fileUrl: string, origin?: string): string {
  const trimmed = fileUrl.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed

  const envBase =
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
  const base = origin || envBase
  if (!base) return trimmed

  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${normalizedBase}${path}`
}

function isPdfDocument(row: DocumentRow): boolean {
  const type = (row.file_type || '').toLowerCase()
  const name = (row.file_name || '').toLowerCase()
  return type.includes('pdf') || name.endsWith('.pdf')
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-zäöüß0-9-]+/i)
    .filter((t) => t.length > 2)
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} (Timeout nach ${ms}ms)`)), ms)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

async function extractPdfPages(fileUrl: string): Promise<DocumentPage[]> {
  const res = await withTimeout(fetch(fileUrl, { cache: 'no-store' }), 15_000, 'PDF-Download')
  if (!res.ok) {
    throw new Error(`PDF konnte nicht geladen werden (${res.status})`)
  }

  const data = new Uint8Array(await res.arrayBuffer())
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data })
  const result = await withTimeout(parser.getText(), 25_000, 'PDF-Textextraktion')

  const pages: DocumentPage[] = []
  for (const page of result.pages || []) {
    const text = normalizeText(page.text || '').slice(0, MAX_PAGE_TEXT_CHARS)
    if (text) pages.push({ num: page.num, text })
  }

  // Fallback: kein seitenweises Ergebnis, aber Gesamttext vorhanden
  if (pages.length === 0) {
    const text = normalizeText(result.text || '').slice(0, MAX_PAGE_TEXT_CHARS * 6)
    if (text) pages.push({ num: 1, text })
  }

  return pages
}

async function ensureCacheTable(): Promise<void> {
  if (cacheTableReady) return
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS agent_document_text_cache (
      document_id UUID PRIMARY KEY,
      file_url TEXT NOT NULL,
      pages JSONB NOT NULL,
      extracted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  cacheTableReady = true
}

async function loadCachedPagesFromDb(ids: string[]): Promise<Map<string, CacheRow>> {
  const result = new Map<string, CacheRow>()
  if (ids.length === 0) return result
  await ensureCacheTable()
  const sql = getSql()
  const rows = (await sql`
    SELECT document_id, file_url, pages
    FROM agent_document_text_cache
    WHERE document_id = ANY(${ids}::uuid[])
  `) as CacheRow[]
  for (const row of rows) {
    result.set(row.document_id, row)
  }
  return result
}

async function savePagesToDb(meta: DocumentMeta, pages: DocumentPage[]): Promise<void> {
  await ensureCacheTable()
  const sql = getSql()
  await sql`
    INSERT INTO agent_document_text_cache (document_id, file_url, pages, extracted_at)
    VALUES (${meta.id}::uuid, ${meta.fileUrl}, ${JSON.stringify(pages)}::jsonb, NOW())
    ON CONFLICT (document_id)
    DO UPDATE SET file_url = EXCLUDED.file_url, pages = EXCLUDED.pages, extracted_at = NOW()
  `
}

export async function deleteDocumentTextCache(documentId: string): Promise<void> {
  memoryCache.delete(documentId)
  try {
    await ensureCacheTable()
    const sql = getSql()
    await sql`DELETE FROM agent_document_text_cache WHERE document_id = ${documentId}::uuid`
  } catch (e) {
    console.error('agent knowledge: Text-Cache löschen', e)
  }
}

export async function listPdfDocuments(): Promise<DocumentMeta[]> {
  const sql = getSql()
  const rows = (await sql`
    SELECT id, title, description, category, file_name, file_type, file_url
    FROM documents
    ORDER BY uploaded_at DESC
  `) as DocumentRow[]

  return rows
    .filter(isPdfDocument)
    .filter((row) => Boolean(row.file_url))
    .map((row) => ({
      id: row.id,
      title: row.title,
      description: (row.description || '').trim(),
      category: row.category,
      fileName: row.file_name,
      fileUrl: row.file_url!,
    }))
}

/**
 * Liefert die Seiten eines Dokuments: erst Speicher-Cache, dann DB-Cache,
 * sonst frische Extraktion (Ergebnis wird in beiden Caches abgelegt).
 */
export async function getDocumentPages(
  meta: DocumentMeta,
  origin?: string,
  options?: { extractIfMissing?: boolean; dbCache?: Map<string, CacheRow> },
): Promise<DocumentPage[] | null> {
  const cached = memoryCache.get(meta.id)
  if (cached && cached.fileUrl === meta.fileUrl && Date.now() - cached.builtAt < TEXT_CACHE_TTL_MS) {
    return cached.pages
  }

  const dbCache = options?.dbCache ?? (await loadCachedPagesFromDb([meta.id]))
  const dbRow = dbCache.get(meta.id)
  if (dbRow && dbRow.file_url === meta.fileUrl && Array.isArray(dbRow.pages) && dbRow.pages.length > 0) {
    memoryCache.set(meta.id, { fileUrl: meta.fileUrl, pages: dbRow.pages, builtAt: Date.now() })
    return dbRow.pages
  }

  if (options?.extractIfMissing === false) return null

  const fileUrl = resolveDocumentFileUrl(meta.fileUrl, origin)
  let pages: DocumentPage[] = []
  try {
    pages = await extractPdfPages(fileUrl)
  } catch (e) {
    console.error(`agent knowledge: PDF-Text für „${meta.title}“`, e)
    return null
  }

  if (pages.length === 0 && meta.description) {
    pages = [{ num: 1, text: meta.description }]
  }
  if (pages.length === 0) return null

  memoryCache.set(meta.id, { fileUrl: meta.fileUrl, pages, builtAt: Date.now() })
  try {
    await savePagesToDb(meta, pages)
  } catch (e) {
    console.error(`agent knowledge: Text-Cache speichern für „${meta.title}“`, e)
  }

  return pages
}

export function scoreDocumentMeta(meta: DocumentMeta, query: string): number {
  const terms = tokenize(query)
  if (terms.length === 0) return 0

  const titleLower = meta.title.toLowerCase()
  const haystack = `${meta.title} ${meta.category} ${meta.description} ${meta.fileName}`.toLowerCase()
  let score = 0

  for (const term of terms) {
    if (titleLower.includes(term)) score += 8
    if (haystack.includes(term)) score += term.length > 4 ? 3 : 1
  }

  return score
}

export function selectRelevantMeta(docs: DocumentMeta[], query: string, maxDocs = 8): DocumentMeta[] {
  if (docs.length === 0) return []

  const scored = docs
    .map((doc) => ({ doc, score: scoreDocumentMeta(doc, query) }))
    .sort((a, b) => b.score - a.score)

  const withHits = scored.filter((entry) => entry.score > 0).map((entry) => entry.doc)
  if (withHits.length >= maxDocs) return withHits.slice(0, maxDocs)

  // Treffer zuerst, Rest in Upload-Reihenfolge auffüllen
  const rest = docs.filter((doc) => !withHits.includes(doc))
  return [...withHits, ...rest].slice(0, maxDocs)
}

function splitIntoChunks(text: string): string[] {
  if (text.length <= CHUNK_CHARS) return [text]
  const chunks: string[] = []
  let rest = text
  while (rest.length > 0) {
    if (rest.length <= CHUNK_CHARS) {
      chunks.push(rest)
      break
    }
    let cut = rest.lastIndexOf('. ', CHUNK_CHARS)
    if (cut < CHUNK_CHARS * 0.5) cut = rest.lastIndexOf(' ', CHUNK_CHARS)
    if (cut < CHUNK_CHARS * 0.5) cut = CHUNK_CHARS
    chunks.push(rest.slice(0, cut + 1).trim())
    rest = rest.slice(cut + 1).trim()
  }
  return chunks.filter(Boolean)
}

function scoreChunkText(text: string, terms: string[]): number {
  if (terms.length === 0) return 0
  const lower = text.toLowerCase()
  let score = 0
  for (const term of terms) {
    let idx = lower.indexOf(term)
    let hits = 0
    while (idx !== -1 && hits < 4) {
      hits += 1
      idx = lower.indexOf(term, idx + term.length)
    }
    score += hits * (term.length > 4 ? 3 : 1.5)
  }
  return score
}

export function buildDocumentChunks(
  meta: DocumentMeta,
  pages: DocumentPage[],
  query: string,
): DocumentChunk[] {
  const terms = tokenize(query)
  const metaBonus = Math.min(scoreDocumentMeta(meta, query), 10) * 0.5
  const chunks: DocumentChunk[] = []
  for (const page of pages) {
    for (const piece of splitIntoChunks(page.text)) {
      chunks.push({
        doc: meta,
        page: page.num,
        text: piece,
        score: scoreChunkText(piece, terms) + metaBonus,
      })
    }
  }
  return chunks
}

export type KnowledgeContextResult = {
  context: string
  sources: { title: string; pages: number[]; fileUrl: string }[]
}

/**
 * Wählt die relevantesten Chunks aus und baut daraus den Kontext für die KI.
 * Liefert zusätzlich die verwendeten Quellen (Titel + Seiten).
 */
export function buildKnowledgeContext(
  allChunks: DocumentChunk[],
  maxChars = 28_000,
  maxChunks = 16,
): KnowledgeContextResult {
  if (allChunks.length === 0) {
    return { context: '(Keine PDF-Dokumente mit lesbarem Text gefunden.)', sources: [] }
  }

  const sorted = [...allChunks].sort((a, b) => b.score - a.score)
  const hasHits = sorted[0].score > 0

  let selected: DocumentChunk[]
  if (hasHits) {
    selected = []
    let used = 0
    for (const chunk of sorted) {
      if (selected.length >= maxChunks) break
      if (chunk.score <= 0 && selected.length >= 4) break
      if (used + chunk.text.length > maxChars) continue
      selected.push(chunk)
      used += chunk.text.length
    }
  } else {
    // Keine Stichwort-Treffer: erste Chunks je Dokument als Überblick
    const seen = new Map<string, number>()
    selected = []
    let used = 0
    for (const chunk of allChunks) {
      const count = seen.get(chunk.doc.id) || 0
      if (count >= 2) continue
      if (used + chunk.text.length > maxChars) break
      seen.set(chunk.doc.id, count + 1)
      selected.push(chunk)
      used += chunk.text.length
    }
  }

  // Für lesbaren Kontext nach Dokument und Seite ordnen
  selected.sort((a, b) =>
    a.doc.id === b.doc.id ? a.page - b.page : a.doc.title.localeCompare(b.doc.title),
  )

  const parts: string[] = []
  const sourceMap = new Map<string, { pages: Set<number>; fileUrl: string }>()
  for (const chunk of selected) {
    parts.push(
      `---\n[Dokument: ${chunk.doc.title} | Kategorie: ${chunk.doc.category} | Datei: ${chunk.doc.fileName} | Seite ${chunk.page}]\n${chunk.text}`,
    )
    if (!sourceMap.has(chunk.doc.title)) {
      sourceMap.set(chunk.doc.title, { pages: new Set(), fileUrl: chunk.doc.fileUrl })
    }
    sourceMap.get(chunk.doc.title)!.pages.add(chunk.page)
  }

  return {
    context: parts.join('\n\n'),
    sources: [...sourceMap.entries()].map(([title, entry]) => ({
      title,
      pages: [...entry.pages].sort((a, b) => a - b),
      fileUrl: entry.fileUrl,
    })),
  }
}

export type KnowledgeLoadResult = {
  chunks: DocumentChunk[]
  loadedDocs: DocumentMeta[]
  skippedDocs: DocumentMeta[]
  totalDocs: number
}

/**
 * Lädt die für die Frage relevanten Dokumente (Cache zuerst) und baut Chunks.
 * Frische PDF-Extraktionen laufen nur bis zum Zeitbudget – der Rest wird
 * übersprungen und beim nächsten Aufruf bzw. per Warm-up nachgeholt.
 */
export async function loadKnowledgeForQuery(
  query: string,
  origin?: string,
  timeBudgetMs = 16_000,
): Promise<KnowledgeLoadResult> {
  const metas = await listPdfDocuments()
  if (metas.length === 0) {
    return { chunks: [], loadedDocs: [], skippedDocs: [], totalDocs: 0 }
  }

  const candidates = selectRelevantMeta(metas, query, 8)
  const dbCache = await loadCachedPagesFromDb(candidates.map((m) => m.id))
  const deadline = Date.now() + timeBudgetMs

  const chunks: DocumentChunk[] = []
  const loadedDocs: DocumentMeta[] = []
  const skippedDocs: DocumentMeta[] = []

  // 1. Durchgang: nur Cache (schnell), 2. Durchgang: Extraktion bis Zeitbudget
  const uncached: DocumentMeta[] = []
  for (const meta of candidates) {
    const pages = await getDocumentPages(meta, origin, { extractIfMissing: false, dbCache })
    if (pages) {
      loadedDocs.push(meta)
      chunks.push(...buildDocumentChunks(meta, pages, query))
    } else {
      uncached.push(meta)
    }
  }

  for (const meta of uncached) {
    if (Date.now() > deadline) {
      skippedDocs.push(meta)
      continue
    }
    const pages = await getDocumentPages(meta, origin, { dbCache })
    if (pages) {
      loadedDocs.push(meta)
      chunks.push(...buildDocumentChunks(meta, pages, query))
    } else {
      skippedDocs.push(meta)
    }
  }

  return { chunks, loadedDocs, skippedDocs, totalDocs: metas.length }
}

export type WarmupResult = {
  total: number
  indexed: number
  remaining: number
}

/**
 * Indexiert bis zu `batchSize` noch nicht gecachte PDFs (für Warm-up-Aufrufe
 * aus dem Frontend, damit die erste Chat-Frage schnell beantwortet wird).
 */
export async function warmDocumentIndex(origin?: string, batchSize = 2): Promise<WarmupResult> {
  const metas = await listPdfDocuments()
  if (metas.length === 0) return { total: 0, indexed: 0, remaining: 0 }

  const dbCache = await loadCachedPagesFromDb(metas.map((m) => m.id))
  const uncached = metas.filter((meta) => {
    const row = dbCache.get(meta.id)
    return !(row && row.file_url === meta.fileUrl && Array.isArray(row.pages) && row.pages.length > 0)
  })

  let extracted = 0
  for (const meta of uncached.slice(0, batchSize)) {
    const pages = await getDocumentPages(meta, origin, { dbCache })
    if (pages) extracted += 1
  }

  const remaining = Math.max(uncached.length - extracted, 0)
  return { total: metas.length, indexed: metas.length - remaining, remaining }
}

export function invalidateDocumentIndex(): void {
  memoryCache.clear()
}
