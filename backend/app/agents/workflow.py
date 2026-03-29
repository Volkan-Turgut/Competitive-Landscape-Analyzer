from app.models.workflow import WorkflowEdge, WorkflowManifest, WorkflowNode

WORKFLOW_MANIFEST = WorkflowManifest(
    nodes=[
        WorkflowNode(id="incumbents", label="Incumbents", group="research"),
        WorkflowNode(id="emerging", label="Emerging Competitors", group="research"),
        WorkflowNode(id="market_sizing", label="Market Sizing", group="research"),
        WorkflowNode(id="synthesis", label="Synthesis", group="synthesis"),
    ],
    edges=[
        WorkflowEdge(source="incumbents", target="synthesis"),
        WorkflowEdge(source="emerging", target="synthesis"),
        WorkflowEdge(source="market_sizing", target="synthesis"),
    ],
)
