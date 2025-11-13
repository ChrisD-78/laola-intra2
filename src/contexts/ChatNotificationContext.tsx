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
      const allMessages: Message[] = []

      // 1. Get all direct messages from all users
      try {
        const dbUsers = await getChatUsers()
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
      ).length

      const unreadGroupMessages = allMessages.filter(msg => 
        msg.groupId && 
        msg.sender !== authUser && 
        !msg.isRead
      ).length

      const totalUnread = unreadDirectMessages + unreadGroupMessages
      
      console.log(`📬 Unread: ${totalUnread} (Direct: ${unreadDirectMessages}, Groups: ${unreadGroupMessages})`)
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

    // Poll every 3 seconds (schnellere Updates für bessere UX)
    const interval = setInterval(refreshUnreadCount, 3000)

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

