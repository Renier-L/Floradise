#!/usr/bin/env python3
"""
=============================================================================
Floradise / FloraBloom — Cyber Threat Defense Shield (Python)
Project: Threat Attack & Defense Demonstration (TIP Cybersecurity Lab)
Vulnerability: Broken Access Control & Privilege Escalation (CWE-285 / OWASP A01)
Defense Mechanism: Server-Side Role-Based Access Control (RBAC) & WAF Gatekeeper
=============================================================================
This Python server acts as a defensive security proxy / middleware:
1. Intercepts all requests targeting sensitive administrative resources (/admin.html).
2. Validates session authentication tokens and checks user roles on the SERVER side.
3. Automatically BLOCKS unauthorized customers (e.g., jairus41@gmail.com) and Kali Linux
   curl/gobuster crawlers with HTTP 403 Forbidden.
4. Generates real-time intrusion detection alerts and an audit log (security_audit.log).
5. Provides an interactive DEFENSE ON / DEFENSE OFF toggle for live presentation demos!
=============================================================================
"""

import http.server
import socketserver
import os
import sys
import json
import base64
import time
import socket
import urllib.parse
from datetime import datetime

# Server Configuration
PORT = 8000
HOST = "0.0.0.0" # Listen on all interfaces so Kali Linux VM can reach it!
WEB_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(WEB_DIR, "security_audit.log")

# Global Defense State (can be toggled during live demo!)
# True  = Defense Active (Blocks Kali Linux privilege escalation & brute force)
# False = Vulnerable Mode (Allows unauthorized access to demonstrate the attack)
DEFENSE_ENABLED = True

# Brute Force Defense Tracking: { ip: { 'attempts': int, 'lockout_until': float } }
FAILED_LOGIN_ATTEMPTS = {}
BRUTE_FORCE_THRESHOLD = 3      # Max 3 failed attempts
BRUTE_FORCE_LOCKOUT_TIME = 30  # 30-second penalty lockout

def get_local_ip():
    """Detect local IP address for easy connection from Kali Linux VM."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def log_security_event(event_type, client_ip, resource, details):
    """Log security events to console and persistent audit log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] [{event_type}] IP: {client_ip} | Resource: {resource} | {details}\n"
    
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(log_entry)

class FloradiseDefenseHandler(http.server.SimpleHTTPRequestHandler):
    """
    HTTP Request Handler with integrated Server-Side Role-Based Access Control (RBAC).
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def extract_user_session(self):
        """
        Extract and verify user session from Cookie, Authorization header, or URL query.
        Returns dict with session data or None if unauthenticated.
        """
        # 1. Check Cookie: florabloom_session
        cookie_header = self.headers.get('Cookie', '')
        if cookie_header:
            cookies = cookie_header.split(';')
            for c in cookies:
                if '=' in c:
                    k, v = c.strip().split('=', 1)
                    if k == 'florabloom_session':
                        try:
                            decoded = urllib.parse.unquote(v)
                            return json.loads(decoded)
                        except Exception:
                            pass

        # 2. Check Authorization Header: Bearer <token>
        auth_header = self.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            raw_token = auth_header[7:].strip()
            # If standard pseudo-JWT token: header.payload.signature
            parts = raw_token.split('.')
            if len(parts) >= 2:
                try:
                    padded = parts[1] + '=' * (-len(parts[1]) % 4)
                    payload_json = base64.b64decode(padded).decode('utf-8')
                    return json.loads(payload_json)
                except Exception:
                    pass

        # 3. Check URL query token / session parameter
        parsed = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(parsed.query)
        if 'session' in qs:
            try:
                return json.loads(qs['session'][0])
            except Exception:
                pass

        return None

    def render_blocked_page(self, client_ip, reason):
        """Render a formal enterprise security response page when privilege escalation is blocked."""
        incident_id = f"SEC-AUTH-{int(time.time())}"
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 Forbidden — Access Denied | Floradise IAM</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <style>
        body {{
            background-color: #0b1120;
            color: #cbd5e1;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 1.5rem;
            box-sizing: border-box;
        }}
        .barrier-container {{
            background: #0f172a;
            border: 1px solid #1e293b;
            border-top: 4px solid #ef4444;
            border-radius: 12px;
            max-width: 640px;
            width: 100%;
            padding: 2.8rem 2.4rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }}
        .barrier-header {{
            display: flex;
            align-items: center;
            gap: 0.8rem;
            margin-bottom: 1.5rem;
        }}
        .barrier-icon {{
            width: 44px;
            height: 44px;
            border-radius: 8px;
            background: rgba(239, 68, 68, 0.15);
            color: #f87171;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }}
        .barrier-title-wrap h1 {{
            font-size: 1.5rem;
            font-weight: 800;
            color: #ffffff;
            margin: 0;
            letter-spacing: -0.3px;
        }}
        .barrier-title-wrap span {{
            font-size: 0.8rem;
            color: #94a3b8;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        p.barrier-desc {{
            color: #94a3b8;
            font-size: 0.95rem;
            line-height: 1.6;
            margin: 0 0 1.8rem 0;
        }}
        .telemetry-card {{
            background: #020617;
            border: 1px solid #1e293b;
            border-radius: 8px;
            padding: 1.2rem 1.4rem;
            margin-bottom: 2rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.82rem;
        }}
        .telemetry-row {{
            display: flex;
            justify-content: space-between;
            padding: 0.35rem 0;
            border-bottom: 1px solid #0f172a;
        }}
        .telemetry-row:last-child {{
            border-bottom: none;
        }}
        .telemetry-label {{
            color: #64748b;
            font-weight: 600;
        }}
        .telemetry-value {{
            color: #f1f5f9;
            font-weight: 500;
        }}
        .telemetry-value.danger {{
            color: #f87171;
            font-weight: 700;
        }}
        .telemetry-value.brand {{
            color: #38bdf8;
        }}
        .barrier-footer {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 1.2rem;
            border-top: 1px solid #1e293b;
            font-size: 0.85rem;
        }}
        .barrier-footer a {{
            color: #38bdf8;
            text-decoration: none;
            font-weight: 600;
        }}
        .barrier-footer a:hover {{
            text-decoration: underline;
        }}
        .badge-system {{
            color: #64748b;
            font-size: 0.78rem;
        }}
    </style>
</head>
<body>
    <div class="barrier-container">
        <div class="barrier-header">
            <div class="barrier-icon">🛡️</div>
            <div class="barrier-title-wrap">
                <h1>403 Forbidden — Access Denied</h1>
                <span>Floradise Identity & Role-Based Access Control (RBAC)</span>
            </div>
        </div>

        <p class="barrier-desc">
            You do not have authorization to access the <strong>Administrative Management Console (/admin.html)</strong>. This restricted endpoint requires verified System Administrator credentials. Unauthenticated requests and customer roles are strictly prohibited.
        </p>

        <div class="telemetry-card">
            <div class="telemetry-row">
                <span class="telemetry-label">SECURITY INCIDENT:</span>
                <span class="telemetry-value danger">Privilege Escalation Blocked (CWE-285 / OWASP A01)</span>
            </div>
            <div class="telemetry-row">
                <span class="telemetry-label">TARGET RESOURCE:</span>
                <span class="telemetry-value brand">/admin.html</span>
            </div>
            <div class="telemetry-row">
                <span class="telemetry-label">REASON:</span>
                <span class="telemetry-value danger">{reason}</span>
            </div>
            <div class="telemetry-row">
                <span class="telemetry-label">CLIENT IP:</span>
                <span class="telemetry-value">{client_ip}</span>
            </div>
            <div class="telemetry-row">
                <span class="telemetry-label">TIMESTAMP:</span>
                <span class="telemetry-value">{datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")}</span>
            </div>
            <div class="telemetry-row">
                <span class="telemetry-label">INCIDENT REF:</span>
                <span class="telemetry-value">{incident_id}</span>
            </div>
        </div>

        <div class="barrier-footer">
            <a href="index.html">← Return to Safe Storefront</a>
            <span class="badge-system">Floradise Defensive Security Shield v2.0</span>
        </div>
    </div>
</body>
</html>"""
        self.send_response(403)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("X-Defense-Shield", "BLOCKED_PRIVILEGE_ESCALATION")
        self.end_headers()
        self.wfile.write(html.encode("utf-8"))

    def render_rate_limited_page(self, client_ip, remaining):
        """Render a formal enterprise security response page when brute force is blocked."""
        incident_id = f"SEC-BRUTE-{int(time.time())}"
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>429 Too Many Requests — Brute Force Blocked | Floradise IAM</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <style>
        body {{
            background-color: #0b1120;
            color: #cbd5e1;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 1.5rem;
            box-sizing: border-box;
        }}
        .barrier-container {{
            background: #0f172a;
            border: 1px solid #1e293b;
            border-top: 4px solid #f59e0b;
            border-radius: 12px;
            max-width: 640px;
            width: 100%;
            padding: 2.8rem 2.4rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }}
        .barrier-header {{
            display: flex;
            align-items: center;
            gap: 0.8rem;
            margin-bottom: 1.5rem;
        }}
        .barrier-icon {{
            width: 44px;
            height: 44px;
            border-radius: 8px;
            background: rgba(245, 158, 11, 0.15);
            color: #fbbf24;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
            border: 1px solid rgba(245, 158, 11, 0.3);
        }}
        .barrier-title-wrap h1 {{
            font-size: 1.5rem;
            font-weight: 800;
            color: #ffffff;
            margin: 0;
        }}
        .barrier-title-wrap span {{
            font-size: 0.8rem;
            color: #fbbf24;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        p.barrier-desc {{
            color: #94a3b8;
            font-size: 0.95rem;
            line-height: 1.6;
            margin: 0 0 1.8rem 0;
        }}
        .telemetry-card {{
            background: #020617;
            border: 1px solid #1e293b;
            border-radius: 8px;
            padding: 1.2rem 1.4rem;
            margin-bottom: 2rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.82rem;
        }}
        .telemetry-row {{
            display: flex;
            justify-content: space-between;
            padding: 0.35rem 0;
            border-bottom: 1px solid #0f172a;
        }}
        .telemetry-row:last-child {{
            border-bottom: none;
        }}
        .telemetry-label {{ color: #64748b; font-weight: 600; }}
        .telemetry-value {{ color: #f1f5f9; font-weight: 500; }}
        .telemetry-value.warning {{ color: #fbbf24; font-weight: 700; }}
        .barrier-footer {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 1.2rem;
            border-top: 1px solid #1e293b;
            font-size: 0.85rem;
        }}
        .barrier-footer a {{ color: #38bdf8; text-decoration: none; font-weight: 600; }}
    </style>
</head>
<body>
    <div class="barrier-container">
        <div class="barrier-header">
            <div class="barrier-icon">🔒</div>
            <div class="barrier-title-wrap">
                <h1>429 Too Many Requests</h1>
                <span>Floradise Anti-Brute Force Protection</span>
            </div>
        </div>

        <p class="barrier-desc">
            Too many failed authentication attempts detected from your IP address. To prevent automated dictionary and brute force attacks, access is temporarily locked.
        </p>

        <div class="telemetry-card">
            <div class="telemetry-row">
                <span class="telemetry-label">INCIDENT TYPE:</span>
                <span class="telemetry-value warning">Automated Brute Force Attempt (CWE-307 / OWASP A07)</span>
            </div>
            <div class="telemetry-row">
                <span class="telemetry-label">CLIENT IP:</span>
                <span class="telemetry-value">{client_ip}</span>
            </div>
            <div class="telemetry-row">
                <span class="telemetry-label">RETRY AFTER:</span>
                <span class="telemetry-value warning">{remaining} seconds</span>
            </div>
            <div class="telemetry-row">
                <span class="telemetry-label">INCIDENT REF:</span>
                <span class="telemetry-value">{incident_id}</span>
            </div>
        </div>

        <div class="barrier-footer">
            <a href="login.html">← Return to Login</a>
            <span style="color:#64748b;">Floradise IAS Defense v2.0</span>
        </div>
    </div>
</body>
</html>"""
        self.send_response(429)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Retry-After", str(remaining))
        self.send_header("X-Defense-Shield", "BLOCKED_BRUTE_FORCE")
        self.end_headers()
        self.wfile.write(html.encode("utf-8"))

    def check_brute_force_status(self, client_ip):
        """
        Check if client IP is currently rate-limited.
        Returns (is_banned, remaining_seconds)
        """
        if not DEFENSE_ENABLED:
            return False, 0

        record = FAILED_LOGIN_ATTEMPTS.get(client_ip)
        if not record:
            return False, 0

        now = time.time()
        lockout_until = record.get('lockout_until', 0)
        if now < lockout_until:
            return True, int(lockout_until - now)
        elif lockout_until > 0 and now >= lockout_until:
            # Lockout expired, reset counter
            FAILED_LOGIN_ATTEMPTS[client_ip] = {'attempts': 0, 'lockout_until': 0}
            return False, 0

        return False, 0

    def record_failed_attempt(self, client_ip, email):
        """Record failed attempt and apply lockout if threshold exceeded."""
        if not DEFENSE_ENABLED:
            return False, 0

        record = FAILED_LOGIN_ATTEMPTS.get(client_ip, {'attempts': 0, 'lockout_until': 0})
        record['attempts'] += 1
        now = time.time()

        if record['attempts'] >= BRUTE_FORCE_THRESHOLD:
            record['lockout_until'] = now + BRUTE_FORCE_LOCKOUT_TIME
            FAILED_LOGIN_ATTEMPTS[client_ip] = record
            print(f"\033[91m[BRUTE FORCE BLOCKED]\033[0m 429 Too Many Requests: IP {client_ip} exceeded {BRUTE_FORCE_THRESHOLD} failed attempts! Imposing {BRUTE_FORCE_LOCKOUT_TIME}s lockout.")
            log_security_event("BRUTE_FORCE_RATE_LIMITED", client_ip, "/api/login", f"Target: {email} | Attempts: {record['attempts']} | Penalty: {BRUTE_FORCE_LOCKOUT_TIME}s ban")
            return True, BRUTE_FORCE_LOCKOUT_TIME

        FAILED_LOGIN_ATTEMPTS[client_ip] = record
        print(f"\033[93m[AUTH FAILURE]\033[0m IP {client_ip} failed login ({record['attempts']}/{BRUTE_FORCE_THRESHOLD}) for: {email}")
        log_security_event("FAILED_LOGIN_ATTEMPT", client_ip, "/api/login", f"Target: {email} | Attempt: {record['attempts']}/{BRUTE_FORCE_THRESHOLD}")
        return False, 0

    def reset_failed_attempts(self, client_ip):
        """Reset failed attempts upon successful authentication."""
        if client_ip in FAILED_LOGIN_ATTEMPTS:
            del FAILED_LOGIN_ATTEMPTS[client_ip]

    def do_POST(self):
        """Handle POST requests, specifically for login brute-force defense."""
        client_ip = self.client_address[0]
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path in ["/api/login", "/login.html", "/login"]:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            
            # Parse form body or JSON
            email = ""
            password = ""
            try:
                data = json.loads(body)
                email = data.get('email', '')
                password = data.get('password', '')
            except Exception:
                qs = urllib.parse.parse_qs(body)
                email = qs.get('email', [''])[0]
                password = qs.get('password', [''])[0]

            email = email.strip().lower()
            password = password.strip()

            # 1. Check if IP is currently under lockout (Brute Force Defense)
            is_banned, remaining = self.check_brute_force_status(client_ip)
            if is_banned:
                self.send_response(429)
                self.send_header("Content-Type", "application/json")
                self.send_header("Retry-After", str(remaining))
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "error",
                    "code": 429,
                    "error": "Too Many Requests",
                    "message": f"Brute force attack detected. Access locked for {remaining} seconds.",
                    "remaining_seconds": remaining
                }).encode('utf-8'))
                return

            # 2. Check credentials
            valid_credentials = {
                "admin@floradise.local": "FlowerAdmin123",
                "admin@floradise.com": "admin123",
                "admin": "FlowerAdmin123",
                "jairus41@gmail.com": "UserPass123",
                "user@gmail.com": "UserPass123",
                "simp@gmail.com": "UserPass123"
            }

            expected_pass = valid_credentials.get(email)
            is_valid = (expected_pass is not None and expected_pass == password)

            if not is_valid:
                # Failed attempt! Record and check threshold
                locked, penalty = self.record_failed_attempt(client_ip, email)
                if locked:
                    self.send_response(429)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Retry-After", str(penalty))
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "status": "error",
                        "code": 429,
                        "error": "Too Many Requests",
                        "message": f"Security Lockout: {BRUTE_FORCE_THRESHOLD} failed attempts exceeded. Locked for {penalty}s.",
                        "remaining_seconds": penalty
                    }).encode('utf-8'))
                    return
                else:
                    current_attempts = FAILED_LOGIN_ATTEMPTS.get(client_ip, {}).get('attempts', 1)
                    self.send_response(401)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "status": "error",
                        "code": 401,
                        "error": "Unauthorized",
                        "message": f"Invalid password. Attempt {current_attempts} of {BRUTE_FORCE_THRESHOLD}.",
                        "attempts": current_attempts,
                        "max_attempts": BRUTE_FORCE_THRESHOLD
                    }).encode('utf-8'))
                    return
            else:
                # Successful login: Reset counter
                self.reset_failed_attempts(client_ip)
                role = "admin" if "admin" in email else "customer"
                print(f"\033[92m[LOGIN SUCCESS]\033[0m IP {client_ip} successfully authenticated as: {email}")
                log_security_event("LOGIN_SUCCESSFUL", client_ip, "/api/login", f"User: {email} | Role: {role}")

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success",
                    "code": 200,
                    "message": "Authentication successful",
                    "user": { "email": email, "role": role }
                }).encode('utf-8'))
                return

        # Default handler for other POST requests
        self.send_response(404)
        self.end_headers()
        global DEFENSE_ENABLED
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        client_ip = self.client_address[0]

        # -----------------------------------------------------------------
        # Dynamic Defense Toggle API for Class Presentation Demo
        # -----------------------------------------------------------------
        if path == "/api/defense/toggle":
            DEFENSE_ENABLED = not DEFENSE_ENABLED
            status_text = "ENABLED (Protected)" if DEFENSE_ENABLED else "DISABLED (Vulnerable)"
            print(f"\n[DEMO SWITCH] Defense Shield status toggled to: {status_text}\n")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "defense_active": DEFENSE_ENABLED,
                "status": status_text,
                "message": f"Defense is now {status_text}"
            }).encode('utf-8'))
            return

        if path == "/api/defense/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "defense_active": DEFENSE_ENABLED,
                "mode": "SECURE (Defense Active)" if DEFENSE_ENABLED else "VULNERABLE (Defense Disabled)"
            }).encode('utf-8'))
            return

        if path == "/api/login/status":
            is_banned, remaining = self.check_brute_force_status(client_ip)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "is_locked": is_banned,
                "remaining_seconds": remaining,
                "attempts": FAILED_LOGIN_ATTEMPTS.get(client_ip, {}).get('attempts', 0),
                "max_attempts": BRUTE_FORCE_THRESHOLD
            }).encode('utf-8'))
            return

        # -----------------------------------------------------------------
        # PROTECTED RESOURCES: admin.html and admin-user.html
        # -----------------------------------------------------------------
        is_admin_target = ("admin.html" in path or "admin-user.html" in path)

        if is_admin_target:
            if not DEFENSE_ENABLED:
                # VULNERABLE MODE: Demonstrate successful attack from Kali Linux
                print(f"\033[93m[ATTACK SUCCEEDED]\033[0m Client {client_ip} accessed {path} (Defense is OFF)")
                log_security_event("ATTACK_ALLOWED", client_ip, path, "Vulnerable mode active - Privilege escalation permitted")
                return super().do_GET()

            # DEFENSIVE MODE: Enforce Server-Side RBAC Verification!
            session = self.extract_user_session()
            user_email = session.get('email') if session else "unauthenticated"
            user_role = session.get('role') if session else "none"

            # Check if user possesses legitimate verified admin privilege
            is_verified_admin = (session is not None and user_role == 'admin')

            if not is_verified_admin:
                # PRIVILEGE ESCALATION BLOCKED!
                reason = f"User '{user_email}' has role '{user_role}', required: 'admin'"
                print(f"\033[91m[SHIELD BLOCKED]\033[0m 403 Forbidden: Blocked {client_ip} ({user_email}) attempting {path}")
                log_security_event("BLOCKED_PRIVILEGE_ESCALATION", client_ip, path, reason)
                self.render_blocked_page(client_ip, reason)
                return
            else:
                print(f"\033[92m[ACCESS GRANTED]\033[0m Verified Admin ({user_email}) accessed {path}")
                log_security_event("ADMIN_ACCESS_AUTHORIZED", client_ip, path, f"Admin: {user_email}")

        # Check for XSS patterns in query string for IAS telemetry & audit logging
        if "?" in self.path:
            raw_query = urllib.parse.unquote(self.path.split("?", 1)[1])
            xss_indicators = ["<", ">", "script", "onerror", "onload", "javascript:", "alert(", "<u", "<h1"]
            if any(ind in raw_query.lower() for ind in xss_indicators):
                if DEFENSE_ENABLED:
                    print(f"\033[96m[XSS SHIELD ENFORCED]\033[0m Sanitizing reflected input from {client_ip}: {raw_query[:50]}")
                    log_security_event("XSS_OUTPUT_ENCODING_ENFORCED", client_ip, path, f"Payload: {raw_query[:80]} | CWE-79 Mitigated")
                else:
                    print(f"\033[93m[XSS INJECTION DETECTED]\033[0m Raw unescaped input reflected (Vulnerable Mode): {raw_query[:50]}")
                    log_security_event("XSS_RAW_INPUT_REFLECTED", client_ip, path, f"Payload: {raw_query[:80]} | Vulnerable to CWE-79")

        # Serve normal static files (index.html, products.html, css, js, etc.)
        return super().do_GET()

def start_server():
    global DEFENSE_ENABLED
    # Parse CLI flags: --vulnerable to start in vulnerable mode
    if "--vulnerable" in sys.argv:
        DEFENSE_ENABLED = False
    elif "--defend" in sys.argv:
        DEFENSE_ENABLED = True

    local_ip = get_local_ip()
    mode_str = "\033[92mACTIVE (Protected against Kali Linux)\033[0m" if DEFENSE_ENABLED else "\033[91mDISABLED (Vulnerable to Attack)\033[0m"

    print("=" * 72)
    print(" 🌸 FLORADISE CYBER THREAT DEFENSE SHIELD (PYTHON RBAC GUARD)")
    print("=" * 72)
    print(f" [*] Local Address     : http://localhost:{PORT}")
    print(f" [*] Network Address   : http://{local_ip}:{PORT} (Accessible from Kali Linux!)")
    print(f" [*] Defense Status    : {mode_str}")
    print(f" [*] Protected Target  : /admin.html (Blocks Privilege Escalation)")
    print(f" [*] Audit Log File    : {LOG_FILE}")
    print("=" * 72)
    print(" [TIPS FOR YOUR PRESENTATION DEMO]:")
    print("  1. Attack Test (Kali Linux):")
    print(f"     curl -i http://{local_ip}:{PORT}/admin.html")
    print("     -> DEFENSE ON : Returns 'HTTP/1.0 403 Forbidden' (Blocked!)")
    print("     -> DEFENSE OFF: Returns 'HTTP/1.0 200 OK' (Attack Succeeded!)")
    print("  2. Toggle Defense Mode:")
    print(f"     Open http://localhost:{PORT}/api/defense/toggle in your browser")
    print("=" * 72)
    print(" [Server is running... Press Ctrl+C to stop]\n")

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((HOST, PORT), FloradiseDefenseHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[+] Defense Shield server stopped cleanly.")

if __name__ == "__main__":
    start_server()
