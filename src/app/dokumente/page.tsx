'use client'

import { useEffect, useState } from 'react'
import DokumentUploadForm from '@/components/DokumentUploadForm'
import { getDocuments, getDocumentsFiltered, insertDocument, uploadDocumentFile, updateDocument, deleteDocumentById, DocumentRecord } from '@/lib/db'

interface Document {
  id: string
  title: string
  description: string
  category: string
  fileName: string
  fileSize: number
  fileType: string
  tags: string[]
  uploadedAt: string
  uploadedBy: string
  fileContent?: string // Für Text-basierte Dokumente
  fileUrl?: string
}

export default function Dokumente() {
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDocuments()
        const mapped: Document[] = data.map((d: DocumentRecord) => ({
          id: d.id as string,
          title: d.title,
          description: d.description,
          category: d.category,
          fileName: d.file_name,
          fileSize: d.file_size_mb,
          fileType: d.file_type,
          tags: d.tags || [],
          uploadedAt: d.uploaded_at,
          uploadedBy: d.uploaded_by,
          fileContent: undefined,
          fileUrl: d.file_url
        }))
        setDocuments(mapped)
      } catch (e) {
        console.error('Load documents failed', e)
      }
    }
    load()
  }, [])

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Alle Kategorien')

  useEffect(() => {
    const applyFilters = async () => {
      try {
        const data = categoryFilter === 'Alle Kategorien' 
          ? await getDocuments()
          : await getDocumentsFiltered(categoryFilter)
        const mapped: Document[] = data.map((d: DocumentRecord) => ({
          id: d.id as string,
          title: d.title,
          description: d.description,
          category: d.category,
          fileName: d.file_name,
          fileSize: d.file_size_mb,
          fileType: d.file_type,
          tags: d.tags || [],
          uploadedAt: d.uploaded_at,
          uploadedBy: d.uploaded_by,
          fileContent: undefined,
          fileUrl: d.file_url
        }))
        setDocuments(mapped)
      } catch (e) {
        console.error('Filter documents failed', e)
      }
    }
    applyFilters()
  }, [search, categoryFilter])

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editTags, setEditTags] = useState('')

  const addNewDocument = async (documentData: {
    title: string
    description: string
    category: string
    file: File
    tags: string[]
  }) => {
    const optimistic: Document = {
      id: `tmp_${Date.now()}`,
      title: documentData.title,
      description: documentData.description,
      category: documentData.category,
      fileName: documentData.file.name,
      fileSize: documentData.file.size / 1024 / 1024,
      fileType: documentData.file.type,
      tags: documentData.tags,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Christof Drost',
      fileContent: undefined
    }
    setDocuments(prev => [optimistic, ...prev])
    try {
      const uploaded = await uploadDocumentFile(documentData.file)
      await insertDocument({
        title: documentData.title,
        description: documentData.description,
        category: documentData.category,
        file_name: documentData.file.name,
        file_size_mb: documentData.file.size / 1024 / 1024,
        file_type: documentData.file.type,
        tags: documentData.tags,
        uploaded_at: new Date().toISOString(),
        uploaded_by: 'Christof Drost',
        file_url: uploaded.publicUrl,
      })
      const fresh = await getDocuments()
      const mapped: Document[] = fresh.map((d: DocumentRecord) => ({
        id: d.id as string,
        title: d.title,
        description: d.description,
        category: d.category,
        fileName: d.file_name,
        fileSize: d.file_size_mb,
        fileType: d.file_type,
        tags: d.tags || [],
        uploadedAt: d.uploaded_at,
        uploadedBy: d.uploaded_by,
        fileContent: undefined,
        fileUrl: d.file_url
      }))
      setDocuments(mapped)
    } catch (e) {
      console.error('Insert document failed', e)
      setDocuments(prev => prev.filter(d => d.id !== optimistic.id))
      alert('Dokument konnte nicht gespeichert werden.')
    }
  }

  const deleteDocument = async (documentId: string) => {
    const pass = prompt('Bitte Passwort eingeben:')
    if (pass === 'bl') {
      const prev = documents
      setDocuments(prev.filter(doc => doc.id !== documentId))
      try {
        await deleteDocumentById(documentId)
      } catch (e) {
        console.error('Delete document failed', e)
        setDocuments(prev)
        alert('Dokument konnte nicht gelöscht werden.')
      }
    } else if (pass !== null) {
      alert('Falsches Passwort')
    }
  }

  const viewDocument = (document: Document) => {
    setSelectedDocument(document)
    setIsViewerOpen(true)
    setIsEditMode(false)
  }

  const downloadDocument = (doc: Document) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank')
      return
    }
    // Fallback (sollte nicht mehr nötig sein)
    const content = doc.fileContent || `Titel: ${doc.title}\nBeschreibung: ${doc.description}\nKategorie: ${doc.category}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = doc.fileName.replace('.pdf', '.txt')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const startEditDocument = (doc: Document) => {
    setSelectedDocument(doc)
    setEditTitle(doc.title)
    setEditDescription(doc.description)
    setEditCategory(doc.category)
    setEditTags(doc.tags.join(', '))
    setIsEditMode(true)
    setIsViewerOpen(true)
  }

  const saveEditDocument = async () => {
    if (selectedDocument) {
      const newTags = editTags.trim() ? editTags.split(',').map(tag => tag.trim()) : []
      const prev = documents
      setDocuments(prev.map(doc => doc.id === selectedDocument.id ? { ...doc, title: editTitle, description: editDescription, category: editCategory, tags: newTags } : doc))
      try {
        await updateDocument(selectedDocument.id, { title: editTitle, description: editDescription, category: editCategory, tags: newTags })
      } catch (e) {
        console.error('Update document failed', e)
        setDocuments(prev)
        alert('Änderungen konnten nicht gespeichert werden.')
      }
      setIsEditMode(false)
      setIsViewerOpen(false)
      setSelectedDocument(null)
    }
  }

  const closeViewer = () => {
    setIsViewerOpen(false)
    setIsEditMode(false)
    setSelectedDocument(null)
    setEditTitle('')
    setEditDescription('')
    setEditCategory('')
    setEditTags('')
  }


  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Sicherheit': return 'bg-red-100 text-red-800'
      case 'Betrieb': return 'bg-blue-100 text-blue-800'
      case 'Verwaltung': return 'bg-green-100 text-green-800'
      case 'Technik': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') return '📄'
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.includes('document')) return '📋'
    return '📎'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffHours < 1) return 'vor wenigen Minuten'
    if (diffHours < 24) return `vor ${diffHours} Stunden`
    if (diffDays === 1) return 'vor 1 Tag'
    if (diffDays < 7) return `vor ${diffDays} Tagen`
    
    return date.toLocaleDateString('de-DE')
  }

  const getCategoryCount = (category: string) => {
    return documents.filter(doc => doc.category === category).length
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-4 lg:p-8 text-white text-center">
        <h1 className="text-2xl lg:text-4xl font-bold mb-2">Dokumente</h1>
        <p className="text-sm lg:text-base text-white/90">
          Verwalten Sie alle wichtigen Dokumente und Unterlagen
        </p>
      </div>

      {/* Upload and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Dokumente suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>Alle Kategorien</option>
            <option>Sicherheit</option>
            <option>Betrieb</option>
            <option>Verwaltung</option>
            <option>Technik</option>
          </select>
          <DokumentUploadForm onUploadDocument={addNewDocument} />
        </div>
      </div>

      {/* Document Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <span className="text-4xl">🛡️</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Sicherheit</h3>
            <p className="mt-2 text-sm text-gray-600">{getCategoryCount('Sicherheit')} Dokumente</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <span className="text-4xl">⚙️</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Betrieb</h3>
            <p className="mt-2 text-sm text-gray-600">{getCategoryCount('Betrieb')} Dokumente</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <span className="text-4xl">📋</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Verwaltung</h3>
            <p className="mt-2 text-sm text-gray-600">{getCategoryCount('Verwaltung')} Dokumente</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <span className="text-4xl">🔧</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Technik</h3>
            <p className="mt-2 text-sm text-gray-600">{getCategoryCount('Technik')} Dokumente</p>
          </div>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Neueste Dokumente</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {documents.map((document) => (
            <div key={document.id} className="p-4 lg:p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="w-10 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 text-lg">{getFileIcon(document.fileType)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 break-words">{document.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 break-words">{document.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className={`text-xs ${getCategoryColor(document.category)} px-2 py-1 rounded-full whitespace-nowrap`}>
                        {document.category}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        📅 {formatDate(document.uploadedAt)}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        💾 {document.fileSize ? Number(document.fileSize).toFixed(1) : '0.0'} MB
                      </span>
                      {document.tags.length > 0 && (
                        <span className="text-xs text-gray-500 truncate max-w-full">
                          🏷️ {document.tags.slice(0, 2).join(', ')}
                          {document.tags.length > 2 && '...'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2 sm:gap-1 flex-shrink-0">
                  <button 
                    className="flex-1 sm:flex-none p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => viewDocument(document)}
                    title="Dokument anzeigen"
                  >
                    👁️
                  </button>
                  <button 
                    className="flex-1 sm:flex-none p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => downloadDocument(document)}
                    title="Dokument herunterladen"
                  >
                    📥
                  </button>
                  <button 
                    className="flex-1 sm:flex-none p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => startEditDocument(document)}
                    title="Dokument bearbeiten"
                  >
                    ✏️
                  </button>
                  <button 
                    className="flex-1 sm:flex-none p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => deleteDocument(document.id)}
                    title="Dokument löschen"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Viewer/Editor Modal */}
      {isViewerOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {isEditMode ? 'Dokument bearbeiten' : selectedDocument.title}
                </h3>
                <button
                  onClick={closeViewer}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {isEditMode ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titel
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Beschreibung
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategorie
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Sicherheit">Sicherheit</option>
                      <option value="Betrieb">Betrieb</option>
                      <option value="Verwaltung">Verwaltung</option>
                      <option value="Technik">Technik</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (durch Komma getrennt)
                    </label>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={saveEditDocument}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Änderungen speichern
                    </button>
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-6">
                  {/* Document Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Dateiname:</p>
                      <p className="text-sm text-gray-900">{selectedDocument.fileName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Dateigröße:</p>
                      <p className="text-sm text-gray-900">{selectedDocument.fileSize ? Number(selectedDocument.fileSize).toFixed(1) : '0.0'} MB</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Kategorie:</p>
                      <p className="text-sm text-gray-900">{selectedDocument.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Hochgeladen von:</p>
                      <p className="text-sm text-gray-900">{selectedDocument.uploadedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Hochgeladen am:</p>
                      <p className="text-sm text-gray-900">{formatDate(selectedDocument.uploadedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Tags:</p>
                      <p className="text-sm text-gray-900">
                        {selectedDocument.tags.length > 0 ? selectedDocument.tags.join(', ') : 'Keine Tags'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Document Content */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Dokumentvorschau:</h4>
                    {selectedDocument.fileUrl ? (
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        {selectedDocument.fileType === 'application/pdf' || selectedDocument.fileName.endsWith('.pdf') ? (
                          // PDF Preview
                          <iframe
                            src={selectedDocument.fileUrl}
                            className="w-full h-[600px]"
                            title={selectedDocument.title}
                          />
                        ) : selectedDocument.fileType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(selectedDocument.fileName) ? (
                          // Image Preview
                          <img
                            src={selectedDocument.fileUrl}
                            alt={selectedDocument.title}
                            className="w-full h-auto"
                          />
                        ) : (
                          // Other file types - show download link
                          <div className="p-8 text-center">
                            <div className="text-6xl mb-4">📄</div>
                            <p className="text-gray-600 mb-4">Vorschau nicht verfügbar für diesen Dateityp</p>
                            <a
                              href={selectedDocument.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Datei öffnen
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <p className="text-sm text-gray-500">Keine Datei verfügbar</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => downloadDocument(selectedDocument)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      📥 Herunterladen
                    </button>
                    <button
                      onClick={() => startEditDocument(selectedDocument)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      ✏️ Bearbeiten
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
