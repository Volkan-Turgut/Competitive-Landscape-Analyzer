# models/

Pydantic data models. Shared between API layer and agents.

## Files
| File | Status | Description |
|------|--------|-------------|
| __init__.py | implemented | Package marker |
| requests.py | implemented | AnalysisRequest(company, market) |
| responses.py | implemented | All response models: Competitor, EmergingCompetitor, FundingRound, CapitalFlow, MarketSizingResult, Verdict, AnalysisResponse |
| workflow.py | implemented | WorkflowNode, WorkflowEdge, WorkflowManifest |

## Conventions
- `float | None` for all numeric fields — forces null over fabrication
- Literal types for constrained string fields
