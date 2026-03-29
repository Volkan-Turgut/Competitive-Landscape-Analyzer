import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function CheckDot() {
  return (
    <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10">
      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
        <path
          d="M2.5 6.5L5 9L9.5 3.5"
          stroke="#22c55e"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-start gap-2 text-xs leading-relaxed text-white/55">
      <CheckDot />
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change?: string;
}) {
  return (
    <div className="rounded-lg bg-white/[0.04] p-2.5">
      <div className="text-[10px] text-white/35">{label}</div>
      <div className="text-lg font-medium text-[#f0f0f0]">{value}</div>
      {change && (
        <div className="text-[10px] text-green-500">&#9650; {change}</div>
      )}
    </div>
  );
}

function MarketTab() {
  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <div className="flex-shrink-0 md:w-[220px]">
        <h3 className="mb-1.5 text-lg font-medium text-[#f0f0f0]">
          Map the market
        </h3>
        <p className="mb-4 text-[13px] leading-relaxed text-white/55">
          Quantify the opportunity with TAM, growth projections, and analyst
          data from multiple sources.
        </p>
        <Bullet>
          TAM and SAM sizing from Gartner, Forrester, Statista, and 6+ industry
          sources
        </Bullet>
        <Bullet>
          CAGR projections cross-referenced across analysts for confidence
        </Bullet>
        <Bullet>Growth drivers and headwinds identified automatically</Bullet>
      </div>
      <div className="min-w-0 flex-1">
        <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0b] p-4">
          <div className="mb-1 text-sm font-medium text-[#f0f0f0]">
            Market sizing — AI code review
          </div>
          <div className="mb-3.5 text-[11px] text-white/55">
            Data confidence: Medium
          </div>
          <div className="mb-3.5 grid grid-cols-3 gap-2">
            <StatCard label="TAM (2024)" value="$6.7B" />
            <StatCard label="TAM (2030)" value="$25.7B" />
            <StatCard label="CAGR" value="25.2%" change="accelerating" />
          </div>
          <svg className="mb-2.5" width="100%" viewBox="0 0 380 100">
            <text
              fontFamily="system-ui"
              fontSize="9"
              fill="rgba(255,255,255,0.35)"
              x="5"
              y="12"
            >
              $25.7B
            </text>
            <text
              fontFamily="system-ui"
              fontSize="9"
              fill="rgba(255,255,255,0.35)"
              x="5"
              y="90"
            >
              $4.3B
            </text>
            <line
              x1="40"
              y1="15"
              x2="370"
              y2="15"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.5"
              strokeDasharray="3 3"
            />
            <line
              x1="40"
              y1="85"
              x2="370"
              y2="85"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.5"
              strokeDasharray="3 3"
            />
            <path
              d="M50 82 L100 75 L150 68 L200 58 L250 45 L300 32 L360 18"
              fill="none"
              stroke="#7c5aff"
              strokeWidth="1.5"
            />
            <path
              d="M50 82 L100 75 L150 68 L200 58 L250 45 L300 32 L360 18 L360 90 L50 90Z"
              fill="#7c5aff"
              opacity="0.08"
            />
            <text
              fontFamily="system-ui"
              fontSize="8"
              fill="rgba(255,255,255,0.35)"
              x="46"
              y="98"
            >
              2023
            </text>
            <text
              fontFamily="system-ui"
              fontSize="8"
              fill="rgba(255,255,255,0.35)"
              x="145"
              y="98"
            >
              2025
            </text>
            <text
              fontFamily="system-ui"
              fontSize="8"
              fill="rgba(255,255,255,0.35)"
              x="248"
              y="98"
            >
              2028
            </text>
            <text
              fontFamily="system-ui"
              fontSize="8"
              fill="rgba(255,255,255,0.35)"
              x="348"
              y="98"
            >
              2030
            </text>
          </svg>
          <div className="text-[10px] text-white/35">
            Sources: ResearchAndMarkets, Mordor Intelligence, MarketsAndMarkets,
            Precedence Research
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayersTab() {
  const rows = [
    { name: "GitHub Copilot", pos: "leader", arr: "$1.0B", share: "42%" },
    { name: "SonarQube", pos: "leader", arr: "\u2014", share: "92.9%*" },
    { name: "CodeRabbit", pos: "challenger", arr: "$19.2M", share: "\u2014" },
    { name: "Codacy", pos: "challenger", arr: "$16.8M", share: "\u2014" },
    { name: "Qodo", pos: "challenger", arr: "$10.2M", share: "\u2014" },
    { name: "Graphite", pos: "niche", arr: "$5.3M", share: "\u2014" },
    { name: "Greptile", pos: "niche", arr: "$1.0M", share: "\u2014" },
    { name: "Sourcery", pos: "niche", arr: "$0.7M", share: "\u2014" },
  ];

  const badgeColors: Record<string, string> = {
    leader: "bg-green-500/10 text-green-500",
    challenger: "bg-amber-500/10 text-amber-500",
    niche: "bg-white/[0.06] text-white/55",
  };

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <div className="flex-shrink-0 md:w-[220px]">
        <h3 className="mb-1.5 text-lg font-medium text-[#f0f0f0]">
          Know the players
        </h3>
        <p className="mb-4 text-[13px] leading-relaxed text-white/55">
          Identify every established competitor, their revenue, market share,
          pricing, and strategic positioning.
        </p>
        <Bullet>
          Revenue and ARR data for every major player in the space
        </Bullet>
        <Bullet>
          Strengths, weaknesses, and pricing models compared side by side
        </Bullet>
        <Bullet>
          Market position classified as leader, challenger, or niche
        </Bullet>
      </div>
      <div className="min-w-0 flex-1">
        <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0b] p-4">
          <div className="mb-1 text-sm font-medium text-[#f0f0f0]">
            Incumbents — AI code review
          </div>
          <div className="mb-3.5 text-[11px] text-white/55">
            8 competitors identified
          </div>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="px-2 py-1.5 text-left text-[10px] font-normal text-white/35">
                  Company
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-normal text-white/35">
                  Position
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-normal text-white/35">
                  ARR
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-normal text-white/35">
                  Share
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-white/[0.08]">
                  <td className="px-2 py-[7px] font-medium text-[#f0f0f0]">
                    {r.name}
                  </td>
                  <td className="px-2 py-[7px]">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeColors[r.pos]}`}
                    >
                      {r.pos}
                    </span>
                  </td>
                  <td className="px-2 py-[7px] text-[#f0f0f0]">{r.arr}</td>
                  <td className="px-2 py-[7px] text-[#f0f0f0]">{r.share}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-1.5 text-[9px] text-white/35">
            *Code quality niche (different market category)
          </div>
        </div>
      </div>
    </div>
  );
}

function DisruptorsTab() {
  const bars = [
    { name: "Codacy", val: "$24.3M", pct: 100, color: "#22c55e" },
    { name: "Korbit AI", val: "$10.3M", pct: 42, color: "#7F77DD" },
    { name: "Bito", val: "$8.9M", pct: 37, color: "#7c5aff" },
    { name: "CodeAnt AI", val: "$2.5M", pct: 10, color: "#7c5aff" },
    { name: "Ellipsis", val: "$2.0M", pct: 8, color: "#7c5aff" },
    { name: "Sourcery", val: "$1.9M", pct: 8, color: "#7c5aff" },
  ];

  const investors = [
    "a16z",
    "Scale Ventures",
    "Anthropic",
    "Accel",
    "Sequoia",
  ];

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <div className="flex-shrink-0 md:w-[220px]">
        <h3 className="mb-1.5 text-lg font-medium text-[#f0f0f0]">
          Spot the disruptors
        </h3>
        <p className="mb-4 text-[13px] leading-relaxed text-white/55">
          Track new entrants, recent funding rounds, and the velocity of capital
          flowing into the space.
        </p>
        <Bullet>
          Seed through Series B funding activity tracked in real time
        </Bullet>
        <Bullet>
          Capital velocity signal: accelerating, stable, or decelerating
        </Bullet>
        <Bullet>
          Key differentiators surfaced for each new entrant
        </Bullet>
      </div>
      <div className="min-w-0 flex-1">
        <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0b] p-4">
          <div className="mb-1 text-sm font-medium text-[#f0f0f0]">
            Emerging competitors — AI code review
          </div>
          <div className="mb-3.5 text-[11px] text-white/55">
            7 new entrants tracked
          </div>
          <div className="mb-3.5 grid grid-cols-3 gap-2">
            <StatCard label="Capital (2yr)" value="$276M" />
            <StatCard label="YoY change" value="+85%" change="accelerating" />
            <StatCard label="Avg deal" value="$23M" />
          </div>
          <div className="mb-2.5">
            {bars.map((b) => (
              <div key={b.name} className="mb-1.5 flex items-center gap-2">
                <span className="w-[80px] flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-right text-[11px] text-white/55">
                  {b.name}
                </span>
                <div className="relative h-3.5 flex-1 overflow-hidden rounded-[3px] bg-white/[0.04]">
                  <div
                    className="h-full rounded-[3px]"
                    style={{
                      width: `${b.pct}%`,
                      background: b.color,
                      opacity: 0.7,
                    }}
                  />
                </div>
                <span className="w-9 flex-shrink-0 text-[10px] text-white/35">
                  {b.val}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1 pt-2.5">
            {investors.map((name) => (
              <span
                key={name}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/55"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VerdictTab() {
  const factors = [
    { label: "Market growth", value: "25.2% CAGR", positive: true },
    { label: "Capital signal", value: "Accelerating", positive: true },
    { label: "Incumbent grip", value: "Strong (42% top player)", positive: false },
    { label: "White space", value: "Identified", positive: true },
    { label: "Barrier to entry", value: "Moderate", positive: false },
    { label: "Data confidence", value: "Medium", positive: null },
  ];

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <div className="flex-shrink-0 md:w-[220px]">
        <h3 className="mb-1.5 text-lg font-medium text-[#f0f0f0]">
          Get the verdict
        </h3>
        <p className="mb-4 text-[13px] leading-relaxed text-white/55">
          A synthesis agent cross-references all findings and delivers a
          data-backed Go/No-Go recommendation.
        </p>
        <Bullet>
          Cross-references incumbents, emerging threats, and market size
        </Bullet>
        <Bullet>
          White space and risk factors identified automatically
        </Bullet>
        <Bullet>
          Confidence score based on data quality and source agreement
        </Bullet>
      </div>
      <div className="min-w-0 flex-1">
        <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0b] p-4">
          <div className="p-5 text-center">
            <div className="text-[28px] font-medium tracking-[0.05em] text-green-500">
              GO
            </div>
            <div className="mt-1 mb-3 text-xs text-white/55">
              Confidence: 78%
            </div>
            <p className="mx-auto mb-3.5 max-w-[340px] text-xs leading-relaxed text-white/55">
              Strong opportunity with identifiable white space in AI-native code
              review. High capital velocity signals market validation, but
              dominant incumbent presence requires differentiated positioning.
            </p>
            <div className="grid grid-cols-2 gap-2 text-left">
              {factors.map((f) => (
                <div
                  key={f.label}
                  className="rounded-lg bg-white/[0.04] px-2.5 py-2"
                >
                  <div className="text-[10px] text-white/35">{f.label}</div>
                  <div
                    className={`text-xs font-medium ${
                      f.positive === true
                        ? "text-green-500"
                        : f.positive === false
                          ? "text-amber-500"
                          : "text-amber-400"
                    }`}
                  >
                    {f.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeatureTabs() {
  return (
    <section id="feature-tabs" className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-7 text-center">
        <span className="text-[13px] font-medium tracking-[0.05em] text-[#7c5aff]">
          How it works
        </span>
        <h2 className="mt-2 text-[22px] font-medium leading-[1.4] text-[#f0f0f0]">
          From company name to Go/No-Go verdict.
          <br />
          AI agents that do the research for you.
        </h2>
        <p className="mx-auto mt-1.5 max-w-[480px] text-sm leading-relaxed text-white/55">
          Enter any company and market. Our agents research incumbents, track
          emerging threats, size the opportunity, and deliver a data-backed
          recommendation.
        </p>
      </div>

      <Tabs defaultValue="market" className="w-full">
        <TabsList className="mx-auto mb-8 grid h-auto max-w-[580px] grid-cols-4 gap-0 rounded-xl border border-white/[0.08] bg-transparent p-0">
          <TabsTrigger
            value="market"
            className="flex items-center justify-center gap-1.5 rounded-none rounded-l-xl border-r border-white/[0.08] px-2 py-2.5 text-[13px] text-white/55 data-[state=active]:bg-white/[0.04] data-[state=active]:text-[#f0f0f0] data-[state=active]:font-medium data-[state=active]:shadow-none"
          >
            <span className="text-sm">&#9678;</span> Map the market
          </TabsTrigger>
          <TabsTrigger
            value="players"
            className="flex items-center justify-center gap-1.5 rounded-none border-r border-white/[0.08] px-2 py-2.5 text-[13px] text-white/55 data-[state=active]:bg-white/[0.04] data-[state=active]:text-[#f0f0f0] data-[state=active]:font-medium data-[state=active]:shadow-none"
          >
            <span className="text-sm">&#9635;</span> Know the players
          </TabsTrigger>
          <TabsTrigger
            value="disruptors"
            className="flex items-center justify-center gap-1.5 rounded-none border-r border-white/[0.08] px-2 py-2.5 text-[13px] text-white/55 data-[state=active]:bg-white/[0.04] data-[state=active]:text-[#f0f0f0] data-[state=active]:font-medium data-[state=active]:shadow-none"
          >
            <span className="text-sm">&#9733;</span> Spot disruptors
          </TabsTrigger>
          <TabsTrigger
            value="verdict"
            className="flex items-center justify-center gap-1.5 rounded-none rounded-r-xl px-2 py-2.5 text-[13px] text-white/55 data-[state=active]:bg-white/[0.04] data-[state=active]:text-[#f0f0f0] data-[state=active]:font-medium data-[state=active]:shadow-none"
          >
            <span className="text-sm">&#10003;</span> Get the verdict
          </TabsTrigger>
        </TabsList>

        <TabsContent value="market">
          <MarketTab />
        </TabsContent>
        <TabsContent value="players">
          <PlayersTab />
        </TabsContent>
        <TabsContent value="disruptors">
          <DisruptorsTab />
        </TabsContent>
        <TabsContent value="verdict">
          <VerdictTab />
        </TabsContent>
      </Tabs>
    </section>
  );
}
