'use client'

import { useState, useRef } from 'react'
import PasswordModal from './PasswordModal'
import { useAuth } from '@/components/AuthProvider'

interface InfoFormProps {
  onAddInfo: (title: string, content: string, pdfFile?: File, isPopup?: boolean) => void
}

const InfoForm = ({ onAddInfo }: InfoFormProps) => {
  const { isAdmin } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [isPopup, setIsPopup] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && content.trim()) {
      onAddInfo(title.trim(), content.trim(), selectedFile || undefined, isPopup)
      setTitle('')
      setContent('')
      setSelectedFile(null)
      setIsPopup(false)
      setIsOpen(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setContent('')
    setSelectedFile(null)
    setIsPopup(false)
    setIsOpen(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === 'application/pdf') {
        setSelectedFile(file)
      } else {
        alert('Bitte wählen Sie nur PDF-Dateien aus.')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    // Admin-Benutzer überspringen die Passwort-Abfrage
    if (isAdmin) {
      setIsOpen(true)
    } else {
      setShowPasswordModal(true)
    }
  }

  if (!isOpen) {
    return (
      <>
        <button
          onClick={handleButtonClick}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 border-2 border-dashed border-blue-600 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          ➕ Neue Information
          {isAdmin && <span className="text-xs bg-purple-500/50 px-2 py-0.5 rounded-full">Admin</span>}
        </button>
        
        {/* Nur für Nicht-Admins: Passwort-Modal */}
        {!isAdmin && (
          <PasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            onSuccess={() => setIsOpen(true)}
            title="Neue Information erstellen"
            message="Bitte geben Sie das Passwort ein, um eine neue Information zu erstellen."
            validPasswords={['bl', 'staho']}
          />
        )}
      </>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Neue Information hinzufügen
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
                Überschrift *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                placeholder="z.B. Neue Sicherheitsrichtlinien"
                required
                autoFocus
              />
            </div>
            
                   <div>
                     <label htmlFor="content" className="block text-sm font-medium text-gray-900 mb-2">
                       Inhalt *
                     </label>
                     <textarea
                       id="content"
                       value={content}
                       onChange={(e) => setContent(e.target.value)}
                       rows={4}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                       placeholder="Beschreibung der Information..."
                       required
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">
                       PDF-Dokument anhängen (optional)
                     </label>
                     
                     {!selectedFile ? (
                       <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                         <div className="space-y-2">
                           <span className="text-2xl">📄</span>
                           <div>
                             <p className="text-sm font-medium text-gray-900">
                               PDF-Datei auswählen
                             </p>
                             <p className="text-xs text-gray-600">
                               Nur PDF-Dateien erlaubt
                             </p>
                           </div>
                           <button
                             type="button"
                             onClick={() => fileInputRef.current?.click()}
                             className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                           >
                             Datei auswählen
                           </button>
                         </div>
                       </div>
                     ) : (
                       <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-3">
                             <span className="text-xl">📄</span>
                             <div>
                               <p className="font-medium text-gray-900 text-sm">{selectedFile.name}</p>
                               <p className="text-xs text-gray-600">
                                 {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                               </p>
                             </div>
                           </div>
                           <button
                             type="button"
                             onClick={removeFile}
                             className="text-red-500 hover:text-red-700 transition-colors p-1"
                           >
                             ✕
                           </button>
                         </div>
                       </div>
                     )}
                     
                     <input
                       ref={fileInputRef}
                       type="file"
                       onChange={handleFileSelect}
                       accept=".pdf"
                       className="hidden"
                     />
                   </div>

                   {/* Popup Checkbox */}
                   <div className="border-t border-gray-200 pt-4">
                     <div className="flex items-start space-x-3">
                       <input
                         type="checkbox"
                         id="isPopup"
                         checked={isPopup}
                         onChange={(e) => setIsPopup(e.target.checked)}
                         className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                       />
                       <div className="flex-1">
                         <label htmlFor="isPopup" className="block text-sm font-medium text-gray-900 cursor-pointer">
                           Als Popup beim Login anzeigen
                         </label>
                         <p className="text-xs text-gray-700 mt-1">
                           Diese Information wird automatisch als Popup-Fenster angezeigt, wenn Benutzer die Seite öffnen
                         </p>
                       </div>
                     </div>
                   </div>
            
            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Hinzufügen
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default InfoForm
