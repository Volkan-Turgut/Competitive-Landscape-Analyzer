import os
from pathlib import Path

from pydantic_settings import BaseSettings

# Look for .env at project root (../../ from this file) or CWD
_project_root = Path(__file__).resolve().parent.parent.parent.parent
_env_file = _project_root / ".env" if (_project_root / ".env").exists() else ".env"


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    tavily_api_key: str = ""
    valyu_api_key: str = ""

    model_config = {"env_file": str(_env_file), "env_file_encoding": "utf-8"}


settings = Settings()

# Export to OS environment so pydantic-ai and tavily SDK can find them
if settings.anthropic_api_key:
    os.environ["ANTHROPIC_API_KEY"] = settings.anthropic_api_key
if settings.tavily_api_key:
    os.environ["TAVILY_API_KEY"] = settings.tavily_api_key
if settings.valyu_api_key:
    os.environ["VALYU_API_KEY"] = settings.valyu_api_key
