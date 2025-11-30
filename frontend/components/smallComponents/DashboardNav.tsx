'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, BarChart3, Home } from 'lucide-react'
import { cn } from '@/libs/utils'

const navItems = [
  {
    title: 'Traces',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">AgentOps Monitor</span>
            </Link>

            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname?.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
