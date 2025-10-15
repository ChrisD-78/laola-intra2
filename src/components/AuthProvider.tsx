'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isLoggedIn: boolean
  currentUser: string | null
  login: (username: string, password: string) => boolean
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
  const router = useRouter()

  useEffect(() => {
    // Prüfe den Anmeldestatus beim Laden der Seite
    const loginStatus = localStorage.getItem('isLoggedIn')
    const user = localStorage.getItem('currentUser')
    
    console.log('AuthProvider: Checking login status:', { loginStatus, user })
    
    if (loginStatus === 'true' && user) {
      setIsLoggedIn(true)
      setCurrentUser(user)
      console.log('AuthProvider: User is logged in:', user)
    } else {
      console.log('AuthProvider: User is not logged in')
    }
  }, [])

  const login = (username: string, password: string): boolean => {
    console.log('AuthProvider: Login attempt:', { username, password })
    
    // Liste der gültigen Benutzer
    const validUsers = [
      { username: 'Christof Drost', password: '12345', displayName: 'Christof Drost' },
      { username: 'Kirstin', password: 'kirstin123', displayName: 'Kirstin Kreusch' },
      { username: 'Julia', password: 'julia112', displayName: 'Julia Wodonis' },
      { username: 'Lisa', password: 'lisa331', displayName: 'Lisa Schnagl' },
      { username: 'Jonas', password: 'Jonas554', displayName: 'Jonas Jooss' },
      { username: 'Dennis', password: 'Dennis812', displayName: 'Dennis Wilkens' },
      { username: 'Lea', password: 'lea331', displayName: 'Lea Hofmann' },
      { username: 'laola', password: 'laola123', displayName: 'Team LAOLA' },
      { username: 'staho', password: 'staho123', displayName: 'Verwaltung Stadtholding Landau' }
    ]
    
    // Benutzer suchen
    const user = validUsers.find(u => u.username === username && u.password === password)
    
    if (user) {
      console.log('AuthProvider: Login successful!', user.displayName)
      
      // Lokalen State aktualisieren
      setIsLoggedIn(true)
      setCurrentUser(user.displayName)
      
      // localStorage aktualisieren
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('currentUser', user.displayName)
      
      // Nach erfolgreichem Login zur Hauptseite weiterleiten
      setTimeout(() => {
        router.push('/')
      }, 100)
      
      return true
    } else {
      console.log('AuthProvider: Login failed - invalid credentials')
      return false
    }
  }

  const logout = () => {
    console.log('AuthProvider: Logging out user')
    
    // Lokalen State zurücksetzen
    setIsLoggedIn(false)
    setCurrentUser(null)
    
    // localStorage löschen
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('currentUser')
    
    // Zur Login-Seite weiterleiten
    router.push('/login')
  }

  const value = {
    isLoggedIn,
    currentUser,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
