'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Sidebar from '@/components/Sidebar'
import { useSidebar } from '@/contexts/SidebarContext'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const { isLoggedIn, authReady } = useAuth()
  const { isCollapsed } = useSidebar()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Erst umleiten, wenn der Anmeldestatus aus localStorage gelesen wurde –
    // sonst wirft jeder harte Seitenaufruf eingeloggte Nutzer zur Login-Seite
    if (authReady && !isLoggedIn && pathname !== '/login') {
      router.push('/login')
    }
  }, [authReady, isLoggedIn, pathname, router])

  // Wenn auf der Login-Seite, nur den Inhalt anzeigen
  if (pathname === '/login') {
    return <>{children}</>
  }

  // Wenn Status noch nicht gelesen oder nicht angemeldet, nichts anzeigen
  if (!authReady || !isLoggedIn) {
    return null
  }

  // Wenn angemeldet, Sidebar, Navigation und Hauptinhalt anzeigen
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-0' : 'lg:ml-64'}`}>
        <Navigation />
        <main className="p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default ProtectedLayout
