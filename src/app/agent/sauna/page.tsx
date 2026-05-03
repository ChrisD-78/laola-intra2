'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function AgentSaunaPage() {
  const { isAdmin, isLoggedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoggedIn && !isAdmin) {
      router.replace('/')
    }
  }, [isLoggedIn, isAdmin, router])

  if (!isLoggedIn) {
    return null
  }

  if (!isAdmin) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8 text-center text-gray-600">
        Diese Seite ist nur für <strong>Administratoren</strong> sichtbar.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-amber-900/70 rounded-2xl shadow-xl p-6 lg:p-10 text-white text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 20% 0%, rgba(201,169,97,0.35) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(45,95,95,0.4) 0%, transparent 50%)',
          }}
        />
        <div className="relative">
          <p className="text-[11px] tracking-[0.35em] uppercase text-amber-200/90 mb-2">Agent</p>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Sauna · Aufgussplan</h1>
          <p className="text-sm text-white/85 mt-2 max-w-xl mx-auto leading-relaxed">
            Verwaltung im Intranet (nur Admins). Speichern synchronisiert mit{' '}
            <strong className="text-amber-100">Neon</strong> (
            <code className="text-xs bg-black/25 px-1 rounded">sauna_aufguss_snapshot</code>
            ).
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-amber-50/40 px-4 py-3 text-sm text-amber-950">
        <strong>Neon:</strong> SQL-Datei{' '}
        <code className="text-xs bg-white/80 px-1 rounded">sql/create_sauna_aufguss_snapshot.sql</code> einmal ausführen.
        Nach dem ersten Speichern im Admin-Editor ist der Plan für Display/Gäste lesbar.
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-950 overflow-hidden shadow-inner">
        <iframe
          title="Sauna Aufgussplan – Verwaltung"
          src="/sauna/admin.html"
          className="w-full min-h-[88vh] border-0 bg-[#0e1a20]"
        />
      </div>
    </div>
  )
}
