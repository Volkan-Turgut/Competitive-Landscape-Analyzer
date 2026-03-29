import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { Competitor, SourceRef } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { SourceTooltip } from "@/components/ui/SourceTooltip";
import { ChartContainer, NoData, CHART_COLORS, SourceBar, SourcePieChart } from "./Charts";
import { useInView } from "@/hooks/useInView";

interface IncumbentsViewProps {
  competitors: Competitor[];
}

const POSITION_COLORS: Record<string, { bg: string; text: string }> = {
  leader: { bg: "rgba(16,185,129,0.12)", text: "#10b981" },
  challenger: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" },
  niche: { bg: "rgba(139,92,246,0.08)", text: "#a78bfa" },
};

export function IncumbentsView({ competitors }: IncumbentsViewProps) {
  if (!competitors.length) return <NoData label="No incumbent data available" />;

  const withShare = competitors.filter((c) => c.market_share_pct != null);
  const shareTotal = withShare.reduce((sum, c) => sum + c.market_share_pct!, 0);

  let included = withShare;
  let excluded: Competitor[] = [];
  if (shareTotal > 100) {
    const sorted = [...withShare].sort((a, b) => a.market_share_pct! - b.market_share_pct!);
    included = [];
    let running = 0;
    for (const c of sorted) {
      if (running + c.market_share_pct! <= 100) {
        included.push(c);
        running += c.market_share_pct!;
      } else {
        excluded.push(c);
      }
    }
  }

  const significant = included.filter((c) => c.market_share_pct! >= 10);
  const significantTotal = significant.reduce((sum, c) => sum + c.market_share_pct!, 0);
  const othersValue = Math.round((100 - significantTotal) * 10) / 10;

  const shareData = [
    ...significant.map((c) => ({
      name: c.name,
      value: c.market_share_pct!,
      _sources: c._sources?.market_share_pct ?? [],
      _formattedValue: `${c.market_share_pct}%`,
    })),
    ...(othersValue > 0 ? [{
      name: "Others",
      value: othersValue,
      _sources: [] as SourceRef[],
      _formattedValue: `${othersValue}%`,
      _fill: "#4a4a5a",
    }] : []),
  ];

  const truncName = (n: string) => n.length > 20 ? n.slice(0, 18) + "..." : n;

  const arrData = competitors
    .filter((c) => c.revenue_arr_mm != null)
    .map((c) => ({
      name: truncName(c.name),
      value: c.revenue_arr_mm!,
      _sources: [...(c._sources?.revenue_arr_mm ?? [])],
      _formattedValue: formatCurrency(c.revenue_arr_mm),
      _label: "ARR",
    }))
    .sort((a, b) => b.value - a.value);

  const annualData = competitors
    .filter((c) => c.revenue_annual_mm != null)
    .map((c) => ({
      name: truncName(c.name),
      value: c.revenue_annual_mm!,
      _sources: [...(c._sources?.revenue_annual_mm ?? [])],
      _formattedValue: formatCurrency(c.revenue_annual_mm),
      _label: "Revenue",
    }))
    .sort((a, b) => b.value - a.value);

  const hasShare = shareData.length > 0;
  const hasArr = arrData.length > 0;
  const hasAnnual = annualData.length > 0;

  const pieInView = useInView(0.2);
  const arrInView = useInView(0.2);
  const annualInView = useInView(0.2);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Market share donut — full width */}
      {hasShare && (
        <div ref={pieInView.ref} style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: 28, position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #3b82f6, #60a5fa)", borderRadius: "14px 14px 0 0" }} />
          <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: 20 }}>Market Share</div>
          <div style={{ background: "var(--bg-inset)", borderRadius: 10, padding: "12px 0" }}>
            {pieInView.inView ? <SourcePieChart data={shareData} height={320} /> : <div style={{ height: 320 }} />}
          </div>
          {excluded.length > 0 && (
            <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", marginTop: 8, fontStyle: "italic" }}>
              * {excluded.map((c) => `${c.name} (${c.market_share_pct}%)`).join(", ")} excluded — different market segment
            </div>
          )}
        </div>
      )}

      {/* Revenue charts — side by side on desktop, stacked on mobile */}
      {(hasArr || hasAnnual) && (
        <div style={{ display: "grid", gridTemplateColumns: hasArr && hasAnnual ? "1fr 1fr" : "1fr", gap: 24 }}>
          {hasArr && (
            <div ref={arrInView.ref} style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: 28, position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #3b82f6, #60a5fa)", borderRadius: "14px 14px 0 0" }} />
              <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: 20 }}>Annual Recurring Revenue ($M)</div>
              <div style={{ background: "var(--bg-inset)", borderRadius: 10, padding: "12px 8px" }}>
                {arrInView.inView ? (
                  <ChartContainer height={Math.max(280, arrData.length * 40)}>
                    <BarChart data={arrData} layout="vertical" margin={{ left: 10, right: 30 }} tabIndex={-1} style={{ outline: "none" }}>
                      <CartesianGrid fill="transparent" strokeOpacity={0} />
                      <XAxis type="number" tick={{ fill: CHART_COLORS.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill: CHART_COLORS.axis, fontSize: 11 }} width={100} axisLine={false} tickLine={false} />
                      <Bar dataKey="value" fill={CHART_COLORS.blue} barSize={20} name="ARR" shape={<SourceBar />} />
                    </BarChart>
                  </ChartContainer>
                ) : <div style={{ height: Math.max(280, arrData.length * 40) }} />}
              </div>
            </div>
          )}

          {hasAnnual && (
            <div ref={annualInView.ref} style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: 28, position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #06b6d4, #22d3ee)", borderRadius: "14px 14px 0 0" }} />
              <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: 20 }}>Annual Revenue ($M)</div>
              <div style={{ background: "var(--bg-inset)", borderRadius: 10, padding: "12px 8px" }}>
                {annualInView.inView ? (
                  <ChartContainer height={Math.max(280, annualData.length * 40)}>
                    <BarChart data={annualData} layout="vertical" margin={{ left: 10, right: 30 }} tabIndex={-1} style={{ outline: "none" }}>
                      <CartesianGrid fill="transparent" strokeOpacity={0} />
                      <XAxis type="number" tick={{ fill: CHART_COLORS.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill: CHART_COLORS.axis, fontSize: 11 }} width={100} axisLine={false} tickLine={false} />
                      <Bar dataKey="value" fill={CHART_COLORS.cyan} barSize={20} name="Revenue" shape={<SourceBar />} />
                    </BarChart>
                  </ChartContainer>
                ) : <div style={{ height: Math.max(280, annualData.length * 40) }} />}
              </div>
            </div>
          )}
        </div>
      )}

      {!hasShare && !hasArr && !hasAnnual && <NoData label="No chart data available" />}

      {/* Competitor table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 14, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #8b5cf6, #a78bfa)" }} />
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["Company", "Position", "Revenue", "Share", "Pricing"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "16px 20px", fontSize: "0.7rem", fontWeight: 400, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {competitors.map((c) => {
              const pos = POSITION_COLORS[c.market_position] || POSITION_COLORS.niche;
              const rev = c.revenue_arr_mm ?? c.revenue_annual_mm;
              return (
                <tr key={c.name} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-glow)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                  <td style={{ padding: "14px 20px", fontWeight: 500, color: "var(--text-primary)" }}>{c.name}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 500, background: pos.bg, color: pos.text }}>
                      {c.market_position}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--text-primary)", fontFamily: "monospace" }}>
                    <SourceTooltip sources={c._sources?.revenue_arr_mm ?? c._sources?.revenue_annual_mm}>
                      {rev != null ? formatCurrency(rev) : "\u2014"}
                    </SourceTooltip>
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--text-primary)", fontFamily: "monospace" }}>
                    <SourceTooltip sources={c._sources?.market_share_pct}>
                      {c.market_share_pct != null ? formatPercent(c.market_share_pct) : "\u2014"}
                    </SourceTooltip>
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--text-muted)", fontSize: "0.78rem", maxWidth: 320, whiteSpace: "normal", wordBreak: "break-word" }}>
                    <SourceTooltip sources={c._sources?.pricing_range ?? c._sources?.pricing_model}>
                      {c.pricing_range ?? c.pricing_model ?? "\u2014"}
                    </SourceTooltip>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
