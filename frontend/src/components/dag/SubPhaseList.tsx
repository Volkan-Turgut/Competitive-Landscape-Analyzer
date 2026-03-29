import type { SubPhaseState } from "@/types";

const LABELS: Record<string, string> = {
  discovery: "Discovery",
  detail: "Detail",
  assembly: "Assembly",
  company_research: "Company Research",
  cross_reference: "Cross-Reference",
};

const PHASE_ORDER: Record<string, string[]> = {
  incumbents: ["discovery", "detail", "assembly"],
  emerging: ["discovery", "detail", "assembly"],
  market_sizing: ["discovery", "detail", "assembly"],
  synthesis: ["company_research", "cross_reference"],
};

interface SubPhaseListProps {
  agentId: string;
  agentStatus: string;
  subPhases: Record<string, SubPhaseState>;
  accentColor: string;
}

export function SubPhaseList({
  agentId,
  agentStatus,
  subPhases,
  accentColor,
}: SubPhaseListProps) {
  const expanded = agentStatus === "running" || agentStatus === "completed";
  const phases = PHASE_ORDER[agentId] || [];

  return (
    <div
      style={{
        maxHeight: expanded ? 200 : 0,
        overflow: "hidden",
        transition: "max-height 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        marginTop: expanded ? 8 : 0,
      }}
    >
      {phases.map((phase, i) => {
        const sp = subPhases[phase];
        const status = sp?.status || "pending";

        let dotColor = "#52525b";
        let dotShadow = "none";
        if (status === "running") {
          dotColor = accentColor;
          dotShadow = `0 0 6px ${accentColor}`;
        } else if (status === "completed") {
          dotColor = "#10b981";
          dotShadow = "0 0 4px rgba(16,185,129,0.4)";
        }

        return (
          <div
            key={phase}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 0",
              opacity: expanded ? 1 : 0,
              transform: expanded ? "translateY(0)" : "translateY(-4px)",
              transition: `opacity 0.4s ease ${i * 0.08}s, transform 0.4s ease ${i * 0.08}s`,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: dotColor,
                boxShadow: dotShadow,
                flexShrink: 0,
                animation: status === "running" ? "dagPulse 1.5s ease-in-out infinite" : "none",
              }}
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.65rem",
                color: status === "completed" ? "#10b981" : status === "running" ? "#fafafa" : "#71717a",
              }}
            >
              {LABELS[phase] || phase}
            </span>
          </div>
        );
      })}
    </div>
  );
}
