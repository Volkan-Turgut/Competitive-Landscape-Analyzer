"""Synthesis agent — researches the input company, then cross-references with market research."""

import sys

from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.usage import UsageLimits
from typing import Literal

from app.agents.search import SOURCE_CITATION_RULES, make_search_tool
from app.models.responses import (
    AnalysisResults,
    Verdict,
    VerdictFactor,
)


# ── Agent-internal models ───────────────────────────────────

class FieldSource(BaseModel):
    field: str
    source_index: int
    value_found: str


class _VerdictFactor(BaseModel):
    factor: str
    assessment: str
    signal: Literal["positive", "negative", "neutral"]


class SynthesisOutput(BaseModel):
    verdict: Literal["GO", "NO-GO"]
    confidence: float = Field(ge=0.0, le=1.0)
    summary: str
    factors: list[_VerdictFactor] = Field(default_factory=list)
    sources: list[FieldSource] = Field(
        description="Cite [SOURCE N] for any company research data used in the assessment."
    )


# ── Main entry point ────────────────────────────────────────

async def run_synthesis(
    company: str,
    market: str,
    research_results: AnalysisResults,
    emit=None,
) -> Verdict:
    """Research the input company via web search, then cross-reference against
    all three research outputs to produce a Go/No-Go verdict."""

    search_log: list[dict] = []

    # Build context string from research results
    context_parts = []

    if research_results.incumbents:
        inc_lines = []
        for c in research_results.incumbents:
            share = f"{c.market_share_pct}%" if c.market_share_pct else "N/A"
            rev = f"${c.revenue_annual_mm:,.0f}M" if c.revenue_annual_mm else "N/A"
            inc_lines.append(f"  - {c.name} [{c.market_position}]: share={share}, revenue={rev}")
        context_parts.append("INCUMBENTS:\n" + "\n".join(inc_lines))

    if research_results.emerging_competitors:
        em_lines = []
        for e in research_results.emerging_competitors:
            funding = f"${e.total_funding_mm:.0f}M" if e.total_funding_mm else "N/A"
            stage = e.latest_round.stage if e.latest_round else "?"
            em_lines.append(f"  - {e.name} ({stage}, {funding} total)")
        context_parts.append("EMERGING COMPETITORS:\n" + "\n".join(em_lines))

    if research_results.capital_flow:
        cf = research_results.capital_flow
        cf_lines = [
            f"  Total funding (2yr): ${cf.total_funding_last_2_years_mm:,.0f}M" if cf.total_funding_last_2_years_mm else "  Total funding: N/A",
            f"  Deal count (2yr): {cf.deal_count_last_2_years}" if cf.deal_count_last_2_years else "  Deal count: N/A",
            f"  YoY change: {cf.yoy_funding_change_pct}%" if cf.yoy_funding_change_pct else "  YoY change: N/A",
            f"  Signal: {cf.capital_velocity_signal}" if cf.capital_velocity_signal else "",
        ]
        context_parts.append("CAPITAL FLOW:\n" + "\n".join(line for line in cf_lines if line))

    if research_results.market_sizing:
        ms = research_results.market_sizing
        tam = f"${ms.tam_current_mm:,.0f}M ({ms.tam_current_year})" if ms.tam_current_mm else "N/A"
        proj = f"${ms.tam_projected_mm:,.0f}M ({ms.tam_projected_year})" if ms.tam_projected_mm else "N/A"
        cagrs = ", ".join(
            f"{gp.cagr_pct}% ({gp.source})" for gp in ms.growth_projections if gp.source
        )
        ms_lines = [
            f"  TAM: {tam} → {proj}",
            f"  CAGR: {cagrs}" if cagrs else "",
            f"  Confidence: {ms.data_confidence}",
        ]
        context_parts.append("MARKET SIZING:\n" + "\n".join(line for line in ms_lines if line))

    research_context = "\n\n".join(context_parts)

    agent = Agent(
        model="anthropic:claude-sonnet-4-6",
        output_type=SynthesisOutput,
        retries=2,
        system_prompt=(
            f"You are a strategic analyst evaluating whether {company} should enter the {market} market.\n\n"
            "YOUR TWO-PHASE JOB:\n\n"
            "PHASE 1 — COMPANY RESEARCH:\n"
            f"Search the web to understand {company}:\n"
            "- Current products and services\n"
            "- Revenue and financial position\n"
            "- Team size and technical capabilities\n"
            "- Recent strategic moves and announcements\n"
            "- Existing market position and brand strength\n\n"
            "PHASE 2 — CROSS-REFERENCE & VERDICT:\n"
            "Compare the company profile against the market research below and evaluate:\n"
            "- Does the company have the technical capabilities to compete?\n"
            "- Is the market large enough and growing fast enough?\n"
            "- How strong are the incumbents? Is there white space?\n"
            "- What's the capital flow signal — is this market heating up or cooling?\n"
            "- What are the specific risks and opportunities for THIS company?\n\n"
            "Return a GO or NO-GO verdict with confidence (0.0-1.0) and 4-6 factors.\n"
            "Each factor should have a clear assessment and signal (positive/negative/neutral).\n\n"
            f"MARKET RESEARCH RESULTS:\n{research_context}\n\n"
            "CRITICAL: You have a MAXIMUM of 4 searches for company research. "
            "Focus on the most important company facts."
            + SOURCE_CITATION_RULES
        ),
        tools=[make_search_tool(search_log)],
    )

    print(f"  [synthesis] Researching {company} and evaluating market fit...")
    sys.stdout.flush()
    if emit:
        await emit("company_research", "running")

    result = await agent.run(
        f"Research {company} and evaluate whether they should enter the {market} market. "
        f"First search for company information, then cross-reference with the market research data.",
        usage_limits=UsageLimits(request_limit=15),
    )

    out = result.output
    print(f"  [synthesis] Done: {out.verdict} (confidence={out.confidence}), {len(search_log)} searches")
    sys.stdout.flush()
    if emit:
        await emit("company_research", "completed")
        await emit("cross_reference", "running")

    verdict = Verdict(
        verdict=out.verdict,
        confidence=out.confidence,
        summary=out.summary,
        factors=[
            VerdictFactor(factor=f.factor, assessment=f.assessment, signal=f.signal)
            for f in out.factors
        ],
    )
    if emit:
        await emit("cross_reference", "completed")
    return verdict
