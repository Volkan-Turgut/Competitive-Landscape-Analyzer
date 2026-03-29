import { useState, useEffect, useCallback } from "react";
import { getAnalysis } from "@/lib/api";
import { useSSE } from "@/hooks/useSSE";
import type {
  AnalysisResponse,
  SSEEvent,
  DAGState,
  AgentState,
} from "@/types";

const INITIAL_AGENT: AgentState = { status: "pending", subPhases: {} };

const INITIAL_STATE: DAGState = {
  analysisStatus: "pending",
  agents: {
    incumbents: { ...INITIAL_AGENT },
    emerging: { ...INITIAL_AGENT },
    market_sizing: { ...INITIAL_AGENT },
    synthesis: { ...INITIAL_AGENT },
  },
  elapsed: 0,
};

function reduceEvent(prev: DAGState, event: SSEEvent): DAGState {
  if (event.event_type === "agent_status") {
    const agentId = event.agent_id;
    const agent = prev.agents[agentId] || { ...INITIAL_AGENT };
    const updated: AgentState = { ...agent };

    // Update agent-level status if this is a top-level transition
    if (!event.sub_phase) {
      updated.status = event.status;
    }

    // Update sub-phase if present
    if (event.sub_phase && event.sub_phase_status) {
      updated.subPhases = {
        ...agent.subPhases,
        [event.sub_phase]: {
          status: event.sub_phase_status as "pending" | "running" | "completed",
        },
      };
    }

    return {
      ...prev,
      agents: { ...prev.agents, [agentId]: updated },
    };
  }

  if (event.event_type === "analysis_status") {
    return {
      ...prev,
      analysisStatus: event.status as DAGState["analysisStatus"],
      recommendation: event.recommendation,
    };
  }

  return prev;
}

function bootstrapFromResponse(data: AnalysisResponse): DAGState {
  const agents: Record<string, AgentState> = {};
  for (const agentId of Object.keys(INITIAL_STATE.agents)) {
    const status = (data.agent_statuses[agentId] || "pending") as AgentState["status"];
    const subPhases: Record<string, { status: "pending" | "running" | "completed" }> = {};
    const sp = data.agent_sub_phases?.[agentId];
    if (sp) {
      for (const [phase, phaseStatus] of Object.entries(sp)) {
        subPhases[phase] = { status: phaseStatus as "pending" | "running" | "completed" };
      }
    }
    agents[agentId] = { status, subPhases };
  }
  return {
    analysisStatus: data.status as DAGState["analysisStatus"],
    recommendation: data.results?.verdict?.verdict,
    agents,
    elapsed: 0,
  };
}

export function useAnalysis(analysisId: string) {
  const [dagState, setDagState] = useState<DAGState>(INITIAL_STATE);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [shouldStream, setShouldStream] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch initial state
  useEffect(() => {
    getAnalysis(analysisId)
      .then((data) => {
        setAnalysisData(data);
        if (data.status === "running") {
          setDagState(bootstrapFromResponse(data));
          setShouldStream(true);
        } else if (data.status === "complete") {
          const state = bootstrapFromResponse(data);
          state.analysisStatus = "completed";
          setDagState(state);
        }
      })
      .catch(() => {
        setDagState((prev) => ({ ...prev, analysisStatus: "failed" }));
      })
      .finally(() => setLoading(false));
  }, [analysisId]);

  // 2. SSE event handler
  const handleEvent = useCallback(
    (event: SSEEvent) => {
      setDagState((prev) => reduceEvent(prev, event));
      if (
        event.event_type === "analysis_status" &&
        (event.status === "completed" || event.status === "failed")
      ) {
        setShouldStream(false);
        getAnalysis(analysisId).then(setAnalysisData);
      }
    },
    [analysisId]
  );

  useSSE(shouldStream ? analysisId : null, handleEvent);

  // 3. Elapsed timer
  useEffect(() => {
    if (dagState.analysisStatus !== "running") return;
    const interval = setInterval(() => {
      setDagState((prev) => ({ ...prev, elapsed: prev.elapsed + 0.1 }));
    }, 100);
    return () => clearInterval(interval);
  }, [dagState.analysisStatus]);

  return { dagState, analysisData, loading };
}
