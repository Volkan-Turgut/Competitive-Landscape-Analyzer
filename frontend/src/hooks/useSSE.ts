import { useEffect } from "react";
import type { SSEEvent } from "@/types";

export function useSSE(
  analysisId: string | null,
  onEvent: (event: SSEEvent) => void
) {
  useEffect(() => {
    if (!analysisId) return;

    const es = new EventSource(`/api/analyze/${analysisId}/stream`);

    es.addEventListener("status", (e) => {
      const data: SSEEvent = JSON.parse((e as MessageEvent).data);
      onEvent(data);
    });

    es.addEventListener("complete", (e) => {
      const data: SSEEvent = JSON.parse((e as MessageEvent).data);
      onEvent(data);
      es.close();
    });

    es.onerror = () => {
      es.close();
    };

    return () => es.close();
  }, [analysisId, onEvent]);
}
