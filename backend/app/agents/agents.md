# agents/

Pydantic AI agents and orchestration.

## Files
| File | Status | Description |
|------|--------|-------------|
| __init__.py | implemented | Package marker |
| search.py | implemented | Shared: clean_raw_content, make_search_tool, resolve_sources, SOURCE_CITATION_RULES |
| workflow.py | implemented | SINGLE SOURCE OF TRUTH: DAG manifest with 4 nodes + 3 edges |
| orchestrator.py | implemented | Runs DAG: 3 research agents in parallel via asyncio.gather, then synthesis |
| incumbents.py | implemented | Multi-agent: discovery (max 3 searches) → detail×N parallel (2 each) → assembly |
| emerging.py | implemented | Multi-agent 4-phase: discovery → detail×N → capital flow → assembly |
| market_sizing.py | implemented | Single agent (max 6 searches), Tier 1/2 source prioritization |
| synthesis.py | implemented | Researches input company (max 4 searches), cross-references market data, Go/No-Go |

## Architecture
- All agents use `anthropic:claude-sonnet-4-6` model
- Search: Tavily SDK, `search_depth="basic"`, `max_results=5`
- Budget: prompt-level caps + `UsageLimits(request_limit=N)` per agent
- Citation: `[SOURCE N]` indexing → `FieldSource` → `resolve_sources()` maps to URLs
- Research agents research the MARKET only (no knowledge of input company)
- Synthesis agent researches the INPUT COMPANY via web search, then evaluates fit
