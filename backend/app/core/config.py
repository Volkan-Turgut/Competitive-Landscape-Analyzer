import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    tavily_api_key: str = ""
    valyu_api_key: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

# Export to OS environment so pydantic-ai and tavily SDK can find them
if settings.anthropic_api_key:
    os.environ["ANTHROPIC_API_KEY"] = settings.anthropic_api_key
if settings.tavily_api_key:
    os.environ["TAVILY_API_KEY"] = settings.tavily_api_key
if settings.valyu_api_key:
    os.environ["VALYU_API_KEY"] = settings.valyu_api_key
