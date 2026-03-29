import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useEffect, useState } from "react";
import type { Verdict as VerdictType } from "@/types";
import { GlowingCards, GlowingCard } from "@/components/ui/glowing-cards";
import { SourceTooltip } from "@/components/ui/SourceTooltip";
import type { SourceRef } from "@/types";

interface VerdictProps {
  verdict: VerdictType;
  allSources?: SourceRef[];
}

const SIGNAL_STYLES: Record<string, { border: string; bg: string; text: string; gradient: string }> = {
  positive: { border: "#10b981", bg: "rgba(16,185,129,0.05)", text: "#10b981", gradient: "linear-gradient(90deg, #10b981, #34d399)" },
  negative: { border: "#f59e0b", bg: "rgba(245,158,11,0.05)", text: "#f59e0b", gradient: "linear-gradient(90deg, #f59e0b, #fbbf24)" },
  neutral: { border: "#8b5cf6", bg: "rgba(139,92,246,0.05)", text: "#a78bfa", gradient: "linear-gradient(90deg, #8b5cf6, #a78bfa)" },
};

export function Verdict({ verdict, allSources }: VerdictProps) {
  const isGo = verdict.verdict === "GO";
  const target = Math.round(verdict.confidence * 100);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    setAnimatedValue(0);
    const timeout = setTimeout(() => setAnimatedValue(target), 100);
    return () => clearTimeout(timeout);
  }, [target]);

  return (
    <div style={{
      borderRadius: 16,
      border: "1px solid var(--border-subtle)",
      background: "var(--bg-card)",
      padding: 32,
      marginBottom: 32,
      position: "relative",
      overflow: "hidden",
      transition: "background 0.3s",
    }}>
      {/* Top gradient accent */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: isGo
          ? "linear-gradient(90deg, #10b981, #34d399, #6ee7b7)"
          : "linear-gradient(90deg, #f43f5e, #fb7185, #fda4af)",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 20 }}>
        <span style={{ fontSize: "2.5rem", fontWeight: 700, color: isGo ? "#10b981" : "#f43f5e", letterSpacing: "0.05em" }}>
          {verdict.verdict}
        </span>
        <div style={{ width: 72, height: 72 }}>
          <CircularProgressbar
            value={animatedValue}
            text={`${target}%`}
            styles={buildStyles({
              pathColor: isGo ? "#22c55e" : "#f43f5e",
              textColor: "var(--text-primary)",
              trailColor: "var(--border-primary)",
              textSize: "1.5rem",
              pathTransitionDuration: 1.2,
            })}
          />
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>
          Confidence
        </div>
      </div>

      <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24, maxWidth: 700 }}>
        {verdict.summary}
      </p>

      <GlowingCards gap="0.65rem" padding="0" maxWidth="100%">
        {verdict.factors.map((f) => {
          const s = SIGNAL_STYLES[f.signal] || SIGNAL_STYLES.neutral;
          const glowColor = f.signal === "positive" ? "#22c55e" : f.signal === "negative" ? "#f59e0b" : "#8b5cf6";
          return (
            <GlowingCard
              key={f.factor}
              glowColor={glowColor}
              className="!min-w-0 !p-3 !rounded-xl"
              style={{ borderLeft: `2px solid ${s.border}` }}
            >
              <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.factor}</div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: s.text }}>
                <SourceTooltip sources={allSources?.slice(0, 2)}>
                  {f.assessment}
                </SourceTooltip>
              </div>
            </GlowingCard>
          );
        })}
      </GlowingCards>
    </div>
  );
}
