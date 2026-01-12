'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MSRPage() {
  const router = useRouter()
  const [status, setStatus] = useState('MSR wird geöffnet...')

  useEffect(() => {
    const attemptLogin = () => {
      // Versuche verschiedene Login-Methoden
      
      // Methode 1: POST-Formular mit verschiedenen Feldnamen
      const tryFormSubmission = (usernameField: string, passwordField: string) => {
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = 'https://dulconnex.com/welcome'
        form.target = '_blank'
        
        const usernameInput = document.createElement('input')
        usernameInput.type = 'hidden'
        usernameInput.name = usernameField
        usernameInput.value = 'La-Ola'
        form.appendChild(usernameInput)
        
        const passwordInput = document.createElement('input')
        passwordInput.type = 'hidden'
        passwordInput.name = passwordField
        passwordInput.value = 'La-Ola+3'
        form.appendChild(passwordInput)
        
        document.body.appendChild(form)
        form.submit()
        
        setTimeout(() => {
          if (document.body.contains(form)) {
            document.body.removeChild(form)
          }
        }, 100)
      }
      
      // Versuche verschiedene Feldnamen-Kombinationen
      const fieldCombinations = [
        ['username', 'password'],
        ['login', 'password'],
        ['user', 'pass'],
        ['email', 'password'],
        ['username', 'pass'],
        ['login', 'pass']
      ]
      
      // Versuche die erste Kombination
      tryFormSubmission(fieldCombinations[0][0], fieldCombinations[0][1])
      setStatus('Automatische Anmeldung wird durchgeführt...')
      
      // Fallback: Öffne die Seite normal, falls Formular nicht funktioniert
      setTimeout(() => {
        const newWindow = window.open('https://dulconnex.com/welcome', '_blank')
        if (newWindow) {
          setStatus('MSR Seite wurde geöffnet. Bitte melden Sie sich manuell an.')
        }
      }, 1000)
      
      // Zurück zur Technik-Seite nach kurzer Verzögerung
      setTimeout(() => {
        router.push('/technik')
      }, 2000)
    }
    
    attemptLogin()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
        <p className="text-lg font-medium text-gray-900">{status}</p>
        <p className="text-sm text-gray-600 mt-2">
          Login: La-Ola
        </p>
      </div>
    </div>
  )
}
