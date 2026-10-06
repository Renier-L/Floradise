/**
 * Floradise — Product Catalog & Seed Database
 * =========================================================================
 * CYBERSECURITY LAB NOTE:
 * This file contains intentional vulnerabilities for educational testing.
 * All customer data, keys, credentials, and transactions are 100% fictional.
 * =========================================================================
 */

// =========================================================================
// VULNERABILITY 7: SENSITIVE INFORMATION EXPOSURE
// CWE-200: Leftover Development Config and Testing Credentials
// =========================================================================
const FAKE_DEV_CONFIG = {
    APP_NAME: "Floradise Botanical Store",
    ENVIRONMENT: "staging-lab",
    DEBUG_MODE: true,
    DELIVERY_API_KEY: "TEST_API_KEY_DO_NOT_USE_FLORADISE_DEV_99214",
    INTERNAL_SMS_GATEWAY: "https://sandbox-notify.floradise.local/api/v1/sms",
    DEFAULT_ADMIN_EMAIL: "admin@floradise.local",
    DEBUG_ORDER_BACKUP_ID: "TEST_ORDER_1001",
    INTERNAL_DEV_NOTES: "TODO: Migrate client-side role validation to backend before production deployment!"
};

console.info(
    "%c[Floradise Security Lab]%c Developer config loaded: ",
    "background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;",
    "color: #065f46; font-weight: bold;",
    FAKE_DEV_CONFIG
);

// Currency formatting helper
function formatCurrency(amount) {
    return '₱' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Floradise Products Catalog
const FLORABLOOM_PRODUCTS = [
    {
        id: 1,
        name: "Rose Bouquet",
        category: "Roses",
        price: 1250.00,
        originalPrice: 1500.00,
        rating: 4.9,
        reviewCount: 38,
        colors: ["Crimson Red", "Blush Pink", "Snow White"],
        image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
        description: "A signature luxury bouquet of freshly cut long-stem velvety crimson roses bundled with Italian ruscus and eucalyptus greens. The classic emblem of romance.",
        featured: true,
        stock: 50
    },
    {
        id: 2,
        name: "Sunflower Delight",
        category: "Sunflowers",
        price: 850.00,
        originalPrice: 1100.00,
        rating: 4.8,
        reviewCount: 29,
        colors: ["Golden Yellow", "Amber Sun"],
        image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80",
        description: "Sun-drenched farm-grown sunflowers radiating vibrant energy and cheerfulness. Accented with wild solidago and dried wheat sprigs.",
        featured: true,
        stock: 50
    },
    {
        id: 3,
        name: "Daisy Charm",
        category: "Daisies",
        price: 650.00,
        originalPrice: 800.00,
        rating: 4.7,
        reviewCount: 22,
        colors: ["Pastel Pink & Yellow", "Crisp White"],
        image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=80",
        description: "A playful, breezy gathering of cheerful chamomile blooms and pastel daisy charms. Radiates meadow freshness and innocence.",
        featured: true,
        stock: 50
    },
    {
        id: 4,
        name: "Aloe Vera",
        category: "Plants",
        price: 450.00,
        originalPrice: 600.00,
        rating: 4.6,
        reviewCount: 17,
        colors: ["Botanical Green"],
        image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=800&q=80",
        description: "Potted soothing organic Aloe Vera succulent in a minimal terracotta nursery vessel. Air-purifying, easy-care indoor houseplant.",
        featured: true,
        stock: 50
    },
    {
        id: 5,
        name: "Hydrangea Bouquet",
        category: "Mixed Bouquets",
        price: 2100.00,
        originalPrice: 2450.00,
        rating: 5.0,
        reviewCount: 44,
        colors: ["Sky Blue & Lavender", "Pure Alabaster"],
        image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
        description: "Magnificent cloud-like hydrangea bloom stems paired with garden roses and baby's breath. Curated with satin ribbon for weddings and premier events.",
        featured: true,
        stock: 50
    },
    {
        id: 6,
        name: "Blushing Pastel Tulips",
        category: "Tulips",
        price: 950.00,
        originalPrice: 1200.00,
        rating: 4.8,
        reviewCount: 19,
        colors: ["Pastel Pink", "Soft Lilac", "Snow White"],
        image: "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80",
        description: "Freshly imported Dutch garden tulips in dreamy pastel tones. Crisp, graceful, and symbolizing heartfelt warmth.",
        featured: true,
        stock: 50
    },
    {
        id: 7,
        name: "Casablanca White Lilies",
        category: "Lilies",
        price: 1400.00,
        originalPrice: 1750.00,
        rating: 4.9,
        reviewCount: 26,
        colors: ["Pure White", "Cream Blush"],
        image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80",
        description: "Majestic Casablanca oriental lilies renowned for their intoxicating sweet fragrance and star-shaped white petals.",
        featured: false,
        stock: 50
    },
    {
        id: 8,
        name: "Moon Phalaenopsis Orchid",
        category: "Orchids",
        price: 1850.00,
        originalPrice: 2200.00,
        rating: 5.0,
        reviewCount: 35,
        colors: ["Moon White", "Amethyst Magenta"],
        image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80",
        description: "Double-stem potted Phalaenopsis butterfly orchid in a glazed ceramic planter for long-lasting botanical luxury.",
        featured: false,
        stock: 50
    }
];

// Seed Customer Reviews (Stored XSS sink in product.html)
const INITIAL_REVIEWS = [
    {
        id: 1,
        productId: 1,
        author: "Simplicio Juanir",
        rating: 5,
        date: "2026-10-03",
        comment: "The Rose Bouquet arrived fresh and wonderfully packed! Lasted well over a week on our dining table."
    },
    {
        id: 2,
        productId: 2,
        author: "Rei Lopez",
        rating: 5,
        date: "2026-10-03",
        comment: "The Sunflower heads were huge and bright yellow. Made our celebration so lively!"
    },
    {
        id: 3,
        productId: 3,
        author: "Jairus Torreda",
        rating: 4,
        date: "2026-09-28",
        comment: "Very cute Daisy Charm. Beautiful pastels, delivered quickly to our Makati office."
    }
];

// Seed Customer Orders (Used for IDOR simulation in order.html?id=1001)
const INITIAL_ORDERS = [
    {
        id: "1001",
        customerName: "Simplicio Juanir",
        email: "simp@gmail.com",
        phone: "+63 912 345 6789",
        address: "Unit 12B, Horizon Tower, Bonifacio Global City, Taguig, Metro Manila",
        items: [
            { id: 1, name: "Rose Bouquet", quantity: 1, price: 1250.00, color: "Crimson Red" }
        ],
        subtotal: 1250.00,
        shipping: 100.00,
        tax: 0.00,
        total: 1350.00,
        status: "Delivered",
        orderDate: "2026-10-03",
        deliveryDate: "2026-10-04",
        notes: "Leave with building reception if unattended."
    },
    {
        id: "1002",
        customerName: "Rei Lopez",
        email: "user@gmail.com",
        phone: "+63 917 882 1094",
        address: "742 Kalayaan Avenue, Bel-Air, Makati City, Metro Manila",
        items: [
            { id: 2, name: "Sunflower Delight", quantity: 1, price: 850.00, color: "Golden Yellow" }
        ],
        subtotal: 850.00,
        shipping: 100.00,
        tax: 0.00,
        total: 950.00,
        status: "In Transit",
        orderDate: "2026-10-03",
        deliveryDate: "2026-10-05",
        notes: "Ring bell upon arrival."
    },
    {
        id: "1003",
        customerName: "Dr. Evelyn Vance",
        email: "evelyn.vance@clinic.example.fake",
        phone: "+63 920 114 7443",
        address: "St. Luke's Medical Center, Suite 802, BGC, Taguig",
        items: [
            { id: 5, name: "Hydrangea Bouquet", quantity: 1, price: 2100.00, color: "Sky Blue & Lavender" }
        ],
        subtotal: 2100.00,
        shipping: 0.00,
        tax: 0.00,
        total: 2100.00,
        status: "Processing",
        orderDate: "2026-10-04",
        deliveryDate: "2026-10-07",
        notes: "Gift message: Happy promotion Evelyn! Love, the clinic team."
    },
    {
        id: "1004",
        customerName: "Jairus Torreda",
        email: "usrayleton@gmail.com",
        phone: "+63 908 551 2994",
        address: "502 Magnolia Residences, Tower 3, Quezon City",
        items: [
            { id: 3, name: "Daisy Charm", quantity: 1, price: 650.00, color: "Pastel Pink & Yellow" }
        ],
        subtotal: 650.00,
        shipping: 100.00,
        tax: 0.00,
        total: 750.00,
        status: "Delivered",
        orderDate: "2026-09-28",
        deliveryDate: "2026-09-30",
        notes: "Deliver to lobby concierge."
    }
];

// Seed Users matching the exact customers shown in Admin screenshot
const INITIAL_USERS = [
    {
        name: "Admin",
        email: "admin@floradise.local",
        password: "FlowerAdmin123",
        role: "admin",
        joined: "Sep 20, 2026"
    },
    {
        name: "Simplicio Juanir",
        email: "simp@gmail.com",
        password: "UserPass123",
        role: "customer",
        joined: "Oct 03, 2026"
    },
    {
        name: "Rei Lopez",
        email: "user@gmail.com",
        password: "UserPass123",
        role: "customer",
        joined: "Oct 03, 2026"
    },
    {
        name: "Jairus Torreda",
        email: "usrayleton@gmail.com",
        password: "UserPass123",
        role: "customer",
        joined: "Sep 28, 2026"
    },
    {
        name: "Jairus Torreda",
        email: "torredajairus63@gmail.com",
        password: "UserPass123",
        role: "customer",
        joined: "Sep 28, 2026"
    }
];
