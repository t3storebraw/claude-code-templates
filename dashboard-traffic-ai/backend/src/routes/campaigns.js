const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
	const campaigns = [
		{ id: 'cmp_1', name: 'Awareness - IG', platform: 'Instagram', spend: 420.5, impressions: 22000, clicks: 1800, conversions: 120, cpa: 3.5 },
		{ id: 'cmp_2', name: 'Leads - FB', platform: 'Facebook', spend: 880.9, impressions: 56000, clicks: 4300, conversions: 310, cpa: 2.84 },
		{ id: 'cmp_3', name: 'Sales - TikTok', platform: 'TikTok', spend: 310.0, impressions: 18000, clicks: 2100, conversions: 95, cpa: 3.26 },
		{ id: 'cmp_4', name: 'Retargeting - Meta', platform: 'Meta', spend: 650.4, impressions: 34000, clicks: 3900, conversions: 260, cpa: 2.5 },
	];
	res.json(campaigns);
});

module.exports = router;