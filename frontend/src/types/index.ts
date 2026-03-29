// TypeScript interfaces mirroring backend Pydantic models

export interface SourceRef {
  title: string;
  url: string;
  snippet?: string;
}

export interface AnalysisRequest {
  company: string;
  market: string;
}

export interface Competitor {
  name: string;
  description: string;
  market_position: "leader" | "challenger" | "niche";
  key_products: string[];
  strengths: string[];
  weaknesses: string[];
  market_share_pct: number | null;
  revenue_annual_mm: number | null;
  revenue_arr_mm: number | null;
  pricing_model: string | null;
  pricing_range: string | null;
  _sources?: Record<string, SourceRef[]>;
}

export interface FundingRound {
  stage: "pre-seed" | "seed" | "series-a" | "series-b" | "unknown";
  amount_mm: number | null;
  date: string | null;
  lead_investors: string[];
  valuation_mm: number | null;
}

export interface EmergingCompetitor {
  name: string;
  description: string;
  founded_year: number | null;
  headquarters: string | null;
  total_funding_mm: number | null;
  latest_round: FundingRound | null;
  key_differentiator: string | null;
  employee_count: number | null;
  _sources?: Record<string, SourceRef[]>;
}

export interface CapitalFlow {
  total_funding_last_2_years_mm: number | null;
  deal_count_last_2_years: number | null;
  average_deal_size_mm: number | null;
  yoy_funding_change_pct: number | null;
  top_investors: string[];
  capital_velocity_signal:
    | "accelerating"
    | "steady"
    | "decelerating"
    | "nascent"
    | null;
  _sources?: Record<string, SourceRef[]>;
}

export interface GrowthProjection {
  cagr_pct: number | null;
  start_year: number | null;
  end_year: number | null;
  start_value_mm: number | null;
  end_value_mm: number | null;
  source: string | null;
  source_url?: string | null;
  source_title?: string | null;
}

export interface MarketSizeEstimate {
  value_mm: number | null;
  year: number | null;
  source: string | null;
  source_url?: string | null;
  source_title?: string | null;
}

export interface RegionalBreakdown {
  region: string;
  share_pct: number | null;
  value_mm: number | null;
}

export interface MarketSizingResult {
  tam_current_mm: number | null;
  tam_current_year: number | null;
  tam_projected_mm: number | null;
  tam_projected_year: number | null;
  sam_current_mm: number | null;
  growth_projections: GrowthProjection[];
  market_size_estimates: MarketSizeEstimate[];
  regional_breakdown: RegionalBreakdown[];
  key_growth_drivers: string[];
  key_headwinds: string[];
  data_confidence: "high" | "medium" | "low" | null;
  confidence_note: string | null;
  tam_current_sources?: SourceRef[];
  tam_projected_sources?: SourceRef[];
  all_sources?: SourceRef[];
}

export interface VerdictFactor {
  factor: string;
  assessment: string;
  signal: "positive" | "negative" | "neutral";
}

export interface Verdict {
  verdict: "GO" | "NO-GO";
  confidence: number;
  summary: string;
  factors: VerdictFactor[];
}

export interface AnalysisResults {
  incumbents: Competitor[];
  emerging_competitors: EmergingCompetitor[];
  capital_flow: CapitalFlow | null;
  market_sizing: MarketSizingResult | null;
  verdict: Verdict | null;
}

export interface WorkflowNode {
  id: string;
  label: string;
  group: string;
}

export interface WorkflowEdge {
  source: string;
  target: string;
}

export interface WorkflowManifest {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface AnalysisResponse {
  id: string;
  status: "pending" | "running" | "complete" | "failed";
  company: string;
  market: string;
  workflow: WorkflowManifest | null;
  agent_statuses: Record<string, string>;
  agent_sub_phases: Record<string, Record<string, string>>;
  results: AnalysisResults | null;
}

// ── SSE Event Types ──────────────────────────────────────

export interface AgentEvent {
  event_type: "agent_status";
  agent_id: string;
  status: "pending" | "running" | "completed" | "failed";
  sub_phase?: string;
  sub_phase_status?: string;
  detail_names?: string[];
  message?: string;
  timestamp: string;
  metadata?: { duration_ms?: number };
}

export interface AnalysisStatusEvent {
  event_type: "analysis_status";
  status: "running" | "completed" | "failed";
  recommendation?: "GO" | "NO-GO";
  message?: string;
  timestamp: string;
}

export type SSEEvent = AgentEvent | AnalysisStatusEvent;

// ── DAG State ────────────────────────────────────────────

export interface SubPhaseState {
  status: "pending" | "running" | "completed";
}

export interface AgentState {
  status: "pending" | "running" | "completed" | "failed";
  subPhases: Record<string, SubPhaseState>;
}

export interface DAGState {
  analysisStatus: "pending" | "running" | "completed" | "failed";
  recommendation?: "GO" | "NO-GO";
  agents: Record<string, AgentState>;
  detailNames: Record<string, string[]>;
  elapsed: number;
}
