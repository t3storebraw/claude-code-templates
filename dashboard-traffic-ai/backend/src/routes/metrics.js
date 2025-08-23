import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/metrics', async (_req, res) => {
	// Mock data for initial UI; replace with platform calls using tokens later
	res.json({
		followers: 12345,
		impressions: 987654,
		engagementRate: 3.4,
		roi: 2.1,
		cpa: 4.56,
		trend: {
			labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
			clicks: [120, 150, 170, 200, 180, 220, 260],
			conversions: [12, 15, 14, 19, 16, 21, 25],
			spend: [20, 25, 23, 30, 28, 35, 40]
		}
	});
});

export default router;