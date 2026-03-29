import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { EmergingCompetitor, CapitalFlow } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { SourceTooltip } from "@/components/ui/SourceTooltip";
import { ChartContainer, NoData, CHART_COLORS, SourceBar } from "./Charts";
import { GlowingCards, GlowingCard } from "@/components/ui/glowing-cards";
import { useInView } from "@/hooks/useInView";

interface EmergingViewProps {
  competitors: EmergingCompetitor[];
  capitalFlow: CapitalFlow | null;
}

const VELOCITY_COLORS: Record<string, { bg: string; text: string; gradient: string }> = {
  accelerating: { bg: "rgba(16,185,129,0.12)", text: "#10b981", gradient: "linear-gradient(90deg, #10b981, #34d399)" },
  steady: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b", gradient: "linear-gradient(90deg, #f59e0b, #fbbf24)" },
  decelerating: { bg: "rgba(244,63,94,0.12)", text: "#f43f5e", gradient: "linear-gradient(90deg, #f43f5e, #fb7185)" },
  nascent: { bg: "rgba(139,92,246,0.08)", text: "#a78bfa", gradient: "linear-gradient(90deg, #8b5cf6, #a78bfa)" },
};

function FundingChart({ fundingData }: { fundingData: { name: string; funding: number; _sources: any[]; _formattedValue: string; _label: string }[] }) {
  const { ref, inView } = useInView(0.2);
  const h = Math.max(280, fundingData.length * 40);
  return (
    <div ref={ref} style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: 28, position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #f59e0b, #fbbf24)", borderRadius: "14px 14px 0 0" }} />
      <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: 20 }}>Total Funding ($M)</div>
      <div style={{ background: "var(--bg-inset)", borderRadius: 10, padding: "12px 8px" }}>
        {inView ? (
          <ChartContainer height={h}>
            <BarChart data={fundingData} layout="vertical" margin={{ left: 10, right: 30 }} tabIndex={-1} style={{ outline: 'none' }}>
              <CartesianGrid fill="transparent" strokeOpacity={0} />
              <XAxis type="number" tick={{ fill: CHART_COLORS.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: CHART_COLORS.axis, fontSize: 11 }} width={110} axisLine={false} tickLine={false} />
              <Bar dataKey="funding" fill={CHART_COLORS.amber} barSize={18} shape={<SourceBar />} />
            </BarChart>
          </ChartContainer>
        ) : <div style={{ height: h }} />}
      </div>
    </div>
  );
}

export function EmergingView({ competitors, capitalFlow }: EmergingViewProps) {
  const fundingData = competitors
    .filter((c) => c.total_funding_mm != null)
    .map((c) => ({
      name: c.name.length > 18 ? c.name.slice(0, 16) + "..." : c.name,
      funding: c.total_funding_mm!,
      _sources: c._sources?.total_funding_mm ?? [],
      _formattedValue: formatCurrency(c.total_funding_mm),
      _label: "Funding",
    }))
    .sort((a, b) => b.funding - a.funding);

  const vel = capitalFlow?.capital_velocity_signal;
  const velStyle = vel ? VELOCITY_COLORS[vel] || VELOCITY_COLORS.nascent : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Capital flow stat cards */}
      {capitalFlow && (
        <GlowingCards gap="0.75rem" padding="0" maxWidth="100%">
          <GlowingCard glowColor="#7c5aff" className="!min-w-0 !p-5 !rounded-xl">
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Capital (2yr)</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 600, color: "var(--text-primary)" }}><SourceTooltip sources={capitalFlow._sources?.total_funding_last_2_years_mm}>{formatCurrency(capitalFlow.total_funding_last_2_years_mm)}</SourceTooltip></div>
          </GlowingCard>
          <GlowingCard glowColor="#7c5aff" className="!min-w-0 !p-5 !rounded-xl">
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Deal count</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 600, color: "var(--text-primary)" }}><SourceTooltip sources={capitalFlow._sources?.deal_count_last_2_years}>{capitalFlow.deal_count_last_2_years?.toString() ?? "\u2014"}</SourceTooltip></div>
          </GlowingCard>
          <GlowingCard glowColor="#7c5aff" className="!min-w-0 !p-5 !rounded-xl">
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Avg deal size</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 600, color: "var(--text-primary)" }}><SourceTooltip sources={capitalFlow._sources?.average_deal_size_mm}>{formatCurrency(capitalFlow.average_deal_size_mm)}</SourceTooltip></div>
          </GlowingCard>
          <GlowingCard glowColor="#22c55e" className="!min-w-0 !p-5 !rounded-xl">
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>YoY change</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 600, color: "var(--text-primary)" }}><SourceTooltip sources={capitalFlow._sources?.yoy_funding_change_pct}>{capitalFlow.yoy_funding_change_pct != null ? `${capitalFlow.yoy_funding_change_pct > 0 ? "+" : ""}${capitalFlow.yoy_funding_change_pct}%` : "\u2014"}</SourceTooltip></div>
            {vel && <div style={{ fontSize: "0.7rem", color: "#10b981", marginTop: 4 }}>&#9650; {vel}</div>}
          </GlowingCard>
        </GlowingCards>
      )}

      {/* Velocity badge */}
      {velStyle && vel && (
        <div>
          <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 600, background: velStyle.bg, color: velStyle.text, textTransform: "uppercase", letterSpacing: 1 }}>
            {vel}
          </span>
        </div>
      )}

      {/* Funding bar chart — full width */}
      {fundingData.length > 0 ? (
        <FundingChart fundingData={fundingData} />
      ) : (
        <NoData label="No funding data available" />
      )}

      {/* Top investors */}
      {capitalFlow?.top_investors && capitalFlow.top_investors.length > 0 && (
        <div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 10 }}>Top Investors</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {capitalFlow.top_investors.map((inv) => (
              <span key={inv} style={{ padding: "5px 14px", borderRadius: 99, fontSize: "0.75rem", background: "rgba(139,92,246,0.08)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
                {inv}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Emerging companies table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 14, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #8b5cf6, #a78bfa)" }} />
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["Company", "Founded", "Funding", "Stage", "Differentiator"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "16px 20px", fontSize: "0.7rem", fontWeight: 400, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {competitors.map((c) => (
              <tr key={c.name} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-glow)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                <td style={{ padding: "14px 20px", fontWeight: 500, color: "var(--text-primary)" }}>{c.name}</td>
                <td style={{ padding: "14px 20px", color: "var(--text-muted)" }}><SourceTooltip sources={c._sources?.founded_year}>{c.founded_year ?? "\u2014"}</SourceTooltip></td>
                <td style={{ padding: "14px 20px", color: "var(--text-primary)", fontFamily: "monospace" }}><SourceTooltip sources={c._sources?.total_funding_mm}>{formatCurrency(c.total_funding_mm)}</SourceTooltip></td>
                <td style={{ padding: "14px 20px" }}>
                  {c.latest_round ? (
                    <span style={{ fontSize: "0.72rem", padding: "3px 10px", borderRadius: 99, background: "rgba(139,92,246,0.12)", color: "#a78bfa" }}>{c.latest_round.stage}</span>
                  ) : "\u2014"}
                </td>
                <td style={{ padding: "14px 20px", color: "var(--text-muted)", fontSize: "0.78rem", maxWidth: 320, whiteSpace: "normal", wordBreak: "break-word" }}>
                  <SourceTooltip sources={c._sources?.key_differentiator}>{c.key_differentiator ?? "\u2014"}</SourceTooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
