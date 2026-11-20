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

// Real-time complete state sync snapshot endpoint (Cache-busted, zero isolate timeout)
app.get('/api/sync', (req, res) => {
  const products = db.getProducts();
  const categories = db.getCategories();
  const highlights = db.getHighlights();
  const collaborations = db.getCollaborations();
  const coupons = db.getCoupons();
  const bagEvents = db.getBagEvents();
  const orders = db.getOrders();
  const notifications = (db as any).getNotifications ? (db as any).getNotifications() : [];

  const totalOrdersVal = orders.reduce((acc, o) => acc + (Number(o.finalTotal) || 0), 0);
  const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= 5).length;
  const outOfStock = products.filter((p) => p.quantity <= 0).length;

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.json({
    ok: true,
    success: true,
    status: 'ok',
    database: 'local-file-db',
    timestamp: new Date().toISOString(),
    products,
    categories,
    highlights,
    collaborations,
    coupons,
    bagEvents,
    orders,
    notifications,
    settings: (db as any).getSettings ? (db as any).getSettings() : undefined,
    kpis: {
      totalProducts: products.length,
      totalInventory: products.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0),
      lowStockCount: lowStock,
      outOfStockCount: outOfStock,
      totalOrdersCount: orders.length,
      totalRevenue: totalOrdersVal,
      unreadNotifications: notifications.filter((n: any) => !n.read).length
    }
  });
});

// Store Settings Endpoints (Payments, Delivery, Bank, WhatsApp)
app.get('/api/settings', (req, res) => {
  res.json({ success: true, settings: (db as any).getSettings() });
});

app.put('/api/settings', (req, res) => {
  const updated = (db as any).updateSettings(req.body);
  sse.broadcast('SETTINGS_UPDATED', updated);
  res.json({ success: true, settings: updated });
});

app.patch('/api/settings', (req, res) => {
  const updated = (db as any).updateSettings(req.body);
  sse.broadcast('SETTINGS_UPDATED', updated);
  res.json({ success: true, settings: updated });
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
