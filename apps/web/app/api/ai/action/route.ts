import { NextResponse } from "next/server";
import { z } from "zod";

import { ACTION_MODEL, ACTION_PROMPT_VERSION, runActionAgent } from "@/lib/agents/action-agent";
import { matchOutputSchema } from "@/lib/agents/match-agent";
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
  const [{ data: aiProfile }, { data: job }, { data: existingMatch }] = await Promise.all([
    supabase
      .from("ai_profiles")
      .select("id, professional_summary, detected_skills, seniority_estimate")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("jobs")
      .select("id, title, company, location, required_skills, description, experience_level")
      .eq("id", jobId)
      .eq("is_active", true)
      .single(),
    supabase
      .from("matches")
      .select("id, score, strengths, gaps, reasons, recommendation")
      .eq("profile_id", user.id)
      .eq("job_id", jobId)
      .maybeSingle(),
  ]);

  if (!aiProfile) {
    return NextResponse.json({ error: "No AI profile found. Generate your profile first." }, { status: 422 });
  }

  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  if (!existingMatch) {
    return NextResponse.json(
      { error: "No match found for this job. Generate a match first." },
      { status: 422 },
    );
  }

  // ── Return cached result only if tailored_cv is already present ────────────
  const { data: existing } = await supabase
    .from("ai_actions")
    .select(
      "id, should_apply, rationale, next_steps, message_draft, cover_note, cv_improvement_points, tailored_cv",
    )
    .eq("profile_id", user.id)
    .eq("job_id", jobId)
    .maybeSingle();

  if (existing?.tailored_cv) return NextResponse.json({ cached: true, ...existing });

  // ── API key ─────────────────────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-anthropic-api-key-here") {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  // ── Parse match into typed output ──────────────────────────────────────────
  const matchParsed = matchOutputSchema.safeParse(existingMatch);
  if (!matchParsed.success) {
    return NextResponse.json({ error: "Stored match data is invalid" }, { status: 500 });
  }

  // ── Fetch profile name for personalisation ─────────────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single();

  const enrichedAiProfile = {
    ...aiProfile,
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
  };

  // ── Run agent ───────────────────────────────────────────────────────────────
  let actionOutput;
  try {
    actionOutput = await runActionAgent(
      enrichedAiProfile as Record<string, unknown>,
      job as Record<string, unknown>,
      matchParsed.data,
      apiKey,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Action agent failed: ${msg}` }, { status: 502 });
  }

  // ── Persist via admin client (bypasses RLS) ─────────────────────────────────
  const admin = createSupabaseAdminClient();
  const { data: saved, error: saveError } = await admin
    .from("ai_actions")
    .upsert(
      {
        profile_id: user.id,
        job_id: jobId,
        match_id: existingMatch.id,
        should_apply: actionOutput.should_apply,
        rationale: actionOutput.rationale,
        next_steps: actionOutput.next_steps,
        message_draft: actionOutput.message_draft,
        cover_note: actionOutput.cover_note,
        cv_improvement_points: actionOutput.cv_improvement_points,
        tailored_cv: actionOutput.tailored_cv,
        model_name: ACTION_MODEL,
        prompt_version: ACTION_PROMPT_VERSION,
      },
      { onConflict: "profile_id,job_id" },
    )
    .select("id")
    .single();

  if (saveError) return NextResponse.json({ error: saveError.message }, { status: 500 });

  return NextResponse.json({ id: saved.id, ...actionOutput });
}
