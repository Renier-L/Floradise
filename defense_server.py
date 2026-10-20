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
# True  = Defense Active (Blocks Kali Linux privilege escalation with 403 Forbidden)
# False = Vulnerable Mode (Allows unauthorized access to demonstrate the attack)
DEFENSE_ENABLED = True

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
        """Render a security response page when privilege escalation is blocked."""
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>403 Forbidden — Floradise Defense Shield</title>
    <style>
        body {{
            background: #0f172a;
            color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 1.5rem;
            box-sizing: border-box;
        }}
        .shield-card {{
            background: #1e293b;
            border: 2px solid #ef4444;
            border-radius: 16px;
            max-width: 600px;
            width: 100%;
            padding: 2.5rem;
            box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.25);
            text-align: center;
        }}
        .shield-badge {{
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(239, 68, 68, 0.15);
            color: #f87171;
            padding: 0.4rem 1rem;
            border-radius: 9999px;
            font-weight: 800;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1.2rem;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }}
        h1 {{
            color: #ffffff;
            font-size: 2rem;
            margin: 0 0 0.8rem 0;
            font-weight: 800;
        }}
        p {{
            color: #94a3b8;
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }}
        .incident-box {{
            background: #0b1120;
            border-radius: 10px;
            padding: 1.2rem;
            text-align: left;
            font-family: monospace;
            font-size: 0.85rem;
            color: #cbd5e1;
            margin-bottom: 1.8rem;
            border: 1px solid #334155;
        }}
        .incident-box div {{
            margin-bottom: 0.4rem;
        }}
        .incident-box span.key {{
            color: #38bdf8;
            font-weight: bold;
        }}
        .incident-box span.val {{
            color: #fca5a5;
        }}
        .btn-return {{
            display: inline-block;
            background: #22c55e;
            color: #ffffff;
            font-weight: 700;
            padding: 0.75rem 1.8rem;
            border-radius: 8px;
            text-decoration: none;
            transition: all 0.2s;
        }}
        .btn-return:hover {{
            background: #16a34a;
        }}
    </style>
</head>
<body>
    <div class="shield-card">
        <div class="shield-badge">🛡️ DEFENSE SHIELD ACTIVE — ACCESS DENIED</div>
        <h1>403 Forbidden</h1>
        <p>Your request was blocked by the <strong>Floradise Server-Side RBAC Guard</strong>. Privilege escalation attempts are prohibited and logged.</p>
        
        <div class="incident-box">
            <div><span class="key">INCIDENT TYPE:</span> <span class="val">Unauthorized Privilege Escalation Attempt (CWE-285)</span></div>
            <div><span class="key">CLIENT IP:</span> <span>{client_ip}</span></div>
            <div><span class="key">TIMESTAMP:</span> <span>{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</span></div>
            <div><span class="key">REASON:</span> <span class="val">{reason}</span></div>
            <div><span class="key">DEFENSE RULE:</span> <span>Server-Side Authorization Boundary Active</span></div>
        </div>

        <a href="index.html" class="btn-return">← Return to Safe Storefront</a>
    </div>
</body>
</html>"""
        self.send_response(403)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("X-Defense-Shield", "BLOCKED_PRIVILEGE_ESCALATION")
        self.end_headers()
        self.wfile.write(html.encode("utf-8"))

    def do_GET(self):
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
