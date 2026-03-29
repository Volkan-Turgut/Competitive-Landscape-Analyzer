import type { DAGState } from "@/types";
import { AgentCircle } from "./AgentCircle";
import { ResultBadge } from "./ResultBadge";

interface AgentDAGProps {
  dagState: DAGState;
  company: string;
  market: string;
}

const AGENT_CONFIG = {
  incumbents: { icon: "◆", label: "Incumbents", accent: "#3b82f6", glow: "rgba(59,130,246,0.15)" },
  emerging: { icon: "▲", label: "Emerging", accent: "#f59e0b", glow: "rgba(245,158,11,0.15)" },
  market_sizing: { icon: "●", label: "Market Sizing", accent: "#10b981", glow: "rgba(16,185,129,0.15)" },
  synthesis: { icon: "⬡", label: "Synthesis", accent: "#8b5cf6", glow: "rgba(139,92,246,0.15)" },
} as const;

const TOTAL_STEPS = 11; // 3×3 + 2

function calcProgress(agents: DAGState["agents"]): number {
  let completed = 0;
  for (const agent of Object.values(agents)) {
    for (const sp of Object.values(agent.subPhases)) {
      if (sp.status === "completed") completed++;
    }
  }
  return completed / TOTAL_STEPS;
}

function getArrowStatus(agents: DAGState["agents"], from: string, to: string): "inactive" | "active" | "completed" {
  if (from === "input") {
    const anyRunning = ["incumbents", "emerging", "market_sizing"].some(
      (id) => agents[id]?.status === "running" || agents[id]?.status === "completed"
    );
    const allDone = ["incumbents", "emerging", "market_sizing"].every(
      (id) => agents[id]?.status === "completed"
    );
    if (allDone) return "completed";
    if (anyRunning) return "active";
    return "inactive";
  }
  if (to === "synthesis") {
    const fromAgent = agents[from];
    if (fromAgent?.status === "completed") {
      const synthStatus = agents.synthesis?.status;
      if (synthStatus === "completed") return "completed";
      if (synthStatus === "running") return "active";
      return "completed";
    }
    if (fromAgent?.status === "running") return "active";
    return "inactive";
  }
  if (from === "synthesis") {
    if (agents.synthesis?.status === "completed") return "completed";
    if (agents.synthesis?.status === "running") return "active";
    return "inactive";
  }
  return "inactive";
}

function Arrow({ status }: { status: "inactive" | "active" | "completed" }) {
  const colors = {
    inactive: "#27272a",
    active: "#3b82f6",
    completed: "#10b981",
  };
  const color = colors[status];

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
      <svg width="2" height="32" style={{ overflow: "visible" }}>
        <defs>
          <marker
            id={`arrow-${status}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        </defs>
        <line
          x1="1"
          y1="0"
          x2="1"
          y2="28"
          stroke={color}
          strokeWidth="1.5"
          markerEnd={status !== "inactive" ? `url(#arrow-${status})` : undefined}
          strokeDasharray={status === "active" ? "6 4" : "none"}
          style={{
            filter: status === "active" ? `drop-shadow(0 0 4px ${color})` : status === "completed" ? `drop-shadow(0 0 3px ${color})` : "none",
            animation: status === "active" ? "dashFlow 0.6s linear infinite" : "none",
          }}
        />
      </svg>
    </div>
  );
}

function FanInBus({ agents }: { agents: DAGState["agents"] }) {
  const allDone = ["incumbents", "emerging", "market_sizing"].every(
    (id) => agents[id]?.status === "completed"
  );
  const anyDone = ["incumbents", "emerging", "market_sizing"].some(
    (id) => agents[id]?.status === "completed"
  );

  const lineColor = allDone ? "#10b981" : anyDone ? "#3b82f6" : "#27272a";
  const dotColor = lineColor;
  const glow = allDone
    ? "0 0 6px rgba(16,185,129,0.4)"
    : anyDone
      ? "0 0 6px rgba(59,130,246,0.4)"
      : "none";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 0",
        maxWidth: 500,
        margin: "0 auto",
        opacity: anyDone || allDone ? 1 : 0.3,
        transition: "opacity 0.4s",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, boxShadow: glow, flexShrink: 0, transition: "all 0.4s" }} />
      <span style={{ flex: 1, height: 1.5, background: lineColor, boxShadow: glow, transition: "all 0.4s" }} />
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, boxShadow: glow, flexShrink: 0, transition: "all 0.4s" }} />
      <span style={{ flex: 1, height: 1.5, background: lineColor, boxShadow: glow, transition: "all 0.4s" }} />
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, boxShadow: glow, flexShrink: 0, transition: "all 0.4s" }} />
    </div>
  );
}

export function AgentDAG({ dagState, company, market }: AgentDAGProps) {
  const progress = calcProgress(dagState.agents);
  const inputArrowStatus = getArrowStatus(dagState.agents, "input", "research");
  const synthArrowStatus = getArrowStatus(dagState.agents, "synthesis", "result");
  const anyResearchStarted = ["incumbents", "emerging", "market_sizing"].some(
    (id) => dagState.agents[id]?.status !== "pending"
  );

  return (
    <div style={{ background: "#0a0a0b", minHeight: "100vh", position: "relative" }}>
      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: 2, background: "#111113", zIndex: 999 }}>
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
            transition: "width 0.8s ease",
            boxShadow: "0 0 12px rgba(59,130,246,0.3)",
          }}
        />
      </div>

      {/* Header */}
      <div style={{ padding: "40px 48px 24px", borderBottom: "1px solid #27272a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: dagState.analysisStatus === "completed" ? "#8b5cf6" : "#10b981",
              boxShadow: `0 0 8px ${dagState.analysisStatus === "completed" ? "rgba(139,92,246,0.4)" : "rgba(16,185,129,0.4)"}`,
              animation: dagState.analysisStatus === "running" ? "dagPulse 2s ease-in-out infinite" : "none",
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              color: "#71717a",
            }}
          >
            Agent Orchestration
          </span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: "#fafafa", margin: 0 }}>
          Competitive Landscape — <span style={{ color: "#3b82f6" }}>{company}</span> × {market}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
          <span style={{ fontSize: 14, color: "#71717a" }}>
            {dagState.analysisStatus === "completed" ? "Complete" : dagState.analysisStatus === "running" ? "Running" : dagState.analysisStatus === "failed" ? "Failed" : "Pending"}
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#52525b" }}>
            {dagState.elapsed.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* DAG canvas */}
      <div style={{ padding: "48px 48px 80px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Input node */}
        <div
          style={{
            opacity: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "2px solid #10b981",
              background: "#111113",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              boxShadow: "0 0 0 1px #10b981, 0 0 12px rgba(16,185,129,0.15)",
            }}
          >
            ⌘
          </div>
          <span style={{ marginTop: 6, fontSize: "0.7rem", color: "#71717a" }}>
            {company} × {market}
          </span>
        </div>

        {/* Arrow: input → research */}
        <Arrow status={inputArrowStatus} />

        {/* Research agents row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 48,
            marginBottom: 0,
          }}
        >
          {(["incumbents", "emerging", "market_sizing"] as const).map((id) => {
            const cfg = AGENT_CONFIG[id];
            return (
              <AgentCircle
                key={id}
                agentId={id}
                icon={cfg.icon}
                label={cfg.label}
                state={dagState.agents[id] || { status: "pending", subPhases: {} }}
                accentColor={cfg.accent}
                glowColor={cfg.glow}
                visible={anyResearchStarted || dagState.agents[id]?.status !== "pending"}
              />
            );
          })}
        </div>

        {/* Fan-in bus */}
        <FanInBus agents={dagState.agents} />

        {/* Arrow: bus → synthesis */}
        <Arrow
          status={
            dagState.agents.synthesis?.status === "completed"
              ? "completed"
              : dagState.agents.synthesis?.status === "running"
                ? "active"
                : ["incumbents", "emerging", "market_sizing"].every((id) => dagState.agents[id]?.status === "completed")
                  ? "active"
                  : "inactive"
          }
        />

        {/* Synthesis node */}
        <AgentCircle
          agentId="synthesis"
          icon={AGENT_CONFIG.synthesis.icon}
          label={AGENT_CONFIG.synthesis.label}
          state={dagState.agents.synthesis || { status: "pending", subPhases: {} }}
          accentColor={AGENT_CONFIG.synthesis.accent}
          glowColor={AGENT_CONFIG.synthesis.glow}
          visible={dagState.agents.synthesis?.status !== "pending"}
        />

        {/* Arrow: synthesis → result */}
        {dagState.agents.synthesis?.status === "completed" && (
          <Arrow status={synthArrowStatus} />
        )}

        {/* Result badge */}
        <div style={{ marginTop: 8 }}>
          <ResultBadge
            recommendation={dagState.recommendation}
            visible={dagState.analysisStatus === "completed" && !!dagState.recommendation}
          />
        </div>
      </div>
    </div>
  );
}
