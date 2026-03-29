# services/

Business logic layer between API routes and agents.

## Files
| File | Status | Description |
|------|--------|-------------|
| __init__.py | implemented | Package marker |
| analysis.py | implemented | In-memory analysis state: create, get, list. Manages asyncio.Queue per analysis. |
