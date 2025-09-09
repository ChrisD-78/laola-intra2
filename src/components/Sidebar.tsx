'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

const Sidebar = () => {
  const pathname = usePathname()
  const { currentUser, logout } = useAuth()

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '🏠' },
    { href: '/aufgaben', label: 'Aufgaben', icon: '📋' },
    { href: '/wiederkehrende-aufgaben', label: 'Wiederkehrende Aufgaben', icon: '🔄' },
    { href: '/dokumente', label: 'Dokumente', icon: '📄' },
    { href: '/formulare', label: 'Formulare', icon: '📝' },
    { href: '/schulungen', label: 'Schulungen', icon: '🎓' },
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-64 gradient-bg border-r border-white/20 shadow-2xl z-50">
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
            <span className="text-white text-2xl">🏊‍♂️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">LA OLA</h1>
            <p className="text-sm text-white/90 font-medium">Intranet</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center space-x-3 p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
          <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-bold">
              {currentUser?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {currentUser || 'Benutzer'}
            </p>
            <p className="text-xs text-white/80 font-medium">Angemeldet</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/30 text-white border-r-2 border-white shadow-lg backdrop-blur-sm'
                      : 'text-white hover:bg-white/20 hover:text-white hover:shadow-md backdrop-blur-sm'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/20">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white hover:text-white hover:bg-red-600/40 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/30 hover:border-red-400/50"
        >
          <span>🚪</span>
          <span>Abmelden</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
