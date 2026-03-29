'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import AgentPageClient from '@/components/agent/AgentPageClient'

export default function AgentPage() {
  const { isAdmin, isLoggedIn, currentUser } = useAuth()
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

  return <AgentPageClient currentUser={currentUser} />
}
