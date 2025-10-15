'use client'

import { useState, useRef } from 'react'

interface InfoFormProps {
  onAddInfo: (title: string, content: string, pdfFile?: File) => void
}

const InfoForm = ({ onAddInfo }: InfoFormProps) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && content.trim()) {
      onAddInfo(title.trim(), content.trim(), selectedFile || undefined)
      setTitle('')
      setContent('')
      setSelectedFile(null)
      setIsOpen(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setContent('')
    setSelectedFile(null)
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

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          const pass = prompt('Bitte Passwort eingeben:')
          if (pass === 'bl' || pass === 'staho') {
            setIsOpen(true)
          } else if (pass !== null) {
            alert('Falsches Passwort')
          }
        }}
        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 border-2 border-dashed border-blue-600 rounded-lg text-white text-sm font-medium transition-colors"
      >
        ➕ Neue Information
      </button>
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
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Überschrift *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="z.B. Neue Sicherheitsrichtlinien"
                required
                autoFocus
              />
            </div>
            
                   <div>
                     <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                       Inhalt *
                     </label>
                     <textarea
                       id="content"
                       value={content}
                       onChange={(e) => setContent(e.target.value)}
                       rows={4}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       placeholder="Beschreibung der Information..."
                       required
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
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
                             <p className="text-xs text-gray-500">
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
                               <p className="text-xs text-gray-500">
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
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
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
