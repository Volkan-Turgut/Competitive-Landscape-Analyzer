import { useEffect, useState } from "react";

const WORDS = ["verdict.", "edge.", "signal.", "clarity."];

export function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % WORDS.length);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden px-6 py-[60px] text-center" style={{ background: "var(--hero-bg)" }}>
      {/* Glow effects */}
      <div
        className="pointer-events-none absolute -bottom-[60px] left-1/2 h-[200px] w-[600px] -translate-x-1/2 animate-glowPulse"
        style={{
          background:
            `radial-gradient(ellipse at center, var(--hero-glow-primary) 0%, rgba(120,80,255,0.06) 40%, transparent 70%)`,
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-[40px] left-1/2 h-[140px] w-[400px] -translate-x-1/2"
        style={{
          background:
            `radial-gradient(ellipse at center, var(--hero-glow-secondary) 0%, transparent 60%)`,
        }}
      />

      {/* Badge pill */}
      <div className="mb-7 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs" style={{ border: "1px solid var(--hero-badge-border)", background: "var(--hero-badge-bg)", color: "var(--hero-badge-text)" }}>
        <span className="h-1.5 w-1.5 rounded-full bg-[#7c5aff]" />
        AI-powered competitive intelligence
      </div>

      {/* Headline */}
      <h1 className="mb-0 text-[44px] font-medium leading-[1.2] tracking-[-0.02em]" style={{ color: "var(--hero-text)" }}>
        Analyze any market.
      </h1>

      {/* Rotating line */}
      <div className="mt-1 flex items-center justify-center">
        <span className="text-[44px] font-medium tracking-[-0.02em]" style={{ color: "var(--hero-text)" }}>
          Get the&nbsp;
        </span>
        <div className="relative h-14 min-w-[165px] overflow-hidden">
          {WORDS.map((word, i) => (
            <span
              key={word}
              className={`absolute left-0 text-left text-[44px] font-medium leading-[56px] tracking-[-0.02em] bg-gradient-to-br from-[#a78bfa] via-[#7c5aff] to-[#6d5aed] bg-clip-text text-transparent ${
                i === current ? "animate-slideUp" : "opacity-0 translate-y-full"
              }`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Subtitle */}
      <p className="mx-auto mt-5 mb-7 max-w-[480px] text-[15px] leading-[1.7]" style={{ color: "var(--hero-subtitle)" }}>
        Enter a company and a market. AI agents research incumbents, track
        funding activity, size the opportunity, and deliver a Go/No-Go
        recommendation — in under 60 seconds.
      </p>

      {/* CTA */}
      <div className="mb-9 flex justify-center gap-3">
        <button
          onClick={() =>
            document
              .getElementById("analysis-form")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="inline-flex items-center gap-2 rounded-lg bg-[#7c5aff] px-6 py-[11px] text-sm font-medium text-white transition-transform active:scale-[0.97] hover:bg-[#6d4aef]"
        >
          Run analysis <span className="text-base">&rarr;</span>
        </button>
      </div>

      {/* Bottom gradient fade into page background */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[var(--bg-primary)]" />
    </section>
  );
}
