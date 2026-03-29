# routes/

API endpoint definitions.

## Files
| File | Status | Description |
|------|--------|-------------|
| __init__.py | implemented | Package marker |
| analysis.py | implemented | POST /api/analyze, GET /api/analyze/{id}, GET /api/analyze/{id}/stream (SSE) |

## Notes
- Currently returns mock data; will be wired to real agents later
- SSE endpoint simulates agent execution with 2-second delays
