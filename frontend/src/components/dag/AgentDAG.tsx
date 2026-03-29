import { type CSSProperties } from "react";
import type { DAGState, AgentState } from "@/types";
import { ResultBadge } from "./ResultBadge";

/* ── Config ─────────────────────────────────────────────── */

interface AgentDAGProps {
  dagState: DAGState;
  company: string;
  market: string;
  detailNames?: { incumbents?: string[]; emerging?: string[] };
}

const AGENTS = {
  incumbents: { icon: "◆", label: "Incumbents", accent: "#3b82f6" },
  emerging: { icon: "▲", label: "Emerging", accent: "#f59e0b" },
  market_sizing: { icon: "●", label: "Market Sizing", accent: "#06b6d4" },
} as const;

const PHASE_LABELS: Record<string, string> = {
  discovery: "Discovery",
  detail: "Detail",
  company_research: "Company Research",
  cross_reference: "Cross-Reference",
};

const PHASE_ORDER: Record<string, string[]> = {
  incumbents: ["discovery", "detail"],
  emerging: ["discovery", "detail"],
  market_sizing: ["discovery", "detail"],
  synthesis: ["company_research", "cross_reference"],
};

/* ── Card styles ─────────────────────────────────────────── */

const CIRCLE_CARD: CSSProperties = {
  background: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "50%",
  padding: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/* ── Status helpers ─────────────────────────────────────── */

function isComplete(a: AgentState | undefined) { return a?.status === "completed"; }
function isRunning(a: AgentState | undefined) { return a?.status === "running"; }
function allResearchDone(agents: DAGState["agents"]) {
  return (["incumbents", "emerging", "market_sizing"] as const).every((id) => isComplete(agents[id]));
}
function anyResearchStarted(agents: DAGState["agents"]) {
  return (["incumbents", "emerging", "market_sizing"] as const).some(
    (id) => isRunning(agents[id]) || isComplete(agents[id])
  );
}

/* ── Connector building blocks ───────────────────────────── */

function VLine({ height = 32, flowing, complete, synthFlow }: {
  height?: number; flowing?: boolean; complete?: boolean; synthFlow?: boolean;
}) {
  let cls = "dag-v-line";
  if (complete) cls += " complete";
  else if (flowing) cls += " flowing";
  if (synthFlow) cls += " synthesis-flow";
  return <div className={cls} style={{ height }} />;
}

function ArrowTip({ complete }: { complete?: boolean }) {
  return (
    <div style={{
      width: 0, height: 0, flexShrink: 0,
      borderLeft: "5px solid transparent",
      borderRight: "5px solid transparent",
      borderTop: `6px solid ${complete ? "#22c55e" : "var(--border-primary)"}`,
    }} />
  );
}

function HLine({ width, complete }: { width: number; complete?: boolean }) {
  return <div className={`dag-h-line${complete ? " complete" : ""}`} style={{ width }} />;
}

/* ── Phase dot + label row ──────────────────────────────── */

function PhaseRow({ status, label, purpleAccent }: { status: string; label: string; purpleAccent?: boolean }) {
  const dotBg = status === "completed"
    ? (purpleAccent ? "#a78bfa" : "#22c55e")
    : status === "running" ? "#7c5aff" : "var(--border-secondary)";
  const labelColor = status === "completed"
    ? "var(--text-primary)"
    : status === "running" ? "#a78bfa" : "var(--text-secondary)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0" }}>
      <div style={{
        width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: dotBg,
        animation: status === "running" ? "dotPulse 1s infinite" : "none",
      }} />
      <span style={{ fontSize: 11, color: labelColor, fontWeight: status === "running" ? 500 : 400 }}>{label}</span>
    </div>
  );
}

/* ── Detail agent chips ─────────────────────────────────── */

function DetailChip({ name, status }: { name: string; status: string }) {
  const dotBg = status === "completed" ? "#22c55e" : status === "running" ? "#7c5aff" : "var(--text-tertiary)";
  const borderColor = status === "completed" ? "rgba(34,197,94,0.2)" : "var(--border-primary)";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 4, padding: "3px 8px",
      borderRadius: 6, background: "var(--bg-card)",
      border: `1px solid ${borderColor}`, fontSize: 9,
      color: "var(--text-secondary)", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: dotBg, flexShrink: 0 }} />
      {name}
    </div>
  );
}

function DetailChips({ names, detailStatus }: { names: string[]; detailStatus: string }) {
  if (!names.length) return null;
  return (
    <div style={{
      padding: "8px 10px", borderRadius: 10,
      border: "1px solid var(--border-primary)", background: "var(--bg-card)",
      width: 180,
    }}>
      <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, textAlign: "center" }}>
        Detail Agents ({names.length})
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
        {names.map((name) => (
          <DetailChip key={name} name={name} status={detailStatus === "completed" ? "completed" : detailStatus === "running" ? "running" : "pending"} />
        ))}
      </div>
    </div>
  );
}

/* ── Single branch (research agent) ─────────────────────── */

function Branch({ agentId, state, config, detailNames, chipSide }: {
  agentId: string;
  state: AgentState;
  config: { icon: string; label: string; accent: string };
  detailNames?: string[];
  chipSide?: "left" | "right";
}) {
  const { status, subPhases } = state;
  const done = status === "completed";
  const running = status === "running";
  const visible = running || done;

  const borderColor = done ? "#22c55e" : running ? config.accent : "var(--border-primary)";
  const labelColor = done ? "#22c55e" : running ? config.accent : "var(--text-tertiary)";
  const iconColor = done ? "#22c55e" : running ? config.accent : "var(--text-tertiary)";

  const discoveryStatus = subPhases.discovery?.status || "pending";
  const detailPhase = subPhases.detail;
  const showDetail = visible && agentId !== "market_sizing" && detailNames?.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 260 }}>
      {/* Top connector: h-bar → node */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <VLine height={32} flowing={running} complete={done} />
        <ArrowTip complete={running || done} />
      </div>

      {/* Node content — fades in */}
      <div style={{
        position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        opacity: visible ? 1 : 0.3,
        transform: visible ? "none" : "translateY(8px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}>
        {/* Circle card — anchor for side chips */}
        <div style={{ position: "relative" }}>
          <div style={{ ...CIRCLE_CARD, border: `2px solid ${borderColor}`, animation: running ? "pulse 1.5s ease-in-out infinite" : "none" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: iconColor }}>
              {config.icon}
            </div>
          </div>

          {/* Detail agents — positioned to the side, centered on the circle */}
          {showDetail && chipSide && (
            <div style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              ...(chipSide === "left"
                ? { right: "calc(100% + 16px)" }
                : { left: "calc(100% + 16px)" }),
            }}>
              <DetailChips names={detailNames!} detailStatus={detailPhase?.status || "pending"} />
            </div>
          )}
        </div>

        {/* Label */}
        <div style={{ fontSize: 13, fontWeight: 500, textAlign: "center", color: labelColor }}>{config.label}</div>

        {/* Discovery phase */}
        {visible && (
          <PhaseRow status={discoveryStatus} label="Discovery" />
        )}
      </div>

      {/* Bottom connector: node → merge h-bar */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 8 }}>
        <VLine height={32} complete={done} />
      </div>
    </div>
  );
}

/* ── Progress bar ───────────────────────────────────────── */

const TOTAL_STEPS = 11;
function calcProgress(agents: DAGState["agents"]): number {
  let completed = 0;
  for (const agent of Object.values(agents)) {
    for (const sp of Object.values(agent.subPhases)) {
      if (sp.status === "completed") completed++;
    }
  }
  return completed / TOTAL_STEPS;
}

/* ── Main DAG component ─────────────────────────────────── */

export function AgentDAG({ dagState, company, market, detailNames }: AgentDAGProps) {
  const { agents, analysisStatus, elapsed, recommendation } = dagState;
  const progress = calcProgress(agents);
  const researchStarted = anyResearchStarted(agents);
  const researchDone = allResearchDone(agents);
  const synthRunning = isRunning(agents.synthesis);
  const synthDone = isComplete(agents.synthesis);
  const isDone = analysisStatus === "completed";

  const orchStatus = isDone ? "completed" : researchStarted ? "running" : "pending";
  const synthVisible = synthRunning || synthDone;

  const synthState = agents.synthesis || { status: "pending" as const, subPhases: {} };
  const synthBorder = synthDone ? "#22c55e" : synthRunning ? "#7c5aff" : "var(--border-primary)";
  const synthIcon = synthDone ? "#a78bfa" : synthRunning ? "#7c5aff" : "var(--text-tertiary)";
  const synthLabel = synthDone ? "#a78bfa" : synthRunning ? "#7c5aff" : "var(--text-tertiary)";

  return (
    <>
      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: 2, background: "var(--bg-secondary)", zIndex: 999 }}>
        <div style={{
          height: "100%", width: `${progress * 100}%`,
          background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
          transition: "width 0.8s ease",
          boxShadow: "0 0 12px rgba(59,130,246,0.3)",
        }} />
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(124,90,255,0.3); } 50% { box-shadow: 0 0 0 8px rgba(124,90,255,0); } }
        @keyframes dotPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

        /* ── Connector line base styles ── */
        .dag-v-line {
          position: relative;
          width: 2px;
          background: var(--border-primary);
          flex-shrink: 0;
          overflow: visible;
        }
        .dag-v-line.complete { background: #22c55e; }

        .dag-h-line {
          position: relative;
          height: 2px;
          background: var(--border-primary);
          overflow: visible;
        }
        .dag-h-line.complete { background: #22c55e; }

        /* ── Vertical flowing dot (green) ── */
        .dag-v-line.flowing::after {
          content: '';
          position: absolute;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px #22c55e, 0 0 16px rgba(34,197,94,0.4);
          left: 50%;
          transform: translateX(-50%);
          animation: flowDown 1.5s ease-in-out infinite;
        }

        /* ── Synthesis flow override (purple dot) ── */
        .dag-v-line.synthesis-flow::after {
          background: #a78bfa;
          box-shadow: 0 0 8px #a78bfa, 0 0 16px rgba(167,139,250,0.4);
        }

        @keyframes flowDown {
          0%   { top: -3px; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: calc(100% - 3px); opacity: 0; }
        }

      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "48px 20px 32px" }}>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>
          Competitive Landscape — <span style={{ color: isDone ? "#22c55e" : "#7c5aff" }}>{company}</span> × {market}
        </h1>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 6 }}>
          {isDone ? "Completed" : analysisStatus === "failed" ? "Failed" : "Running"} · {elapsed.toFixed(1)}s
        </div>
      </div>

      {/* DAG */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px 80px" }}>

        {/* ── Orchestrator ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{
            ...CIRCLE_CARD,
            border: `2px solid ${orchStatus === "completed" ? "#22c55e" : orchStatus === "running" ? "#7c5aff" : "var(--border-primary)"}`,
            animation: orchStatus === "running" ? "pulse 1.5s ease-in-out infinite" : "none",
          }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: orchStatus === "completed" ? "#22c55e" : orchStatus === "running" ? "#7c5aff" : "var(--text-tertiary)" }}>
              ⌘
            </div>
          </div>
          <div style={{ fontSize: 12, color: orchStatus === "completed" ? "#22c55e" : orchStatus === "running" ? "#7c5aff" : "var(--text-tertiary)", textAlign: "center" }}>
            {company} × {market}
          </div>
        </div>

        {/* ── Fan-out: orchestrator → research ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <VLine height={32} complete={researchDone} />
        </div>
        <HLine width={552} complete={researchDone} />

        {/* ── Three research branches: Incumbents (left), Market Sizing (center), Emerging (right) ── */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          <Branch
            agentId="incumbents"
            state={agents.incumbents || { status: "pending", subPhases: {} }}
            config={AGENTS.incumbents}
            detailNames={detailNames?.incumbents}
            chipSide="left"
          />
          <Branch
            agentId="market_sizing"
            state={agents.market_sizing || { status: "pending", subPhases: {} }}
            config={AGENTS.market_sizing}
          />
          <Branch
            agentId="emerging"
            state={agents.emerging || { status: "pending", subPhases: {} }}
            config={AGENTS.emerging}
            detailNames={detailNames?.emerging}
            chipSide="right"
          />
        </div>

        {/* ── Fan-in: research → synthesis (mirrors fan-out) ── */}
        <HLine width={552} complete={researchDone} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <VLine height={32} complete={researchDone} />
          <ArrowTip complete={synthRunning || synthDone} />
        </div>

        {/* ── Synthesis ── */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          opacity: synthVisible ? 1 : 0.3,
          transform: synthVisible ? "none" : "translateY(8px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <div style={{
            ...CIRCLE_CARD,
            border: `2px solid ${synthBorder}`,
            animation: synthRunning ? "pulse 1.5s ease-in-out infinite" : "none",
          }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: synthIcon }}>
              ◇
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, textAlign: "center", color: synthLabel }}>Synthesis</div>

          {synthVisible && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              {(PHASE_ORDER.synthesis || []).map((phase) => {
                const sp = synthState.subPhases[phase];
                return (
                  <PhaseRow key={phase} status={sp?.status || "pending"} label={PHASE_LABELS[phase] || phase} purpleAccent />
                );
              })}
            </div>
          )}
        </div>

        {/* Result badge */}
        {isDone && recommendation && (
          <div style={{ marginTop: 24 }}>
            <ResultBadge recommendation={recommendation} visible />
          </div>
        )}
      </div>
    </>
  );
}
