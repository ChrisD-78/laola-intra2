import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Agent – LA OLA Intranet',
  description: 'KI-Assistent für Administratoren',
}

export default function AgentLayout({ children }: { children: ReactNode }) {
  return children
}
