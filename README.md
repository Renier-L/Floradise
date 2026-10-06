# FloraBloom — Intentionally Vulnerable Flower Shop
### Cybersecurity Penetration-Testing & Web Security Educational Laboratory

> **IMPORTANT SECURITY NOTICE & DISCLAIMER**  
> **Only test this application in an authorized environment.**  
> FloraBloom was intentionally designed with controlled security flaws for authorized cybersecurity education, penetration testing training, ethical hacking workshops, and defensive programming practice.  
> All flower products, customer records, addresses, telephone numbers, order IDs, authentication credentials, and session tokens are **100% fictional**. This application must **NEVER** be used to collect real customer data, live credentials, or payment card information.

---

## 1. Project Overview

**FloraBloom** is a fictional modern online flower boutique e-commerce web application built using **pure HTML5, CSS3, and vanilla JavaScript (ES6)**. It runs entirely on the client side without requiring Node.js, PHP, or external database servers, allowing it to be hosted statically on free hosting providers such as **GitHub Pages** or **Cloudflare Pages**.

The application emulates a high-end flower boutique with an elegant botanical aesthetic (soft rose pink, ivory cream, forest green) where visitors can:
* Browse seasonal flower catalogs (Roses, Tulips, Sunflowers, Lilies, Orchids, Daisies, Mixed Bouquets).
* View product details, select color varieties, and adjust quantities.
* Add bouquets to an interactive shopping cart with live subtotal, shipping, and tax calculations.
* Submit customer reviews.
* Experience simulated client-side login and registration.
* Place simulated orders and track floral delivery receipts.
* Explore a fake administrative operations dashboard.

---

## 2. Technologies Used

* **HTML5:** Semantic markup, responsive forms, and UI layouts.
* **CSS3:** Modern CSS variables, Flexbox, CSS Grid, smooth transitions, custom scrollbars, and media queries.
* **Vanilla JavaScript (ES6+):** Pure client-side e-commerce logic, cart state management, and vulnerability demonstration hooks.
* **Web Storage API (`localStorage`):** Simulates persistent database storage for flower inventory, user accounts, order receipts, active sessions, and customer reviews.
* **Zero External Backend / Frameworks:** No React, Vue, Angular, Node.js, PHP, MySQL, or MongoDB dependencies required.

---

## 3. Project Structure

```text
FloraBloom/
│
├── index.html          # Modern boutique homepage (Hero, Featured Blooms, Categories, Reviews)
├── products.html       # Flower catalog with search & category filtering (Reflected XSS demo)
├── product.html        # Product details & customer review system (Stored XSS demo)
├── login.html          # Authentication page with demo accounts (Client-side auth & insecure storage)
├── register.html       # User signup simulation (Client-side validation, zero data transmission)
├── cart.html           # Full shopping cart with quantity stepper and price calculations
├── checkout.html       # Fake checkout & order creation flow (Simulated payment token)
├── order.html          # Order tracking & invoice receipt (IDOR vulnerability demo)
├── admin.html          # Administrative operations dashboard (Broken access control demo)
├── style.css           # Modern botanical theme styles (Responsive & elegant aesthetic)
├── script.js           # Core cart, session, and vulnerability orchestration logic
├── products.js         # Flower catalog data, default seed orders, reviews, and exposed dev constants
└── README.md           # Comprehensive cybersecurity laboratory guide & remediation manual
```

---

## 4. Intentional Cybersecurity Vulnerabilities Matrix

| # | Vulnerability | CWE Classification | Affected Page / File | Vulnerability Summary |
|---|---|---|---|---|
| **1** | **Reflected XSS** | CWE-79 | `products.html` | Unsafe reflection of URL search parameter into DOM |
| **2** | **Stored XSS** | CWE-79 | `product.html` | Customer reviews saved in `localStorage` rendered unsanitized |
| **3** | **Client-Side Authentication** | CWE-287 / CWE-306 | `login.html` / `script.js` | Login credentials evaluated and verified inside browser JavaScript |
| **4** | **Broken Access Control (BAC)** | CWE-284 / CWE-285 | `admin.html` | Admin dashboard accessibility dictated by URL query parameter `?role=admin` |
| **5** | **Insecure Direct Object Reference (IDOR)** | CWE-639 | `order.html` | Sequential numeric order IDs queryable without user authorization verification |
| **6** | **Insecure Local Storage** | CWE-922 / CWE-312 | Browser Storage | Unencrypted JWT session tokens and user profiles stored in `localStorage` |
| **7** | **Sensitive Information Exposure** | CWE-200 | `products.js` / `script.js` | Hardcoded development API keys, staging endpoints, and debug comments exposed |

---

## 5. In-Depth Vulnerability Analysis & Secure Remediation

---

### Vulnerability 1 — Reflected Cross-Site Scripting (Reflected XSS)

#### 1. What It Is
Reflected XSS occurs when an application receives untrusted data in an HTTP request (such as a URL query parameter or form field) and includes that data within the immediate response without adequate validation, output escaping, or contextual encoding.

#### 2. Where It Exists
* **Page:** `products.html`
* **File:** `FloraBloom/products.html`
* **Vulnerable Code:**
```javascript
const searchParam = new URLSearchParams(window.location.search).get('search');
if (searchParam) {
    // INSECURE: Inserting untrusted parameter directly into innerHTML
    displaySpan.innerHTML = `Search results for: <strong>${searchParam}</strong>`;
}
```

#### 3. How to Identify It
1. Navigate to the catalog page: `products.html`.
2. Input any distinctive HTML characters into the search bar or URL: `products.html?search=<h1>Test</h1>`.
3. Open browser Developer Tools (**Inspect Element**).
4. Observe that the injected `<h1>Test</h1>` tag is directly rendered as an active DOM element rather than text.

#### 4. Harmless Test Payloads
* **Payload A (Script Tag):**
  ```html
  products.html?search=<script>alert('Reflected XSS Triggered!')</script>
  ```
* **Payload B (Image Error Event):**
  ```html
  products.html?search=<img src=x onerror="alert('Reflected XSS via Image Error')">
  ```
* **Payload C (SVG Event):**
  ```html
  products.html?search=<svg onload="alert('Reflected XSS via SVG')">
  ```

#### 5. Why It Is Dangerous
An attacker can craft a malicious URL and trick a victim into clicking it (e.g., via phishing). When the victim visits the link, the attacker's script executes within the context of the victim's session, enabling cookie/token theft, UI redress, keylogging, or unauthorized actions on behalf of the user.

#### 6. How Developers Should Fix It
Use safe DOM manipulation properties such as `textContent` or `innerText`, or sanitize using a library like DOMPurify:

```javascript
// SECURE FIX: Using textContent prevents HTML tag interpretation
const displaySpan = document.getElementById('search-query-display');
displaySpan.textContent = `Search results for: "${searchParam}"`;
```

---

### Vulnerability 2 — Stored Cross-Site Scripting (Stored XSS)

#### 1. What It Is
Stored XSS occurs when an application receives untrusted input from a user, stores it in a persistent data store (database, filesystem, or `localStorage`), and later renders that stored data in pages viewed by other users without proper sanitization.

#### 2. Where It Exists
* **Page:** `product.html` (Customer Reviews Section)
* **File:** `FloraBloom/product.html`
* **Vulnerable Code:**
```javascript
// INSECURE: Stored comment rendered directly into innerHTML
container.innerHTML = productReviews.map(r => `
    <div class="review-card">
        <span class="review-author">${r.author}</span>
        <div class="review-comment">${r.comment}</div>
    </div>
`).join('');
```

#### 3. How to Identify It
1. Open any flower details page (e.g., `product.html?id=1`).
2. Fill out the "Share Your Floral Experience" review form.
3. In the "Your Comments" box, enter HTML markup or script payloads.
4. Click **Publish Customer Review**.
5. Refresh the page or visit the URL from another tab: the payload executes automatically on every page load.

#### 4. Harmless Test Payloads
* **Payload A:**
  ```html
  <img src="invalid" onerror="alert('Stored XSS - Persistent LocalStorage Execution!')">
  ```
* **Payload B:**
  ```html
  <b onmouseover="alert('Stored XSS Triggered on Hover')">Hover over this review text!</b>
  ```

#### 5. Why It Is Dangerous
Stored XSS is often rated critical because the payload affects **every user** who views the compromised product page. Attackers can execute worm-like behaviors, hijack accounts of administrators moderating reviews, or redirect customers to phishing portals.

#### 6. How Developers Should Fix It
Perform HTML entity encoding before rendering, or construct elements safely using `document.createElement()`:

```javascript
// SECURE FIX: Contextual HTML Encoding Helper
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Render escaped content
container.innerHTML = productReviews.map(r => `
    <div class="review-card">
        <span class="review-author">${escapeHtml(r.author)}</span>
        <div class="review-comment">${escapeHtml(r.comment)}</div>
    </div>
`).join('');
```

---

### Vulnerability 3 — Client-Side Authentication

#### 1. What It Is
Client-Side Authentication is an architectural anti-pattern where credentials verification, password validation, and authentication decisions are performed entirely inside the client’s web browser instead of a trusted backend server.

#### 2. Where It Exists
* **Page:** `login.html`
* **File:** `FloraBloom/script.js` & `FloraBloom/products.js`
* **Vulnerable Code:**
```javascript
// INSECURE: Authentication verification in browser JavaScript
function handleLogin(email, password) {
    const users = getUsers(); // Loaded from localStorage
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
        localStorage.setItem('florabloom_session', JSON.stringify({ role: foundUser.role, ... }));
        return true;
    }
    return false;
}
```

#### 3. How to Identify It
1. Open `login.html` in your web browser.
2. Press `F12` to open Developer Tools and select the **Sources** or **Debugger** tab.
3. Search for `handleLogin` or `INITIAL_USERS` in `script.js` or `products.js`.
4. Observe the hardcoded administrator credentials in clear text:
   * Email: `admin@florabloom.local`
   * Password: `FlowerAdmin123`

#### 4. Harmless Test Example
1. Navigate to `login.html`.
2. Inspect the sources in DevTools to find the credentials.
3. Enter `admin@florabloom.local` and `FlowerAdmin123`.
4. Observe immediate client-side redirection to the administrative area.

#### 5. Why It Is Dangerous
Because all code running on the client machine is completely controlled by the user, client-side authentication provides **zero security guarantee**. Any user can read the source code, extract all valid passwords, bypass conditional checks, or simulate any authenticated role.

#### 6. How Developers Should Fix It
Authentication must **never** be performed on the client:
* Transmit credentials over HTTPS via a `POST /api/v1/auth/login` endpoint.
* Verify passwords server-side using modern cryptographic hashing algorithms (e.g., Argon2id or bcrypt).
* Issue server-signed cryptographically verifiable tokens (e.g., JWT signed with an asymmetric private key) stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies.

---

### Vulnerability 4 — Broken Access Control (BAC)

#### 1. What It Is
Broken Access Control occurs when an application fails to properly enforce restrictions on what authenticated or unauthenticated users can access, allowing users to access resources or perform actions outside their designated permissions.

#### 2. Where It Exists
* **Page:** `admin.html`
* **File:** `FloraBloom/admin.html`
* **Vulnerable Code:**
```javascript
// INSECURE: Role privilege checked via query parameter and client-side session
const urlParams = new URLSearchParams(window.location.search);
const roleParam = urlParams.get('role');
const session = JSON.parse(localStorage.getItem('florabloom_session') || '{}');

if (roleParam === 'admin' || session.role === 'admin') {
    renderAdminDashboard(); // Full administrative access granted!
} else {
    showAccessDenied();
}
```

#### 3. How to Identify It
1. Navigate directly to `admin.html` without logging in.
2. Observe the "Access Restricted" warning screen.
3. Inspect the URL and notice how access is determined.
4. Modify the URL to include `?role=admin`: `admin.html?role=admin`.
5. Observe that the protection is completely bypassed.

#### 4. Harmless Test Example
1. Open an incognito browser window.
2. Enter the URL:
   ```text
   admin.html?role=admin
   ```
3. Observe immediate unrestricted access to sales metrics, customer orders, inventory modification tools, and review moderation controls.

#### 5. Why It Is Dangerous
Flawed access controls allow unauthenticated attackers to elevate their privileges to administrator status, exposing sensitive company financials, customer PII, order histories, and backend business logic.

#### 6. How Developers Should Fix It
Privilege and authorization enforcement must occur on the server:
* Implement server-side middleware (e.g., Role-Based Access Control / RBAC).
* Validate the user's role on every API call against a server-side session or verified JWT claims.
* Never trust client-supplied query parameters, headers, or local cookies for authorization decisions.

```javascript
// SECURE BACKEND PSEUDOCODE (Node.js / Express):
function requireAdminRole(req, res, next) {
    if (!req.session || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden: Admin privileges required" });
    }
    next();
}
```

---

### Vulnerability 5 — Insecure Direct Object Reference (IDOR)

#### 1. What It Is
IDOR occurs when an application provides direct access to objects (such as records, files, or database rows) based on user-supplied input (like an `id` parameter) without performing an authorization check to verify that the requesting user owns or has permission to view that object.

#### 2. Where It Exists
* **Page:** `order.html`
* **File:** `FloraBloom/order.html`
* **Vulnerable Code:**
```javascript
// INSECURE: Direct object retrieval without ownership validation
const orderId = new URLSearchParams(window.location.search).get('id');
const orders = getOrders();
const order = orders.find(o => String(o.id) === String(orderId));

if (order) {
    // Displays customer full name, address, phone number, and items!
    renderOrderReceipt(order);
}
```

#### 3. How to Identify It
1. Place a simulated order through `checkout.html`, which redirects you to `order.html?id=1005`.
2. Observe the sequential numeric format of the `id` parameter in the URL.
3. Decrement the ID in the URL to `order.html?id=1003` or `order.html?id=1001`.
4. Observe that another customer's full contact details and order receipt are displayed.

#### 4. Harmless Test Steps
* Visit `order.html?id=1001` → View order of **Alice Green** (`124 Rosewood Lane, Seattle`).
* Visit `order.html?id=1002` → View order of **Marcus Sterling** (`742 Evergreen Terrace, Portland`).
* Visit `order.html?id=1003` → View order of **Dr. Evelyn Vance** (`88 Horizon Point, San Francisco`).
* Visit `order.html?id=1004` → View order of **Liam O'Connor** (`502 Magnolia Blvd, Austin`).

#### 5. Why It Is Dangerous
IDOR allows attackers to enumerate (scrape) an entire customer database by iterating sequentially through IDs (`1001`, `1002`, `1003`...), resulting in mass Personally Identifiable Information (PII) data breaches, GDPR/CCPA regulatory fines, and corporate reputation damage.

#### 6. How Developers Should Fix It
1. **Enforce Server-Side Ownership Checks:** Ensure the requesting user’s authenticated ID matches the user ID tied to the record:
   ```javascript
   // SECURE BACKEND PSEUDOCODE:
   const order = await Order.findById(req.params.id);
   if (!order || (order.userId !== req.currentUser.id && req.currentUser.role !== 'admin')) {
       return res.status(404).json({ error: "Order not found" });
   }
   ```
2. **Use Indirect or Unpredictable References:** Replace sequential IDs (`1001`, `1002`) with cryptographically secure UUIDv4 identifiers: e.g., `order.html?id=f47ac10b-58cc-4372-a567-0e02b2c3d479`.

---

### Vulnerability 6 — Insecure Local Storage

#### 1. What It Is
Insecure Client Storage occurs when an application stores sensitive session tokens, credentials, or personal information in browser storage mechanisms (such as `localStorage` or `sessionStorage`) that lack cryptographic protections and are accessible to any JavaScript running on the origin.

#### 2. Where It Exists
* **Page:** `login.html`, `script.js`
* **File:** `FloraBloom/script.js`
* **Vulnerable Code:**
```javascript
// INSECURE: Storing sensitive token and role in localStorage
const fakeSession = {
    email: foundUser.email,
    role: foundUser.role,
    sessionToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
};
localStorage.setItem('florabloom_session', JSON.stringify(fakeSession));
```

#### 3. How to Identify It
1. Log in to the application at `login.html`.
2. Open Developer Tools (`F12`) and switch to the **Application** (Chrome/Edge) or **Storage** (Firefox) tab.
3. Expand **Local Storage** under the current domain.
4. Observe the plaintext session object containing the simulated JWT and user profile.
5. In the Developer Tools **Console**, run:
   ```javascript
   console.log(localStorage.getItem('florabloom_session'));
   ```

#### 4. Harmless Test Example (Cross-Vulnerability Chaining)
Chain Vulnerability 1 or 2 (XSS) with Vulnerability 6:
Submit a review containing:
```html
<img src=x onerror="alert('Extracted Session: ' + localStorage.getItem('florabloom_session'))">
```
Notice how XSS allows an attacker to effortlessly steal the user's session token from `localStorage`.

#### 5. Why It Is Dangerous
`localStorage` has **no protection against Cross-Site Scripting (XSS)**. Any script injected into the page can immediately read all stored tokens and exfiltrate them to an external server. Furthermore, data in `localStorage` persists indefinitely until explicitly cleared.

#### 6. How Developers Should Fix It
* Never store sensitive authentication tokens in `localStorage`.
* Store session identifiers in **`HttpOnly` cookies** with flags:
  ```http
  Set-Cookie: session_id=abc123xyz; Secure; HttpOnly; SameSite=Strict; Path=/
  ```
  The `HttpOnly` flag prevents client-side JavaScript (including XSS payloads) from accessing the cookie value.

---

### Vulnerability 7 — Sensitive Information Exposure

#### 1. What It Is
Information Exposure occurs when sensitive configuration details, internal architectural endpoints, developer comments, or test credentials are inadvertently left in client-facing source code or build artifacts.

#### 2. Where It Exists
* **Page:** Global (all pages including `products.js`)
* **File:** `FloraBloom/products.js` & `FloraBloom/script.js`
* **Vulnerable Code:**
```javascript
// INSECURE: Developer staging config and test keys exposed in production bundle
const FAKE_DEV_CONFIG = {
    ENVIRONMENT: "staging-lab",
    DELIVERY_API_KEY: "TEST_API_KEY_DO_NOT_USE_FLORABLOOM_DEV_99214",
    INTERNAL_SMS_GATEWAY: "https://sandbox-notify.florabloom.local/api/v1/sms",
    DEFAULT_ADMIN_EMAIL: "admin@florabloom.local",
    DEBUG_ORDER_BACKUP_ID: "TEST_ORDER_1001"
};
console.info("[FloraBloom Security Lab] Developer config loaded: ", FAKE_DEV_CONFIG);
```

#### 3. How to Identify It
1. Open any page on FloraBloom (e.g., `index.html`).
2. Press `F12` and open the **Console** tab.
3. Observe the development configuration banner and credentials logged automatically.
4. Open the **Sources** tab and inspect `products.js` to read developer comments.

#### 4. Harmless Test Example
Open DevTools Console and execute:
```javascript
console.table(FAKE_DEV_CONFIG);
```
Review the exposed internal endpoints, fake API keys, and admin email.

#### 5. Why It Is Dangerous
Exposing API keys, testing tokens, or staging URLs gives adversaries valuable reconnaissance information to map out internal infrastructure, discover hidden endpoints, or abuse downstream APIs.

#### 6. How Developers Should Fix It
* Maintain strict separation between client-side assets and server-side environment variables (`.env`).
* Use build pipelines that automatically strip comments, debug logs, and development configurations before deployment.
* Never commit secrets or API tokens to source control.

---

## 6. Local Testing Instructions

Follow these steps to run and test FloraBloom on your local computer:

### Step 1: Download the Project
Ensure all files in the `FloraBloom/` folder are downloaded to a single local directory:
```text
FloraBloom/
├── index.html
├── products.html
├── product.html
├── login.html
├── register.html
├── cart.html
├── checkout.html
├── order.html
├── admin.html
├── style.css
├── script.js
├── products.js
└── README.md
```

### Step 2: Start a Local HTTP Server
While static files can be opened directly in a browser (`file:///`), running a lightweight local HTTP server ensures proper origin headers and uniform script behavior:

#### Option A: Using Python 3 (Recommended)
Open PowerShell or your command terminal, navigate to the `FloraBloom` directory, and run:
```bash
python -m http.server 8000
```
Then open your browser and navigate to:
```text
http://localhost:8000
```

#### Option B: Using Node.js `npx serve`
If Node.js is installed on your computer, run:
```bash
npx serve .
```

#### Option C: Using VS Code Live Server
1. Open the `FloraBloom` folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` and select **Open with Live Server**.

### Step 3: Test Each Vulnerability
Follow the test payloads described in Section 5 of this guide:
1. **Reflected XSS:** Enter `products.html?search=<script>alert('XSS')</script>`.
2. **Stored XSS:** Post a review with `<img src=x onerror=alert('Stored-XSS')>` on `product.html?id=1`.
3. **Client-Side Auth:** Inspect `script.js` to extract demo credentials; log in at `login.html`.
4. **BAC:** Navigate directly to `admin.html?role=admin`.
5. **IDOR:** Change the URL from `order.html?id=1001` to `order.html?id=1003`.
6. **Insecure Storage:** Inspect `localStorage` in DevTools under the Application tab.
7. **Information Exposure:** Check the browser Console (`F12`) on page load.

---

## 7. Free Hosting Deployment Instructions

Because FloraBloom is composed entirely of static HTML, CSS, and JavaScript, it can be hosted for free on **GitHub Pages** or **Cloudflare Pages**.

> **Note:** As specified in the requirements, do **not** use Vercel.

### Method 1: Deploying to GitHub Pages

1. **Create a GitHub Account & Repository:**
   * Go to [GitHub.com](https://github.com) and log in.
   * Click **New Repository**.
   * Name your repository (e.g., `florabloom-security-lab`).
   * Set visibility to **Public**.
   * Click **Create repository**.

2. **Upload Website Files:**
   * On your repository page, click **Add file** → **Upload files**.
   * Drag and drop all files from your `FloraBloom/` folder (`index.html`, `products.html`, `product.html`, `login.html`, `register.html`, `cart.html`, `checkout.html`, `order.html`, `admin.html`, `style.css`, `script.js`, `products.js`, `README.md`).
   * **Important:** Ensure `index.html` is in the root directory of the repository (not nested inside a subfolder).
   * Enter a commit message (e.g., `"Initial commit of FloraBloom website"`) and click **Commit changes**.

3. **Enable GitHub Pages:**
   * In your repository, click the **Settings** tab.
   * In the left sidebar, click **Pages** (under the "Code and automation" section).
   * Under **Build and deployment** → **Source**, select **Deploy from a branch**.
   * Under **Branch**, select `main` (or `master`) and keep folder as `/ (root)`.
   * Click **Save**.

4. **Access the Live Website:**
   * Wait 1–2 minutes for the GitHub Actions deployment to complete.
   * Refresh the page; GitHub Pages will display your live URL:
     ```text
     https://<your-username>.github.io/<repository-name>/
     ```
   * Open the URL to access your live cybersecurity laboratory.

---

### Method 2: Deploying to Cloudflare Pages

1. **Log in to Cloudflare:**
   * Go to [Cloudflare.com](https://dash.cloudflare.com) and sign in.
2. **Navigate to Workers & Pages:**
   * In the left navigation, select **Compute (Workers) > Workers & Pages**.
   * Click **Create application** → Select the **Pages** tab.
3. **Upload Assets:**
   * Select **Direct Upload**.
   * Name your project (e.g., `florabloom-lab`).
   * Drag and drop the `FloraBloom/` folder containing your HTML, CSS, and JS files.
   * Click **Deploy site**.
4. **Access the Live Website:**
   * Cloudflare Pages will provide an instant production URL:
     ```text
     https://florabloom-lab.pages.dev
     ```

---

## 8. Ethical Responsibility & Lab Guidelines

* **Educational Purpose Only:** This application was developed strictly for academic coursework, ethical security research, and penetration-testing demonstrations.
* **Controlled Scope:** All vulnerabilities are contained entirely within client-side browser memory and `localStorage`.
* **Zero Real Data:** Do not input real-world passwords, payment credentials, or personal identity information into any forms on this website.
* **Authorized Environments Only:** Penetration testing tools and payloads must only be executed against systems you own or have explicit, documented authorization to test.

---
*Created for Cybersecurity Education & Penetration-Testing Laboratory Studies.*
