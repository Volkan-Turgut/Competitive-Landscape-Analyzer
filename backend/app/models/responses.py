from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

from .workflow import WorkflowManifest


# ── Incumbents ──────────────────────────────────────────────

class Competitor(BaseModel):
    name: str
    description: str
    market_position: Literal["leader", "challenger", "niche"]
    key_products: list[str] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    market_share_pct: float | None = None
    revenue_annual_mm: float | None = None
    revenue_arr_mm: float | None = None
    pricing_model: str | None = None
    pricing_range: str | None = None


# ── Emerging Competitors ────────────────────────────────────

class FundingRound(BaseModel):
    stage: Literal["pre-seed", "seed", "series-a", "series-b", "unknown"]
    amount_mm: float | None = None
    date: str | None = None
    lead_investors: list[str] = Field(default_factory=list)
    valuation_mm: float | None = None


class EmergingCompetitor(BaseModel):
    name: str
    description: str
    founded_year: int | None = None
    headquarters: str | None = None
    total_funding_mm: float | None = None
    latest_round: FundingRound | None = None
    key_differentiator: str | None = None
    employee_count: int | None = None


class CapitalFlow(BaseModel):
    total_funding_last_2_years_mm: float | None = None
    deal_count_last_2_years: int | None = None
    average_deal_size_mm: float | None = None
    yoy_funding_change_pct: float | None = None
    top_investors: list[str] = Field(default_factory=list)
    capital_velocity_signal: Literal["accelerating", "steady", "decelerating", "nascent"] | None = None


# ── Market Sizing ───────────────────────────────────────────

class GrowthProjection(BaseModel):
    cagr_pct: float | None = None
    start_year: int | None = None
    end_year: int | None = None
    start_value_mm: float | None = None
    end_value_mm: float | None = None
    source: str | None = None


class MarketSizeEstimate(BaseModel):
    value_mm: float | None = None
    year: int | None = None
    source: str | None = None


class RegionalBreakdown(BaseModel):
    region: str
    share_pct: float | None = None
    value_mm: float | None = None


class MarketSizingResult(BaseModel):
    tam_current_mm: float | None = None
    tam_current_year: int | None = None
    tam_projected_mm: float | None = None
    tam_projected_year: int | None = None
    sam_current_mm: float | None = None
    growth_projections: list[GrowthProjection] = Field(default_factory=list)
    market_size_estimates: list[MarketSizeEstimate] = Field(default_factory=list)
    regional_breakdown: list[RegionalBreakdown] = Field(default_factory=list)
    key_growth_drivers: list[str] = Field(default_factory=list)
    key_headwinds: list[str] = Field(default_factory=list)
    data_confidence: Literal["high", "medium", "low"] | None = None
    confidence_note: str | None = None


# ── Synthesis / Verdict ─────────────────────────────────────

class VerdictFactor(BaseModel):
    factor: str
    assessment: str
    signal: Literal["positive", "negative", "neutral"]


class Verdict(BaseModel):
    verdict: Literal["GO", "NO-GO"]
    confidence: float = Field(ge=0.0, le=1.0)
    summary: str
    factors: list[VerdictFactor] = Field(default_factory=list)


# ── Combined Results ────────────────────────────────────────

class AnalysisResults(BaseModel):
    incumbents: list[Competitor] = Field(default_factory=list)
    emerging_competitors: list[EmergingCompetitor] = Field(default_factory=list)
    capital_flow: CapitalFlow | None = None
    market_sizing: MarketSizingResult | None = None
    verdict: Verdict | None = None


# ── Top-level API Response ──────────────────────────────────

class AnalysisResponse(BaseModel):
    id: str
    status: Literal["pending", "running", "complete", "failed"]
    company: str
    market: str
    workflow: WorkflowManifest | None = None
    agent_statuses: dict[str, str] = Field(default_factory=dict)
    agent_sub_phases: dict[str, dict[str, str]] = Field(default_factory=dict)
    results: Any = None
