# Competitive Landscape Analyzer — Full Architecture & Implementation Guide

> **Purpose of this document**: This is the single source of truth for building the application. It contains every architectural decision, folder structure, file description, API contract, data shape, UI spec, and implementation detail needed to build from scratch. Feed this to Claude Code at the start of any session.

---

## 1. What This App Does

A user provides a **company name** and a **product/market space**. The system runs multiple AI research agents in parallel to analyze the competitive landscape, then synthesizes findings into a **Go / No-Go recommendation** on whether the market is a fit for that company.

The system is company-agnostic — it works for any company and any market.

**Critical architectural constraint — separation of concerns**:
- **Research agents** (Incumbents, Emerging Competitors, Market Sizing) research the **market** only — they have no knowledge of the input company.
- **Synthesis agent** researches the **input company** (products, revenue, team size, technical capabilities, recent strategic moves, existing market position) via web search, then cross-references that company profile against all three research outputs to evaluate company-market fit.

---

## 2. Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python** | Backend language |
| **FastAPI** | Web framework — async-first, Pydantic-native, SSE support |
| **Pydantic** | Data validation and serialization (request/response models) |
| **Pydantic AI** | Agent framework — structured outputs, tool calling |
| **Anthropic Claude** | LLM provider for all agents |
| **Tavily** | Primary web search tool for agents |
| **Valyu** | Secondary data source via MCP for public company financials (SEC filings, earnings) |
| **sse-starlette** | Server-Sent Events support for FastAPI |
| **pydantic-settings** | Environment variable management |
| **httpx** | Async HTTP client |
| **uvicorn** | ASGI server |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18+** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool and dev server |
| **React Router** | Client-side routing (SPA with 2 routes) |
| **shadcn/ui** | Pre-built UI components (Button, Card, Badge, Tabs, Table, Chart, Input) |
| **Tailwind CSS** | Utility-first styling (comes with shadcn/ui) |
| **Recharts** | Chart library (comes with shadcn/ui chart component) |
| **Lucide React** | Icon library (comes with shadcn/ui) |

### Visual Theme
- **Dark mode** as default (Linear / Vercel aesthetic)
- Minimal, clean, generous whitespace
- Muted colors on dark backgrounds, thin borders
- Accent colors encode meaning: green = GO/positive, red = NO-GO/negative, purple = primary brand accent, amber = warning/caution
- shadcn/ui dark mode via CSS variables (set once in globals.css, all components respect it)

---

## 3. Folder Structure

```
project-root/
├── README.md                          ← Public-facing readme (how to run, brief arch overview)
├── ARCHITECTURE.md                    ← This file (deep architecture reference)
│
├── backend/
│   ├── requirements.txt               ← Python dependencies
│   ├── .env                           ← API keys (never committed to git)
│   ├── .env.example                   ← Template showing required env vars
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    ← FastAPI app init, CORS config, router includes
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       └── analysis.py        ← 3 API endpoints (POST, GET, SSE stream)
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── requests.py            ← AnalysisRequest pydantic model
│   │   │   ├── responses.py           ← Full response models (competitors, market sizing, verdict)
│   │   │   └── workflow.py            ← WorkflowNode, WorkflowEdge, WorkflowManifest
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── analysis.py            ← Creates analysis, manages in-memory state, launches orchestrator
│   │   │
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── orchestrator.py        ← Runs the DAG: parallel research agents → sequential synthesis
│   │   │   ├── workflow.py            ← SINGLE SOURCE OF TRUTH: defines nodes + edges (the manifest)
│   │   │   ├── incumbents.py          ← Pydantic AI agent: established competitors research
│   │   │   ├── emerging.py            ← Pydantic AI agent: emerging competitors + funding
│   │   │   ├── market_sizing.py       ← Pydantic AI agent: TAM/SAM, CAGR, growth projections
│   │   │   └── synthesis.py           ← Pydantic AI agent: cross-references all 3, delivers Go/No-Go
│   │   │
│   │   └── core/
│   │       ├── __init__.py
│   │       ├── config.py              ← Settings via pydantic-settings (reads .env)
│   │       └── events.py             ← asyncio.Queue manager (one queue per analysis)
│   │
│   └── tests/
│       └── __init__.py
│
├── frontend/
│   ├── index.html                     ← Single HTML entry (SPA)
│   ├── vite.config.ts                 ← Vite config + API proxy to backend
│   ├── tailwind.config.ts             ← Tailwind theme (colors, dark mode, fonts)
│   ├── tsconfig.json                  ← TypeScript config
│   ├── package.json                   ← Frontend dependencies + scripts
│   ├── components.json                ← shadcn/ui config
│   │
│   └── src/
│       ├── main.tsx                   ← React entry point, mounts <App />
│       ├── App.tsx                    ← React Router setup + layout shell
│       │
│       ├── components/
│       │   ├── ui/                    ← shadcn/ui primitives (auto-generated via CLI)
│       │   │
│       │   ├── layout/
│       │   │   ├── Navbar.tsx          ← Top bar with phase indicator
│       │   │   └── Container.tsx       ← Max-width wrapper for content
│       │   │
│       │   ├── landing/
│       │   │   ├── Hero.tsx            ← Dark hero with rotating text animation + CTAs
│       │   │   ├── ValueProps.tsx       ← Three value-prop cards (market / competitors / verdict)
│       │   │   ├── HowItWorks.tsx      ← Three-step flow (input → agents → verdict)
│       │   │   ├── FeatureTabs.tsx     ← Four-tab feature section with mockup previews
│       │   │   ├── Comparison.tsx      ← "vs manual research vs ChatGPT vs consultants"
│       │   │   ├── TrustSignals.tsx    ← Source attribution, structured outputs, multi-source
│       │   │   ├── FAQ.tsx             ← Accordion with 3-4 questions
│       │   │   └── FinalCTA.tsx        ← Closing headline + "Run analysis" button
│       │   │
│       │   ├── analysis/
│       │   │   ├── AnalysisForm.tsx    ← Company name + market input form
│       │   │   └── AnalysisPage.tsx    ← /results/:id — shows tree OR dashboard based on status
│       │   │
│       │   ├── progress/
│       │   │   ├── AgentTree.tsx       ← DAG visualization from workflow manifest
│       │   │   └── AgentNode.tsx       ← Individual node with animated status
│       │   │
│       │   └── results/
│       │       ├── Dashboard.tsx       ← Main results container with tabs
│       │       ├── Verdict.tsx         ← Go/No-Go banner + confidence + factor grid
│       │       ├── SectionCard.tsx     ← Reusable card wrapper
│       │       ├── IncumbentsView.tsx  ← Market share donut, revenue bars, competitor table
│       │       ├── EmergingView.tsx    ← Capital flow stats, funding bars, investor pills
│       │       ├── MarketSizingView.tsx ← TAM area chart, estimates bars, drivers/headwinds
│       │       ├── SynthesisView.tsx   ← Synthesis reasoning and evidence
│       │       └── Charts.tsx         ← Shared chart configs (Recharts wrappers)
│       │
│       ├── hooks/
│       │   ├── useAnalysis.ts         ← Central state: phase, analysisId, workflow, statuses, results
│       │   └── useSSE.ts             ← SSE connection lifecycle
│       │
│       ├── types/
│       │   └── index.ts              ← TypeScript interfaces mirroring backend Pydantic models
│       │
│       ├── lib/
│       │   ├── api.ts                ← fetch wrappers: postAnalysis(), getAnalysis()
│       │   └── utils.ts             ← cn() helper + formatCurrency(), formatPercent()
│       │
│       └── styles/
│           └── globals.css           ← Tailwind base + dark theme CSS variables
```

---

## 4. File Descriptions

### Backend

**`app/main.py`** — Creates FastAPI app. Configures CORS (allows localhost:5173). Includes analysis router. Entry point for `uvicorn app.main:app`.

**`app/api/routes/analysis.py`** — Three endpoints:
- `POST /api/analyze` — accepts AnalysisRequest, creates analysis, kicks off orchestrator background task, returns {id, workflow}
- `GET /api/analyze/{id}` — returns current status + results
- `GET /api/analyze/{id}/stream` — SSE endpoint, reads from asyncio.Queue, streams agent status events

**`app/models/requests.py`** — `AnalysisRequest(company: str, market: str)`

**`app/models/responses.py`** — All Pydantic response models:
- `Competitor` — name, description, market_position (Literal["leader","challenger","niche"]), key_products, strengths, weaknesses, market_share_pct (float|None), revenue_annual_mm (float|None), revenue_arr_mm (float|None), pricing_model, pricing_range
- `EmergingCompetitor` — name, description, founded_year, headquarters, total_funding_mm (float|None), latest_round (FundingRound), key_differentiator, employee_count (int|None)
- `FundingRound` — stage (Literal["pre-seed","seed","series-a","series-b","unknown"]), amount_mm (float|None), date, lead_investors (list[str]), valuation_mm (float|None)
- `CapitalFlow` — total_funding_last_2_years_mm, deal_count_last_2_years, average_deal_size_mm, yoy_funding_change_pct, top_investors, capital_velocity_signal (Literal["accelerating","steady","decelerating","nascent"])
- `GrowthProjection` — cagr_pct, start_year, end_year, start_value_mm, end_value_mm, source
- `MarketSizeEstimate` — value_mm, year, source
- `RegionalBreakdown` — region, share_pct (float|None), value_mm (float|None)
- `MarketSizingResult` — tam_current_mm, tam_current_year, tam_projected_mm, tam_projected_year, sam_current_mm, growth_projections, market_size_estimates, regional_breakdown, key_growth_drivers, key_headwinds, data_confidence, confidence_note
- `Verdict` — verdict (Literal["GO","NO-GO"]), confidence (float), summary, factors
- `AnalysisResponse` — id, status, company, market, workflow, agent_statuses, results

Use `float | None` for ALL numeric fields — forces null over fabrication.

**`app/models/workflow.py`** — WorkflowNode(id, label, group), WorkflowEdge(source, target), WorkflowManifest(nodes, edges)

**`app/services/analysis.py`** — Manages in-memory dict of Analysis objects. Each Analysis holds: id, company, market, status, workflow, agent_statuses dict, asyncio.Queue, results. Provides create_analysis(), get_analysis(), get_queue().

**`app/agents/workflow.py`** — SINGLE SOURCE OF TRUTH. Defines WORKFLOW_MANIFEST with 4 nodes (incumbents, emerging, market_sizing, synthesis) and 3 edges (each research → synthesis). Everything reads from this.

**`app/agents/orchestrator.py`** — Reads manifest. Runs research agents in parallel via asyncio.gather. After all complete, runs synthesis (passing company name + all research outputs). Pushes status events to queue after each agent.

**`app/agents/search.py`** — Shared search utilities: `clean_raw_content()`, `make_search_tool()`, `resolve_sources()`, `SOURCE_CITATION_RULES`. All agents import from here.

**`app/agents/incumbents.py`** — Multi-agent phased: Discovery agent (max 3 searches, `request_limit=5`) identifies 4-8 incumbents → Detail agent factory (2 searches each, `request_limit=4`) runs in parallel via `asyncio.gather` → Assembly with source resolution.

**`app/agents/emerging.py`** — Multi-agent 4-phase: Discovery agent (max 3 searches, excludes incumbents) → Detail agent factory (2 searches each, parallel) → Capital Flow agent (max 3 searches, analyzes VC trends) → Assembly with source resolution.

**`app/agents/market_sizing.py`** — Single agent (max 6 searches, `request_limit=8`). Prioritizes Tier 1 sources (Gartner, Forrester, IDC, Statista) then Tier 2 (Mordor, GVR, M&M).

**`app/agents/synthesis.py`** — Two-phase agent:
1. **Company research phase** — Uses Tavily search tool to research the input company: current products, revenue, team size, technical capabilities, recent strategic moves, existing market position.
2. **Cross-reference phase** — Evaluates company-market fit by comparing the company profile against all 3 research agent outputs. Delivers Go/No-Go verdict with confidence and factors.

This is the only agent that knows about the input company. Uses the same `[SOURCE N]` citation pattern as research agents.

**`app/core/config.py`** — pydantic-settings reading .env (anthropic_api_key, tavily_api_key, etc.)

**`app/core/events.py`** — asyncio.Queue manager. create_queue(id), get_queue(id).

### Frontend

**`src/main.tsx`** — Mounts `<App />`, imports globals.css.

**`src/App.tsx`** — React Router: `/` → landing page, `/results/:id` → AnalysisPage. Wraps in Navbar + Container.

**Landing components** — Hero (rotating text "verdict/edge/signal/clarity", dark bg, purple glow, CTAs, powered-by strip), ValueProps (3 cards), HowItWorks (3-step flow), FeatureTabs (4 tabs with mockup previews), Comparison (vs manual/ChatGPT/consultants), TrustSignals, FAQ, FinalCTA.

**Analysis components** — AnalysisForm (2 inputs + submit), AnalysisPage (checks status: running→tree, complete→dashboard, not found→redirect).

**Progress components** — AgentTree (renders DAG from manifest), AgentNode (pending=gray, running=pulse, complete=green, failed=red).

**Results components** — Dashboard (verdict + 4 tabs), Verdict (GO/NO-GO banner), IncumbentsView (donut + bars + table), EmergingView (stats + bars + investors), MarketSizingView (area chart + estimates + drivers/headwinds), SynthesisView, Charts (shared Recharts wrappers).

**Hooks** — useAnalysis (central state: phase, id, workflow, statuses, results), useSSE (EventSource lifecycle).

**Types** — TypeScript interfaces mirroring all backend Pydantic models.

**Lib** — api.ts (fetch wrappers), utils.ts (cn(), formatCurrency(), formatPercent()).

---

## 5. API Contract

### `POST /api/analyze`
```
Request:  { "company": "Notion", "market": "AI-powered project management" }
Response: { "id": "abc123", "status": "running", "workflow": { "nodes": [...], "edges": [...] } }
```

### `GET /api/analyze/{id}`
Returns full state: id, status, company, market, workflow, agent_statuses dict, results (null while running, populated when complete).

### `GET /api/analyze/{id}/stream` (SSE)
```
event: status
data: {"agent": "incumbents", "status": "running"}

event: status
data: {"agent": "incumbents", "status": "complete", "duration_s": 4.2}

event: complete
data: {"analysis_id": "abc123"}
```
The user never sees this URL. It's called by the useSSE hook internally.

---

## 6. Data Flow

```
Browser (React SPA)              FastAPI Backend                  Pydantic AI Agents
═══════════════════              ══════════════                   ══════════════════

POST /api/analyze ─────────────▶ Create record + queue
                                 Launch orchestrator ────────────▶ asyncio.gather(
◀─────────────────────────────── Return { id, workflow }           incumbents,
                                                                   emerging,
Navigate to /results/abc123                                        market_sizing
                                                                 )
GET /analyze/abc123/stream ────▶ Read from Queue                   │
◀── SSE events                   ◀── queue.put() ◀────────────────┘
                                                                   ▼
                                                                 synthesis(company, all results)
                                                                   │
                                                                   ├── Tavily search: input company
                                                                   │   (products, revenue, team,
                                                                   │    capabilities, strategy)
                                                                   ├── Cross-reference company
                                                                   │   profile vs market research
                                                                   ▼
◀── SSE: complete                ◀── queue.put()                 Go/No-Go verdict
                                                                   │
GET /api/analyze/abc123 ───────▶ Return full results ◀─────────────┘
◀─────────────────────────────── { verdict, sections }

Render Dashboard
```

---

## 7. Real-Time: Two Communication Layers

**Layer 1 — Orchestrator → SSE endpoint** (Python internal): asyncio.Queue per analysis. Orchestrator pushes events, SSE endpoint reads them.

**Layer 2 — SSE endpoint → Browser** (HTTP): EventSource in React. useSSE hook opens connection, listens for "status" and "complete" events, updates AgentTree.

---

## 8. Routing (Client-Side SPA)

| Route | Renders | Condition |
|---|---|---|
| `/` | Full landing page (all 8 sections stacked) | Always |
| `/results/:id` | Agent progress tree | `status === "running"` |
| `/results/:id` | Results dashboard | `status === "complete"` |
| `/results/:id` | Redirect to `/` | Not found |

No page reloads. URL changes via React Router `navigate()`.

---

## 9. Landing Page Sections (Top to Bottom)

1. **Hero** — Dark bg, rotating text animation ("verdict/edge/signal/clarity"), subtitle, 2 CTAs, powered-by strip with tech logos
2. **Value props** — 3 cards: market intelligence, competitive mapping, actionable verdict
3. **How it works** — 3-step flow: input → agents → verdict
4. **Feature tabs** — 4 tabs (Map the market / Know the players / Spot disruptors / Get the verdict) with left description + right mockup preview
5. **Comparison** — Your tool vs manual research vs ChatGPT vs consultants
6. **Trust signals** — Source attribution, structured outputs, multi-source verification
7. **FAQ** — 3-4 questions as accordion
8. **Final CTA** — "Stop guessing. Start knowing." + Run analysis button

---

## 10. Dashboard Data-to-Chart Mapping

### Incumbents tab
| Chart | Recharts Component | Data Field |
|---|---|---|
| Market share donut | PieChart | `competitors[].market_share_pct` (same category only) |
| Revenue bars (horizontal) | BarChart | `competitors[].revenue_arr_mm or revenue_annual_mm` |
| Competitor table | shadcn Table | All competitor fields |

### Emerging tab
| Visual | Component | Data Field |
|---|---|---|
| Capital flow stat cards | shadcn Card | `capital_flow.*` |
| Funding bars (horizontal) | BarChart | `emerging_competitors[].total_funding_mm` |
| Top investors | Badge pills | `capital_flow.top_investors` |
| Emerging table | shadcn Table | All emerging competitor fields |

### Market Sizing tab
| Chart | Recharts Component | Data Field |
|---|---|---|
| TAM growth area chart | AreaChart | `growth_projections[]` (primary) |
| Market estimates grouped bars | BarChart | `market_size_estimates[]` |
| Regional breakdown | PieChart (if data) | `regional_breakdown[]` |
| Growth drivers | Card with list | `key_growth_drivers[]` |
| Key headwinds | Card with list | `key_headwinds[]` |
| Data confidence | Badge | `data_confidence` |

### Verdict (top of dashboard, above tabs)
| Visual | Component | Data Field |
|---|---|---|
| GO/NO-GO banner | Card + large text | `verdict.verdict` |
| Confidence score | Large number | `verdict.confidence` |
| Summary | Paragraph | `verdict.summary` |
| Factor grid | 2-col grid of cards | `verdict.factors[]` |

**Null handling**: Show "—" for null numeric values. Don't render empty charts. If only one region has data, show a stat card instead of a pie chart.

---

## 11. Key Design Principles

- **Null over fabrication**: `float | None` typed fields force the LLM to return null for unknown values
- **Source attribution via indices**: LLM cites numbered indices (not URLs — those get hallucinated)
- **Workflow manifest is plug-and-play**: Add/remove agents by editing one file
- **Frontend is data-driven**: Tree and dashboard render from whatever the API returns
- **Dark mode everywhere**: Set once in globals.css, all components auto-respect
- **Charts breathe**: Generous padding, small gray axis labels, no heavy grid lines

---

## 12. Running the App

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # add API keys
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npx shadcn@latest init          # dark theme, New York style
npx shadcn@latest add button card badge tabs input table chart accordion
npm run dev                     # localhost:5173
```

Vite proxy in `vite.config.ts`:
```typescript
export default defineConfig({
    plugins: [react()],
    server: { proxy: { '/api': 'http://localhost:8000' } }
});
```

---

## 13. Build Order

1. **Backend scaffold** — Models + 3 endpoints with mock data + working SSE with fake events
2. **Frontend full build** — Landing page + agent tree + dashboard with charts, wired to mock API
3. **Wire real agents** — Replace mocks with Pydantic AI orchestrator
4. **Polish** — E2E testing, error handling, public README

---

## 14. Dependencies

### `backend/requirements.txt`
```
fastapi
uvicorn[standard]
pydantic
pydantic-ai
pydantic-settings
sse-starlette
python-dotenv
httpx
tavily-python
```

### `frontend/package.json` (key deps)
```json
{
    "dependencies": {
        "react": "^18",
        "react-dom": "^18",
        "react-router-dom": "^6",
        "recharts": "^2",
        "lucide-react": "latest",
        "tailwind-merge": "latest",
        "clsx": "latest"
    },
    "devDependencies": {
        "typescript": "^5",
        "vite": "^5",
        "@vitejs/plugin-react": "^4",
        "tailwindcss": "^3",
        "autoprefixer": "latest",
        "postcss": "latest"
    }
}
```

### `.env.example`
```
ANTHROPIC_API_KEY=sk-ant-...
TAVILY_API_KEY=tvly-...
VALYU_API_KEY=val-...
```
