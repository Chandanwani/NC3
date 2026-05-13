// ============================================================
//  KisanBazaar — Main JavaScript
//  Handles: Product data, Search, Categories, Farmers
// ============================================================

const CATEGORIES = [
  { img: 'images/categories/vegetables_3d.png', name: 'Vegetables', bg: 'var(--bg-soft-green)', color: '#2E7D32' },
  { img: 'images/products/mangoes.png', name: 'Fruits', bg: 'var(--bg-soft-red)', color: '#D32F2F' },
  { img: 'images/products/wheat-flour.png', name: 'Grains', bg: 'var(--bg-soft-peach)', color: '#E65100' },
  { img: 'images/products/milk.png', name: 'Dairy', bg: 'var(--bg-soft-blue)', color: '#0288D1' },
  { img: 'images/products/ginger.png', name: 'Organic', bg: 'var(--bg-soft-green)', color: '#1B5E20' },
  { img: 'images/products/turmeric.png', name: 'Spices', bg: 'var(--bg-soft-peach)', color: '#BF360C' },
  { img: 'images/products/chickpeas.png', name: 'Pulses', bg: 'var(--bg-soft-purple)', color: '#4A148C' }
];

const PRODUCTS = [
  { img: 'images/products/bell_pepper_yellow_real.png', name: 'Bell Pepper (Yellow)', farmer: 'Sunil Gavaskar', region: 'Nashik, MH', price: 66, unit: 'kg', rating: 5, reviews: 127 },
  { img: 'images/products/ragi_1773599981126.png', name: 'Ragi (Nachni)', farmer: 'Anna Hazare', region: 'Ralegan, MH', price: 123, unit: 'kg', rating: 5, reviews: 89 },
  { img: 'images/products/maize_1773600203331.png', name: 'Maize', farmer: 'Sharad Pawar', region: 'Baramati, MH', price: 43, unit: 'kg', rating: 5, reviews: 203 },
  { img: 'images/products/bajra_1773599928300.png', name: 'Finger Millet', farmer: 'Vijay Bhosale', region: 'Nashik, MH', price: 94, unit: 'kg', rating: 5, reviews: 154 },
  { img: 'images/products/jowar_1773599853798.png', name: 'Green Gram (Moong)', farmer: 'Anand Mahindra', region: 'Pune, MH', price: 90, unit: 'kg', rating: 5, reviews: 76 },
  { img: 'images/products/moong-dal.png', name: 'Moong Dal', farmer: 'Ratan Tata', region: 'Mumbai, MH', price: 173, unit: 'kg', rating: 5, reviews: 94 }
];

const FARMERS = [
  { name: 'Ramesh Kumar', region: 'Nashik, MH', crops: 'Tomatoes, Onions, Chilli', rating: 4.9, orders: 1240, emoji: '🌿', verified: true },
  { name: 'Suresh Patil', region: 'Pune, MH', crops: 'Wheat, Rice, Soybean', rating: 4.8, orders: 890, emoji: '🌾', verified: true },
  { name: 'Vijay Bhosale', region: 'Mahabaleshwar', crops: 'Potatoes, Cauliflower, Corn', rating: 4.7, orders: 650, emoji: '🥔', verified: true },
  { name: 'Anita Kumari', region: 'Pune, MH', crops: 'Leafy Greens, Herbs', rating: 4.8, orders: 430, emoji: '🍃', verified: false },
];

/* ── Render Categories ──────────────────────────────────────── */
function renderCategories() {
  const grid = document.getElementById('categories-grid');
  if (!grid) return;
  grid.innerHTML = '';

  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
  grid.style.gap = '32px';

  CATEGORIES.forEach(c => {
    const iconContent = c.img
      ? `<img src="${c.img}" class="cat-img">`
      : `<div class="cat-emoji" style="font-size:80px; text-align:center;">${c.emoji}</div>`;

    grid.insertAdjacentHTML('beforeend', `
      <div class="cat-card-large" onclick="filterByCategory('${c.name}')">
        ${iconContent}
        <h4>${c.name}</h4>
      </div>
    `);
  });
}

/* ── Render Products ────────────────────────────────────────── */
async function renderProducts(products, containerId) {
  const grid = document.getElementById(containerId || 'products-grid');
  if (!grid) return;
  grid.innerHTML = '';

  let list = products;
  if (!list) {
    // If it's the main home page grid, use our curated PRODUCTS list
    if (!containerId || containerId === 'products-grid') {
      list = PRODUCTS;
    } else {
      try {
        const all = await KBApi.request('/api/products');
        list = all.slice(0, 4);
      } catch (err) {
        console.error('Failed to load home products', err);
        list = [];
      }
    }
  }

  list.forEach(p => {
    const encodedName = encodeURIComponent(p.name);
    // Home page uses premium product card scroll
    if (!containerId || containerId === 'products-grid') {
      grid.classList.add('popular-categories-wrapper');
      grid.insertAdjacentHTML('beforeend', `
        <div class="premium-product-card" onclick="window.location.href='pages/product-details.html?name=${encodedName}'" style="cursor:pointer;">
          <div class="card-image-wrapper">
             <img src="${p.img}" alt="${p.name}">
          </div>
          <div class="card-details">
            <h4 class="card-title">${p.name}</h4>
            <div class="card-meta">
              <span class="card-price">₹${p.price}</span>
              <div class="card-rating"><span>★</span> ${p.rating}</div>
            </div>
          </div>
        </div>
      `);
    } else {
      // Products page uses minimalist minimal cards
      grid.insertAdjacentHTML('beforeend', `
        <div class="card product-card-minimal" style="background:#fff; border-radius:24px; padding:16px; transition:all 0.4s; cursor:pointer;" onclick="window.location.href='pages/product-details.html?name=${encodedName}'">
          <div style="background:var(--bg-soft-green); border-radius:18px; height:160px; display:flex; align-items:center; justify-content:center; margin-bottom:16px; overflow:hidden;">
            ${p.img ? `<img src="${p.img.startsWith('../') ? p.img.slice(3) : p.img}" style="max-height:80%; max-width:80%; object-fit:contain; filter:${p.filter || 'none'};" />` : (p.emoji ? `<span style="font-size:60px;">${p.emoji}</span>` : '')}
          </div>
          <div style="padding:0 4px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
              <h3 style="font-size:16px; margin:0; color:var(--text); font-family:'DM Sans', sans-serif;">${p.name}</h3>
              <div style="color:var(--primary); font-weight:800; font-size:18px;">₹${p.price}</div>
            </div>
            <div style="display:flex; align-items:center; gap:4px; font-size:13px; color:var(--text-muted); font-weight:600;">
              ⭐ ${p.rating}
            </div>
          </div>
        </div>
      `);
    }
  });
}

function homeAddToCart(btn, name, price, unit, farmer, emoji) {
  if (typeof Cart !== 'undefined') {
    Cart.addItem(name, price, unit, farmer, emoji);
  } else {
    showToast('✅ ' + name + ' added!', 'success');
  }
  const orig = btn.innerHTML;
  btn.innerHTML = '✅ Added!';
  btn.disabled = true;
  setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1500);
}

/* ── Render Farmers ─────────────────────────────────────────── */
function renderFarmers() {
  const grid = document.getElementById('farmers-grid');
  if (!grid) return;
  FARMERS.forEach(f => {
    grid.insertAdjacentHTML('beforeend', `
      <div class="card" style="padding:24px;text-align:center;cursor:pointer;" onclick="window.location.href='pages/farmer-dashboard.html'">
        <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--primary-light));display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 16px;">${f.emoji}</div>
        <h4 style="font-family:'DM Sans',sans-serif;margin-bottom:4px;">${f.name} ${f.verified ? '✅' : ''}</h4>
        <p class="text-muted" style="font-size:13px;margin-bottom:8px;">📍 ${f.region}</p>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">🌱 ${f.crops}</p>
        <div style="display:flex;justify-content:center;gap:20px;margin-bottom:16px;">
          <div style="text-align:center;"><strong>${f.rating}</strong><br/><span style="font-size:11px;color:var(--text-muted);">Rating</span></div>
          <div style="text-align:center;"><strong>${f.orders}</strong><br/><span style="font-size:11px;color:var(--text-muted);">Orders</span></div>
        </div>
        <button class="btn btn-outline btn-sm w-full" onclick="event.stopPropagation();window.location.href='pages/farmer-dashboard.html'">View Farm →</button>
      </div>
    `);
  });
}

/* ── Search ──────────────────────────────────────────────────── */
function searchProducts() {
  const el = document.getElementById('hero-search');
  if (!el) return;
  const q = el.value.trim();
  if (!q) return;
  window.location.href = 'products.html?q=' + encodeURIComponent(q);
}

function filterByCategory(name) {
  window.location.href = 'products.html?cat=' + encodeURIComponent(name);
}

document.addEventListener('keypress', function (e) {
  if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'hero-search') {
    searchProducts();
  }
});

/* ── Shared toast (fallback if cart.js not loaded) ─────────── */
function showToast(msg, type) {
  let c = document.getElementById('toast-container');
  if (!c) { c = document.createElement('div'); c.id = 'toast-container'; c.className = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div'); t.className = 'toast ' + (type || ''); t.textContent = msg; c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ── Init ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  renderCategories();
  renderProducts();
  renderFarmers();
  if (typeof updateNavbarAuth === 'function') updateNavbarAuth();
});
