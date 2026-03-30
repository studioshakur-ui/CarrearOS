"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  /** Auto-trigger analysis on mount. Use when the user just uploaded a CV. */
  autoGenerate?: boolean;
};

export function GenerateAiProfileButton({ autoGenerate = false }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setStatus("loading");
    setError(null);

    const res = await fetch("/api/ai/profile", { method: "POST" });
    const json = await res.json();

    if (!res.ok) {
      setStatus("error");
      setError(json.error ?? "Analysis failed. Please try again.");
      return;
    }

    setStatus("idle");
    router.refresh();
  }

  // Auto-trigger once on mount when instructed (e.g. after first CV upload)
  useEffect(() => {
    if (autoGenerate) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-2">
      <Button onClick={handleGenerate} disabled={status === "loading"} size="sm" variant="outline">
        <Sparkles className="mr-2 h-3.5 w-3.5" />
        {status === "loading" ? "Analysing your profile…" : "Generate AI profile"}
      </Button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
