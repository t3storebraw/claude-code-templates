'use client'

import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Settings, 
  TrendingUp, 
  Users,
  Instagram,
  Facebook,
  Play
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Campanhas',
    href: '/campaigns',
    icon: TrendingUp,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: Users,
  },
  {
    name: 'Configurações',
    href: '/settings',
    icon: Settings,
  },
]

const platforms = [
  {
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
  },
  {
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    name: 'Meta Ads',
    icon: Play,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    name: 'TikTok',
    icon: Play,
    color: 'text-gray-800',
    bgColor: 'bg-gray-50',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-purple-100 shadow-sm">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-purple-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Traffic AI
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-purple-100 text-purple-900 border-r-2 border-purple-600"
                  : "text-gray-600 hover:text-purple-900 hover:bg-purple-50"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Platforms */}
      <div className="px-4 py-4 border-t border-purple-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Plataformas
        </h3>
        <div className="space-y-2">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <div className={cn("p-1.5 rounded", platform.bgColor)}>
                <platform.icon className={cn("w-4 h-4", platform.color)} />
              </div>
              <span className="ml-3 text-sm text-gray-600">{platform.name}</span>
              <div className="ml-auto w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}