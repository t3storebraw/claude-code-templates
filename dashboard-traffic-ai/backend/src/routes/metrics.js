const express = require('express');
const router = express.Router();
const axios = require('axios');

// Mock data for development
const mockMetrics = {
  overview: {
    totalFollowers: 125430,
    totalImpressions: 2450000,
    totalEngagement: 89340,
    totalSpent: 15420.50,
    roi: 285.7,
    cpa: 12.45
  },
  platforms: {
    instagram: {
      followers: 45200,
      impressions: 890000,
      engagement: 34500,
      spent: 5200.30,
      ctr: 3.2,
      cpm: 8.90
    },
    facebook: {
      followers: 32100,
      impressions: 650000,
      engagement: 28900,
      spent: 4100.20,
      ctr: 2.8,
      cpm: 6.30
    },
    meta: {
      followers: 0,
      impressions: 580000,
      engagement: 15200,
      spent: 3920.00,
      ctr: 2.6,
      cpm: 6.76
    },
    tiktok: {
      followers: 48130,
      impressions: 330000,
      engagement: 10740,
      spent: 2200.00,
      ctr: 3.3,
      cpm: 6.67
    }
  },
  trends: {
    followers: [
      { date: '2024-01-01', value: 120000 },
      { date: '2024-01-02', value: 121500 },
      { date: '2024-01-03', value: 123200 },
      { date: '2024-01-04', value: 124800 },
      { date: '2024-01-05', value: 125430 }
    ],
    engagement: [
      { date: '2024-01-01', value: 85000 },
      { date: '2024-01-02', value: 86500 },
      { date: '2024-01-03', value: 88200 },
      { date: '2024-01-04', value: 88900 },
      { date: '2024-01-05', value: 89340 }
    ],
    spent: [
      { date: '2024-01-01', value: 14800 },
      { date: '2024-01-02', value: 14950 },
      { date: '2024-01-03', value: 15100 },
      { date: '2024-01-04', value: 15280 },
      { date: '2024-01-05', value: 15420.50 }
    ]
  }
};

// Get overview metrics
router.get('/overview', async (req, res) => {
  try {
    // For now, return mock data
    // TODO: Implement real API calls when tokens are available
    res.json(mockMetrics.overview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch overview metrics' });
  }
});

// Get platform-specific metrics
router.get('/platforms/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    
    if (!mockMetrics.platforms[platform]) {
      return res.status(404).json({ error: 'Platform not found' });
    }
    
    // For now, return mock data
    // TODO: Implement real API calls based on platform and available tokens
    res.json(mockMetrics.platforms[platform]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch platform metrics' });
  }
});

// Get all platforms metrics
router.get('/platforms', async (req, res) => {
  try {
    res.json(mockMetrics.platforms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch platforms metrics' });
  }
});

// Get trend data
router.get('/trends/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    
    if (!mockMetrics.trends[metric]) {
      return res.status(404).json({ error: 'Metric not found' });
    }
    
    res.json(mockMetrics.trends[metric]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
});

// Get real Instagram metrics (when token is available)
async function getInstagramMetrics(token) {
  try {
    const response = await axios.get(
      `https://graph.instagram.com/me?fields=followers_count,media_count&access_token=${token}`
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch Instagram metrics');
  }
}

// Get real Facebook metrics (when token is available)
async function getFacebookMetrics(token) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/me?fields=id,name&access_token=${token}`
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch Facebook metrics');
  }
}

module.exports = router;