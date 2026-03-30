import { NextResponse } from "next/server";
import { z } from "zod";

import { MATCH_MODEL, MATCH_PROMPT_VERSION, runMatchAgent } from "@/lib/agents/match-agent";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const requestSchema = z.object({ jobId: z.string().uuid() });

export async function POST(request: Request) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ── Request body ────────────────────────────────────────────────────────────
  const body: unknown = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  const { jobId } = parsed.data;

  // ── Fetch dependencies ─────────────────────────────────────────────────────
  const [{ data: aiProfile }, { data: job }] = await Promise.all([
    supabase
      .from("ai_profiles")
      .select("id, professional_summary, detected_skills, detected_languages, seniority_estimate")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("jobs")
      .select("id, title, company, location, experience_level, required_skills, description")
      .eq("id", jobId)
      .eq("is_active", true)
      .single(),
  ]);

  if (!aiProfile) {
    return NextResponse.json(
      { error: "No AI profile found. Generate your profile first." },
      { status: 422 },
    );
  }

  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  // ── Return cached result if it already exists ──────────────────────────────
  const { data: existing } = await supabase
    .from("matches")
    .select("id, score, strengths, gaps, reasons, recommendation")
    .eq("profile_id", user.id)
    .eq("job_id", jobId)
    .maybeSingle();

  if (existing) return NextResponse.json({ cached: true, ...existing });

  // ── API key ─────────────────────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-anthropic-api-key-here") {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  // ── Run agent ───────────────────────────────────────────────────────────────
  let matchOutput;
  try {
    matchOutput = await runMatchAgent(
      aiProfile as Record<string, unknown>,
      job as Record<string, unknown>,
      apiKey,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Match agent failed: ${msg}` }, { status: 502 });
  }

  // ── Persist via admin client (bypasses RLS) ─────────────────────────────────
  const admin = createSupabaseAdminClient();
  const { data: saved, error: saveError } = await admin
    .from("matches")
    .upsert(
      {
        profile_id: user.id,
        job_id: jobId,
        ai_profile_id: aiProfile.id,
        score: matchOutput.score,
        strengths: matchOutput.strengths,
        gaps: matchOutput.gaps,
        reasons: matchOutput.reasons,
        recommendation: matchOutput.recommendation,
        model_name: MATCH_MODEL,
        prompt_version: MATCH_PROMPT_VERSION,
      },
      { onConflict: "profile_id,job_id" },
    )
    .select("id")
    .single();

  if (saveError) return NextResponse.json({ error: saveError.message }, { status: 500 });

  return NextResponse.json({ id: saved.id, ...matchOutput });
}
