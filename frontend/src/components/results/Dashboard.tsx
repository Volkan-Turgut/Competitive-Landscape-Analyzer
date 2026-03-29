import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnalysisResults } from "@/types";
import { Verdict } from "./Verdict";
import { IncumbentsView } from "./IncumbentsView";
import { EmergingView } from "./EmergingView";
import { MarketSizingView } from "./MarketSizingView";
import { SynthesisView } from "./SynthesisView";

interface DashboardProps {
  results: AnalysisResults;
  company: string;
  market: string;
  elapsed?: number;
}

export function Dashboard({ results, company, market, elapsed }: DashboardProps) {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "32px 48px 20px", borderBottom: "1px solid var(--border-secondary)" }}>
        <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
          Analysis Results
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            <span style={{ color: "#3b82f6" }}>{company}</span> &times; {market}
          </h1>
          {elapsed != null && elapsed > 0 && (
            <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 400 }}>
              {elapsed.toFixed(1)}s
            </span>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 48px 80px" }}>
        {/* Verdict banner */}
        {results.verdict && <Verdict verdict={results.verdict} allSources={results.market_sizing?.all_sources} />}

        {/* Tabs — force flex-col so tabs are ABOVE content, not beside it */}
        <Tabs defaultValue="incumbents" className="w-full !flex-col">
          <TabsList
            variant="line"
            className="mb-8 flex w-full justify-start gap-0 rounded-none border-b border-[var(--border-primary)] bg-transparent p-0 h-auto"
          >
            {([
              { value: "incumbents", label: `Incumbents (${results.incumbents.length})` },
              { value: "emerging", label: `Emerging (${results.emerging_competitors.length})` },
              { value: "market", label: "Market Sizing" },
              { value: "synthesis", label: "Synthesis" },
            ] as const).map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent px-6 py-3 text-sm text-[var(--text-tertiary)] bg-transparent transition-all duration-200 hover:text-[var(--text-secondary)] hover:bg-[var(--surface-glow)] data-[active]:border-b-[#7c5aff] data-[active]:text-[var(--text-primary)] data-[active]:bg-[var(--surface-glow)] data-[active]:font-medium data-[active]:shadow-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="incumbents">
            <IncumbentsView competitors={results.incumbents} />
          </TabsContent>
          <TabsContent value="emerging">
            <EmergingView competitors={results.emerging_competitors} capitalFlow={results.capital_flow} />
          </TabsContent>
          <TabsContent value="market">
            {results.market_sizing ? (
              <MarketSizingView data={results.market_sizing} />
            ) : (
              <div style={{ color: "var(--text-tertiary)", padding: 40, textAlign: "center" }}>No market sizing data available</div>
            )}
          </TabsContent>
          <TabsContent value="synthesis">
            <SynthesisView
              verdict={results.verdict}
              company={company}
              market={market}
              incumbents={results.incumbents}
              emergingCompetitors={results.emerging_competitors}
              capitalFlow={results.capital_flow}
              marketSizing={results.market_sizing}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
