'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import MeetingRecorder from '@/components/MeetingRecorder'

export default function MeetingProtokollPage() {
  const { isAdmin } = useAuth()
  const [showInfo, setShowInfo] = useState(true)

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-center">
            <span className="text-6xl">🔒</span>
            <h1 className="text-2xl font-bold text-gray-800 mt-4">Zugriff verweigert</h1>
            <p className="text-gray-600 mt-2">
              Diese Funktion ist nur für Administratoren verfügbar.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🎙️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meeting-Protokoll</h1>
              <p className="text-gray-600 mt-1">Sprachaufnahme automatisch transkribieren und formatieren</p>
            </div>
          </div>

          {/* Info Banner */}
          {showInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">So funktioniert's:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Mikrofon-Zugriff erlauben</li>
                  <li>🎙️ Meeting aufnehmen (Aufnahme-Button drücken)</li>
                  <li>⏹️ Aufnahme stoppen wenn fertig</li>
                  <li>🤖 KI transkribiert und formatiert automatisch</li>
                  <li>📧 Protokoll kopieren oder per E-Mail versenden</li>
                </ul>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-blue-600 hover:text-blue-800 text-xl"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Meeting Recorder Component */}
        <MeetingRecorder />
      </div>
    </div>
  )
}

