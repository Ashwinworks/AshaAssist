"""
Email Notification Service for AshaAssist
Provides SMTP email delivery using Flask-Mail with branded HTML templates.
All sends are non-blocking (fire-and-forget via threading).
"""
import threading
from flask import current_app
from flask_mail import Mail, Message

# Shared Mail instance — initialised once in app.py via init_mail()
mail = Mail()


def init_mail(app):
    """Bind Flask-Mail to the Flask application instance."""
    mail.init_app(app)
    username = app.config.get('MAIL_USERNAME', '')
    if username:
        print(f"[EMAIL] Mail service initialised. Sender: {username}")
    else:
        print("[EMAIL] WARNING: MAIL_USERNAME not set — emails will be skipped.")


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _send_async(app, msg):
    """Send a message in a background thread so the API response is not blocked."""
    with app.app_context():
        try:
            mail.send(msg)
        except Exception as e:
            print(f"[EMAIL] Failed to send email to {msg.recipients}: {e}")


def send_email(subject: str, recipients: list, html_body: str, text_body: str = ""):
    """
    Low-level helper — fire-and-forget email send.
    Returns True if dispatch was attempted, False if credentials are missing.
    """
    try:
        app = current_app._get_current_object()
        if not app.config.get('MAIL_USERNAME'):
            print(f"[EMAIL] Skipped (no credentials): {subject}")
            return False

        # Filter out empty/None recipients
        valid_recipients = [r for r in recipients if r and '@' in str(r)]
        if not valid_recipients:
            return False

        msg = Message(
            subject=subject,
            recipients=valid_recipients,
            html=html_body,
            body=text_body or _strip_html(html_body),
            sender=app.config.get('MAIL_USERNAME')
        )
        thread = threading.Thread(target=_send_async, args=(app, msg))
        thread.daemon = True
        thread.start()
        print(f"[EMAIL] Dispatched '{subject}' → {valid_recipients}")
        return True
    except Exception as e:
        print(f"[EMAIL] Error dispatching email: {e}")
        return False


def _strip_html(html: str) -> str:
    """Minimal HTML → plain text fallback."""
    import re
    return re.sub(r'<[^>]+>', '', html).strip()


# ---------------------------------------------------------------------------
# HTML template base
# ---------------------------------------------------------------------------

def _base_template(title: str, content: str) -> str:
    """Wrap content in a branded AshaAssist HTML email shell."""
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a6b4a 0%,#28a86e 100%);
                       padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;
                         letter-spacing:0.5px;">🌿 AshaAssist</h1>
              <p style="margin:6px 0 0;color:#d4f5e8;font-size:13px;">
                Community Health Management System
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 36px;">
              {content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafb;padding:20px 36px;
                       border-top:1px solid #e8f0eb;text-align:center;">
              <p style="margin:0;color:#8a9ba8;font-size:12px;">
                This is an automated message from AshaAssist.<br>
                Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def _info_pill(label: str, value: str, color: str = "#1a6b4a") -> str:
    return f"""
    <tr>
      <td style="padding:6px 0;">
        <span style="display:inline-block;background:#f0f9f4;border-left:3px solid {color};
                     padding:8px 14px;border-radius:0 6px 6px 0;width:100%;box-sizing:border-box;">
          <strong style="color:#4a5568;font-size:13px;">{label}:</strong>
          <span style="color:#1a202c;font-size:14px;margin-left:6px;">{value}</span>
        </span>
      </td>
    </tr>"""


# ---------------------------------------------------------------------------
# Template: Calendar Event Notification
# ---------------------------------------------------------------------------

def send_calendar_event_notification(users: list, event: dict) -> int:
    """
    Send a 'new calendar event' email to a list of user dicts.
    Returns number of recipients emailed.
    """
    title = event.get('title', 'New Event')
    date = event.get('date', 'TBD')
    place = event.get('place', '')
    description = event.get('description', '')
    category = event.get('category', '')

    details = f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
      {_info_pill('Date', date)}
      {_info_pill('Location', place) if place else ''}
      {_info_pill('Category', category.replace('_', ' ').title()) if category else ''}
    </table>"""

    desc_block = f"""
      <p style="color:#4a5568;font-size:14px;line-height:1.7;
                background:#f8fafb;padding:14px;border-radius:8px;margin-top:16px;">
        {description}
      </p>""" if description else ""

    content = f"""
      <h2 style="margin:0 0 6px;color:#1a6b4a;font-size:20px;">📅 New Event Scheduled</h2>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">
        Your ASHA worker has scheduled a new community event.
      </p>

      <div style="background:#f0f9f4;border-radius:10px;padding:20px 22px;margin-bottom:16px;">
        <h3 style="margin:0 0 14px;color:#1a202c;font-size:18px;">{title}</h3>
        {details}
      </div>
      {desc_block}

      <p style="color:#6b7280;font-size:13px;margin-top:22px;">
        Please check your AshaAssist app for full details and to add this to your calendar.
      </p>
    """

    html = _base_template(f"New Event: {title}", content)
    recipients = [u.get('email') for u in users if u.get('email')]
    if not recipients:
        return 0
    send_email(
        subject=f"📅 New Event: {title} — AshaAssist",
        recipients=recipients,
        html_body=html
    )
    return len(recipients)


# ---------------------------------------------------------------------------
# Template: Vaccination Booking Confirmation
# ---------------------------------------------------------------------------

def send_vaccination_booking_confirmation(user: dict, booking: dict, schedule: dict) -> bool:
    """Send booking confirmation to a single user."""
    user_name = user.get('name', 'User')
    child_name = booking.get('childName', 'your child')
    vaccines = booking.get('vaccines', [])
    date = schedule.get('date', 'TBD')
    location = schedule.get('location', 'TBD')
    time_str = schedule.get('time', '')

    vaccines_html = "".join(
        f'<li style="color:#1a202c;font-size:14px;padding:3px 0;">💉 {v}</li>'
        for v in vaccines
    )

    content = f"""
      <h2 style="margin:0 0 6px;color:#1a6b4a;font-size:20px;">✅ Vaccination Booking Confirmed</h2>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">
        Dear <strong>{user_name}</strong>, your vaccination appointment has been booked successfully.
      </p>

      <div style="background:#f0f9f4;border-radius:10px;padding:20px 22px;margin-bottom:16px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          {_info_pill('Child', child_name)}
          {_info_pill('Date', date)}
          {_info_pill('Time', time_str) if time_str else ''}
          {_info_pill('Location', location)}
        </table>
      </div>

      <p style="margin:4px 0 8px;color:#4a5568;font-weight:600;font-size:14px;">
        Vaccines Scheduled:
      </p>
      <ul style="margin:0 0 20px;padding-left:20px;">
        {vaccines_html}
      </ul>

      <div style="background:#fff8e1;border-left:4px solid #f59e0b;padding:12px 16px;
                  border-radius:0 8px 8px 0;margin-top:8px;">
        <p style="margin:0;color:#78350f;font-size:13px;">
          ⚠️ Please arrive 10 minutes early and bring your health card.
        </p>
      </div>
    """

    html = _base_template("Vaccination Booking Confirmed", content)
    return send_email(
        subject="✅ Vaccination Booking Confirmed — AshaAssist",
        recipients=[user.get('email')],
        html_body=html
    )


# ---------------------------------------------------------------------------
# Template: Vaccination Completed
# ---------------------------------------------------------------------------

def send_vaccination_completed_notification(user: dict, booking: dict, schedule: dict) -> bool:
    """Send completion notification to a single user."""
    user_name = user.get('name', 'User')
    child_name = booking.get('childName', 'your child')
    vaccines = booking.get('vaccines', [])
    date = schedule.get('date', 'TBD')
    location = schedule.get('location', 'TBD')

    vaccines_html = "".join(
        f'<li style="color:#1a202c;font-size:14px;padding:3px 0;">✅ {v}</li>'
        for v in vaccines
    )

    content = f"""
      <h2 style="margin:0 0 6px;color:#1a6b4a;font-size:20px;">🎉 Vaccination Completed!</h2>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">
        Dear <strong>{user_name}</strong>, the vaccination for
        <strong>{child_name}</strong> has been successfully completed.
      </p>

      <div style="background:#f0f9f4;border-radius:10px;padding:20px 22px;margin-bottom:16px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          {_info_pill('Child', child_name)}
          {_info_pill('Date', date)}
          {_info_pill('Location', location)}
        </table>
      </div>

      <p style="margin:4px 0 8px;color:#4a5568;font-weight:600;font-size:14px;">
        Vaccines Administered:
      </p>
      <ul style="margin:0 0 20px;padding-left:20px;">
        {vaccines_html}
      </ul>

      <p style="color:#4a5568;font-size:14px;line-height:1.7;">
        You can download the official <strong>Digital Vaccination Certificate</strong>
        from your AshaAssist app under <em>Vaccination Records</em>.
      </p>

      <div style="background:#f0f9f4;border-left:4px solid #1a6b4a;padding:12px 16px;
                  border-radius:0 8px 8px 0;margin-top:8px;">
        <p style="margin:0;color:#1a6b4a;font-size:13px;">
          🩺 Keep your vaccination records up to date for future health check-ups.
        </p>
      </div>
    """

    html = _base_template("Vaccination Completed", content)
    return send_email(
        subject="🎉 Vaccination Completed — AshaAssist",
        recipients=[user.get('email')],
        html_body=html
    )


# ---------------------------------------------------------------------------
# Template: Custom / Broadcast Email
# ---------------------------------------------------------------------------

def send_custom_email(recipients: list, subject: str, message: str) -> int:
    """
    Send a custom broadcast email to a list of email addresses.
    Returns number of recipients.
    """
    content = f"""
      <h2 style="margin:0 0 16px;color:#1a6b4a;font-size:20px;">📢 Message from AshaAssist</h2>
      <div style="background:#f8fafb;border-radius:10px;padding:20px 22px;
                  color:#1a202c;font-size:15px;line-height:1.8;white-space:pre-wrap;">
        {message}
      </div>
    """
    html = _base_template(subject, content)
    send_email(subject=subject, recipients=recipients, html_body=html)
    return len([r for r in recipients if r and '@' in str(r)])


# ---------------------------------------------------------------------------
# Template: Vaccination Due-Date Reminder (ASHA → Mother)
# ---------------------------------------------------------------------------

def send_vaccination_reminder(mother_email: str, mother_name: str,
                               child_name: str, vaccinations: list) -> bool:
    """
    Send a vaccination reminder email to a mother about due/overdue vaccines.
    vaccinations: list of dicts with keys vaccineName, dueDate, status, ageLabel.
    Returns True if dispatched.
    """
    # Colour map for status badges
    STATUS_COLORS = {
        'overdue':  ('#dc2626', '#fef2f2', '#991b1b'),
        'due':      ('#f59e0b', '#fffbeb', '#92400e'),
        'upcoming': ('#0369a1', '#f0f9ff', '#0c4a6e'),
    }

    rows = ""
    for v in vaccinations:
        border, bg, text = STATUS_COLORS.get(v.get('status', ''), ('#6b7280', '#f9fafb', '#374151'))
        due = v.get('dueDate', 'TBD')
        rows += f"""
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">
            <strong style="color:#1a202c;font-size:14px;">{v.get('vaccineName', '')}</strong>
            <div style="font-size:12px;color:#6b7280;margin-top:2px;">{v.get('ageLabel', '')}</div>
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;">
            {due}
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;">
            <span style="display:inline-block;padding:3px 10px;border-radius:20px;
                         font-size:12px;font-weight:600;background:{bg};color:{text};
                         border:1px solid {border};text-transform:capitalize;">
              {v.get('status', '')}
            </span>
          </td>
        </tr>"""

    content = f"""
      <h2 style="margin:0 0 6px;color:#1a6b4a;font-size:20px;">💉 Vaccination Reminder</h2>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">
        Dear <strong>{mother_name}</strong>, this is a reminder about upcoming vaccinations
        for your child <strong>{child_name}</strong>.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0"
             style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
        <thead>
          <tr style="background:#f0f9f4;">
            <th style="text-align:left;padding:10px 14px;color:#1a6b4a;font-size:13px;font-weight:600;">Vaccine</th>
            <th style="text-align:left;padding:10px 14px;color:#1a6b4a;font-size:13px;font-weight:600;">Due Date</th>
            <th style="text-align:center;padding:10px 14px;color:#1a6b4a;font-size:13px;font-weight:600;">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>

      <div style="background:#fff8e1;border-left:4px solid #f59e0b;padding:12px 16px;
                  border-radius:0 8px 8px 0;margin-bottom:16px;">
        <p style="margin:0;color:#78350f;font-size:13px;">
          ⚠️ Please ensure your child receives vaccinations on time. Contact your
          ASHA worker for scheduling an appointment.
        </p>
      </div>

      <p style="color:#6b7280;font-size:13px;margin-top:16px;">
        Open the AshaAssist app to view the full vaccination schedule and book a slot.
      </p>
    """

    html = _base_template("Vaccination Reminder", content)
    return send_email(
        subject=f"💉 Vaccination Reminder for {child_name} — AshaAssist",
        recipients=[mother_email],
        html_body=html
    )
