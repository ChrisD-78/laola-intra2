'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Sidebar from '@/components/Sidebar'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Wenn nicht angemeldet und nicht auf der Login-Seite, zur Login-Seite weiterleiten
    if (!isLoggedIn && pathname !== '/login') {
      router.push('/login')
    }
  }, [isLoggedIn, pathname, router])

  // Wenn auf der Login-Seite, nur den Inhalt anzeigen
  if (pathname === '/login') {
    return <>{children}</>
  }

  // Wenn nicht angemeldet, nichts anzeigen (wird zur Login-Seite weitergeleitet)
  if (!isLoggedIn) {
    return null
  }

  // Wenn angemeldet, Sidebar, Navigation und Hauptinhalt anzeigen
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Sidebar />
      <div className="ml-64">
        <Navigation />
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default ProtectedLayout
