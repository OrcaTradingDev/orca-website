from __future__ import annotations

import os
import logging
from datetime import datetime, timezone

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.db import get_db
from app.models.user import User
from app.schemas.subscription import SubscriptionStatus

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
      3. Select events: checkout.session.completed, customer.subscription.updated,
         customer.subscription.deleted
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
        # Needed later to cancel the subscription (subscription id) and to
        # match subscription.* webhook events back to this user (they carry
        # a customer id, not an email).
        stripe_customer_id = session.get("customer")
        stripe_subscription_id = session.get("subscription")
        log.info("Granting screener_access to %s", customer_email)

        result = await db.execute(
            update(User)
            .where(User.email == customer_email)
            .values(
                screener_access=True,
                stripe_customer_id=stripe_customer_id,
                stripe_subscription_id=stripe_subscription_id,
                subscription_cancel_at_period_end=False,
            )
            .returning(User.id)
        )
        await db.commit()
        matched = result.fetchone()

        if matched is None:
            log.warning("Payment from %s but no matching user found", customer_email)
        else:
            log.info("screener_access granted to user id=%s (%s)", matched[0], customer_email)

    elif event["type"] == "customer.subscription.updated":
        sub = event["data"]["object"]
        await _sync_subscription_state(db, sub)

    elif event["type"] == "customer.subscription.deleted":
        sub = event["data"]["object"]
        customer_id = sub.get("customer")
        if not customer_id:
            log.warning("customer.subscription.deleted received with no customer id")
            return {"status": "ok", "note": "no customer id"}

        result = await db.execute(
            update(User)
            .where(User.stripe_customer_id == customer_id)
            .values(
                screener_access=False,
                stripe_subscription_id=None,
                subscription_cancel_at_period_end=False,
                subscription_current_period_end=None,
            )
            .returning(User.id)
        )
        await db.commit()
        matched = result.fetchone()
        if matched is None:
            log.warning("subscription.deleted for unknown customer %s", customer_id)
        else:
            log.info("screener_access revoked for user id=%s (subscription ended)", matched[0])

    return {"status": "ok"}


async def _sync_subscription_state(db: AsyncSession, sub: dict) -> None:
    """Mirror a Stripe Subscription object's cancel/period-end state onto the matching user."""
    customer_id = sub.get("customer")
    if not customer_id:
        log.warning("subscription event received with no customer id")
        return

    period_end_ts = sub.get("current_period_end")
    period_end = (
        datetime.fromtimestamp(period_end_ts, tz=timezone.utc) if period_end_ts else None
    )

    result = await db.execute(
        update(User)
        .where(User.stripe_customer_id == customer_id)
        .values(
            stripe_subscription_id=sub.get("id"),
            subscription_cancel_at_period_end=bool(sub.get("cancel_at_period_end")),
            subscription_current_period_end=period_end,
        )
        .returning(User.id)
    )
    await db.commit()
    matched = result.fetchone()
    if matched is None:
        log.warning("subscription.updated for unknown customer %s", customer_id)


@router.get("/subscription-status", response_model=SubscriptionStatus)
async def get_subscription_status(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> SubscriptionStatus:
    """Current user's subscription state, for the billing page — read from our
    own DB (kept in sync via the webhook above), no live Stripe call needed."""
    result = await db.execute(
        select(
            User.stripe_subscription_id,
            User.subscription_cancel_at_period_end,
            User.subscription_current_period_end,
        ).where(User.google_sub == current_user["sub"])
    )
    row = result.first()
    if row is None:
        raise HTTPException(status_code=404, detail="User not found")

    sub_id, cancel_at_period_end, period_end = row
    return SubscriptionStatus(
        has_subscription=sub_id is not None,
        cancel_at_period_end=bool(cancel_at_period_end),
        current_period_end=period_end.isoformat() if period_end else None,
    )


@router.post("/cancel-subscription", response_model=SubscriptionStatus)
async def cancel_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> SubscriptionStatus:
    """
    Cancel the current user's subscription at the end of the current billing
    period (not immediately) — they keep access through what they already
    paid for, billing just stops renewing. Stripe's customer.subscription.updated
    webhook will fire from this call too and re-sync the same state; this
    endpoint also updates the DB directly so the response is immediate.
    """
    result = await db.execute(
        select(User.id, User.stripe_subscription_id).where(User.google_sub == current_user["sub"])
    )
    row = result.first()
    if row is None:
        raise HTTPException(status_code=404, detail="User not found")

    user_id, sub_id = row
    if not sub_id:
        raise HTTPException(status_code=400, detail="No active subscription found")

    try:
        sub = stripe.Subscription.modify(sub_id, cancel_at_period_end=True)
    except stripe.error.StripeError as e:
        log.exception("Stripe cancel failed for user id=%s, subscription=%s", user_id, sub_id)
        raise HTTPException(status_code=502, detail=f"Stripe error: {e.user_message or str(e)}")

    period_end_ts = sub.get("current_period_end")
    period_end = datetime.fromtimestamp(period_end_ts, tz=timezone.utc) if period_end_ts else None

    await db.execute(
        update(User)
        .where(User.id == user_id)
        .values(
            subscription_cancel_at_period_end=True,
            subscription_current_period_end=period_end,
        )
    )
    await db.commit()
    log.info("Subscription %s set to cancel at period end for user id=%s", sub_id, user_id)

    return SubscriptionStatus(
        has_subscription=True,
        cancel_at_period_end=True,
        current_period_end=period_end.isoformat() if period_end else None,
    )
