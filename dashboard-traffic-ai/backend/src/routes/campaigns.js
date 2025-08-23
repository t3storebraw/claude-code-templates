const express = require('express');
const router = express.Router();

// Função para gerar campanhas mockadas
const generateMockCampaigns = (platform) => {
  const campaignNames = [
    'Campanha Black Friday',
    'Promoção Verão',
    'Lançamento Produto',
    'Awareness Brand',
    'Conversão E-commerce',
    'Retargeting',
    'Lookalike Audience',
    'Interest Targeting'
  ];
  
  const statuses = ['active', 'paused', 'completed', 'draft'];
  const objectives = ['awareness', 'traffic', 'engagement', 'conversions', 'sales'];
  
  const campaigns = [];
  
  for (let i = 0; i < Math.floor(Math.random() * 8) + 3; i++) {
    const spend = (Math.random() * 2000 + 100).toFixed(2);
    const impressions = Math.floor(Math.random() * 100000) + 5000;
    const clicks = Math.floor(Math.random() * 5000) + 100;
    const conversions = Math.floor(Math.random() * 200) + 10;
    
    campaigns.push({
      id: `${platform}_${i + 1}`,
      name: campaignNames[Math.floor(Math.random() * campaignNames.length)],
      platform,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      objective: objectives[Math.floor(Math.random() * objectives.length)],
      budget: (Math.random() * 5000 + 500).toFixed(2),
      spend: spend,
      impressions,
      clicks,
      conversions,
      ctr: ((clicks / impressions) * 100).toFixed(2),
      cpc: (spend / clicks).toFixed(2),
      cpm: ((spend / impressions) * 1000).toFixed(2),
      roas: (Math.random() * 10 + 1).toFixed(2),
      startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    });
  }
  
  return campaigns;
};

// GET - Listar todas as campanhas
router.get('/', async (req, res) => {
  try {
    const platforms = ['instagram', 'facebook', 'tiktok', 'meta', 'googleAds'];
    const allCampaigns = [];
    
    platforms.forEach(platform => {
      const campaigns = generateMockCampaigns(platform);
      allCampaigns.push(...campaigns);
    });
    
    // Ordenar por data de criação (mais recentes primeiro)
    allCampaigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: {
        campaigns: allCampaigns,
        total: allCampaigns.length,
        active: allCampaigns.filter(c => c.status === 'active').length,
        paused: allCampaigns.filter(c => c.status === 'paused').length,
        completed: allCampaigns.filter(c => c.status === 'completed').length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar campanhas'
    });
  }
});

// GET - Listar campanhas por plataforma
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
    
    const campaigns = generateMockCampaigns(platform);
    
    res.json({
      success: true,
      data: {
        platform,
        campaigns,
        total: campaigns.length,
        active: campaigns.filter(c => c.status === 'active').length,
        paused: campaigns.filter(c => c.status === 'paused').length,
        completed: campaigns.filter(c => c.status === 'completed').length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar campanhas da plataforma:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar campanhas da plataforma'
    });
  }
});

// GET - Obter detalhes de uma campanha específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Simular busca de campanha específica
    const platforms = ['instagram', 'facebook', 'tiktok', 'meta', 'googleAds'];
    let campaign = null;
    
    for (const platform of platforms) {
      const campaigns = generateMockCampaigns(platform);
      campaign = campaigns.find(c => c.id === id);
      if (campaign) break;
    }
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campanha não encontrada'
      });
    }
    
    // Adicionar dados de performance detalhados
    campaign.performance = {
      daily: generateDailyPerformance(),
      weekly: generateWeeklyPerformance(),
      monthly: generateMonthlyPerformance()
    };
    
    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Erro ao buscar campanha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar campanha'
    });
  }
});

// POST - Criar nova campanha
router.post('/', async (req, res) => {
  try {
    const { name, platform, objective, budget, startDate, endDate } = req.body;
    
    if (!name || !platform || !objective || !budget) {
      return res.status(400).json({
        success: false,
        error: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }
    
    const validPlatforms = ['instagram', 'facebook', 'tiktok', 'meta', 'googleAds'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        error: 'Plataforma inválida'
      });
    }
    
    const newCampaign = {
      id: `${platform}_${Date.now()}`,
      name,
      platform,
      status: 'draft',
      objective,
      budget: parseFloat(budget).toFixed(2),
      spend: '0.00',
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: '0.00',
      cpc: '0.00',
      cpm: '0.00',
      roas: '0.00',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: 'Campanha criada com sucesso!',
      data: newCampaign
    });
  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar campanha'
    });
  }
});

// PUT - Atualizar campanha
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Simular atualização
    const updatedCampaign = {
      id,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Campanha atualizada com sucesso!',
      data: updatedCampaign
    });
  } catch (error) {
    console.error('Erro ao atualizar campanha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar campanha'
    });
  }
});

// DELETE - Deletar campanha
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      message: 'Campanha deletada com sucesso!',
      data: { id }
    });
  } catch (error) {
    console.error('Erro ao deletar campanha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar campanha'
    });
  }
});

// Funções auxiliares para dados de performance
const generateDailyPerformance = () => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      impressions: Math.floor(Math.random() * 10000) + 1000,
      clicks: Math.floor(Math.random() * 500) + 50,
      conversions: Math.floor(Math.random() * 50) + 5,
      spend: (Math.random() * 200 + 50).toFixed(2)
    });
  }
  return data;
};

const generateWeeklyPerformance = () => {
  const data = [];
  for (let i = 3; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    data.push({
      week: `Semana ${4 - i}`,
      impressions: Math.floor(Math.random() * 50000) + 5000,
      clicks: Math.floor(Math.random() * 2000) + 200,
      conversions: Math.floor(Math.random() * 200) + 20,
      spend: (Math.random() * 1000 + 200).toFixed(2)
    });
  }
  return data;
};

const generateMonthlyPerformance = () => {
  const data = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    data.push({
      month: date.toLocaleDateString('pt-BR', { month: 'long' }),
      impressions: Math.floor(Math.random() * 200000) + 20000,
      clicks: Math.floor(Math.random() * 8000) + 800,
      conversions: Math.floor(Math.random() * 800) + 80,
      spend: (Math.random() * 4000 + 800).toFixed(2)
    });
  }
  return data;
};

module.exports = router;