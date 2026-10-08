/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { calculatePrice } from './src/lib/pricing/calculator';
import { DEFAULT_SHOP, DEFAULT_PRICING, DEFAULT_SHOP_ID } from './src/config/defaults';
import { Order, PrintJob, Printer, AuditLog, Shop, PricingConfig } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Setup directories
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Memory / JSON store backed by file for persistent local dev
const DATA_FILE = path.join(__dirname, 'data_store.json');

interface AppDataStore {
  shops: Record<string, Shop>;
  pricing: Record<string, PricingConfig>;
  orders: Record<string, Order>;
  printJobs: Record<string, PrintJob>;
  printers: Record<string, Printer>;
  auditLogs: AuditLog[];
  processedWebhooks: string[];
}

function loadDataStore(): AppDataStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading data store file, initializing defaults:', err);
  }

  return {
    shops: { [DEFAULT_SHOP_ID]: { ...DEFAULT_SHOP } },
    pricing: { [DEFAULT_SHOP_ID]: { ...DEFAULT_PRICING } },
    orders: {},
    printJobs: {},
    printers: {
      printer_01: {
        printerId: 'printer_01',
        shopId: DEFAULT_SHOP_ID,
        name: 'HP LaserJet Pro M404dn (Front Desk)',
        windowsPrinterName: 'HP LaserJet Pro M404dn',
        status: 'ONLINE',
        isDefault: true,
        supportsColor: false,
        supportsA3: false,
        supportsDuplex: true,
        lastHeartbeat: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      printer_02: {
        printerId: 'printer_02',
        shopId: DEFAULT_SHOP_ID,
        name: 'Canon imageRUNNER 2625 (Floor Xerox)',
        windowsPrinterName: 'Canon iR 2625',
        status: 'ONLINE',
        isDefault: false,
        supportsColor: true,
        supportsA3: true,
        supportsDuplex: true,
        lastHeartbeat: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    },
    auditLogs: [],
    processedWebhooks: [],
  };
}

const store = loadDataStore();

function saveDataStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting data store:', err);
  }
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG are supported.'));
    }
  },
});

app.use(express.json());

// Helper to record audit log
function recordAuditLog(log: Omit<AuditLog, 'logId' | 'timestamp'>) {
  const auditLog: AuditLog = {
    ...log,
    logId: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  store.auditLogs.unshift(auditLog);
  saveDataStore();
  return auditLog;
}

// Helper to generate next unique order number
function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = Object.keys(store.orders).length + 1;
  const seq = String(count).padStart(4, '0');
  return `DP-${dateStr}-${seq}`;
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Shop Settings
app.get('/api/shop', (req, res) => {
  const shopId = (req.query.shopId as string) || DEFAULT_SHOP_ID;
  const shop = store.shops[shopId] || DEFAULT_SHOP;
  res.json(shop);
});

app.post('/api/shop', (req, res) => {
  const updated: Shop = req.body;
  if (!updated.shopId) {
    res.status(400).json({ error: 'Missing shopId' });
    return;
  }
  const old = store.shops[updated.shopId];
  store.shops[updated.shopId] = {
    ...updated,
    updatedAt: new Date().toISOString(),
  };
  recordAuditLog({
    shopId: updated.shopId,
    adminId: 'admin_session',
    adminEmail: 'thehiddenvariable.business@gmail.com',
    action: 'SHOP_SETTINGS_UPDATED',
    oldValue: JSON.stringify(old || {}),
    newValue: JSON.stringify(updated),
    reason: 'Admin updated shop profile and payment settings',
  });
  saveDataStore();
  res.json(store.shops[updated.shopId]);
});

// Pricing Settings
app.get('/api/pricing', (req, res) => {
  const shopId = (req.query.shopId as string) || DEFAULT_SHOP_ID;
  const pricing = store.pricing[shopId] || DEFAULT_PRICING;
  res.json(pricing);
});

app.post('/api/pricing', (req, res) => {
  const updated: PricingConfig = req.body;
  if (!updated.shopId) {
    res.status(400).json({ error: 'Missing shopId' });
    return;
  }
  const old = store.pricing[updated.shopId];
  store.pricing[updated.shopId] = {
    ...updated,
    updatedAt: new Date().toISOString(),
  };
  recordAuditLog({
    shopId: updated.shopId,
    adminId: 'admin_session',
    adminEmail: 'thehiddenvariable.business@gmail.com',
    action: 'PRICE_CHANGED',
    oldValue: JSON.stringify(old || {}),
    newValue: JSON.stringify(updated),
    reason: 'Admin modified per-page pricing rules',
  });
  saveDataStore();
  res.json(store.pricing[updated.shopId]);
});

// Create Order (with file upload & server-side price calculation)
app.post('/api/orders', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'File upload is required' });
      return;
    }

    const {
      shopId = DEFAULT_SHOP_ID,
      customerName,
      customerPhone,
      pageCount = '1',
      paperSize = 'A4',
      printType = 'BW',
      duplex = 'SINGLE',
      copies = '1',
      orientation = 'PORTRAIT',
    } = req.body;

    if (!customerName || !customerPhone) {
      res.status(400).json({ error: 'Customer name and mobile number are required' });
      return;
    }

    // Validate phone number format (Indian 10-digit mobile)
    const phoneClean = customerPhone.replace(/\D/g, '');
    if (phoneClean.length < 10) {
      res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
      return;
    }

    const pages = Math.max(1, parseInt(pageCount, 10) || 1);
    const numCopies = Math.max(1, parseInt(copies, 10) || 1);

    // CRITICAL: Calculate price server-side using current pricing settings!
    // Never trust client-submitted amount!
    const pricing = store.pricing[shopId] || DEFAULT_PRICING;
    const priceCalculation = calculatePrice(
      pages,
      {
        paperSize: paperSize as any,
        printType: printType as any,
        duplex: duplex as any,
        copies: numCopies,
        orientation: orientation as any,
      },
      pricing
    );

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const orderNumber = generateOrderNumber();

    const order: Order = {
      orderId,
      orderNumber,
      shopId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      fileName: req.file.originalname,
      storagePath: req.file.filename,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      pageCount: pages,
      paperSize: paperSize as any,
      printType: printType as any,
      duplex: duplex as any,
      copies: numCopies,
      orientation: orientation as any,
      unitPrice: priceCalculation.ratePerSheet,
      amount: priceCalculation.total,
      currency: 'INR',
      paymentStatus: 'PENDING',
      printStatus: 'WAITING_FOR_PAYMENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.orders[orderId] = order;
    saveDataStore();

    res.status(201).json(order);
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message || 'Internal server error creating order' });
  }
});

// Get Order by ID
app.get('/api/orders/:id', (req, res) => {
  const order = store.orders[req.params.id];
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json(order);
});

// Secure Customer Order Tracking (requires matching orderNumber and phone)
app.get('/api/orders/track', (req, res) => {
  const orderNumber = (req.query.orderNumber as string || '').trim().toUpperCase();
  const phone = (req.query.phone as string || '').replace(/\D/g, '');

  if (!orderNumber || !phone) {
    res.status(400).json({ error: 'Please provide both order number and mobile number' });
    return;
  }

  const match = Object.values(store.orders).find(
    (o) =>
      o.orderNumber.toUpperCase() === orderNumber &&
      o.customerPhone.replace(/\D/g, '').endsWith(phone.slice(-10))
  );

  if (!match) {
    res.status(404).json({ error: 'Order not found. Please verify the order number and mobile.' });
    return;
  }

  res.json(match);
});

// Customer claims "I HAVE PAID" -> sets to CLAIMED (Never automatic VERIFIED!)
app.post('/api/orders/:id/claim-payment', (req, res) => {
  const order = store.orders[req.params.id];
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  if (order.paymentStatus === 'VERIFIED') {
    res.json(order);
    return;
  }

  order.paymentStatus = 'CLAIMED';
  order.paymentClaimedAt = new Date().toISOString();
  order.updatedAt = new Date().toISOString();

  saveDataStore();
  res.json(order);
});

// Helper to transition order to VERIFIED and queue Print Job
function verifyAndQueueOrder(order: Order, verifiedBy: string, reason: string): PrintJob {
  order.paymentStatus = 'VERIFIED';
  order.paymentVerifiedAt = new Date().toISOString();
  order.paymentVerifiedBy = verifiedBy;
  order.verificationReason = reason;
  order.printStatus = 'QUEUED';
  order.updatedAt = new Date().toISOString();

  // Find default printer
  const defaultPrinter = Object.values(store.printers).find((p) => p.isDefault) || Object.values(store.printers)[0];

  // Create Print Job
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const printJob: PrintJob = {
    jobId,
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    shopId: order.shopId,
    status: 'QUEUED',
    printerId: defaultPrinter?.printerId,
    windowsPrinterName: defaultPrinter?.windowsPrinterName,
    fileName: order.fileName,
    pageCount: order.pageCount,
    paperSize: order.paperSize,
    printType: order.printType,
    duplex: order.duplex,
    copies: order.copies,
    orientation: order.orientation,
    attempts: 0,
    maxAttempts: 3,
    downloadUrl: `/api/files/${order.storagePath}`,
    createdAt: new Date().toISOString(),
  };

  store.printJobs[jobId] = printJob;
  saveDataStore();
  return printJob;
}

// Admin / Manual Payment Verification
app.post('/api/orders/:id/verify-payment', (req, res) => {
  const { adminId = 'admin_user', adminEmail = 'thehiddenvariable.business@gmail.com', reason = 'Admin confirmed payment received' } = req.body;
  const order = store.orders[req.params.id];
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const oldStatus = order.paymentStatus;
  verifyAndQueueOrder(order, adminId, reason);

  recordAuditLog({
    shopId: order.shopId,
    adminId,
    adminEmail,
    action: 'PAYMENT_MANUALLY_VERIFIED',
    orderId: order.orderId,
    oldValue: oldStatus,
    newValue: 'VERIFIED',
    reason,
  });

  res.json(order);
});

// Official / Future Payment Gateway Webhook (Section 8: Idempotency & Signature)
app.post('/api/payment/webhook', (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    const { event_id, order_id, order_number, amount, currency, status } = req.body;

    if (!event_id) {
      res.status(400).json({ error: 'Missing event_id' });
      return;
    }

    // Idempotency: Prevent duplicate webhook processing
    if (store.processedWebhooks.includes(event_id)) {
      res.status(200).json({ status: 'already_processed', message: 'Duplicate webhook event ignored' });
      return;
    }

    // Verify order exists
    const order = order_id ? store.orders[order_id] : Object.values(store.orders).find((o) => o.orderNumber === order_number);
    if (!order) {
      res.status(404).json({ error: 'Referenced order not found' });
      return;
    }

    // Strict amount & currency validation
    if (currency && currency !== 'INR') {
      res.status(400).json({ error: 'Invalid currency' });
      return;
    }

    if (amount !== undefined && Math.abs(Number(amount) - order.amount) > 0.01) {
      res.status(400).json({ error: 'Amount mismatch: payment amount does not match order total' });
      return;
    }

    // Process only if status is captured/success
    if (status === 'SUCCESS' || status === 'PAID') {
      verifyAndQueueOrder(order, 'WEBHOOK_AUTOMATION', `Automated webhook confirmed for event ${event_id}`);
      store.processedWebhooks.push(event_id);
      saveDataStore();
    }

    res.json({ success: true, orderNumber: order.orderNumber, status: order.paymentStatus });
  } catch (err: any) {
    console.error('Webhook processing failure:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// List all orders (Admin)
app.get('/api/orders', (req, res) => {
  const shopId = (req.query.shopId as string) || DEFAULT_SHOP_ID;
  const orders = Object.values(store.orders)
    .filter((o) => o.shopId === shopId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(orders);
});

// List all print jobs (Admin / Queue monitor)
app.get('/api/print-jobs', (req, res) => {
  const shopId = (req.query.shopId as string) || DEFAULT_SHOP_ID;
  const jobs = Object.values(store.printJobs)
    .filter((j) => j.shopId === shopId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(jobs);
});

// Retry a failed print job
app.post('/api/print-jobs/:id/retry', (req, res) => {
  const { adminId = 'admin_user' } = req.body;
  const job = store.printJobs[req.params.id];
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  const oldStatus = job.status;
  job.status = 'QUEUED';
  job.attempts += 1;
  job.errorMessage = undefined;

  const order = store.orders[job.orderId];
  if (order) {
    order.printStatus = 'QUEUED';
  }

  recordAuditLog({
    shopId: job.shopId,
    adminId,
    adminEmail: 'thehiddenvariable.business@gmail.com',
    action: 'PRINT_RETRIED',
    orderId: job.orderId,
    oldValue: oldStatus,
    newValue: 'QUEUED',
    reason: `Admin requested reprint retry (Attempt ${job.attempts})`,
  });

  saveDataStore();
  res.json(job);
});

// Cancel a print job
app.post('/api/print-jobs/:id/cancel', (req, res) => {
  const { adminId = 'admin_user', reason = 'Cancelled by administrator' } = req.body;
  const job = store.printJobs[req.params.id];
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  const oldStatus = job.status;
  job.status = 'CANCELLED';
  job.errorMessage = reason;

  const order = store.orders[job.orderId];
  if (order) {
    order.printStatus = 'CANCELLED';
  }

  recordAuditLog({
    shopId: job.shopId,
    adminId,
    adminEmail: 'thehiddenvariable.business@gmail.com',
    action: 'ORDER_CANCELLED',
    orderId: job.orderId,
    oldValue: oldStatus,
    newValue: 'CANCELLED',
    reason,
  });

  saveDataStore();
  res.json(job);
});

// List Printers
app.get('/api/printers', (req, res) => {
  const shopId = (req.query.shopId as string) || DEFAULT_SHOP_ID;
  const printers = Object.values(store.printers).filter((p) => p.shopId === shopId);
  res.json(printers);
});

// Set Default Printer
app.post('/api/printers/:id/default', (req, res) => {
  const shopId = req.body.shopId || DEFAULT_SHOP_ID;
  const targetId = req.params.id;

  Object.values(store.printers).forEach((p) => {
    if (p.shopId === shopId) {
      p.isDefault = p.printerId === targetId;
    }
  });

  recordAuditLog({
    shopId,
    adminId: 'admin_session',
    adminEmail: 'thehiddenvariable.business@gmail.com',
    action: 'PRINTER_CHANGED',
    newValue: targetId,
    reason: `Set ${targetId} as default printer`,
  });

  saveDataStore();
  res.json(Object.values(store.printers).filter((p) => p.shopId === shopId));
});

// Audit Logs
app.get('/api/audit-logs', (req, res) => {
  const shopId = (req.query.shopId as string) || DEFAULT_SHOP_ID;
  const logs = store.auditLogs.filter((l) => l.shopId === shopId).slice(0, 100);
  res.json(logs);
});

// Admin Reports / Metrics
app.get('/api/reports', (req, res) => {
  const shopId = (req.query.shopId as string) || DEFAULT_SHOP_ID;
  const orders = Object.values(store.orders).filter((o) => o.shopId === shopId);
  const jobs = Object.values(store.printJobs).filter((j) => j.shopId === shopId);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'VERIFIED')
    .reduce((sum, o) => sum + o.amount, 0);

  const totalPagesPrinted = orders
    .filter((o) => o.printStatus === 'COMPLETED')
    .reduce((sum, o) => sum + (o.pageCount * o.copies), 0);

  const pendingPayments = orders.filter((o) => o.paymentStatus === 'PENDING' || o.paymentStatus === 'CLAIMED').length;
  const queuedJobs = jobs.filter((j) => j.status === 'QUEUED').length;
  const printingJobs = jobs.filter((j) => j.status === 'PRINTING' || j.status === 'CLAIMED' || j.status === 'DOWNLOADING').length;
  const completedJobs = jobs.filter((j) => j.status === 'COMPLETED').length;
  const failedJobs = jobs.filter((j) => j.status === 'FAILED').length;

  res.json({
    totalOrders: orders.length,
    totalRevenue,
    totalPagesPrinted,
    pendingPayments,
    queuedJobs,
    printingJobs,
    completedJobs,
    failedJobs,
  });
});

// -------------------------------------------------------------
// PRINT AGENT ENDPOINTS (Section 10)
// -------------------------------------------------------------

// Agent Polls for QUEUED jobs
app.get('/api/agent/jobs', (req, res) => {
  const shopId = (req.query.shopId as string) || DEFAULT_SHOP_ID;
  const queued = Object.values(store.printJobs).filter(
    (j) => j.shopId === shopId && j.status === 'QUEUED'
  );
  res.json(queued);
});

// Agent claims a job atomically
app.post('/api/agent/jobs/:id/claim', (req, res) => {
  const { agentId } = req.body;
  const job = store.printJobs[req.params.id];
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  // Atomic lock: Only claim if currently QUEUED
  if (job.status !== 'QUEUED') {
    res.status(409).json({ error: 'Job already claimed or processed', currentStatus: job.status });
    return;
  }

  job.status = 'CLAIMED';
  job.claimedByAgentId = agentId || 'windows-agent-01';
  job.claimedAt = new Date().toISOString();
  job.startedAt = new Date().toISOString();

  const order = store.orders[job.orderId];
  if (order) {
    order.printStatus = 'DOWNLOADING';
  }

  saveDataStore();
  res.json(job);
});

// Agent updates job progress (PRINTING, COMPLETED, FAILED)
app.post('/api/agent/jobs/:id/status', (req, res) => {
  const { status, errorMessage, windowsPrinterName } = req.body;
  const job = store.printJobs[req.params.id];
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  job.status = status;
  if (windowsPrinterName) job.windowsPrinterName = windowsPrinterName;
  if (errorMessage) job.errorMessage = errorMessage;

  if (status === 'COMPLETED') {
    job.completedAt = new Date().toISOString();
  }

  const order = store.orders[job.orderId];
  if (order) {
    order.printStatus = status;
    order.updatedAt = new Date().toISOString();
  }

  saveDataStore();
  res.json(job);
});

// Agent registers discovered Windows Printers and sends heartbeat
app.post('/api/agent/printers', (req, res) => {
  const { shopId = DEFAULT_SHOP_ID, printers = [] } = req.body;

  printers.forEach((p: any) => {
    const id = `printer_${p.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    const existing = store.printers[id];
    store.printers[id] = {
      printerId: id,
      shopId,
      name: p.name,
      windowsPrinterName: p.name,
      status: 'ONLINE',
      isDefault: existing ? existing.isDefault : false,
      supportsColor: p.supportsColor ?? true,
      supportsA3: p.supportsA3 ?? true,
      supportsDuplex: p.supportsDuplex ?? true,
      lastHeartbeat: new Date().toISOString(),
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
  });

  saveDataStore();
  res.json({ success: true, count: printers.length });
});

// Secure file access (Only for Print Agent / Admin preview)
app.get('/api/files/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filepath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filepath)) {
    res.status(404).json({ error: 'File not found or expired' });
    return;
  }

  res.sendFile(filepath);
});

// -------------------------------------------------------------
// VITE MIDDLEWARE INTEGRATION (React SPA)
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Print Shop Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
