'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useChatNotifications } from '@/contexts/ChatNotificationContext'
import { upsertChatUser, getChatUsers, getChatGroups, createChatGroup, getDirectMessages, getGroupMessages, sendChatMessage, updateChatMessageStatus, ChatMessageRecord } from '@/lib/db'

interface Message {
  id: string
  sender: string
  recipient?: string
  groupId?: string
  content: string
  timestamp: string
  isRead: boolean
  imageUrl?: string
  imageName?: string
}

interface User {
  id: string
  name: string
  isOnline: boolean
  avatar?: string
}

interface Group {
  id: string
  name: string
  members: string[]
  createdBy: string
  createdAt: string
  description?: string
}

export default function Chat() {
  const { currentUser: authUser } = useAuth()
  const { refreshUnreadCount } = useChatNotifications()
  const [selectedRecipient, setSelectedRecipient] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [allMessages, setAllMessages] = useState<Message[]>([]) // All messages from all users for unread counts
  const [groups, setGroups] = useState<Group[]>([])
  // Initial seed users - alle registrierten Benutzer
  const [users, setUsers] = useState<User[]>([
    { id: 'Christof Drost', name: 'Christof Drost', isOnline: false },
    { id: 'Kirstin Kreusch', name: 'Kirstin Kreusch', isOnline: false },
    { id: 'Julia Wodonis', name: 'Julia Wodonis', isOnline: false },
    { id: 'Lisa Schnagl', name: 'Lisa Schnagl', isOnline: false },
    { id: 'Jonas Jooss', name: 'Jonas Jooss', isOnline: false },
    { id: 'Dennis Wilkens', name: 'Dennis Wilkens', isOnline: false },
    { id: 'Lea Hofmann', name: 'Lea Hofmann', isOnline: false },
    { id: 'Team LAOLA', name: 'Team LAOLA', isOnline: false },
    { id: 'Verwaltung Stadtholding Landau', name: 'Verwaltung Stadtholding Landau', isOnline: false },
  ])
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct')
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null)
  const [profileName, setProfileName] = useState('')


  // Initial load of users/groups from Supabase
  useEffect(() => {
    const load = async () => {
      try {
        const [dbUsers, dbGroups] = await Promise.all([
          getChatUsers(),
          getChatGroups(),
        ])
        // Merge DB users with local seed users
        if (dbUsers.length > 0) {
          // Use DB users but merge with local seed users
          const seedUserIds = users.map(u => u.id)
          const dbUsersMapped = dbUsers.map(u => ({ 
            id: u.id, 
            name: u.name, 
            isOnline: u.is_online, 
            avatar: u.avatar || undefined 
          }))
          
          // Add seed users that aren't in DB yet
          const mergedUsers = [...dbUsersMapped]
          users.forEach(seedUser => {
            if (!dbUsersMapped.find(u => u.id === seedUser.id)) {
              mergedUsers.push(seedUser)
            }
          })
          
          setUsers(mergedUsers as User[])
        }
        // Groups loaded from DB
        setGroups(dbGroups.map(g => ({ 
          id: g.id as string, 
          name: g.name, 
          members: [], 
          createdBy: g.created_by, 
          createdAt: g.created_at || new Date().toISOString(), 
          description: g.description || undefined 
        })))
      } catch (e) {
        console.error('Load chat users/groups failed', e)
      }
    }
    load()
  }, [])

  // Auto-login mit dem aktuell angemeldeten Benutzer
  useEffect(() => {
    if (authUser) {
      // Upsert user in Supabase (online)
      const user = users.find(u => u.id === authUser)
      upsertChatUser({ 
        id: authUser, 
        name: user?.name || authUser, 
        is_online: true, 
        avatar: user?.avatar || null 
      }).catch(() => {})
      
      // Set profile data
      if (user) {
        setProfileName(user.name)
        setProfileAvatar(user.avatar || null)
      }
    }
  }, [authUser])

  // Load messages when recipient or group changes
  useEffect(() => {
    if (!authUser) return
    
    const loadMessages = async () => {
      try {
        let dbMessages: ChatMessageRecord[] = []
        
        if (selectedGroup) {
          dbMessages = await getGroupMessages(selectedGroup)
        } else if (selectedRecipient) {
          dbMessages = await getDirectMessages(authUser, selectedRecipient)
        }
        
        // Convert DB messages to local Message format
        const localMessages: Message[] = dbMessages.map(msg => ({
          id: msg.id as string,
          sender: msg.sender_id,
          recipient: msg.recipient_id || undefined,
          groupId: msg.group_id || undefined,
          content: msg.content,
          timestamp: msg.created_at || new Date().toISOString(),
          isRead: msg.is_read,
          imageUrl: msg.image_url || undefined,
          imageName: msg.image_name || undefined
        }))
        
        setMessages(localMessages)
      } catch (e) {
        console.error('Load messages failed', e)
      }
    }
    
    loadMessages()
  }, [authUser, selectedRecipient, selectedGroup])

  // Real-time polling for new messages (every 3 seconds)
  useEffect(() => {
    if (!authUser) return
    if (!selectedRecipient && !selectedGroup) return
    
    const pollMessages = async () => {
      try {
        let dbMessages: ChatMessageRecord[] = []
        
        if (selectedGroup) {
          dbMessages = await getGroupMessages(selectedGroup)
        } else if (selectedRecipient) {
          dbMessages = await getDirectMessages(authUser, selectedRecipient)
        }
        
        // Convert DB messages to local Message format
        const localMessages: Message[] = dbMessages.map(msg => ({
          id: msg.id as string,
          sender: msg.sender_id,
          recipient: msg.recipient_id || undefined,
          groupId: msg.group_id || undefined,
          content: msg.content,
          timestamp: msg.created_at || new Date().toISOString(),
          isRead: msg.is_read,
          imageUrl: msg.image_url || undefined,
          imageName: msg.image_name || undefined
        }))
        
        // Only update if messages have changed
        if (JSON.stringify(localMessages) !== JSON.stringify(messages)) {
          setMessages(localMessages)
        }
      } catch (e) {
        console.error('Poll messages failed', e)
      }
    }
    
    // Poll every 3 seconds
    const interval = setInterval(pollMessages, 3000)
    
    // Cleanup on unmount
    return () => clearInterval(interval)
  }, [authUser, selectedRecipient, selectedGroup, messages])

  // Poll all messages from all users for unread counts (every 5 seconds)
  useEffect(() => {
    if (!authUser) return
    
    const pollAllMessages = async () => {
      try {
        const allUserMessages: Message[] = []
        
        // Get messages from all users
        for (const user of users) {
          if (user.id === authUser) continue
          
          try {
            const dbMessages = await getDirectMessages(authUser, user.id)
            const localMessages: Message[] = dbMessages.map(msg => ({
              id: msg.id as string,
              sender: msg.sender_id,
              recipient: msg.recipient_id || undefined,
              groupId: msg.group_id || undefined,
              content: msg.content,
              timestamp: msg.created_at || new Date().toISOString(),
              isRead: msg.is_read,
              imageUrl: msg.image_url || undefined,
              imageName: msg.image_name || undefined
            }))
            allUserMessages.push(...localMessages)
          } catch (e) {
            // Ignore errors for individual users
          }
        }
        
        setAllMessages(allUserMessages)
      } catch (e) {
        console.error('Poll all messages failed', e)
      }
    }
    
    // Initial load
    pollAllMessages()
    
    // Poll every 5 seconds
    const interval = setInterval(pollAllMessages, 5000)
    
    // Cleanup on unmount
    return () => clearInterval(interval)
  }, [authUser, users])

  const createGroup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim() || selectedGroupMembers.length === 0) return
    if (!authUser) return

    ;(async () => {
      try {
        const groupId = await createChatGroup({ name: newGroupName.trim(), description: newGroupDescription.trim() || null, created_by: authUser }, [...selectedGroupMembers, authUser])
        setGroups(prev => [{ id: groupId, name: newGroupName.trim(), members: [...selectedGroupMembers, authUser], createdBy: authUser, createdAt: new Date().toISOString(), description: newGroupDescription.trim() || undefined }, ...prev])
        setNewGroupName('')
        setNewGroupDescription('')
        setSelectedGroupMembers([])
        setShowCreateGroup(false)
        setActiveTab('groups')
        setSelectedGroup(groupId)
      } catch (e) {
        console.error('Create group failed', e)
        alert('Gruppe konnte nicht erstellt werden.')
      }
    })()
  }

  const toggleGroupMember = (userId: string) => {
    setSelectedGroupMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileAvatar(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setProfileAvatar(null)
  }

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileName.trim() || !authUser) return

    setUsers(prev => prev.map(user => 
      user.id === authUser 
        ? { ...user, name: profileName.trim(), avatar: profileAvatar || undefined }
        : user
    ))
    setShowProfileSettings(false)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedImage) || (!selectedRecipient && !selectedGroup)) return
    if (!authUser) return

    const message: Message = {
      id: Date.now().toString(),
      sender: authUser,
      recipient: selectedRecipient || undefined,
      groupId: selectedGroup || undefined,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      imageUrl: selectedImage ? URL.createObjectURL(selectedImage) : undefined,
      imageName: selectedImage?.name
    }

    setMessages(prev => [message, ...prev])
    setNewMessage('')
    setSelectedImage(null)
    setImagePreview(null)

    // Persist in Supabase
    sendChatMessage({
      sender_id: authUser,
      recipient_id: selectedRecipient || null,
      group_id: selectedGroup || null,
      content: message.content,
      is_read: false,
      image_url: null,
      image_name: message.imageName || null,
    }).catch(err => {
      console.error('Send message failed', err)
    })
  }

  const getMessagesForUser = (userId: string) => {
    if (!authUser) return []
    return messages.filter(msg => 
      (msg.sender === authUser && msg.recipient === userId) ||
      (msg.sender === userId && msg.recipient === authUser)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const getMessagesForGroup = (groupId: string) => {
    return messages.filter(msg => msg.groupId === groupId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const getCurrentMessages = () => {
    if (selectedGroup) {
      return getMessagesForGroup(selectedGroup)
    } else if (selectedRecipient) {
      return getMessagesForUser(selectedRecipient)
    }
    return []
  }

  const getUnreadCount = (userId: string) => {
    if (!authUser) return 0
    return allMessages.filter(msg => 
      msg.sender === userId && 
      msg.recipient === authUser && 
      !msg.isRead
    ).length
  }

  const getGroupUnreadCount = (groupId: string) => {
    if (!authUser) return 0
    return messages.filter(msg => 
      msg.groupId === groupId && 
      msg.sender !== authUser && 
      !msg.isRead
    ).length
  }

  const markAsRead = async (userId: string) => {
    if (!authUser) return
    // FIRST: Get unread messages BEFORE updating state
    const unreadMessages = allMessages.filter(msg => 
      msg.sender === userId && msg.recipient === authUser && !msg.isRead
    )
    
    // SECOND: Update database
    try {
      for (const msg of unreadMessages) {
        await updateChatMessageStatus(msg.id, true)
      }
      console.log(`✅ Marked ${unreadMessages.length} messages as read in database`)
    } catch (e) {
      console.error('❌ Mark as read failed:', e)
      return // Don't update local state if DB update fails
    }
    
    // THIRD: Update local state only after successful DB update
    setMessages(prev => prev.map(msg => 
      msg.sender === userId && msg.recipient === authUser && !msg.isRead
        ? { ...msg, isRead: true }
        : msg
    ))
    
    setAllMessages(prev => prev.map(msg => 
      msg.sender === userId && msg.recipient === authUser && !msg.isRead
        ? { ...msg, isRead: true }
        : msg
    ))
    
    // FOURTH: Refresh unread count in sidebar
    refreshUnreadCount()
  }

  const markGroupAsRead = async (groupId: string) => {
    if (!authUser) return
    // FIRST: Get unread messages BEFORE updating state
    const unreadMessages = allMessages.filter(msg => 
      msg.groupId === groupId && msg.sender !== authUser && !msg.isRead
    )
    
    // SECOND: Update database
    try {
      for (const msg of unreadMessages) {
        await updateChatMessageStatus(msg.id, true)
      }
      console.log(`✅ Marked ${unreadMessages.length} group messages as read in database`)
    } catch (e) {
      console.error('❌ Mark group as read failed:', e)
      return // Don't update local state if DB update fails
    }
    
    // THIRD: Update local state only after successful DB update
    setMessages(prev => prev.map(msg => 
      msg.groupId === groupId && msg.sender !== authUser && !msg.isRead
        ? { ...msg, isRead: true }
        : msg
    ))
    
    setAllMessages(prev => prev.map(msg => 
      msg.groupId === groupId && msg.sender !== authUser && !msg.isRead
        ? { ...msg, isRead: true }
        : msg
    ))
    
    // FOURTH: Refresh unread count in sidebar
    refreshUnreadCount()
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

  const getUserAvatar = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.avatar
  }

  const getUserInitials = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.name.split(' ').map(n => n[0]).join('') || 'U'
  }

  // Wenn nicht angemeldet, Hinweis anzeigen
  if (!authUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">💬</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chat</h1>
          <p className="text-gray-600 mb-4">
            Bitte melden Sie sich zuerst am Intranet an, um den Chat nutzen zu können.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Zur Anmeldung
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-4 lg:p-8 text-white text-center mb-6">
          <h1 className="text-2xl lg:text-4xl font-bold mb-2">Chat</h1>
          <p className="text-sm lg:text-base text-white/90">
            Kommunizieren Sie mit Ihren Kollegen und Teams
          </p>
          <p className="text-xs text-white/80 mt-2">Angemeldet als: {authUser}</p>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 mb-6">
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setShowProfileSettings(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Profil bearbeiten"
            >
              ⚙️ Profil
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* User List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('direct')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      activeTab === 'direct' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Direkt
                  </button>
                  <button
                    onClick={() => setActiveTab('groups')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      activeTab === 'groups' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Gruppen
                  </button>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {activeTab === 'direct' ? (
                <>
                  {users.filter(user => user.id !== authUser).map(user => {
                    const unreadCount = getUnreadCount(user.id)
                    const lastMessage = getMessagesForUser(user.id).slice(-1)[0]
                    
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          setSelectedRecipient(user.id)
                          setSelectedGroup('')
                          markAsRead(user.id)
                          // Load direct messages from DB
                          getDirectMessages(authUser, user.id).then(dbMsgs => {
                            const mapped: Message[] = dbMsgs.map((m: ChatMessageRecord) => ({
                              id: m.id as string,
                              sender: m.sender_id,
                              recipient: m.recipient_id || undefined,
                              groupId: m.group_id || undefined,
                              content: m.content,
                              timestamp: m.created_at || new Date().toISOString(),
                              isRead: m.is_read,
                              imageUrl: m.image_url || undefined,
                              imageName: m.image_name || undefined,
                            }))
                            setMessages(mapped)
                          }).catch(() => {})
                        }}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                          selectedRecipient === user.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {getUserAvatar(user.id) ? (
                              <img
                                src={getUserAvatar(user.id)}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                user.isOnline ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {getUserInitials(user.id)}
                              </div>
                            )}
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
                                {lastMessage.sender === authUser ? 'Sie: ' : ''}
                                {lastMessage.imageUrl ? '📷 Bild' : lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowCreateGroup(true)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-lg">➕</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Neue Gruppe erstellen</p>
                        <p className="text-xs text-gray-500">Gruppenchat starten</p>
                      </div>
                    </div>
                  </button>
                  {groups.filter(group => group.members.includes(authUser)).map(group => {
                    const unreadCount = getGroupUnreadCount(group.id)
                    const lastMessage = getMessagesForGroup(group.id).slice(-1)[0]
                    
                    return (
                      <button
                        key={group.id}
                        onClick={() => {
                          setSelectedGroup(group.id)
                          setSelectedRecipient('')
                          markGroupAsRead(group.id)
                          // Load group messages from DB
                          getGroupMessages(group.id).then(dbMsgs => {
                            const mapped: Message[] = dbMsgs.map((m: ChatMessageRecord) => ({
                              id: m.id as string,
                              sender: m.sender_id,
                              recipient: m.recipient_id || undefined,
                              groupId: m.group_id || undefined,
                              content: m.content,
                              timestamp: m.created_at || new Date().toISOString(),
                              isRead: m.is_read,
                              imageUrl: m.image_url || undefined,
                              imageName: m.image_name || undefined,
                            }))
                            setMessages(mapped)
                          }).catch(() => {})
                        }}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                          selectedGroup === group.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-lg">👥</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {group.name}
                              </p>
                              {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {group.members.length} Mitglieder
                            </p>
                            {lastMessage && (
                              <p className="text-xs text-gray-500 truncate">
                                {lastMessage.sender === authUser ? 'Sie: ' : `${users.find(u => u.id === lastMessage.sender)?.name}: `}
                                {lastMessage.imageUrl ? '📷 Bild' : lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm flex flex-col">
            {selectedRecipient || selectedGroup ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    {selectedRecipient ? (
                      <>
                        {getUserAvatar(selectedRecipient) ? (
                          <img
                            src={getUserAvatar(selectedRecipient)}
                            alt={users.find(u => u.id === selectedRecipient)?.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            users.find(u => u.id === selectedRecipient)?.isOnline 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {getUserInitials(selectedRecipient)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {users.find(u => u.id === selectedRecipient)?.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {users.find(u => u.id === selectedRecipient)?.isOnline ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-lg">👥</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {groups.find(g => g.id === selectedGroup)?.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {groups.find(g => g.id === selectedGroup)?.members.length} Mitglieder
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto max-h-64 lg:max-h-96">
                  <div className="space-y-4">
                    {getCurrentMessages().map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === authUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs sm:max-w-sm lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === authUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}>
                          {selectedGroup && message.sender !== authUser && (
                            <p className={`text-xs font-medium mb-1 ${
                              message.sender === authUser ? 'text-blue-100' : 'text-gray-600'
                            }`}>
                              {users.find(u => u.id === message.sender)?.name}
                            </p>
                          )}
                          {message.imageUrl && (
                            <div className="mb-2">
                              <img
                                src={message.imageUrl}
                                alt={message.imageName || 'Bild'}
                                className="max-w-full h-auto rounded-lg cursor-pointer"
                                onClick={() => window.open(message.imageUrl, '_blank')}
                                title="Klicken zum Vergrößern"
                              />
                              {message.imageName && (
                                <p className={`text-xs mt-1 ${
                                  message.sender === authUser ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {message.imageName}
                                </p>
                              )}
                            </div>
                          )}
                          {message.content && (
                            <p className="text-sm">{message.content}</p>
                          )}
                          <p className={`text-xs mt-1 ${
                            message.sender === authUser ? 'text-blue-100' : 'text-gray-500'
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
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={imagePreview}
                            alt="Vorschau"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedImage?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(selectedImage?.size || 0) / 1024 / 1024 < 1
                                ? `${Math.round((selectedImage?.size || 0) / 1024)} KB`
                                : `${Math.round((selectedImage?.size || 0) / 1024 / 1024 * 10) / 10} MB`
                              }
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Bild entfernen"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={sendMessage} className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nachricht eingeben..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <label className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer flex items-center space-x-2">
                        <span>📷</span>
                        <span>Bild</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={!newMessage.trim() && !selectedImage}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Senden
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 text-2xl">💬</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Wählen Sie einen Chat</h3>
                  <p className="text-gray-500">Wählen Sie einen Kontakt oder eine Gruppe aus, um eine Nachricht zu senden</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Settings Modal */}
        {showProfileSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Profil bearbeiten</h2>
                  <button
                    onClick={() => setShowProfileSettings(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={saveProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profilbild
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {profileAvatar ? (
                          <img
                            src={profileAvatar}
                            alt="Profilbild"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl text-gray-400">
                            {authUser && getUserInitials(authUser)}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm">
                          📷 Bild wählen
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarSelect}
                            className="hidden"
                          />
                        </label>
                        {profileAvatar && (
                          <button
                            type="button"
                            onClick={removeAvatar}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            🗑️ Entfernen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Ihr Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowProfileSettings(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={!profileName.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Speichern
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Neue Gruppe erstellen</h2>
                  <button
                    onClick={() => setShowCreateGroup(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={createGroup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gruppenname
                    </label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="z.B. Projekt Team"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Beschreibung (optional)
                    </label>
                    <input
                      type="text"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      placeholder="Kurze Beschreibung der Gruppe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mitglieder auswählen
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {users.filter(user => user.id !== authUser).map(user => (
                        <label key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedGroupMembers.includes(user.id)}
                            onChange={() => toggleGroupMember(user.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex items-center space-x-2">
                            {getUserAvatar(user.id) ? (
                              <img
                                src={getUserAvatar(user.id)}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                user.isOnline ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {getUserInitials(user.id)}
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900">{user.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateGroup(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={!newGroupName.trim() || selectedGroupMembers.length === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Gruppe erstellen
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
