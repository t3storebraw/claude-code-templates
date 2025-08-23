const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const envPath = path.resolve(__dirname, '../../.env');

function parseEnv(content) {
	const result = {};
	content.split('\n').forEach((line) => {
		const [key, ...rest] = line.split('=');
		if (!key) return;
		result[key.trim()] = rest.join('=').trim();
	});
	return result;
}

router.get('/', (_req, res) => {
	try {
		if (!fs.existsSync(envPath)) {
			return res.json({
				INSTAGRAM_TOKEN: '',
				FACEBOOK_TOKEN: '',
				META_TOKEN: '',
				TIKTOK_TOKEN: '',
			});
		}
		const content = fs.readFileSync(envPath, 'utf8');
		const env = parseEnv(content);
		res.json({
			INSTAGRAM_TOKEN: env.INSTAGRAM_TOKEN || '',
			FACEBOOK_TOKEN: env.FACEBOOK_TOKEN || '',
			META_TOKEN: env.META_TOKEN || '',
			TIKTOK_TOKEN: env.TIKTOK_TOKEN || '',
		});
	} catch (err) {
		console.error('Failed to read .env', err);
		res.status(500).json({ error: 'Failed to read keys' });
	}
});

router.post('/update', (req, res) => {
	try {
		const { instagram = '', facebook = '', meta = '', tiktok = '' } = req.body || {};
		const newContent = [
			`INSTAGRAM_TOKEN=${instagram}`,
			`FACEBOOK_TOKEN=${facebook}`,
			`META_TOKEN=${meta}`,
			`TIKTOK_TOKEN=${tiktok}`,
			`PORT=${process.env.PORT || 3001}`,
			`CORS_ORIGIN=${process.env.CORS_ORIGIN || 'http://localhost:3000'}`,
		].join('\n');
		fs.writeFileSync(envPath, newContent + '\n');
		res.json({ success: true });
	} catch (err) {
		console.error('Failed to write .env', err);
		res.status(500).json({ error: 'Failed to save keys' });
	}
});

module.exports = router;