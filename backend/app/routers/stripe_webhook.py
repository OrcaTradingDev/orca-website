from __future__ import annotations

import os
import logging

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.user import User

log = logging.getLogger(__name__)

router = APIRouter(prefix="/stripe", tags=["stripe"])

STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Stripe sends POST requests here after checkout events.

    Setup steps on Stripe Dashboard:
      1. Go to Developers → Webhooks → Add endpoint
      2. Endpoint URL: https://<your-api-domain>/stripe/webhook
      3. Select event: checkout.session.completed
      4. Copy the signing secret into env var STRIPE_WEBHOOK_SECRET
      5. Set the success_url on your payment link to:
         https://<your-frontend-domain>/screener?upgraded=1
    """
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    if not STRIPE_WEBHOOK_SECRET:
        log.error("STRIPE_WEBHOOK_SECRET not set — cannot verify webhook")
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]

        # Stripe puts the buyer's email in customer_details.email
        customer_email: str | None = (
            (session.get("customer_details") or {}).get("email")
            or session.get("customer_email")
        )

        if not customer_email:
            log.warning("checkout.session.completed received but no customer email found")
            return {"status": "ok", "note": "no email"}

        customer_email = customer_email.strip().lower()
        log.info("Granting screener_access to %s", customer_email)

        result = await db.execute(
            update(User)
            .where(User.email == customer_email)
            .values(screener_access=True)
            .returning(User.id)
        )
        await db.commit()
        matched = result.fetchone()

        if matched is None:
            log.warning("Payment from %s but no matching user found", customer_email)
        else:
            log.info("screener_access granted to user id=%s (%s)", matched[0], customer_email)

    return {"status": "ok"}
