import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import type { SourceRef } from "@/types";

export const CHART_COLORS = {
  blue: "#3b82f6",
  emerald: "#10b981",
  amber: "#f59e0b",
  violet: "#8b5cf6",
  rose: "#f43f5e",
  cyan: "#06b6d4",
  muted: "var(--text-tertiary)",
  axis: "var(--text-secondary)",
  grid: "var(--border-subtle)",
};

export const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4", "#f43f5e", "#a78bfa", "#fbbf24"];

export function ChartContainer({ children, height = 300 }: { children: ReactNode; height?: number }) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

/* ── Shared tooltip card content ─────────────────────────── */

function TooltipCard({ name, label, value, sources }: { name: string; label?: string; value: string; sources: SourceRef[] }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{name}</p>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {label ? `${label}: ` : ""}{value}
      </p>
      {sources.length > 0 && (
        <>
          <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "var(--text-tertiary)" }}>Sources</p>
          {sources.slice(0, 3).map((s, i) => (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#7c5aff] hover:underline leading-snug"
              onClick={(e) => e.stopPropagation()}
            >
              {s.title || s.url}
            </a>
          ))}
          {sources.length > 3 && (
            <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>and {sources.length - 3} more</span>
          )}
        </>
      )}
    </div>
  );
}

const TOOLTIP_CLASS = "max-w-[320px] !bg-[var(--bg-card)] !text-[var(--text-primary)] border border-[var(--border-secondary)] !shadow-lg !p-3 !rounded-lg";

/* ── SourceBar — custom bar shape with shadcn tooltip ────── */

export function SourceBar(props: any) {
  const { x, y, width, height, fill, payload } = props;
  const sources: SourceRef[] = payload?._sources ?? [];
  const displayName = payload?.name ?? "";
  const label = payload?._label ?? "";
  const displayValue = payload?._formattedValue
    ?? (typeof payload?.value === "number" ? payload.value.toLocaleString() : String(payload?.value ?? ""));

  if (!sources.length) {
    return (
      <g>
        <rect x={x} y={y} width={Math.max(width, 0)} height={height} fill={fill} rx={4} ry={4} />
      </g>
    );
  }

  return (
    <foreignObject x={x} y={y} width={Math.max(width, 1)} height={height} style={{ overflow: "visible" }}>
      <TooltipProvider delay={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div style={{ width: Math.max(width, 1), height, background: fill, borderRadius: "0 4px 4px 0", cursor: "pointer" }} />
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8} className={TOOLTIP_CLASS}>
            <TooltipCard name={displayName} label={label} value={displayValue} sources={sources} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </foreignObject>
  );
}

/* ── SourcePieChart — pie with hover-tracked source tooltip ── */

export interface PieSliceData {
  name: string;
  value: number;
  _sources?: SourceRef[];
  _formattedValue?: string;
  _fill?: string;
}

export function SourcePieChart({ data, height = 320 }: { data: PieSliceData[]; height?: number }) {
  const [hasAnimated, setHasAnimated] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 900);
    return () => clearTimeout(timer);
  }, []);
  const [hoverState, setHoverState] = useState<{ index: number; x: number; y: number } | null>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entry = hoverState !== null ? data[hoverState.index] : null;

  const handleSliceEnter = useCallback((sliceData: any, i: number) => {
    if (!data[i]?._sources?.length) return;
    if (hideTimeout.current) { clearTimeout(hideTimeout.current); hideTimeout.current = null; }
    const rad = (sliceData.midAngle * Math.PI) / 180;
    const offset = 150;
    const x = sliceData.cx + (sliceData.outerRadius + offset) * Math.cos(rad);
    const y = sliceData.cy - (sliceData.outerRadius + offset) * Math.sin(rad);
    setHoverState({ index: i, x, y });
  }, [data]);

  const handleSliceLeave = useCallback(() => {
    hideTimeout.current = setTimeout(() => setHoverState(null), 300);
  }, []);

  const handleTooltipEnter = useCallback(() => {
    if (hideTimeout.current) { clearTimeout(hideTimeout.current); hideTimeout.current = null; }
  }, []);

  const handleTooltipLeave = useCallback(() => {
    setHoverState(null);
  }, []);

  return (
    <div style={{ position: "relative", overflow: "visible" }}>
      <ChartContainer height={height}>
        <PieChart tabIndex={-1} style={{ outline: "none" }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            dataKey="value"
            stroke="none"
            label={({ name, value }) => `${name.split(" ")[0]} ${value}%`}
            isAnimationActive={!hasAnimated}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
            onMouseEnter={(sliceData: any, i: number) => handleSliceEnter(sliceData, i)}
            onMouseLeave={handleSliceLeave}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={data[i]._fill ?? PIE_COLORS[i % PIE_COLORS.length]}
                style={{ cursor: "pointer", outline: "none" }}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* Hover tooltip — positioned near the hovered slice */}
      {entry && hoverState && (
        <div
          onMouseEnter={handleTooltipEnter}
          onMouseLeave={handleTooltipLeave}
          style={{
            position: "absolute",
            left: hoverState.x,
            top: hoverState.y,
            transform: "translate(-50%, -50%)",
            zIndex: 50,
            background: "var(--bg-card)",
            border: "1px solid var(--border-secondary)",
            borderRadius: 10,
            padding: 12,
            maxWidth: 320,
            minWidth: 180,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            pointerEvents: "auto",
          }}
        >
          <TooltipCard
            name={entry.name}
            label="Share"
            value={entry._formattedValue ?? `${entry.value}%`}
            sources={entry._sources ?? []}
          />
        </div>
      )}
    </div>
  );
}

/* ── Recharts tooltip for AreaChart ─────────────────────── */

export function ThemedTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-secondary)", borderRadius: 8, padding: "8px 12px", fontSize: "0.8rem", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
      {label && <div style={{ color: "var(--text-primary)", marginBottom: 4, fontWeight: 500 }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || "var(--text-muted)", fontSize: "0.75rem" }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
}

export const DARK_TOOLTIP_PROPS = {
  content: ThemedTooltipContent,
  wrapperStyle: { outline: "none", zIndex: 10 },
  contentStyle: { background: "transparent", border: "none", padding: 0 },
  cursor: { fill: "var(--bg-card-hover)" },
  allowEscapeViewBox: { x: true, y: true },
} as const;

export function NoData({ label = "Data unavailable" }: { label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
      {label}
    </div>
  );
}
