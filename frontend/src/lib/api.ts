import type { AnalysisResponse, WorkflowManifest } from "@/types";

interface StartAnalysisResponse {
  id: string;
  status: string;
  workflow: WorkflowManifest;
}

export async function postAnalysis(
  company: string,
  market: string
): Promise<StartAnalysisResponse> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company, market }),
  });
  if (!res.ok) throw new Error("Failed to start analysis");
  return res.json();
}

export async function getAnalysis(id: string): Promise<AnalysisResponse> {
  const res = await fetch(`/api/analyze/${id}`);
  if (!res.ok) throw new Error("Analysis not found");
  return res.json();
}
