"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function GenerateAiProfileButton() {
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
      setError(json.error ?? "Unknown error");
      return;
    }

    if (json.cached) {
      setStatus("idle");
      return;
    }

    setStatus("idle");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleGenerate} disabled={status === "loading"} variant="outline" size="sm">
        <Sparkles className="mr-2 h-4 w-4" />
        {status === "loading" ? "Generating…" : "Generate AI profile"}
      </Button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
