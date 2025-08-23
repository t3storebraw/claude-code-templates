const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
	origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
	credentials: true,
}));

// Health check
app.get('/api/health', (_req, res) => {
	res.json({ ok: true, service: 'dashboard-traffic-ai-backend' });
});

// Routes
const apiKeysRouter = require('./routes/apiKeys');
const metricsRouter = require('./routes/metrics');
const campaignsRouter = require('./routes/campaigns');

app.use('/api/apiKeys', apiKeysRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/campaigns', campaignsRouter);

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
	console.error('Unhandled error:', err);
	res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
	console.log(`Backend listening on http://localhost:${port}`);
});