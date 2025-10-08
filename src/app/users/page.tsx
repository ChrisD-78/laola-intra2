'use client'

import { useState } from 'react'

export default function UsersAdmin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, metadata: { full_name: fullName } })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Fehler beim Anlegen')
      setMessage('Nutzer angelegt: ' + json.user.email)
      setEmail('')
      setPassword('')
      setFullName('')
      setRole('user')
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow p-6 space-y-4">
      <h1 className="text-2xl font-bold">Nutzer anlegen</h1>
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Voller Name</label>
          <input type="text" value={fullName} onChange={(e)=>setFullName(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
          <select value={role} onChange={(e)=>setRole(e.target.value as 'user'|'admin')} className="w-full px-3 py-2 border rounded">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
            {loading ? 'Anlegen...' : 'Anlegen'}
          </button>
        </div>
      </form>
      {message && (
        <div className="text-sm text-gray-700">{message}</div>
      )}
    </div>
  )
}


