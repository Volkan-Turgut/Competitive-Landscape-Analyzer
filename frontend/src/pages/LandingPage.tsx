import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Hero } from "@/components/landing/Hero";
import { ValueProps } from "@/components/landing/ValueProps";
import { AnalysisForm } from "@/components/analysis/AnalysisForm";
import { GlowingCard } from "@/components/ui/glowing-cards";
import { DEMO_INFO } from "@/data/demos";

/* ── CSS injected once ─────────────────────────────────────── */
const css = `
@keyframes fadeUp { to { opacity:1; transform:translateY(0); } }

.agent-section .text-col,
.agent-section .visual-col {
  opacity:0; transform:translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
}
.agent-section.visible .text-col { opacity:1; transform:translateY(0); }
.agent-section.visible .visual-col { opacity:1; transform:translateY(0); transition-delay:0.15s; }
.agent-section.reverse.visible .text-col { transition-delay:0.15s; }
.agent-section.reverse.visible .visual-col { transition-delay:0s; }

.stat-box { transition: background 0.3s ease, border-color 0.3s ease; }
.competitor-row { transition: padding-left 0.3s ease; }
.threat-item { transition: padding-left 0.3s ease; }
.signal-box { transition: border-color 0.3s ease; }

@media (max-width:768px) {
  .agent-section { grid-template-columns:1fr !important; gap:32px !important; padding:40px 20px !important; }
  .agent-section.reverse .text-col { order:1 !important; }
  .agent-section.reverse .visual-col { order:2 !important; }
}
`;

/* ── Data ──────────────────────────────────────────────────── */

interface AgentData {
  reverse: boolean;
  labelColor: string;
  label: string;
  title: string;
  desc: string;
  features: string[];
  glowColor: string;
  card: React.ReactNode;
}

const AGENTS: AgentData[] = [
  {
    reverse: false,
    labelColor: "#818cf8",
    label: "RESEARCH",
    title: "Map the market",
    desc: "Identifies direct competitors, market size, and growth trajectory. Surfaces the data you need to understand where the opportunity sits and how crowded the space is.",
    features: [
      "Competitor identification with market share estimates",
      "Total addressable market sizing from multiple sources",
      "Growth rate analysis and market timing signals",
    ],
    glowColor: "#3b82f6",
    card: <MarketCard />,
  },
  {
    reverse: true,
    labelColor: "#a78bfa",
    label: "INTELLIGENCE",
    title: "Know the players",
    desc: "Maps incumbent competitors, their market share, funding status, and strategic positioning. Reveals who owns the space and where their defenses are weakest.",
    features: [
      "Incumbent profiles with funding and market position",
      "Competitive moat analysis and vulnerability mapping",
      "Strategic positioning gaps you can exploit",
    ],
    glowColor: "#8b5cf6",
    card: <PlayersCard />,
  },
  {
    reverse: false,
    labelColor: "#f59e0b",
    label: "DISCOVERY",
    title: "Spot disruptors",
    desc: "Scans for emerging startups, new entrants, and adjacent threats that traditional research misses. Catches the signals that could reshape the competitive landscape.",
    features: [
      "Emerging competitor detection from funding databases",
      "Adjacent market threat identification",
      "White space and opportunity gap analysis",
    ],
    glowColor: "#06b6d4",
    card: <ThreatsCard />,
  },
  {
    reverse: true,
    labelColor: "#34d399",
    label: "SYNTHESIS",
    title: "Get the verdict",
    desc: "Cross-references all findings from the research agents and delivers a data-backed Go/No-Go recommendation with confidence scoring and concrete next steps.",
    features: [
      "Cross-references incumbents, emerging threats, and market size",
      "White space and risk factors identified automatically",
      "Confidence score based on data quality and source agreement",
    ],
    glowColor: "#22c55e",
    card: <VerdictCard />,
  },
];

/* ── Visual cards ──────────────────────────────────────────── */

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="stat-box"
      style={{
        background: "var(--surface-glow)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 10,
        padding: "14px 16px",
      }}
    >
      <div style={{ fontSize: "0.65rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: "1.15rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color }}>
        {value}
      </div>
    </div>
  );
}

function MarketCard() {
  return (
    <>
      <div style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#818cf8", opacity: 0.5, marginBottom: 16 }}>
        MARKET SNAPSHOT
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <StatBox label="Market Size" value="$6.7B" color="#818cf8" />
        <StatBox label="Growth Rate" value="25.2%" color="#818cf8" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <StatBox label="AI Adoption" value="89%" color="#818cf8" />
        <StatBox label="Sources" value="12" color="#818cf8" />
      </div>
    </>
  );
}

function PlayersCard() {
  const rows = [
    { name: "Focal Systems", share: "25%" },
    { name: "Trax Retail", share: "20%" },
    { name: "RELEX Solutions", share: "15%" },
    { name: "Pensa Systems", share: "10%" },
    { name: "Simbe Robotics", share: "8%" },
  ];
  return (
    <>
      <div style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#a78bfa", opacity: 0.5, marginBottom: 16 }}>
        TOP INCUMBENTS
      </div>
      {rows.map((r, i) => (
        <div
          key={r.name}
          className="competitor-row"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 0",
            borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
          }}
        >
          <span>{r.name}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", opacity: 0.6 }}>
            {r.share} share
          </span>
        </div>
      ))}
    </>
  );
}

function ThreatsCard() {
  const threats = [
    { name: "ShelfSense AI", level: "high" as const },
    { name: "GrocerVision", level: "high" as const },
    { name: "StockIQ", level: "med" as const },
    { name: "AisleLabs", level: "med" as const },
  ];
  const dotColor = { high: "#f87171", med: "#f59e0b" };
  const tagStyle = {
    high: { background: "rgba(248,113,113,0.12)", color: "#f87171" },
    med: { background: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  };
  return (
    <>
      <div style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#f59e0b", opacity: 0.5, marginBottom: 16 }}>
        EMERGING THREATS
      </div>
      {threats.map((t, i) => (
        <div
          key={t.name}
          className="threat-item"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 0",
            borderBottom: i < threats.length - 1 ? "1px solid var(--border-subtle)" : "none",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor[t.level], flexShrink: 0 }} />
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{t.name}</span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "0.65rem",
              padding: "2px 8px",
              borderRadius: 10,
              fontWeight: 500,
              ...tagStyle[t.level],
            }}
          >
            {t.level === "high" ? "High threat" : "Medium"}
          </span>
        </div>
      ))}
    </>
  );
}

function VerdictCard() {
  const signals: { label: string; value: string; cls: string }[] = [
    { label: "Market growth", value: "25.2% CAGR", cls: "green" },
    { label: "Capital signal", value: "Accelerating", cls: "green" },
    { label: "Incumbent grip", value: "Strong (42%)", cls: "red" },
    { label: "White space", value: "Identified", cls: "green" },
    { label: "Barrier to entry", value: "Moderate", cls: "amber" },
    { label: "Data confidence", value: "Medium", cls: "amber" },
  ];
  const signalColors: Record<string, string> = { green: "#34d399", amber: "#f59e0b", red: "#f87171" };

  return (
    <>
      <div style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#34d399", opacity: 0.5, marginBottom: 16 }}>
        RECOMMENDATION
      </div>
      <div className="verdict-badge" style={{ fontSize: "1.8rem", fontWeight: 700, color: "#34d399", marginBottom: 4 }}>
        GO
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: 20 }}>Confidence: 78%</div>
      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 20 }}>
        Strong opportunity with identifiable white space in AI-native code review. High capital velocity signals market validation, but dominant incumbent presence requires differentiated positioning.
      </div>
      <div className="signal-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {signals.map((s) => (
          <div
            key={s.label}
            className="signal-box"
            style={{
              background: "var(--surface-glow)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              padding: "10px 12px",
            }}
          >
            <div style={{ fontSize: "0.6rem", color: "var(--text-tertiary)", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: signalColors[s.cls] }}>{s.value}</div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Agent section component ───────────────────────────────── */

function AgentSection({ agent, isVisible }: { agent: AgentData; isVisible: boolean }) {
  const textCol = (
    <div className="text-col" style={isVisible ? {} : { opacity: 0, transform: "translateY(40px)" }}>
      <div style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase" as const, color: agent.labelColor, marginBottom: 12 }}>
        {agent.label}
      </div>
      <h3 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>{agent.title}</h3>
      <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24 }}>{agent.desc}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {agent.features.map((f) => (
          <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>
            <span style={{ color: "#22c55e", fontSize: "0.8rem", marginTop: 3, flexShrink: 0 }}>&#10003;</span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );

  const visualCol = (
    <div className="visual-col" style={isVisible ? {} : { opacity: 0, transform: "translateY(40px)" }}>
      <GlowingCard glowColor={agent.glowColor} className="!rounded-2xl !p-7 !min-w-0">
        {agent.card}
      </GlowingCard>
    </div>
  );

  return (
    <section
      className={`agent-section${agent.reverse ? " reverse" : ""}${isVisible ? " visible" : ""}`}
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "60px 24px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 64,
        alignItems: "center",
        position: "relative",
      }}
    >
      {agent.reverse ? (
        <>
          <div className="visual-col" style={{ order: 1, ...(isVisible ? {} : { opacity: 0, transform: "translateY(40px)" }) }}>
            <GlowingCard glowColor={agent.glowColor} className="!rounded-2xl !p-7 !min-w-0">
              {agent.card}
            </GlowingCard>
          </div>
          <div className="text-col" style={{ order: 2, ...(isVisible ? {} : { opacity: 0, transform: "translateY(40px)" }) }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase" as const, color: agent.labelColor, marginBottom: 12 }}>
              {agent.label}
            </div>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>{agent.title}</h3>
            <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24 }}>{agent.desc}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {agent.features.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>
                  <span style={{ color: "#22c55e", fontSize: "0.8rem", marginTop: 3, flexShrink: 0 }}>&#10003;</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <>
          {textCol}
          {visualCol}
        </>
      )}
      {/* Divider */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          right: "10%",
          height: 1,
          background: "linear-gradient(90deg, transparent, var(--border-primary), transparent)",
        }}
      />
    </section>
  );
}

/* ── Main page ─────────────────────────────────────────────── */

export function LandingPage() {
  const [visible, setVisible] = useState<boolean[]>(AGENTS.map(() => false));
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Inject stylesheet once
    const id = "agent-showcase-css";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = css;
      document.head.appendChild(style);
    }

    // IntersectionObserver for scroll reveals
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) {
              setVisible((prev) => {
                const next = [...prev];
                next[idx] = true;
                return next;
              });
            }
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <Hero />

      <ValueProps />

      {/* Section header */}
      <div style={{ textAlign: "center", padding: "120px 24px 80px", maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#f59e0b",
            marginBottom: 20,
            opacity: 0,
            transform: "translateY(12px)",
            animation: "fadeUp 0.6s ease forwards 0.2s",
          }}
        >
          How it works
        </div>
        <h2
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            fontWeight: 700,
            lineHeight: 1.25,
            color: "var(--text-primary)",
            marginBottom: 20,
            opacity: 0,
            transform: "translateY(16px)",
            animation: "fadeUp 0.7s ease forwards 0.35s",
          }}
        >
          From company name to Go/No-Go verdict.
          <br />
          AI agents that do the research for you.
        </h2>
        <p
          style={{
            fontSize: "1.05rem",
            color: "var(--text-muted)",
            lineHeight: 1.7,
            opacity: 0,
            transform: "translateY(16px)",
            animation: "fadeUp 0.7s ease forwards 0.5s",
          }}
        >
          Enter any company and market. Our agents research incumbents, track emerging threats, size the opportunity, and deliver a data-backed recommendation.
        </p>
      </div>

      {/* Agent showcase sections */}
      {AGENTS.map((agent, i) => (
        <div
          key={agent.label}
          ref={(el) => { sectionRefs.current[i] = el; }}
        >
          <AgentSection agent={agent} isVisible={visible[i]} />
        </div>
      ))}

      {/* Demo links */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#7c5aff", marginBottom: 8 }}>
            Live Demos
          </div>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Explore pre-computed analyses with real data
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {DEMO_INFO.map((d) => (
            <Link
              key={d.id}
              to={`/results/${d.id}`}
              style={{
                display: "block",
                padding: "20px",
                borderRadius: 12,
                border: "1px solid var(--border-primary)",
                background: "var(--surface-glow)",
                textDecoration: "none",
                transition: "border-color 0.3s, background 0.3s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(124,90,255,0.3)"; e.currentTarget.style.background = "var(--bg-card-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-primary)"; e.currentTarget.style.background = "var(--surface-glow)"; }}
            >
              <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>
                {d.market}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                {d.company}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Form at bottom */}
      <AnalysisForm />
    </main>
  );
}
