from pydantic import BaseModel


class AnalysisRequest(BaseModel):
    company: str
    market: str
