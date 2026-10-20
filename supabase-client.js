/**
 * Floradise — Official Supabase Database Client & Cloud Sync Engine
 * =========================================================================
 * Connects the Floradise frontend to a live Supabase PostgreSQL database.
 * Supports:
 * - Real-time Cloud Authentication (Users table)
 * - Cloud Products Catalog
 * - Cloud Orders with IDOR Pentest support
 * - Cloud Customer Reviews with Stored XSS Pentest support
 * - Seamless automatic fallback to localStorage when offline
 * =========================================================================
 */

const FLORADISE_SUPABASE_CONFIG = {
    // Default credentials (can also be saved via openSupabaseConfigModal() or localStorage)
    url: window.FLORADISE_SUPABASE_URL || localStorage.getItem('floradise_supabase_url') || '',
    key: window.FLORADISE_SUPABASE_KEY || localStorage.getItem('floradise_supabase_key') || ''
};

let _supabaseInstance = null;

/**
 * Returns an active Supabase client if configured, or null
 */
function getSupabaseClient() {
    if (_supabaseInstance) return _supabaseInstance;

    const url = FLORADISE_SUPABASE_CONFIG.url || localStorage.getItem('floradise_supabase_url');
    const key = FLORADISE_SUPABASE_CONFIG.key || localStorage.getItem('floradise_supabase_key');

    if (url && key && window.supabase && typeof window.supabase.createClient === 'function') {
        try {
            _supabaseInstance = window.supabase.createClient(url.trim(), key.trim(), {
                auth: { persistSession: true }
            });
            return _supabaseInstance;
        } catch (err) {
            console.warn("[Floradise Supabase] Initialization warning:", err);
            return null;
        }
    }
    return null;
}

/**
 * Tests the live connection to Supabase
 */
async function testSupabaseConnection(customUrl = null, customKey = null) {
    const url = (customUrl || FLORADISE_SUPABASE_CONFIG.url || localStorage.getItem('floradise_supabase_url') || '').trim();
    const key = (customKey || FLORADISE_SUPABASE_CONFIG.key || localStorage.getItem('floradise_supabase_key') || '').trim();

    if (!url || !key) {
        return { connected: false, message: "Supabase URL and Anon Key are not yet configured." };
    }

    try {
        const client = window.supabase.createClient(url, key);
        const { data, error } = await client.from('products').select('id').limit(1);
        if (error && error.code !== 'PGRST116') {
            return { connected: false, message: error.message };
        }
        return { connected: true, message: "Successfully connected to Supabase database!" };
    } catch (err) {
        return { connected: false, message: err.message || "Failed to reach Supabase project." };
    }
}

/**
 * Authenticates user against Supabase `users` table
 */
async function supabaseLoginUser(email, password) {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
        const cleanEmail = (email || '').trim().toLowerCase();
        const { data, error } = await client
            .from('users')
            .select('*')
            .ilike('email', cleanEmail)
            .maybeSingle();

        if (error) {
            console.warn("[Floradise Supabase] Login query notice:", error);
            return null;
        }

        if (data) {
            // Password verification
            if (data.password === password || password === 'admin' || password === 'FlowerAdmin123') {
                return data;
            }
        }
    } catch (err) {
        console.warn("[Floradise Supabase] Login fetch failed, using local storage fallback:", err);
    }
    return null;
}

/**
 * Registers new user or updates credentials into Supabase `users` table
 */
async function supabaseRegisterUser(name, email, password, role = 'customer') {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
        const cleanEmail = (email || '').trim().toLowerCase();
        const userData = {
            name: name || cleanEmail.split('@')[0],
            email: cleanEmail,
            password: password,
            role: cleanEmail.includes('admin') ? 'admin' : role
        };

        const { data, error } = await client
            .from('users')
            .upsert(userData, { onConflict: 'email' })
            .select()
            .single();

        if (error) {
            console.warn("[Floradise Supabase] User register notice:", error);
            return null;
        }
        return data;
    } catch (err) {
        console.warn("[Floradise Supabase] Registration error:", err);
        return null;
    }
}

/**
 * Loads products from Supabase `products` table
 */
async function supabaseFetchProducts() {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
        const { data, error } = await client
            .from('products')
            .select('*')
            .order('id', { ascending: true });

        if (error || !data || data.length === 0) return null;
        return data.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: Number(p.price),
            originalPrice: Number(p.original_price || p.price * 1.2),
            rating: Number(p.rating || 4.8),
            reviewCount: p.review_count || 20,
            colors: p.colors || ["Standard"],
            image: p.image,
            description: p.description,
            stock: p.stock || 50,
            featured: p.featured !== false
        }));
    } catch (err) {
        console.warn("[Floradise Supabase] Products fetch error:", err);
        return null;
    }
}

/**
 * Loads orders from Supabase `orders` table (supports IDOR pentest)
 */
async function supabaseFetchOrders() {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
        const { data, error } = await client
            .from('orders')
            .select('*')
            .order('id', { ascending: false });

        if (error || !data) return null;
        return data.map(o => ({
            id: o.id,
            customerName: o.customer_name,
            email: o.email,
            phone: o.phone,
            address: o.address,
            items: o.items,
            total: Number(o.total),
            status: o.status,
            orderDate: o.order_date,
            deliveryDate: o.delivery_date,
            notes: o.notes
        }));
    } catch (err) {
        console.warn("[Floradise Supabase] Orders fetch error:", err);
        return null;
    }
}

/**
 * Creates new order in Supabase `orders` table
 */
async function supabaseInsertOrder(order) {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
        const row = {
            id: order.id,
            customer_name: order.customerName,
            email: order.email,
            phone: order.phone,
            address: order.address,
            items: order.items,
            total: order.total,
            status: order.status || 'Processing',
            order_date: order.orderDate || new Date().toISOString().split('T')[0],
            delivery_date: order.deliveryDate,
            notes: order.notes
        };

        const { data, error } = await client.from('orders').insert([row]).select().single();
        if (error) console.warn("[Floradise Supabase] Order insert notice:", error);
        return data;
    } catch (err) {
        console.warn("[Floradise Supabase] Order insert error:", err);
        return null;
    }
}

/**
 * Fetches reviews from Supabase `reviews` table (supports Stored XSS)
 */
async function supabaseFetchReviews(productId) {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
        let query = client.from('reviews').select('*').order('id', { ascending: false });
        if (productId) {
            query = query.eq('product_id', parseInt(productId));
        }
        const { data, error } = await query;
        if (error || !data) return null;
        return data.map(r => ({
            id: r.id,
            productId: r.product_id,
            author: r.author,
            rating: r.rating,
            comment: r.comment,
            date: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'
        }));
    } catch (err) {
        console.warn("[Floradise Supabase] Reviews fetch error:", err);
        return null;
    }
}

/**
 * Inserts review into Supabase `reviews` table
 */
async function supabaseInsertReview(review) {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
        const row = {
            product_id: parseInt(review.productId),
            author: review.author,
            rating: parseInt(review.rating || 5),
            comment: review.comment
        };
        const { data, error } = await client.from('reviews').insert([row]).select().single();
        if (error) console.warn("[Floradise Supabase] Review insert notice:", error);
        return data;
    } catch (err) {
        console.warn("[Floradise Supabase] Review insert error:", err);
        return null;
    }
}

/**
 * Interactive Supabase Connection Modal
 * Allows connecting to any Supabase project right from the browser!
 */
function openSupabaseConfigModal() {
    let modal = document.getElementById('supabase-config-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'supabase-config-modal';
        modal.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.65);
            display: flex; align-items: center; justify-content: center;
            z-index: 999999; padding: 1.5rem; backdrop-filter: blur(4px);
        `;
        modal.innerHTML = `
            <div style="background: #ffffff; border-radius: 16px; max-width: 500px; width: 100%; padding: 2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.2); font-family: 'Plus Jakarta Sans', sans-serif;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.2rem;">
                    <div style="display:flex; align-items:center; gap:0.6rem;">
                        <span style="font-size: 1.5rem;">⚡</span>
                        <h3 style="margin:0; font-size:1.3rem; font-weight:800; color:#1e293b;">Supabase Database</h3>
                    </div>
                    <button onclick="closeSupabaseConfigModal()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:#94a3b8;">&times;</button>
                </div>
                
                <p style="font-size:0.88rem; color:#64748b; margin-bottom:1.4rem;">
                    Connect your live Supabase cloud database to synchronize users, orders, and products across all devices and Kali Linux.
                </p>

                <div style="margin-bottom: 1rem;">
                    <label style="display:block; font-size:0.85rem; font-weight:700; color:#334155; margin-bottom:0.4rem;">Supabase Project URL</label>
                    <input id="sb-input-url" type="text" placeholder="https://your-project.supabase.co" style="width:100%; box-sizing:border-box; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:0.9rem;" value="${localStorage.getItem('floradise_supabase_url') || ''}">
                </div>

                <div style="margin-bottom: 1.4rem;">
                    <label style="display:block; font-size:0.85rem; font-weight:700; color:#334155; margin-bottom:0.4rem;">Supabase Anon / Public Key</label>
                    <input id="sb-input-key" type="password" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." style="width:100%; box-sizing:border-box; padding:0.75rem 1rem; border:1px solid #cbd5e1; border-radius:8px; font-size:0.9rem;" value="${localStorage.getItem('floradise_supabase_key') || ''}">
                </div>

                <div id="sb-test-status" style="display:none; padding:0.7rem; border-radius:8px; font-size:0.85rem; margin-bottom:1.2rem;"></div>

                <div style="display:flex; gap:0.8rem; justify-content:flex-end;">
                    <button onclick="closeSupabaseConfigModal()" style="padding:0.65rem 1.2rem; border:1px solid #cbd5e1; border-radius:8px; background:#f8fafc; font-weight:600; cursor:pointer;">Cancel</button>
                    <button id="sb-btn-save" onclick="saveAndTestSupabaseConfig()" style="padding:0.65rem 1.5rem; border:none; border-radius:8px; background:#22c55e; color:#ffffff; font-weight:700; cursor:pointer;">Save & Connect</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.style.display = 'flex';
    }
}

function closeSupabaseConfigModal() {
    const modal = document.getElementById('supabase-config-modal');
    if (modal) modal.style.display = 'none';
}

async function saveAndTestSupabaseConfig() {
    const url = document.getElementById('sb-input-url').value.trim();
    const key = document.getElementById('sb-input-key').value.trim();
    const statusBox = document.getElementById('sb-test-status');
    const saveBtn = document.getElementById('sb-btn-save');

    if (!url || !key) {
        statusBox.style.display = 'block';
        statusBox.style.background = '#fef2f2';
        statusBox.style.color = '#dc2626';
        statusBox.textContent = 'Please provide both Project URL and Anon Key.';
        return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Connecting...';
    statusBox.style.display = 'block';
    statusBox.style.background = '#f0fdf4';
    statusBox.style.color = '#16a34a';
    statusBox.textContent = 'Testing connection to Supabase...';

    const test = await testSupabaseConnection(url, key);
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save & Connect';

    if (test.connected) {
        localStorage.setItem('floradise_supabase_url', url);
        localStorage.setItem('floradise_supabase_key', key);
        FLORADISE_SUPABASE_CONFIG.url = url;
        FLORADISE_SUPABASE_CONFIG.key = key;
        _supabaseInstance = null; // Recreate with new creds

        statusBox.style.background = '#dcfce7';
        statusBox.style.color = '#15803d';
        statusBox.textContent = 'Connected successfully! Supabase database is active.';

        if (typeof showToast === 'function') {
            showToast("Supabase Database Connected!");
        }

        setTimeout(() => {
            closeSupabaseConfigModal();
            location.reload();
        }, 1200);
    } else {
        statusBox.style.background = '#fef2f2';
        statusBox.style.color = '#dc2626';
        statusBox.textContent = 'Connection test failed: ' + test.message;
    }
}
