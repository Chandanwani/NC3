// ===================================================
//  KisanBazaar — Express + Razorpay Backend
//  Serves static files AND creates Razorpay orders
// ===================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const Razorpay = require('razorpay');

const app = express();
const PORT = process.env.PORT || 8080;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_KEY_ID',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET',
});

// ── Database Helpers ──────────────────────────────────────────
const DB_PATH = path.join(__dirname, '..', 'kisanbazaar', 'data', 'db.json');
const fs = require('fs').promises;

async function readDB() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('[DB] Read error:', err);
        return { users: [], products: [], orders: [] };
    }
}

async function writeDB(data) {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('[DB] Write error:', err);
    }
}

// ── Middleware ────────────────────────────────────────────────
const checkAuth = (req, res, next) => {
    // Simulating authentication with a custom header for this exercise
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    next();
};

const checkRole = (role) => (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    if (userRole !== role && userRole !== 'admin') {
        return res.status(403).json({ error: 'Access denied: ' + role + ' role required' });
    }
    next();
};

// ── Auth API ──────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role, city, mobile } = req.body;
    const db = await readDB();
    if (db.users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email already registered' });
    }
    const newUser = { id: 'u' + Date.now(), name, email, password, role, city, mobile };
    db.users.push(newUser);
    await writeDB(db);
    res.json({ success: true, user: { id: newUser.id, name, email, role } });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const db = await readDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// ── Products API ──────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
    const db = await readDB();
    let list = db.products;
    if (req.query.cat && req.query.cat !== 'All') {
        list = list.filter(p => p.cat === req.query.cat);
    }
    res.json(list);
});

app.post('/api/products', checkAuth, checkRole('farmer'), async (req, res) => {
    const product = req.body;
    const db = await readDB();
    product.id = 'p' + Date.now();
    db.products.unshift(product);
    await writeDB(db);
    res.json({ success: true, product });
});

// ── Orders API ────────────────────────────────────────────────
app.get('/api/orders', checkAuth, async (req, res) => {
    const { userId, role } = req.query;
    const db = await readDB();
    let list = db.orders;
    if (role === 'farmer') {
        list = list.filter(o => o.items.some(i => i.farmerId === userId));
    } else {
        list = list.filter(o => o.userId === userId);
    }
    res.json(list);
});

app.post('/api/orders', checkAuth, async (req, res) => {
    const order = req.body;
    const db = await readDB();
    order.id = 'ord' + Date.now();
    order.status = 'Confirmed';
    order.timestamp = new Date().toISOString();
    db.orders.unshift(order);
    await writeDB(db);
    res.json({ success: true, order });
});

// ── Razorpay API ──────────────────────────────────────────────
app.post('/api/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt, notes } = req.body;
        const options = {
            amount: Math.round(amount * 100),
            currency,
            receipt: receipt || 'KB' + Date.now(),
            notes: notes || {},
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/verify-payment', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    if (expected === razorpay_signature) {
        res.json({ verified: true, payment_id: razorpay_payment_id });
    } else {
        res.status(400).json({ verified: false });
    }
});

app.get('/api/config', (req, res) => {
    res.json({ key_id: process.env.RAZORPAY_KEY_ID || '' });
});

app.patch('/api/orders/:id', checkAuth, checkRole('farmer'), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const db = await readDB();
    const order = db.orders.find(o => o.id === id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = status;
    await writeDB(db);
    res.json({ success: true, order });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Static Files & SPA Fallback ────────
app.use(express.static(path.join(__dirname, '..', 'kisanbazaar')));

app.get('*', (req, res) => {
    // Only fallback for non-API routes
    if (req.url.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(__dirname, '..', 'kisanbazaar', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────
// ── Export for Vercel ─────────────────────────────────────────
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        const configured = process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('YOUR_KEY_ID');
        console.log('');
        console.log('🌿 KisanBazaar server running at http://localhost:' + PORT);
        console.log('💳 Razorpay: ' + (configured ? '✅ Configured' : '⚠️  Keys not set — add them to .env'));
        console.log('');
    });
}
