const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
	res.json({
		followers: 12840,
		impressions: 93210,
		engagementRate: 4.6,
		roi: 2.3,
		cpa: 12.8,
	});
});

router.get('/trends', (_req, res) => {
	const days = 14;
	const series = Array.from({ length: days }).map((_, i) => ({
		date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
		followers: 11000 + Math.round(Math.random() * 3000),
		clicks: 500 + Math.round(Math.random() * 1500),
		conversions: 60 + Math.round(Math.random() * 80),
		spend: 200 + Math.round(Math.random() * 500),
	}));
	res.json(series);
});

module.exports = router;