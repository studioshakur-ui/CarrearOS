import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

import type { MatchOutput } from "./match-agent";

// ─── Contract ─────────────────────────────────────────────────────────────────

export const tailoredCvSchema = z.object({
  summary: z.string(),
  experience: z.array(z.string()),
  skills: z.array(z.string()),
  keywords: z.array(z.string()),
});

export const actionOutputSchema = z.object({
  should_apply: z.boolean(),
  rationale: z.string(),
  next_steps: z.array(z.string()).max(5),
  message_draft: z.string(),
  cover_note: z.string(),
  cv_improvement_points: z.array(z.string()),
  tailored_cv: tailoredCvSchema,
});

export type TailoredCv = z.infer<typeof tailoredCvSchema>;
export type ActionOutput = z.infer<typeof actionOutputSchema>;

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(
  profile: Record<string, unknown>,
  job: Record<string, unknown>,
  match: MatchOutput,
): string {
  const gaps = match.gaps.length > 0 ? match.gaps.join(", ") : "none identified";
  const strengths = match.strengths.length > 0 ? match.strengths.join(", ") : "none identified";
  const currentSummary = typeof profile.professional_summary === "string" ? profile.professional_summary : "";
  const currentSkills = Array.isArray(profile.detected_skills)
    ? (profile.detected_skills as string[]).join(", ")
    : "not listed";
  const seniority = typeof profile.seniority_estimate === "string" ? profile.seniority_estimate : "unknown";
  const jobDesc = String(job.description ?? "").slice(0, 1_200);
  const jobSkills = Array.isArray(job.required_skills) ? (job.required_skills as string[]).join(", ") : "not listed";

  return `You are a career advisor for the Gulf tech job market.
Based on the match analysis below, produce specific, usable application materials.
Return JSON only — no markdown, no extra text.

CANDIDATE:
- Name: ${profile.first_name ?? ""} ${profile.last_name ?? ""}
- Seniority: ${seniority}
- Current summary: ${currentSummary || "not provided"}
- Skills: ${currentSkills}

JOB: ${job.title} at ${job.company} (${job.location ?? ""})
Required skills: ${jobSkills}
Description excerpt: ${jobDesc}

MATCH ANALYSIS:
- Score: ${match.score}/100
- Recommendation: ${match.recommendation}
- Strengths: ${strengths}
- Gaps: ${gaps}

Return exactly this JSON structure:
{
  "should_apply": <true if score >= 40 AND recommendation is apply or maybe>,
  "rationale": "<1–2 sentences: why apply or why not, specific to this candidate and role>",
  "next_steps": ["<action 1>", "<action 2>", "<action 3>"],
  "message_draft": "<short outreach message, 2–3 sentences, mention role and one key strength, ready to send>",
  "cover_note": "<focused cover paragraph, 3–4 sentences, highlight fit, address one gap, professional tone>",
  "cv_improvement_points": ["<specific CV change 1>", "<specific CV change 2>", "<specific CV change 3>"],
  "tailored_cv": {
    "summary": "<rewritten professional summary tailored to this job, 2–3 sentences, inject job keywords naturally>",
    "experience": ["<achievement bullet 1 reframed for this role>", "<achievement bullet 2>", "<achievement bullet 3>"],
    "skills": ["<skill 1 matching job>", "<skill 2 matching job>", "<skill 3>"],
    "keywords": ["<keyword from job description 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"]
  }
}

Rules:
- Be specific to this candidate and this job — no generic output
- message_draft and cover_note must be ready to use with minimal editing
- next_steps: max 5, actionable within 1 week
- tailored_cv.summary: rewrite (not copy) the candidate's existing summary with keywords from the job
- tailored_cv.experience: 3–5 achievement bullets reframed to highlight relevance to this role
- tailored_cv.skills: top 6–10 skills the candidate has that match or are close to job requirements
- tailored_cv.keywords: 5–8 exact terms from the job posting the CV should contain
- No fake content. No inflated claims. Keep it realistic and honest.`;
}

// ─── Normalizer (safe pre-Zod coercion) ──────────────────────────────────────

function normalizeTailoredCv(raw: unknown): TailoredCv {
  if (typeof raw !== "object" || raw === null) {
    return { summary: "", experience: [], skills: [], keywords: [] };
  }
  const o = raw as Record<string, unknown>;
  return {
    summary: typeof o.summary === "string" ? o.summary : "",
    experience: Array.isArray(o.experience) ? o.experience.map(String) : [],
    skills: Array.isArray(o.skills) ? o.skills.map(String) : [],
    keywords: Array.isArray(o.keywords) ? o.keywords.map(String) : [],
  };
}

function normalize(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) {
    return {
      should_apply: false,
      rationale: "",
      next_steps: [],
      message_draft: "",
      cover_note: "",
      cv_improvement_points: [],
      tailored_cv: { summary: "", experience: [], skills: [], keywords: [] },
    };
  }
  const o = raw as Record<string, unknown>;
  return {
    should_apply: typeof o.should_apply === "boolean" ? o.should_apply : false,
    rationale: typeof o.rationale === "string" ? o.rationale : "",
    next_steps: Array.isArray(o.next_steps) ? o.next_steps.map(String).slice(0, 5) : [],
    message_draft: typeof o.message_draft === "string" ? o.message_draft : "",
    cover_note: typeof o.cover_note === "string" ? o.cover_note : "",
    cv_improvement_points: Array.isArray(o.cv_improvement_points) ? o.cv_improvement_points.map(String) : [],
    tailored_cv: normalizeTailoredCv(o.tailored_cv),
  };
}

// ─── Agent ────────────────────────────────────────────────────────────────────

export const ACTION_MODEL = "claude-sonnet-4-6";
export const ACTION_PROMPT_VERSION = "v2";

export async function runActionAgent(
  profile: Record<string, unknown>,
  job: Record<string, unknown>,
  match: MatchOutput,
  apiKey: string,
): Promise<ActionOutput> {
  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: ACTION_MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: buildPrompt(profile, job, match) }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonText = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed: unknown = JSON.parse(jsonText);

  return actionOutputSchema.parse(normalize(parsed));
}
