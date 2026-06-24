"""create market_orca_mc_latest — Orca MC v3.0 engine port (Phase A, no POI)

Revision ID: a8b9c0d1e2f3
Revises: f7a8b9c0d1e2
Create Date: 2026-06-24

One row per symbol. Port of the founder's TradingView "OrcaTrading Market
Conditions v3.0" Pine Script. POI/zone-engine fields are deliberately not
included yet (poi_pending flags this) — see app/domain/orca_mc.py.
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "a8b9c0d1e2f3"
down_revision = "f7a8b9c0d1e2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "market_orca_mc_latest",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("symbol", sa.Text(), nullable=False),

        # boolean chain — cheap to store, makes Pine-parity debugging tractable
        sa.Column("htf_bull", sa.Boolean(), nullable=True),
        sa.Column("htf_bear", sa.Boolean(), nullable=True),
        sa.Column("htf_neut", sa.Boolean(), nullable=True),
        sa.Column("ltf_bull", sa.Boolean(), nullable=True),
        sa.Column("ltf_bear", sa.Boolean(), nullable=True),
        sa.Column("ema_full_bull", sa.Boolean(), nullable=True),
        sa.Column("ema_full_bear", sa.Boolean(), nullable=True),
        sa.Column("ema_flat", sa.Boolean(), nullable=True),
        sa.Column("adx_strong", sa.Boolean(), nullable=True),
        sa.Column("adx_very_strong", sa.Boolean(), nullable=True),
        sa.Column("adx_rising", sa.Boolean(), nullable=True),
        sa.Column("adx_falling", sa.Boolean(), nullable=True),
        sa.Column("di_conf_bull", sa.Boolean(), nullable=True),
        sa.Column("di_conf_bear", sa.Boolean(), nullable=True),
        sa.Column("di_sep", sa.Float(), nullable=True),
        sa.Column("atr_exp", sa.Boolean(), nullable=True),
        sa.Column("vol_extreme", sa.Boolean(), nullable=True),
        sa.Column("vol_compr", sa.Boolean(), nullable=True),
        sa.Column("vol_state", sa.Text(), nullable=True),
        sa.Column("clean_candles", sa.Boolean(), nullable=True),
        sa.Column("choppy_candles", sa.Boolean(), nullable=True),
        sa.Column("body_ratio", sa.Float(), nullable=True),
        sa.Column("recent_overlap", sa.Integer(), nullable=True),

        # market phase
        sa.Column("phase", sa.Text(), nullable=True),
        sa.Column("trend_struct", sa.Text(), nullable=True),
        sa.Column("pb_status", sa.Text(), nullable=True),
        sa.Column("is_exhaustion", sa.Boolean(), nullable=True),
        sa.Column("is_expansion", sa.Boolean(), nullable=True),
        sa.Column("is_cont", sa.Boolean(), nullable=True),
        sa.Column("is_pb", sa.Boolean(), nullable=True),
        sa.Column("is_comp_final", sa.Boolean(), nullable=True),
        sa.Column("is_chop", sa.Boolean(), nullable=True),

        # MTF alignment
        sa.Column("mtf_bull_count", sa.Integer(), nullable=True),
        sa.Column("mtf_bear_count", sa.Integer(), nullable=True),
        sa.Column("mtf_align_str", sa.Text(), nullable=True),

        # orca score breakdown
        sa.Column("p_htf", sa.Integer(), nullable=True),
        sa.Column("p_adx", sa.Integer(), nullable=True),
        sa.Column("p_ema", sa.Integer(), nullable=True),
        sa.Column("p_phase", sa.Integer(), nullable=True),
        sa.Column("p_vol", sa.Integer(), nullable=True),
        sa.Column("orca_score", sa.Integer(), nullable=True),
        sa.Column("score_qual", sa.Text(), nullable=True),

        # orcabot status
        sa.Column("orca_status", sa.Text(), nullable=True),
        sa.Column("pref_dir", sa.Text(), nullable=True),
        sa.Column("status_since", sa.DateTime(timezone=True), nullable=True),

        # next-trigger checklist
        sa.Column("trig_c1", sa.Boolean(), nullable=True),
        sa.Column("trig_c2", sa.Boolean(), nullable=True),
        sa.Column("trig_c3", sa.Boolean(), nullable=True),
        sa.Column("trig_c4", sa.Boolean(), nullable=True),
        sa.Column("trig_met_count", sa.Integer(), nullable=True),
        sa.Column("trig_result", sa.Text(), nullable=True),

        # suitability + confidence
        sa.Column("suitability", sa.Text(), nullable=True),
        sa.Column("suit_reason", sa.Text(), nullable=True),
        sa.Column("act_conf", sa.Integer(), nullable=True),
        sa.Column("conf_tier", sa.Text(), nullable=True),

        # readiness
        sa.Column("readiness", sa.Integer(), nullable=True),
        sa.Column("ready_tier", sa.Text(), nullable=True),
        sa.Column("ready_reason", sa.Text(), nullable=True),
        sa.Column("expected_next", sa.Text(), nullable=True),

        # why + timeline
        sa.Column("why_bullets", sa.JSON(), nullable=True),
        sa.Column("opportunity_timeline", sa.JSON(), nullable=True),

        # bookkeeping
        sa.Column("ltf_last_timestamp", sa.DateTime(timezone=True), nullable=True),
        sa.Column("htf_last_timestamp", sa.DateTime(timezone=True), nullable=True),
        sa.Column("poi_pending", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),

        sa.UniqueConstraint("symbol", name="uq_orca_mc_latest_symbol"),
    )
    op.create_index("ix_orca_mc_latest_symbol", "market_orca_mc_latest", ["symbol"])


def downgrade() -> None:
    op.drop_index("ix_orca_mc_latest_symbol", table_name="market_orca_mc_latest")
    op.drop_table("market_orca_mc_latest")
