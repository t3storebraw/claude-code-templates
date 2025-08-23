const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Função para ler o arquivo .env
const readEnvFile = () => {
  const envPath = path.resolve(__dirname, '../../.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return envVars;
};

// Função para escrever no arquivo .env
const writeEnvFile = (envVars) => {
  const envPath = path.resolve(__dirname, '../../.env');
  let envContent = '';
  
  Object.entries(envVars).forEach(([key, value]) => {
    envContent += `${key}=${value}\n`;
  });
  
  fs.writeFileSync(envPath, envContent);
};

// GET - Obter todas as API keys
router.get('/', (req, res) => {
  try {
    const envVars = readEnvFile();
    
    const apiKeys = {
      instagram: envVars.INSTAGRAM_TOKEN || '',
      facebook: envVars.FACEBOOK_TOKEN || '',
      meta: envVars.META_TOKEN || '',
      tiktok: envVars.TIKTOK_TOKEN || '',
      googleAds: envVars.GOOGLE_ADS_TOKEN || ''
    };
    
    res.json({
      success: true,
      data: apiKeys
    });
  } catch (error) {
    console.error('Erro ao ler API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao ler configurações de API'
    });
  }
});

// POST - Atualizar API keys
router.post('/update', (req, res) => {
  try {
    const { instagram, facebook, meta, tiktok, googleAds } = req.body;
    
    const envVars = readEnvFile();
    
    // Atualizar apenas as keys fornecidas
    if (instagram !== undefined) envVars.INSTAGRAM_TOKEN = instagram;
    if (facebook !== undefined) envVars.FACEBOOK_TOKEN = facebook;
    if (meta !== undefined) envVars.META_TOKEN = meta;
    if (tiktok !== undefined) envVars.TIKTOK_TOKEN = tiktok;
    if (googleAds !== undefined) envVars.GOOGLE_ADS_TOKEN = googleAds;
    
    // Manter outras configurações
    envVars.PORT = envVars.PORT || '3001';
    envVars.NODE_ENV = envVars.NODE_ENV || 'development';
    envVars.DB_PATH = envVars.DB_PATH || '../database/traffic_ai.db';
    
    writeEnvFile(envVars);
    
    res.json({
      success: true,
      message: 'API keys atualizadas com sucesso!',
      data: {
        instagram: envVars.INSTAGRAM_TOKEN || '',
        facebook: envVars.FACEBOOK_TOKEN || '',
        meta: envVars.META_TOKEN || '',
        tiktok: envVars.TIKTOK_TOKEN || '',
        googleAds: envVars.GOOGLE_ADS_TOKEN || ''
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar configurações de API'
    });
  }
});

// POST - Testar conexão com uma plataforma específica
router.post('/test', (req, res) => {
  try {
    const { platform, token } = req.body;
    
    if (!platform || !token) {
      return res.status(400).json({
        success: false,
        error: 'Plataforma e token são obrigatórios'
      });
    }
    
    // Simular teste de conexão (em produção, faria chamadas reais para as APIs)
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% de chance de sucesso para demo
      
      res.json({
        success: true,
        data: {
          platform,
          connected: isSuccess,
          message: isSuccess 
            ? `Conexão com ${platform} estabelecida com sucesso!`
            : `Falha na conexão com ${platform}. Verifique o token.`
        }
      });
    }, 1000);
    
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao testar conexão'
    });
  }
});

module.exports = router;