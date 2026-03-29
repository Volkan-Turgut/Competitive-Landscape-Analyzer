"""Emerging competitors agent — multi-agent 4-phase (discovery + detail x N + capital flow + assembly)."""

import asyncio
import sys
from typing import Literal

from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.usage import UsageLimits

from app.agents.search import (
    SOURCE_CITATION_RULES,
    make_search_tool,
    resolve_sources,
)
from app.models.responses import CapitalFlow, EmergingCompetitor, FundingRound


# ── Agent-internal models ───────────────────────────────────

class FieldSource(BaseModel):
    field: str = Field(description="Field name this source supports")
    source_index: int = Field(description="The [SOURCE N] index from search results")
    value_found: str = Field(description="Exact short snippet from source (max 100 chars)")


class DiscoveryResult(BaseModel):
    startup_names: list[str] = Field(description="5-8 recently funded startup names (Seed to Series B)")


class _FundingRound(BaseModel):
    stage: Literal["pre-seed", "seed", "series-a", "series-b", "unknown"] = Field(description="Funding stage")
    amount_mm: float | None = Field(default=None, description="Amount raised in millions USD")
    date: str | None = Field(default=None, description="Date of the round")
    lead_investors: list[str] = Field(default_factory=list)
    valuation_mm: float | None = Field(default=None, description="Post-money valuation in millions USD")


class EmergingCompetitorDetail(BaseModel):
    name: str = Field(description="Company name")
    description: str = Field(description="1-2 sentence description")
    founded_year: int | None = Field(default=None)
    headquarters: str | None = Field(default=None)
    total_funding_mm: float | None = Field(default=None)
    latest_round: _FundingRound | None = Field(default=None)
    key_differentiator: str | None = Field(default=None)
    employee_count: int | None = Field(default=None)
    sources: list[FieldSource] = Field(
        description="For EVERY field filled, cite [SOURCE N] index."
    )


class CapitalFlowSummary(BaseModel):
    total_funding_last_2_years_mm: float | None = Field(default=None)
    deal_count_last_2_years: int | None = Field(default=None)
    average_deal_size_mm: float | None = Field(default=None)
    yoy_funding_change_pct: float | None = Field(default=None)
    top_investors: list[str] = Field(default_factory=list)
    capital_velocity_signal: Literal["accelerating", "steady", "decelerating", "nascent"]
    sources: list[FieldSource] = Field(
        description="For EVERY field filled, cite [SOURCE N] index and snippet."
    )


# ── Agent factories ─────────────────────────────────────────

def _create_discovery_agent(market: str, exclude_incumbents: list[str], search_log: list) -> Agent:
    exclude_str = ", ".join(exclude_incumbents)
    return Agent(
        model="anthropic:claude-sonnet-4-6",
        output_type=DiscoveryResult,
        retries=2,
        system_prompt=(
            f"You are a venture capital analyst researching NEW entrants in the {market} market.\n\n"
            f"Find 5-8 recently funded STARTUPS (Seed through Series B) in this space.\n\n"
            f"EXCLUDE these established incumbents — they are NOT new entrants:\n"
            f"  {exclude_str}\n\n"
            "Focus on:\n"
            "- Companies that raised Seed, Series A, or Series B in the last 2 years\n"
            "- New entrants disrupting the market, not established players\n"
            "- Return ONLY the startup names, nothing else\n\n"
            "CRITICAL: You have a MAXIMUM of 3 searches. STOP after 3 and return results."
        ),
        tools=[make_search_tool(search_log)],
    )


def _create_detail_agent(startup_name: str, market: str, search_log: list) -> Agent:
    return Agent(
        model="anthropic:claude-sonnet-4-6",
        output_type=EmergingCompetitorDetail,
        retries=2,
        system_prompt=(
            f"You are researching the startup {startup_name} in the {market} market.\n\n"
            "Find:\n"
            "- description: 1-2 sentences about what they do\n"
            "- founded_year: year founded. null if unknown.\n"
            "- headquarters: HQ location. null if unknown.\n"
            "- total_funding_mm: total funding raised in millions USD. null if unknown.\n"
            "- latest_round: most recent funding round (stage, amount, date, lead investors, valuation)\n"
            "- key_differentiator: what makes them different from incumbents, 1 sentence\n"
            "- employee_count: approximate headcount. null if unknown.\n\n"
            "For latest_round.stage use: 'pre-seed', 'seed', 'series-a', 'series-b', or 'unknown'.\n"
            "For amounts, use millions USD as float (e.g. 60.0 for $60M).\n\n"
            "CRITICAL: You have EXACTLY 2 searches. Return null for anything you cannot find."
            + SOURCE_CITATION_RULES
        ),
        tools=[make_search_tool(search_log)],
    )


def _create_capital_flow_agent(market: str, search_log: list) -> Agent:
    return Agent(
        model="anthropic:claude-sonnet-4-6",
        output_type=CapitalFlowSummary,
        retries=2,
        system_prompt=(
            f"You are a venture capital analyst summarizing funding trends in the {market} market.\n\n"
            "Find:\n"
            "- total_funding_last_2_years_mm: total VC funding in last 2 years, in millions USD\n"
            "- deal_count_last_2_years: number of funding deals in last 2 years\n"
            "- average_deal_size_mm: average deal size in millions USD\n"
            "- yoy_funding_change_pct: year-over-year change as percentage\n"
            "- top_investors: 3-5 most active VCs in this space\n"
            "- capital_velocity_signal: 'accelerating', 'steady', 'decelerating', or 'nascent'\n\n"
            "Return null for any field without reliable data.\n\n"
            "CRITICAL: You have a MAXIMUM of 3 searches. STOP after 3 and return results."
            + SOURCE_CITATION_RULES
        ),
        tools=[make_search_tool(search_log)],
    )


# ── Main entry point ────────────────────────────────────────

async def run_emerging(
    market: str, exclude_incumbents: list[str], emit=None
) -> tuple[list[EmergingCompetitor], CapitalFlow]:
    """Run the 4-phase emerging competitors analysis.
    Returns (list[EmergingCompetitor], CapitalFlow) response models.
    """

    all_log_lists: list[list[dict]] = []

    # ── Phase 1: Discovery ──
    print("  [emerging] Phase 1: Discovering startups...")
    sys.stdout.flush()
    if emit:
        await emit("discovery", "running")

    discovery_log: list[dict] = []
    disc_agent = _create_discovery_agent(market, exclude_incumbents, discovery_log)
    disc_result = await disc_agent.run(
        f"Find 5-8 recently funded startups (Seed to Series B) in the {market} market.",
        usage_limits=UsageLimits(request_limit=5),
    )
    startup_names = disc_result.output.startup_names
    all_log_lists.append(discovery_log)

    print(f"  [emerging] Phase 1 complete: {len(startup_names)} startups found")
    for name in startup_names:
        print(f"    - {name}")
    sys.stdout.flush()
    if emit:
        await emit("discovery", "completed")

    # ── Phase 2: Detail agents in parallel ──
    print(f"  [emerging] Phase 2: Researching {len(startup_names)} startups in parallel...")
    sys.stdout.flush()
    if emit:
        await emit("detail", "running")

    async def research_one(name: str):
        detail_log: list[dict] = []
        agent = _create_detail_agent(name, market, detail_log)
        result = await agent.run(
            f"Research the startup {name} in the {market} market. "
            f"Find their funding, founding year, HQ, employees, and key differentiator.",
            usage_limits=UsageLimits(request_limit=4),
        )
        return result.output, detail_log

    tasks = [research_one(name) for name in startup_names]
    detail_results = await asyncio.gather(*tasks, return_exceptions=True)

    emerging_competitors: list[EmergingCompetitor] = []
    for i, item in enumerate(detail_results):
        if isinstance(item, Exception):
            print(f"    ERROR for {startup_names[i]}: {item}")
            continue
        detail, log = item
        all_log_lists.append(log)

        # Convert internal FundingRound to response FundingRound
        latest_round = None
        if detail.latest_round:
            latest_round = FundingRound(
                stage=detail.latest_round.stage,
                amount_mm=detail.latest_round.amount_mm,
                date=detail.latest_round.date,
                lead_investors=detail.latest_round.lead_investors,
                valuation_mm=detail.latest_round.valuation_mm,
            )

        emerging_competitors.append(
            EmergingCompetitor(
                name=detail.name,
                description=detail.description,
                founded_year=detail.founded_year,
                headquarters=detail.headquarters,
                total_funding_mm=detail.total_funding_mm,
                latest_round=latest_round,
                key_differentiator=detail.key_differentiator,
                employee_count=detail.employee_count,
            )
        )

    print(f"  [emerging] Phase 2 complete: {len(emerging_competitors)} detailed")
    sys.stdout.flush()

    # ── Phase 3: Capital Flow ──
    print("  [emerging] Phase 3: Analyzing capital flow...")
    sys.stdout.flush()

    cf_log: list[dict] = []
    cf_agent = _create_capital_flow_agent(market, cf_log)
    cf_result = await cf_agent.run(
        f"Analyze VC funding trends and capital velocity in the {market} market over the last 2 years.",
        usage_limits=UsageLimits(request_limit=5),
    )
    cf = cf_result.output
    all_log_lists.append(cf_log)

    print(f"  [emerging] Phase 3 complete: signal={cf.capital_velocity_signal}")
    sys.stdout.flush()
    if emit:
        await emit("detail", "completed")
        await emit("assembly", "running")

    capital_flow = CapitalFlow(
        total_funding_last_2_years_mm=cf.total_funding_last_2_years_mm,
        deal_count_last_2_years=cf.deal_count_last_2_years,
        average_deal_size_mm=cf.average_deal_size_mm,
        yoy_funding_change_pct=cf.yoy_funding_change_pct,
        top_investors=cf.top_investors,
        capital_velocity_signal=cf.capital_velocity_signal,
    )

    if emit:
        await emit("assembly", "completed")

    total_searches = sum(len(log) for log in all_log_lists)
    print(f"  [emerging] Done: {len(emerging_competitors)} startups, {total_searches} total searches")
    sys.stdout.flush()

    return emerging_competitors, capital_flow
