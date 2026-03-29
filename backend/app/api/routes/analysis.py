import asyncio
import json

from fastapi import APIRouter, BackgroundTasks, HTTPException
from sse_starlette.sse import EventSourceResponse

from app.core.events import get_queue
from app.models.requests import AnalysisRequest
from app.models.responses import (
    AnalysisResponse,
    AnalysisResults,
    CapitalFlow,
    Competitor,
    EmergingCompetitor,
    FundingRound,
    GrowthProjection,
    MarketSizeEstimate,
    MarketSizingResult,
    RegionalBreakdown,
    Verdict,
    VerdictFactor,
)
from app.agents.orchestrator import run_orchestrator
from app.services.analysis import (
    create_analysis,
    get_analysis,
)

router = APIRouter()


# ── Mock data ───────────────────────────────────────────────

MOCK_RESULTS = AnalysisResults(
    incumbents=[
        Competitor(
            name="ServiceNow",
            description="Enterprise IT service management platform expanding into AI-powered workflows",
            market_position="leader",
            key_products=["ITSM", "ITOM", "Strategic Portfolio Management", "Now Assist AI"],
            strengths=["Deep enterprise relationships", "Broad platform", "Strong AI investment"],
            weaknesses=["Premium pricing limits mid-market", "Complex implementation"],
            market_share_pct=22.5,
            revenue_annual_mm=9200,
            revenue_arr_mm=8800,
            pricing_model="Per-user subscription",
            pricing_range="$100-$150/user/month",
        ),
        Competitor(
            name="Atlassian",
            description="Collaboration and project management suite for software and IT teams",
            market_position="challenger",
            key_products=["Jira", "Confluence", "Jira Service Management", "Atlassian Intelligence"],
            strengths=["Developer-first DNA", "Strong ecosystem", "Competitive pricing"],
            weaknesses=["Enterprise perception gap", "Cloud migration friction"],
            market_share_pct=15.3,
            revenue_annual_mm=4400,
            revenue_arr_mm=4100,
            pricing_model="Tiered subscription",
            pricing_range="$7-$15/user/month",
        ),
        Competitor(
            name="Freshworks",
            description="Cloud-based business software focused on mid-market IT and CX",
            market_position="niche",
            key_products=["Freshservice", "Freshdesk", "Freddy AI"],
            strengths=["SMB-friendly pricing", "Fast time-to-value", "AI copilot"],
            weaknesses=["Limited enterprise features", "Smaller partner ecosystem"],
            market_share_pct=4.2,
            revenue_annual_mm=620,
            revenue_arr_mm=590,
            pricing_model="Per-agent subscription",
            pricing_range="$19-$95/agent/month",
        ),
    ],
    emerging_competitors=[
        EmergingCompetitor(
            name="Moveworks",
            description="AI-powered employee service platform automating IT support with LLMs",
            founded_year=2016,
            headquarters="Mountain View, CA",
            total_funding_mm=305,
            latest_round=FundingRound(
                stage="series-b",
                amount_mm=200,
                date="2022-06",
                lead_investors=["Tiger Global", "Alkeon Capital"],
                valuation_mm=2100,
            ),
            key_differentiator="Purpose-built LLM for enterprise IT support resolution",
            employee_count=550,
        ),
        EmergingCompetitor(
            name="Tonkean",
            description="No-code process orchestration platform for internal operations",
            founded_year=2015,
            headquarters="San Francisco, CA",
            total_funding_mm=93,
            latest_round=FundingRound(
                stage="series-b",
                amount_mm=50,
                date="2022-01",
                lead_investors=["Lightspeed Venture Partners"],
                valuation_mm=None,
            ),
            key_differentiator="Process orchestration without replacing existing tools",
            employee_count=180,
        ),
    ],
    capital_flow=CapitalFlow(
        total_funding_last_2_years_mm=2800,
        deal_count_last_2_years=45,
        average_deal_size_mm=62,
        yoy_funding_change_pct=-18.5,
        top_investors=["Tiger Global", "Accel", "Lightspeed", "Sequoia", "Insight Partners"],
        capital_velocity_signal="decelerating",
    ),
    market_sizing=MarketSizingResult(
        tam_current_mm=58000,
        tam_current_year=2024,
        tam_projected_mm=132000,
        tam_projected_year=2030,
        sam_current_mm=18500,
        growth_projections=[
            GrowthProjection(
                cagr_pct=14.8,
                start_year=2024,
                end_year=2030,
                start_value_mm=58000,
                end_value_mm=132000,
                source="Gartner",
            ),
            GrowthProjection(
                cagr_pct=16.2,
                start_year=2024,
                end_year=2029,
                start_value_mm=58000,
                end_value_mm=121000,
                source="Mordor Intelligence",
            ),
        ],
        market_size_estimates=[
            MarketSizeEstimate(value_mm=52000, year=2023, source="Gartner"),
            MarketSizeEstimate(value_mm=58000, year=2024, source="Gartner"),
            MarketSizeEstimate(value_mm=67000, year=2025, source="Forrester"),
        ],
        regional_breakdown=[
            RegionalBreakdown(region="North America", share_pct=42.0, value_mm=24360),
            RegionalBreakdown(region="Europe", share_pct=28.0, value_mm=16240),
            RegionalBreakdown(region="Asia Pacific", share_pct=22.0, value_mm=12760),
            RegionalBreakdown(region="Rest of World", share_pct=8.0, value_mm=4640),
        ],
        key_growth_drivers=[
            "AI/ML adoption in enterprise workflows",
            "Digital transformation acceleration post-COVID",
            "Shift from on-premise to cloud-native platforms",
        ],
        key_headwinds=[
            "Tightening IT budgets amid macro uncertainty",
            "Vendor consolidation reducing new entrant opportunities",
            "Security and compliance complexity slowing adoption",
        ],
        data_confidence="high",
    ),
    verdict=Verdict(
        verdict="GO",
        confidence=0.74,
        summary="The AI-powered IT service management market presents a strong entry opportunity "
        "despite mature incumbents. High CAGR (14-16%), decelerating VC funding (signaling "
        "consolidation phase), and clear white space in mid-market AI-native solutions make "
        "this an attractive market for a well-positioned entrant.",
        factors=[
            VerdictFactor(
                factor="Market Size & Growth",
                assessment="$58B TAM growing at 14-16% CAGR — large and expanding",
                signal="positive",
            ),
            VerdictFactor(
                factor="Competitive Density",
                assessment="3 dominant players control ~42% share — room exists below",
                signal="positive",
            ),
            VerdictFactor(
                factor="Capital Flow",
                assessment="VC funding decelerating (-18.5% YoY) — fewer new entrants to compete with",
                signal="positive",
            ),
            VerdictFactor(
                factor="Incumbent Lock-in",
                assessment="ServiceNow and Atlassian have deep enterprise integrations",
                signal="negative",
            ),
            VerdictFactor(
                factor="Technical Moat",
                assessment="AI differentiation window still open — incumbents retrofitting, not native",
                signal="positive",
            ),
        ],
    ),
)


# ── Mock orchestrator (simulates agent execution) ───────────

async def _mock_orchestrator(analysis_id: str) -> None:
    queue = get_queue(analysis_id)
    if not queue:
        return

    agents = ["incumbents", "emerging", "market_sizing", "synthesis"]

    for agent_id in agents:
        update_agent_status(analysis_id, agent_id, "running")
        await queue.put({"event": "status", "data": json.dumps({"agent": agent_id, "status": "running"})})
        await asyncio.sleep(2)

        update_agent_status(analysis_id, agent_id, "complete")
        await queue.put({"event": "status", "data": json.dumps({"agent": agent_id, "status": "complete", "duration_s": 2.0})})

    complete_analysis(analysis_id, MOCK_RESULTS)
    await queue.put({"event": "complete", "data": json.dumps({"analysis_id": analysis_id})})


# ── Endpoints ───────────────────────────────────────────────

@router.post("/analyze")
async def start_analysis(request: AnalysisRequest, background_tasks: BackgroundTasks) -> dict:
    print(f">>> POST HIT: {request.company} x {request.market}", flush=True)
    analysis = create_analysis(request.company, request.market)
    background_tasks.add_task(_safe_orchestrator, analysis.id, request.company, request.market)
    return {"id": analysis.id, "status": analysis.status, "workflow": analysis.workflow}


async def _safe_orchestrator(analysis_id: str, company: str, market: str) -> None:
    """Wrapper that catches and prints any orchestrator crash."""
    import traceback
    print(f">>> ORCHESTRATOR STARTING: {analysis_id}", flush=True)
    try:
        await run_orchestrator(analysis_id, company, market)
    except Exception:
        print(f">>> ORCHESTRATOR CRASHED:", flush=True)
        traceback.print_exc()


@router.get("/analyze/{analysis_id}")
async def get_analysis_status(analysis_id: str) -> AnalysisResponse:
    print(f">>> GET HIT: {analysis_id}", flush=True)
    analysis = get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


@router.get("/analyze/{analysis_id}/stream")
async def stream_analysis(analysis_id: str):
    print(f">>> SSE HIT: {analysis_id}", flush=True)
    analysis = get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    queue = get_queue(analysis_id)
    if not queue:
        raise HTTPException(status_code=404, detail="No event stream for this analysis")

    async def event_generator():
        while True:
            message = await queue.get()
            yield message
            if message.get("event") == "complete":
                break

    return EventSourceResponse(event_generator())
