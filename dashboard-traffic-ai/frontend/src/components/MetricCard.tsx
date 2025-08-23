'use client'

import { Card, CardContent } from "@/components/ui/card"
import { formatNumber, formatCurrency, formatPercentage } from "@/lib/utils"
import { ReactNode } from "react"

interface MetricCardProps {
  title: string
  value: number | string
  icon: ReactNode
  type?: 'number' | 'currency' | 'percentage'
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
}

export function MetricCard({ title, value, icon, type = 'number', trend }: MetricCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val
    
    switch (type) {
      case 'currency':
        return formatCurrency(val)
      case 'percentage':
        return formatPercentage(val)
      default:
        return formatNumber(val)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-purple-100 text-sm font-medium mb-2">{title}</p>
              <p className="text-3xl font-bold">{formatValue(value)}</p>
              {trend && (
                <div className={`flex items-center mt-2 text-sm ${
                  trend.direction === 'up' ? 'text-green-300' : 'text-red-300'
                }`}>
                  <span className="mr-1">
                    {trend.direction === 'up' ? '↗' : '↘'}
                  </span>
                  {formatPercentage(Math.abs(trend.value))}
                </div>
              )}
            </div>
            <div className="text-purple-200 opacity-80">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}