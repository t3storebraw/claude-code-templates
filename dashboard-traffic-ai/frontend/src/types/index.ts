export interface ApiKeys {
  instagram: string;
  facebook: string;
  meta: string;
  tiktok: string;
  googleAds: string;
}

export interface Metrics {
  followers: number;
  impressions: number;
  engagement: number;
  reach: number;
  clicks: number;
  conversions: number;
  spend: number;
  cpc: number;
  cpm: number;
  roas: number;
}

export interface PlatformMetrics {
  platform: string;
  metrics: Metrics;
  trendData: TrendData[];
  lastUpdated: string;
}

export interface TrendData {
  date: string;
  followers: number;
  impressions: number;
  engagement: number;
  reach: number;
  clicks: number;
  conversions: number;
  spend: number;
}

export interface OverviewData {
  platforms: Record<string, Metrics>;
  totals: Metrics;
  lastUpdated: string;
}

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  objective: string;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  performance?: {
    daily: PerformanceData[];
    weekly: PerformanceData[];
    monthly: PerformanceData[];
  };
}

export interface PerformanceData {
  date?: string;
  week?: string;
  month?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
}

export interface CampaignsData {
  campaigns: Campaign[];
  total: number;
  active: number;
  paused: number;
  completed: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface TestConnectionResponse {
  platform: string;
  connected: boolean;
  message: string;
}