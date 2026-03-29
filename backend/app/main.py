from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.core.config  # noqa: F401 — loads .env and exports keys to os.environ
from app.api.routes.analysis import router as analysis_router

app = FastAPI(title="Competitive Landscape Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router, prefix="/api")
