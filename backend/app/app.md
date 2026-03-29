# app/

Root application package.

## Files
| File | Status | Description |
|------|--------|-------------|
| __init__.py | implemented | Package marker |
| main.py | implemented | FastAPI app init, CORS, router includes |

## Subfolders
- `api/` — HTTP endpoints
- `models/` — Pydantic data models
- `services/` — Business logic (analysis state management)
- `agents/` — Pydantic AI agents + workflow
- `core/` — Config + shared infra (queues)
