'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

const LoginForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Verwende die login-Funktion aus dem AuthProvider
      const success = login(username, password)
      
      if (success) {
        // Login erfolgreich - Formular zurücksetzen
        setUsername('')
        setPassword('')
        setError('')
        console.log('Login erfolgreich!')
        // AuthProvider kümmert sich um die Weiterleitung
      } else {
        setError('Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.')
        setPassword('') // Passwort zurücksetzen bei Fehler
        console.log('Login fehlgeschlagen!')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
      setPassword('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-white text-4xl">⚙️</span>
          </div>
          <h1 className="mt-8 text-4xl font-bold text-white tracking-tight">
            LA OLA
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-blue-200">
            Technik Portal
          </h2>
          <p className="mt-4 text-sm text-gray-300">
            Anmeldung für technische Mitarbeiter
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-white mb-2">
                Benutzername
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Ihr Benutzername"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Ihr Passwort"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Anmeldung läuft...
                  </div>
                ) : (
                  'Anmelden'
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl">
            <p className="text-xs text-blue-200 text-center font-medium">
              Demo-Anmeldung
            </p>
            <p className="text-sm text-white text-center mt-1">
              <span className="font-mono">Christof Drost</span> / <span className="font-mono">12345</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            © 2024 LA OLA Technik Portal
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
