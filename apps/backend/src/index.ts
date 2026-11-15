import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sse } from './sse.js';
import { productsRouter } from './routes/products.js';
import { couponsRouter } from './routes/coupons.js';
import { bagAndOrdersRouter } from './routes/bagAndOrders.js';
import { uploadRouter } from './routes/upload.js';
import { categoriesRouter } from './routes/categories.js';
import { highlightsRouter } from './routes/highlights.js';
import { collaborationsRouter } from './routes/collaborations.js';
import { adminAuthRouter } from './routes/adminAuth.js';
import { notificationsRouter } from './routes/notifications.js';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../data/uploads');

const app = express();
const PORT = process.env.PORT || 8787;

// Enable CORS for Storefront (3000) and Admin Panel (3001 / 3002)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body limit up to 25MB for high-res images and large uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static file serving for uploads with cross-origin headers
app.use('/uploads', express.static(UPLOADS_DIR, {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'Tara Luxe (@tara.luxe.in)',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    sseClients: sse.getClientCount(),
    totalProducts: db.getProducts().length,
    totalCategories: db.getCategories().length,
    totalHighlights: db.getHighlights().length,
    totalCollaborations: db.getCollaborations().length,
    totalCoupons: db.getCoupons().length,
    totalOrders: db.getOrders().length
  });
});

// SSE real-time stream endpoint
app.get('/api/stream', (req, res) => {
  sse.handleConnection(req, res);
});

// Mount Routes
app.use('/api/products', productsRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/highlights', highlightsRouter);
app.use('/api/collaborations', collaborationsRouter);
app.use('/api/admin', adminAuthRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api', bagAndOrdersRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Backend Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` ✨ Tara Luxe Backend API & SSE Broadcaster Running ✨ `);
  console.log(` 🚀 URL: http://localhost:${PORT}`);
  console.log(` 📡 Stream: http://localhost:${PORT}/api/stream`);
  console.log(` 🩺 Health: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

export default app;
