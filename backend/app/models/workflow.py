from pydantic import BaseModel


class WorkflowNode(BaseModel):
    id: str
    label: str
    group: str


class WorkflowEdge(BaseModel):
    source: str
    target: str


class WorkflowManifest(BaseModel):
    nodes: list[WorkflowNode]
    edges: list[WorkflowEdge]
