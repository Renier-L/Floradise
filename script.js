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
    if (!localStorage.getItem('florabloom_users')) {
        localStorage.setItem('florabloom_users', JSON.stringify(INITIAL_USERS));
    }
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
            <div style="display:flex; align-items:center; gap:0.5rem;">
                <span style="font-size:0.85rem; color:#ffffff; font-weight:700;">
                    ${session.name || session.email.split('@')[0]}
                    ${session.role === 'admin' ? '<a href="admin.html" style="background:#064e3b; color:#34d399; padding:2px 8px; border-radius:12px; font-size:0.75rem; margin-left:4px;">Admin</a>' : ''}
                </span>
                <button onclick="handleLogout()" style="background:rgba(255,255,255,0.25); color:#fff; border-radius:20px; padding:0.3rem 0.8rem; font-size:0.78rem; font-weight:700;">Logout</button>
            </div>
        `;
    } else {
        userContainer.innerHTML = `
            <a href="login.html" class="login-btn-nav">
                <span>➜]</span> Login
            </a>
        `;
    }
}

// =========================================================================
// VULNERABILITY 3 & 6: CLIENT-SIDE AUTHENTICATION & INSECURE LOCAL STORAGE
// =========================================================================
function handleLogin(email, password) {
    const users = getUsers();
    
    // Support typing 'admin' directly as email
    let cleanEmail = email.toLowerCase();
    if (cleanEmail === 'admin') cleanEmail = 'admin@floradise.local';

    const foundUser = users.find(u => 
        (u.email.toLowerCase() === cleanEmail || u.name.toLowerCase() === cleanEmail) && 
        u.password === password
    );
    
    if (foundUser) {
        const fakeSession = {
            userId: foundUser.role === 'admin' ? "usr_admin_01" : "usr_cust_02",
            email: foundUser.email,
            name: foundUser.name,
            role: foundUser.role, // 'admin' or 'customer'
            sessionToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa(JSON.stringify({ email: foundUser.email, role: foundUser.role, exp: Date.now() + 86400000 })) + ".DEMO_UNVERIFIED_SIGNATURE",
            loginTimestamp: new Date().toISOString()
        };

        localStorage.setItem('florabloom_session', JSON.stringify(fakeSession));
        showToast(`Welcome back, ${foundUser.name}!`);

        setTimeout(() => {
            if (foundUser.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 800);
        return true;
    } else {
        return false;
    }
}

function handleLogout() {
    localStorage.removeItem('florabloom_session');
    showToast('Logged out successfully.');
    updateAuthUI();
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 600);
}

function handleRegistration(name, email, password) {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: "An account with this email already exists." };
    }

    const newUser = {
        name,
        email,
        password,
        role: "customer",
        joined: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    users.push(newUser);
    localStorage.setItem('florabloom_users', JSON.stringify(users));

    handleLogin(email, password);
    return { success: true };
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
