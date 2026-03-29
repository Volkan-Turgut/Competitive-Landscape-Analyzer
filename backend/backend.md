# backend/

Python backend for the Competitive Landscape Analyzer.

## Stack
- FastAPI (async web framework)
- Pydantic AI (agent framework)
- Tavily (web search)
- SSE via sse-starlette

## Entry point
`uvicorn app.main:app --reload --port 8000`

## Files
| File | Status | Description |
|------|--------|-------------|
| requirements.txt | implemented | Python dependencies |
| .env.example | implemented | Environment variable template |

## Subfolders
- `app/` — Application package
- `tests/` — Test suite
