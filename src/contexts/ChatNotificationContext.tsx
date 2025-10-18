'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { getChatUsers, getDirectMessages, ChatMessageRecord } from '@/lib/db'

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

interface ChatNotificationContextType {
  unreadCount: number
  refreshUnreadCount: () => void
}

const ChatNotificationContext = createContext<ChatNotificationContextType | undefined>(undefined)

export function ChatNotificationProvider({ children }: { children: ReactNode }) {
  const { currentUser: authUser } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshUnreadCount = async () => {
    if (!authUser) {
      setUnreadCount(0)
      return
    }

    try {
      // Get all users
      const dbUsers = await getChatUsers()
      const allUserMessages: Message[] = []

      // Get messages from all users
      for (const user of dbUsers) {
        if (user.id === authUser) continue

        try {
          const dbMessages = await getDirectMessages(authUser, user.id)
          const localMessages: Message[] = dbMessages.map((msg: ChatMessageRecord) => ({
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

      // Count unread messages
      const count = allUserMessages.filter(msg => 
        msg.recipient === authUser && 
        !msg.isRead
      ).length

      setUnreadCount(count)
    } catch (e) {
      console.error('Failed to refresh unread count:', e)
    }
  }

  useEffect(() => {
    if (!authUser) {
      setUnreadCount(0)
      return
    }

    // Initial load
    refreshUnreadCount()

    // Poll every 5 seconds
    const interval = setInterval(refreshUnreadCount, 5000)

    return () => clearInterval(interval)
  }, [authUser])

  return (
    <ChatNotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </ChatNotificationContext.Provider>
  )
}

export function useChatNotifications() {
  const context = useContext(ChatNotificationContext)
  if (context === undefined) {
    throw new Error('useChatNotifications must be used within a ChatNotificationProvider')
  }
  return context
}

