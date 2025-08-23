export interface ApiKeys {
  instagram: string
  facebook: string
  meta: string
  tiktok: string
}

export interface OverviewMetrics {
  totalFollowers: number
  totalImpressions: number
  totalEngagement: number
  totalSpent: number
  roi: number
  cpa: number
}

export interface PlatformMetrics {
  followers: number
  impressions: number
  engagement: number
  spent: number
  ctr: number
  cpm: number
}

export interface TrendData {
  date: string
  value: number
}

export interface Campaign {
  id: number
  name: string
  platform: 'instagram' | 'facebook' | 'meta' | 'tiktok'
  status: 'active' | 'paused' | 'completed'
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  cpa: number
  startDate: string
  endDate: string
}

export interface CampaignSummary {
  totalCampaigns: number
  activeCampaigns: number
  pausedCampaigns: number
  totalBudget: number
  totalSpent: number
  totalImpressions: number
  totalClicks: number
  totalConversions: number
  avgCtr: number
  avgCpc: number
  avgCpa: number
}