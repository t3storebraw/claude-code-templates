'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Settings, 
  Home,
  Instagram,
  Facebook,
  Music,
  Zap,
  Search
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Métricas', href: '/metrics', icon: BarChart3 },
  { name: 'Campanhas', href: '/campaigns', icon: TrendingUp },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

const platforms = [
  { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
  { name: 'TikTok', icon: Music, color: 'text-black' },
  { name: 'Meta Ads', icon: Zap, color: 'text-blue-600' },
  { name: 'Google Ads', icon: Search, color: 'text-red-500' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 h-screen transition-transform duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="h-full bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 shadow-xl">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Traffic AI</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-lg p-2 text-white hover:bg-white/10 transition-colors"
          >
            <div className="h-4 w-4">
              <div className={cn(
                "h-0.5 w-4 bg-white transition-all duration-300",
                isCollapsed ? "rotate-45 translate-y-1" : "-rotate-45"
              )} />
              <div className={cn(
                "h-0.5 w-4 bg-white mt-1 transition-all duration-300",
                isCollapsed ? "-rotate-45 -translate-y-1" : "rotate-45"
              )} />
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Platforms */}
        <div className="mt-8 px-4">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
              Plataformas
            </h3>
          )}
          <div className="space-y-2">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer",
                  isCollapsed && "justify-center"
                )}
              >
                <platform.icon className={cn("h-5 w-5 flex-shrink-0", platform.color)} />
                {!isCollapsed && <span>{platform.name}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4">
          {!isCollapsed && (
            <div className="rounded-lg bg-white/10 p-3">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white/70">Sistema Online</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}