import type { AgentState } from "@/types";
import { SubPhaseList } from "./SubPhaseList";

interface AgentCircleProps {
  agentId: string;
  icon: string;
  label: string;
  state: AgentState;
  accentColor: string;
  glowColor: string;
  visible: boolean;
}

export function AgentCircle({
  agentId,
  icon,
  label,
  state,
  accentColor,
  glowColor,
  visible,
}: AgentCircleProps) {
  const { status, subPhases } = state;

  let borderColor = "#27272a";
  let boxShadow = "none";
  if (status === "running") {
    borderColor = accentColor;
    boxShadow = `0 0 0 1px ${accentColor}, 0 0 20px ${glowColor}`;
  } else if (status === "completed") {
    borderColor = "#10b981";
    boxShadow = "0 0 0 1px #10b981, 0 0 16px rgba(16,185,129,0.15)";
  } else if (status === "failed") {
    borderColor = "#f43f5e";
    boxShadow = "0 0 0 1px #f43f5e, 0 0 16px rgba(244,63,94,0.15)";
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.8)",
        transition: "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* Circle */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: `2px solid ${borderColor}`,
          background: "#111113",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          boxShadow,
          transition: "border-color 0.4s, box-shadow 0.4s",
          animation: status === "running" ? "dagPulse 2s ease-in-out infinite" : "none",
        }}
      >
        {icon}
      </div>

      {/* Label */}
      <span
        style={{
          marginTop: 8,
          fontSize: "0.75rem",
          fontWeight: 500,
          color: status === "completed" ? "#10b981" : status === "running" ? "#fafafa" : "#71717a",
          textAlign: "center",
          transition: "color 0.3s",
        }}
      >
        {label}
      </span>

      {/* Sub-phases */}
      <SubPhaseList
        agentId={agentId}
        agentStatus={status}
        subPhases={subPhases}
        accentColor={accentColor}
      />
    </div>
  );
}
