'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import ProtectedLayout from '@/components/ProtectedLayout'

interface User {
  id: string
  username: string
  display_name: string
  is_admin: boolean
  role: string
  is_active: boolean
  created_at: string
  last_login?: string
  created_by?: string
}

export default function AdminUsersPage() {
  const { isLoggedIn, isAdmin, currentUser } = useAuth()
  const router = useRouter()
  
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Neuer Benutzer Formular
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    displayName: '',
    role: 'Benutzer'
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  // Passwort-Reset Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  // Lösch-Bestätigungsdialog
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Prüfe Admin-Rechte
  useEffect(() => {
    if (isLoggedIn && !isAdmin) {
      router.push('/')
    }
  }, [isLoggedIn, isAdmin, router])

  // Lade Benutzer
  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      loadUsers()
    }
  }, [isLoggedIn, isAdmin])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.users)
      } else {
        setError(data.error || 'Fehler beim Laden der Benutzer')
      }
    } catch (err) {
      console.error('Failed to load users:', err)
      setError('Netzwerkfehler beim Laden der Benutzer')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    setFormSuccess(null)

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          displayName: formData.displayName,
          role: formData.role,
          createdBy: currentUser
        })
      })

      const data = await response.json()

      if (data.success) {
        setFormSuccess(`Benutzer "${data.user.displayName}" wurde erfolgreich erstellt!`)
        setFormData({
          username: '',
          password: '',
          displayName: '',
          role: 'Benutzer'
        })
        
        // Aktualisiere Benutzerliste
        loadUsers()
        
        // Schließe Formular nach 2 Sekunden
        setTimeout(() => {
          setShowCreateForm(false)
          setFormSuccess(null)
        }, 2000)
      } else {
        setFormError(data.error || 'Fehler beim Erstellen des Benutzers')
      }
    } catch (err) {
      console.error('Failed to create user:', err)
      setFormError('Netzwerkfehler - Bitte versuchen Sie es erneut')
    } finally {
      setFormLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleOpenPasswordModal = (user: User) => {
    setSelectedUser(user)
    setNewPassword('')
    setPasswordError(null)
    setPasswordSuccess(null)
    setShowPasswordModal(true)
  }

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false)
    setSelectedUser(null)
    setNewPassword('')
    setPasswordError(null)
    setPasswordSuccess(null)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setPasswordLoading(true)
    setPasswordError(null)
    setPasswordSuccess(null)

    try {
      const response = await fetch(`/api/users/${selectedUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword,
          adminUser: currentUser
        })
      })

      const data = await response.json()

      if (data.success) {
        setPasswordSuccess(data.message)
        setNewPassword('')
        
        // Schließe Modal nach 2 Sekunden
        setTimeout(() => {
          handleClosePasswordModal()
        }, 2000)
      } else {
        setPasswordError(data.error || 'Fehler beim Zurücksetzen des Passworts')
      }
    } catch (err) {
      console.error('Failed to reset password:', err)
      setPasswordError('Netzwerkfehler - Bitte versuchen Sie es erneut')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleOpenDeleteModal = (user: User) => {
    setUserToDelete(user)
    setDeleteError(null)
    setShowDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
    setDeleteError(null)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    setDeleteLoading(true)
    setDeleteError(null)

    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUser: currentUser
        })
      })

      const data = await response.json()

      if (data.success) {
        // Aktualisiere Benutzerliste
        loadUsers()
        handleCloseDeleteModal()
      } else {
        setDeleteError(data.error || 'Fehler beim Löschen des Benutzers')
      }
    } catch (err) {
      console.error('Failed to delete user:', err)
      setDeleteError('Netzwerkfehler - Bitte versuchen Sie es erneut')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Zeige nichts an, wenn nicht eingeloggt oder kein Admin
  if (!isLoggedIn || !isAdmin) {
    return null
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Benutzerverwaltung</h1>
            <p className="text-gray-600">Verwalten Sie Benutzer und erstellen Sie neue Konten</p>
          </div>

          {/* Erstelle neuen Benutzer Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
            >
              {showCreateForm ? '❌ Abbrechen' : '➕ Neuen Benutzer erstellen'}
            </button>
          </div>

          {/* Formular zum Erstellen neuer Benutzer */}
          {showCreateForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">➕ Neuen Benutzer erstellen</h2>
              
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Benutzername *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="z.B. max.mustermann"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anzeigename *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="z.B. Max Mustermann"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passwort * (mind. 5 Zeichen)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={5}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mindestens 5 Zeichen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rolle *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Benutzer">Benutzer</option>
                    <option value="Technik">Technik</option>
                    <option value="Verwaltung">Verwaltung</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Admin: Voller Zugriff auf alle Bereiche | Andere: Standard-Rechte
                  </p>
                </div>

                {formError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700">{formError}</p>
                  </div>
                )}

                {formSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-green-700">{formSuccess}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? 'Wird erstellt...' : 'Benutzer erstellen'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Benutzerliste */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Alle Benutzer ({users.length})</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Lade Benutzer...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadUsers}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Erneut versuchen
                </button>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Keine Benutzer gefunden
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Benutzer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rolle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Letzter Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Erstellt am
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Erstellt von
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.display_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.username}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.role === 'Admin' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              👑 Admin
                            </span>
                          ) : user.role === 'Verwaltung' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              📋 Verwaltung
                            </span>
                          ) : user.role === 'Technik' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              🔧 Technik
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              👤 Benutzer
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✅ Aktiv
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ❌ Deaktiviert
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.last_login || '')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.created_by || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenPasswordModal(user)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                              title="Passwort zurücksetzen"
                            >
                              🔑
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(user)}
                              className="text-red-600 hover:text-red-900 font-medium"
                              title="Benutzer löschen"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Passwort-Reset Modal */}
          {showPasswordModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  🔑 Passwort zurücksetzen
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Neues Passwort für <strong>{selectedUser.display_name}</strong> festlegen:
                </p>
                
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Neues Passwort * (mind. 5 Zeichen)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={5}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mindestens 5 Zeichen"
                      autoFocus
                    />
                  </div>

                  {passwordError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <p className="text-red-700 text-sm">{passwordError}</p>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                      <p className="text-green-700 text-sm">{passwordSuccess}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordLoading ? 'Wird gespeichert...' : 'Passwort speichern'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClosePasswordModal}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Abbrechen
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Lösch-Bestätigungsdialog */}
          {showDeleteModal && userToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold text-red-600 mb-4">
                  ⚠️ Benutzer löschen
                </h2>
                <p className="text-sm text-gray-700 mb-4">
                  Möchten Sie den Benutzer <strong>{userToDelete.display_name}</strong> wirklich löschen?
                </p>
                <p className="text-xs text-red-600 mb-6">
                  Diese Aktion kann nicht rückgängig gemacht werden!
                </p>

                {deleteError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
                    <p className="text-red-700 text-sm">{deleteError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteUser}
                    disabled={deleteLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading ? 'Wird gelöscht...' : 'Ja, löschen'}
                  </button>
                  <button
                    onClick={handleCloseDeleteModal}
                    disabled={deleteLoading}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info-Box - Rollen-Erklärung */}
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800 mb-3">Benutzer-Rollen im System</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700">
                  <div>
                    <p className="font-semibold">👑 Admin</p>
                    <p className="text-xs mt-1">Voller Zugriff auf alle Bereiche, kann Benutzer verwalten</p>
                  </div>
                  <div>
                    <p className="font-semibold">📋 Verwaltung</p>
                    <p className="text-xs mt-1">Standard-Rechte für Verwaltungspersonal</p>
                  </div>
                  <div>
                    <p className="font-semibold">🔧 Technik</p>
                    <p className="text-xs mt-1">Standard-Rechte für technisches Personal</p>
                  </div>
                  <div>
                    <p className="font-semibold">👤 Benutzer</p>
                    <p className="text-xs mt-1">Standard-Rechte für alle anderen Mitarbeiter</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600">
                    <strong>Administratoren:</strong> Christof Drost, Kirstin Kreusch
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}

