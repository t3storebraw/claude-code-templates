const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas básicas
app.get('/api/keys', (req, res) => {
  res.json({
    success: true,
    data: {
      instagram: '',
      facebook: '',
      meta: '',
      tiktok: '',
      googleAds: ''
    }
  });
});

app.get('/api/metrics/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      platforms: {
        instagram: {
          followers: 15000,
          impressions: 500000,
          engagement: 5.2,
          reach: 300000,
          clicks: 8000,
          conversions: 150,
          spend: 1200.50,
          cpc: 0.15,
          cpm: 2.40,
          roas: 3.2
        },
        facebook: {
          followers: 25000,
          impressions: 800000,
          engagement: 4.8,
          reach: 500000,
          clicks: 12000,
          conversions: 200,
          spend: 1800.75,
          cpc: 0.12,
          cpm: 2.25,
          roas: 2.8
        }
      },
      totals: {
        followers: 40000,
        impressions: 1300000,
        engagement: 5.0,
        reach: 800000,
        clicks: 20000,
        conversions: 350,
        spend: 3001.25,
        roas: 3.0
      },
      lastUpdated: new Date().toISOString()
    }
  });
});

app.get('/api/campaigns', (req, res) => {
  res.json({
    success: true,
    data: {
      campaigns: [
        {
          id: '1',
          name: 'Campanha Black Friday',
          platform: 'instagram',
          status: 'active',
          objective: 'sales',
          budget: 5000,
          spend: 2500,
          impressions: 100000,
          clicks: 5000,
          conversions: 100,
          ctr: 5.0,
          cpc: 0.5,
          cpm: 25.0,
          roas: 4.0,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          createdAt: new Date().toISOString()
        }
      ],
      total: 1,
      active: 1,
      paused: 0,
      completed: 0
    }
  });
});

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Dashboard Traffic AI Backend está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Dashboard Traffic AI Backend ativo`);
  console.log(`🌐 http://localhost:${PORT}`);
});

module.exports = app;