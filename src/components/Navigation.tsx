'use client'

import { useAuth } from '@/components/AuthProvider'

const Navigation = () => {
  const { isLoggedIn, currentUser } = useAuth()

  // Wenn nicht angemeldet, keine Navigation anzeigen
  if (!isLoggedIn) {
    return null
  }

  return (
    <nav className="bg-white card-shadow border-b" style={{ borderColor: 'var(--border-color)' }}>
      <div className="ml-64 px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              🏊‍♂️ LA OLA Intranet
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Benutzername anzeigen */}
            <div className="flex items-center space-x-3 px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--secondary-blue)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-blue)' }}>
                <span className="text-white text-xs font-bold">
                  {currentUser?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--primary-blue)' }}>
                Willkommen, {currentUser}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
