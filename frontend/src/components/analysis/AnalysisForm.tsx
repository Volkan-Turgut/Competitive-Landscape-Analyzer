import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { postAnalysis } from "@/lib/api";
import { Loader2 } from "lucide-react";

export function AnalysisForm() {
  const [company, setCompany] = useState("");
  const [market, setMarket] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    console.log(">>> BUTTON CLICKED");
    e.preventDefault();
    if (!company.trim() || !market.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const { id } = await postAnalysis(company.trim(), market.trim());
      console.log(">>> FETCH RESPONSE", id);
      navigate(`/results/${id}`);
    } catch (error) {
      console.error(">>> FETCH ERROR", error);
      setError("Failed to start analysis. Is the backend running?");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      id="analysis-form"
      className="mx-auto max-w-lg px-6 py-16"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--surface-glow)] p-6">
          <h2 className="mb-1 text-lg font-medium text-[var(--text-primary)]">
            Run an analysis
          </h2>
          <p className="mb-5 text-sm text-[var(--text-secondary)]">
            Enter a company and the market you want to evaluate.
          </p>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Company name (e.g. Notion)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-card-hover)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[#7c5aff] focus:outline-none focus:ring-1 focus:ring-[#7c5aff]"
            />
            <input
              type="text"
              placeholder="Market / product space (e.g. AI-powered project management)"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-card-hover)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[#7c5aff] focus:outline-none focus:ring-1 focus:ring-[#7c5aff]"
            />
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !company.trim() || !market.trim()}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#7c5aff] px-6 py-2.5 text-sm font-medium text-white transition-transform active:scale-[0.97] hover:bg-[#6d4aef] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting analysis...
              </>
            ) : (
              <>Analyze &rarr;</>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
