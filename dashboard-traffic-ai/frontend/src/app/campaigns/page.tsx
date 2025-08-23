'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Campaign } from '@/types'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { 
  Play, 
  Pause, 
  Instagram, 
  Facebook, 
  Filter,
  TrendingUp,
  Eye,
  MousePointer,
  Target
} from 'lucide-react'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all')

  useEffect(() => {
    fetchCampaigns()
  }, [filter])

  const fetchCampaigns = async () => {
    try {
      const queryParam = filter === 'all' ? '' : `?status=${filter}`
      const response = await fetch(`/api/campaigns${queryParam}`)
      const data = await response.json()
      setCampaigns(data)
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCampaignStatus = async (campaignId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (response.ok) {
        fetchCampaigns()
      }
    } catch (error) {
      console.error('Failed to update campaign status:', error)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-500" />
      case 'facebook':
        return <Facebook className="w-5 h-5 text-blue-600" />
      case 'meta':
        return <Play className="w-5 h-5 text-blue-500" />
      case 'tiktok':
        return <Play className="w-5 h-5 text-gray-800" />
      default:
        return <Play className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Campanhas
              </h1>
              <p className="text-gray-600">
                Gerencie suas campanhas de tráfego pago
              </p>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                Todas
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                onClick={() => setFilter('active')}
                size="sm"
              >
                Ativas
              </Button>
              <Button
                variant={filter === 'paused' ? 'default' : 'outline'}
                onClick={() => setFilter('paused')}
                size="sm"
              >
                Pausadas
              </Button>
            </div>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(campaign.platform)}
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status === 'active' ? 'Ativa' : 'Pausada'}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Budget Info */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Orçamento</span>
                    <span className="font-semibold">{formatCurrency(campaign.budget)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Investido</span>
                    <span className="font-semibold text-purple-600">{formatCurrency(campaign.spent)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                    ></div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Eye className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-600">Impressões</span>
                      </div>
                      <span className="text-sm font-semibold">{formatNumber(campaign.impressions)}</span>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <MousePointer className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-600">Cliques</span>
                      </div>
                      <span className="text-sm font-semibold">{formatNumber(campaign.clicks)}</span>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Target className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-600">Conversões</span>
                      </div>
                      <span className="text-sm font-semibold">{formatNumber(campaign.conversions)}</span>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-600">CTR</span>
                      </div>
                      <span className="text-sm font-semibold">{formatPercentage(campaign.ctr)}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant={campaign.status === 'active' ? 'destructive' : 'default'}
                    size="sm"
                    className="w-full"
                    onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                  >
                    {campaign.status === 'active' ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pausar Campanha
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Ativar Campanha
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {campaigns.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhuma campanha encontrada</p>
              <p className="text-gray-400 text-sm mt-2">
                Configure suas API keys para começar a importar campanhas
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}