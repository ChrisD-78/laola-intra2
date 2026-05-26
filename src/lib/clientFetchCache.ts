/**
 * Kurzfristiger In-Memory-Cache für wiederholte identische Browser-GETs
 * auf dieselbe Origin-URL (reduziert doppelte API-Hits ohne Serveränderung).
 */
const store = new Map<string, { exp: number; data: unknown }>()

/** Cache ungültig machen z. B. nach Mutationen zum selben Pfadprefix */
export function invalidateClientFetchCache(urlOrExact: string): void {
  const keys = [...store.keys()]
  for (const k of keys) {
    if (k === urlOrExact || k.startsWith(urlOrExact)) store.delete(k)
  }
}

export async function fetchJsonGETCached<T>(url: string, ttlMs: number): Promise<T> {
  const now = Date.now()
  const hit = store.get(url)
  if (hit && hit.exp > now) return hit.data as T

  const response = await fetch(url, { method: 'GET', cache: 'no-store' })
  if (!response.ok) throw new Error(`GET ${url} failed: ${response.status}`)
  const data = (await response.json()) as T
  store.set(url, { exp: now + ttlMs, data })
  return data
}
