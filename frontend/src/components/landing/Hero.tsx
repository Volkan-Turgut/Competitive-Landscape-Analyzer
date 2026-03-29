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
    <section className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden bg-[#0a0a0b] px-6 py-[60px] text-center">
      {/* Glow effects */}
      <div
        className="pointer-events-none absolute -bottom-[60px] left-1/2 h-[200px] w-[600px] -translate-x-1/2 animate-glowPulse"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(120,80,255,0.18) 0%, rgba(120,80,255,0.06) 40%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-[40px] left-1/2 h-[140px] w-[400px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(200,160,255,0.12) 0%, transparent 60%)",
        }}
      />

      {/* Badge pill */}
      <div className="mb-7 inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/50">
        <span className="h-1.5 w-1.5 rounded-full bg-[#7c5aff]" />
        AI-powered competitive intelligence
      </div>

      {/* Headline */}
      <h1 className="mb-0 text-[44px] font-medium leading-[1.2] tracking-[-0.02em] text-[#f0f0f0]">
        Analyze any market.
      </h1>

      {/* Rotating line */}
      <div className="mt-1 flex items-center justify-center gap-3">
        <span className="text-[44px] font-medium tracking-[-0.02em] text-[#f0f0f0]">
          Get the
        </span>
        <div className="relative h-14 min-w-[220px] overflow-hidden">
          {WORDS.map((word, i) => (
            <span
              key={word}
              className={`absolute inset-x-0 text-[44px] font-medium leading-[56px] tracking-[-0.02em] bg-gradient-to-br from-[#a78bfa] via-[#7c5aff] to-[#6d5aed] bg-clip-text text-transparent ${
                i === current ? "animate-slideUp" : "opacity-0 translate-y-full"
              }`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Subtitle */}
      <p className="mx-auto mt-5 mb-7 max-w-[480px] text-[15px] leading-[1.7] text-white/[0.45]">
        Enter a company and a market. AI agents research incumbents, track
        funding activity, size the opportunity, and deliver a Go/No-Go
        recommendation — in under 60 seconds.
      </p>

      {/* CTAs */}
      <div className="mb-9 flex justify-center gap-3">
        <button
          onClick={() =>
            document
              .getElementById("feature-tabs")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.06] px-6 py-[11px] text-sm font-medium text-white/70 transition-transform active:scale-[0.97] hover:bg-white/[0.1]"
        >
          How it works
        </button>
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

    </section>
  );
}
