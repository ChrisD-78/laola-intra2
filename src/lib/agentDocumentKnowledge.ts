import { neon } from '@neondatabase/serverless'

export type DocumentMeta = {
  id: string
  title: string
  description: string
  category: string
  fileName: string
  fileUrl: string
}

export type IndexedDocument = DocumentMeta & {
  text: string
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

const TEXT_CACHE_TTL_MS = 30 * 60 * 1000
const textCache = new Map<string, { text: string; builtAt: number }>()

export const KNOWLEDGE_SYSTEM_PROMPT = `Du bist der interne Wissens-Assistent der Stadtholding Landau / Freizeitbad LA OLA.
Du beantwortest Fragen ausschließlich auf Basis der bereitgestellten Auszüge aus PDF-Dokumenten des Intranet-Bereichs „Dokumente“.

Regeln:
- Antworte auf Deutsch, präzise und verständlich.
- Nutze nur Informationen aus den Dokumentenauszügen.
- Nenne am Ende jeder Antwort die Quelle(n) in eckigen Klammern – exakt mit dem Dokumenttitel aus der Kennzeichnung [Dokument: …], z. B. [Hausordnung LA OLA 2026].
- Wurde die Antwort aus mehreren Dokumenten zusammengesetzt, nenne alle relevanten Quellen.
- Wenn die Frage nicht aus den Dokumenten beantwortet werden kann, sage das ehrlich und verweise nicht auf Vermutungen.`

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
    .split(/[^a-zäöüß0-9]+/i)
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

async function extractPdfText(fileUrl: string): Promise<string> {
  const res = await withTimeout(
    fetch(fileUrl, { cache: 'no-store' }),
    20_000,
    'PDF-Download',
  )
  if (!res.ok) {
    throw new Error(`PDF konnte nicht geladen werden (${res.status})`)
  }

  const data = new Uint8Array(await res.arrayBuffer())
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data })
  const result = await withTimeout(parser.getText(), 25_000, 'PDF-Textextraktion')
  return normalizeText(result.text || '')
}

export async function listPdfDocuments(): Promise<DocumentMeta[]> {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error('DATABASE_URL fehlt')
  }

  const sql = neon(dbUrl)
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

export async function getDocumentText(meta: DocumentMeta, origin?: string): Promise<string> {
  const cached = textCache.get(meta.id)
  if (cached && Date.now() - cached.builtAt < TEXT_CACHE_TTL_MS) {
    return cached.text
  }

  const fileUrl = resolveDocumentFileUrl(meta.fileUrl, origin)
  let text = ''

  try {
    text = await extractPdfText(fileUrl)
  } catch (e) {
    console.error(`agent knowledge: PDF-Text für „${meta.title}“`, e)
  }

  if (meta.description) {
    text = text ? `${meta.description}\n\n${text}` : meta.description
  }

  if (text.length > 120_000) {
    text = `${text.slice(0, 120_000)}…`
  }

  if (text) {
    textCache.set(meta.id, { text, builtAt: Date.now() })
  }

  return text
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

export function scoreIndexedDocument(doc: IndexedDocument, query: string): number {
  const metaScore = scoreDocumentMeta(doc, query)
  const terms = tokenize(query)
  if (terms.length === 0) return metaScore

  const bodyLower = doc.text.toLowerCase()
  let bodyScore = 0
  for (const term of terms) {
    if (bodyLower.includes(term)) bodyScore += term.length > 4 ? 4 : 2
  }

  return metaScore + bodyScore
}

export function selectRelevantMeta(docs: DocumentMeta[], query: string, maxDocs = 8): DocumentMeta[] {
  if (docs.length === 0) return []

  const scored = docs
    .map((doc) => ({ doc, score: scoreDocumentMeta(doc, query) }))
    .sort((a, b) => b.score - a.score)

  const withHits = scored.filter((entry) => entry.score > 0).map((entry) => entry.doc)
  if (withHits.length > 0) return withHits.slice(0, maxDocs)

  return docs.slice(0, Math.min(maxDocs, docs.length))
}

export function selectRelevantDocuments(
  docs: IndexedDocument[],
  query: string,
  maxDocs = 6,
): IndexedDocument[] {
  if (docs.length === 0) return []

  const scored = docs
    .map((doc) => ({ doc, score: scoreIndexedDocument(doc, query) }))
    .sort((a, b) => b.score - a.score)

  const withHits = scored.filter((entry) => entry.score > 0).map((entry) => entry.doc)
  if (withHits.length > 0) return withHits.slice(0, maxDocs)

  return docs.slice(0, Math.min(maxDocs, docs.length))
}

export async function loadIndexedDocumentsForQuery(
  query: string,
  origin?: string,
): Promise<IndexedDocument[]> {
  const metas = await listPdfDocuments()
  if (metas.length === 0) return []

  const candidates = selectRelevantMeta(metas, query, 8)
  const indexed: IndexedDocument[] = []

  for (const meta of candidates) {
    const text = await getDocumentText(meta, origin)
    if (!text) continue
    indexed.push({ ...meta, text })
  }

  if (indexed.length === 0) {
    const fallback = metas.slice(0, 4)
    for (const meta of fallback) {
      const text = await getDocumentText(meta, origin)
      if (!text) continue
      indexed.push({ ...meta, text })
    }
  }

  return selectRelevantDocuments(indexed, query)
}

export function buildKnowledgeContext(docs: IndexedDocument[], maxChars = 90_000): string {
  if (docs.length === 0) return '(Keine PDF-Dokumente mit lesbarem Text gefunden.)'

  const perDocBudget = Math.max(4000, Math.floor(maxChars / docs.length))
  const parts: string[] = []
  let used = 0

  for (const doc of docs) {
    const header = `---\n[Dokument: ${doc.title}] (Kategorie: ${doc.category}, Datei: ${doc.fileName})\n`
    const remaining = maxChars - used - header.length
    if (remaining <= 200) break

    const excerpt = doc.text.slice(0, Math.min(perDocBudget, remaining))
    const block = `${header}${excerpt}`
    parts.push(block)
    used += block.length
  }

  return parts.join('\n\n')
}

export function invalidateDocumentIndex(): void {
  textCache.clear()
}
