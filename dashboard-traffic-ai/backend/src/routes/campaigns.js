const express = require('express');
const router = express.Router();

// Mock campaigns data
const mockCampaigns = [
  {
    id: 1,
    name: "Summer Collection 2024",
    platform: "instagram",
    status: "active",
    budget: 5000,
    spent: 3420.50,
    impressions: 125000,
    clicks: 4200,
    conversions: 89,
    ctr: 3.36,
    cpc: 0.81,
    cpa: 38.43,
    startDate: "2024-01-01",
    endDate: "2024-01-31"
  },
  {
    id: 2,
    name: "Brand Awareness Q1",
    platform: "facebook",
    status: "active",
    budget: 3000,
    spent: 2180.30,
    impressions: 98000,
    clicks: 2940,
    conversions: 56,
    ctr: 3.00,
    cpc: 0.74,
    cpa: 38.93,
    startDate: "2024-01-01",
    endDate: "2024-03-31"
  },
  {
    id: 3,
    name: "Product Launch Meta",
    platform: "meta",
    status: "paused",
    budget: 4500,
    spent: 1890.00,
    impressions: 76000,
    clicks: 2280,
    conversions: 42,
    ctr: 3.00,
    cpc: 0.83,
    cpa: 45.00,
    startDate: "2023-12-15",
    endDate: "2024-02-15"
  },
  {
    id: 4,
    name: "TikTok Viral Push",
    platform: "tiktok",
    status: "active",
    budget: 2000,
    spent: 1650.80,
    impressions: 45000,
    clicks: 1485,
    conversions: 28,
    ctr: 3.30,
    cpc: 1.11,
    cpa: 58.96,
    startDate: "2024-01-10",
    endDate: "2024-02-10"
  }
];

// Get all campaigns
router.get('/', (req, res) => {
  try {
    const { platform, status } = req.query;
    
    let filteredCampaigns = [...mockCampaigns];
    
    if (platform) {
      filteredCampaigns = filteredCampaigns.filter(
        campaign => campaign.platform === platform
      );
    }
    
    if (status) {
      filteredCampaigns = filteredCampaigns.filter(
        campaign => campaign.status === status
      );
    }
    
    res.json(filteredCampaigns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Get campaign by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const campaign = mockCampaigns.find(c => c.id === parseInt(id));
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// Create new campaign (mock)
router.post('/', (req, res) => {
  try {
    const newCampaign = {
      id: mockCampaigns.length + 1,
      ...req.body,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      cpc: 0,
      cpa: 0
    };
    
    mockCampaigns.push(newCampaign);
    res.status(201).json(newCampaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Update campaign status
router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const campaignIndex = mockCampaigns.findIndex(c => c.id === parseInt(id));
    
    if (campaignIndex === -1) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    mockCampaigns[campaignIndex].status = status;
    res.json(mockCampaigns[campaignIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Get campaign performance summary
router.get('/summary/performance', (req, res) => {
  try {
    const summary = {
      totalCampaigns: mockCampaigns.length,
      activeCampaigns: mockCampaigns.filter(c => c.status === 'active').length,
      pausedCampaigns: mockCampaigns.filter(c => c.status === 'paused').length,
      totalBudget: mockCampaigns.reduce((sum, c) => sum + c.budget, 0),
      totalSpent: mockCampaigns.reduce((sum, c) => sum + c.spent, 0),
      totalImpressions: mockCampaigns.reduce((sum, c) => sum + c.impressions, 0),
      totalClicks: mockCampaigns.reduce((sum, c) => sum + c.clicks, 0),
      totalConversions: mockCampaigns.reduce((sum, c) => sum + c.conversions, 0),
      avgCtr: mockCampaigns.reduce((sum, c) => sum + c.ctr, 0) / mockCampaigns.length,
      avgCpc: mockCampaigns.reduce((sum, c) => sum + c.cpc, 0) / mockCampaigns.length,
      avgCpa: mockCampaigns.reduce((sum, c) => sum + c.cpa, 0) / mockCampaigns.length
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaign summary' });
  }
});

module.exports = router;