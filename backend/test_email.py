"""
Minimal Flask-Mail test — directly creates a tiny Flask app with known config values.
Run from: C:\\Users\\alank\\AshaAssist\\backend
  python test_email.py
"""
import os
from dotenv import load_dotenv
load_dotenv(override=True)

import flask
from flask_mail import Mail, Message
import threading

# Build a tiny Flask app directly from env vars — no settings.py complexity
app = flask.Flask(__name__)
app.config.update(
    MAIL_SERVER   = os.getenv('MAIL_SERVER',   'smtp.gmail.com'),
    MAIL_PORT     = int(os.getenv('MAIL_PORT', 587)),
    MAIL_USE_TLS  = True,
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', ''),
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', ''),
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_USERNAME', ''),
)

mail = Mail(app)

username = app.config['MAIL_USERNAME']
print(f"MAIL_SERVER  : {app.config['MAIL_SERVER']}")
print(f"MAIL_USERNAME: {username}")
print(f"MAIL_PASSWORD: {'*' * len(app.config['MAIL_PASSWORD'])}")

if not username:
    print("\n[ERROR] MAIL_USERNAME not loaded. Check .env file exists.")
    exit(1)

HTML = """
<div style="font-family:Arial,sans-serif;padding:24px;background:#f0f9f4;border-radius:8px;">
  <h2 style="color:#1a6b4a;">AshaAssist Email System Working!</h2>
  <p>This test email confirms your SMTP credentials are valid.</p>
  <p><strong>Emails will now be automatically sent when:</strong></p>
  <ul>
    <li>A calendar event is created by an ASHA worker</li>
    <li>A vaccination slot is booked by a maternity user</li>
    <li>A vaccination is marked as completed</li>
  </ul>
  <p style="color:#6b7280;font-size:12px;">Sent from AshaAssist test script</p>
</div>
"""

def send():
    with app.app_context():
        try:
            msg = Message(
                subject="AshaAssist Email System - Test",
                recipients=[username],
                html=HTML,
                sender=username
            )
            mail.send(msg)
            print("\n[OK] Email sent successfully! Check your inbox.")
        except Exception as e:
            print(f"\n[ERROR] Failed to send: {e}")

print("\nSending test email...")
t = threading.Thread(target=send)
t.start()
t.join(timeout=15)
if t.is_alive():
    print("[TIMEOUT] Email thread still running after 15s — check network/credentials")
