'use client'

import { useState, useRef, useEffect } from 'react'

interface MeetingProtocol {
  title: string
  date: string
  participants: string
  summary: string
  topics: string[]
  actionItems: string[]
  transcription: string
}

export default function MeetingRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [protocol, setProtocol] = useState<MeetingProtocol | null>(null)
  const [error, setError] = useState<string>('')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }

      mediaRecorder.start(1000)
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.error('Fehler beim Zugriff auf Mikrofon:', err)
      setError('Fehler: Mikrofon-Zugriff wurde verweigert. Bitte erlauben Sie den Zugriff in Ihren Browser-Einstellungen.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const processRecording = async () => {
    if (!audioBlob) return

    setIsProcessing(true)
    setError('')

    try {
      console.log('Preparing audio for transcription...')
      console.log('Audio blob size:', audioBlob.size, 'bytes')
      
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      console.log('Sending to API...')
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })

      console.log('Response received:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Server-Fehler' }))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || errorData.details || 'Transkription fehlgeschlagen')
      }

      const data = await response.json()
      console.log('Protocol received successfully')
      
      if (!data.protocol) {
        throw new Error('Keine Protokolldaten vom Server erhalten')
      }
      
      setProtocol(data.protocol)
    } catch (err) {
      console.error('=== Client-side error ===')
      console.error('Error details:', err)
      
      let errorMsg = 'Fehler bei der Verarbeitung der Aufnahme'
      
      if (err instanceof Error) {
        errorMsg = err.message
        
        // User-friendly error messages
        if (errorMsg.includes('Failed to fetch')) {
          errorMsg = 'Netzwerkfehler: Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.'
        } else if (errorMsg.includes('API-Schlüssel')) {
          errorMsg = 'OpenAI nicht konfiguriert. Bitte kontaktieren Sie Ihren Administrator.'
        }
      }
      
      setError(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setProtocol(null)
    setRecordingTime(0)
    setError('')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const copyToClipboard = () => {
    if (!protocol) return
    
    const text = `
MEETING-PROTOKOLL
=================

Titel: ${protocol.title}
Datum: ${protocol.date}
Teilnehmer: ${protocol.participants}

ZUSAMMENFASSUNG
---------------
${protocol.summary}

THEMEN
------
${protocol.topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

AUFGABEN / NÄCHSTE SCHRITTE
----------------------------
${protocol.actionItems.map((a, i) => `${i + 1}. ${a}`).join('\n')}

VOLLSTÄNDIGE TRANSKRIPTION
--------------------------
${protocol.transcription}
    `.trim()

    navigator.clipboard.writeText(text)
    alert('Protokoll in Zwischenablage kopiert!')
  }

  const downloadProtocol = () => {
    if (!protocol) return
    
    const text = `
MEETING-PROTOKOLL
=================

Titel: ${protocol.title}
Datum: ${protocol.date}
Teilnehmer: ${protocol.participants}

ZUSAMMENFASSUNG
---------------
${protocol.summary}

THEMEN
------
${protocol.topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

AUFGABEN / NÄCHSTE SCHRITTE
----------------------------
${protocol.actionItems.map((a, i) => `${i + 1}. ${a}`).join('\n')}

VOLLSTÄNDIGE TRANSKRIPTION
--------------------------
${protocol.transcription}
    `.trim()

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Meeting-Protokoll_${protocol.date.replace(/[/:]/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      {!protocol && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center space-y-6">
            {/* Recording Status */}
            <div className={`inline-block px-6 py-3 rounded-full ${
              isRecording 
                ? isPaused 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800 animate-pulse'
                : 'bg-gray-100 text-gray-600'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  isRecording 
                    ? isPaused 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                    : 'bg-gray-400'
                }`}></div>
                <span className="font-semibold">
                  {isRecording 
                    ? isPaused 
                      ? 'Pausiert' 
                      : 'Aufnahme läuft'
                    : 'Bereit'}
                </span>
              </div>
            </div>

            {/* Timer */}
            <div className="text-6xl font-bold text-gray-800 font-mono">
              {formatTime(recordingTime)}
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center items-center space-x-4">
              {!isRecording && !audioBlob && (
                <button
                  onClick={startRecording}
                  className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                  title="Aufnahme starten"
                >
                  <span className="text-3xl">🎙️</span>
                </button>
              )}

              {isRecording && !isPaused && (
                <>
                  <button
                    onClick={pauseRecording}
                    className="w-16 h-16 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                    title="Pausieren"
                  >
                    <span className="text-2xl">⏸️</span>
                  </button>
                  <button
                    onClick={stopRecording}
                    className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                    title="Aufnahme beenden"
                  >
                    <span className="text-3xl">⏹️</span>
                  </button>
                </>
              )}

              {isPaused && (
                <>
                  <button
                    onClick={resumeRecording}
                    className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                    title="Fortsetzen"
                  >
                    <span className="text-2xl">▶️</span>
                  </button>
                  <button
                    onClick={stopRecording}
                    className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                    title="Aufnahme beenden"
                  >
                    <span className="text-3xl">⏹️</span>
                  </button>
                </>
              )}
            </div>

            {/* Process Recording Button */}
            {audioBlob && !isProcessing && (
              <div className="space-y-4 mt-8">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-800 font-semibold">✅ Aufnahme abgeschlossen!</p>
                  <p className="text-sm text-green-700 mt-1">Dauer: {formatTime(recordingTime)}</p>
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={processRecording}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    🤖 Jetzt transkribieren & formatieren
                  </button>
                  <button
                    onClick={resetRecording}
                    className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200"
                  >
                    🔄 Neu aufnehmen
                  </button>
                </div>
              </div>
            )}

            {/* Processing State */}
            {isProcessing && (
              <div className="space-y-4 mt-8">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-center space-x-3 mb-3">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-blue-800 font-semibold text-lg">Verarbeite Aufnahme...</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Die KI transkribiert Ihre Aufnahme und erstellt ein formatiertes Protokoll. Dies kann 1-2 Minuten dauern.
                  </p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                <p className="text-red-800 font-semibold">❌ Fehler</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Protocol Display */}
      {protocol && (
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✅</span>
              <span className="font-semibold text-gray-800">Protokoll erstellt</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                📋 Kopieren
              </button>
              <button
                onClick={downloadProtocol}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                💾 Download
              </button>
              <button
                onClick={resetRecording}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                🔄 Neue Aufnahme
              </button>
            </div>
          </div>

          {/* Protocol Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Header Info */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{protocol.title}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Datum:</span>
                  <span className="ml-2 font-semibold text-gray-900">{protocol.date}</span>
                </div>
                <div>
                  <span className="text-gray-600">Teilnehmer:</span>
                  <span className="ml-2 font-semibold text-gray-900">{protocol.participants}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">📝</span> Zusammenfassung
              </h3>
              <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-xl">
                {protocol.summary}
              </p>
            </div>

            {/* Topics */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">💡</span> Besprochene Themen
              </h3>
              <ul className="space-y-2">
                {protocol.topics.map((topic, index) => (
                  <li key={index} className="flex items-start space-x-3 bg-purple-50 p-3 rounded-lg">
                    <span className="text-purple-600 font-bold">{index + 1}.</span>
                    <span className="text-gray-800 flex-1">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Items */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">✅</span> Aufgaben & Nächste Schritte
              </h3>
              <ul className="space-y-2">
                {protocol.actionItems.map((item, index) => (
                  <li key={index} className="flex items-start space-x-3 bg-green-50 p-3 rounded-lg">
                    <span className="text-green-600 font-bold">{index + 1}.</span>
                    <span className="text-gray-800 flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Full Transcription */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">📄</span> Vollständige Transkription
              </h3>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-96 overflow-y-auto">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                  {protocol.transcription}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

