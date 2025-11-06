'use client'

import { useState, useRef } from 'react'
import PasswordModal from './PasswordModal'
import { useAuth } from '@/components/AuthProvider'

interface DokumentUploadFormProps {
  onUploadDocument: (document: {
    title: string
    description: string
    category: string
    file: File
    tags: string[]
  }) => void
}

const DokumentUploadForm = ({ onUploadDocument }: DokumentUploadFormProps) => {
  const { isAdmin } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Sicherheit')
  const [tags, setTags] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && description.trim() && selectedFile) {
      const tagArray = tags.trim() ? tags.split(',').map(tag => tag.trim()) : []
      
      onUploadDocument({
        title: title.trim(),
        description: description.trim(),
        category,
        file: selectedFile,
        tags: tagArray
      })
      
      // Reset form
      setTitle('')
      setDescription('')
      setCategory('Sicherheit')
      setTags('')
      setSelectedFile(null)
      setIsOpen(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setCategory('Sicherheit')
    setTags('')
    setSelectedFile(null)
    setIsOpen(false)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'application/pdf' || file.type.startsWith('image/') || file.type.includes('document')) {
        setSelectedFile(file)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return '📄'
    if (file.type.startsWith('image/')) return '🖼️'
    if (file.type.includes('document')) return '📋'
    return '📎'
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
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          📤 Dokument hochladen
          {isAdmin && <span className="text-xs bg-purple-500/50 px-2 py-0.5 rounded-full">Admin</span>}
        </button>
        
        {/* Nur für Nicht-Admins: Passwort-Modal */}
        {!isAdmin && (
          <PasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            onSuccess={() => setIsOpen(true)}
            title="Dokument hochladen"
            message="Bitte geben Sie das Passwort ein, um ein Dokument hochzuladen."
            validPasswords={['bl']}
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
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Neues Dokument hochladen
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Dokumententitel *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. Sicherheitsrichtlinien 2024"
                  required
                  autoFocus
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Beschreibung des Dokuments..."
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Kategorie
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Sicherheit">Sicherheit</option>
                  <option value="Betrieb">Betrieb</option>
                  <option value="Verwaltung">Verwaltung</option>
                  <option value="Technik">Technik</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (durch Komma getrennt)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. sicherheit, richtlinien, 2024"
                />
              </div>
            </div>
            
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dokument auswählen *
              </label>
              
              {!selectedFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <span className="text-4xl">📤</span>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Datei hierher ziehen oder klicken zum Auswählen
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Unterstützt: PDF, Bilder, Dokumente (max. 10MB)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Datei auswählen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileIcon(selectedFile)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
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
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                className="hidden"
              />
            </div>
            
            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={!selectedFile}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Dokument hochladen
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

export default DokumentUploadForm
