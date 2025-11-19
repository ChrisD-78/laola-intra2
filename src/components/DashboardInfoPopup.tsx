'use client'

import { useState, useEffect } from 'react'

interface DashboardInfoPopupProps {
  info: {
    id: string
    title: string
    content: string
    timestamp: string
    pdfUrl?: string
    pdfFileName?: string
  }
  onClose: () => void
}

export default function DashboardInfoPopup({ info, onClose }: DashboardInfoPopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animation beim Öffnen
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const formatDate = (dateString: string): string => {
    // Konvertiere das Datum in das Format: TT.MM.JJJJ (ohne Uhrzeit)
    if (!dateString) return ''
    
    // Spezielle Werte direkt zurückgeben
    if (dateString === 'gerade eben' || dateString === 'Heute' || dateString === 'Gestern') {
      return dateString
    }
    
    try {
      // Wenn das Datum bereits im deutschen Format ist (z.B. "08.11.2025, 14:30:45")
      if (dateString.includes(',')) {
        // Extrahiere nur den Datumsteil vor dem Komma
        return dateString.split(',')[0].trim()
      }
      
      // Wenn es bereits im Format TT.MM.JJJJ ist (ohne Komma)
      if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
        return dateString
      }
      
      // Ansonsten versuche es zu parsen
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        // Falls das Parsen fehlschlägt, gebe den Original-String zurück
        return dateString
      }
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}.${month}.${year}`
    } catch (e) {
      return dateString
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Warte auf Animation
  }

  const handleDontShowAgain = () => {
    // Merke dir, dass dieser Popup nicht mehr angezeigt werden soll
    const dismissedPopups = JSON.parse(localStorage.getItem('dismissedPopups') || '[]')
    if (!dismissedPopups.includes(info.id)) {
      dismissedPopups.push(info.id)
      localStorage.setItem('dismissedPopups', JSON.stringify(dismissedPopups))
    }
    handleClose()
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none`}>
        <div 
          className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col pointer-events-auto transform transition-all duration-300 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header mit Gradient - Sticky oben */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 relative overflow-hidden flex-shrink-0">
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20"></div>
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📢</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {info.title}
                    </h2>
                    <p className="text-sm text-white/80 mt-1">
                      {formatDate(info.timestamp)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                  title="Schließen"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content - Scrollbar */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-4">
              <p className="text-gray-900 text-base leading-relaxed whitespace-pre-wrap">
                {info.content}
              </p>
            </div>

            {/* PDF Attachment */}
            {info.pdfUrl && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📄</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Anhang</p>
                    <p className="text-xs text-gray-500">{info.pdfFileName || 'Dokument.pdf'}</p>
                  </div>
                  <button
                    onClick={() => window.open(info.pdfUrl, '_blank')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Öffnen
                  </button>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Wichtige Information</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Diese Nachricht wurde als wichtig markiert und wird beim Öffnen der Seite angezeigt.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Sticky unten */}
          <div className="flex-shrink-0 p-6 pt-0 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
              >
                ✓ Verstanden
              </button>
              <button
                onClick={handleDontShowAgain}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Nicht mehr anzeigen
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

