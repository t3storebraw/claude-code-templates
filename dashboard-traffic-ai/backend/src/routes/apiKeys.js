const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Get current API keys
router.get('/', (req, res) => {
  try {
    const envPath = path.resolve(__dirname, '../../.env');
    
    if (!fs.existsSync(envPath)) {
      return res.json({
        instagram: '',
        facebook: '',
        meta: '',
        tiktok: ''
      });
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const keys = {};
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        const cleanKey = key.trim().toLowerCase().replace('_token', '');
        keys[cleanKey] = value.trim();
      }
    });
    
    res.json({
      instagram: keys.instagram || '',
      facebook: keys.facebook || '',
      meta: keys.meta || '',
      tiktok: keys.tiktok || ''
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read API keys' });
  }
});

// Update API keys
router.post('/update', (req, res) => {
  try {
    const { instagram, facebook, meta, tiktok } = req.body;
    const envPath = path.resolve(__dirname, '../../.env');
    
    const envContent = `INSTAGRAM_TOKEN=${instagram || ''}
FACEBOOK_TOKEN=${facebook || ''}
META_TOKEN=${meta || ''}
TIKTOK_TOKEN=${tiktok || ''}
PORT=3001`;
    
    fs.writeFileSync(envPath, envContent);
    
    // Reload environment variables
    delete require.cache[require.resolve('dotenv')];
    require('dotenv').config();
    
    res.json({ 
      success: true, 
      message: 'API keys updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update API keys',
      details: error.message 
    });
  }
});

// Test API key connection
router.post('/test', async (req, res) => {
  try {
    const { platform, token } = req.body;
    
    let testUrl = '';
    let headers = {};
    
    switch (platform.toLowerCase()) {
      case 'instagram':
        testUrl = `https://graph.instagram.com/me?fields=id,username&access_token=${token}`;
        break;
      case 'facebook':
        testUrl = `https://graph.facebook.com/me?access_token=${token}`;
        break;
      case 'meta':
        testUrl = `https://graph.facebook.com/me/adaccounts?access_token=${token}`;
        break;
      case 'tiktok':
        testUrl = 'https://business-api.tiktok.com/open_api/v1.3/user/info/';
        headers = { 'Access-Token': token };
        break;
      default:
        return res.status(400).json({ error: 'Unsupported platform' });
    }
    
    const response = await axios.get(testUrl, { 
      headers,
      timeout: 10000 
    });
    
    res.json({ 
      success: true, 
      platform,
      message: 'Connection successful',
      data: response.data 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      platform: req.body.platform,
      message: 'Connection failed',
      error: error.response?.data || error.message 
    });
  }
});

module.exports = router;