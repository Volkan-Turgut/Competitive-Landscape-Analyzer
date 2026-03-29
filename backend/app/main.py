from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

import app.core.config  # noqa: F401 — loads .env and exports keys to os.environ
from app.api.routes.analysis import router as analysis_router

app = FastAPI(title="Competitive Landscape Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router, prefix="/api")

# Serve frontend build (must be LAST — catch-all for SPA)
_static_dir = Path(__file__).parent.parent / "static"
if _static_dir.exists():
    @app.get("/{path:path}")
    async def serve_spa(path: str):
        file_path = _static_dir / path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(_static_dir / "index.html")
