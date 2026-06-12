// Zeitgesteuerte Netlify-Funktion: erstellt jeden Morgen das KI-Briefing
// auf dem Dashboard (ruft die Next.js-API-Route der eigenen Site auf).
// Zeitplan: 04:30 UTC = 06:30 deutscher Sommerzeit (05:30 im Winter).

export default async () => {
  const base = process.env.URL
  if (!base) {
    return new Response('URL env fehlt', { status: 500 })
  }
  const res = await fetch(`${base}/api/agent/briefing`, {
    method: 'POST',
    headers: { 'x-cron-key': process.env.AGENT_CRON_SECRET || '' },
  })
  const text = await res.text()
  console.log('daily-briefing:', res.status, text.slice(0, 200))
  return new Response(res.ok ? 'ok' : `Fehler: ${res.status}`, { status: res.ok ? 200 : 500 })
}

export const config = {
  schedule: '30 4 * * *',
}
