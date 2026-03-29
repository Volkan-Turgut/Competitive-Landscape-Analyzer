import type { Verdict, Competitor, EmergingCompetitor, CapitalFlow, MarketSizingResult } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface SynthesisViewProps {
  verdict: Verdict | null;
  company: string;
  market: string;
  incumbents: Competitor[];
  emergingCompetitors: EmergingCompetitor[];
  capitalFlow: CapitalFlow | null;
  marketSizing: MarketSizingResult | null;
}

function Card({ children, accentColor }: { children: React.ReactNode; accentColor?: string }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: 14,
      padding: 24,
      position: "relative",
      overflow: "hidden",
    }}>
      {accentColor && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accentColor, borderRadius: "14px 14px 0 0" }} />
      )}
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>
      {children}
    </h3>
  );
}

export function SynthesisView({ verdict, company, incumbents, emergingCompetitors, capitalFlow, marketSizing }: SynthesisViewProps) {
  if (!verdict) {
    return <div style={{ color: "var(--text-tertiary)", padding: 40, textAlign: "center" }}>No synthesis data available</div>;
  }

  const leader = incumbents.find((c) => c.market_position === "leader");
  const topByShare = [...incumbents].sort((a, b) => (b.market_share_pct ?? 0) - (a.market_share_pct ?? 0))[0];
  const topIncumbent = topByShare ?? leader ?? incumbents[0];
  const primaryGp = marketSizing?.growth_projections[0];
  const positiveFactors = verdict.factors.filter((f) => f.signal === "positive");
  const negativeFactors = verdict.factors.filter((f) => f.signal === "negative" || f.signal === "neutral");
  const isGo = verdict.verdict === "GO";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── 1. Analysis Methodology ─────────────────────────── */}
      <div>
        <SectionTitle>Analysis Methodology</SectionTitle>
        <Card accentColor="linear-gradient(90deg, #8b5cf6, #a78bfa)">
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16 }}>
            Three specialized research agents ran in parallel — <strong style={{ color: "var(--text-primary)" }}>Incumbents</strong>, <strong style={{ color: "var(--text-primary)" }}>Emerging Competitors</strong>, and <strong style={{ color: "var(--text-primary)" }}>Market Sizing</strong> — each conducting independent web searches across analyst reports, funding databases, and industry sources. A synthesis agent then cross-referenced all findings to produce the final assessment.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Stat label="Incumbents found" value={String(incumbents.length)} color="#3b82f6" />
            <Stat label="Emerging tracked" value={String(emergingCompetitors.length)} color="#f59e0b" />
            <Stat label="Data confidence" value={marketSizing?.data_confidence ?? "N/A"} color="#10b981" />
          </div>
        </Card>
      </div>

      {/* ── 2. Company Assessment ───────────────────────────── */}
      <div>
        <SectionTitle>Company Assessment</SectionTitle>
        <Card accentColor={isGo ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #f43f5e, #fb7185)"}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)" }}>{company}</span>
            <span style={{ fontSize: "0.7rem", padding: "2px 10px", borderRadius: 99, fontWeight: 500, background: isGo ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)", color: isGo ? "#10b981" : "#f43f5e" }}>
              {verdict.verdict}
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 0 }}>
            {verdict.summary}
          </p>
        </Card>
      </div>

      {/* ── 3. Key Findings by Research Space ───────────────── */}
      <div>
        <SectionTitle>Key Findings by Research Space</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {/* Incumbents card */}
          <Card accentColor="linear-gradient(90deg, #3b82f6, #60a5fa)">
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#3b82f6", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Incumbents
            </div>
            {topIncumbent ? (
              <>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6 }}>
                  Top player: <strong style={{ color: "var(--text-primary)" }}>{topIncumbent.name}</strong>
                </div>
                {topIncumbent.market_share_pct != null && (
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6 }}>
                    Market share: <strong style={{ color: "var(--text-primary)" }}>{topIncumbent.market_share_pct}%</strong>
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>No incumbent data</div>
            )}
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {incumbents.length} competitor{incumbents.length !== 1 ? "s" : ""} analyzed
            </div>
            {incumbents.filter((c) => c.market_position === "leader").length > 0 && (
              <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", marginTop: 8 }}>
                {incumbents.filter((c) => c.market_position === "leader").length} leader{incumbents.filter((c) => c.market_position === "leader").length !== 1 ? "s" : ""}, {incumbents.filter((c) => c.market_position === "challenger").length} challenger{incumbents.filter((c) => c.market_position === "challenger").length !== 1 ? "s" : ""}, {incumbents.filter((c) => c.market_position === "niche").length} niche
              </div>
            )}
          </Card>

          {/* Emerging card */}
          <Card accentColor="linear-gradient(90deg, #f59e0b, #fbbf24)">
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#f59e0b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Emerging
            </div>
            {capitalFlow ? (
              <>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6 }}>
                  Capital (2yr): <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(capitalFlow.total_funding_last_2_years_mm)}</strong>
                </div>
                {capitalFlow.capital_velocity_signal && (
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6 }}>
                    Velocity: <strong style={{ color: capitalFlow.capital_velocity_signal === "accelerating" ? "#10b981" : capitalFlow.capital_velocity_signal === "decelerating" ? "#f43f5e" : "var(--text-primary)" }}>{capitalFlow.capital_velocity_signal}</strong>
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>No capital flow data</div>
            )}
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {emergingCompetitors.length} entrant{emergingCompetitors.length !== 1 ? "s" : ""} tracked
            </div>
          </Card>

          {/* Market Sizing card */}
          <Card accentColor="linear-gradient(90deg, #10b981, #34d399)">
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#10b981", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Market Sizing
            </div>
            {marketSizing ? (
              <>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6 }}>
                  TAM: <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(marketSizing.tam_current_mm)}</strong>
                  {marketSizing.tam_current_year && <span style={{ color: "var(--text-tertiary)" }}> ({marketSizing.tam_current_year})</span>}
                </div>
                {primaryGp?.cagr_pct != null && (
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6 }}>
                    CAGR: <strong style={{ color: "var(--text-primary)" }}>{primaryGp.cagr_pct}%</strong>
                  </div>
                )}
                {marketSizing.data_confidence && (
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Confidence: <strong style={{ color: marketSizing.data_confidence === "high" ? "#10b981" : marketSizing.data_confidence === "low" ? "#f43f5e" : "#f59e0b" }}>{marketSizing.data_confidence}</strong>
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>No market sizing data</div>
            )}
          </Card>
        </div>
      </div>

      {/* ── 4 & 5. Risk Factors + Opportunity Rationale ─────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Opportunity Rationale */}
        <div>
          <SectionTitle>Opportunity Rationale</SectionTitle>
          <Card accentColor="linear-gradient(90deg, #10b981, #34d399)">
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {positiveFactors.map((f) => (
                <li key={f.factor} style={{ display: "flex", gap: 8, fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 10 }}>
                  <span style={{ color: "#10b981", flexShrink: 0, fontWeight: 600 }}>+</span>
                  <span><strong style={{ color: "var(--text-primary)" }}>{f.factor}:</strong> {f.assessment}</span>
                </li>
              ))}
              {marketSizing?.key_growth_drivers.map((d, i) => (
                <li key={i} style={{ display: "flex", gap: 8, fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 10 }}>
                  <span style={{ color: "#10b981", flexShrink: 0, fontWeight: 600 }}>+</span>
                  <span>{d}</span>
                </li>
              ))}
              {positiveFactors.length === 0 && !marketSizing?.key_growth_drivers.length && (
                <li style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>No positive signals identified</li>
              )}
            </ul>
          </Card>
        </div>

        {/* Risk Factors */}
        <div>
          <SectionTitle>Risk Factors</SectionTitle>
          <Card accentColor="linear-gradient(90deg, #f59e0b, #fbbf24)">
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {negativeFactors.map((f) => (
                <li key={f.factor} style={{ display: "flex", gap: 8, fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 10 }}>
                  <span style={{ color: "#f59e0b", flexShrink: 0, fontWeight: 600 }}>&minus;</span>
                  <span><strong style={{ color: "var(--text-primary)" }}>{f.factor}:</strong> {f.assessment}</span>
                </li>
              ))}
              {marketSizing?.key_headwinds.map((h, i) => (
                <li key={i} style={{ display: "flex", gap: 8, fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 10 }}>
                  <span style={{ color: "#f59e0b", flexShrink: 0, fontWeight: 600 }}>&minus;</span>
                  <span>{h}</span>
                </li>
              ))}
              {negativeFactors.length === 0 && !marketSizing?.key_headwinds.length && (
                <li style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>No risk factors identified</li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{label}:</span>
      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}
