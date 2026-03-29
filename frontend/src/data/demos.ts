/* eslint-disable @typescript-eslint/no-explicit-any */
import incumbentsRaw from "./incumbents_results.json";
import emergingRaw from "./emerging_competitors_results.json";
import marketSizingRaw from "./market_sizing_results.json";
import type {
  AnalysisResponse,
  AnalysisResults,
  Competitor,
  EmergingCompetitor,
  FundingRound,
  CapitalFlow,
  MarketSizingResult,
  GrowthProjection,
  MarketSizeEstimate,
  RegionalBreakdown,
  Verdict,
  SourceRef,
} from "@/types";

// ── Unwrap sourced field wrappers ─────────────────────────

function unwrap<T>(v: any): T {
  if (v && typeof v === "object" && "value" in v) return v.value as T;
  return v as T;
}

function collectSource(v: any): SourceRef | null {
  if (v && typeof v === "object" && "source_url" in v && v.source_url) {
    return {
      title: v.source_title || "",
      url: v.source_url,
      snippet: v.snippet || undefined,
    };
  }
  return null;
}

function addSource(sources: Record<string, SourceRef[]>, key: string, raw: any) {
  const src = collectSource(raw);
  if (src) sources[key] = [src];
}

// ── Transform incumbents ──────────────────────────────────

function mapCompetitor(raw: any): Competitor {
  const _sources: Record<string, SourceRef[]> = {};
  addSource(_sources, "description", raw.description);
  addSource(_sources, "market_share_pct", raw.market_share_pct);
  addSource(_sources, "revenue_annual_mm", raw.revenue_annual_mm);
  addSource(_sources, "revenue_arr_mm", raw.revenue_arr_mm);
  addSource(_sources, "pricing_model", raw.pricing_model);
  addSource(_sources, "pricing_range", raw.pricing_range);

  return {
    name: raw.name,
    description: unwrap<string>(raw.description) ?? "",
    market_position: raw.market_position,
    key_products: Array.isArray(raw.key_products)
      ? raw.key_products.map((p: any) => (typeof p === "string" ? p : p.product ?? ""))
      : [],
    strengths: raw.strengths ?? [],
    weaknesses: raw.weaknesses ?? [],
    market_share_pct: unwrap<number | null>(raw.market_share_pct),
    revenue_annual_mm: unwrap<number | null>(raw.revenue_annual_mm),
    revenue_arr_mm: unwrap<number | null>(raw.revenue_arr_mm),
    pricing_model: unwrap<string | null>(raw.pricing_model),
    pricing_range: unwrap<string | null>(raw.pricing_range),
    _sources: Object.keys(_sources).length > 0 ? _sources : undefined,
  };
}

// ── Transform emerging competitors ────────────────────────

function mapFundingRound(raw: any): FundingRound | null {
  if (!raw) return null;
  const inner = raw?.value ?? raw;
  if (!inner || !inner.stage) return null;
  return {
    stage: inner.stage,
    amount_mm: inner.amount_mm ?? null,
    date: inner.date ?? null,
    lead_investors: inner.lead_investors ?? [],
    valuation_mm: inner.valuation_mm ?? null,
  };
}

function mapEmergingCompetitor(raw: any): EmergingCompetitor {
  const _sources: Record<string, SourceRef[]> = {};
  addSource(_sources, "description", raw.description);
  addSource(_sources, "founded_year", raw.founded_year);
  addSource(_sources, "headquarters", raw.headquarters);
  addSource(_sources, "total_funding_mm", raw.total_funding_mm);
  addSource(_sources, "key_differentiator", raw.key_differentiator);
  addSource(_sources, "latest_round", raw.latest_round);

  return {
    name: raw.name ?? "",
    description: unwrap<string>(raw.description) ?? "",
    founded_year: unwrap<number | null>(raw.founded_year),
    headquarters: unwrap<string | null>(raw.headquarters),
    total_funding_mm: unwrap<number | null>(raw.total_funding_mm),
    latest_round: mapFundingRound(raw.latest_round),
    key_differentiator: unwrap<string | null>(raw.key_differentiator),
    employee_count: unwrap<number | null>(raw.employee_count),
    _sources: Object.keys(_sources).length > 0 ? _sources : undefined,
  };
}

function mapCapitalFlow(raw: any): CapitalFlow {
  const _sources: Record<string, SourceRef[]> = {};
  addSource(_sources, "total_funding_last_2_years_mm", raw.total_funding_last_2_years_mm);
  addSource(_sources, "deal_count_last_2_years", raw.deal_count_last_2_years);
  addSource(_sources, "average_deal_size_mm", raw.average_deal_size_mm);
  addSource(_sources, "yoy_funding_change_pct", raw.yoy_funding_change_pct);

  return {
    total_funding_last_2_years_mm: unwrap<number | null>(raw.total_funding_last_2_years_mm),
    deal_count_last_2_years: unwrap<number | null>(raw.deal_count_last_2_years),
    average_deal_size_mm: unwrap<number | null>(raw.average_deal_size_mm),
    yoy_funding_change_pct: unwrap<number | null>(raw.yoy_funding_change_pct),
    top_investors: raw.top_investors ?? [],
    capital_velocity_signal: raw.capital_velocity_signal ?? null,
    _sources: Object.keys(_sources).length > 0 ? _sources : undefined,
  };
}

// ── Transform market sizing ───────────────────────────────

function mapMarketSizing(raw: any): MarketSizingResult {
  const tamCurrentSources: SourceRef[] = [];
  const tamProjectedSources: SourceRef[] = [];

  if (raw.tam_current?.source_url) {
    tamCurrentSources.push({
      title: raw.tam_current.source_title || "",
      url: raw.tam_current.source_url,
      snippet: raw.tam_current.snippet || undefined,
    });
  }
  if (raw.tam_projected?.source_url) {
    tamProjectedSources.push({
      title: raw.tam_projected.source_title || "",
      url: raw.tam_projected.source_url,
      snippet: raw.tam_projected.snippet || undefined,
    });
  }

  const allSources: SourceRef[] = (raw.all_sources ?? [])
    .filter((s: any) => s.url)
    .map((s: any) => ({ title: s.title || "", url: s.url }));

  return {
    tam_current_mm: raw.tam_current?.value_mm ?? null,
    tam_current_year: raw.tam_current?.year ?? null,
    tam_projected_mm: raw.tam_projected?.value_mm ?? null,
    tam_projected_year: raw.tam_projected?.year ?? null,
    sam_current_mm: unwrap<number | null>(raw.sam_current_mm),
    growth_projections: (raw.growth_projections ?? []).map((gp: any): GrowthProjection => ({
      cagr_pct: gp.cagr_pct ?? null,
      start_year: gp.start_year ?? null,
      end_year: gp.end_year ?? null,
      start_value_mm: gp.start_value_mm ?? null,
      end_value_mm: gp.end_value_mm ?? null,
      source: gp.source ?? null,
      source_url: gp.source_url ?? null,
      source_title: gp.source_title ?? null,
    })),
    market_size_estimates: (raw.market_size_estimates ?? []).map((e: any): MarketSizeEstimate => ({
      value_mm: e.value_mm ?? null,
      year: e.year ?? null,
      source: e.source ?? null,
      source_url: e.source_url ?? null,
      source_title: e.source_title ?? null,
    })),
    regional_breakdown: (raw.regional_breakdown ?? [])
      .filter((rb: any) => rb.share_pct != null || rb.value_mm != null)
      .map((rb: any): RegionalBreakdown => ({
        region: rb.region,
        share_pct: rb.share_pct ?? null,
        value_mm: rb.value_mm ?? null,
      })),
    key_growth_drivers: raw.key_growth_drivers ?? [],
    key_headwinds: raw.key_headwinds ?? [],
    data_confidence: raw.data_confidence ?? null,
    confidence_note: raw.confidence_note ?? null,
    tam_current_sources: tamCurrentSources.length > 0 ? tamCurrentSources : undefined,
    tam_projected_sources: tamProjectedSources.length > 0 ? tamProjectedSources : undefined,
    all_sources: allSources.length > 0 ? allSources : undefined,
  };
}

// ── Hardcoded verdicts ────────────────────────────────────

const VERDICTS: Record<string, Verdict> = {
  "demo-1": {
    verdict: "GO",
    confidence: 0.78,
    summary:
      "Strong opportunity with identifiable white space in AI-native code review. High capital velocity signals market validation, but dominant incumbent presence requires differentiated positioning.",
    factors: [
      { factor: "Market Growth", assessment: "26.6% CAGR to $25.7B by 2030", signal: "positive" },
      { factor: "Capital Signal", assessment: "Accelerating, 80% YoY increase", signal: "positive" },
      { factor: "Incumbent Grip", assessment: "GitHub Copilot holds 42% share", signal: "negative" },
      { factor: "White Space", assessment: "AI-native review underserved", signal: "positive" },
      { factor: "Barrier to Entry", assessment: "Moderate, requires LLM expertise", signal: "neutral" },
      { factor: "Data Confidence", assessment: "Medium, multiple sources diverge", signal: "neutral" },
    ],
  },
  "demo-2": {
    verdict: "NO-GO",
    confidence: 0.35,
    summary:
      "Cloud computing infrastructure is dominated by hyperscalers with massive capital moats. New entrants face extreme barriers to entry and incumbents are aggressively expanding AI infrastructure offerings.",
    factors: [
      { factor: "Market Growth", assessment: "Strong growth but saturating", signal: "positive" },
      { factor: "Capital Signal", assessment: "Decelerating outside hyperscalers", signal: "negative" },
      { factor: "Incumbent Grip", assessment: "AWS + Azure + GCP control 65%+", signal: "negative" },
      { factor: "White Space", assessment: "Limited, edge/sovereign cloud only", signal: "neutral" },
      { factor: "Barrier to Entry", assessment: "Extreme, billions in capex", signal: "negative" },
      { factor: "Data Confidence", assessment: "High, well-documented market", signal: "positive" },
    ],
  },
  "demo-3": {
    verdict: "GO",
    confidence: 0.62,
    summary:
      "Autonomous vehicle robotaxi services present a high-risk, high-reward opportunity. Waymo leads but the market is pre-revenue for most players, with regulatory tailwinds accelerating deployment timelines.",
    factors: [
      { factor: "Market Growth", assessment: "Projected $45B+ by 2030", signal: "positive" },
      { factor: "Capital Signal", assessment: "Steady, massive rounds continue", signal: "positive" },
      { factor: "Incumbent Grip", assessment: "Waymo leads, others scaling", signal: "neutral" },
      { factor: "White Space", assessment: "Geographic expansion wide open", signal: "positive" },
      { factor: "Barrier to Entry", assessment: "Very high, regulatory + tech", signal: "negative" },
      { factor: "Data Confidence", assessment: "Low, pre-revenue market", signal: "neutral" },
    ],
  },
};

// ── Case ID → demo ID mapping ─────────────────────────────

const CASE_MAP: Record<string, { caseId: number; company: string; market: string }> = {
  "demo-1": { caseId: 1, company: "Salesforce", market: "AI code review" },
  "demo-2": { caseId: 4, company: "Coca-Cola", market: "Cloud computing infrastructure" },
  "demo-3": { caseId: 9, company: "Toyota", market: "Autonomous vehicle robotaxi services" },
};

function findCase(results: any[], caseId: number): any | null {
  return results.find((r: any) => r.case_id === caseId) ?? null;
}

// ── Main export ───────────────────────────────────────────

export function getDemoAnalysis(demoId: string): AnalysisResponse | null {
  const config = CASE_MAP[demoId];
  if (!config) return null;

  const incCase = findCase(incumbentsRaw.results, config.caseId);
  const emgCase = findCase(emergingRaw.results, config.caseId);
  const mktCase = findCase(marketSizingRaw.results, config.caseId);

  const results: AnalysisResults = {
    incumbents: incCase ? incCase.competitors.map(mapCompetitor) : [],
    emerging_competitors: emgCase ? emgCase.emerging_competitors.map(mapEmergingCompetitor) : [],
    capital_flow: emgCase?.capital_flow ? mapCapitalFlow(emgCase.capital_flow) : null,
    market_sizing: mktCase ? mapMarketSizing(mktCase) : null,
    verdict: VERDICTS[demoId] ?? null,
  };

  return {
    id: demoId,
    status: "complete",
    company: config.company,
    market: config.market,
    workflow: null,
    agent_statuses: {
      incumbents: "completed",
      emerging: "completed",
      market_sizing: "completed",
      synthesis: "completed",
    },
    agent_sub_phases: {},
    results,
  };
}

export const DEMO_IDS = Object.keys(CASE_MAP);
export const DEMO_INFO = Object.entries(CASE_MAP).map(([id, cfg]) => ({
  id,
  company: cfg.company,
  market: cfg.market,
}));
