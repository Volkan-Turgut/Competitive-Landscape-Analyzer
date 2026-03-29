import { useParams, useNavigate } from "react-router-dom";
import { useAnalysis } from "@/hooks/useAnalysis";
import { AgentDAG } from "@/components/dag/AgentDAG";
import { useEffect } from "react";

export function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dagState, analysisData, loading } = useAnalysis(id!);

  useEffect(() => {
    if (!loading && !analysisData && dagState.analysisStatus === "failed") {
      navigate("/");
    }
  }, [loading, analysisData, dagState.analysisStatus, navigate]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#0a0a0b",
          color: "#71717a",
          fontSize: 14,
        }}
      >
        Loading analysis...
      </div>
    );
  }

  if (!analysisData) {
    return null;
  }

  return (
    <AgentDAG
      dagState={dagState}
      company={analysisData.company}
      market={analysisData.market}
    />
  );
}
