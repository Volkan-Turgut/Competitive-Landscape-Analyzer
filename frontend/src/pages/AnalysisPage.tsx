import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAnalysis } from "@/hooks/useAnalysis";
import { AgentDAG } from "@/components/dag/AgentDAG";
import { Dashboard } from "@/components/results/Dashboard";
import { DottedGlowBackground } from "@/components/ui/DottedGlowBackground";
import { getDemoAnalysis } from "@/data/demos";
import type { AnalysisResponse } from "@/types";

export function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDemo = id?.startsWith("demo-");

  // Demo mode — load from static data
  const [demoData, setDemoData] = useState<AnalysisResponse | null>(null);
  useEffect(() => {
    if (isDemo && id) {
      const data = getDemoAnalysis(id);
      if (data) {
        setDemoData(data);
      } else {
        navigate("/");
      }
    }
  }, [id, isDemo, navigate]);

  if (isDemo) {
    if (!demoData?.results) return null;
    return (
      <Dashboard
        results={demoData.results}
        company={demoData.company}
        market={demoData.market}
      />
    );
  }

  // Real analysis mode — SSE + DAG
  return <RealAnalysisView id={id!} />;
}

function RealAnalysisView({ id }: { id: string }) {
  const navigate = useNavigate();
  const { dagState, analysisData, loading } = useAnalysis(id);

  useEffect(() => {
    if (!loading && !analysisData && dagState.analysisStatus === "failed") {
      navigate("/");
    }
  }, [loading, analysisData, dagState.analysisStatus, navigate]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-tertiary)", fontSize: 14 }}>
        Loading analysis...
      </div>
    );
  }

  if (!analysisData) return null;

  // Show dashboard when complete
  if (analysisData.status === "complete" && analysisData.results) {
    return (
      <Dashboard
        results={analysisData.results}
        company={analysisData.company}
        market={analysisData.market}
        elapsed={dagState.elapsed}
      />
    );
  }

  // Show DAG while running
  const dn = dagState.detailNames;
  const isRunning = dagState.analysisStatus === "running";
  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "var(--bg-primary)" }}>
      {isRunning && (
        <DottedGlowBackground
          gap={14}
          radius={2.2}
          color="rgba(124,90,255,0.9)"
          darkColor="rgba(167,139,250,0.4)"
          glowColor="rgba(124,90,255,1)"
          darkGlowColor="rgba(124,90,255,0.9)"
          opacity={1}
          speedMin={0.3}
          speedMax={0.8}
          speedScale={0.8}
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <AgentDAG
          dagState={dagState}
          company={analysisData.company}
          market={analysisData.market}
          detailNames={dn.incumbents || dn.emerging ? { incumbents: dn.incumbents, emerging: dn.emerging } : undefined}
        />
      </div>
    </div>
  );
}
