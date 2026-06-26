"""
OrcaTrading email service — powered by Resend.
Uses httpx (already a dependency) to call Resend's REST API.

Required env vars:
  RESEND_API_KEY   — your Resend API key
  FROM_EMAIL       — verified sender address, e.g. "OrcaBot Alerts <alerts@tradewithorca.com>"
  FRONTEND_URL     — e.g. "https://tradewithorca.com" (used for CTA link in email)
"""
from __future__ import annotations

import logging
import os

import httpx

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL     = os.getenv("FROM_EMAIL", "OrcaBot Alerts <alerts@tradewithorca.com>")
FRONTEND_URL   = os.getenv("FRONTEND_URL", "https://tradewithorca.com")

# Status → colour mapping (inline styles for email clients).
# Orca MC v3.0's 6-state status (alert_checker.py now reads from it directly,
# not the old 3-state ON/WATCH/OFF system).
_STATUS_COLOR = {
    "ON LONG":     "#10B981",
    "ON SHORT":    "#EF4444",
    "WATCH LONG":  "#F59E0B",
    "WATCH SHORT": "#F59E0B",
    "CAUTION":     "#F97316",
    "OFF":         "#64748B",
}


def _build_html(
    symbol: str,
    name: str,
    old_status: str,
    new_status: str,
    direction: str,
    score: int,
    market_phase: str,
) -> str:
    new_color = _STATUS_COLOR.get(new_status, "#94A3B8")
    old_color = _STATUS_COLOR.get(old_status, "#94A3B8")
    dashboard_url = f"{FRONTEND_URL}/dashboard"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OrcaBot Alert — {symbol}</title>
</head>
<body style="margin:0;padding:0;background:#0A0E17;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0E17;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#14181F;border:1px solid #1E293B;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0D1F3C,#14181F);padding:32px 40px;border-bottom:1px solid #1E293B;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;color:#00D4FF;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">OrcaBot Signal Alert</p>
                    <h1 style="margin:0;color:#FFFFFF;font-size:28px;font-weight:800;">{symbol}</h1>
                    <p style="margin:4px 0 0;color:#94A3B8;font-size:14px;">{name}</p>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <div style="display:inline-block;background:{new_color}20;border:1px solid {new_color}50;border-radius:8px;padding:8px 16px;">
                      <span style="color:{new_color};font-size:20px;font-weight:800;">{new_status}</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Signal change -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px;color:#94A3B8;font-size:14px;line-height:1.6;">
                The OrcaBot signal for <strong style="color:#FFFFFF;">{symbol}</strong> has changed.
                Here's what you need to know:
              </p>

              <!-- Status change banner -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A1628;border:1px solid #1E293B;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td align="center" style="padding:24px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:0 20px;">
                          <p style="margin:0 0 6px;color:#64748B;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Previous</p>
                          <span style="color:{old_color};font-size:22px;font-weight:800;">{old_status}</span>
                        </td>
                        <td align="center" style="padding:0 20px;color:#475569;font-size:24px;">→</td>
                        <td align="center" style="padding:0 20px;">
                          <p style="margin:0 0 6px;color:#64748B;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Now</p>
                          <span style="color:{new_color};font-size:22px;font-weight:800;">{new_status}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Details grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td width="33%" style="padding:0 6px 0 0;">
                    <div style="background:#0A1628;border:1px solid #1E293B;border-radius:10px;padding:16px;text-align:center;">
                      <p style="margin:0 0 4px;color:#64748B;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Direction</p>
                      <p style="margin:0;color:#FFFFFF;font-size:13px;font-weight:600;">{direction}</p>
                    </div>
                  </td>
                  <td width="33%" style="padding:0 3px;">
                    <div style="background:#0A1628;border:1px solid #1E293B;border-radius:10px;padding:16px;text-align:center;">
                      <p style="margin:0 0 4px;color:#64748B;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Orca Score</p>
                      <p style="margin:0;color:#FFFFFF;font-size:22px;font-weight:800;">{score}</p>
                    </div>
                  </td>
                  <td width="33%" style="padding:0 0 0 6px;">
                    <div style="background:#0A1628;border:1px solid #1E293B;border-radius:10px;padding:16px;text-align:center;">
                      <p style="margin:0 0 4px;color:#64748B;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Market Phase</p>
                      <p style="margin:0;color:#FFFFFF;font-size:13px;font-weight:600;">{market_phase}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{dashboard_url}"
                       style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#0EA5E9);color:#000000;font-weight:700;font-size:15px;text-decoration:none;padding:14px 36px;border-radius:10px;">
                      Open Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0A1628;padding:20px 40px;border-top:1px solid #1E293B;">
              <p style="margin:0;color:#475569;font-size:12px;text-align:center;">
                You're receiving this because you set an alert for <strong style="color:#64748B;">{symbol}</strong> on OrcaTrading.
                <br />
                <a href="{dashboard_url}" style="color:#00D4FF;text-decoration:none;">Manage your alerts</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


async def send_signal_alert(
    *,
    to: str,
    symbol: str,
    name: str,
    old_status: str,
    new_status: str,
    direction: str,
    score: int,
    market_phase: str,
) -> bool:
    """
    Send a signal-change alert email via Resend.
    Returns True on success, False on failure (logs but does not raise).
    """
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — skipping email alert for %s → %s", symbol, to)
        return False

    subject = f"OrcaBot Alert: {symbol} signal changed to {new_status}"
    html    = _build_html(symbol, name, old_status, new_status, direction, score, market_phase)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                RESEND_API_URL,
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from":    FROM_EMAIL,
                    "to":      [to],
                    "subject": subject,
                    "html":    html,
                },
            )
            resp.raise_for_status()
            logger.info("Alert email sent: %s → %s (%s→%s)", symbol, to, old_status, new_status)
            return True
    except Exception:
        logger.exception("Failed to send alert email for %s → %s", symbol, to)
        return False
