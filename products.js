/**
 * FloraBloom E-Commerce Flower Catalog & Seed Data
 * =========================================================================
 * CYBERSECURITY LAB NOTE:
 * This file contains intentional vulnerabilities for educational testing.
 * All customer data, keys, credentials, and transactions are 100% fictional.
 * =========================================================================
 */

// =========================================================================
// VULNERABILITY 7: SENSITIVE INFORMATION EXPOSURE
// CWE-200: Exposure of Sensitive Information to an Unauthorized Actor
// Developer comments, fake internal API keys, and staging endpoints left in production JS!
// =========================================================================
const FAKE_DEV_CONFIG = {
    APP_NAME: "FloraBloom Online Florist",
    ENVIRONMENT: "staging-lab",
    DEBUG_MODE: true,
    DELIVERY_API_KEY: "TEST_API_KEY_DO_NOT_USE_FLORABLOOM_DEV_99214",
    INTERNAL_SMS_GATEWAY: "https://sandbox-notify.florabloom.local/api/v1/sms",
    DEFAULT_ADMIN_EMAIL: "admin@florabloom.local",
    DEBUG_ORDER_BACKUP_ID: "TEST_ORDER_1001",
    DEV_TEAM_NOTES: "TODO: Migrate client-side role validation to backend before production deployment!"
};

// Log to console on script load for easy discovery during security inspection
console.info(
    "%c[FloraBloom Security Lab]%c Developer config loaded: ",
    "background: #d45d79; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;",
    "color: #2d6a4f; font-weight: bold;",
    FAKE_DEV_CONFIG
);

// Flower Catalog Dataset
const FLORABLOOM_PRODUCTS = [
    {
        id: 1,
        name: "Velvet Crimson Roses",
        category: "Roses",
        price: 49.99,
        originalPrice: 59.99,
        rating: 4.9,
        reviewCount: 38,
        colors: ["Crimson Red", "Deep Burgundy", "Blush Pink"],
        image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
        description: "A signature bouquet of twelve hand-selected velvety long-stem crimson roses, bundled with aromatic Italian ruscus and delicate eucalyptus greens. The classic emblem of romance and timeless devotion.",
        featured: true,
        stock: 24
    },
    {
        id: 2,
        name: "Blushing Pastel Tulips",
        category: "Tulips",
        price: 34.50,
        originalPrice: 42.00,
        rating: 4.8,
        reviewCount: 22,
        colors: ["Pastel Pink", "Soft Lilac", "Snow White"],
        image: "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80",
        description: "Freshly harvested Holland garden tulips in dreamy pastel tones. Crisp, graceful, and symbolizing heartfelt warmth and new beginnings in any living space.",
        featured: true,
        stock: 18
    },
    {
        id: 3,
        name: "Golden Sunburst Sunflowers",
        category: "Sunflowers",
        price: 29.99,
        originalPrice: 35.00,
        rating: 4.7,
        reviewCount: 19,
        colors: ["Golden Yellow", "Amber Sun"],
        image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80",
        description: "Sun-drenched farm-grown sunflowers radiating vibrant energy and optimism. Accented with wild solidago and rustic dried wheat sprigs.",
        featured: true,
        stock: 15
    },
    {
        id: 4,
        name: "Royal Casablanca White Lilies",
        category: "Lilies",
        price: 54.00,
        originalPrice: 65.00,
        rating: 4.9,
        reviewCount: 16,
        colors: ["Pure White", "Cream Blush"],
        image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80",
        description: "Majestic Casablanca oriental lilies renowned for their intoxicating fragrance and magnificent star-shaped white petals. Perfect for celebratory centerpieces and elegant greetings.",
        featured: false,
        stock: 12
    },
    {
        id: 5,
        name: "Exotic Moon Phalaenopsis Orchid",
        category: "Orchids",
        price: 68.00,
        originalPrice: 79.99,
        rating: 5.0,
        reviewCount: 41,
        colors: ["Moon White", "Amethyst Magenta", "Speckled Yellow"],
        image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80",
        description: "An artisan potted double-stem Phalaenopsis orchid displaying cascading butterfly blooms. Comes in a minimalist glazed ceramic vessel for long-lasting indoor botanical luxury.",
        featured: true,
        stock: 8
    },
    {
        id: 6,
        name: "Sweet Chamomile Daisy Meadow",
        category: "Daisies",
        price: 26.50,
        originalPrice: 30.00,
        rating: 4.6,
        reviewCount: 14,
        colors: ["Crisp White", "Sun Yellow"],
        image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=80",
        description: "A playful, breezy gathering of cheerful chamomile blooms, wild feverfew, and field grasses. Radiates innocence, simplicity, and meadow freshness.",
        featured: false,
        stock: 20
    },
    {
        id: 7,
        name: "Elysian Spring Mixed Bouquet",
        category: "Mixed Bouquets",
        price: 58.50,
        originalPrice: 70.00,
        rating: 4.9,
        reviewCount: 52,
        colors: ["Garden Pastel Harmony", "Sunrise Vibrant"],
        image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80",
        description: "Our florists' supreme blend of English garden roses, snapdragons, fragrant lavender, and eucalyptus foliage. Arranged with hand-tied satin ribbon.",
        featured: true,
        stock: 14
    },
    {
        id: 8,
        name: "Stargazer Oriental Pink Lilies",
        category: "Lilies",
        price: 48.00,
        originalPrice: 55.00,
        rating: 4.8,
        reviewCount: 27,
        colors: ["Vibrant Fuchsia & White", "Deep Pink"],
        image: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=800&q=80",
        description: "Bold, dramatic, and intensely sweet-scented Stargazer lilies with prominent raspberry speckles and graceful curling petals. Unforgettable in any room.",
        featured: false,
        stock: 16
    },
    {
        id: 9,
        name: "Vintage Blush Peony Cloud",
        category: "Mixed Bouquets",
        price: 62.00,
        originalPrice: 75.00,
        rating: 5.0,
        reviewCount: 64,
        colors: ["Soft Coral", "Pearl White", "Blush Cream"],
        image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
        description: "Opulent ruffled peony blossoms paired with silver dollar eucalyptus. A seasonal luxury favorite featuring layers of soft velvet petals.",
        featured: true,
        stock: 10
    },
    {
        id: 10,
        name: "Lavender Twilight Wildflowers",
        category: "Mixed Bouquets",
        price: 38.00,
        originalPrice: 45.00,
        rating: 4.7,
        reviewCount: 18,
        colors: ["Provence Purple", "Lilac Mist"],
        image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
        description: "Organic dried and fresh French lavender sprigs combined with lisianthus, thistle sea holly, and baby's breath. Calming and wonderfully aromatic.",
        featured: false,
        stock: 22
    },
    {
        id: 11,
        name: "Snow White Gardenia & Rose Box",
        category: "Roses",
        price: 72.00,
        originalPrice: 85.00,
        rating: 4.9,
        reviewCount: 31,
        colors: ["Alabaster White"],
        image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80",
        description: "Hand-curated pristine white avalanche roses presented in a round Parisian keepsake presentation box. Ideal for anniversaries and bridal celebrations.",
        featured: false,
        stock: 9
    },
    {
        id: 12,
        name: "Sunset Flame Orange Tulips",
        category: "Tulips",
        price: 36.00,
        originalPrice: 40.00,
        rating: 4.8,
        reviewCount: 15,
        colors: ["Tangerine Flame", "Sun Gold"],
        image: "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?auto=format&fit=crop&w=800&q=80",
        description: "Fiery orange and golden duo-tone Dutch tulips that open wide into breathtaking stars. Brightens up desk spaces and family dining tables.",
        featured: false,
        stock: 19
    }
];

// Seed Customer Reviews (Stored in localStorage and rendered without escaping -> Stored XSS)
const INITIAL_REVIEWS = [
    {
        id: 1,
        productId: 1,
        author: "Charlotte Hayes",
        rating: 5,
        date: "2026-09-15",
        comment: "These crimson roses were breathtaking! Delivered promptly for our 10th anniversary and lasted over ten days."
    },
    {
        id: 2,
        productId: 1,
        author: "Julian Vance",
        rating: 5,
        date: "2026-09-20",
        comment: "The scent filled our entire home within minutes. Outstanding flower presentation and wrapping."
    },
    {
        id: 3,
        productId: 2,
        author: "Hannah Abbott",
        rating: 4,
        date: "2026-09-22",
        comment: "Such delicate pastel colors. A couple of stems were slightly closed, but opened into perfection next morning."
    },
    {
        id: 4,
        productId: 3,
        author: "Oliver Brooks",
        rating: 5,
        date: "2026-09-28",
        comment: "Massive sunflower heads, vibrant yellow! Put a huge smile on my mother's face for her retirement."
    },
    {
        id: 5,
        productId: 5,
        author: "Serena Thorne",
        rating: 5,
        date: "2026-10-01",
        comment: "The white orchid arrived impeccably packaged in its ceramic pot. True boutique quality."
    }
];

// Seed Customer Orders (Used for IDOR simulation in order.html?id=1001)
const INITIAL_ORDERS = [
    {
        id: "1001",
        customerName: "Alice Green",
        email: "alice.green@example.fake",
        phone: "+1 (555) 014-2289",
        address: "124 Rosewood Lane, Suite 3B, Seattle, WA 98101",
        items: [
            { id: 1, name: "Velvet Crimson Roses", quantity: 2, price: 49.99, color: "Crimson Red" }
        ],
        subtotal: 99.98,
        shipping: 9.99,
        tax: 8.00,
        total: 117.97,
        status: "Delivered",
        orderDate: "2026-09-28",
        deliveryDate: "2026-09-30",
        notes: "Please leave on porch behind flower pot if not home."
    },
    {
        id: "1002",
        customerName: "Marcus Sterling",
        email: "marcus.sterling@example.fake",
        phone: "+1 (555) 019-8321",
        address: "742 Evergreen Terrace, Apt 12, Portland, OR 97201",
        items: [
            { id: 2, name: "Blushing Pastel Tulips", quantity: 1, price: 34.50, color: "Pastel Pink" }
        ],
        subtotal: 34.50,
        shipping: 7.99,
        tax: 2.76,
        total: 45.25,
        status: "In Transit",
        orderDate: "2026-10-02",
        deliveryDate: "2026-10-07",
        notes: "Ring buzzer #12 upon arrival."
    },
    {
        id: "1003",
        customerName: "Dr. Evelyn Vance",
        email: "evelyn.vance@hospital.example.fake",
        phone: "+1 (555) 017-7443",
        address: "88 Horizon Point, Penthouse 4B, San Francisco, CA 94105",
        items: [
            { id: 5, name: "Exotic Moon Phalaenopsis Orchid", quantity: 2, price: 68.00, color: "Moon White" },
            { id: 7, name: "Elysian Spring Mixed Bouquet", quantity: 1, price: 58.50, color: "Garden Pastel Harmony" }
        ],
        subtotal: 194.50,
        shipping: 12.00,
        tax: 15.56,
        total: 222.06,
        status: "Processing",
        orderDate: "2026-10-04",
        deliveryDate: "2026-10-08",
        notes: "Gift card message: Happy promotion Evelyn! Love, the clinic team."
    },
    {
        id: "1004",
        customerName: "Liam O'Connor",
        email: "liam.oconnor@creative.example.fake",
        phone: "+1 (555) 011-2994",
        address: "502 Magnolia Blvd, Austin, TX 78701",
        items: [
            { id: 3, name: "Golden Sunburst Sunflowers", quantity: 2, price: 29.99, color: "Golden Yellow" }
        ],
        subtotal: 59.98,
        shipping: 8.50,
        tax: 4.80,
        total: 73.28,
        status: "Delivered",
        orderDate: "2026-09-18",
        deliveryDate: "2026-09-21",
        notes: "Delivery recipient: Sarah O'Connor"
    }
];

// Seed Users (Vulnerability 3: Client-side authentication demo accounts)
const INITIAL_USERS = [
    {
        email: "admin@florabloom.local",
        password: "FlowerAdmin123",
        name: "Admin Blossom",
        role: "admin"
    },
    {
        email: "customer@florabloom.local",
        password: "CustomerPass123",
        name: "Jane Floral",
        role: "customer"
    }
];
