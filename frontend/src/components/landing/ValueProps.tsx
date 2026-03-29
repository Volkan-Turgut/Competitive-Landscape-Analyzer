import { BarChart3, Users, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const PROPS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: BarChart3,
    title: "Market intelligence",
    desc: "TAM, growth projections, and regional data from Gartner, Forrester, and 6+ analyst sources.",
  },
  {
    icon: Users,
    title: "Competitive mapping",
    desc: "Incumbents and emerging players with revenue, market share, and strategic positioning.",
  },
  {
    icon: Target,
    title: "Actionable verdict",
    desc: "Go/No-Go recommendation with confidence score and factor-by-factor breakdown.",
  },
];

export function ValueProps() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {PROPS.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#7c5aff]/10">
              <Icon className="h-5 w-5 text-[#7c5aff]" />
            </div>
            <h3 className="mb-2 text-base font-medium text-[#f0f0f0]">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-white/[0.45]">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
