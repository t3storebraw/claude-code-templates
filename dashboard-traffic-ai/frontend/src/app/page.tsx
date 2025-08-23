'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import MetricCard from '@/components/MetricCard';
import Chart, { createLineChartData, createDoughnutChartData } from '@/components/Chart';
import { apiService } from '@/services/api';
import { OverviewData } from '@/types';
import { 
  Users, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  DollarSign, 
  Target,
  BarChart3,
  RefreshCw
} from 'lucide-react';

export default function Dashboard() {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      const response = await apiService.getOverview();
      if (response.success && response.data) {
        setOverviewData(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadOverviewData();
    setRefreshing(false);
  };

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

  const totals = overviewData?.totals || {
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
  const platformData = overviewData?.platforms || {};
  const platformNames = Object.keys(platformData);
  const platformFollowers = platformNames.map(name => platformData[name].followers);
  const platformSpend = platformNames.map(name => platformData[name].spend);

  const followersChartData = createDoughnutChartData(platformNames, platformFollowers);
  const spendChartData = createDoughnutChartData(platformNames, platformSpend);

  // Dados de tendência (simulados)
  const trendLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  const trendData = createLineChartData(trendLabels, [
    {
      label: 'Seguidores',
      data: [12000, 13500, 14200, 15800, 16500, 18200],
    },
    {
      label: 'Impressões',
      data: [450000, 520000, 480000, 610000, 580000, 720000],
    },
    {
      label: 'Cliques',
      data: [8500, 9200, 8800, 11200, 10800, 13500],
    },
  ]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Visão geral das suas campanhas de tráfego pago
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

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Seguidores"
              value={totals.followers}
              icon={<Users className="h-6 w-6 text-white" />}
              trend={12.5}
              trendLabel="vs mês anterior"
              gradient="from-blue-500 to-blue-600"
            />
            <MetricCard
              title="Impressões"
              value={totals.impressions}
              icon={<Eye className="h-6 w-6 text-white" />}
              trend={8.3}
              trendLabel="vs mês anterior"
              gradient="from-green-500 to-green-600"
            />
            <MetricCard
              title="Cliques"
              value={totals.clicks}
              icon={<MousePointer className="h-6 w-6 text-white" />}
              trend={-2.1}
              trendLabel="vs mês anterior"
              gradient="from-purple-500 to-purple-600"
            />
            <MetricCard
              title="Investimento"
              value={totals.spend}
              icon={<DollarSign className="h-6 w-6 text-white" />}
              format="currency"
              trend={15.7}
              trendLabel="vs mês anterior"
              gradient="from-orange-500 to-orange-600"
            />
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Engajamento"
              value={totals.engagement}
              icon={<TrendingUp className="h-6 w-6 text-white" />}
              format="percentage"
              gradient="from-pink-500 to-pink-600"
            />
            <MetricCard
              title="Conversões"
              value={totals.conversions}
              icon={<Target className="h-6 w-6 text-white" />}
              trend={5.2}
              trendLabel="vs mês anterior"
              gradient="from-indigo-500 to-indigo-600"
            />
            <MetricCard
              title="ROAS"
              value={totals.roas}
              icon={<BarChart3 className="h-6 w-6 text-white" />}
              format="number"
              gradient="from-teal-500 to-teal-600"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trend Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tendência dos Últimos 6 Meses
              </h3>
              <Chart
                type="line"
                data={trendData}
                className="h-80"
              />
            </div>

            {/* Platform Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Distribuição por Plataforma
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Seguidores</h4>
                  <Chart
                    type="doughnut"
                    data={followersChartData}
                    className="h-48"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Investimento</h4>
                  <Chart
                    type="doughnut"
                    data={spendChartData}
                    className="h-48"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Platform Performance */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance por Plataforma
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformNames.map((platform) => {
                const data = platformData[platform];
                return (
                  <div
                    key={platform}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 capitalize">
                        {platform}
                      </h4>
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {platform.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Seguidores:</span>
                        <span className="font-medium">{data.followers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Impressões:</span>
                        <span className="font-medium">{data.impressions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Engajamento:</span>
                        <span className="font-medium">{data.engagement}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Investimento:</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(data.spend)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
