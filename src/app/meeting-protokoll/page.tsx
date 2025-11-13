'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import MeetingRecorder from '@/components/MeetingRecorder'

export default function MeetingProtokollPage() {
  const { isAdmin } = useAuth()
  const [showInfo, setShowInfo] = useState(true)
  const [testResult, setTestResult] = useState<{ status: string; message: string; details?: string } | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  const testOpenAIConfig = async () => {
    setIsTesting(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/transcribe/test')
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        status: 'error',
        message: 'Verbindung fehlgeschlagen',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      })
    } finally {
      setIsTesting(false)
    }
  }

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

          {/* OpenAI Test Button */}
          <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔧</span>
              <div>
                <h3 className="font-semibold text-gray-900">OpenAI-Konfiguration</h3>
                <p className="text-sm text-gray-600">Testen Sie die API-Verbindung vor der ersten Aufnahme</p>
              </div>
            </div>
            <button
              onClick={testOpenAIConfig}
              disabled={isTesting}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isTesting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isTesting ? '⏳ Teste...' : '🧪 Verbindung testen'}
            </button>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`rounded-xl p-4 ${
              testResult.status === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{testResult.status === 'success' ? '✅' : '❌'}</span>
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    testResult.status === 'success' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {testResult.message}
                  </h3>
                  {testResult.details && (
                    <p className={`text-sm mt-1 ${
                      testResult.status === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {typeof testResult.details === 'string' 
                        ? testResult.details 
                        : JSON.stringify(testResult.details, null, 2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Meeting Recorder Component */}
        <MeetingRecorder />
      </div>
    </div>
  )
}

