import { neon } from '@neondatabase/serverless'
import { PDFParse } from 'pdf-parse'

export type IndexedDocument = {
  id: string
  title: string
  description: string
  category: string
  fileName: string
  fileUrl: string
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

const INDEX_TTL_MS = 15 * 60 * 1000
let cachedIndex: { docs: IndexedDocument[]; builtAt: number } | null = null

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

async function extractPdfText(fileUrl: string): Promise<string> {
  const res = await fetch(fileUrl, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`PDF konnte nicht geladen werden (${res.status})`)
  }
  const data = new Uint8Array(await res.arrayBuffer())
  const parser = new PDFParse({ data })
  const result = await parser.getText()
  return normalizeText(result.text || '')
}

export async function buildDocumentIndex(origin?: string): Promise<IndexedDocument[]> {
  if (cachedIndex && Date.now() - cachedIndex.builtAt < INDEX_TTL_MS) {
    return cachedIndex.docs
  }

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

  const docs: IndexedDocument[] = []

  for (const row of rows.filter(isPdfDocument)) {
    if (!row.file_url) continue

    const fileUrl = resolveDocumentFileUrl(row.file_url, origin)
    const description = (row.description || '').trim()
    let text = ''

    try {
      text = await extractPdfText(fileUrl)
    } catch (e) {
      console.error(`agent knowledge: PDF-Text für „${row.title}“`, e)
    }

    if (description) {
      text = text ? `${description}\n\n${text}` : description
    }

    if (!text) continue

    if (text.length > 120_000) {
      text = `${text.slice(0, 120_000)}…`
    }

    docs.push({
      id: row.id,
      title: row.title,
      description,
      category: row.category,
      fileName: row.file_name,
      fileUrl: row.file_url,
      text,
    })
  }

  cachedIndex = { docs, builtAt: Date.now() }
  return docs
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 2)
}

export function scoreDocument(doc: IndexedDocument, query: string): number {
  const terms = tokenize(query)
  if (terms.length === 0) return 0

  const titleLower = doc.title.toLowerCase()
  const haystack = `${doc.title} ${doc.category} ${doc.description} ${doc.text}`.toLowerCase()
  let score = 0

  for (const term of terms) {
    if (titleLower.includes(term)) score += 8
    if (haystack.includes(term)) score += term.length > 4 ? 3 : 1
  }

  return score
}

export function selectRelevantDocuments(
  docs: IndexedDocument[],
  query: string,
  maxDocs = 6,
): IndexedDocument[] {
  if (docs.length === 0) return []

  const scored = docs
    .map((doc) => ({ doc, score: scoreDocument(doc, query) }))
    .sort((a, b) => b.score - a.score)

  const withHits = scored.filter((entry) => entry.score > 0).map((entry) => entry.doc)
  if (withHits.length > 0) return withHits.slice(0, maxDocs)

  return docs.slice(0, Math.min(maxDocs, docs.length))
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
  cachedIndex = null
}
