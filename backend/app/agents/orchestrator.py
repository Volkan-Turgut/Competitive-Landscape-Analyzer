"""Orchestrator — runs the DAG: parallel research agents then sequential synthesis."""

import asyncio
import json
import sys
import time
from datetime import datetime, timezone
from typing import Callable, Awaitable

from app.agents.incumbents import run_incumbents
from app.agents.emerging import run_emerging
from app.agents.market_sizing import run_market_sizing
from app.agents.synthesis import run_synthesis
from app.core.events import get_queue
from app.models.responses import AnalysisResults
from app.services.analysis import complete_analysis, update_agent_status, update_sub_phase

# Type alias for the emit callback agents receive
EmitFn = Callable[[str, str], Awaitable[None]]


async def _emit(analysis_id: str, event: str, data: dict) -> None:
    """Push an SSE event to the analysis queue."""
    queue = get_queue(analysis_id)
    if queue:
        await queue.put({"event": event, "data": json.dumps(data)})


def _make_agent_emitter(analysis_id: str, agent_id: str) -> EmitFn:
    """Create a sub-phase emitter closure for one agent."""

    async def emit(sub_phase: str, sub_phase_status: str) -> None:
        update_sub_phase(analysis_id, agent_id, sub_phase, sub_phase_status)
        await _emit(analysis_id, "status", {
            "event_type": "agent_status",
            "agent_id": agent_id,
            "status": "running",
            "sub_phase": sub_phase,
            "sub_phase_status": sub_phase_status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    return emit


async def _emit_agent(analysis_id: str, agent_id: str, status: str, **extra) -> None:
    """Emit an agent-level status event."""
    data = {
        "event_type": "agent_status",
        "agent_id": agent_id,
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    data.update(extra)
    await _emit(analysis_id, "status", data)


async def run_orchestrator(analysis_id: str, company: str, market: str) -> None:
    """Execute the full analysis pipeline: 3 research agents in parallel, then synthesis."""

    print(f"\n{'='*60}")
    print(f"ANALYSIS: {company} → {market}")
    print(f"{'='*60}")
    sys.stdout.flush()

    t0 = time.time()
    results = AnalysisResults()

    # Emit analysis started
    await _emit(analysis_id, "status", {
        "event_type": "analysis_status",
        "status": "running",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    # Create emitters for each agent
    inc_emit = _make_agent_emitter(analysis_id, "incumbents")
    emg_emit = _make_agent_emitter(analysis_id, "emerging")
    mkt_emit = _make_agent_emitter(analysis_id, "market_sizing")

    # ── Phase 1: Research agents in parallel ──
    for agent_id in ("incumbents", "emerging", "market_sizing"):
        update_agent_status(analysis_id, agent_id, "running")
        await _emit_agent(analysis_id, agent_id, "running")

    research_results = await asyncio.gather(
        run_incumbents(market, emit=inc_emit),
        run_emerging(market, exclude_incumbents=[], emit=emg_emit),
        run_market_sizing(market, emit=mkt_emit),
        return_exceptions=True,
    )

    # Process results
    agent_ids = ["incumbents", "emerging", "market_sizing"]
    for agent_id, result in zip(agent_ids, research_results):
        if isinstance(result, Exception):
            print(f"  ERROR in {agent_id}: {result}")
            update_agent_status(analysis_id, agent_id, "failed")
            await _emit_agent(analysis_id, agent_id, "failed", error=str(result))
        else:
            update_agent_status(analysis_id, agent_id, "completed")
            await _emit_agent(analysis_id, agent_id, "completed",
                              duration_s=round(time.time() - t0, 1))

    # Unpack
    incumbents_result, emerging_result, market_sizing_result = research_results

    if not isinstance(incumbents_result, Exception):
        results.incumbents = incumbents_result

    if not isinstance(emerging_result, Exception):
        emerging_competitors, capital_flow = emerging_result
        results.emerging_competitors = emerging_competitors
        results.capital_flow = capital_flow

    if not isinstance(market_sizing_result, Exception):
        results.market_sizing = market_sizing_result

    # ── Phase 2: Synthesis ──
    syn_emit = _make_agent_emitter(analysis_id, "synthesis")
    update_agent_status(analysis_id, "synthesis", "running")
    await _emit_agent(analysis_id, "synthesis", "running")

    try:
        verdict = await run_synthesis(company, market, results, emit=syn_emit)
        results.verdict = verdict
        update_agent_status(analysis_id, "synthesis", "completed")
        await _emit_agent(analysis_id, "synthesis", "completed",
                          duration_s=round(time.time() - t0, 1))
    except Exception as e:
        print(f"  ERROR in synthesis: {e}")
        update_agent_status(analysis_id, "synthesis", "failed")
        await _emit_agent(analysis_id, "synthesis", "failed", error=str(e))

    # ── Done ──
    complete_analysis(analysis_id, results)
    await _emit(analysis_id, "complete", {
        "event_type": "analysis_status",
        "status": "completed",
        "recommendation": results.verdict.verdict if results.verdict else None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    total_time = time.time() - t0
    print(f"\n{'='*60}")
    print(f"ANALYSIS COMPLETE: {total_time:.1f}s total")
    if results.verdict:
        print(f"  Verdict: {results.verdict.verdict} (confidence={results.verdict.confidence})")
    print(f"{'='*60}")
    sys.stdout.flush()
