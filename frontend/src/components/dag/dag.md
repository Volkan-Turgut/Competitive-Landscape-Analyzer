# dag/

## Purpose
Agent DAG visualization — shows real-time progress of the multi-agent orchestration with circle nodes, connector lines/arrows, horizontal branching bar, detail agent chips, merge dots, and sub-phase indicators. Matches the agent-dag.html mockup.

## Files
| File | Status | Description |
|---|---|---|
| `AgentDAG.tsx` | implemented | Full DAG layout: orchestrator node → h-bar → 3 research branches → merge dots → synthesis node. Includes Branch, PhaseRow, DetailChips, MergeDots, VLine, ArrowTip, HBar sub-components. |
| `ResultBadge.tsx` | implemented | GO/NO-GO badge shown after synthesis completes |
| `AgentCircle.tsx` | deprecated | Replaced by Branch sub-component in AgentDAG.tsx |
| `SubPhaseList.tsx` | deprecated | Replaced by PhaseRow sub-component in AgentDAG.tsx |

## Dependencies
- Depends on: `@/types` (DAGState, AgentState)
- Depended on by: `pages/AnalysisPage`

## Conventions
- **Theme-aware** — uses CSS variables for backgrounds, borders, and text (not hardcoded dark colors)
- Node accent colors: blue (#3b82f6) incumbents, amber (#f59e0b) emerging, cyan (#06b6d4) market sizing, purple (#7c5aff/#a78bfa) synthesis
- Completed state: green (#22c55e) borders/lines
- Connector design: first connector (orch → h-bar) has NO arrow tip; branch connectors and merge→synthesis have arrow tips
- CSS keyframe animations: `pulse`, `dotPulse`, `flowDown`, `flowRight`
- Uses pure HTML/CSS divs for lines/arrows (no SVG)
- Flowing dot animation via CSS pseudo-elements (::after/::before) on `.dag-v-line` and `.dag-h-line` classes
- Green (#22c55e) glowing dots during research phase, purple (#a78bfa) dots during synthesis phase
- Phase-based animation: `flowing` class for active connectors, `complete` class for solid green, `synthesis-flow` for purple override
- Branch width: 260px, h-bar width: 552px (center-to-center alignment)
- No background badges on header, orchestrator label, or status text — plain text only

## Notes
- All neutral colors use CSS variables (--bg-primary, --text-primary, --border-primary, etc.)
- Accent colors (green, purple, blue, amber, cyan) stay hardcoded — they work on both themes
- Detail agent chip names arrive via SSE `detail_names` field after discovery phase completes (backend emits from incumbents.py and emerging.py)
- Names stored in `DAGState.detailNames` record, keyed by agent ID
- Detail chips show under both Incumbents and Emerging branches (not Market Sizing)
- `bootstrapFromResponse` also extracts names from completed results for page-refresh scenarios
- Horizontal bar has two staggered flowing dots (::after + ::before with 1s delay) for stream effect
