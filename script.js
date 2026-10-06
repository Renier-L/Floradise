/**
 * FloraBloom — E-Commerce Core & Vulnerability Simulation Engine
 * =========================================================================
 * CYBERSECURITY LABORATORY DISCLAIMER:
 * This software contains intentional web application vulnerabilities for
 * authorized cybersecurity training, ethical penetration testing, and defense
 * analysis. All data, orders, tokens, and customer profiles are 100% fictional.
 * =========================================================================
 */

// =========================================================================
// VULNERABILITY 7: SENSITIVE INFORMATION EXPOSURE
// CWE-200: Leftover Development Config and Testing Credentials
// =========================================================================
/*
 * DEV TEAM REMINDERS:
 * Test payment gateway bypass token: TEST_TOKEN_FLORABLOOM_SIM_88921
 * Cloud warehouse bucket: https://s3.florabloom-internal-staging.fake/assets/
 * Test admin account: admin@florabloom.local / FlowerAdmin123
 * Debug order reference: TEST_ORDER_1001
 */

// 1. Initialize Local Storage State
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
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>🌸</span> <span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
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
            <div style="display:flex; align-items:center; gap:0.6rem;">
                <span style="font-size:0.88rem; color:var(--text-secondary);">
                    Hi, <strong>${session.name || session.email.split('@')[0]}</strong>
                    ${session.role === 'admin' ? '<span class="badge badge-warning" style="font-size:0.7rem;">Admin</span>' : ''}
                </span>
                <button onclick="handleLogout()" class="btn btn-sm btn-outline" style="padding:0.3rem 0.8rem; font-size:0.8rem;">Logout</button>
            </div>
        `;
    } else {
        userContainer.innerHTML = `
            <a href="login.html" class="btn btn-sm btn-primary">Login / Sign In</a>
        `;
    }
}

// =========================================================================
// VULNERABILITY 3 & 6: CLIENT-SIDE AUTHENTICATION & INSECURE LOCAL STORAGE
// =========================================================================
function handleLogin(email, password) {
    const users = getUsers();
    
    // Client-side authentication flaw: Hardcoded credentials or client verification
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (foundUser) {
        // VULNERABILITY 6: Sensitive session token stored unencrypted in localStorage
        const fakeSession = {
            userId: foundUser.email === "admin@florabloom.local" ? "usr_admin_01" : "usr_cust_02",
            email: foundUser.email,
            name: foundUser.name,
            role: foundUser.role, // 'admin' or 'customer'
            // Insecure client-generated fake JWT token
            sessionToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa(JSON.stringify({ email: foundUser.email, role: foundUser.role, exp: Date.now() + 86400000 })) + ".DEMO_UNVERIFIED_SIGNATURE",
            loginTimestamp: new Date().toISOString()
        };

        localStorage.setItem('florabloom_session', JSON.stringify(fakeSession));
        showToast(`Welcome back, ${foundUser.name}!`);

        setTimeout(() => {
            if (foundUser.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'products.html';
            }
        }, 1000);
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
        window.location.reload();
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
        password, // Insecurely stored plaintext password in client-side localStorage
        role: "customer"
    };

    users.push(newUser);
    localStorage.setItem('florabloom_users', JSON.stringify(users));

    // Automatically log user in
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

    // Setup global search forms
    const searchForms = document.querySelectorAll('.search-bar-form');
    searchForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input[type="text"]');
            if (input && input.value.trim()) {
                window.location.href = `products.html?search=${encodeURIComponent(input.value.trim())}`;
            }
        });
    });
});
