import { NextResponse } from 'next/server'

/**
 * CDN (s-maxage) + Browser-Caching für identische öffentliche GET-Antworten.
 * Bei Netlify weniger wiederholte Function-Ausführungen bei Cache-Hits.
 */
export const CACHE_HEADER = {
  /** VAPID public key ändert sich praktisch nie */
  vapidPublic: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
  quizListAgg: 'public, s-maxage=60, stale-while-revalidate=300',
  quizDetailQuestions: 'public, s-maxage=120, stale-while-revalidate=600',
  quizLeaderboard: 'public, s-maxage=30, stale-while-revalidate=120',
  generalList: 'public, s-maxage=45, stale-while-revalidate=180',
  dashboardBullets: 'public, s-maxage=30, stale-while-revalidate=120',
  chatParticipantMeta: 'public, s-maxage=20, stale-while-revalidate=60',
  saunaDisplay: 'public, s-maxage=15, stale-while-revalidate=60',
} as const

export function jsonCache<T>(data: T, cacheControl: string, init?: { status?: number }) {
  return NextResponse.json(data, {
    status: init?.status,
    headers: { 'Cache-Control': cacheControl },
  })
}

/** Leser-spezifisch / keine Geteilte CDN-Caches */
export const NO_STORE_PRIVATE = 'private, no-store, max-age=0'
