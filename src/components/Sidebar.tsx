'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useChatNotifications } from '@/contexts/ChatNotificationContext'
import { useState } from 'react'

const Sidebar = () => {
  const pathname = usePathname()
  const { currentUser, logout, isAdmin } = useAuth()
  const { unreadCount } = useChatNotifications()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showAIAgentPopup, setShowAIAgentPopup] = useState(false)

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '🏠' },
    { href: '/aufgaben', label: 'Aufgaben', icon: '📋' },
    { href: '/wiederkehrende-aufgaben', label: 'Wiederkehrende Aufgaben', icon: '🔄' },
    { href: '/dokumente', label: 'Dokumente', icon: '📄' },
    { href: '/formulare', label: 'Formulare', icon: '📝' },
    { href: '/schulungen', label: 'Schulungen', icon: '🎓' },
    { href: '/technik', label: 'Technik', icon: '🔧' },
    { href: '/chat', label: 'Chat', icon: '💬' },
  ]

  const adminNavItems = [
    { href: '/admin/users', label: 'Benutzerverwaltung', icon: '👥' },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
      >
        <span className="text-xl">☰</span>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-blue-900 lg:bg-blue-900/20 backdrop-blur-xl border-r border-blue-200/30 shadow-2xl z-50 transform transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      {/* Header */}
      <div className="p-6 border-b border-blue-200/30">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-800/40 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-blue-300/40">
            <span className="text-white text-2xl">🏊‍♂️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">LA OLA</h1>
            <p className="text-sm text-white font-medium">Intranet</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-blue-200/30">
        <div className="flex items-center space-x-3 p-3 bg-blue-800/30 backdrop-blur-sm rounded-xl border border-blue-300/30">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-bold">
              {currentUser?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {currentUser || 'Benutzer'}
            </p>
            <p className="text-xs text-white font-medium">Angemeldet</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const isChatLink = item.href === '/chat'
            const showBadge = isChatLink && unreadCount > 0
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                    isActive
                      ? 'bg-blue-800/60 text-white border-r-2 border-blue-400 shadow-lg backdrop-blur-sm'
                      : 'text-white hover:bg-blue-800/40 hover:text-white hover:shadow-md backdrop-blur-sm'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {showBadge && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}

          {/* Admin Section */}
          {isAdmin && (
            <>
              <li className="pt-4 pb-1">
                <div className="px-4 text-[10px] font-semibold text-blue-300 uppercase tracking-wider">
                  Administration
                </div>
              </li>
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-purple-700/60 text-white border-r-2 border-purple-400 shadow-lg backdrop-blur-sm'
                          : 'text-white hover:bg-purple-700/40 hover:text-white hover:shadow-md backdrop-blur-sm'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="text-sm font-medium flex-1 min-w-0 truncate">{item.label}</span>
                      <span className="text-[10px] bg-purple-500/50 px-1.5 py-0.5 rounded-full whitespace-nowrap">Admin</span>
                    </Link>
                  </li>
                )
              })}
              
              {/* AI-Agent Button */}
              <li>
                <button
                  onClick={() => {
                    setShowAIAgentPopup(true)
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-white hover:bg-purple-700/40 hover:text-white hover:shadow-md backdrop-blur-sm"
                >
                  <span className="text-base">🤖</span>
                  <span className="text-sm font-medium flex-1 min-w-0 truncate text-left">AI-Agent</span>
                  <span className="text-[10px] bg-purple-500/50 px-1.5 py-0.5 rounded-full whitespace-nowrap">Admin</span>
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-200/30">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white hover:text-white hover:bg-red-600/40 rounded-xl transition-all duration-200 backdrop-blur-sm border border-blue-300/30 hover:border-red-400/50"
        >
          <span>🚪</span>
          <span>Abmelden</span>
        </button>
      </div>
      </div>

      {/* AI-Agent Popup */}
      {showAIAgentPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowAIAgentPopup(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI-Agent</h2>
                  <p className="text-sm text-white/80">E-Mail Assistent</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIAgentPopup(false)}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                title="Schließen"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>

            {/* iframe Container */}
            <div className="flex-1 overflow-hidden bg-gray-50">
              <iframe
                src="https://cdagent.netlify.app"
                className="w-full h-full border-0"
                title="AI-Agent"
                allow="clipboard-read; clipboard-write"
              />
            </div>

            {/* Footer with Info */}
            <div className="p-3 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>🔒</span>
                <span>Nur für Administratoren</span>
              </div>
              <button
                onClick={() => setShowAIAgentPopup(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
