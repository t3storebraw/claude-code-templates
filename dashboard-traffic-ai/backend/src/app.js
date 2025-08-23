import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import apiKeysRouter from './routes/apiKeys.js';
import metricsRouter from './routes/metrics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
	res.json({ ok: true });
});

app.use('/apiKeys', apiKeysRouter);
app.use('/api', metricsRouter);

app.use((err, _req, res, _next) => {
	console.error('Unhandled error:', err);
	res.status(500).json({ error: 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
	app.listen(PORT, () => {
		console.log(`Backend running on http://localhost:${PORT}`);
	});
}

export default app;