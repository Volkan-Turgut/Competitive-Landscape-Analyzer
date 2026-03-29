interface ResultBadgeProps {
  recommendation?: "GO" | "NO-GO";
  visible: boolean;
}

export function ResultBadge({ recommendation, visible }: ResultBadgeProps) {
  if (!recommendation || !visible) return null;

  const isGo = recommendation === "GO";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 20px",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        background: isGo ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
        color: isGo ? "#10b981" : "#f43f5e",
        border: `1px solid ${isGo ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.3)"}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.85)",
        transition: "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {isGo ? "✓" : "✗"} &nbsp;{recommendation} — {isGo ? "Strong market opportunity detected" : "Market entry not recommended"}
    </div>
  );
}
