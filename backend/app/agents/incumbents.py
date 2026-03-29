"""Incumbents research agent — multi-agent phased (discovery + detail x N + assembly)."""

import asyncio
import sys
from typing import Literal

from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.usage import UsageLimits

from app.agents.search import (
    SOURCE_CITATION_RULES,
    collect_all_sources,
    make_search_tool,
    resolve_sources,
)
from app.models.responses import Competitor


# ── Agent-internal models (not exposed via API) ─────────────

class FieldSource(BaseModel):
    field: str = Field(description="Field name this source supports, e.g. 'market_share_pct'")
    source_index: int = Field(description="The [SOURCE N] index from search results")
    value_found: str = Field(description="Exact short snippet from source (max 100 chars)")


class CompetitorSource(BaseModel):
    field: str
    value_found: str
    url: str | None = None
    title: str | None = None
    published_date: str | None = None


class DiscoveredCompetitor(BaseModel):
    name: str = Field(description="Company name, include parent in parens if subsidiary")
    market_position: Literal["leader", "challenger", "niche"]


class DiscoveryResult(BaseModel):
    competitors: list[DiscoveredCompetitor] = Field(description="4-8 established competitors")


class CompetitorDetail(BaseModel):
    description: str = Field(description="1-2 sentence description")
    key_products: list[str] = Field(description="Main products/services in this market")
    strengths: list[str] = Field(description="2-4 competitive strengths")
    weaknesses: list[str] = Field(description="2-4 competitive weaknesses")
    market_share_pct: float | None = Field(default=None)
    revenue_annual_mm: float | None = Field(default=None, description="Annual revenue in millions USD")
    revenue_arr_mm: float | None = Field(default=None, description="ARR in millions USD, SaaS only")
    pricing_model: str | None = Field(default=None)
    pricing_range: str | None = Field(default=None)
    sources: list[FieldSource] = Field(
        description="For EVERY field filled with a value, cite the [SOURCE N] index and exact snippet."
    )


# ── Agent factories ─────────────────────────────────────────

def _create_discovery_agent(search_log: list) -> Agent:
    return Agent(
        model="anthropic:claude-sonnet-4-6",
        output_type=DiscoveryResult,
        retries=2,
        system_prompt=(
            "You are a market research analyst. Given a market, identify the 4-8 most important "
            "ESTABLISHED players (incumbents). Return their names and market positions.\n\n"
            "Include parent company in parens if subsidiary (e.g. 'Ring (Amazon)').\n\n"
            "MARKET POSITION RULES:\n"
            "- 'leader': ONLY the top 2-3 companies by revenue or market share.\n"
            "- 'challenger': strong contenders but not dominant. Most competitors are challengers.\n"
            "- 'niche': specialized players focused on a segment.\n"
            "- When in doubt, use 'challenger'.\n\n"
            "COMPETITOR MIX: Include at least 2 niche or emerging players, not just the obvious top names.\n\n"
            "CRITICAL: You have a MAXIMUM of 3 searches. STOP after 3 and return results."
        ),
        tools=[make_search_tool(search_log)],
    )


def _create_detail_agent(competitor_name: str, market: str, search_log: list) -> Agent:
    return Agent(
        model="anthropic:claude-sonnet-4-6",
        output_type=CompetitorDetail,
        retries=2,
        system_prompt=(
            f"You are researching {competitor_name} as a player in the {market} market.\n\n"
            "Find their:\n"
            "- description: 1-2 sentences about who they are\n"
            "- key_products: main products/services in this market\n"
            "- strengths: 2-4 competitive advantages\n"
            "- weaknesses: 2-4 competitive disadvantages\n"
            "- market_share_pct: as float (29.0 for 29%). null if no data.\n"
            "- revenue_annual_mm: annual revenue in millions USD. null if unknown.\n"
            "- revenue_arr_mm: ARR in millions USD (SaaS only). null if not applicable.\n"
            "- pricing_model: how they charge (per-seat, freemium, etc.)\n"
            "- pricing_range: price string e.g. '$10-$39/user/month'. null if unknown.\n\n"
            "CRITICAL: You have EXACTLY 2 searches. Return null for anything you can't find. "
            "Do NOT keep searching."
            + SOURCE_CITATION_RULES
        ),
        tools=[make_search_tool(search_log)],
    )


# ── Main entry point ────────────────────────────────────────

async def run_incumbents(market: str, emit=None) -> list[Competitor]:
    """Run the 3-phase incumbents analysis. Returns list of Competitor response models."""

    all_log_lists: list[list[dict]] = []

    # ── Phase 1: Discovery ──
    print("  [incumbents] Phase 1: Discovery...")
    sys.stdout.flush()
    if emit:
        await emit("discovery", "running")

    discovery_log: list[dict] = []
    discovery_agent = _create_discovery_agent(discovery_log)

    discovery_result = await discovery_agent.run(
        f"Identify the 4-8 most important established players in the {market} market.",
        usage_limits=UsageLimits(request_limit=5),
    )
    discovered = discovery_result.output.competitors
    all_log_lists.append(discovery_log)

    print(f"  [incumbents] Phase 1 complete: {len(discovered)} competitors found")
    for dc in discovered:
        print(f"    - {dc.name} [{dc.market_position}]")
    sys.stdout.flush()
    if emit:
        await emit("discovery", "completed")

    # ── Phase 2: Detail agents in parallel ──
    print(f"  [incumbents] Phase 2: Researching {len(discovered)} competitors in parallel...")
    sys.stdout.flush()
    if emit:
        await emit("detail", "running")

    async def research_one(dc: DiscoveredCompetitor):
        detail_log: list[dict] = []
        agent = _create_detail_agent(dc.name, market, detail_log)
        prompt = (
            f"Research {dc.name} in the {market} market. "
            f"Find their products, strengths, weaknesses, market share, revenue, ARR, and pricing."
        )
        result = await agent.run(prompt, usage_limits=UsageLimits(request_limit=4))
        return dc, result.output, detail_log

    tasks = [research_one(dc) for dc in discovered]
    detail_results = await asyncio.gather(*tasks, return_exceptions=True)

    if emit:
        await emit("detail", "completed")

    # ── Phase 3: Assembly with source resolution ──
    print("  [incumbents] Phase 3: Assembling...")
    sys.stdout.flush()
    if emit:
        await emit("assembly", "running")

    competitors: list[Competitor] = []
    for item in detail_results:
        if isinstance(item, Exception):
            print(f"    ERROR: {item}")
            continue
        dc, detail, log = item
        all_log_lists.append(log)

        resolved = resolve_sources(detail.sources, log)

        competitors.append(
            Competitor(
                name=dc.name,
                description=detail.description,
                market_position=dc.market_position,
                key_products=detail.key_products,
                strengths=detail.strengths,
                weaknesses=detail.weaknesses,
                market_share_pct=detail.market_share_pct,
                revenue_annual_mm=detail.revenue_annual_mm,
                revenue_arr_mm=detail.revenue_arr_mm,
                pricing_model=detail.pricing_model,
                pricing_range=detail.pricing_range,
            )
        )

    if emit:
        await emit("assembly", "completed")

    total_searches = sum(len(log) for log in all_log_lists)
    print(f"  [incumbents] Done: {len(competitors)} competitors, {total_searches} total searches")
    sys.stdout.flush()

    return competitors
