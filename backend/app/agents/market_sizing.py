"""Market sizing agent — single agent with structured output."""

import sys
from typing import Literal

from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.usage import UsageLimits

from app.agents.search import SOURCE_CITATION_RULES, make_search_tool, resolve_sources
from app.models.responses import (
    GrowthProjection,
    MarketSizeEstimate,
    MarketSizingResult,
    RegionalBreakdown,
)


# ── Agent-internal models ───────────────────────────────────

class FieldSource(BaseModel):
    field: str = Field(description="Field name, e.g. 'tam_current_mm', 'growth_projections[0]'")
    source_index: int = Field(description="The [SOURCE N] index from search results")
    value_found: str = Field(description="Exact short snippet from source (max 100 chars)")


class _GrowthProjection(BaseModel):
    cagr_pct: float = Field(description="CAGR as percentage")
    start_year: int
    end_year: int
    start_value_mm: float | None = Field(default=None)
    end_value_mm: float | None = Field(default=None)
    source: str | None = Field(default=None)


class _MarketSizeEstimate(BaseModel):
    value_mm: float = Field(description="Market size in millions USD")
    year: int = Field(description="Year of the estimate")
    source: str | None = Field(default=None, description="Source name")


class _RegionalBreakdown(BaseModel):
    region: str
    share_pct: float | None = Field(default=None)
    value_mm: float | None = Field(default=None)


class _MarketSizingOutput(BaseModel):
    tam_current_mm: float | None = Field(default=None, description="TAM current year in millions USD")
    tam_current_year: int | None = Field(default=None)
    tam_projected_mm: float | None = Field(default=None)
    tam_projected_year: int | None = Field(default=None)
    sam_current_mm: float | None = Field(default=None)
    growth_projections: list[_GrowthProjection] = Field(description="2-4 projections from different sources")
    market_size_estimates: list[_MarketSizeEstimate] = Field(description="Multiple estimates for cross-referencing")
    regional_breakdown: list[_RegionalBreakdown] = Field(default_factory=list)
    key_growth_drivers: list[str] = Field(description="3-5 factors driving growth")
    key_headwinds: list[str] = Field(default_factory=list)
    data_confidence: Literal["high", "medium", "low"]
    confidence_note: str | None = Field(default=None)
    sources: list[FieldSource] = Field(
        description=(
            "For EVERY data point, cite [SOURCE N] index. Include: tam_current_mm, tam_projected_mm, "
            "sam_current_mm, each growth_projection (as 'growth_projections[0]'), each market_size_estimate, "
            "regional_breakdown entries, key_growth_drivers, key_headwinds."
        )
    )


# ── Main entry point ────────────────────────────────────────

async def run_market_sizing(market: str, emit=None) -> MarketSizingResult:
    """Run the market sizing agent. Returns MarketSizingResult response model."""

    search_log: list[dict] = []

    agent = Agent(
        model="anthropic:claude-sonnet-4-6",
        output_type=_MarketSizingOutput,
        retries=3,
        system_prompt=(
            "You are a market sizing analyst. Given a market, find quantitative data from "
            "industry research firms.\n\n"
            "Your job:\n"
            "1. Find current market size (TAM) from 2-3 different sources\n"
            "2. Find growth projections (CAGR) from 2-3 different sources\n"
            "3. Find regional breakdown if available\n"
            "4. Identify growth drivers and headwinds\n\n"
            "PRIORITIZE: Gartner, Forrester, IDC, Statista (Tier 1), then Grand View Research, "
            "Mordor Intelligence, MarketsAndMarkets, Precedence Research (Tier 2).\n\n"
            "Data rules:\n"
            "- All monetary values in millions USD (750.0 for $750M, 25700.0 for $25.7B)\n"
            "- Always include the SOURCE NAME for each estimate\n"
            "- Multiple sources > precision. If Mordor says $255B and Gartner says $280B, include BOTH.\n"
            "- Include at least 2 growth_projections from different sources\n"
            "- Include at least 3 market_size_estimates from different sources/years\n"
            "- data_confidence: 'high' if 3+ tier-1 sources agree within 20%, 'medium' if sources "
            "diverge, 'low' if sparse data\n"
            "- Return null for fields without reliable data\n\n"
            "CRITICAL RULES:\n"
            "- You have a MAXIMUM of 6 searches. After 6, STOP and return results.\n"
            "- If you cannot find a data point after 1-2 searches, set it to null and MOVE ON.\n"
            "- It is BETTER to return null than to waste searches.\n"
            "- Do NOT fabricate numbers."
            + SOURCE_CITATION_RULES
        ),
        tools=[make_search_tool(search_log)],
    )

    print("  [market_sizing] Running single agent...")
    sys.stdout.flush()
    if emit:
        await emit("discovery", "running")

    result = await agent.run(
        f"Research the {market} market. Find current market size (TAM), "
        f"growth projections (CAGR) from multiple industry sources, "
        f"regional breakdown, growth drivers, and headwinds.",
        usage_limits=UsageLimits(request_limit=8),
    )

    out = result.output
    total_searches = len(search_log)

    tam_str = f"${out.tam_current_mm:,.0f}M" if out.tam_current_mm else "N/A"
    print(f"  [market_sizing] Done: TAM={tam_str}, {total_searches} searches, confidence={out.data_confidence}")
    sys.stdout.flush()
    if emit:
        await emit("discovery", "completed")
        await emit("detail", "running")
        await emit("detail", "completed")
        await emit("assembly", "running")

    sizing = MarketSizingResult(
        tam_current_mm=out.tam_current_mm,
        tam_current_year=out.tam_current_year,
        tam_projected_mm=out.tam_projected_mm,
        tam_projected_year=out.tam_projected_year,
        sam_current_mm=out.sam_current_mm,
        growth_projections=[
            GrowthProjection(
                cagr_pct=gp.cagr_pct,
                start_year=gp.start_year,
                end_year=gp.end_year,
                start_value_mm=gp.start_value_mm,
                end_value_mm=gp.end_value_mm,
                source=gp.source,
            )
            for gp in out.growth_projections
        ],
        market_size_estimates=[
            MarketSizeEstimate(
                value_mm=est.value_mm,
                year=est.year,
                source=est.source,
            )
            for est in out.market_size_estimates
        ],
        regional_breakdown=[
            RegionalBreakdown(
                region=rb.region,
                share_pct=rb.share_pct,
                value_mm=rb.value_mm,
            )
            for rb in out.regional_breakdown
        ],
        key_growth_drivers=out.key_growth_drivers,
        key_headwinds=out.key_headwinds,
        data_confidence=out.data_confidence,
        confidence_note=out.confidence_note,
    )
    if emit:
        await emit("assembly", "completed")
    return sizing
