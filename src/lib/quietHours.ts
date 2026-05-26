/**
 * Zwischen 23:00 und 06:00 (lokale Rechnerzeit) kein automatisches Nachladen/Polling.
 */
export function isAutoRefreshPausedLocal(): boolean {
  const h = new Date().getHours()
  return h >= 23 || h < 6
}
