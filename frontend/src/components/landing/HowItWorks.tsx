import { PenLine, Bot, CheckCircle, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STEPS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: PenLine,
    title: "Enter company + market",
    desc: "Provide the company you want to evaluate and the market space to analyze.",
  },
  {
    icon: Bot,
    title: "AI agents research in parallel",
    desc: "Three specialized agents research incumbents, emerging competitors, and market sizing simultaneously.",
  },
  {
    icon: CheckCircle,
    title: "Get Go/No-Go recommendation",
    desc: "A synthesis agent cross-references all findings and delivers a data-backed verdict.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-10 text-center">
        <span className="text-xs font-medium uppercase tracking-[0.05em] text-[#7c5aff]">
          How it works
        </span>
        <h2 className="mt-2 text-2xl font-medium text-[var(--text-primary)]">
          Three steps to a data-backed decision
        </h2>
      </div>

      <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-0">
        {STEPS.map(({ icon: Icon, title, desc }, i) => (
          <div key={title} className="flex items-center">
            <div className="flex w-[260px] flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-primary)] bg-[var(--bg-card-hover)]">
                <span className="text-xs font-medium text-[#7c5aff]">
                  {i + 1}
                </span>
              </div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#7c5aff]/10">
                <Icon className="h-5 w-5 text-[#7c5aff]" />
              </div>
              <h3 className="mb-2 text-sm font-medium text-[var(--text-primary)]">
                {title}
              </h3>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                {desc}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="mx-4 hidden h-5 w-5 flex-shrink-0 text-[var(--text-tertiary)] md:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
