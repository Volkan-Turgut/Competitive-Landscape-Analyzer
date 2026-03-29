# core/

Shared infrastructure: config and event queues.

## Files
| File | Status | Description |
|------|--------|-------------|
| __init__.py | implemented | Package marker |
| config.py | implemented | pydantic-settings: reads .env for API keys |
| events.py | implemented | asyncio.Queue manager: create_queue(), get_queue() per analysis |
