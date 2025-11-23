'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isLoggedIn: boolean
  currentUser: string | null
  isAdmin: boolean
  userRole: string | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Prüfe den Anmeldestatus beim Laden der Seite
    const loginStatus = localStorage.getItem('isLoggedIn')
    const user = localStorage.getItem('currentUser')
    const adminStatus = localStorage.getItem('isAdmin')
    const role = localStorage.getItem('userRole')
    
    console.log('AuthProvider: Checking login status:', { loginStatus, user, adminStatus, role })
    
    if (loginStatus === 'true' && user) {
      setIsLoggedIn(true)
      setCurrentUser(user)
      setIsAdmin(adminStatus === 'true')
      setUserRole(role)
      console.log('AuthProvider: User is logged in:', user, 'Admin:', adminStatus === 'true', 'Role:', role)
    } else {
      console.log('AuthProvider: User is not logged in')
    }
  }, [])

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('AuthProvider: Login attempt:', { username })
    
    try {
      // API-Call zur Datenbank-Authentifizierung
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()
      
      console.log('AuthProvider: API Response:', { 
        success: data.success, 
        error: data.error,
        hasUser: !!data.user 
      })

      if (data.success && data.user) {
        console.log('AuthProvider: Login successful!', data.user.displayName, 'Role:', data.user.role)
        
        // Lokalen State aktualisieren
        setIsLoggedIn(true)
        setCurrentUser(data.user.displayName)
        setIsAdmin(data.user.isAdmin || false)
        setUserRole(data.user.role || 'Benutzer')
        
        // localStorage aktualisieren
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('currentUser', data.user.displayName)
        localStorage.setItem('isAdmin', data.user.isAdmin ? 'true' : 'false')
        localStorage.setItem('userRole', data.user.role || 'Benutzer')
        
        // Nach erfolgreichem Login zur Hauptseite weiterleiten
        setTimeout(() => {
          router.push('/')
        }, 100)
        
        return { success: true }
      } else {
        console.log('AuthProvider: Login failed -', data.error)
        console.log('AuthProvider: Full response:', data)
        return { success: false, error: data.error || 'Ungültige Anmeldedaten' }
      }
    } catch (error) {
      console.error('AuthProvider: Login error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
      if (error instanceof Error) {
        console.error('AuthProvider: Error details:', error.message, error.stack)
      }
      return { success: false, error: `Verbindungsfehler: ${errorMessage}` }
    }
  }

  const logout = () => {
    console.log('AuthProvider: Logging out user')
    
    // Lokalen State zurücksetzen
    setIsLoggedIn(false)
    setCurrentUser(null)
    setIsAdmin(false)
    setUserRole(null)
    
    // localStorage löschen
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('userRole')
    
    // Zur Login-Seite weiterleiten
    router.push('/login')
  }

  const value = {
    isLoggedIn,
    currentUser,
    isAdmin,
    userRole,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
