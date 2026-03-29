import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { MarketSizingResult, SourceRef } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ChartContainer, NoData, CHART_COLORS, DARK_TOOLTIP_PROPS, SourceBar } from "./Charts";
import { SourceTooltip } from "@/components/ui/SourceTooltip";
import { useInView } from "@/hooks/useInView";

interface MarketSizingViewProps {
  data: MarketSizingResult;
}


function AreaChartCard({ areaData }: { areaData: { year: number; value: number }[] }) {
  const { ref, inView } = useInView(0.2);
  return (
    <div ref={ref} style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: 28, position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #8b5cf6, #a78bfa, #c4b5fd)", borderRadius: "14px 14px 0 0" }} />
      <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: 20 }}>TAM Growth Projection ($M)</div>
      <div style={{ background: "var(--bg-inset)", borderRadius: 10, padding: "12px 8px" }}>
        {inView ? (
          <ChartContainer height={320}>
            <AreaChart data={areaData} margin={{ left: 10, right: 10 }} tabIndex={-1} style={{ outline: 'none' }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis dataKey="year" tick={{ fill: CHART_COLORS.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: CHART_COLORS.axis, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}B`} />
              <Tooltip {...DARK_TOOLTIP_PROPS} />
              <Area type="monotone" dataKey="value" stroke={CHART_COLORS.violet} fill={CHART_COLORS.violet} fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        ) : <div style={{ height: 320 }} />}
      </div>
    </div>
  );
}

function EstimatesChart({ estimateData }: { estimateData: { name: string; value: number; _sources: any[]; _formattedValue: string }[] }) {
  const { ref, inView } = useInView(0.2);
  const h = Math.max(280, estimateData.length * 36);
  return (
    <div ref={ref} style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: 28, position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #06b6d4, #22d3ee)", borderRadius: "14px 14px 0 0" }} />
      <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: 20 }}>Market Size Estimates by Source</div>
      <div style={{ background: "var(--bg-inset)", borderRadius: 10, padding: "12px 8px" }}>
        {inView ? (
          <ChartContainer height={h}>
            <BarChart data={estimateData} layout="vertical" margin={{ left: 10, right: 30 }} tabIndex={-1} style={{ outline: 'none' }}>
              <CartesianGrid fill="transparent" strokeOpacity={0} />
              <XAxis type="number" tick={{ fill: CHART_COLORS.axis, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}B`} />
              <YAxis type="category" dataKey="name" tick={{ fill: CHART_COLORS.axis, fontSize: 10 }} width={180} axisLine={false} tickLine={false} />
              <Bar dataKey="value" fill={CHART_COLORS.cyan} barSize={16} shape={<SourceBar />} />
            </BarChart>
          </ChartContainer>
        ) : <div style={{ height: h }} />}
      </div>
    </div>
  );
}

export function MarketSizingView({ data }: MarketSizingViewProps) {
  const primaryGp = data.growth_projections[0];
  const areaData: { year: number; value: number }[] = [];
  if (primaryGp && primaryGp.start_year && primaryGp.end_year) {
    const startVal = primaryGp.start_value_mm ?? data.tam_current_mm ?? 0;
    const cagr = (primaryGp.cagr_pct ?? 0) / 100;
    const years = primaryGp.end_year - primaryGp.start_year;
    for (let i = 0; i <= years; i++) {
      areaData.push({ year: primaryGp.start_year + i, value: Math.round(startVal * Math.pow(1 + cagr, i)) });
    }
  }

  const estimateData = data.market_size_estimates
    .filter((e) => e.value_mm != null)
    .map((e) => ({
      name: `${e.year ?? "?"} (${e.source ?? "Unknown"})`,
      value: e.value_mm!,
      _sources: e.source_url ? [{ title: e.source_title || e.source || "", url: e.source_url } as SourceRef] : [],
      _formattedValue: formatCurrency(e.value_mm),
    }));

  const pctRegions = data.regional_breakdown.filter((r) => r.share_pct != null);
  const hasRegions = pctRegions.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* TAM summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {([
          { label: `TAM (${data.tam_current_year ?? "Current"})`, value: formatCurrency(data.tam_current_mm), gradient: "linear-gradient(90deg, #3b82f6, #60a5fa)", sources: data.tam_current_sources },
          { label: `TAM (${data.tam_projected_year ?? "Projected"})`, value: formatCurrency(data.tam_projected_mm), gradient: "linear-gradient(90deg, #8b5cf6, #a78bfa)", sources: data.tam_projected_sources },
          { label: "CAGR", value: primaryGp?.cagr_pct != null ? `${primaryGp.cagr_pct}%` : "\u2014", gradient: "linear-gradient(90deg, #10b981, #34d399)", sub: primaryGp?.source, sources: primaryGp?.source_url ? [{ title: primaryGp.source_title || primaryGp.source || "", url: primaryGp.source_url } as SourceRef] : undefined },
        ] as { label: string; value: string; gradient: string; sub?: string; sources?: SourceRef[] }[]).map((s) => (
          <div
            key={s.label}
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "20px 20px 18px", position: "relative", overflow: "hidden", transition: "background 0.3s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-card)"; }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.gradient }} />
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 600, color: "var(--text-primary)" }}>
              <SourceTooltip sources={s.sources}>
                {s.value}
              </SourceTooltip>
            </div>
            {s.sub && <div style={{ fontSize: "0.65rem", color: "var(--text-tertiary)", marginTop: 4 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Area chart — full width, tall */}
      {areaData.length > 1 ? (
        <AreaChartCard areaData={areaData} />
      ) : (
        <NoData label="Insufficient data for growth chart" />
      )}

      {/* Estimates bar chart — full width */}
      {estimateData.length > 0 && (
        <EstimatesChart estimateData={estimateData} />
      )}

      {/* Regional + drivers + headwinds — side by side */}
      <div style={{ display: "grid", gridTemplateColumns: hasRegions ? "1fr 1fr 1fr" : "1fr 1fr", gap: 16 }}>
        {hasRegions && (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: 24, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #3b82f6, #60a5fa)" }} />
            {pctRegions.length > 0 && (
              <>
                <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: 14 }}>Regional Share</div>
                {pctRegions.map((r, i) => (
                  <div key={`pct-${i}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "0.82rem", gap: 8 }}>
                    <span style={{ color: "var(--text-muted)" }}>{r.region}</span>
                    <span style={{ color: "var(--text-primary)", fontFamily: "monospace", flexShrink: 0 }}>{r.share_pct}%</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        <div style={{ background: "rgba(16,185,129,0.05)", borderLeft: "2px solid #10b981", border: "1px solid var(--border-subtle)", borderLeftWidth: 2, borderLeftColor: "#10b981", borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "#10b981", marginBottom: 14 }}>Growth Drivers</div>
          {data.key_growth_drivers.length > 0 ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {data.key_growth_drivers.map((d, i) => (
                <li key={i} style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 10, display: "flex", gap: 8 }}>
                  <span style={{ color: "#10b981", flexShrink: 0 }}>+</span> {d}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ color: "var(--text-tertiary)", fontSize: "0.82rem" }}>None identified</div>
          )}
        </div>

        <div style={{ background: "rgba(245,158,11,0.05)", borderLeft: "2px solid #f59e0b", border: "1px solid var(--border-subtle)", borderLeftWidth: 2, borderLeftColor: "#f59e0b", borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "#f59e0b", marginBottom: 14 }}>Key Headwinds</div>
          {data.key_headwinds.length > 0 ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {data.key_headwinds.map((h, i) => (
                <li key={i} style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 10, display: "flex", gap: 8 }}>
                  <span style={{ color: "#f59e0b", flexShrink: 0 }}>-</span> {h}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ color: "var(--text-tertiary)", fontSize: "0.82rem" }}>None identified</div>
          )}
        </div>
      </div>

      {/* Data confidence */}
      {data.data_confidence && (
        <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-5 mt-4">
          <div className="flex items-start gap-4">
            <span className={`shrink-0 rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              data.data_confidence === "high"
                ? "bg-green-500/10 text-green-500 border border-green-500/30"
                : data.data_confidence === "medium"
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                : "bg-red-500/10 text-red-500 border border-red-500/30"
            }`}>
              {data.data_confidence}
            </span>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">Data confidence</p>
              {data.confidence_note && (
                <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{data.confidence_note}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
