// ============================================================
//  KisanBazaar — Shared Cart Library (localStorage-based)
//  Include this on every page: <script src="/js/cart.js"></script>
// ============================================================

const Cart = {
    /* ── Storage ──────────────────────────────────────────── */
    KEY: 'kb_cart',

    getAll() {
        try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
        catch { return []; }
    },

    save(items) {
        localStorage.setItem(this.KEY, JSON.stringify(items));
        this.updateBadge();
    },

    getCount() {
        return this.getAll().reduce((sum, i) => sum + i.qty, 0);
    },

    addItem(name, price, unit, farmer, emoji) {
        const items = this.getAll();
        const existing = items.find(i => i.name === name);
        if (existing) {
            existing.qty++;
        } else {
            items.push({ name, price, unit, farmer, emoji: emoji || '🛒', qty: 1 });
        }
        this.save(items);
        showToast('✅ ' + name + ' added to cart!', 'success');
        return items.length;
    },

    removeItem(name) {
        const items = this.getAll().filter(i => i.name !== name);
        this.save(items);
    },

    updateQty(name, delta) {
        const items = this.getAll();
        const item = items.find(i => i.name === name);
        if (item) {
            item.qty = Math.max(1, item.qty + delta);
            this.save(items);
        }
        return this.getAll();
    },

    clear() {
        this.save([]);
    },

    getTotal() {
        return this.getAll().reduce((sum, i) => sum + i.price * i.qty, 0);
    },

    updateBadge() {
        const count = this.getCount();
        document.querySelectorAll('#cart-count, .cart-count').forEach(el => {
            el.textContent = count;
        });
    }
};

/* ── Shared toast (works on all pages) ─────────────────── */
function showToast(msg, type = '') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/* ── Init badge on page load ────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => Cart.updateBadge());
