import { createHash } from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL = "claude-sonnet-4-6";
const PROMPT_VERSION = "v1";

// ─── Types ───────────────────────────────────────────────────────────────────

type AiProfilePayload = {
  professional_summary: string;
  detected_skills: string[];
  detected_languages: string[];
  seniority_estimate: string;
  strengths: string[];
  weaknesses: string[];
  target_roles: string[];
  industry_hints: string[];
  mobility_assessment: string;
  confidence_score: number;
};

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(profile: Record<string, unknown>, cvText: string | null): string {
  const cvSection = cvText
    ? `CV Text:\n${cvText}`
    : "CV Text: not yet parsed — base your analysis solely on the structured profile data below.";

  return `You are a senior career profiling assistant specializing in the Gulf region job market.
Analyze the following candidate and return a structured JSON profile.

Candidate Profile:
- Name: ${profile.first_name ?? ""} ${profile.last_name ?? ""}
- Location: ${profile.city ?? "unknown"}, ${profile.country_code ?? "unknown"}
- Experience Level: ${profile.experience_level ?? "unknown"}
- Languages: ${Array.isArray(profile.languages) ? (profile.languages as string[]).join(", ") : "unknown"}
- Desired Roles: ${Array.isArray(profile.desired_roles) ? (profile.desired_roles as string[]).join(", ") : "unknown"}
- Remote Preference: ${profile.remote_preference ?? "unknown"}
- Mobility: ${profile.mobility ?? "unknown"}

${cvSection}

Return a JSON object with EXACTLY these fields (no extra text, no markdown fences):
{
  "professional_summary": "2-3 sentences summarizing the candidate professionally",
  "detected_skills": ["skill1", "skill2"],
  "detected_languages": ["language1"],
  "seniority_estimate": "intern|junior|mid|senior|lead|unknown",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["area_for_improvement1"],
  "target_roles": ["role1", "role2"],
  "industry_hints": ["industry1"],
  "mobility_assessment": "local_only|national|international|remote_only|unknown",
  "confidence_score": 0.0
}

confidence_score must be between 0.0 and 1.0 (higher when CV text is available, lower when profile-only).`;
}

// ─── Response validator ───────────────────────────────────────────────────────

const EXPERIENCE_LEVELS = new Set(["intern", "junior", "mid", "senior", "lead", "unknown"]);
const MOBILITY_TYPES = new Set(["local_only", "national", "international", "remote_only", "unknown"]);

function validatePayload(raw: unknown): AiProfilePayload {
  if (typeof raw !== "object" || raw === null) throw new Error("Response is not an object");
  const p = raw as Record<string, unknown>;

  const assertStringArray = (key: string): string[] => {
    const v = p[key];
    if (!Array.isArray(v)) throw new Error(`${key} must be an array`);
    return v.map((x) => String(x));
  };

  const seniority = String(p.seniority_estimate ?? "unknown");
  const mobility = String(p.mobility_assessment ?? "unknown");

  if (!EXPERIENCE_LEVELS.has(seniority)) throw new Error(`Invalid seniority_estimate: ${seniority}`);
  if (!MOBILITY_TYPES.has(mobility)) throw new Error(`Invalid mobility_assessment: ${mobility}`);

  const confidence = Number(p.confidence_score ?? 0);
  if (isNaN(confidence) || confidence < 0 || confidence > 1) throw new Error("confidence_score out of range");

  return {
    professional_summary: String(p.professional_summary ?? ""),
    detected_skills: assertStringArray("detected_skills"),
    detected_languages: assertStringArray("detected_languages"),
    seniority_estimate: seniority,
    strengths: assertStringArray("strengths"),
    weaknesses: assertStringArray("weaknesses"),
    target_roles: assertStringArray("target_roles"),
    industry_hints: assertStringArray("industry_hints"),
    mobility_assessment: mobility,
    confidence_score: Math.round(confidence * 1000) / 1000,
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST() {
  // Auth
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Fetch primary CV
  const { data: cv, error: cvError } = await supabase
    .from("cvs")
    .select("id, file_name, raw_text, parsed_text_status")
    .eq("profile_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  if (cvError) {
    return NextResponse.json({ error: cvError.message }, { status: 500 });
  }

  if (!cv) {
    return NextResponse.json(
      { error: "No primary CV found. Upload a CV before generating an AI profile." },
      { status: 422 },
    );
  }

  // Source hash — skip regeneration if inputs haven't changed
  const sourceInput = JSON.stringify({ profile, cvText: cv.raw_text ?? "" });
  const sourceHash = createHash("sha256").update(sourceInput).digest("hex");

  const { data: existing } = await supabase
    .from("ai_profiles")
    .select("id, source_hash")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.source_hash === sourceHash) {
    return NextResponse.json({ cached: true, id: existing.id });
  }

  // Call Claude
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-anthropic-api-key-here") {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const anthropic = new Anthropic({ apiKey });
  const prompt = buildPrompt(profile, cv.raw_text ?? null);

  let rawText: string;
  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });
    rawText = message.content[0].type === "text" ? message.content[0].text : "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Claude API error: ${msg}` }, { status: 502 });
  }

  // Parse + validate JSON
  let payload: AiProfilePayload;
  try {
    const jsonText = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    payload = validatePayload(JSON.parse(jsonText));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Parse error";
    return NextResponse.json({ error: `Failed to parse Claude response: ${msg}` }, { status: 502 });
  }

  // Upsert via admin client (bypasses RLS)
  const admin = createSupabaseAdminClient();
  const { data: aiProfile, error: upsertError } = await admin
    .from("ai_profiles")
    .insert({
      profile_id: user.id,
      cv_id: cv.id,
      ...payload,
      model_name: MODEL,
      prompt_version: PROMPT_VERSION,
      source_hash: sourceHash,
    })
    .select("id")
    .single();

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ id: aiProfile.id, ...payload });
}
