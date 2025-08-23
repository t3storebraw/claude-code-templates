import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}

export function getPlatformColor(platform: string): string {
  const colors = {
    instagram: 'from-pink-500 to-purple-600',
    facebook: 'from-blue-500 to-blue-700',
    tiktok: 'from-black to-gray-800',
    meta: 'from-blue-600 to-indigo-700',
    googleAds: 'from-red-500 to-red-700'
  }
  return colors[platform as keyof typeof colors] || 'from-purple-500 to-violet-600'
}

export function getPlatformIcon(platform: string): string {
  const icons = {
    instagram: '📸',
    facebook: '📘',
    tiktok: '🎵',
    meta: '🔵',
    googleAds: '🔴'
  }
  return icons[platform as keyof typeof icons] || '📊'
}