'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { useAuth } from '@/components/AuthProvider'
import { isAutoRefreshPausedLocal } from '@/lib/quietHours'

/** Alle 30s bei sichtbarem Tab; bei verstecktem Tab kein automatisches Pollen → weniger Netlify-Functions */
const POLL_MS_VISIBLE = 30_000

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

const ChatNotificationContext = createContext<ChatNotificationContextType | undefined>(
  undefined,
)

export function ChatNotificationProvider({ children }: { children: ReactNode }) {
  const { currentUser: authUser } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [latestMessage, setLatestMessage] = useState<LatestMessage | null>(null)

  const refreshUnreadCount = useCallback(async () => {
    if (!authUser) {
      setUnreadCount(0)
      setLatestMessage(null)
      return
    }

    try {
      const res = await fetch(
        `/api/chat/unread-summary?viewer=${encodeURIComponent(authUser)}`,
        { cache: 'no-store' },
      )
      if (!res.ok) {
        throw new Error(`unread-summary ${res.status}`)
      }
      const data = (await res.json()) as {
        unreadCount?: number
        latestMessage?: LatestMessage | null
      }

      const count = typeof data.unreadCount === 'number' ? data.unreadCount : 0
      setUnreadCount(count)
      setLatestMessage(
        count > 0 && data.latestMessage
          ? {
              sender: data.latestMessage.sender,
              content: data.latestMessage.content,
              timestamp: data.latestMessage.timestamp,
              isImage: !!data.latestMessage.isImage,
            }
          : null,
      )
    } catch (e) {
      console.error('Failed to refresh unread count:', e)
      setUnreadCount(0)
      setLatestMessage(null)
    }
  }, [authUser])

  useEffect(() => {
    if (!authUser) {
      setUnreadCount(0)
      setLatestMessage(null)
      return
    }

    void refreshUnreadCount()

    const tick = () => {
      if (isAutoRefreshPausedLocal()) return
      if (document.visibilityState === 'visible') {
        void refreshUnreadCount()
      }
    }

    const iv = window.setInterval(tick, POLL_MS_VISIBLE)
    const onVisible = () => {
      if (isAutoRefreshPausedLocal()) return
      if (document.visibilityState === 'visible') {
        void refreshUnreadCount()
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.clearInterval(iv)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [authUser, refreshUnreadCount])

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
