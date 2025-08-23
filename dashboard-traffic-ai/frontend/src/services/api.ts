import { ApiKeys, OverviewData, PlatformMetrics, CampaignsData, Campaign, ApiResponse, TestConnectionResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Erro de conexão com o servidor'
      };
    }
  }

  // API Keys
  async getApiKeys(): Promise<ApiResponse<ApiKeys>> {
    return this.request<ApiKeys>('/keys');
  }

  async updateApiKeys(keys: Partial<ApiKeys>): Promise<ApiResponse<ApiKeys>> {
    return this.request<ApiKeys>('/keys/update', {
      method: 'POST',
      body: JSON.stringify(keys),
    });
  }

  async testConnection(platform: string, token: string): Promise<ApiResponse<TestConnectionResponse>> {
    return this.request<TestConnectionResponse>('/keys/test', {
      method: 'POST',
      body: JSON.stringify({ platform, token }),
    });
  }

  // Metrics
  async getOverview(): Promise<ApiResponse<OverviewData>> {
    return this.request<OverviewData>('/metrics/overview');
  }

  async getPlatformMetrics(platform: string): Promise<ApiResponse<PlatformMetrics>> {
    return this.request<PlatformMetrics>(`/metrics/platform/${platform}`);
  }

  async getTrends(platform: string, days: number = 30): Promise<ApiResponse<{ trendData: any[] }>> {
    return this.request<{ trendData: any[] }>(`/metrics/trends/${platform}?days=${days}`);
  }

  // Campaigns
  async getCampaigns(): Promise<ApiResponse<CampaignsData>> {
    return this.request<CampaignsData>('/campaigns');
  }

  async getPlatformCampaigns(platform: string): Promise<ApiResponse<CampaignsData>> {
    return this.request<CampaignsData>(`/campaigns/platform/${platform}`);
  }

  async getCampaign(id: string): Promise<ApiResponse<Campaign>> {
    return this.request<Campaign>(`/campaigns/${id}`);
  }

  async createCampaign(campaign: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return this.request<Campaign>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return this.request<Campaign>(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCampaign(id: string): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>(`/campaigns/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; message: string; timestamp: string }>> {
    return this.request<{ status: string; message: string; timestamp: string }>('/health');
  }
}

export const apiService = new ApiService();