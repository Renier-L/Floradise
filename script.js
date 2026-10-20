/**
 * Floradise — Core Application & Cybersecurity Simulation Engine
 * =========================================================================
 * CYBERSECURITY LABORATORY DISCLAIMER:
 * This software contains intentional web application vulnerabilities for
 * authorized cybersecurity training, ethical penetration testing, and defense
 * analysis. All data, orders, tokens, and customer profiles are 100% fictional.
 * =========================================================================
 */

// 1. Initialize Local Storage State with Floradise seed data
(function initializeDatabase() {
    if (!localStorage.getItem('florabloom_products')) {
        localStorage.setItem('florabloom_products', JSON.stringify(FLORABLOOM_PRODUCTS));
    }
    if (!localStorage.getItem('florabloom_reviews')) {
        localStorage.setItem('florabloom_reviews', JSON.stringify(INITIAL_REVIEWS));
    }
    if (!localStorage.getItem('florabloom_orders')) {
        localStorage.setItem('florabloom_orders', JSON.stringify(INITIAL_ORDERS));
    }
    
    // Merge INITIAL_USERS so jairus41@gmail.com and admin are always guaranteed to exist
    let currentUsers = [];
    try {
        currentUsers = JSON.parse(localStorage.getItem('florabloom_users') || '[]');
    } catch(e) { currentUsers = []; }

    INITIAL_USERS.forEach(seed => {
        if (!currentUsers.some(u => u.email.toLowerCase() === seed.email.toLowerCase())) {
            currentUsers.push(seed);
        }
    });
    localStorage.setItem('florabloom_users', JSON.stringify(currentUsers));

    if (!localStorage.getItem('florabloom_cart')) {
        localStorage.setItem('florabloom_cart', JSON.stringify([]));
    }
})();

// Data Access Helpers
function getProducts() {
    return JSON.parse(localStorage.getItem('florabloom_products') || '[]');
}

function getProductById(id) {
    const products = getProducts();
    return products.find(p => p.id === parseInt(id));
}

function getReviews() {
    return JSON.parse(localStorage.getItem('florabloom_reviews') || '[]');
}

function getOrders() {
    return JSON.parse(localStorage.getItem('florabloom_orders') || '[]');
}

function getUsers() {
    return JSON.parse(localStorage.getItem('florabloom_users') || '[]');
}

function getCart() {
    return JSON.parse(localStorage.getItem('florabloom_cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('florabloom_cart', JSON.stringify(cart));
    updateCartCount();
}

// Toast Alert
function showToast(message) {
    let toast = document.getElementById('flora-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'flora-toast';
        toast.className = 'toast-notice';
        toast.style.cssText = "position:fixed; bottom:24px; right:24px; background:#065f46; color:#ffffff; padding:0.9rem 1.4rem; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.18); display:flex; align-items:center; gap:0.6rem; z-index:99999; font-weight:600; font-size:0.92rem; transition:all 0.3s ease; transform:translateY(100px); opacity:0;";
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>🍃</span> <span>${message}</span>`;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
    }, 3000);
}

// Cart Badge
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(b => {
        b.textContent = count;
    });
}

// Add to Cart
function addToCart(productId, quantity = 1, color = null) {
    const product = getProductById(productId);
    if (!product) return;

    const cart = getCart();
    const selectedColor = color || (product.colors ? product.colors[0] : 'Standard');
    
    const existingIndex = cart.findIndex(item => item.id === product.id && item.color === selectedColor);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += parseInt(quantity);
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            color: selectedColor,
            quantity: parseInt(quantity)
        });
    }

    saveCart(cart);
    showToast(`Added ${quantity}x "${product.name}" to cart!`);
}

// User Navigation & Session State
function updateAuthUI() {
    const userContainer = document.getElementById('user-nav-slot');
    if (!userContainer) return;

    // VULNERABILITY 6: INSECURE LOCAL STORAGE SESSION
    const session = JSON.parse(localStorage.getItem('florabloom_session') || 'null');

    if (session && session.email) {
        userContainer.innerHTML = `
            <div style="display:inline-flex; align-items:center; gap:0.6rem;">
                <span style="font-size:0.9rem; color:#ffffff; font-weight:700; display:inline-flex; align-items:center; gap:0.3rem;">
                    👤 ${session.name || session.email.split('@')[0]}
                    ${session.role === 'admin' ? '<a href="admin.html" style="background:#ffffff; color:#16a34a; padding:2px 8px; border-radius:12px; font-size:0.75rem; margin-left:4px; font-weight:800;">Admin</a>' : ''}
                </span>
                <button onclick="handleLogout()" style="background:rgba(255,255,255,0.25); color:#ffffff; border-radius:9999px; padding:0.35rem 0.9rem; font-size:0.8rem; font-weight:700; cursor:pointer; border:none; transition:all 0.2s;">Logout</button>
            </div>
        `;
    } else {
        userContainer.innerHTML = `
            <a href="login.html" class="login-btn-nav login-nav-pill">
                <span>➜]</span> Login
            </a>
        `;
    }
}

// =========================================================================
// VULNERABILITY 3 & 6: CLIENT-SIDE AUTHENTICATION & INSECURE LOCAL STORAGE
// (Integrated with Supabase Cloud Database + Local Fallback)
// =========================================================================
async function handleLogin(email, password) {
    const rawEmail = (email || '').trim();
    const rawPassword = (password || '').trim();
    const cleanEmail = rawEmail.toLowerCase();
    const users = getUsers();

    // 1. Client-side authentication: permits default admin credentials for pentest verification
    if ((cleanEmail === 'admin@floradise.local' || cleanEmail === 'admin') && 
        (rawPassword === 'FlowerAdmin123' || rawPassword === 'admin' || rawPassword === 'password' || rawPassword === '123456' || rawPassword === '')) {
        const adminSession = {
            userId: "usr_admin_01",
            email: "admin@floradise.local",
            name: "Admin",
            role: "admin",
            sessionToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa(JSON.stringify({ email: "admin@floradise.local", role: "admin", exp: Date.now() + 86400000 })) + ".DEMO_UNVERIFIED_SIGNATURE",
            loginTimestamp: new Date().toISOString()
        };
        localStorage.setItem('florabloom_session', JSON.stringify(adminSession));
        showToast("Welcome back, Administrator!");
        setTimeout(() => { window.location.href = 'admin.html'; }, 500);
        return true;
    }

    // 2. Check Supabase Cloud Database first if connected
    if (typeof supabaseLoginUser === 'function') {
        try {
            const sbUser = await supabaseLoginUser(cleanEmail, rawPassword);
            if (sbUser) {
                const session = {
                    userId: sbUser.id ? "usr_" + sbUser.id : "usr_sb_" + Date.now(),
                    email: sbUser.email,
                    name: sbUser.name || sbUser.email.split('@')[0],
                    role: sbUser.role || 'customer',
                    sessionToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa(JSON.stringify({ email: sbUser.email, role: sbUser.role || 'customer', exp: Date.now() + 86400000 })) + ".SUPABASE_SESSION",
                    loginTimestamp: new Date().toISOString()
                };
                localStorage.setItem('florabloom_session', JSON.stringify(session));
                showToast(`Welcome back, ${session.name}!`);
                setTimeout(() => {
                    window.location.href = (session.role === 'admin') ? 'admin.html' : 'index.html';
                }, 500);
                return true;
            }
        } catch (err) {
            console.warn("[Floradise] Supabase login error:", err);
        }
    }

    // 3. Look up existing registered user in local database
    const existingUser = users.find(u => 
        u.email.toLowerCase() === cleanEmail || (u.name && u.name.toLowerCase() === cleanEmail)
    );

    let foundUser = null;

    if (existingUser) {
        // If account exists, verify exact password (enables Brute Force testing & defense!)
        if (existingUser.password === rawPassword || existingUser.password === password) {
            foundUser = existingUser;
        } else {
            // Password incorrect: Trigger failed attempt!
            return false;
        }
    } else if (cleanEmail.length > 0) {
        // User not found: check special account or reject
        if (cleanEmail === 'jairus41@gmail.com' && (rawPassword === 'UserPass123' || rawPassword === 'password')) {
            foundUser = {
                name: "Jairus Torreda",
                email: cleanEmail,
                password: rawPassword,
                role: "customer",
                joined: "Oct 06, 2026"
            };
            users.push(foundUser);
            localStorage.setItem('florabloom_users', JSON.stringify(users));
        } else {
            // Unknown user and wrong password
            return false;
        }
    }

    if (foundUser) {
        const userSession = {
            userId: foundUser.role === 'admin' ? "usr_admin_01" : "usr_" + Date.now(),
            email: foundUser.email,
            name: foundUser.name,
            role: foundUser.role || 'customer',
            sessionToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa(JSON.stringify({ email: foundUser.email, role: foundUser.role || 'customer', exp: Date.now() + 86400000 })) + ".DEMO_UNVERIFIED_SIGNATURE",
            loginTimestamp: new Date().toISOString()
        };

        localStorage.setItem('florabloom_session', JSON.stringify(userSession));
        showToast(`Welcome, ${foundUser.name}!`);

        setTimeout(() => {
            if (foundUser.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 500);
        return true;
    }

    return false;
}

function handleLogout() {
    localStorage.removeItem('florabloom_session');
    showToast('Logged out successfully.');
    updateAuthUI();
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

async function handleRegistration(name, email, password) {
    const rawName = (name || '').trim();
    const rawEmail = (email || '').trim();
    const rawPassword = (password || '').trim();
    const cleanEmail = rawEmail.toLowerCase();
    const users = getUsers();

    // 1. Sync new account to Supabase Cloud Database if connected
    if (typeof supabaseRegisterUser === 'function') {
        try {
            await supabaseRegisterUser(rawName, cleanEmail, rawPassword, cleanEmail.includes('admin') ? 'admin' : 'customer');
        } catch (e) {
            console.warn("[Floradise] Supabase registration notice:", e);
        }
    }

    // 2. If account already exists locally, update credentials and immediately log in
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
    if (existingIndex > -1) {
        users[existingIndex].password = rawPassword;
        if (rawName) users[existingIndex].name = rawName;
        localStorage.setItem('florabloom_users', JSON.stringify(users));
        await handleLogin(cleanEmail, rawPassword);
        return { success: true };
    }

    const newUser = {
        name: rawName || rawEmail.split('@')[0] || "Customer",
        email: cleanEmail,
        password: rawPassword,
        role: (cleanEmail.includes('admin')) ? "admin" : "customer",
        joined: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    users.push(newUser);
    localStorage.setItem('florabloom_users', JSON.stringify(users));

    await handleLogin(cleanEmail, rawPassword);
    return { success: true };
}

// Global HTML entity sanitization helper for IAS XSS Defense (CWE-79)
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Global defense status checker (queries Python defense server or localStorage)
async function isDefenseEnabled() {
    try {
        const res = await fetch('/api/defense/status');
        if (res.ok) {
            const data = await res.json();
            return data.defense_active === true;
        }
    } catch (e) {
        // Fallback for offline or static hosting
    }
    const stored = localStorage.getItem('floradise_defense_active');
    return stored === null ? true : stored === 'true';
}

// Global script tag execution helper for XSS demonstrations in modern browsers
function executeScriptTags(container) {
    if (!container) return;
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

// Document Ready Setup
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateAuthUI();
});
