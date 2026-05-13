// ============================================================
//  KisanBazaar — Shared App JS (include on ALL pages)
//  Handles: Session, API, Nav, Mobile menu, Toast, Loading
// ============================================================

/* ── Path Helpers ─────────────────────────────────────────── */
function getBasePath() {
    const path = location.pathname;
    // If we are inside /pages/, go up one level
    if (path.includes('/pages/')) return '../';
    return '';
}

/* ── Format currency ─────────────────────────────────────── */
window.formatINR = function (n) {
    return '₹' + Number(n).toLocaleString('en-IN');
};

/* ── API Helper ─────────────────────────────────────────── */
window.KBApi = {
    async request(url, method = 'GET', body = null) {
        const user = KBSession.getUser();
        const headers = { 'Content-Type': 'application/json' };
        if (user) {
            headers['x-user-id'] = user.id;
            headers['x-user-role'] = user.role;
        }
        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);
        try {
            const res = await fetch(url, options);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Request failed');
            return data;
        } catch (err) {
            console.error('[API Error]', err);
            throw err;
        }
    }
};

/* ── Session: simple user state ──────────────────────────── */
window.KBSession = {
    getUser() {
        try { return JSON.parse(localStorage.getItem('kb_user')) || null; } catch { return null; }
    },
    setUser(u) { localStorage.setItem('kb_user', JSON.stringify(u)); },
    logout() {
        localStorage.removeItem('kb_user');
        const base = getBasePath();
        // Go to home page after logout — navbar will show Sign In / Register
        window.location.href = base + 'index.html';
    },
    isLoggedIn() { return !!this.getUser(); },

    async login(email, password) {
        const res = await KBApi.request('/api/auth/login', 'POST', { email, password });
        if (res.success) this.setUser(res.user);
        return res;
    },

    async register(data) {
        const res = await KBApi.request('/api/auth/register', 'POST', data);
        if (res.success) this.setUser(res.user);
        return res;
    }
};

/* ── Shared Toast ─────────────────────────────────────────── */
if (typeof showToast !== 'function') {
    window.showToast = function (msg, type) {
        let c = document.getElementById('toast-container');
        if (!c) { c = document.createElement('div'); c.id = 'toast-container'; c.className = 'toast-container'; document.body.appendChild(c); }
        const t = document.createElement('div');
        t.className = 'toast ' + (type || '');
        t.textContent = msg;
        c.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(100%)'; setTimeout(() => t.remove(), 300); }, 3000);
    };
}

/* ── Confirm dialog (styled) ─────────────────────────────── */
window.kbConfirm = function (msg, onYes) {
    let modal = document.getElementById('kb-confirm');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'kb-confirm';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;display:flex;align-items:center;justify-content:center;';
        modal.innerHTML = `
      <div style="background:#fff;border-radius:var(--radius-lg);padding:36px;max-width:380px;width:90%;text-align:center;box-shadow:var(--shadow-lg);">
        <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
        <p id="kb-confirm-msg" style="font-size:17px;font-weight:600;margin-bottom:24px;"></p>
        <div style="display:flex;gap:12px;justify-content:center;">
          <button id="kb-confirm-yes" class="btn btn-primary">Yes, confirm</button>
          <button id="kb-confirm-no"  class="btn btn-outline">Cancel</button>
        </div>
      </div>
    `;
        document.body.appendChild(modal);
    }
    document.getElementById('kb-confirm-msg').textContent = msg;
    modal.style.display = 'flex';
    document.getElementById('kb-confirm-yes').onclick = () => { modal.style.display = 'none'; onYes(); };
    document.getElementById('kb-confirm-no').onclick = () => { modal.style.display = 'none'; };
};

/* ── Loading overlay ─────────────────────────────────────── */
function showLoading(msg) {
    let overlay = document.getElementById('kb-loading');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'kb-loading';
        overlay.style.cssText = `
      position:fixed; inset:0; background:rgba(255,255,255,0.9);
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      z-index:9999; gap:16px; backdrop-filter:blur(4px);
    `;
        overlay.innerHTML = `
      <div style="width:48px;height:48px;border:4px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:kb-spin 0.8s linear infinite;"></div>
      <p style="font-weight:600;color:var(--primary);font-family:'DM Sans',sans-serif;" id="kb-loading-msg">${msg || 'Loading…'}</p>
      <style>@keyframes kb-spin{to{transform:rotate(360deg)}}</style>
    `;
        document.body.appendChild(overlay);
    } else {
        document.getElementById('kb-loading-msg').textContent = msg || 'Loading…';
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('kb-loading');
    if (overlay) overlay.style.display = 'none';
}

/* ── Build Unified Navbar ─────────────────────────────────── */
function buildUnifiedNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar || navbar.dataset.built) return;
    navbar.dataset.built = '1';

    const user = KBSession.getUser();
    const base = getBasePath();
    const currentPage = location.pathname.split('/').pop() || 'index.html';

    // Determine nav links based on role
    let navLinks = '';
    let actionLinks = '';

    if (!user) {
        // Not logged in — still show cart so users can add items freely
        navLinks = `
            <li><a href="${base}index.html" ${currentPage === 'index.html' ? 'class="active"' : ''}>Home</a></li>
            <li><a href="${base}products.html" ${currentPage === 'products.html' ? 'class="active"' : ''}>Products</a></li>
        `;
        actionLinks = `
            <a href="${base}pages/cart.html" class="btn btn-outline btn-sm" ${currentPage === 'cart.html' ? 'style="border-color:var(--primary);color:var(--primary);"' : ''}>🛒 Cart <span class="cart-count" style="background:var(--accent);color:#fff;border-radius:100px;padding:2px 7px;font-size:11px;margin-left:3px;">0</span></a>
            <a href="${base}pages/login.html" class="btn btn-primary btn-sm">Sign In</a>
            <a href="${base}pages/buyer-register.html" class="btn btn-outline btn-sm">Register</a>
        `;
    } else if (user.role === 'farmer') {
        navLinks = `
            <li><a href="${base}pages/farmer-dashboard.html" ${currentPage === 'farmer-dashboard.html' ? 'class="active"' : ''}>Dashboard</a></li>
            <li><a href="${base}pages/add-product.html" ${currentPage === 'add-product.html' ? 'class="active"' : ''}>Add Product</a></li>
            <li><a href="${base}products.html" ${currentPage === 'products.html' ? 'class="active"' : ''}>Browse</a></li>
            <li><a href="${base}pages/farmer-dashboard.html#cropdoc" onclick="if(window.showSection){showSection('cropdoc');return false;}" style="color:#2D6A4F;font-weight:700;" ${currentPage === 'farmer-dashboard.html' ? '' : ''}>🌿 CropDoc AI</a></li>
        `;
        actionLinks = `
            <span style="font-size:14px;color:var(--text-muted);display:flex;align-items:center;gap:6px;">
                <span style="width:28px;height:28px;border-radius:50%;background:var(--primary);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">${user.name[0].toUpperCase()}</span>
                ${user.name.split(' ')[0]}
            </span>
            <a href="#" class="btn btn-outline btn-sm" onclick="KBSession.logout();return false;">Sign Out</a>
        `;
    } else {
        // buyer
        navLinks = `
            <li><a href="${base}index.html" ${currentPage === 'index.html' ? 'class="active"' : ''}>Home</a></li>
            <li><a href="${base}products.html" ${currentPage === 'products.html' ? 'class="active"' : ''}>Products</a></li>
            <li><a href="${base}pages/buyer-dashboard.html" ${currentPage === 'buyer-dashboard.html' ? 'class="active"' : ''}>My Orders</a></li>
        `;
        actionLinks = `
            <a href="${base}pages/cart.html" class="btn btn-outline btn-sm" ${currentPage === 'cart.html' ? 'style="border-color:var(--primary);color:var(--primary);"' : ''}>🛒 Cart <span class="cart-count" style="background:var(--accent);color:#fff;border-radius:100px;padding:2px 7px;font-size:11px;margin-left:3px;">0</span></a>
            <span style="font-size:14px;color:var(--text-muted);display:flex;align-items:center;gap:6px;">
                <span style="width:28px;height:28px;border-radius:50%;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">${user.name[0].toUpperCase()}</span>
                ${user.name.split(' ')[0]}
            </span>
            <a href="#" class="btn btn-outline btn-sm" onclick="KBSession.logout();return false;">Sign Out</a>
        `;
    }

    // Inject into navbar
    let navList = navbar.querySelector('.navbar-nav');
    if (!navList) {
        navList = document.createElement('ul');
        navList.className = 'navbar-nav';
    }
    navList.innerHTML = navLinks;

    let actions = navbar.querySelector('.navbar-actions');
    if (!actions) {
        actions = document.createElement('div');
        actions.className = 'navbar-actions';
    }
    actions.innerHTML = actionLinks;

    // Ensure brand link is correct
    const brand = navbar.querySelector('.navbar-brand');
    if (brand) brand.href = base + 'index.html';

    // Rebuild navbar content in correct order (simple layout)
    navbar.innerHTML = '';
    const brandClone = document.createElement('a');
    brandClone.href = base + 'index.html';
    brandClone.className = 'navbar-brand';
    brandClone.innerHTML = '🌿 KisanBazaar';
    navbar.appendChild(brandClone);
    navbar.appendChild(navList);
    navbar.appendChild(actions);
}

/* ── Mobile Hamburger Menu ────────────────────────────────── */
function initMobileNav() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    if (!document.getElementById('hamburger')) {
        const ham = document.createElement('button');
        ham.id = 'hamburger';
        ham.innerHTML = '☰';
        ham.setAttribute('aria-label', 'Toggle menu');
        ham.style.cssText = 'display:none;background:none;border:none;font-size:24px;cursor:pointer;color:var(--primary);padding:4px 8px;order:99;';
        navbar.appendChild(ham);

        const drawer = document.createElement('div');
        drawer.id = 'mobile-drawer';
        drawer.style.cssText = `
          display:none; position:fixed; top:68px; left:0; right:0; bottom:0;
          background:rgba(255,255,255,0.98); backdrop-filter:blur(20px);
          z-index:99; padding:24px; overflow-y:auto;
          flex-direction:column; gap:8px;
          border-top:1px solid var(--border);
        `;

        const nav = document.querySelector('.navbar-nav');
        if (nav) {
            const clonedNav = nav.cloneNode(true);
            clonedNav.style.cssText = 'list-style:none; display:flex; flex-direction:column; gap:4px;';
            Array.from(clonedNav.querySelectorAll('a')).forEach(a => {
                a.style.cssText = 'display:block; padding:14px 16px; font-size:17px; font-weight:600; border-radius:var(--radius-sm); color:var(--text);';
            });
            drawer.appendChild(clonedNav);
        }

        const actions = document.querySelector('.navbar-actions');
        if (actions) {
            const clonedActions = actions.cloneNode(true);
            clonedActions.style.cssText = 'display:flex; flex-direction:column; gap:12px; margin-top:20px;';
            Array.from(clonedActions.querySelectorAll('.btn')).forEach(b => {
                b.style.justifyContent = 'center';
                b.style.padding = '14px 20px';
            });
            drawer.appendChild(clonedActions);
        }

        document.body.appendChild(drawer);

        ham.addEventListener('click', () => {
            const open = drawer.style.display === 'flex';
            drawer.style.display = open ? 'none' : 'flex';
            ham.innerHTML = open ? '☰' : '✕';
        });

        document.addEventListener('click', e => {
            if (!navbar.contains(e.target) && !drawer.contains(e.target)) {
                drawer.style.display = 'none';
                ham.innerHTML = '☰';
            }
        });
    }

    const mq = window.matchMedia('(max-width: 768px)');
    function onResize(e) {
        const ham = document.getElementById('hamburger');
        const nav = document.querySelector('.navbar-nav');
        const actions = document.querySelector('.navbar-actions');
        if (e.matches) {
            if (ham) ham.style.display = 'block';
            if (nav) nav.style.display = 'none';
            if (actions) actions.style.display = 'none';
        } else {
            if (ham) ham.style.display = 'none';
            const drawer = document.getElementById('mobile-drawer');
            if (drawer) { drawer.style.display = 'none'; ham.innerHTML = '☰'; }
            if (nav) nav.style.display = 'flex';
            if (actions) actions.style.display = 'flex';
        }
    }
    mq.addEventListener('change', onResize);
    onResize(mq);
}

/* ── Back to top button ──────────────────────────────────── */
function initBackToTop() {
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.innerHTML = '↑';
    btn.title = 'Back to top';
    btn.style.cssText = `
    position:fixed; bottom:80px; right:24px; width:44px; height:44px;
    border-radius:50%; background:var(--primary); color:#fff;
    border:none; font-size:20px; font-weight:700; cursor:pointer;
    box-shadow:0 4px 16px rgba(46,125,50,0.35);
    opacity:0; transform:translateY(16px);
    transition:opacity 0.3s, transform 0.3s; z-index:90;
  `;
    document.body.appendChild(btn);
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
        const show = window.scrollY > 400;
        btn.style.opacity = show ? '1' : '0';
        btn.style.transform = show ? 'translateY(0)' : 'translateY(16px)';
        btn.style.pointerEvents = show ? 'auto' : 'none';
    });
}

/* ── Smooth fade-in on scroll ────────────────────────────── */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .cat-card, .stat-card, .hero-stat').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

/* ── Premium Enhancements ──────────────────────────────────── */
function initLeafParticles() {
    const container = document.getElementById('leaf-container');
    if (!container) return;
    const leafEmojis = ['🍃', '🌿', '☘️', '🌱'];
    for (let i = 0; i < 15; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'leaf-particle';
        leaf.textContent = leafEmojis[Math.floor(Math.random() * leafEmojis.length)];
        const size = Math.random() * 20 + 15;
        leaf.style.left = `${Math.random() * 100}%`;
        leaf.style.fontSize = `${size}px`;
        leaf.style.animationDelay = `${Math.random() * 20}s`;
        leaf.style.animationDuration = `${Math.random() * 10 + 10}s`;
        container.appendChild(leaf);
    }
}

function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const countTo = parseFloat(target.getAttribute('data-target'));
                animateCount(target, countTo);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
}

function animateCount(el, target) {
    let current = 0;
    const duration = 2000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            el.textContent = target % 1 === 0 ? target.toLocaleString() : target.toFixed(1);
            clearInterval(timer);
        } else {
            el.textContent = target % 1 === 0 ? Math.floor(current).toLocaleString() : current.toFixed(1);
        }
    }, stepTime);
}

function initTestimonials() {
    const slides = document.querySelectorAll('.testimonial-slide');
    if (slides.length <= 1) return;
    let currentSlide = 0;
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);
}

function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroText = document.querySelector('.hero-text-content');
        const heroCircle = document.querySelector('.hero-composition');
        if (heroText) heroText.style.transform = `translateY(${scrolled * 0.3}px)`;
        if (heroCircle) heroCircle.style.transform = `translateY(${scrolled * 0.1}px)`;
    });
}

/* ── Cart count sync (for buyer navbar) ─────────────────── */
function syncCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('kb_cart')) || [];
        const total = cart.reduce((s, i) => s + (i.qty || 1), 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = total;
            el.style.display = total > 0 ? 'inline' : 'inline';
        });
    } catch { /* ignore */ }
}

/* ── Init on DOM ready ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
    buildUnifiedNavbar();
    initMobileNav();
    initBackToTop();
    setTimeout(initScrollReveal, 100);
    syncCartCount();
    initLeafParticles();
    initCounters();
    initTestimonials();
    initParallax();
});
