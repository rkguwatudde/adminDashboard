"use client"

import { Sidebar } from './sidebar'
import { Header } from './header'
import { AuthGuard } from '../auth/AuthGuard'
import { InactivityProvider } from '../auth/InactivityProvider'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard requireAuth={true}>
      <InactivityProvider timeoutMinutes={20} warningMinutes={2}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </InactivityProvider>
    </AuthGuard>
  )
}
