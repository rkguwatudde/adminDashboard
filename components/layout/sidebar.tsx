"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Users, 
  TrendingUp, 
  ShoppingCart, 
  BookOpen, 
  BarChart3, 
  Settings,
  LogOut,
  Wallet,
  Zap
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Bonds', href: '/dashboard/bonds', icon: TrendingUp },
  { name: 'Purchases', href: '/dashboard/purchases', icon: ShoppingCart },
  { name: 'Ledger', href: '/dashboard/ledger', icon: BookOpen },
  { name: 'Book Transfers', href: '/dashboard/book-transfers', icon: Wallet },
  { name: 'Cybrid', href: '/dashboard/cybrid', icon: Zap },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">BoraBond</h1>
          <p className="text-xs text-green-100">Admin Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-green-50 text-green-700 border-r-2 border-green-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-green-700' : 'text-gray-400 group-hover:text-gray-500'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-200 p-4">
        <button className="group flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
          Logout
        </button>
      </div>
    </div>
  )
}
