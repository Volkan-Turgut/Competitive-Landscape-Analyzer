import uuid

from app.agents.workflow import WORKFLOW_MANIFEST
from app.core.events import create_queue
from app.models.responses import AnalysisResponse, AnalysisResults


_analyses: dict[str, AnalysisResponse] = {}


def create_analysis(company: str, market: str) -> AnalysisResponse:
    analysis_id = uuid.uuid4().hex[:12]
    create_queue(analysis_id)

    analysis = AnalysisResponse(
        id=analysis_id,
        status="running",
        company=company,
        market=market,
        workflow=WORKFLOW_MANIFEST,
        agent_statuses={node.id: "pending" for node in WORKFLOW_MANIFEST.nodes},
        results=None,
    )
    _analyses[analysis_id] = analysis
    return analysis


def get_analysis(analysis_id: str) -> AnalysisResponse | None:
    return _analyses.get(analysis_id)


def update_agent_status(analysis_id: str, agent_id: str, status: str) -> None:
    analysis = _analyses.get(analysis_id)
    if analysis:
        analysis.agent_statuses[agent_id] = status


def update_sub_phase(analysis_id: str, agent_id: str, sub_phase: str, status: str) -> None:
    analysis = _analyses.get(analysis_id)
    if analysis:
        if agent_id not in analysis.agent_sub_phases:
            analysis.agent_sub_phases[agent_id] = {}
        analysis.agent_sub_phases[agent_id][sub_phase] = status


def complete_analysis(analysis_id: str, results: AnalysisResults) -> None:
    analysis = _analyses.get(analysis_id)
    if analysis:
        analysis.results = results
        analysis.status = "complete"
