'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { MetricCard } from '@/components/MetricCard'
import { DashboardChart } from '@/components/DashboardChart'
import { OverviewMetrics, TrendData } from '@/types'
import { 
  Users, 
  Eye, 
  Heart, 
  DollarSign, 
  TrendingUp, 
  Target 
} from 'lucide-react'

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null)
  const [followersData, setFollowersData] = useState<TrendData[]>([])
  const [engagementData, setEngagementData] = useState<TrendData[]>([])
  const [spentData, setSpentData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch overview metrics
      const metricsResponse = await fetch('/api/metrics/overview')
      const metricsData = await metricsResponse.json()
      setMetrics(metricsData)

      // Fetch trend data
      const [followersRes, engagementRes, spentRes] = await Promise.all([
        fetch('/api/metrics/trends/followers'),
        fetch('/api/metrics/trends/engagement'),
        fetch('/api/metrics/trends/spent')
      ])

      const [followersData, engagementData, spentData] = await Promise.all([
        followersRes.json(),
        engagementRes.json(),
        spentRes.json()
      ])

      setFollowersData(followersData)
      setEngagementData(engagementData)
      setSpentData(spentData)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard de Tráfego
            </h1>
            <p className="text-gray-600">
              Visão geral das suas campanhas e métricas de engajamento
            </p>
          </div>

          {/* Metrics Cards */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
              <MetricCard
                title="Total Seguidores"
                value={metrics.totalFollowers}
                icon={<Users size={32} />}
                type="number"
                trend={{ value: 5.2, direction: 'up' }}
              />
              <MetricCard
                title="Impressões Totais"
                value={metrics.totalImpressions}
                icon={<Eye size={32} />}
                type="number"
                trend={{ value: 12.3, direction: 'up' }}
              />
              <MetricCard
                title="Engajamento"
                value={metrics.totalEngagement}
                icon={<Heart size={32} />}
                type="number"
                trend={{ value: 8.1, direction: 'up' }}
              />
              <MetricCard
                title="Investimento"
                value={metrics.totalSpent}
                icon={<DollarSign size={32} />}
                type="currency"
                trend={{ value: 2.5, direction: 'down' }}
              />
              <MetricCard
                title="ROI"
                value={metrics.roi}
                icon={<TrendingUp size={32} />}
                type="percentage"
                trend={{ value: 15.8, direction: 'up' }}
              />
              <MetricCard
                title="CPA"
                value={metrics.cpa}
                icon={<Target size={32} />}
                type="currency"
                trend={{ value: 3.2, direction: 'down' }}
              />
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <DashboardChart
              title="Crescimento de Seguidores"
              data={followersData}
              color="#8b5cf6"
            />
            <DashboardChart
              title="Engajamento"
              data={engagementData}
              color="#10b981"
            />
            <DashboardChart
              title="Investimento"
              data={spentData}
              color="#f59e0b"
            />
          </div>
        </div>
      </main>
    </div>
  )
}