const express = require('express');
const router = express.Router();
const axios = require('axios');

// Função para gerar dados mockados (para demonstração)
const generateMockMetrics = (platform) => {
  const baseMetrics = {
    followers: Math.floor(Math.random() * 50000) + 1000,
    impressions: Math.floor(Math.random() * 1000000) + 50000,
    engagement: (Math.random() * 10 + 2).toFixed(2),
    reach: Math.floor(Math.random() * 800000) + 30000,
    clicks: Math.floor(Math.random() * 50000) + 5000,
    conversions: Math.floor(Math.random() * 1000) + 100,
    spend: (Math.random() * 5000 + 500).toFixed(2),
    cpc: (Math.random() * 2 + 0.5).toFixed(2),
    cpm: (Math.random() * 15 + 5).toFixed(2),
    roas: (Math.random() * 8 + 1).toFixed(2)
  };

  // Variações por plataforma
  const platformVariations = {
    instagram: { followers: baseMetrics.followers * 1.2, engagement: (baseMetrics.engagement * 1.3).toFixed(2) },
    facebook: { reach: baseMetrics.reach * 1.5, cpm: (baseMetrics.cpm * 0.8).toFixed(2) },
    tiktok: { followers: baseMetrics.followers * 2, engagement: (baseMetrics.engagement * 1.8).toFixed(2) },
    meta: { spend: (baseMetrics.spend * 1.3).toFixed(2), roas: (baseMetrics.roas * 1.2).toFixed(2) },
    googleAds: { clicks: baseMetrics.clicks * 1.4, cpc: (baseMetrics.cpc * 1.1).toFixed(2) }
  };

  return { ...baseMetrics, ...platformVariations[platform] };
};

// Função para gerar dados de tendência (últimos 30 dias)
const generateTrendData = (platform) => {
  const days = 30;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      followers: Math.floor(Math.random() * 1000) + 100,
      impressions: Math.floor(Math.random() * 50000) + 5000,
      engagement: (Math.random() * 5 + 1).toFixed(2),
      reach: Math.floor(Math.random() * 30000) + 2000,
      clicks: Math.floor(Math.random() * 2000) + 200,
      conversions: Math.floor(Math.random() * 100) + 10,
      spend: (Math.random() * 200 + 50).toFixed(2)
    });
  }
  
  return data;
};

// GET - Obter métricas gerais de todas as plataformas
router.get('/overview', async (req, res) => {
  try {
    const platforms = ['instagram', 'facebook', 'tiktok', 'meta', 'googleAds'];
    const overview = {};
    
    platforms.forEach(platform => {
      overview[platform] = generateMockMetrics(platform);
    });
    
    // Calcular totais
    const totals = {
      followers: Object.values(overview).reduce((sum, p) => sum + p.followers, 0),
      impressions: Object.values(overview).reduce((sum, p) => sum + p.impressions, 0),
      engagement: (Object.values(overview).reduce((sum, p) => sum + parseFloat(p.engagement), 0) / platforms.length).toFixed(2),
      reach: Object.values(overview).reduce((sum, p) => sum + p.reach, 0),
      clicks: Object.values(overview).reduce((sum, p) => sum + p.clicks, 0),
      conversions: Object.values(overview).reduce((sum, p) => sum + p.conversions, 0),
      spend: (Object.values(overview).reduce((sum, p) => sum + parseFloat(p.spend), 0)).toFixed(2),
      roas: (Object.values(overview).reduce((sum, p) => sum + parseFloat(p.roas), 0) / platforms.length).toFixed(2)
    };
    
    res.json({
      success: true,
      data: {
        platforms: overview,
        totals,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao buscar métricas gerais:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar métricas'
    });
  }
});

// GET - Obter métricas de uma plataforma específica
router.get('/platform/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const validPlatforms = ['instagram', 'facebook', 'tiktok', 'meta', 'googleAds'];
    
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        error: 'Plataforma inválida'
      });
    }
    
    const metrics = generateMockMetrics(platform);
    const trendData = generateTrendData(platform);
    
    res.json({
      success: true,
      data: {
        platform,
        metrics,
        trendData,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao buscar métricas da plataforma:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar métricas da plataforma'
    });
  }
});

// GET - Obter dados de tendência para gráficos
router.get('/trends/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { days = 30 } = req.query;
    const validPlatforms = ['instagram', 'facebook', 'tiktok', 'meta', 'googleAds'];
    
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        error: 'Plataforma inválida'
      });
    }
    
    const trendData = generateTrendData(platform).slice(-parseInt(days));
    
    res.json({
      success: true,
      data: {
        platform,
        trendData,
        period: `${days} dias`,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados de tendência:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados de tendência'
    });
  }
});

// POST - Buscar métricas reais (quando as API keys estiverem configuradas)
router.post('/real/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token é obrigatório para buscar dados reais'
      });
    }
    
    // Aqui você implementaria as chamadas reais para as APIs
    // Por enquanto, retornamos dados mockados
    const metrics = generateMockMetrics(platform);
    
    res.json({
      success: true,
      data: {
        platform,
        metrics,
        source: 'real_api',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao buscar métricas reais:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar métricas reais'
    });
  }
});

module.exports = router;