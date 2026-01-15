'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { getChatUsers, getDirectMessages, getChatGroups, getGroupMessages, ChatMessageRecord } from '@/lib/db'

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

interface LatestMessage {
  sender: string
  content: string
  timestamp: string
  isImage: boolean
}

interface ChatNotificationContextType {
  unreadCount: number
  latestMessage: LatestMessage | null
  refreshUnreadCount: () => void
}

const ChatNotificationContext = createContext<ChatNotificationContextType | undefined>(undefined)

export function ChatNotificationProvider({ children }: { children: ReactNode }) {
  const { currentUser: authUser } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [latestMessage, setLatestMessage] = useState<LatestMessage | null>(null)
  const fallbackUsers = [
    'Christof Drost',
    'Kirstin Kreusch',
    'Julia Wodonis',
    'Lisa Schnagl',
    'Jonas Jooss',
    'Dennis Wilkens',
    'Lea Hofmann',
    'Team LAOLA',
    'Verwaltung Stadtholding Landau'
  ]

  const refreshUnreadCount = async () => {
    if (!authUser) {
      setUnreadCount(0)
      return
    }

    try {
      const allMessages: Message[] = []

      // 1. Get all direct messages from all users
      try {
        const dbUsers = await getChatUsers()
        const userIds = dbUsers.length > 0
          ? dbUsers.map(user => user.id)
          : fallbackUsers

        for (const userId of userIds) {
          if (userId === authUser) continue

          try {
            const dbMessages = await getDirectMessages(authUser, userId)
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
            allMessages.push(...localMessages)
          } catch (e) {
            // Ignore errors for individual users
          }
        }
      } catch (e) {
        console.error('Failed to load direct messages:', e)
      }

      // 2. Get all group messages
      try {
        const dbGroups = await getChatGroups()
        const userGroups = dbGroups.filter(group => 
          group.members && group.members.includes(authUser)
        )

        for (const group of userGroups) {
          try {
            const dbMessages = await getGroupMessages(group.id)
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
            allMessages.push(...localMessages)
          } catch (e) {
            // Ignore errors for individual groups
          }
        }
      } catch (e) {
        console.error('Failed to load group messages:', e)
      }

      // 3. Count unread messages (both direct and group)
      const unreadDirectMessages = allMessages.filter(msg => 
        msg.recipient === authUser && 
        !msg.isRead
      )

      const unreadGroupMessages = allMessages.filter(msg => 
        msg.groupId && 
        msg.sender !== authUser && 
        !msg.isRead
      )

      const totalUnread = unreadDirectMessages.length + unreadGroupMessages.length
      
      // 4. Find latest unread message
      const allUnreadMessages = [...unreadDirectMessages, ...unreadGroupMessages]
      if (allUnreadMessages.length > 0) {
        // Sort by timestamp (newest first)
        const sortedUnread = allUnreadMessages.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        const latest = sortedUnread[0]
        
        // Get sender name
        const senderName = latest.sender
        
        setLatestMessage({
          sender: senderName,
          content: latest.imageUrl ? '📷 Bild' : (latest.content || 'Nachricht'),
          timestamp: latest.timestamp,
          isImage: !!latest.imageUrl
        })
      } else {
        setLatestMessage(null)
      }
      
      console.log(`📬 Unread: ${totalUnread} (Direct: ${unreadDirectMessages.length}, Groups: ${unreadGroupMessages.length})`)
      setUnreadCount(totalUnread)
    } catch (e) {
      console.error('Failed to refresh unread count:', e)
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    if (!authUser) {
      setUnreadCount(0)
      return
    }

    // Initial load
    refreshUnreadCount()

    // Poll every 2 seconds (schnellere Updates für bessere UX)
    const interval = setInterval(refreshUnreadCount, 2000)

    return () => clearInterval(interval)
  }, [authUser])

  return (
    <ChatNotificationContext.Provider value={{ unreadCount, latestMessage, refreshUnreadCount }}>
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

