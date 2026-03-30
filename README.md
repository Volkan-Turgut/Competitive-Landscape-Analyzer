# Competitive Landscape Analyzer

A multi-agent system that analyzes competitive landscapes. Enter a company and market — AI agents research incumbents, track funding activity, size the opportunity, and deliver a Go/No-Go recommendation.

## Quick Start

```bash
git clone https://github.com/Volkan-Turgut/Competitive-Landscape-Analyzer.git
cd Competitive-Landscape-Analyzer
```

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Open `.env` and replace with your API keys:

```
ANTHROPIC_API_KEY=your-anthropic-api-key
TAVILY_API_KEY=your-tavily-api-key
```

Build and run with Docker:

```bash
docker compose up --build -d
```

Open **http://localhost:3000** in your browser.

## Architecture

### Agent Design

The system uses four Pydantic AI agents organized into three parallel research branches and a synthesis layer:

```
                    Orchestrator
                        |
            +-----------+-----------+
            |           |           |
       Incumbents   Market Sizing  Emerging
            |           |           |
            +-----------+-----------+
                        |
                    Synthesis
```

**Incumbents Agent** — A Discovery agent identifies 4-8 established players via web search, then spawns parallel Detail sub-agents — one per competitor — that each research products, pricing, market share, and revenue independently ensuring that the context is not filled with irrelevant details from other competitors.

**Emerging Competitors Agent** — Discovery agent finds emerging startups, then parallel Detail sub-agents research each one. A separate Capital Flow agent analyzes VC funding trends, deal velocity, and top investors in the space.

**Market Sizing Agent** — Single agent that gathers TAM/SAM, CAGR, growth projections, and regional breakdown from industry sources (Gartner, Forrester, IDC, Statista).

**Synthesis Agent** — First researches the input company (products, revenue, team, capabilities), then cross-references against all three research outputs to evaluate company-market fit. Delivers a Go/No-Go verdict with confidence score and supporting factors.

### Key Design Decisions

**Separation of concerns** — Research agents study the market only. They have no knowledge of the input company. The Synthesis agent is the only one that researches the input company, then evaluates fit. This prevents confirmation bias in research.

**Parallel execution** — The three research agents run concurrently via `asyncio.gather`, cutting total runtime roughly to the duration of the slowest agent rather than the sum of all three.

**Sub-agent spawning over monolithic agents** — Incumbents and Emerging use a discovery → detail pattern. A Discovery agent identifies targets with broad searches, then spawns parallel Detail sub-agents that each deep-dive a single target. This produces richer data without overloading a single LLM context, and scales naturally with the number of competitors found.

**Structured outputs with null-safe fields** — All agent outputs use Pydantic models with `float | None` typed fields. This forces the LLM to return null for unknown values rather than fabricating numbers.

**Source attribution** — Agents cite sources by index (`[SOURCE N]`), not URLs (which get hallucinated). Sources are resolved post-run against actual search results and propagated to the frontend for tooltip attribution.

**Real-time progress via SSE** — The orchestrator pushes status events through Server-Sent Events. The frontend renders a live DAG visualization showing which agents are running, completed, or pending — with animated flowing dots along connector lines.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python, FastAPI, Pydantic AI, Anthropic Claude |
| **Search** | Tavily (async client for true parallel execution) |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **UI Components** | shadcn/ui (base-ui), custom themed components |
| **Deployment** | Docker (single container — FastAPI serves API + built frontend) |

### Frontend

- **Landing page** with animated hero, value propositions, and analysis form
- **DAG visualization** showing real-time agent progress with DAG-type workflow animation
- **Results dashboard** with interactive charts (market share donut, revenue bars, funding bars, TAM growth area chart), allowing tracing back to the source from the hyperlink popped up in the tooltip, tables
- **Light/dark theme** support via CSS custom properties
- **Demo mode** with pre-loaded analysis data for instant preview at the bottom of the page

