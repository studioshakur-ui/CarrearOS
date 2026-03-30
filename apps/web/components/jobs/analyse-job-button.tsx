"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  jobId: string;
};

export function AnalyseJobButton({ jobId }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyse() {
    setStatus("loading");
    setError(null);

    try {
      // Step 1: Generate match
      const matchRes = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const matchJson = await matchRes.json();
      if (!matchRes.ok) throw new Error(matchJson.error ?? "Match generation failed");

      // Step 2: Generate action (requires match to exist)
      const actionRes = await fetch("/api/ai/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const actionJson = await actionRes.json();
      if (!actionRes.ok) throw new Error(actionJson.error ?? "Action generation failed");

      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleAnalyse} disabled={status === "loading"} size="sm">
        <Sparkles className="mr-2 h-3.5 w-3.5" />
        {status === "loading" ? "Analysing…" : "Analyse this job"}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
