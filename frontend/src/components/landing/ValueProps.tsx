import { BarChart3, Users, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GlowingCards, GlowingCard } from "@/components/ui/glowing-cards";

const PROPS: { icon: LucideIcon; title: string; desc: string; glow: string }[] = [
  {
    icon: BarChart3,
    title: "Market intelligence",
    desc: "TAM, growth projections, and regional data from Gartner, Forrester, and 6+ analyst sources.",
    glow: "#7c5aff",
  },
  {
    icon: Users,
    title: "Competitive mapping",
    desc: "Incumbents and emerging players with revenue, market share, and strategic positioning.",
    glow: "#3b82f6",
  },
  {
    icon: Target,
    title: "Actionable verdict",
    desc: "Go/No-Go recommendation with confidence score and factor-by-factor breakdown.",
    glow: "#22c55e",
  },
];

export function ValueProps() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <GlowingCards gap="1.5rem" padding="0" maxWidth="100%">
        {PROPS.map(({ icon: Icon, title, desc, glow }) => (
          <GlowingCard key={title} glowColor={glow} className="!rounded-xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${glow}1a` }}>
              <Icon className="h-5 w-5" style={{ color: glow }} />
            </div>
            <h3 className="mb-2 text-base font-medium text-[var(--text-primary)]">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{desc}</p>
          </GlowingCard>
        ))}
      </GlowingCards>
    </section>
  );
}
