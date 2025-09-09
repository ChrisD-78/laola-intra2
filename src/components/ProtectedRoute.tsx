'use client'

import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  // Wenn nicht angemeldet, nichts anzeigen (wird zur Login-Seite weitergeleitet)
  if (!isLoggedIn) {
    return null
  }

  // Wenn angemeldet, Kinder-Komponenten anzeigen
  return <>{children}</>
}

export default ProtectedRoute
