'use client'

import { useState, useEffect } from 'react'

interface Message {
  id: string
  sender: string
  recipient: string
  content: string
  timestamp: string
  isRead: boolean
}

interface User {
  id: string
  name: string
  isOnline: boolean
}

export default function Chat() {
  const [currentUser, setCurrentUser] = useState<string>('')
  const [selectedRecipient, setSelectedRecipient] = useState<string>('')
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([
    { id: 'christof', name: 'Christof Drost', isOnline: true },
    { id: 'max', name: 'Max Mustermann', isOnline: false },
    { id: 'anna', name: 'Anna Schmidt', isOnline: true },
    { id: 'tom', name: 'Tom Weber', isOnline: false },
    { id: 'maria', name: 'Maria Müller', isOnline: true }
  ])
  const [showLogin, setShowLogin] = useState(true)

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages')
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }
    
    const savedUser = localStorage.getItem('currentChatUser')
    if (savedUser) {
      setCurrentUser(savedUser)
      setShowLogin(false)
    }
  }, [])

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages))
  }, [messages])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentUser.trim()) {
      localStorage.setItem('currentChatUser', currentUser)
      setShowLogin(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentChatUser')
    setCurrentUser('')
    setShowLogin(true)
    setSelectedRecipient('')
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedRecipient) return

    const message: Message = {
      id: Date.now().toString(),
      sender: currentUser,
      recipient: selectedRecipient,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    }

    setMessages(prev => [message, ...prev])
    setNewMessage('')
  }

  const getMessagesForUser = (userId: string) => {
    return messages.filter(msg => 
      (msg.sender === currentUser && msg.recipient === userId) ||
      (msg.sender === userId && msg.recipient === currentUser)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const getUnreadCount = (userId: string) => {
    return messages.filter(msg => 
      msg.sender === userId && 
      msg.recipient === currentUser && 
      !msg.isRead
    ).length
  }

  const markAsRead = (userId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.sender === userId && msg.recipient === currentUser && !msg.isRead
        ? { ...msg, isRead: true }
        : msg
    ))
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Gestern'
    } else {
      return date.toLocaleDateString('de-DE')
    }
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">💬</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Chat Anmeldung</h1>
            <p className="text-gray-600 mt-2">Bitte wählen Sie Ihren Benutzernamen</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benutzername
              </label>
              <select
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Benutzer auswählen</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Anmelden
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">💬</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
                <p className="text-gray-600">Angemeldet als: {users.find(u => u.id === currentUser)?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Abmelden
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Kontakte</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {users.filter(user => user.id !== currentUser).map(user => {
                const unreadCount = getUnreadCount(user.id)
                const lastMessage = getMessagesForUser(user.id).slice(-1)[0]
                
                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedRecipient(user.id)
                      markAsRead(user.id)
                    }}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedRecipient === user.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.isOnline ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {user.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        {lastMessage && (
                          <p className="text-xs text-gray-500 truncate">
                            {lastMessage.sender === currentUser ? 'Sie: ' : ''}
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm flex flex-col">
            {selectedRecipient ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      users.find(u => u.id === selectedRecipient)?.isOnline 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {users.find(u => u.id === selectedRecipient)?.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {users.find(u => u.id === selectedRecipient)?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {users.find(u => u.id === selectedRecipient)?.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto max-h-96">
                  <div className="space-y-4">
                    {getMessagesForUser(selectedRecipient).map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === currentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === currentUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === currentUser ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={sendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Nachricht eingeben..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Senden
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 text-2xl">💬</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Wählen Sie einen Kontakt</h3>
                  <p className="text-gray-500">Wählen Sie einen Kontakt aus, um eine Nachricht zu senden</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
