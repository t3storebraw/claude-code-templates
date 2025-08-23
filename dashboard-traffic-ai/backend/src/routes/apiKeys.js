import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const router = express.Router();
const envPath = path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

router.get('/', (_req, res) => {
	res.json({
		instagram: process.env.INSTAGRAM_TOKEN || '',
		facebook: process.env.FACEBOOK_TOKEN || '',
		meta: process.env.META_TOKEN || '',
		tiktok: process.env.TIKTOK_TOKEN || ''
	});
});

router.post('/update', (req, res) => {
	const { instagram = '', facebook = '', meta = '', tiktok = '' } = req.body || {};
	const fileContent = `INSTAGRAM_TOKEN=${instagram}\nFACEBOOK_TOKEN=${facebook}\nMETA_TOKEN=${meta}\nTIKTOK_TOKEN=${tiktok}\n`;
	try {
		fs.writeFileSync(envPath, fileContent, { encoding: 'utf8' });
		res.json({ success: true });
	} catch (error) {
		console.error('Failed to write .env:', error);
		res.status(500).json({ success: false, error: 'Failed to update keys' });
	}
});

export default router;