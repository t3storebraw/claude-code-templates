'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import MetricCard from '@/components/MetricCard';
import Chart, { createLineChartData } from '@/components/Chart';
import { apiService } from '@/services/api';
import { PlatformMetrics } from '@/types';
import { 
  Users, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  DollarSign, 
  Target,
  BarChart3,
  RefreshCw,
  Instagram,
  Facebook,
  Music,
  Zap,
  Search
} from 'lucide-react';

const platforms = [
  { key: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { key: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
  { key: 'tiktok', name: 'TikTok', icon: Music, color: 'text-black' },
  { key: 'meta', name: 'Meta Ads', icon: Zap, color: 'text-blue-600' },
  { key: 'googleAds', name: 'Google Ads', icon: Search, color: 'text-red-500' },
];

export default function MetricsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [platformData, setPlatformData] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPlatformData(selectedPlatform);
  }, [selectedPlatform]);

  const loadPlatformData = async (platform: string) => {
    setLoading(true);
    try {
      const response = await apiService.getPlatformMetrics(platform);
      if (response.success && response.data) {
        setPlatformData(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da plataforma:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadPlatformData(selectedPlatform);
    setRefreshing(false);
  };

  const metrics = platformData?.metrics || {
    followers: 0,
    impressions: 0,
    engagement: 0,
    reach: 0,
    clicks: 0,
    conversions: 0,
    spend: 0,
    cpc: 0,
    cpm: 0,
    roas: 0
  };

  // Dados para gráficos
  const trendData = platformData?.trendData || [];
  const chartLabels = trendData.map(item => item.date);
  const chartData = createLineChartData(chartLabels, [
    {
      label: 'Seguidores',
      data: trendData.map(item => item.followers),
    },
    {
      label: 'Impressões',
      data: trendData.map(item => item.impressions),
    },
    {
      label: 'Cliques',
      data: trendData.map(item => item.clicks),
    },
    {
      label: 'Conversões',
      data: trendData.map(item => item.conversions),
    },
  ]);

  const spendChartData = createLineChartData(chartLabels, [
    {
      label: 'Investimento',
      data: trendData.map(item => item.spend),
    },
  ]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Métricas Detalhadas</h1>
              <p className="text-gray-600 mt-1">
                Análise detalhada do desempenho das suas campanhas
              </p>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              <span>{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
            </button>
          </div>

          {/* Platform Selector */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Plataforma</h2>
            <div className="flex flex-wrap gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.key}
                  onClick={() => setSelectedPlatform(platform.key)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200",
                    selectedPlatform === platform.key
                      ? "bg-purple-600 text-white border-purple-600 shadow-lg"
                      : "bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:bg-purple-50"
                  )}
                >
                  <platform.icon className={cn("h-4 w-4", platform.color)} />
                  <span>{platform.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Platform Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              {(() => {
                const platform = platforms.find(p => p.key === selectedPlatform);
                return (
                  <>
                    <div className={cn("h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center", platform?.color)}>
                      <platform?.icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{platform?.name}</h2>
                  </>
                );
              })()}
            </div>
            <p className="text-gray-600">
              Última atualização: {platformData?.lastUpdated ? new Date(platformData.lastUpdated).toLocaleString('pt-BR') : 'N/A'}
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Seguidores"
              value={metrics.followers}
              icon={<Users className="h-6 w-6 text-white" />}
              gradient="from-blue-500 to-blue-600"
            />
            <MetricCard
              title="Impressões"
              value={metrics.impressions}
              icon={<Eye className="h-6 w-6 text-white" />}
              gradient="from-green-500 to-green-600"
            />
            <MetricCard
              title="Engajamento"
              value={metrics.engagement}
              icon={<TrendingUp className="h-6 w-6 text-white" />}
              format="percentage"
              gradient="from-purple-500 to-purple-600"
            />
            <MetricCard
              title="Alcance"
              value={metrics.reach}
              icon={<BarChart3 className="h-6 w-6 text-white" />}
              gradient="from-indigo-500 to-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Cliques"
              value={metrics.clicks}
              icon={<MousePointer className="h-6 w-6 text-white" />}
              gradient="from-pink-500 to-pink-600"
            />
            <MetricCard
              title="Conversões"
              value={metrics.conversions}
              icon={<Target className="h-6 w-6 text-white" />}
              gradient="from-orange-500 to-orange-600"
            />
            <MetricCard
              title="Investimento"
              value={metrics.spend}
              icon={<DollarSign className="h-6 w-6 text-white" />}
              format="currency"
              gradient="from-teal-500 to-teal-600"
            />
            <MetricCard
              title="ROAS"
              value={metrics.roas}
              icon={<BarChart3 className="h-6 w-6 text-white" />}
              format="number"
              gradient="from-cyan-500 to-cyan-600"
            />
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <MetricCard
              title="CPC"
              value={metrics.cpc}
              icon={<DollarSign className="h-6 w-6 text-white" />}
              format="currency"
              gradient="from-red-500 to-red-600"
            />
            <MetricCard
              title="CPM"
              value={metrics.cpm}
              icon={<DollarSign className="h-6 w-6 text-white" />}
              format="currency"
              gradient="from-yellow-500 to-yellow-600"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Trends */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tendência de Performance
              </h3>
              <Chart
                type="line"
                data={chartData}
                className="h-80"
              />
            </div>

            {/* Investment Trends */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tendência de Investimento
              </h3>
              <Chart
                type="line"
                data={spendChartData}
                className="h-80"
              />
            </div>
          </div>

          {/* Detailed Metrics Table */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Métricas Detalhadas
            </h3>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Métrica
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Seguidores
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metrics.followers.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Total de seguidores na plataforma
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Impressões
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metrics.impressions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Número de vezes que o conteúdo foi exibido
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Engajamento
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metrics.engagement}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Taxa de engajamento (likes, comentários, compartilhamentos)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Cliques
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metrics.clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Número total de cliques nos anúncios
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Conversões
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metrics.conversions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Número de conversões geradas
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Investimento
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(metrics.spend)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Valor total investido em campanhas
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}