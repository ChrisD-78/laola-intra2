'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MSRPage() {
  const router = useRouter()

  useEffect(() => {
    // Öffne die externe MSR-Seite direkt in einem neuen Tab
    const newWindow = window.open('https://dulconnex.com/welcome', '_blank', 'noopener,noreferrer')
    
    if (newWindow) {
      // Zurück zur Technik-Seite nach kurzer Verzögerung
      setTimeout(() => {
        router.push('/technik')
      }, 500)
    } else {
      alert('Popup wurde blockiert. Bitte erlauben Sie Popups für diese Seite.')
      router.push('/technik')
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
        <p className="text-lg font-medium text-gray-900">MSR wird geöffnet...</p>
      </div>
    </div>
  )
}
